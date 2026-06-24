import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteUnavailablePeriodRecord } from "@/lib/server/booking-system";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    const { id } = await params;
    await deleteUnavailablePeriodRecord(id);
    return NextResponse.redirect(
      new URL("/admin?view=settings&saved=closed", request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL("/admin?view=settings&error=1", request.url),
      303,
    );
  }
}
