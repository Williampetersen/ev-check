"use client";

import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { AdminSidebar, type AdminView } from "@/components/admin/admin-sidebar";
import {
  CalendarView,
  type CalendarMode,
} from "@/components/admin/calendar-view";
import { BookingPanel } from "@/components/admin/booking-panel";
import {
  AppointmentsView,
  BookingDetailView,
  CustomersView,
  EmailsView,
  InvoicesView,
  Notice,
  Overview,
  Panel,
  PaymentsView,
  ServicesView,
  SettingsView,
  UsersView,
} from "@/components/admin/admin-views";
import type { AdminDashboardData } from "@/lib/ev-domain";
import type { BookingService } from "@/lib/server/booking-system";

export function AdminDashboardClient({
  dashboard,
  services,
  sessionEmail,
  initialView,
  initialCalendarDate,
  initialCalendarMode,
  initialQuery,
  initialStatus,
  initialBookingId,
  savedNotice,
  errorNotice,
  mailConfigured,
}: {
  dashboard: AdminDashboardData;
  services: BookingService[];
  sessionEmail: string;
  initialView: AdminView;
  initialCalendarDate: string;
  initialCalendarMode: CalendarMode;
  initialQuery: string;
  initialStatus: string;
  initialBookingId?: string;
  savedNotice?: boolean;
  errorNotice?: boolean;
  mailConfigured: boolean;
}) {
  const [view, setView] = useState<AdminView>(initialView);
  const [calendarDate, setCalendarDate] = useState(initialCalendarDate);
  const [calendarMode, setCalendarMode] =
    useState<CalendarMode>(initialCalendarMode);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(
    initialBookingId || null,
  );

  const handleSelectView = (next: AdminView) => {
    setView(next);
    setActiveBookingId(null);
    window.history.replaceState(null, "", `/admin?view=${next}`);
  };

  const visibleAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return dashboard.appointments.filter((appointment) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          appointment.customerName,
          appointment.customerEmail,
          appointment.customerPhone,
          appointment.registrationNumber,
          appointment.vehicleLabel,
          appointment.serviceLabel,
          appointment.areaName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = !status || appointment.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [dashboard.appointments, query, status]);

  const activeAppointment = activeBookingId
    ? dashboard.appointments.find((item) => item.id === activeBookingId)
    : undefined;
  const activeCustomer = activeAppointment
    ? dashboard.customers.find(
        (item) => item.id === activeAppointment.customerId,
      )
    : undefined;

  const bookingBackHref = `/admin?view=${view}${
    view === "calendar" ? `&date=${calendarDate}&mode=${calendarMode}` : ""
  }`;

  return (
    <div className="grid gap-4 xl:grid-cols-[17rem_minmax(0,1fr)]">
      <AdminSidebar
        dashboard={dashboard}
        sessionEmail={sessionEmail}
        view={view}
        onSelectView={handleSelectView}
      />
      <section className="min-w-0 space-y-4">
        {!dashboard.databaseConfigured ? (
          <Notice tone="sky">
            DATABASE_URL is not configured, so EV Check is showing demo
            dashboard data. Add the database env var to persist customers,
            appointments, settings, users, and emails.
          </Notice>
        ) : null}
        {dashboard.databaseError ? (
          <Notice tone="rose">{dashboard.databaseError}</Notice>
        ) : null}
        {savedNotice ? <Notice tone="sky">Changes saved.</Notice> : null}
        {errorNotice ? (
          <Notice tone="rose">The action could not be completed.</Notice>
        ) : null}

        {view === "overview" ? (
          <Overview dashboard={dashboard} appointments={visibleAppointments} />
        ) : null}
        {view === "appointments" ? (
          <AppointmentsView
            appointments={visibleAppointments}
            query={query}
            status={status}
            onQueryChange={setQuery}
            onStatusChange={setStatus}
            dashboard={dashboard}
            onOpenBooking={setActiveBookingId}
          />
        ) : null}
        {view === "calendar" ? (
          <Panel
            title="Calendar"
            description="Every booking across all customers, laid out by day and time."
            icon={CalendarRange}
          >
            <CalendarView
              appointments={dashboard.appointments}
              unavailablePeriods={dashboard.unavailablePeriods}
              settings={dashboard.settings}
              date={calendarDate}
              mode={calendarMode}
              onDateChange={setCalendarDate}
              onModeChange={setCalendarMode}
              onSelectAppointment={setActiveBookingId}
            />
          </Panel>
        ) : null}
        {view === "services" ? (
          <ServicesView
            services={services}
            databaseConfigured={dashboard.databaseConfigured}
          />
        ) : null}
        {view === "customers" ? <CustomersView dashboard={dashboard} /> : null}
        {view === "users" ? <UsersView dashboard={dashboard} /> : null}
        {view === "emails" ? (
          <EmailsView dashboard={dashboard} mailConfigured={mailConfigured} />
        ) : null}
        {view === "invoices" ? (
          <InvoicesView
            appointments={visibleAppointments}
            databaseConfigured={dashboard.databaseConfigured}
          />
        ) : null}
        {view === "payments" ? (
          <PaymentsView appointments={visibleAppointments} />
        ) : null}
        {view === "settings" ? <SettingsView dashboard={dashboard} /> : null}
      </section>

      <BookingPanel
        open={Boolean(activeBookingId)}
        onClose={() => setActiveBookingId(null)}
        title={activeAppointment?.customerName || "Booking"}
        description={
          activeAppointment ? `Booking ${activeAppointment.id}` : undefined
        }
      >
        {activeAppointment && activeCustomer ? (
          <BookingDetailView
            appointment={activeAppointment}
            customer={activeCustomer}
            dashboard={dashboard}
            backHref={bookingBackHref}
          />
        ) : activeBookingId ? (
          <p className="text-sm text-slate-500">
            This booking could not be found. It may have been removed.
          </p>
        ) : null}
      </BookingPanel>
    </div>
  );
}
