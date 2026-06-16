import { notFound } from "next/navigation";
import { BatteryCharging, CalendarDays, FileText, LogOut } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { formatPrice, formatShortDate } from "@/lib/ev-domain";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";

export const metadata = {
  title: "Customer portal - EV Check",
  robots: { index: false, follow: false },
};

export default async function CustomerTokenPage({ params }: { params: { token: string } }) {
  const portal = await getCustomerDashboardByToken(params.token);
  if (!portal) notFound();

  const upcoming = portal.appointments.filter((item) => item.status !== "cancelled");

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/40">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">EV Check portal</p>
              <h1 className="mt-3 text-3xl font-bold">Welcome, {portal.customer.name}</h1>
              <p className="mt-2 max-w-2xl text-slate-300">
                Follow your appointments, statuses, invoices, and reports in one place.
              </p>
            </div>
            <form action="/api/customer/auth/logout" method="POST">
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <Metric icon={CalendarDays} label="Appointments" value={String(portal.appointments.length)} />
          <Metric icon={BatteryCharging} label="Active checks" value={String(upcoming.length)} />
          <Metric icon={FileText} label="Reports" value={String(portal.appointments.filter((item) => item.reportLabel).length)} />
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm shadow-slate-200/70 backdrop-blur">
          <h2 className="text-lg font-bold text-slate-950">Your EV checks</h2>
          <div className="mt-4 grid gap-3">
            {portal.appointments.length > 0 ? (
              portal.appointments.map((appointment) => (
                <article key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{appointment.serviceLabel}</p>
                      <p className="mt-1 text-sm text-slate-500">{appointment.vehicleLabel} - {appointment.registrationNumber}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={appointment.status} />
                      <PaymentBadge status={appointment.paymentStatus} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                    <Info label="Date" value={`${formatShortDate(appointment.appointmentDate)} ${appointment.appointmentTime}`} />
                    <Info label="Assigned user" value={appointment.assignedUser} />
                    <Info label="Report" value={appointment.reportLabel || "Pending"} />
                    <Info label="Total" value={formatPrice(appointment.total)} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                No appointments yet.
              </div>
            )}
          </div>
        </section>

        <ButtonLink href="/" variant="outline">Back to EV Check</ButtonLink>
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
    <section className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm shadow-slate-200/70">
      <Icon className="h-5 w-5 text-teal-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}
