import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteBookingServiceRecord } from "@/lib/server/booking-system";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = verifySessionToken(cookies().get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    await deleteBookingServiceRecord(params.id);
    return NextResponse.redirect(new URL("/admin?view=services&saved=service", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin?view=services&error=1", request.url), 303);
  }
}
