import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { sendCustomerAppointmentEmail } from "@/lib/server/mail";
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
    const dashboard = await getAdminDashboardData();
    const appointment = dashboard.appointments.find((item) => item.id === id);
    const customer = appointment
      ? dashboard.customers.find((item) => item.id === appointment.customerId)
      : null;
    if (!appointment || !customer) throw new Error("Booking not found.");

    await sendCustomerAppointmentEmail({
      appointment,
      customer,
      settings: dashboard.settings,
      portalUrl: `${process.env.APP_URL || "https://evcheck.dk"}/kunde/${
        customer.portalToken || customer.id
      }`,
    });

    return NextResponse.redirect(new URL("/admin?view=emails&saved=resent", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin?view=emails&error=1", request.url), 303);
  }
}
