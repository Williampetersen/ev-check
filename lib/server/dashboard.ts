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
  type Customer,
  type DashboardSettings,
  type DashboardUser,
  type EmailLog,
} from "@/lib/ev-domain";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";

const id = (prefix: string) => `${prefix}_${randomBytes(8).toString("hex")}`;

const text = (value: unknown, fallback = "") => String(value ?? fallback).trim();
const numberValue = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
    startHour: numberValue(row?.start_hour, defaultSettings.startHour),
    endHour: numberValue(row?.end_hour, defaultSettings.endHour),
    slotMinutes: numberValue(row?.slot_minutes, defaultSettings.slotMinutes),
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
  stats: buildStats(demoAppointments, demoCustomers),
  appointments: demoAppointments,
  customers: demoCustomers,
  users: demoUsers,
  emailLogs: demoEmailLogs,
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
    const [customers, appointments, users, logs, settingsRows] = await Promise.all([
      sql<any[]>`
        SELECT id, name, email, phone, address, postal_code, city, company, notes, portal_token, created_at
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

    const settings = normalizeSettings(settingsRows[0]);
    return {
      stats: buildStats(mappedAppointments, mappedCustomers),
      appointments: mappedAppointments,
      customers: mappedCustomers,
      users: mappedUsers.length > 0 ? mappedUsers : demoUsers,
      emailLogs: mappedLogs,
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
    startHour: numberValue(formData.get("start_hour"), 8),
    endHour: numberValue(formData.get("end_hour"), 18),
    slotMinutes: numberValue(formData.get("slot_minutes"), 60),
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
      booking_enabled, start_hour, end_hour, slot_minutes, service_areas_json, services_json,
      email_automation_json, updated_at
    )
    VALUES (
      'default', ${settings.companyName}, ${settings.supportEmail}, ${settings.adminNotifyEmail},
      ${settings.defaultAppointmentStatus}, ${settings.bookingEnabled}, ${settings.startHour},
      ${settings.endHour}, ${settings.slotMinutes}, ${sql.json(settings.serviceAreas)},
      ${sql.json(settings.services)}, ${sql.json(settings.emailAutomation)}, NOW()
    )
    ON CONFLICT (settings_key)
    DO UPDATE SET
      company_name = EXCLUDED.company_name,
      support_email = EXCLUDED.support_email,
      admin_notify_email = EXCLUDED.admin_notify_email,
      default_appointment_status = EXCLUDED.default_appointment_status,
      booking_enabled = EXCLUDED.booking_enabled,
      start_hour = EXCLUDED.start_hour,
      end_hour = EXCLUDED.end_hour,
      slot_minutes = EXCLUDED.slot_minutes,
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
