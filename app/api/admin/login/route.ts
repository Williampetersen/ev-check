import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getCookieOptions,
  isAdminConfigured,
  validateAdminCredentials,
} from "@/lib/server/sessions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!isAdminConfigured() || !validateAdminCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createSessionToken("admin", email, email),
    getCookieOptions("admin"),
  );
  return response;
}
