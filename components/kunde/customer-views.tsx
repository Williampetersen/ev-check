"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Lock,
  Receipt,
  Save,
  Settings2,
} from "lucide-react";
import {
  PaymentBadge,
  ReportPaymentBadge,
  StatusBadge,
} from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EmptyState,
  Field,
  Info,
  Panel,
} from "@/components/kunde/customer-ui";
import {
  formatPrice,
  formatShortDate,
  invoiceLabels,
  type Appointment,
  type Customer,
  type CustomerReport,
} from "@/lib/ev-domain";
import { contactEmail, contactPhone } from "@/lib/seo";

export function AppointmentsPanel({
  token,
  appointments,
}: {
  token: string;
  appointments: Appointment[];
}) {
  return (
    <Panel
      title="Appointments"
      description="All your EV Check bookings and their current status."
      icon={CalendarDays}
    >
      <div className="grid gap-3">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="glass-card rounded-lg p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">
                    {appointment.serviceLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.vehicleLabel} -{" "}
                    {appointment.registrationNumber}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={appointment.status} />
                  <PaymentBadge status={appointment.paymentStatus} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-4 sm:gap-3">
                <Info
                  label="Date"
                  value={`${formatShortDate(appointment.appointmentDate)} ${
                    appointment.appointmentTime
                  }`}
                />
                <Info
                  label="Assigned user"
                  value={appointment.assignedUser}
                />
                <Info
                  label="Report"
                  value={appointment.reportLabel || "Pending"}
                />
                <Info label="Total" value={formatPrice(appointment.total)} />
              </div>
              <Link
                href={`/kunde/${token}/faktura/${appointment.id}`}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-50 px-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
              >
                <Receipt className="h-4 w-4" />
                View invoice
              </Link>
            </article>
          ))
        ) : (
          <EmptyState text="No appointments yet." />
        )}
      </div>
    </Panel>
  );
}

export function InvoicesPanel({
  token,
  appointments,
}: {
  token: string;
  appointments: Appointment[];
}) {
  return (
    <Panel
      title="Invoices"
      description="Booking date, amount and price details for every invoice. View or print/download each one."
      icon={FileText}
    >
      <div className="grid gap-3">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="glass-card rounded-lg p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">
                    {appointment.invoiceNumber || `Booking ${appointment.id}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.serviceLabel} · {appointment.vehicleLabel}
                  </p>
                </div>
                <PaymentBadge status={appointment.paymentStatus} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-4 sm:gap-3">
                <Info
                  label="Date"
                  value={`${formatShortDate(appointment.appointmentDate)} ${
                    appointment.appointmentTime
                  }`}
                />
                <Info
                  label="Registration"
                  value={appointment.registrationNumber}
                />
                <Info label="Amount" value={formatPrice(appointment.total)} />
                <Info
                  label="Invoice status"
                  value={invoiceLabels[appointment.invoiceStatus]}
                />
              </div>
              <Link
                href={`/kunde/${token}/faktura/${appointment.id}`}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-50 px-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
              >
                <Receipt className="h-4 w-4" />
                View / print invoice
              </Link>
            </article>
          ))
        ) : (
          <EmptyState text="No invoices yet." />
        )}
      </div>
    </Panel>
  );
}

export function ReportsPanel({
  token,
  reports,
}: {
  token: string;
  reports: CustomerReport[];
}) {
  return (
    <Panel
      title="Reports"
      description="Your battery test reports. Paid reports can be viewed and downloaded."
      icon={ClipboardList}
    >
      <div className="grid gap-3">
        {reports.length > 0 ? (
          reports.map((report) =>
            report.paymentStatus === "unpaid" ? (
              <article
                key={report.id}
                className="glass-card rounded-lg border border-rose-200/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">
                      {report.title || report.fileName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Uploaded {formatShortDate(report.createdAt)}
                    </p>
                  </div>
                  <ReportPaymentBadge status={report.paymentStatus} />
                </div>
                <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-rose-200/70 bg-rose-50/70 px-3 py-3 text-sm text-rose-800">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Your PDF is ready, but payment has not been received.
                    Please pay the invoice to see and download your PDF. For
                    more details, please contact EV-Check at{" "}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-semibold underline underline-offset-2"
                    >
                      {contactEmail}
                    </a>{" "}
                    or call{" "}
                    <a
                      href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                      className="font-semibold underline underline-offset-2"
                    >
                      {contactPhone}
                    </a>
                    .
                  </p>
                </div>
              </article>
            ) : (
              <article
                key={report.id}
                className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-lg p-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-950">
                    {report.title || report.fileName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded {formatShortDate(report.createdAt)}
                  </p>
                </div>
                <a
                  href={`/api/customer/reports/${report.id}?token=${encodeURIComponent(token)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-50 px-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </a>
              </article>
            ),
          )
        ) : (
          <EmptyState text="No reports yet." />
        )}
      </div>
    </Panel>
  );
}

export function SettingsPanel({
  token,
  customer,
}: {
  token: string;
  customer: Customer;
}) {
  return (
    <Panel
      title="Settings"
      description="Update your contact details. Changing your email also updates your login."
      icon={Settings2}
    >
      <form
        action="/api/customer/profile/update"
        method="POST"
        className="grid gap-3"
      >
        <input type="hidden" name="token" value={token} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name">
            <Input name="name" defaultValue={customer.name} required />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              type="email"
              defaultValue={customer.email}
              required
            />
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={customer.phone} />
          </Field>
          <Field label="Company (optional)">
            <Input name="company" defaultValue={customer.company} />
          </Field>
        </div>
        <Field label="Address">
          <Input name="address" defaultValue={customer.address} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Postal code">
            <Input name="postal_code" defaultValue={customer.postalCode} />
          </Field>
          <Field label="City">
            <Input name="city" defaultValue={customer.city} />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <Textarea
            name="notes"
            defaultValue={customer.notes}
            placeholder="Anything we should know about your vehicle or bookings"
          />
        </Field>
        <Button type="submit" className="w-full sm:w-fit">
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </form>
    </Panel>
  );
}
