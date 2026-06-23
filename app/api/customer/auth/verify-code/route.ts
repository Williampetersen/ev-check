import { NextResponse } from "next/server";
import { verifyCustomerVerificationCode } from "@/lib/server/customer-auth";
import {
  createSessionToken,
  CUSTOMER_COOKIE_NAME,
  getCookieOptions,
} from "@/lib/server/sessions";

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });

async function getPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      portalToken?: unknown;
      code?: unknown;
    };
    return {
      portalToken: String(body.portalToken || "").trim(),
      code: String(body.code || "").trim(),
    };
  }

  const formData = await request.formData();
  return {
    portalToken: String(formData.get("portalToken") || "").trim(),
    code: String(formData.get("code") || "").trim(),
  };
}

export async function POST(request: Request) {
  try {
    const { portalToken, code } = await getPayload(request);
    if (!portalToken || !code) {
      return json({ ok: false, error: "invalid_request" }, 400);
    }

    const result = await verifyCustomerVerificationCode(portalToken, code);
    if (!result.ok) {
      return json({ ok: false, error: result.error });
    }

    const response = json({ ok: true, portalToken: result.portalToken });
    response.cookies.set(
      CUSTOMER_COOKIE_NAME,
      createSessionToken("customer", result.portalToken, result.email),
      getCookieOptions("customer"),
    );
    return response;
  } catch {
    return json({ ok: false, error: "server_error" }, 500);
  }
}
