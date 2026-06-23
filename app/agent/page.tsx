import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, LogOut, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatShortDate } from "@/lib/ev-domain";
import { brandLogoPath } from "@/lib/seo";
import { getUserDashboard } from "@/lib/server/dashboard";
import { AGENT_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const metadata = {
  title: "User dashboard - EV Check",
  robots: { index: false, follow: false },
};

export default async function AgentDashboardPage() {
  const session = verifySessionToken(
    (await cookies()).get(AGENT_COOKIE_NAME)?.value,
    "agent",
  );
  if (!session) redirect("/agent/login");

  const dashboard = await getUserDashboard(session.email);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-3xl bg-slate-950 p-6 text-white">
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
                <p className="text-sm font-semibold tracking-[0.18em] text-sky-300 uppercase">
                  Service user
                </p>
                <h1 className="mt-3 text-3xl font-bold">
                  {dashboard.user?.fullName || session.email}
                </h1>
                <p className="mt-2 text-slate-300">
                  {dashboard.user?.workingArea || "EV Check"}
                </p>
              </div>
            </div>
            <form action="/api/agent/logout" method="POST">
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Metric
            icon={CalendarDays}
            label="Assigned"
            value={String(dashboard.appointments.length)}
          />
          <Metric
            icon={CheckCircle2}
            label="Completed"
            value={String(
              dashboard.appointments.filter(
                (item) => item.status === "completed",
              ).length,
            )}
          />
          <Metric
            icon={MapPin}
            label="Area"
            value={dashboard.user?.workingArea || "-"}
          />
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm shadow-slate-200/70">
          <h2 className="text-lg font-bold text-slate-950">Assigned checks</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.appointments.length > 0 ? (
              dashboard.appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">
                        {appointment.customerName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {appointment.vehicleLabel} - {appointment.serviceLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatShortDate(appointment.appointmentDate)} at{" "}
                        {appointment.appointmentTime}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                No assigned checks yet.
              </div>
            )}
          </div>
        </section>
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
      <Icon className="h-5 w-5 text-sky-700" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold text-slate-950">{value}</p>
    </section>
  );
}
