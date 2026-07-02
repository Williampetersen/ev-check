import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  normalizeReportPaymentStatus,
  updateReportPaymentStatus,
} from "@/lib/server/reports";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const runtime = "nodejs";

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

  const { id } = await params;
  const formData = await request.formData();
  const paymentStatus = normalizeReportPaymentStatus(
    formData.get("payment_status"),
  );

  try {
    await updateReportPaymentStatus(id, paymentStatus);
    return NextResponse.redirect(
      new URL("/admin?view=reports&saved=report", request.url),
      303,
    );
  } catch (error) {
    console.error("Failed to update report payment status", error);
    return NextResponse.redirect(
      new URL("/admin?view=reports&error=1", request.url),
      303,
    );
  }
}
