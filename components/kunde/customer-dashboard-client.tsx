"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CustomerSidebar,
  type CustomerView,
} from "@/components/kunde/customer-sidebar";
import { Notice } from "@/components/kunde/customer-ui";
import {
  AppointmentsPanel,
  InvoicesPanel,
  ReportsPanel,
  SettingsPanel,
} from "@/components/kunde/customer-views";
import type {
  Appointment,
  Customer,
  CustomerReport,
  DashboardSettings,
} from "@/lib/ev-domain";

type CustomerPortal = {
  customer: Customer;
  appointments: Appointment[];
  reports: CustomerReport[];
  settings: DashboardSettings;
  databaseConfigured: boolean;
};

export function CustomerDashboardClient({
  token,
  portal,
  initialView,
  savedNotice,
  errorNotice,
}: {
  token: string;
  portal: CustomerPortal;
  initialView: CustomerView;
  savedNotice?: boolean;
  errorNotice?: boolean;
}) {
  const [view, setView] = useState<CustomerView>(initialView);

  const handleSelectView = (next: CustomerView) => {
    setView(next);
    window.history.replaceState(null, "", `/kunde/${token}?view=${next}`);
  };

  const activeChecks = portal.appointments.filter(
    (item) => item.status !== "cancelled",
  ).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[17rem_minmax(0,1fr)]">
      <CustomerSidebar
        customerName={portal.customer.name}
        customerEmail={portal.customer.email}
        view={view}
        onSelectView={handleSelectView}
        stats={{
          appointments: portal.appointments.length,
          activeChecks,
          reports: portal.reports.length,
        }}
      />
      <section className="min-w-0 space-y-4">
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-sky-700 uppercase">
              Customer portal
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              Welcome, {portal.customer.name}
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
          >
            ← Back to EV-Check.dk
          </Link>
        </div>

        {!portal.databaseConfigured ? (
          <Notice tone="sky">
            The dashboard is showing demo data right now. Please contact
            EV-Check if this looks wrong.
          </Notice>
        ) : null}
        {savedNotice ? <Notice tone="sky">Changes saved.</Notice> : null}
        {errorNotice ? (
          <Notice tone="rose">The action could not be completed.</Notice>
        ) : null}

        {view === "appointments" ? (
          <AppointmentsPanel token={token} appointments={portal.appointments} />
        ) : null}
        {view === "invoices" ? (
          <InvoicesPanel token={token} appointments={portal.appointments} />
        ) : null}
        {view === "reports" ? (
          <ReportsPanel token={token} reports={portal.reports} />
        ) : null}
        {view === "settings" ? (
          <SettingsPanel token={token} customer={portal.customer} />
        ) : null}
      </section>
    </div>
  );
}
