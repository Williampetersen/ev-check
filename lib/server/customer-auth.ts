import { createHash, randomBytes } from "crypto";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";

export const CODE_EXPIRY_MINUTES = 10;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 60;

const id = (prefix: string) => `${prefix}_${randomBytes(10).toString("hex")}`;

const generateCode = () => {
  const buffer = randomBytes(3);
  const number = buffer.readUIntBE(0, 3) % 900000;
  return String(100000 + number);
};

const hashCode = (code: string) =>
  createHash("sha256").update(code).digest("hex");

export const maskEmail = (email: string) => {
  const atIndex = email.indexOf("@");
  if (atIndex < 1) return "***@***";

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
};

export type GenerateCustomerCodeResult =
  | {
      ok: true;
      code: string;
      customerId: string;
      email: string;
      maskedEmail: string;
      portalToken: string;
    }
  | {
      ok: false;
      error: "not_found" | "cooldown" | "database_unavailable";
      waitSeconds?: number;
      maskedEmail?: string;
      portalToken?: string;
    };

export async function generateCustomerVerificationCode(
  email: string,
): Promise<GenerateCustomerCodeResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "database_unavailable" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false, error: "not_found" };
  }

  try {
    await ensureSchema({ force: true });
    const sql = getSql();

    const [customer] = await sql<
      Array<{ id: string; email: string; portal_token: string }>
    >`
      SELECT id, email, COALESCE(NULLIF(portal_token, ''), id) AS portal_token
      FROM customers
      WHERE LOWER(email) = ${normalizedEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!customer) return { ok: false, error: "not_found" };

    const portalToken = customer.portal_token || customer.id;
    const cooldownSince = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);
    const [recent] = await sql<Array<{ created_at: string }>>`
      SELECT created_at
      FROM customer_email_verifications
      WHERE portal_token = ${portalToken}
        AND created_at > ${cooldownSince}
        AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (recent) {
      const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
      const waitSeconds = Math.max(
        1,
        Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - elapsedMs) / 1000),
      );
      return {
        ok: false,
        error: "cooldown",
        waitSeconds,
        maskedEmail: maskEmail(customer.email),
        portalToken,
      };
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await sql`
      INSERT INTO customer_email_verifications (
        id, email, portal_token, code_hash, expires_at
      )
      VALUES (
        ${id("cev")}, ${customer.email}, ${portalToken}, ${hashCode(code)}, ${expiresAt}
      )
    `;

    return {
      ok: true,
      code,
      customerId: customer.id,
      email: customer.email,
      maskedEmail: maskEmail(customer.email),
      portalToken,
    };
  } catch {
    return { ok: false, error: "not_found" };
  }
}

export type VerifyCustomerCodeResult =
  | { ok: true; customerId: string; email: string; portalToken: string }
  | { ok: false; error: "invalid" | "expired" | "max_attempts" };

export async function verifyCustomerVerificationCode(
  portalToken: string,
  submittedCode: string,
): Promise<VerifyCustomerCodeResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "invalid" };

  const token = portalToken.trim();
  const code = submittedCode.trim();
  if (!token || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "invalid" };
  }

  try {
    await ensureSchema({ force: true });
    const sql = getSql();

    const [record] = await sql<
      Array<{
        id: string;
        email: string;
        code_hash: string;
        expires_at: string;
        attempts: number;
      }>
    >`
      SELECT id, email, code_hash, expires_at, attempts
      FROM customer_email_verifications
      WHERE portal_token = ${token}
        AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!record) return { ok: false, error: "invalid" };
    if (new Date(record.expires_at) < new Date()) {
      return { ok: false, error: "expired" };
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      return { ok: false, error: "max_attempts" };
    }

    if (hashCode(code) !== record.code_hash) {
      await sql`
        UPDATE customer_email_verifications
        SET attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = ${record.id}
      `;

      if (record.attempts + 1 >= MAX_ATTEMPTS) {
        return { ok: false, error: "max_attempts" };
      }
      return { ok: false, error: "invalid" };
    }

    const [customer] = await sql<Array<{ id: string; portal_token: string }>>`
      SELECT id, COALESCE(NULLIF(portal_token, ''), id) AS portal_token
      FROM customers
      WHERE (portal_token = ${token} OR id = ${token})
        AND LOWER(email) = LOWER(${record.email})
      LIMIT 1
    `;

    if (!customer) return { ok: false, error: "invalid" };

    await sql`
      UPDATE customer_email_verifications
      SET used_at = NOW()
      WHERE id = ${record.id}
    `;

    return {
      ok: true,
      customerId: customer.id,
      email: record.email,
      portalToken: customer.portal_token || customer.id,
    };
  } catch {
    return { ok: false, error: "invalid" };
  }
}
