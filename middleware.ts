import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasValidSiteAccess, SITE_ACCESS_COOKIE } from "@/lib/site-access";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const hasAccess = await hasValidSiteAccess(
    request.cookies.get(SITE_ACCESS_COOKIE)?.value,
  );

  if (hasAccess) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  url.pathname = "/coming-soon";
  url.searchParams.set("next", "/");

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
