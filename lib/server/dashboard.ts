import { randomBytes } from "crypto";
import {
  buildStats,
  defaultSettings,
  demoAppointments,
  demoCustomers,
  demoEmailLogs,
  demoUsers,
  type AdminDashboardData,
  type Appointment,
  type AppointmentStatus,
  type BookingUnavailablePeriod,
  type Customer,
  type DashboardSettings,
  type DashboardUser,
  type EmailLog,
  type InvoiceStatus,
  type PaymentStatus,
} from "@/lib/ev-domain";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";
import { resolveTimeZone, todayKeyInTimeZone } from "@/lib/server/timezone";

const id = (prefix: string) => `${prefix}_${randomBytes(8).toString("hex")}`;

const text = (value: unknown, fallback = "") => String(value ?? fallback).trim();
const numberValue = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const dateKey = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return text(value).slice(0, 10);
};

function normalizeStatus(value: string): AppointmentStatus {
  return ["pending", "approved", "completed", "cancelled"].includes(value)
    ? (value as AppointmentStatus)
    : "pending";
}

function normalizeSettings(row: any): DashboardSettings {
  return {
    companyName: text(row?.company_name, defaultSettings.companyName),
    supportEmail: text(row?.support_email, defaultSettings.supportEmail),
    adminNotifyEmail: text(row?.admin_notify_email, defaultSettings.adminNotifyEmail),
    defaultAppointmentStatus: normalizeStatus(
      text(row?.default_appointment_status, defaultSettings.defaultAppointmentStatus),
    ),
    bookingEnabled: Boolean(row?.booking_enabled ?? defaultSettings.bookingEnabled),
    timezone: resolveTimeZone(row?.timezone ?? defaultSettings.timezone),
    startHour: numberValue(row?.start_hour, defaultSettings.startHour),
    endHour: numberValue(row?.end_hour, defaultSettings.endHour),
    slotMinutes: numberValue(row?.slot_minutes, defaultSettings.slotMinutes),
    workingDays:
      Array.isArray(row?.working_days_json) && row.working_days_json.length > 0
        ? row.working_days_json
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isInteger(value) && value >= 0 && value <= 6)
        : defaultSettings.workingDays,
    serviceAreas: Array.isArray(row?.service_areas_json)
      ? row.service_areas_json
      : defaultSettings.serviceAreas,
    services: Array.isArray(row?.services_json) ? row.services_json : defaultSettings.services,
    emailAutomation:
      row?.email_automation_json && typeof row.email_automation_json === "object"
        ? { ...defaultSettings.emailAutomation, ...row.email_automation_json }
        : defaultSettings.emailAutomation,
  };
}

