import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { AGENT_COOKIE_NAME, createSessionToken, getCookieOptions } from "@/lib/server/sessions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const dashboard = await getAdminDashboardData();
  const user = dashboard.users.find((item) => item.email.toLowerCase() === email && item.status === "active");
  const expectedPassword = process.env.AGENT_PASSWORD || process.env.ADMIN_PASSWORD || "demo";

  if (!user || password !== expectedPassword) {
    return NextResponse.redirect(new URL("/agent/login?error=1", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/agent", request.url), 303);
  response.cookies.set(
    AGENT_COOKIE_NAME,
    createSessionToken("agent", user.id, user.email),
    getCookieOptions("agent"),
  );
  return response;
}
