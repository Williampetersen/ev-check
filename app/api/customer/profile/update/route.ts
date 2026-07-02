import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getCustomerDashboardByToken,
  updateCustomerProfile,
} from "@/lib/server/dashboard";
import {
  createSessionToken,
  CUSTOMER_COOKIE_NAME,
  getCookieOptions,
  verifySessionToken,
} from "@/lib/server/sessions";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "").trim();

  if (!token) {
    return NextResponse.redirect(new URL("/min-konto", request.url), 303);
  }

  const redirectTo = (query: string) =>
    NextResponse.redirect(
      new URL(`/kunde/${token}?view=settings${query}`, request.url),
      303,
    );

  const session = verifySessionToken(
    (await cookies()).get(CUSTOMER_COOKIE_NAME)?.value,
    "customer",
  );
  const portal = await getCustomerDashboardByToken(token);
  const expectedToken = portal?.customer.portalToken || portal?.customer.id;
  if (
    !session ||
    !portal ||
    session.sub !== expectedToken ||
    session.email.toLowerCase() !== portal.customer.email.toLowerCase()
  ) {
    return NextResponse.redirect(new URL("/min-konto", request.url), 303);
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const postalCode = String(formData.get("postal_code") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name || !email || !EMAIL_PATTERN.test(email)) {
    return redirectTo("&error=1");
  }

  try {
    await updateCustomerProfile(portal.customer.id, {
      name,
      email,
      phone,
      address,
      postalCode,
      city,
      company,
      notes,
    });

    const response = redirectTo("&saved=1");
    if (email.toLowerCase() !== portal.customer.email.toLowerCase()) {
      response.cookies.set(
        CUSTOMER_COOKIE_NAME,
        createSessionToken("customer", expectedToken as string, email),
        getCookieOptions("customer"),
      );
    }
    return response;
  } catch (error) {
    console.error("Failed to update customer profile", error);
    return redirectTo("&error=1");
  }
}