const demoDashboard = (databaseError?: string): AdminDashboardData => ({
  stats: buildStats(
    demoAppointments,
    demoCustomers,
    todayKeyInTimeZone(defaultSettings.timezone),
  ),
  appointments: demoAppointments,
  customers: demoCustomers,
  users: demoUsers,
  emailLogs: demoEmailLogs,
  unavailablePeriods: [],
  settings: defaultSettings,
  databaseConfigured: isDatabaseConfigured(),
  databaseError,
});

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!isDatabaseConfigured()) {
    return demoDashboard();
  }

  try {
    await ensureSchema({ force: true });
    const sql = getSql();
    const [customers, appointments, users, logs, unavailablePeriods, settingsRows] = await Promise.all([
      sql<any[]>`
        SELECT id, name, email, phone, address, postal_code, city, company, cvr, notes, portal_token, created_at
        FROM customers
        ORDER BY created_at DESC
      `,
      sql<any[]>`
        SELECT a.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
        FROM appointments a
        JOIN customers c ON c.id = a.customer_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `,
      sql<any[]>`
        SELECT id, full_name, email, phone, role, status, assigned_services_json, working_area
        FROM dashboard_users
        ORDER BY full_name ASC
      `,
      sql<any[]>`
        SELECT id, appointment_id, customer_id, recipient, recipient_role, template_key, subject,
               status, error_message, sent_at, created_at
        FROM email_logs
        ORDER BY created_at DESC
        LIMIT 80
      `,
      sql<any[]>`
        SELECT id, title, start_date, end_date, start_time, end_time, is_full_day
        FROM booking_unavailable_periods
        ORDER BY start_date ASC, start_time ASC, created_at ASC
      `,
      sql<any[]>`
        SELECT *
        FROM dashboard_settings
        WHERE settings_key = 'default'
        LIMIT 1
      `,
    ]);

    const mappedCustomers: Customer[] = customers.map((row) => ({
      id: row.id,
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      address: row.address || "",
      postalCode: row.postal_code || "",
      city: row.city || "",
      company: row.company || "",
      cvr: row.cvr || "",
      notes: row.notes || "",
      portalToken: row.portal_token || "",
      createdAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : "",
    }));

    const mappedAppointments: Appointment[] = appointments.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name || "",
      customerEmail: row.customer_email || "",
      customerPhone: row.customer_phone || "",
      vehicleLabel: row.vehicle_label || "",
      registrationNumber: row.registration_number || "",
      serviceLabel: row.service_label || "",
      reportLabel: row.report_label || "",
      appointmentDate: row.appointment_date
        ? new Date(row.appointment_date).toISOString().slice(0, 10)
        : "",
      appointmentTime: row.appointment_time || "",
      appointmentEndTime: row.appointment_end_time || "",
      status: normalizeStatus(row.status),
      paymentStatus: row.payment_status || "unpaid",
      invoiceStatus: row.invoice_status || "not_requested",
      invoiceNumber: row.invoice_number || "",
      total: Number(row.total || 0),
      assignedUser: row.assigned_user || "Unassigned",
      areaName: row.area_name || "",
      adminNotes: row.admin_notes || "",
      createdAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : "",
      customerType: row.customer_type === "business" ? "business" : "private",
      groupId: row.booking_group_id || "",
      discountPercent: Number(row.discount_percent || 0),
    }));

    const mappedUsers: DashboardUser[] = users.map((row) => ({
      id: row.id,
      fullName: row.full_name || "",
      email: row.email || "",
      phone: row.phone || "",
      role: row.role === "admin" ? "admin" : "inspector",
      status: row.status === "inactive" ? "inactive" : "active",
      assignedServices: Array.isArray(row.assigned_services_json) ? row.assigned_services_json : [],
      workingArea: row.working_area || "",
    }));

    const mappedLogs: EmailLog[] = logs.map((row) => ({
      id: row.id,
      appointmentId: row.appointment_id || "",
      customerId: row.customer_id || "",
      recipient: row.recipient || "",
      recipientRole:
        row.recipient_role === "admin" || row.recipient_role === "user"
          ? row.recipient_role
          : "customer",
      templateKey: row.template_key || "",
      subject: row.subject || "",
      status: row.status || "pending",
      errorMessage: row.error_message || "",
      sentAt: row.sent_at ? new Date(row.sent_at).toISOString().slice(0, 10) : "",
      createdAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : "",
    }));

    const mappedUnavailablePeriods: BookingUnavailablePeriod[] =
      unavailablePeriods.map((row) => {
        const startDate = dateKey(row.start_date);
        return {
          id: row.id,
          title: row.title || "Closed",
          startDate,
          endDate: dateKey(row.end_date) || startDate,
          startTime: String(row.start_time || "00:00").slice(0, 5),
          endTime: String(row.end_time || "23:59").slice(0, 5),
          isFullDay: Boolean(row.is_full_day),
        };
      });

    const settings = normalizeSettings(settingsRows[0]);
    return {
      stats: buildStats(
        mappedAppointments,
        mappedCustomers,
        todayKeyInTimeZone(settings.timezone),
      ),
      appointments: mappedAppointments,
      customers: mappedCustomers,
      users: mappedUsers.length > 0 ? mappedUsers : demoUsers,
      emailLogs: mappedLogs,
      unavailablePeriods: mappedUnavailablePeriods,
      settings,
      databaseConfigured: true,
    };
  } catch (error) {
    return demoDashboard(error instanceof Error ? error.message : String(error));
  }
}

