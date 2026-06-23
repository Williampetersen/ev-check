import {
  BarChart3,
  BatteryCharging,
  CalendarDays,
  CreditCard,
  FileText,
  ImagePlus,
  Mail,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KpiCard } from "@/components/admin/kpi-card";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import {
  formatPrice,
  formatShortDate,
  invoiceLabels,
  paymentLabels,
  statusLabels,
  type AdminDashboardData,
  type Appointment,
  type AppointmentStatus,
  type Customer,
} from "@/lib/ev-domain";
import { type BookingService } from "@/lib/server/booking-system";
import { SUPPORTED_TIMEZONES, nowLabelInTimeZone } from "@/lib/server/timezone";
import { cn } from "@/lib/utils";

export const adminSelectClass =
  "h-12 rounded-lg border border-white/70 bg-white/70 px-3 text-base font-medium text-slate-700 outline-none backdrop-blur focus:border-teal-400 focus:bg-white/85 focus:ring-4 focus:ring-teal-500/10 sm:h-10 sm:text-sm";

export function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "rose" | "teal";
}) {
  const styles = {
    amber: "border-amber-200/80 bg-amber-50/80 text-amber-800",
    rose: "border-rose-200/80 bg-rose-50/80 text-rose-700",
    teal: "border-teal-200/80 bg-teal-50/80 text-teal-700",
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50/80 text-teal-700 backdrop-blur">
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
          tone="amber"
        />
        <KpiCard
          label="Revenue"
          value={formatPrice(dashboard.stats.totalRevenue)}
          detail={`${formatPrice(dashboard.stats.outstandingRevenue)} open`}
          icon={CreditCard}
          tone="emerald"
        />
      </div>

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
                    className="h-full rounded-full bg-teal-600"
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
  return (
    <Panel
      title="Appointments"
      description="Search, filter, approve, complete, cancel, and annotate EV checks."
      icon={CalendarDays}
      action={
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                <summary className="flex h-11 cursor-pointer items-center justify-center rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 marker:content-[''] hover:border-teal-300 hover:text-teal-700">
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
          <thead className="text-xs uppercase tracking-wide text-slate-500">
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">
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
                      <summary className="cursor-pointer rounded-lg border border-white/70 bg-white/55 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur marker:content-[''] hover:border-teal-300 hover:text-teal-700">
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

      <Field label="Admin notes">
        <Textarea
          name="admin_notes"
          defaultValue={appointment.adminNotes}
          className="min-h-24"
        />
      </Field>

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
  return (
    <div className="space-y-4">
      <Panel
        title="Add service"
        description="Create a new booking service customers can choose in the booking flow."
        icon={Plus}
      >
        <form
          action="/api/admin/services"
          method="POST"
          encType="multipart/form-data"
          className="grid gap-4"
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
      </Panel>

      <Panel
        title="Services"
        description="Edit pricing, descriptions, features, and images, or remove a service."
        icon={BatteryCharging}
      >
        {services.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <article key={service.id} className="glass-card rounded-lg p-4">
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
                    <h3 className="truncate font-bold text-slate-950">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatPrice(service.price)} · {service.duration}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {service.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-teal-200/80 bg-teal-50/80 px-2.5 py-1 text-xs font-semibold text-teal-700 backdrop-blur"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <details className="mt-3">
                  <summary className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 marker:content-[''] hover:border-teal-300 hover:text-teal-700">
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
          <EmptyState text="No services yet. Add one above." />
        )}
      </Panel>
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
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
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

export function CustomersView({ dashboard }: { dashboard: AdminDashboardData }) {
  const appointmentsByCustomer = new Map<string, Appointment[]>();
  for (const appointment of dashboard.appointments) {
    appointmentsByCustomer.set(appointment.customerId, [
      ...(appointmentsByCustomer.get(appointment.customerId) || []),
      appointment,
    ]);
  }

  return (
    <Panel
      title="Customers"
      description="Customer records, portal links, and appointment history."
      icon={Users}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.customers.map((customer) => {
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
                <span className="rounded-full border border-teal-200/80 bg-teal-50/80 px-2.5 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
                  {appointments.length} checks
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {[customer.address, customer.postalCode, customer.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <a
                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900"
                href={`/kunde/${customer.portalToken || customer.id}`}
              >
                Open portal
              </a>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

export function UsersView({ dashboard }: { dashboard: AdminDashboardData }) {
  return (
    <Panel
      title="Admin users and field users"
      description="The previous agent dashboard is adapted here as EV Check service users."
      icon={User}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.users.map((user) => (
          <article key={user.id} className="glass-card rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{user.fullName}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <span className="rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 backdrop-blur">
                {user.role}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{user.workingArea}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {user.assignedServices.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-teal-200/80 bg-teal-50/80 px-2.5 py-1 text-xs font-semibold text-teal-700 backdrop-blur"
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
  return (
    <Panel
      title="Email automation"
      description="SMTP status, automation toggles, test emails, and recent delivery logs."
      icon={Mail}
    >
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
            Recent email logs
          </p>
          <div className="mt-3 grid gap-2">
            {dashboard.emailLogs.length > 0 ? (
              dashboard.emailLogs.map((email) => (
                <article
                  key={email.id}
                  className="rounded-lg border border-white/60 bg-white/45 px-3 py-2 backdrop-blur"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">
                      {email.subject}
                    </p>
                    <span className="rounded-full border border-white/70 bg-white/60 px-2.5 py-1 text-xs font-semibold text-slate-600 backdrop-blur">
                      {email.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {email.recipientRole} - {email.recipient}
                  </p>
                  {email.errorMessage ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {email.errorMessage}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <EmptyState text="No email delivery logs yet." />
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function InvoicesView({
  appointments,
  databaseConfigured,
}: {
  appointments: Appointment[];
  databaseConfigured: boolean;
}) {
  const invoiceAppointments = appointments.filter(
    (item) => item.status !== "cancelled",
  );
  return (
    <Panel
      title="Invoices"
      description="Generate receipt PDFs, inspect invoice status, and resend customer confirmations."
      icon={FileText}
    >
      {invoiceAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
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
              {invoiceAppointments.map((appointment) => (
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
                        className={cn(
                          "inline-flex h-9 items-center justify-center rounded-lg border border-teal-200 bg-white/70 px-3 text-xs font-bold text-teal-700 shadow-sm shadow-slate-900/5 transition hover:border-teal-400 hover:bg-teal-50",
                          !databaseConfigured && "pointer-events-none opacity-45",
                        )}
                        href={`/api/admin/invoices/${appointment.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View PDF
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
        <EmptyState text="No invoices yet." />
      )}
    </Panel>
  );
}

export function PaymentsView({ appointments }: { appointments: Appointment[] }) {
  const unpaid = appointments.filter(
    (item) => item.paymentStatus !== "paid" && item.status !== "cancelled",
  );
  return (
    <Panel
      title="Payments"
      description="Outstanding revenue and payment status."
      icon={CreditCard}
    >
      {unpaid.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {unpaid.map((appointment) => (
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
        <EmptyState text="No outstanding payments." />
      )}
    </Panel>
  );
}

export function SettingsView({ dashboard }: { dashboard: AdminDashboardData }) {
  const settings = dashboard.settings;
  return (
    <Panel
      title="Settings"
      description="Company, appointment, service area, and email automation settings."
      icon={Settings2}
    >
      <form action="/api/admin/settings" method="POST" className="grid gap-5">
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

        <div className="glass-card rounded-lg p-4">
          <p className="font-semibold text-slate-950">New booking approval</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose whether bookings made on the website are confirmed
            instantly, or held as &ldquo;Pending&rdquo; until an admin
            reviews them.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-3 text-sm font-semibold backdrop-blur",
                settings.defaultAppointmentStatus === "approved"
                  ? "border-teal-300 bg-teal-50/80 text-teal-800"
                  : "border-white/60 bg-white/45 text-slate-700",
              )}
            >
              <input
                type="radio"
                name="default_appointment_status"
                value="approved"
                defaultChecked={settings.defaultAppointmentStatus === "approved"}
                className="mt-1 text-teal-600 focus:ring-teal-500"
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
                  ? "border-teal-300 bg-teal-50/80 text-teal-800"
                  : "border-white/60 bg-white/45 text-slate-700",
              )}
            >
              <input
                type="radio"
                name="default_appointment_status"
                value="pending"
                defaultChecked={settings.defaultAppointmentStatus !== "approved"}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <span>
                Manual approval
                <span className="block text-xs font-normal text-slate-500">
                  New bookings stay &ldquo;Pending&rdquo; until you approve them.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="glass-card rounded-lg p-4">
          <p className="font-semibold text-slate-950">Time zone</p>
          <p className="mt-1 text-sm text-slate-500">
            Every booking date, time slot, and &ldquo;today&rdquo; cut-off is
            calculated live against this time zone, not the server&apos;s own
            clock. Summer/winter time (CEST/CET) switches are handled
            automatically &mdash; there is nothing to adjust manually when the
            clocks change.
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

        <Field label="Service areas">
          <Textarea
            name="service_areas"
            defaultValue={settings.serviceAreas.join("\n")}
          />
        </Field>

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
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {String(label)}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            name="booking_enabled"
            type="checkbox"
            defaultChecked={settings.bookingEnabled}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Online appointments enabled
        </label>

        <Button
          type="submit"
          disabled={!dashboard.databaseConfigured}
          className="w-full sm:w-fit"
        >
          Save settings
        </Button>
      </form>
    </Panel>
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
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
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
