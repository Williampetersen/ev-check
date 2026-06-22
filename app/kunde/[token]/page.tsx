import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BatteryCharging,
  CalendarDays,
  Download,
  FileText,
  LogOut,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { formatPrice, formatShortDate } from "@/lib/ev-domain";
import { brandLogoPath } from "@/lib/seo";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";

export const metadata = {
  title: "Customer portal - EV Check",
  robots: { index: false, follow: false },
};

export default async function CustomerTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const portal = await getCustomerDashboardByToken(token);
  if (!portal) notFound();

  const upcoming = portal.appointments.filter(
    (item) => item.status !== "cancelled",
  );

  return (
    <main className="min-h-screen bg-transparent px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="glass-dark rounded-lg p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <Image
                src={brandLogoPath}
                alt="EV-Check.dk logo"
                width={52}
                height={52}
                className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain shadow-sm shadow-black/10"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
                  EV Check portal
                </p>
                <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                  Welcome, {portal.customer.name}
                </h1>
                <p className="mt-2 max-w-2xl text-slate-300">
                  Follow your appointments, statuses, invoices, and reports in
                  one place.
                </p>
              </div>
            </div>
            <form action="/api/customer/auth/logout" method="POST">
              <button className="border-white/15 inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold text-white hover:bg-white/10 sm:h-10">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <Metric
            icon={CalendarDays}
            label="Appointments"
            value={String(portal.appointments.length)}
          />
          <Metric
            icon={BatteryCharging}
            label="Active checks"
            value={String(upcoming.length)}
          />
          <Metric
            icon={FileText}
            label="Reports"
            value={String(
              portal.appointments.filter((item) => item.reportLabel).length,
            )}
          />
        </section>

        <section className="glass-shell rounded-lg p-4">
          <h2 className="text-lg font-bold text-slate-950">Your EV checks</h2>
          <div className="mt-4 grid gap-3">
            {portal.appointments.length > 0 ? (
              portal.appointments.map((appointment) => (
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
                    <Info
                      label="Total"
                      value={formatPrice(appointment.total)}
                    />
                  </div>
                  {appointment.invoiceNumber ? (
                    <a
                      href={`/api/customer/invoices/${appointment.id}?token=${token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-teal-700/30 bg-teal-50 px-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
                    >
                      <Download className="h-4 w-4" />
                      Download invoice
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="bg-white/45 rounded-lg border border-dashed border-white/70 px-4 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur">
                No appointments yet.
              </div>
            )}
          </div>
        </section>

        <ButtonLink href="/" variant="outline">
          Back to EV Check
        </ButtonLink>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <section className="glass-card rounded-lg p-4">
      <Icon className="h-5 w-5 text-teal-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}