export async function getCustomerDashboardByToken(token: string) {
  const dashboard = await getAdminDashboardData();
  const customer =
    dashboard.customers.find((item) => item.portalToken === token) ||
    dashboard.customers.find((item) => item.id === token);
  if (!customer) return null;

  return {
    customer,
    appointments: dashboard.appointments.filter((item) => item.customerId === customer.id),
    settings: dashboard.settings,
    databaseConfigured: dashboard.databaseConfigured,
  };
}

export async function getCustomerDashboardByEmail(email: string) {
  const dashboard = await getAdminDashboardData();
  const customer = dashboard.customers.find(
    (item) => item.email.toLowerCase() === email.toLowerCase(),
  );
  if (!customer) return null;
  return getCustomerDashboardByToken(customer.portalToken || customer.id);
}

export async function getUserDashboard(email: string) {
  const dashboard = await getAdminDashboardData();
  const user = dashboard.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  return {
    user: user || dashboard.users[0],
    appointments: dashboard.appointments.filter(
      (item) =>
        item.assignedUser.toLowerCase() === (user?.fullName || dashboard.users[0]?.fullName || "").toLowerCase(),
    ),
    settings: dashboard.settings,
  };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  notes: string,
) {
  if (!isDatabaseConfigured()) return;
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`
    UPDATE appointments
    SET status = ${status}, admin_notes = ${notes}, updated_at = NOW()
    WHERE id = ${appointmentId}
  `;
}

export async function updateAppointmentDetails(
  appointmentId: string,
  input: {
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    invoiceStatus: InvoiceStatus;
    appointmentDate: string;
    appointmentTime: string;
    appointmentEndTime: string;
    serviceLabel: string;
    vehicleLabel: string;
    registrationNumber: string;
    total: number;
    assignedUser: string;
    areaName: string;
    adminNotes: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
      postalCode: string;
      city: string;
      company: string;
      notes: string;
    };
  },
) {
  if (!isDatabaseConfigured()) return;
  await ensureSchema({ force: true });
  const sql = getSql();

  const [appointmentRow] = await sql<Array<{ customer_id: string }>>`
    SELECT customer_id FROM appointments WHERE id = ${appointmentId} LIMIT 1
  `;
  if (!appointmentRow) throw new Error("Booking was not found.");

  await sql`
    UPDATE customers
    SET
      name = ${input.customer.name},
      email = ${input.customer.email},
      phone = ${input.customer.phone},
      address = ${input.customer.address},
      postal_code = ${input.customer.postalCode},
      city = ${input.customer.city},
      company = ${input.customer.company},
      notes = ${input.customer.notes},
      updated_at = NOW()
    WHERE id = ${appointmentRow.customer_id}
  `;

  await sql`
    UPDATE appointments
    SET
      status = ${input.status},
      payment_status = ${input.paymentStatus},
      invoice_status = ${input.invoiceStatus},
      appointment_date = ${input.appointmentDate},
      appointment_time = ${input.appointmentTime},
      appointment_end_time = ${input.appointmentEndTime},
      service_label = ${input.serviceLabel},
      vehicle_label = ${input.vehicleLabel},
      registration_number = ${input.registrationNumber},
      total = ${input.total},
      assigned_user = ${input.assignedUser},
      area_name = ${input.areaName},
      admin_notes = ${input.adminNotes},
      updated_at = NOW()
    WHERE id = ${appointmentId}
  `;
}

