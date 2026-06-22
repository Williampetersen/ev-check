import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { sendTestEmail, verifyMailConnection } from "@/lib/server/mail";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export async function GET() {
  const session = verifySessionToken((await cookies()).get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await verifyMailConnection());
  } catch (error) {
    return NextResponse.json({
      configured: true,
      connection: "failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  const session = verifySessionToken((await cookies()).get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const dashboard = await getAdminDashboardData();
  const to =
    String(formData.get("to") || "").trim() ||
    dashboard.settings.adminNotifyEmail ||
    process.env.BOOKING_ADMIN_EMAIL ||
    session.email;

  const result = await sendTestEmail(to, dashboard.settings);
  const suffix = result.success ? "saved=email" : "error=email";
  return NextResponse.redirect(new URL(`/admin?view=emails&${suffix}`, request.url), 303);
}
