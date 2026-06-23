import Image from "next/image";
import {
  formatPrice,
  formatShortDate,
  paymentLabels,
  type Appointment,
  type Customer,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { brandLogoPath, contactPhone } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function InvoiceDocument({
  invoiceNumber,
  appointment,
  customer,
  settings,
}: {
  invoiceNumber: string;
  appointment: Appointment;
  customer: Customer;
  settings: DashboardSettings;
}) {
  const addressLines = [
    customer.address,
    [customer.postalCode, customer.city].filter(Boolean).join(" "),
  ].filter(Boolean);
  const paid = appointment.paymentStatus === "paid";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:rounded-none print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-6 bg-[#064E4B] px-8 py-9 sm:px-10">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Image
              src={brandLogoPath}
              alt={settings.companyName || "EV-Check.dk"}
              width={40}
              height={40}
              priority
              className="h-9 w-9 object-contain"
            />
          </span>
          <div>
            <p className="text-xl font-bold text-white">
              {settings.companyName || "EV-Check.dk"}
            </p>
            <p className="mt-1 text-sm text-teal-100">
              {settings.supportEmail || "info@ev-check.dk"}
            </p>
            <p className="text-sm text-teal-100">{contactPhone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F6C65B]">
            Faktura / Kvittering
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{invoiceNumber}</p>
          <p className="mt-1 text-sm text-teal-100">
            {formatShortDate(appointment.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-8 py-8 sm:grid-cols-2 sm:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Faktureret til
          </p>
          <p className="mt-2 font-bold text-slate-950">
            {customer.company || customer.name}
          </p>
          {customer.company ? (
            <p className="text-sm text-slate-600">{customer.name}</p>
          ) : null}
          {addressLines.map((line) => (
            <p key={line} className="text-sm text-slate-600">
              {line}
            </p>
          ))}
          <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
          <p className="text-sm text-slate-600">{customer.phone}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Booking
          </p>
          <p className="mt-2 font-bold text-slate-950">
            {appointment.vehicleLabel || "-"}
          </p>
          <p className="text-sm text-slate-600">
            {appointment.registrationNumber || "-"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {formatShortDate(appointment.appointmentDate)} kl.{" "}
            {appointment.appointmentTime}
          </p>
          <p className="text-sm text-slate-600">
            {appointment.areaName || "Sjælland"}
          </p>
        </div>
      </div>

      <div className="px-8 sm:px-10">
        <table className="w-full border-t border-slate-200 text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-3 font-semibold">Beskrivelse</th>
              <th className="py-3 text-right font-semibold">Pris</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-4">
                <p className="font-semibold text-slate-950">
                  {appointment.serviceLabel}
                </p>
                <p className="text-xs text-slate-500">
                  Mobil batteritest af elbil
                </p>
              </td>
              <td className="py-4 text-right font-semibold text-slate-950">
                {formatPrice(appointment.total)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end py-6">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(appointment.total)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-950">
              <span>Total</span>
              <span className="text-[#064E4B]">
                {formatPrice(appointment.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-8 py-5 sm:px-10">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
            paid
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800",
          )}
        >
          {paymentLabels[appointment.paymentStatus]}
        </span>
        <p className="text-xs text-slate-500">
          Tak for din booking hos {settings.companyName || "EV-Check.dk"}.
        </p>
      </div>
    </div>
  );
}
