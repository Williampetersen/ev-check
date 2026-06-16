export const SITE_ACCESS_COOKIE = "evcheck_site_access";
export const SITE_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();
const secret = process.env.SITE_ACCESS_SECRET ?? "evcheck-coming-soon-access";

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSiteAccessToken() {
  const payload = Date.now().toString();
  return `${payload}.${await sign(payload)}`;
}

export async function hasValidSiteAccess(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const issuedAt = Number(payload);
  const isExpired =
    Number.isNaN(issuedAt) ||
    Date.now() - issuedAt > SITE_ACCESS_MAX_AGE_SECONDS * 1000;

  if (isExpired) {
    return false;
  }

  return signature === (await sign(payload));
}

export function getSafeNextPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}
