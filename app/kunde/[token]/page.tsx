import Image from "next/image";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  BatteryCharging,
  CalendarDays,
  FileText,
  LogOut,
  Receipt,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { formatPrice, formatShortDate } from "@/lib/ev-domain";
import { brandLogoPath } from "@/lib/seo";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";

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

  const session = verifySessionToken(
    (await cookies()).get(CUSTOMER_COOKIE_NAME)?.value,
    "customer",
  );
  const expectedToken = portal.customer.portalToken || portal.customer.id;
  if (
    !session ||
    session.sub !== expectedToken ||
    session.email.toLowerCase() !== portal.customer.email.toLowerCase()
  ) {
    redirect("/min-konto");
  }

  const upcoming = portal.appointments.filter(
    (item) => item.status !== "cancelled",
  );

  return (
    <main className="min-h-screen bg-transparent px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-lg border border-sky-200/80 bg-white/72 p-5 text-slate-950 shadow-[0_18px_55px_rgba(14,116,184,0.12),inset_0_1px_0_rgba(255,255,255,0.90)] backdrop-blur-2xl sm:p-6">
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
                <p className="text-sm font-semibold tracking-[0.18em] text-slate-950 uppercase">
                  EV Check portal
                </p>
                <h1 className="mt-3 text-2xl leading-tight font-bold text-slate-950 sm:text-3xl">
                  Welcome, {portal.customer.name}
                </h1>
                <p className="mt-2 max-w-2xl text-slate-950">
                  Follow your appointments, statuses, invoices, and reports in
                  one place.
                </p>
              </div>
            </div>
            <form action="/api/customer/auth/logout" method="POST">
              <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-500/90 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-700/20 transition hover:bg-sky-600 sm:h-10">
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
            value={String(portal.reports.length)}
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
                  <a
                    href={`/kunde/${token}/faktura/${appointment.id}`}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-50 px-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                  >
                    <Receipt className="h-4 w-4" />
                    Print invoice
                  </a>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/70 bg-white/45 px-4 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur">
                No appointments yet.
              </div>
            )}
          </div>
        </section>

        <section className="glass-shell rounded-lg p-4">
          <h2 className="text-lg font-bold text-slate-950">Your reports</h2>
          <div className="mt-4 grid gap-3">
            {portal.reports.length > 0 ? (
              portal.reports.map((report) => (
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
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/70 bg-white/45 px-4 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur">
                No reports yet.
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
      <Icon className="h-5 w-5 text-sky-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 backdrop-blur">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}
