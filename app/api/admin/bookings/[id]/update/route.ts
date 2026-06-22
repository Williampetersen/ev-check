import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type {
  AppointmentStatus,
  InvoiceStatus,
  PaymentStatus,
} from "@/lib/ev-domain";
import { updateAppointmentDetails } from "@/lib/server/dashboard";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

const validStatuses = ["pending", "approved", "completed", "cancelled"];
const validPaymentStatuses = ["unpaid", "pending", "paid", "refunded"];
const validInvoiceStatuses = ["not_requested", "ready", "sent", "paid"];

const text = (formData: FormData, key: string) =>
  String(formData.get(key) || "").trim();

const safeReturnTo = (value: string) =>
  /^\/admin\?[a-zA-Z0-9=&%_-]*$/.test(value) ? value : "/admin?view=appointments";

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
  const returnTo = safeReturnTo(text(formData, "return_to"));

  const status = text(formData, "status");
  const paymentStatus = text(formData, "payment_status");
  const invoiceStatus = text(formData, "invoice_status");
  const appointmentDate = text(formData, "appointment_date");
  const appointmentTime = text(formData, "appointment_time");

  if (
    !validStatuses.includes(status) ||
    !validPaymentStatuses.includes(paymentStatus) ||
    !validInvoiceStatuses.includes(invoiceStatus) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
    !/^\d{2}:\d{2}$/.test(appointmentTime)
  ) {
    const separator = returnTo.includes("?") ? "&" : "?";
    return NextResponse.redirect(
      new URL(`${returnTo}${separator}error=1`, request.url),
      303,
    );
  }

  try {
    await updateAppointmentDetails(id, {
      status: status as AppointmentStatus,
      paymentStatus: paymentStatus as PaymentStatus,
      invoiceStatus: invoiceStatus as InvoiceStatus,
      appointmentDate,
      appointmentTime,
      appointmentEndTime: text(formData, "appointment_end_time"),
      serviceLabel: text(formData, "service_label"),
      vehicleLabel: text(formData, "vehicle_label"),
      registrationNumber: text(formData, "registration_number").toUpperCase(),
      total: Number(formData.get("total")) || 0,
      assignedUser: text(formData, "assigned_user") || "Unassigned",
      areaName: text(formData, "area_name"),
      adminNotes: String(formData.get("admin_notes") || ""),
      customer: {
        name: text(formData, "customer_name"),
        email: text(formData, "customer_email").toLowerCase(),
        phone: text(formData, "customer_phone"),
        address: text(formData, "customer_address"),
        postalCode: text(formData, "customer_postal_code"),
        city: text(formData, "customer_city"),
        company: text(formData, "customer_company"),
        notes: String(formData.get("customer_notes") || ""),
      },
    });
    const separator = returnTo.includes("?") ? "&" : "?";
    return NextResponse.redirect(
      new URL(`${returnTo}${separator}saved=booking`, request.url),
      303,
    );
  } catch {
    const separator = returnTo.includes("?") ? "&" : "?";
    return NextResponse.redirect(
      new URL(`${returnTo}${separator}error=1`, request.url),
      303,
    );
  }
}
