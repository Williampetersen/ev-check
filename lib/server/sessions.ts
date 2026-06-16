import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "ev_check_admin_session";
export const CUSTOMER_COOKIE_NAME = "ev_check_customer_session";
export const AGENT_COOKIE_NAME = "ev_check_agent_session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const CUSTOMER_SESSION_DURATION_MS = 1000 * 60 * 60 * 24;

type SessionPayload = {
  sub: string;
  email: string;
  role: "admin" | "customer" | "agent";
  exp: number;
};

const encode = (value: string) => Buffer.from(value, "utf-8").toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf-8");

const getSecret = (role: SessionPayload["role"]) => {
  if (role === "customer") {
    return process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "";
  }
  if (role === "agent") {
    return process.env.AGENT_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "";
  }
  return process.env.ADMIN_SESSION_SECRET || "";
};

const sign = (payload: string, role: SessionPayload["role"]) =>
  createHmac("sha256", getSecret(role)).update(payload).digest("base64url");

export const isAdminConfigured = () =>
  Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);

export const validateAdminCredentials = (email: string, password: string) =>
  email.trim().toLowerCase() === String(process.env.ADMIN_EMAIL || "").trim().toLowerCase() &&
  password === process.env.ADMIN_PASSWORD;

export function createSessionToken(
  role: SessionPayload["role"],
  sub: string,
  email: string,
  durationMs = role === "customer" ? CUSTOMER_SESSION_DURATION_MS : SESSION_DURATION_MS,
) {
  const payload = encode(JSON.stringify({ sub, email, role, exp: Date.now() + durationMs }));
  return `${payload}.${sign(payload, role)}`;
}

export function verifySessionToken(token: string | undefined | null, role: SessionPayload["role"]) {
  if (!token || !getSecret(role)) return null;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex < 1) return null;

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = sign(payload, role);

  try {
    if (
      expected.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const data = JSON.parse(decode(payload)) as SessionPayload;
    if (data.role !== role || !data.sub || !data.email || !data.exp || data.exp < Date.now()) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export const getCookieOptions = (role: SessionPayload["role"]) => ({
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.COOKIE_SECURE === "true" || process.env.VERCEL_ENV === "production",
  maxAge: (role === "customer" ? CUSTOMER_SESSION_DURATION_MS : SESSION_DURATION_MS) / 1000,
});
