import { NextRequest, NextResponse } from "next/server";
import {
  createSiteAccessToken,
  getSafeNextPath,
  SITE_ACCESS_COOKIE,
  SITE_ACCESS_MAX_AGE_SECONDS,
} from "@/lib/site-access";

const accessUsername = process.env.SITE_ACCESS_USERNAME ?? "didi";
const accessPassword = process.env.SITE_ACCESS_PASSWORD ?? "didi";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (username !== accessUsername || password !== accessPassword) {
    const url = new URL("/coming-soon", request.url);

    url.searchParams.set("error", "1");
    url.searchParams.set("next", nextPath);

    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303,
  });

  response.cookies.set({
    name: SITE_ACCESS_COOKIE,
    value: await createSiteAccessToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_ACCESS_MAX_AGE_SECONDS,
  });

  return response;
}