export async function saveDashboardSettings(formData: FormData) {
  if (!isDatabaseConfigured()) return;
  await ensureSchema({ force: true });
  const sql = getSql();

  const settings = {
    companyName: text(formData.get("company_name"), defaultSettings.companyName),
    supportEmail: text(formData.get("support_email"), defaultSettings.supportEmail),
    adminNotifyEmail: text(formData.get("admin_notify_email"), ""),
    defaultAppointmentStatus: normalizeStatus(text(formData.get("default_appointment_status"), "pending")),
    bookingEnabled: Boolean(formData.get("booking_enabled")),
    timezone: resolveTimeZone(formData.get("timezone")),
    startHour: numberValue(formData.get("start_hour"), 8),
    endHour: numberValue(formData.get("end_hour"), 18),
    slotMinutes: numberValue(formData.get("slot_minutes"), 60),
    workingDays: formData.getAll("working_days").length > 0
      ? formData
          .getAll("working_days")
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
      : defaultSettings.workingDays,
    serviceAreas: text(formData.get("service_areas"), "")
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean),
    services: defaultSettings.services,
    emailAutomation: {
      customerOnCreate: Boolean(formData.get("customer_on_create")),
      customerOnApprove: Boolean(formData.get("customer_on_approve")),
      customerOnComplete: Boolean(formData.get("customer_on_complete")),
      customerOnCancel: Boolean(formData.get("customer_on_cancel")),
      adminOnCreate: Boolean(formData.get("admin_on_create")),
    },
  };

  await sql`
    INSERT INTO dashboard_settings (
      settings_key, company_name, support_email, admin_notify_email, default_appointment_status,
      booking_enabled, timezone, start_hour, end_hour, slot_minutes, working_days_json, service_areas_json, services_json,
      email_automation_json, updated_at
    )
    VALUES (
      'default', ${settings.companyName}, ${settings.supportEmail}, ${settings.adminNotifyEmail},
      ${settings.defaultAppointmentStatus}, ${settings.bookingEnabled}, ${settings.timezone},
      ${settings.startHour}, ${settings.endHour}, ${settings.slotMinutes}, ${sql.json(settings.workingDays)},
      ${sql.json(settings.serviceAreas)},
      ${sql.json(settings.services)}, ${sql.json(settings.emailAutomation)}, NOW()
    )
    ON CONFLICT (settings_key)
    DO UPDATE SET
      company_name = EXCLUDED.company_name,
      support_email = EXCLUDED.support_email,
      admin_notify_email = EXCLUDED.admin_notify_email,
      default_appointment_status = EXCLUDED.default_appointment_status,
      booking_enabled = EXCLUDED.booking_enabled,
      timezone = EXCLUDED.timezone,
      start_hour = EXCLUDED.start_hour,
      end_hour = EXCLUDED.end_hour,
      slot_minutes = EXCLUDED.slot_minutes,
      working_days_json = EXCLUDED.working_days_json,
      service_areas_json = EXCLUDED.service_areas_json,
      services_json = EXCLUDED.services_json,
      email_automation_json = EXCLUDED.email_automation_json,
      updated_at = NOW()
  `;
}

export async function recordEmailLog(input: {
  appointmentId?: string;
  customerId?: string;
  recipient: string;
  recipientRole: EmailLog["recipientRole"];
  templateKey: string;
  subject: string;
  status: EmailLog["status"];
  errorMessage?: string;
}) {
  if (!isDatabaseConfigured()) return;
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`
    INSERT INTO email_logs (
      id, appointment_id, customer_id, recipient, recipient_role, template_key,
      subject, status, error_message, sent_at
    )
    VALUES (
      ${id("mail")}, ${input.appointmentId || null}, ${input.customerId || null},
      ${input.recipient}, ${input.recipientRole}, ${input.templateKey}, ${input.subject},
      ${input.status}, ${input.errorMessage || ""}, ${input.status === "sent" ? new Date() : null}
    )
  `;
}
