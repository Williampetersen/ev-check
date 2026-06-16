import { NextResponse } from "next/server";
import { getCustomerDashboardByEmail } from "@/lib/server/dashboard";
import { createSessionToken, CUSTOMER_COOKIE_NAME, getCookieOptions } from "@/lib/server/sessions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const portal = await getCustomerDashboardByEmail(email);

  if (!portal) {
    return NextResponse.redirect(new URL("/min-konto?error=1", request.url), 303);
  }

  const token = portal.customer.portalToken || portal.customer.id;
  const response = NextResponse.redirect(new URL(`/kunde/${encodeURIComponent(token)}`, request.url), 303);
  response.cookies.set(
    CUSTOMER_COOKIE_NAME,
    createSessionToken("customer", token, portal.customer.email),
    getCookieOptions("customer"),
  );
  return response;
}
