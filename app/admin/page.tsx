import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { type AdminView } from "@/components/admin/admin-sidebar";
import { type CalendarMode } from "@/components/admin/calendar-view";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { getAllBookingServices } from "@/lib/server/booking-system";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";
import { isMailConfigured } from "@/lib/server/mail";

export const metadata = {
  title: "Admin - EV Check",
  robots: { index: false, follow: false },
};

const views: AdminView[] = [
  "overview",
  "appointments",
  "calendar",
  "services",
  "customers",
  "users",
  "emails",
  "invoices",
  "payments",
  "settings",
];

export default async function AdminPage({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<{
    view?: string;
    q?: string;
    status?: string;
    saved?: string;
    error?: string;
    date?: string;
    mode?: string;
    id?: string;
    from?: string;
  }>;
}) {
  const searchParams = await searchParamsPromise;
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) redirect("/admin/login");

  const dashboard = await getAdminDashboardData();
  const services = await getAllBookingServices();
  const isBookingDetail =
    searchParams?.view === "booking" && Boolean(searchParams?.id);
  const view = views.includes(searchParams?.view as AdminView)
    ? (searchParams?.view as AdminView)
    : isBookingDetail
      ? views.includes(searchParams?.from as AdminView)
        ? (searchParams?.from as AdminView)
        : "calendar"
      : "overview";
  const query = String(searchParams?.q || "")
    .trim()
    .toLowerCase();
  const status = String(searchParams?.status || "");
  const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(
    String(searchParams?.date || ""),
  )
    ? String(searchParams?.date)
    : new Date().toISOString().slice(0, 10);
  const calendarMode: CalendarMode =
    searchParams?.mode === "day"
      ? "day"
      : searchParams?.mode === "agenda"
        ? "agenda"
        : "week";

  return (
    <AdminShell>
      <AdminDashboardClient
        dashboard={dashboard}
        services={services}
        sessionEmail={session.email}
        initialView={view}
        initialCalendarDate={calendarDate}
        initialCalendarMode={calendarMode}
        initialQuery={query}
        initialStatus={status}
        initialBookingId={isBookingDetail ? searchParams?.id : undefined}
        savedNotice={Boolean(searchParams?.saved)}
        errorNotice={Boolean(searchParams?.error)}
        mailConfigured={isMailConfigured()}
      />
    </AdminShell>
  );
}
