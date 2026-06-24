import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createUnavailablePeriodRecord } from "@/lib/server/booking-system";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export async function POST(request: Request) {
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    const formData = await request.formData();
    await createUnavailablePeriodRecord({
      title: String(formData.get("title") || ""),
      startDate: String(formData.get("start_date") || ""),
      endDate: String(formData.get("end_date") || ""),
      startTime: String(formData.get("start_time") || "00:00"),
      endTime: String(formData.get("end_time") || "23:59"),
      isFullDay: Boolean(formData.get("is_full_day")),
    });

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
