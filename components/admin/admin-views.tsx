"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BatteryCharging,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  ImagePlus,
  Inbox,
  ListChecks,
  Mail,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Trash2,
  Upload,
  User,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminTabs, type AdminTabItem } from "@/components/admin/admin-tabs";
import { BookingTrendChart } from "@/components/admin/booking-trend-chart";
import { KpiCard } from "@/components/admin/kpi-card";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import {
  formatPrice,
  formatShortDate,
  invoiceLabels,
  MAX_CUSTOMER_REPORTS,
  paymentLabels,
  statusLabels,
  type AdminDashboardData,
  type Appointment,
  type AppointmentStatus,
  type Customer,
  type CustomerReport,
  type EmailLog,
} from "@/lib/ev-domain";
import { type BookingService } from "@/lib/server/booking-system";
import { SUPPORTED_TIMEZONES, nowLabelInTimeZone } from "@/lib/server/timezone";
import { cn } from "@/lib/utils";

export const adminSelectClass =
  "h-12 rounded-lg border border-white/70 bg-white/70 px-3 text-base font-medium text-slate-700 outline-none backdrop-blur focus:border-sky-400 focus:bg-white/85 focus:ring-4 focus:ring-sky-500/10 sm:h-10 sm:text-sm";

const weekdayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "sky" | "rose";
}) {
  const styles = {
    sky: "border-sky-200/80 bg-sky-50/80 text-sky-800",
    rose: "border-rose-200/80 bg-rose-50/80 text-rose-700",
  };
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium backdrop-blur",
        styles[tone],
      )}
    >
      {children}
    </div>
  );
}

