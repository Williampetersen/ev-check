import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateAppointmentStatus } from "@/lib/server/dashboard";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";
import type { AppointmentStatus } from "@/lib/ev-domain";

const validStatuses = ["pending", "approved", "completed", "cancelled"];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = verifySessionToken(cookies().get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const status = String(formData.get("status") || "pending");
  const notes = String(formData.get("admin_notes") || "");
  const returnView = String(formData.get("return_view") || "appointments");

  if (!validStatuses.includes(status)) {
    return NextResponse.redirect(new URL(`/admin?view=${returnView}&error=1`, request.url), 303);
  }

  try {
    await updateAppointmentStatus(params.id, status as AppointmentStatus, notes);
    return NextResponse.redirect(new URL(`/admin?view=${returnView}&saved=appointment`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`/admin?view=${returnView}&error=1`, request.url), 303);
  }
}
