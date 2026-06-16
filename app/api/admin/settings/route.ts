import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveDashboardSettings } from "@/lib/server/dashboard";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export async function POST(request: Request) {
  const session = verifySessionToken(cookies().get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    await saveDashboardSettings(await request.formData());
    return NextResponse.redirect(new URL("/admin?view=settings&saved=settings", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin?view=settings&error=1", request.url), 303);
  }
}
