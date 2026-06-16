import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE_NAME } from "@/lib/server/sessions";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/min-konto", request.url), 303);
  response.cookies.delete(CUSTOMER_COOKIE_NAME);
  return response;
}