export function Panel({
  title,
  description,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="glass-shell rounded-lg p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50/80 text-sky-700 backdrop-blur">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Overview({
  dashboard,
  appointments,
}: {
  dashboard: AdminDashboardData;
  appointments: Appointment[];
}) {
  const upcoming = appointments
    .filter((item) => item.status !== "cancelled")
    .sort((a, b) =>
      `${a.appointmentDate}T${a.appointmentTime}`.localeCompare(
        `${b.appointmentDate}T${b.appointmentTime}`,
      ),
    )
    .slice(0, 6);
  const statusCounts = ["pending", "approved", "completed", "cancelled"].map(
    (status) => ({
      status: status as AppointmentStatus,
      count: appointments.filter((item) => item.status === status).length,
    }),
  );
  const maxCount = Math.max(1, ...statusCounts.map((item) => item.count));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Today"
          value={String(dashboard.stats.todayAppointments)}
          detail="Appointments today"
          icon={CalendarDays}
        />
        <KpiCard
          label="Total"
          value={String(dashboard.stats.totalAppointments)}
          detail="All appointments"
          icon={FileText}
          tone="slate"
        />
        <KpiCard
          label="Pending"
          value={String(dashboard.stats.pendingAppointments)}
          detail="Needs review"
          icon={BarChart3}
          tone="sky"
        />
        <KpiCard
          label="Revenue"
          value={formatPrice(dashboard.stats.totalRevenue)}
          detail={`${formatPrice(dashboard.stats.outstandingRevenue)} open`}
          icon={CreditCard}
          tone="emerald"
        />
      </div>

      <Panel
        title="Booking activity"
        description="Responsive booking line with totals, status counts, and revenue for the selected period."
        icon={BarChart3}
      >
        <BookingTrendChart
          appointments={appointments}
          timeZone={dashboard.settings.timezone}
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Upcoming appointments"
          description="Next work that needs attention"
          icon={CalendarDays}
        >
          <AppointmentTable appointments={upcoming} compact />
        </Panel>

        <Panel
          title="Status distribution"
          description="Operational balance across all checks"
          icon={BarChart3}
        >
          <div className="grid gap-3">
            {statusCounts.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {statusLabels[item.status]}
                  </span>
                  <span className="text-slate-500">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/55 backdrop-blur">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function AppointmentsView({
  appointments,
  query,
  status,
  onQueryChange,
  onStatusChange,
  dashboard,
  onOpenBooking,
}: {
  appointments: Appointment[];
  query: string;
  status: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  dashboard: AdminDashboardData;
  onOpenBooking: (id: string) => void;
}) {
  type AppointmentStatusFilter = "all" | AppointmentStatus;
  const normalizedQuery = query.trim().toLowerCase();
  const countSource = dashboard.appointments.filter((appointment) => {
    if (!normalizedQuery) return true;
    return [
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
  });
  const statusTabs: AdminTabItem<AppointmentStatusFilter>[] = [
    { id: "all", label: "All", icon: ListChecks, badge: countSource.length },
    {
      id: "pending",
      label: "Pending",
      icon: CalendarClock,
      badge: countSource.filter((item) => item.status === "pending").length,
    },
    {
      id: "approved",
      label: "Approved",
      icon: CalendarCheck2,
      badge: countSource.filter((item) => item.status === "approved").length,
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle2,
      badge: countSource.filter((item) => item.status === "completed").length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      badge: countSource.filter((item) => item.status === "cancelled").length,
    },
  ];

  return (
    <Panel
      title="Appointments"
      description="Search, filter, approve, complete, cancel, and annotate EV checks."
      icon={CalendarDays}
      action={
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-full pl-9 sm:w-56"
              placeholder="Search appointments"
            />
          </div>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className={adminSelectClass}
          >
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="mb-4">
        <AdminTabs
          active={(status || "all") as AppointmentStatusFilter}
          items={statusTabs}
          onSelect={(next) => onStatusChange(next === "all" ? "" : next)}
        />
      </div>
      <AppointmentTable
        appointments={appointments}
        editable
        databaseConfigured={dashboard.databaseConfigured}
        onOpenBooking={onOpenBooking}
      />
    </Panel>
  );
}

export function AppointmentTable({
  appointments,
  compact = false,
  editable = false,
  databaseConfigured = false,
  onOpenBooking,
}: {
  appointments: Appointment[];
  compact?: boolean;
  editable?: boolean;
  databaseConfigured?: boolean;
  onOpenBooking?: (id: string) => void;
}) {
  if (appointments.length === 0)
    return <EmptyState text="No appointments match this view." />;

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="glass-card rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-950">
                  {appointment.customerName}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {appointment.customerEmail}
                </p>
              </div>
              <strong className="shrink-0 text-sm text-slate-950">
                {formatPrice(appointment.total)}
              </strong>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <InfoLine
                label="Vehicle"
                value={`${appointment.vehicleLabel} · ${appointment.registrationNumber}`}
              />
              <InfoLine
                label="Time"
                value={`${formatShortDate(appointment.appointmentDate)} at ${
                  appointment.appointmentTime
                }`}
              />
              <InfoLine label="Service" value={appointment.serviceLabel} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusBadge status={appointment.status} />
              {!compact ? (
                <PaymentBadge status={appointment.paymentStatus} />
              ) : null}
            </div>
            {editable ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenBooking?.(appointment.id)}
                className="mt-3 w-full"
              >
                View / edit booking
              </Button>
            ) : null}
            {editable ? (
              <details className="mt-3">
                <summary className="flex h-11 cursor-pointer items-center justify-center rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 marker:content-[''] hover:border-sky-300 hover:text-sky-700">
                  Quick status update
                </summary>
                <form
                  action={`/api/admin/bookings/${appointment.id}`}
                  method="POST"
                  className="glass-panel mt-2 grid gap-2 rounded-lg p-3"
                >
                  <select
                    name="status"
                    defaultValue={appointment.status}
                    className={adminSelectClass}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    name="admin_notes"
                    defaultValue={appointment.adminNotes}
                    className="min-h-24 text-sm"
                  />
                  <input
                    type="hidden"
                    name="return_view"
                    value="appointments"
                  />
                  <Button type="submit" disabled={!databaseConfigured}>
                    Save
                  </Button>
                </form>
              </details>
            ) : null}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs tracking-wide text-slate-500 uppercase">
            <tr className="border-b border-white/60">
              <th className="px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Vehicle</th>
              <th className="px-3 py-3 font-semibold">Appointment</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 text-right font-semibold">Total</th>
              {editable ? (
                <th className="px-3 py-3 font-semibold">Action</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="align-top hover:bg-white/35">
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-950">
                    {appointment.customerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appointment.customerEmail}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-800">
                    {appointment.vehicleLabel}
                  </p>
                  <p className="text-xs tracking-wide text-slate-500 uppercase">
                    {appointment.registrationNumber}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-800">
                    {formatShortDate(appointment.appointmentDate)} at{" "}
                    {appointment.appointmentTime}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appointment.serviceLabel}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={appointment.status} />
                    {!compact ? (
                      <PaymentBadge status={appointment.paymentStatus} />
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-950">
                  {formatPrice(appointment.total)}
                </td>
                {editable ? (
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenBooking?.(appointment.id)}
                        className="h-9 text-xs"
                      >
                        View / edit
                      </Button>
                      <details className="group">
                        <summary className="cursor-pointer rounded-lg border border-white/70 bg-white/55 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur marker:content-[''] hover:border-sky-300 hover:text-sky-700">
                          Quick update
                        </summary>
                        <form
                          action={`/api/admin/bookings/${appointment.id}`}
                          method="POST"
                          className="glass-panel mt-2 grid w-64 gap-2 rounded-lg p-3"
                        >
                          <select
                            name="status"
                            defaultValue={appointment.status}
                            className={adminSelectClass}
                          >
                            {Object.entries(statusLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                          <Textarea
                            name="admin_notes"
                            defaultValue={appointment.adminNotes}
                            className="min-h-20 text-xs"
                          />
                          <input
                            type="hidden"
                            name="return_view"
                            value="appointments"
                          />
                          <Button
                            type="submit"
                            disabled={!databaseConfigured}
                            className="h-9 text-xs"
                          >
                            Save
                          </Button>
                        </form>
                      </details>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function BookingDetailView({
  appointment,
  customer,
  dashboard,
  backHref,
}: {
  appointment: Appointment;
  customer: Customer;
  dashboard: AdminDashboardData;
  backHref: string;
}) {
  type BookingDetailTab = "booking" | "status" | "customer" | "notes";
  const [activeTab, setActiveTab] = useState<BookingDetailTab>("booking");

  return (
    <form
      action={`/api/admin/bookings/${appointment.id}/update`}
      method="POST"
      className="grid gap-5"
    >
      <input type="hidden" name="return_to" value={backHref} />

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoLine label="Created" value={appointment.createdAt} />
        <InfoLine label="Invoice number" value={appointment.invoiceNumber} />
      </div>

      <AdminTabs
        active={activeTab}
        items={[
          { id: "booking", label: "Booking", icon: CalendarDays },
          { id: "status", label: "Status", icon: Settings2 },
          { id: "customer", label: "Customer", icon: User },
          { id: "notes", label: "Notes", icon: Pencil },
        ]}
        onSelect={setActiveTab}
      />

      <FormTabPanel active={activeTab === "booking"}>
        <div className="glass-card rounded-lg p-4">
          <p className="font-semibold text-slate-950">Booking details</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Date">
              <Input
                type="date"
                name="appointment_date"
                defaultValue={appointment.appointmentDate}
                required
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                name="appointment_time"
                defaultValue={appointment.appointmentTime}
                required
              />
            </Field>
            <Field label="End time">
              <Input
                type="time"
                name="appointment_end_time"
                defaultValue={appointment.appointmentEndTime}
              />
            </Field>
            <Field label="Service">
              <Input
                name="service_label"
                defaultValue={appointment.serviceLabel}
              />
            </Field>
            <Field label="Vehicle">
              <Input
                name="vehicle_label"
                defaultValue={appointment.vehicleLabel}
              />
            </Field>
            <Field label="Registration number">
              <Input
                name="registration_number"
                defaultValue={appointment.registrationNumber}
              />
            </Field>
            <Field label="Total (DKK)">
              <Input
                type="number"
                min={0}
                name="total"
                defaultValue={appointment.total}
              />
            </Field>
            <Field label="Area">
              <Input name="area_name" defaultValue={appointment.areaName} />
            </Field>
            <Field label="Assigned user">
              <select
                name="assigned_user"
                defaultValue={appointment.assignedUser}
                className={adminSelectClass}
              >
                <option value="Unassigned">Unassigned</option>
                {dashboard.users.map((user) => (
                  <option key={user.id} value={user.fullName}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </FormTabPanel>

      <FormTabPanel active={activeTab === "status"}>
        <div className="glass-card rounded-lg p-4">
          <p className="font-semibold text-slate-950">Status</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Booking status">
              <select
                name="status"
                defaultValue={appointment.status}
                className={adminSelectClass}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment status">
              <select
                name="payment_status"
                defaultValue={appointment.paymentStatus}
                className={adminSelectClass}
              >
                {Object.entries(paymentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Invoice status">
              <select
                name="invoice_status"
                defaultValue={appointment.invoiceStatus}
                className={adminSelectClass}
              >
                {Object.entries(invoiceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </FormTabPanel>

      <FormTabPanel active={activeTab === "notes"}>
        <Field label="Admin notes">
          <Textarea
            name="admin_notes"
            defaultValue={appointment.adminNotes}
            className="min-h-24"
          />
        </Field>
      </FormTabPanel>

      <FormTabPanel active={activeTab === "customer"}>
        <div className="glass-card rounded-lg p-4">
          <p className="font-semibold text-slate-950">Customer details</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="customer_name" defaultValue={customer.name} />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                name="customer_email"
                defaultValue={customer.email}
              />
            </Field>
            <Field label="Phone">
              <Input name="customer_phone" defaultValue={customer.phone} />
            </Field>
            <Field label="Company">
              <Input name="customer_company" defaultValue={customer.company} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input name="customer_address" defaultValue={customer.address} />
            </Field>
            <Field label="Postal code">
              <Input
                name="customer_postal_code"
                defaultValue={customer.postalCode}
              />
            </Field>
            <Field label="City">
              <Input name="customer_city" defaultValue={customer.city} />
            </Field>
            <Field label="Customer notes" className="sm:col-span-2">
              <Textarea
                name="customer_notes"
                defaultValue={customer.notes}
                className="min-h-20"
              />
            </Field>
          </div>
        </div>
      </FormTabPanel>

      <Button
        type="submit"
        disabled={!dashboard.databaseConfigured}
        className="w-full sm:w-fit"
      >
        Save changes
      </Button>
    </form>
  );
}

export function ServicesView({
  services,
  databaseConfigured,
}: {
  services: BookingService[];
  databaseConfigured: boolean;
}) {
  type ServiceTab = "manage" | "add" | "content";
  const [activeTab, setActiveTab] = useState<ServiceTab>("manage");
  const serviceTabs: AdminTabItem<ServiceTab>[] = [
    {
      id: "manage",
      label: "Manage",
      icon: BatteryCharging,
      badge: services.length,
    },
    { id: "add", label: "Add service", icon: Plus },
    { id: "content", label: "Images & features", icon: ImagePlus },
  ];

  return (
    <Panel
      title="Services"
      description="Keep booking services, add-ons, pricing, copy, and images separated by task."
      icon={BatteryCharging}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={serviceTabs}
          onSelect={setActiveTab}
        />
      </div>

      {activeTab === "manage" ? (
        services.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <article key={service.id} className="glass-card rounded-lg p-4">
                <ServiceCardHeader service={service} />
                <p className="mt-3 text-sm text-slate-600">
                  {service.description}
                </p>

                <details className="mt-3">
                  <summary className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 marker:content-[''] hover:border-sky-300 hover:text-sky-700">
                    <Pencil className="h-4 w-4" />
                    Edit service
                  </summary>
                  <form
                    action={`/api/admin/services/${service.id}`}
                    method="POST"
                    encType="multipart/form-data"
                    className="glass-panel mt-2 grid gap-4 rounded-lg p-3"
                  >
                    <ServiceFields service={service} />
                    <Button
                      type="submit"
                      disabled={!databaseConfigured}
                      className="w-full sm:w-fit"
                    >
                      Save changes
                    </Button>
                  </form>
                </details>

                <form
                  action={`/api/admin/services/${service.id}/delete`}
                  method="POST"
                  className="mt-2"
                >
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={!databaseConfigured}
                    className="w-full text-rose-600 hover:border-rose-300 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete service
                  </Button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="No services yet. Open the Add service tab to create one." />
        )
      ) : null}

      {activeTab === "add" ? (
        <form
          action="/api/admin/services"
          method="POST"
          encType="multipart/form-data"
          className="glass-card grid gap-4 rounded-lg p-4"
        >
          <ServiceFields />
          <Button
            type="submit"
            disabled={!databaseConfigured}
            className="w-full sm:w-fit"
          >
            <Plus className="h-4 w-4" />
            Add service
          </Button>
        </form>
      ) : null}

      {activeTab === "content" ? (
        services.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <article key={service.id} className="glass-card rounded-lg p-4">
                <ServiceCardHeader service={service} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {service.features.length > 0 ? (
                    service.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-sky-200/80 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-700 backdrop-blur"
                      >
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-slate-500">
                      No feature bullets yet.
                    </span>
                  )}
                </div>
                <details className="mt-3">
                  <summary className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 marker:content-[''] hover:border-sky-300 hover:text-sky-700">
                    <ImagePlus className="h-4 w-4" />
                    Edit image and features
                  </summary>
                  <form
                    action={`/api/admin/services/${service.id}`}
                    method="POST"
                    encType="multipart/form-data"
                    className="glass-panel mt-2 grid gap-4 rounded-lg p-3"
                  >
                    <ServiceFields service={service} />
                    <Button
                      type="submit"
                      disabled={!databaseConfigured}
                      className="w-full sm:w-fit"
                    >
                      Save content
                    </Button>
                  </form>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="No service content to edit yet." />
        )
      ) : null}
    </Panel>
  );
}

function ServiceCardHeader({ service }: { service: BookingService }) {
  return (
    <div className="flex items-start gap-3">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/70 bg-white/60">
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt={service.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-300">
            <ImagePlus className="h-5 w-5" />
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-slate-950">{service.title}</h3>
        <p className="text-sm text-slate-500">
          {formatPrice(service.price)} - {service.duration}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Buffer {service.bufferBeforeMinutes} min before /{" "}
          {service.bufferAfterMinutes} min after
        </p>
      </div>
    </div>
  );
}

function ServiceFields({ service }: { service?: BookingService }) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Title">
          <Input name="title" defaultValue={service?.title} required />
        </Field>
        <Field label="Badge">
          <Input
            name="badge"
            defaultValue={service?.badge}
            placeholder="Fx Fast service"
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={service?.description} />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Duration (minutes)">
          <Input
            name="duration_minutes"
            type="number"
            min={5}
            step={5}
            defaultValue={service?.durationMinutes ?? 15}
          />
        </Field>
        <Field label="Price (DKK)">
          <Input
            name="price"
            type="number"
            min={0}
            defaultValue={service?.price ?? 0}
          />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Notice / before buffer (minutes)">
          <Input
            name="buffer_before_minutes"
            type="number"
            min={0}
            step={5}
            defaultValue={service?.bufferBeforeMinutes ?? 60}
          />
        </Field>
        <Field label="After buffer (minutes)">
          <Input
            name="buffer_after_minutes"
            type="number"
            min={0}
            step={5}
            defaultValue={service?.bufferAfterMinutes ?? 0}
          />
        </Field>
      </div>
      <Field label="Features (one per line)">
        <Textarea
          name="features"
          defaultValue={service?.features.join("\n")}
          className="min-h-24"
        />
      </Field>
      <Field label={service ? "Replace image" : "Image"}>
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
        />
      </Field>
      {service?.imageUrl ? (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            name="remove_image"
            type="checkbox"
            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          Remove current image
        </label>
      ) : null}
    </>
  );
}

export function CustomersView({
  dashboard,
}: {
  dashboard: AdminDashboardData;
}) {
  type CustomerTab = "all" | "active" | "portals";
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");
  const appointmentsByCustomer = new Map<string, Appointment[]>();
  for (const appointment of dashboard.appointments) {
    appointmentsByCustomer.set(appointment.customerId, [
      ...(appointmentsByCustomer.get(appointment.customerId) || []),
      appointment,
    ]);
  }
  const activeCustomers = dashboard.customers.filter(
    (customer) => (appointmentsByCustomer.get(customer.id) || []).length > 0,
  );
  const visibleCustomers =
    activeTab === "active" ? activeCustomers : dashboard.customers;

  return (
    <Panel
      title="Customers"
      description="Customer records, portal links, and appointment history."
      icon={Users}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={[
            {
              id: "all",
              label: "All customers",
              icon: Users,
              badge: dashboard.customers.length,
            },
            {
              id: "active",
              label: "With bookings",
              icon: CalendarCheck2,
              badge: activeCustomers.length,
            },
            { id: "portals", label: "Portal links", icon: User },
          ]}
          onSelect={setActiveTab}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleCustomers.map((customer) => {
          const appointments = appointmentsByCustomer.get(customer.id) || [];
          return (
            <article key={customer.id} className="glass-card rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-950">{customer.name}</h3>
                  <p className="text-sm text-slate-500">{customer.email}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {customer.phone}
                  </p>
                </div>
                <span className="rounded-full border border-sky-200/80 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-700 backdrop-blur">
                  {appointments.length} checks
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {[customer.address, customer.postalCode, customer.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <a
                className="mt-4 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-900"
                href={`/kunde/${customer.portalToken || customer.id}`}
              >
                {activeTab === "portals"
                  ? "Open customer portal"
                  : "Open portal"}
              </a>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

export function UsersView({ dashboard }: { dashboard: AdminDashboardData }) {
  type UsersTab = "all" | "inspectors" | "admins";
  const [activeTab, setActiveTab] = useState<UsersTab>("all");
  const visibleUsers = dashboard.users.filter((user) => {
    if (activeTab === "inspectors") return user.role === "inspector";
    if (activeTab === "admins") return user.role === "admin";
    return true;
  });

  return (
    <Panel
      title="Admin users and field users"
      description="The previous agent dashboard is adapted here as EV Check service users."
      icon={User}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={[
            {
              id: "all",
              label: "All users",
              icon: Users,
              badge: dashboard.users.length,
            },
            {
              id: "inspectors",
              label: "Inspectors",
              icon: Wrench,
              badge: dashboard.users.filter((user) => user.role === "inspector")
                .length,
            },
            {
              id: "admins",
              label: "Admins",
              icon: User,
              badge: dashboard.users.filter((user) => user.role === "admin")
                .length,
            },
          ]}
          onSelect={setActiveTab}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleUsers.map((user) => (
          <article key={user.id} className="glass-card rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{user.fullName}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <span className="rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize backdrop-blur">
                {user.role}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{user.workingArea}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {user.assignedServices.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-sky-200/80 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-700 backdrop-blur"
                >
                  {service}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function EmailsView({
  dashboard,
  mailConfigured,
}: {
  dashboard: AdminDashboardData;
  mailConfigured: boolean;
}) {
  type EmailTab = "delivery" | "logs" | "failed";
  const [activeTab, setActiveTab] = useState<EmailTab>("delivery");
  const failedLogs = dashboard.emailLogs.filter(
    (email) => email.status === "failed" || email.status === "not_configured",
  );

  return (
    <Panel
      title="Email automation"
      description="SMTP status, automation toggles, test emails, and recent delivery logs."
      icon={Mail}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={[
            { id: "delivery", label: "Delivery", icon: Send },
            {
              id: "logs",
              label: "All logs",
              icon: Inbox,
              badge: dashboard.emailLogs.length,
            },
            {
              id: "failed",
              label: "Needs attention",
              icon: AlertTriangle,
              badge: failedLogs.length,
            },
          ]}
          onSelect={setActiveTab}
        />
      </div>

      {activeTab === "delivery" ? (
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="glass-card rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-950">SMTP status</p>
            <p className="mt-2 text-sm text-slate-600">
              {mailConfigured
                ? "SMTP env vars are present."
                : "SMTP is not fully configured."}
            </p>
            <form
              action="/api/admin/test-email"
              method="POST"
              className="mt-4 grid gap-2"
            >
              <Input
                name="to"
                type="email"
                placeholder="Send test to email"
                defaultValue={dashboard.settings.adminNotifyEmail}
              />
              <Button
                type="submit"
                disabled={!dashboard.databaseConfigured && !mailConfigured}
              >
                Send test email
              </Button>
            </form>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-950">
              Delivery snapshot
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <InfoLine
                label="Sent"
                value={String(
                  dashboard.emailLogs.filter((email) => email.status === "sent")
                    .length,
                )}
              />
              <InfoLine
                label="Failed"
                value={String(
                  dashboard.emailLogs.filter(
                    (email) => email.status === "failed",
                  ).length,
                )}
              />
              <InfoLine
                label="Pending"
                value={String(
                  dashboard.emailLogs.filter(
                    (email) => email.status === "pending",
                  ).length,
                )}
              />
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "logs" ? (
        <EmailLogCards
          logs={dashboard.emailLogs}
          emptyText="No email delivery logs yet."
        />
      ) : null}

      {activeTab === "failed" ? (
        <EmailLogCards
          logs={failedLogs}
          emptyText="No failed email logs. Delivery looks clean."
        />
      ) : null}
    </Panel>
  );
}

function EmailLogCards({
  logs,
  emptyText,
}: {
  logs: EmailLog[];
  emptyText: string;
}) {
  if (logs.length === 0) return <EmptyState text={emptyText} />;

  return (
    <div className="grid gap-2">
      {logs.map((email) => (
        <article
          key={email.id}
          className={cn(
            "rounded-lg border px-3 py-3 backdrop-blur",
            email.status === "failed" || email.status === "not_configured"
              ? "border-rose-200/80 bg-rose-50/80"
              : "border-white/60 bg-white/45",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">{email.subject}</p>
              <p className="mt-1 text-xs text-slate-500">
                {email.recipientRole} - {email.recipient}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {email.sentAt || email.createdAt}
              </p>
            </div>
            <EmailStatusPill status={email.status} />
          </div>
          {email.errorMessage ? (
            <p className="mt-2 rounded-lg border border-rose-200/80 bg-white/55 px-3 py-2 text-xs font-medium text-rose-700">
              {email.errorMessage}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function EmailStatusPill({ status }: { status: EmailLog["status"] }) {
  const styles: Record<EmailLog["status"], string> = {
    sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    failed: "border-rose-200 bg-rose-50 text-rose-700",
    not_configured: "border-amber-200 bg-amber-50 text-amber-700",
    pending: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-bold capitalize",
        styles[status],
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function InvoicesView({
  appointments,
  databaseConfigured,
}: {
  appointments: Appointment[];
  databaseConfigured: boolean;
}) {
  type InvoiceTab = "all" | "ready" | "sent" | "paid";
  const [activeTab, setActiveTab] = useState<InvoiceTab>("all");
  const invoiceAppointments = appointments.filter(
    (item) => item.status !== "cancelled",
  );
  const visibleInvoiceAppointments =
    activeTab === "all"
      ? invoiceAppointments
      : invoiceAppointments.filter((item) => item.invoiceStatus === activeTab);

  return (
    <Panel
      title="Invoices"
      description="Generate receipt PDFs, inspect invoice status, and resend customer confirmations."
      icon={FileText}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={[
            {
              id: "all",
              label: "All invoices",
              icon: FileText,
              badge: invoiceAppointments.length,
            },
            {
              id: "ready",
              label: "Ready",
              icon: CalendarCheck2,
              badge: invoiceAppointments.filter(
                (item) => item.invoiceStatus === "ready",
              ).length,
            },
            {
              id: "sent",
              label: "Sent",
              icon: Send,
              badge: invoiceAppointments.filter(
                (item) => item.invoiceStatus === "sent",
              ).length,
            },
            {
              id: "paid",
              label: "Paid",
              icon: CheckCircle2,
              badge: invoiceAppointments.filter(
                (item) => item.invoiceStatus === "paid",
              ).length,
            },
          ]}
          onSelect={setActiveTab}
        />
      </div>

      {visibleInvoiceAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs tracking-wide text-slate-500 uppercase">
              <tr className="border-b border-white/60">
                <th className="px-3 py-3">Invoice</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Booking</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {visibleInvoiceAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-3 py-3 font-semibold">
                    {appointment.invoiceNumber || "Draft"}
                  </td>
                  <td className="px-3 py-3">{appointment.customerName}</td>
                  <td className="px-3 py-3">
                    {formatShortDate(appointment.appointmentDate)} at{" "}
                    {appointment.appointmentTime}
                  </td>
                  <td className="px-3 py-3">
                    {invoiceLabels[appointment.invoiceStatus]}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold">
                    {formatPrice(appointment.total)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-sky-200 bg-white/70 px-3 text-xs font-bold text-sky-700 shadow-sm shadow-slate-900/5 transition hover:border-sky-400 hover:bg-sky-50"
                        href={`/admin/invoice/${appointment.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View invoice
                      </a>
                      <form
                        action={`/api/admin/bookings/${appointment.id}/resend-confirmation`}
                        method="POST"
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          className="h-9 text-xs"
                          disabled={!databaseConfigured}
                        >
                          Resend
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text="No invoices match this tab." />
      )}
    </Panel>
  );
}

const REPORTS_PAGE_SIZE = 10;

export function ReportsView({
  dashboard,
  mailConfigured,
}: {
  dashboard: AdminDashboardData;
  mailConfigured: boolean;
}) {
  const [page, setPage] = useState(1);

  const reportsByCustomer = new Map<string, CustomerReport[]>();
  for (const report of dashboard.reports) {
    reportsByCustomer.set(report.customerId, [
      ...(reportsByCustomer.get(report.customerId) || []),
      report,
    ]);
  }

  const latestBookingByCustomer = new Map<string, string>();
  for (const appointment of dashboard.appointments) {
    const current = latestBookingByCustomer.get(appointment.customerId);
    if (!current || appointment.appointmentDate > current) {
      latestBookingByCustomer.set(
        appointment.customerId,
        appointment.appointmentDate,
      );
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(dashboard.customers.length / REPORTS_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageCustomers = dashboard.customers.slice(
    (safePage - 1) * REPORTS_PAGE_SIZE,
    safePage * REPORTS_PAGE_SIZE,
  );

  return (
    <Panel
      title="Reports"
      description={`Upload PDF reports per customer (PDF only, max 4 MB, up to ${MAX_CUSTOMER_REPORTS} reports each) and email the customer when a report is ready.`}
      icon={ClipboardList}
    >
      {!mailConfigured ? (
        <div className="mb-4">
          <Notice tone="sky">
            SMTP is not fully configured, so &ldquo;Send email&rdquo; will log
            a failed delivery instead of notifying the customer.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-3">
        {pageCustomers.length > 0 ? (
          pageCustomers.map((customer) => (
            <CustomerReportCard
              key={customer.id}
              customer={customer}
              reports={(reportsByCustomer.get(customer.id) || []).sort(
                (a, b) => b.createdAt.localeCompare(a.createdAt),
              )}
              latestBooking={latestBookingByCustomer.get(customer.id)}
              databaseConfigured={dashboard.databaseConfigured}
            />
          ))
        ) : (
          <EmptyState text="No customers yet." />
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className="h-9 text-xs"
          >
            Previous
          </Button>
          <span className="text-sm font-semibold text-slate-600">
            Page {safePage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className="h-9 text-xs"
          >
            Next
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}

function CustomerReportCard({
  customer,
  reports,
  latestBooking,
  databaseConfigured,
}: {
  customer: Customer;
  reports: CustomerReport[];
  latestBooking?: string;
  databaseConfigured: boolean;
}) {
  const canAddMore = reports.length < MAX_CUSTOMER_REPORTS;

  return (
    <article className="glass-card rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-slate-950">{customer.name}</p>
          <p className="text-sm text-slate-500">{customer.email}</p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            ID: {customer.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">
            {latestBooking ? formatShortDate(latestBooking) : "No bookings"}
          </p>
          <p className="text-xs text-slate-400">Last booking</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-sky-200/80 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-700 backdrop-blur">
          {reports.length}/{MAX_CUSTOMER_REPORTS} reports
        </span>
      </div>

      {reports.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/60 bg-white/45 px-3 py-2 backdrop-blur"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {report.title || report.fileName}
                </p>
                <p className="text-xs text-slate-500">
                  {formatShortDate(report.createdAt)} ·{" "}
                  {report.sentAt ? "Sent to customer" : "Not sent"}
                </p>
              </div>
              <div className="flex gap-1.5">
                <a
                  className="inline-flex h-8 items-center rounded-lg border border-sky-200 bg-white/70 px-3 text-xs font-bold text-sky-700 shadow-sm shadow-slate-900/5 transition hover:border-sky-400 hover:bg-sky-50"
                  href={`/api/admin/reports/${report.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
                <form
                  action={`/api/admin/reports/${report.id}/send`}
                  method="POST"
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-8 text-xs"
                    disabled={!databaseConfigured}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {report.sentAt ? "Resend email" : "Send email"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No reports uploaded yet.</p>
      )}

      {canAddMore ? (
        <details className="mt-3">
          <summary className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 marker:content-[''] hover:border-sky-300 hover:text-sky-700">
            <Plus className="h-4 w-4" />
            Add report
          </summary>
          <form
            action="/api/admin/reports"
            method="POST"
            encType="multipart/form-data"
            className="glass-panel mt-2 grid gap-3 rounded-lg p-3"
          >
            <input type="hidden" name="customer_id" value={customer.id} />
            <Field label="Title (optional)">
              <Input name="title" placeholder="Fx Batterirapport - juli 2026" />
            </Field>
            <Field label="PDF file">
              <input
                name="file"
                type="file"
                accept="application/pdf"
                required
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
              />
            </Field>
            <Button
              type="submit"
              disabled={!databaseConfigured}
              className="w-full sm:w-fit"
            >
              <Upload className="h-4 w-4" />
              Upload report
            </Button>
          </form>
        </details>
      ) : (
        <p className="mt-3 text-xs font-semibold text-amber-600">
          Maximum of {MAX_CUSTOMER_REPORTS} reports reached for this customer.
        </p>
      )}
    </article>
  );
}

export function PaymentsView({
  appointments,
}: {
  appointments: Appointment[];
}) {
  type PaymentTab = "open" | "paid" | "refunded" | "all";
  const [activeTab, setActiveTab] = useState<PaymentTab>("open");
  const unpaid = appointments.filter(
    (item) =>
      (item.paymentStatus === "unpaid" || item.paymentStatus === "pending") &&
      item.status !== "cancelled",
  );
  const paymentAppointments = appointments.filter(
    (item) => item.status !== "cancelled",
  );
  const visiblePayments =
    activeTab === "open"
      ? unpaid
      : activeTab === "all"
        ? paymentAppointments
        : paymentAppointments.filter(
            (item) => item.paymentStatus === activeTab,
          );

  return (
    <Panel
      title="Payments"
      description="Outstanding revenue and payment status."
      icon={CreditCard}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={[
            {
              id: "open",
              label: "Open",
              icon: AlertTriangle,
              badge: unpaid.length,
            },
            {
              id: "paid",
              label: "Paid",
              icon: CheckCircle2,
              badge: paymentAppointments.filter(
                (item) => item.paymentStatus === "paid",
              ).length,
            },
            {
              id: "refunded",
              label: "Refunded",
              icon: CreditCard,
              badge: paymentAppointments.filter(
                (item) => item.paymentStatus === "refunded",
              ).length,
            },
            {
              id: "all",
              label: "All payments",
              icon: ListChecks,
              badge: paymentAppointments.length,
            },
          ]}
          onSelect={setActiveTab}
        />
      </div>

      {visiblePayments.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visiblePayments.map((appointment) => (
            <article key={appointment.id} className="glass-card rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">
                    {appointment.customerName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {appointment.serviceLabel}
                  </p>
                </div>
                <PaymentBadge status={appointment.paymentStatus} />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-950">
                {formatPrice(appointment.total)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {paymentLabels[appointment.paymentStatus]}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="No payments match this tab." />
      )}
    </Panel>
  );
}

export function SettingsView({ dashboard }: { dashboard: AdminDashboardData }) {
  type SettingsTab =
    | "company"
    | "booking"
    | "schedule"
    | "blocks"
    | "areas"
    | "email";
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const settings = dashboard.settings;
  return (
    <Panel
      title="Settings"
      description="Company, appointment, closed time, service area, and email automation settings."
      icon={Settings2}
    >
      <div className="mb-4">
        <AdminTabs
          active={activeTab}
          items={[
            { id: "company", label: "Company", icon: Building2 },
            { id: "booking", label: "Booking", icon: CalendarCheck2 },
            { id: "schedule", label: "Schedule", icon: CalendarClock },
            {
              id: "blocks",
              label: "Closed times",
              icon: CalendarX2,
              badge: dashboard.unavailablePeriods.length,
            },
            { id: "areas", label: "Areas", icon: Users },
            { id: "email", label: "Email", icon: Mail },
          ]}
          onSelect={setActiveTab}
        />
      </div>

      {activeTab === "blocks" ? (
        <ClosedTimesSettings dashboard={dashboard} />
      ) : (
        <form action="/api/admin/settings" method="POST" className="grid gap-5">
        <FormTabPanel active={activeTab === "company"}>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Company name">
              <Input name="company_name" defaultValue={settings.companyName} />
            </Field>
            <Field label="Support email">
              <Input
                name="support_email"
                type="email"
                defaultValue={settings.supportEmail}
              />
            </Field>
            <Field label="Admin notify email">
              <Input
                name="admin_notify_email"
                type="email"
                defaultValue={settings.adminNotifyEmail}
              />
            </Field>
          </div>
        </FormTabPanel>

        <FormTabPanel active={activeTab === "booking"}>
          <div className="glass-card rounded-lg p-4">
            <p className="font-semibold text-slate-950">New booking approval</p>
            <p className="mt-1 text-sm text-slate-500">
              Choose whether bookings made on the website are confirmed
              instantly, or held as &ldquo;Pending&rdquo; until an admin reviews
              them.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-3 text-sm font-semibold backdrop-blur",
                  settings.defaultAppointmentStatus === "approved"
                    ? "border-sky-300 bg-sky-50/80 text-sky-800"
                    : "border-white/60 bg-white/45 text-slate-700",
                )}
              >
                <input
                  type="radio"
                  name="default_appointment_status"
                  value="approved"
                  defaultChecked={
                    settings.defaultAppointmentStatus === "approved"
                  }
                  className="mt-1 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  Auto-approve
                  <span className="block text-xs font-normal text-slate-500">
                    New bookings are confirmed instantly, no review needed.
                  </span>
                </span>
              </label>
              <label
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-3 text-sm font-semibold backdrop-blur",
                  settings.defaultAppointmentStatus !== "approved"
                    ? "border-sky-300 bg-sky-50/80 text-sky-800"
                    : "border-white/60 bg-white/45 text-slate-700",
                )}
              >
                <input
                  type="radio"
                  name="default_appointment_status"
                  value="pending"
                  defaultChecked={
                    settings.defaultAppointmentStatus !== "approved"
                  }
                  className="mt-1 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  Manual approval
                  <span className="block text-xs font-normal text-slate-500">
                    New bookings stay &ldquo;Pending&rdquo; until you approve
                    them.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              name="booking_enabled"
              type="checkbox"
              defaultChecked={settings.bookingEnabled}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Online appointments enabled
          </label>
        </FormTabPanel>

        <FormTabPanel active={activeTab === "schedule"}>
          <div className="glass-card rounded-lg p-4">
            <p className="font-semibold text-slate-950">Time zone</p>
            <p className="mt-1 text-sm text-slate-500">
              Every booking date, time slot, and &ldquo;today&rdquo; cut-off is
              calculated live against this time zone, not the server&apos;s own
              clock.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Booking system time zone">
                <select
                  name="timezone"
                  defaultValue={settings.timezone}
                  className={adminSelectClass}
                >
                  {SUPPORTED_TIMEZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Current live time">
                <div className="flex h-12 items-center rounded-lg border border-white/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 backdrop-blur sm:h-10">
                  {nowLabelInTimeZone(settings.timezone)}
                </div>
              </Field>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Start hour">
              <Input
                name="start_hour"
                type="number"
                min={0}
                max={23}
                defaultValue={settings.startHour}
              />
            </Field>
            <Field label="End hour">
              <Input
                name="end_hour"
                type="number"
                min={1}
                max={24}
                defaultValue={settings.endHour}
              />
            </Field>
            <Field label="Slot minutes">
              <Input
                name="slot_minutes"
                type="number"
                min={15}
                step={15}
                defaultValue={settings.slotMinutes}
              />
            </Field>
          </div>

          <div className="glass-card rounded-lg p-4">
            <p className="font-semibold text-slate-950">Opening days</p>
            <p className="mt-1 text-sm text-slate-500">
              Days customers can book a slot on. Unchecked days are closed
              every week, including in future months.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {weekdayOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-white/60 bg-white/45 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur"
                >
                  <input
                    name="working_days"
                    type="checkbox"
                    value={option.value}
                    defaultChecked={settings.workingDays.includes(option.value)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </FormTabPanel>

        <FormTabPanel active={activeTab === "areas"}>
          <Field label="Service areas">
            <Textarea
              name="service_areas"
              defaultValue={settings.serviceAreas.join("\n")}
            />
          </Field>
        </FormTabPanel>

        <FormTabPanel active={activeTab === "email"}>
          <div className="glass-card rounded-lg p-4">
            <p className="font-semibold text-slate-950">Email automation</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {[
                [
                  "customer_on_create",
                  "Customer created",
                  settings.emailAutomation.customerOnCreate,
                ],
                [
                  "customer_on_approve",
                  "Customer approved",
                  settings.emailAutomation.customerOnApprove,
                ],
                [
                  "customer_on_complete",
                  "Customer completed",
                  settings.emailAutomation.customerOnComplete,
                ],
                [
                  "customer_on_cancel",
                  "Customer cancelled",
                  settings.emailAutomation.customerOnCancel,
                ],
                [
                  "admin_on_create",
                  "Admin alert",
                  settings.emailAutomation.adminOnCreate,
                ],
              ].map(([name, label, checked]) => (
                <label
                  key={String(name)}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-white/60 bg-white/45 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur"
                >
                  <input
                    name={String(name)}
                    type="checkbox"
                    defaultChecked={Boolean(checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  {String(label)}
                </label>
              ))}
            </div>
          </div>
        </FormTabPanel>

        <Button
          type="submit"
          disabled={!dashboard.databaseConfigured}
          className="w-full sm:w-fit"
        >
          Save settings
        </Button>
        </form>
      )}
    </Panel>
  );
}

function ClosedTimesSettings({ dashboard }: { dashboard: AdminDashboardData }) {
  const periods = dashboard.unavailablePeriods;

  return (
    <div className="grid gap-4">
      <form
        action="/api/admin/unavailable-periods"
        method="POST"
        className="glass-card grid gap-4 rounded-lg p-4"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Title">
            <Input name="title" placeholder="Fx Closed for workshop day" />
          </Field>
          <Field label="Start date">
            <Input name="start_date" type="date" required />
          </Field>
          <Field label="End date">
            <Input name="end_date" type="date" />
          </Field>
          <Field label="Start time">
            <Input name="start_time" type="time" defaultValue="09:00" />
          </Field>
          <Field label="End time">
            <Input name="end_time" type="time" defaultValue="17:00" />
          </Field>
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-white/60 bg-white/45 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur">
            <input
              name="is_full_day"
              type="checkbox"
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            Full day closed
          </label>
        </div>
        <Button
          type="submit"
          disabled={!dashboard.databaseConfigured}
          className="w-full sm:w-fit"
        >
          <CalendarX2 className="h-4 w-4" />
          Add closed time
        </Button>
      </form>

      {periods.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {periods.map((period) => (
            <article
              key={period.id}
              className="rounded-lg border border-rose-200/80 bg-rose-50/70 p-4 text-rose-950 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{period.title}</p>
                  <p className="mt-1 text-sm font-semibold text-rose-800">
                    {period.startDate === period.endDate
                      ? formatShortDate(period.startDate)
                      : `${formatShortDate(period.startDate)} - ${formatShortDate(
                          period.endDate,
                        )}`}
                  </p>
                  <p className="mt-1 text-sm text-rose-700">
                    {period.isFullDay
                      ? "Closed all day"
                      : `${period.startTime} - ${period.endTime}`}
                  </p>
                </div>
                <CalendarX2 className="h-5 w-5 shrink-0 text-rose-500" />
              </div>
              <form
                action={`/api/admin/unavailable-periods/${period.id}/delete`}
                method="POST"
                className="mt-3"
              >
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!dashboard.databaseConfigured}
                  className="w-full border-rose-200 text-rose-700 hover:border-rose-300 hover:text-rose-800"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove closed time
                </Button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="No closed times yet." />
      )}
    </div>
  );
}

function FormTabPanel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-5", !active && "hidden")} role="tabpanel">
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "grid gap-1.5 text-sm font-semibold text-slate-700",
        className,
      )}
    >
      {label}
      {children}
    </label>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/45 px-3 py-2 backdrop-blur">
      <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/70 bg-white/40 px-4 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur">
      {text}
    </div>
  );
}
