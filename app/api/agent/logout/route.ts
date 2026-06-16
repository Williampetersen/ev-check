import { NextResponse } from "next/server";
import { AGENT_COOKIE_NAME } from "@/lib/server/sessions";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/agent/login", request.url), 303);
  response.cookies.delete(AGENT_COOKIE_NAME);
  return response;
}
