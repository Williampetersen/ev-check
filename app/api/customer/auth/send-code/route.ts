import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { generateCustomerVerificationCode } from "@/lib/server/customer-auth";
import { sendCustomerVerificationCodeEmail } from "@/lib/server/mail";

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });

async function getEmail(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: unknown };
    return String(body.email || "")
      .trim()
      .toLowerCase();
  }

  const formData = await request.formData();
  return String(formData.get("email") || "")
    .trim()
    .toLowerCase();
}

export async function POST(request: Request) {
  try {
    const email = await getEmail(request);
    if (!email || !email.includes("@")) {
      return json({ ok: false, error: "invalid_email" }, 400);
    }

    const result = await generateCustomerVerificationCode(email);
    if (!result.ok) {
      if (result.error === "cooldown") {
        return json({
          ok: false,
          error: "cooldown",
          waitSeconds: result.waitSeconds,
          maskedEmail: result.maskedEmail,
          portalToken: result.portalToken,
        });
      }

      return json(
        {
          ok: false,
          error:
            result.error === "database_unavailable"
              ? "server_error"
              : "not_found",
        },
        result.error === "database_unavailable" ? 500 : 404,
      );
    }

    const dashboard = await getAdminDashboardData();
    await sendCustomerVerificationCodeEmail({
      customerEmail: result.email,
      code: result.code,
      settings: dashboard.settings,
    });

    return json({
      ok: true,
      portalToken: result.portalToken,
      maskedEmail: result.maskedEmail,
    });
  } catch {
    return json({ ok: false, error: "email_failed" }, 500);
  }
}
