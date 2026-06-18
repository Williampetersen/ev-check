import { randomBytes } from "crypto";
import {
  defaultSettings,
  type Appointment,
  type AppointmentStatus,
  type Customer,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";
import { sendAdminBookingEmail, sendCustomerAppointmentEmail } from "@/lib/server/mail";

export type BookingService = {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationMinutes: number;
  badge: string;
  price: number;
  imageUrl: string;
  features: string[];
};

export type BookingAddon = {
  id: string;
  label: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
};

export type BookingConfig = {
  settings: DashboardSettings;
  services: BookingService[];
  addons: BookingAddon[];
  minDate: string;
  maxDate: string;
  databaseConfigured: boolean;
};

export type BookingCreateInput = {
  serviceId: string;
  addonIds: string[];
  appointmentDate: string;
  appointmentTime: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    company?: string;
    notes?: string;
    acceptsTerms: boolean;
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
    registrationNumber: string;
    currentRange?: string;
  };
};

const id = (prefix: string) => `${prefix}_${randomBytes(8).toString("hex")}`;
const portalToken = () => randomBytes(18).toString("base64url");

const toDateKey = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
};

const todayKey = () => toDateKey(new Date());

const addDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map((item) => Number(item || 0));
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) =>
  `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;

const addMinutesToTime = (time: string, minutes: number) => minutesToTime(timeToMinutes(time) + minutes);

const sanitize = (value: unknown) => String(value ?? "").trim();
const normalizeEmail = (value: string) => sanitize(value).toLowerCase();
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const numberValue = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function normalizeBookingInput(input: unknown): BookingCreateInput {
  const payload = isObject(input) ? input : {};
  const customer = isObject(payload.customer) ? payload.customer : {};
  const vehicle = isObject(payload.vehicle) ? payload.vehicle : {};

  return {
    serviceId: sanitize(payload.serviceId),
    addonIds: Array.isArray(payload.addonIds)
      ? payload.addonIds.map((item) => sanitize(item)).filter(Boolean)
      : [],
    appointmentDate: sanitize(payload.appointmentDate),
    appointmentTime: sanitize(payload.appointmentTime).slice(0, 5),
    customer: {
      name: sanitize(customer.name),
      email: normalizeEmail(sanitize(customer.email)),
      phone: sanitize(customer.phone),
      address: sanitize(customer.address),
      postalCode: sanitize(customer.postalCode),
      city: sanitize(customer.city),
      company: sanitize(customer.company),
      notes: sanitize(customer.notes),
      acceptsTerms: customer.acceptsTerms === true,
    },
    vehicle: {
      make: sanitize(vehicle.make),
      model: sanitize(vehicle.model),
      year: sanitize(vehicle.year),
      registrationNumber: sanitize(vehicle.registrationNumber).toUpperCase(),
      currentRange: sanitize(vehicle.currentRange),
    },
  };
}

function normalizeStatus(value: string): AppointmentStatus {
  return ["pending", "approved", "completed", "cancelled"].includes(value)
    ? (value as AppointmentStatus)
    : "pending";
}

function normalizeSettings(row: any): DashboardSettings {
  return {
    companyName: sanitize(row?.company_name) || defaultSettings.companyName,
    supportEmail: sanitize(row?.support_email) || defaultSettings.supportEmail,
    adminNotifyEmail: sanitize(row?.admin_notify_email) || defaultSettings.adminNotifyEmail,
    defaultAppointmentStatus: normalizeStatus(
      sanitize(row?.default_appointment_status) || defaultSettings.defaultAppointmentStatus,
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

async function getBookingSettings() {
  if (!isDatabaseConfigured()) return defaultSettings;

  try {
    await ensureSchema({ force: true });
    const sql = getSql();
    const [settings] = await sql<any[]>`
      SELECT *
      FROM dashboard_settings
      WHERE settings_key = 'default'
      LIMIT 1
    `;
    return settings ? normalizeSettings(settings) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function formatDuration(minutes: number) {
  if (minutes <= 60) return `${minutes} min.`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} t. ${rest} min.` : `${hours} t.`;
}

function servicesForSettings(_settings: DashboardSettings) {
  return bookingServices.map((service) => {
    return {
      ...service,
      title: service.title,
      price: service.price,
      durationMinutes: service.durationMinutes,
      duration: formatDuration(service.durationMinutes),
    };
  });
}

export const bookingServices: BookingService[] = [
  {
    id: "battery-health",
    title: "Batteritest af elbil",
    description: "Fast batteritest med gennemgang af bilens batteristatus og en klar rapport.",
    duration: "15 min.",
    durationMinutes: 15,
    badge: "Fast service",
    price: 1300,
    imageUrl: "/wp/ev-car-danmark-1.png",
    features: [
      "Test af batteriets sundhed (SoH)",
      "Opladningstilstand (SoC)",
      "Celle-spændingsbalance",
      "Temperaturmåling",
      "BMS- og fejlkodekontrol",
      "PDF-rapport samme dag",
    ],
  },

];

export const bookingAddons: BookingAddon[] = [];

export async function getBookingConfig(): Promise<BookingConfig> {
  const settings = await getBookingSettings();
  const minDate = addDays(todayKey(), 1);
  return {
    settings,
    services: servicesForSettings(settings).slice(0, 1),
    addons: [],
    minDate,
    maxDate: addDays(minDate, 60),
    databaseConfigured: isDatabaseConfigured(),
  };
}

export function getBookingService(serviceId: string, services: BookingService[] = bookingServices) {
  return services.find((item) => item.id === serviceId);
}

export function getBookingAddons(addonIds: string[], addons: BookingAddon[] = bookingAddons) {
  const idSet = new Set(addonIds);
  return addons.filter((item) => idSet.has(item.id));
}

export function calculateBooking(
  input: { serviceId: string; addonIds: string[] },
  services: BookingService[] = bookingServices,
  availableAddons: BookingAddon[] = bookingAddons,
) {
  const service = getBookingService(input.serviceId, services) || services[0] || bookingServices[0];
  const addons = getBookingAddons(input.addonIds, availableAddons);
  const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  const durationMinutes =
    service.durationMinutes + addons.reduce((sum, addon) => sum + addon.durationMinutes, 0);

  return {
    service,
    addons,
    subtotal: service.price + addonTotal,
    total: service.price + addonTotal,
    durationMinutes,
  };
}

function validateDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateTime(time: string) {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hours, minutes] = time.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export async function getAvailableSlots(input: {
  date: string;
  serviceId: string;
  addonIds: string[];
}) {
  if (!validateDate(input.date)) return [];

  const config = await getBookingConfig();
  if (!config.settings.bookingEnabled) return [];
  if (!getBookingService(input.serviceId, config.services)) return [];

  const pricing = calculateBooking(input, config.services, config.addons);
  const start = config.settings.startHour * 60;
  const end = config.settings.endHour * 60;
  const interval = Math.max(15, config.settings.slotMinutes);
  const selectedDate = new Date(`${input.date}T12:00:00`);
  const weekday = selectedDate.getDay();

  if (weekday === 0) return [];
  if (input.date < addDays(todayKey(), 1) || input.date > addDays(todayKey(), 60)) return [];

  let existing: Array<{ appointment_time: string; appointment_end_time: string }> = [];
  if (isDatabaseConfigured()) {
    try {
      await ensureSchema({ force: true });
      const sql = getSql();
      existing = await sql<Array<{ appointment_time: string; appointment_end_time: string }>>`
        SELECT appointment_time, appointment_end_time
        FROM appointments
        WHERE appointment_date = ${input.date}
          AND status <> 'cancelled'
      `;
    } catch {
      existing = [];
    }
  }

  const slots: string[] = [];
  for (let minutes = start; minutes + pricing.durationMinutes <= end; minutes += interval) {
    const slot = minutesToTime(minutes);
    const slotEnd = minutes + pricing.durationMinutes;
    const hasConflict = existing.some((item) => {
      const existingStart = timeToMinutes(String(item.appointment_time || "00:00").slice(0, 5));
      const existingEnd = timeToMinutes(String(item.appointment_end_time || "").slice(0, 5) || addMinutesToTime(String(item.appointment_time || "00:00").slice(0, 5), pricing.durationMinutes));
      return minutes < existingEnd && slotEnd > existingStart;
    });
    if (!hasConflict) slots.push(slot);
  }

  return slots;
}

function validateBooking(input: BookingCreateInput, services: BookingService[]) {
  if (!input.customer.acceptsTerms) return "Du skal acceptere, at EV-Check må kontakte dig om bookingen.";
  if (!sanitize(input.customer.name)) return "Indtast dit fulde navn.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(input.customer.email))) return "Indtast en gyldig e-mailadresse.";
  if (!sanitize(input.customer.phone)) return "Indtast dit telefonnummer.";
  if (!sanitize(input.customer.address) || !sanitize(input.customer.postalCode) || !sanitize(input.customer.city)) {
    return "Indtast adressen, hvor testen skal udføres.";
  }
  if (!sanitize(input.vehicle.make) || !sanitize(input.vehicle.model)) return "Indtast bilmærke og model.";
  if (!validateDate(input.appointmentDate) || !validateTime(input.appointmentTime)) return "Vælg en ledig dato og tid.";
  if (!getBookingService(input.serviceId, services)) return "Vælg en gyldig testpakke.";
  return "";
}

export async function createBooking(input: BookingCreateInput) {
  const bookingInput = normalizeBookingInput(input);

  if (!isDatabaseConfigured()) {
    throw new Error("Bookingsystemet mangler databaseopsætning. Tilføj DATABASE_URL før rigtige bookinger kan gemmes.");
  }

  const config = await getBookingConfig();
  if (!config.settings.bookingEnabled) {
    throw new Error("Online booking er midlertidigt lukket. Kontakt EV-Check for at aftale en tid.");
  }

  const validationError = validateBooking(bookingInput, config.services);
  if (validationError) throw new Error(validationError);

  const addonIds: string[] = [];
  const pricing = calculateBooking({ serviceId: bookingInput.serviceId, addonIds }, config.services, config.addons);
  const slots = await getAvailableSlots({
    date: bookingInput.appointmentDate,
    serviceId: bookingInput.serviceId,
    addonIds,
  });
  if (!slots.includes(bookingInput.appointmentTime)) {
    throw new Error("Tiden er ikke længere ledig. Vælg venligst en anden tid.");
  }

  await ensureSchema({ force: true });
  const sql = getSql();
  const normalizedEmail = normalizeEmail(bookingInput.customer.email);
  const token = portalToken();
  const customerId = id("cus");
  const appointmentId = id("apt");
  const vehicleLabel = [bookingInput.vehicle.make, bookingInput.vehicle.model, bookingInput.vehicle.year].filter(Boolean).join(" ");
  const appointmentEndTime = addMinutesToTime(bookingInput.appointmentTime, pricing.durationMinutes);
  const customerCompany = bookingInput.customer.company || "";
  const customerNotes = bookingInput.customer.notes || "";

  const created = await sql.begin(async (tx) => {
    const [existingCustomer] = await tx<Array<{ id: string; portal_token: string | null }>>`
      SELECT id, portal_token
      FROM customers
      WHERE LOWER(email) = ${normalizedEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const finalCustomerId = existingCustomer?.id || customerId;
    const finalPortalToken = existingCustomer?.portal_token || token;

    if (existingCustomer) {
      await tx`
        UPDATE customers
        SET
          name = ${bookingInput.customer.name},
          phone = ${bookingInput.customer.phone},
          address = ${bookingInput.customer.address},
          postal_code = ${bookingInput.customer.postalCode},
          city = ${bookingInput.customer.city},
          company = ${customerCompany},
          notes = ${customerNotes},
          portal_token = ${finalPortalToken},
          updated_at = NOW()
        WHERE id = ${finalCustomerId}
      `;
    } else {
      await tx`
        INSERT INTO customers (
          id, name, email, phone, address, postal_code, city, company, notes, portal_token
        )
        VALUES (
          ${finalCustomerId}, ${bookingInput.customer.name}, ${normalizedEmail},
          ${bookingInput.customer.phone}, ${bookingInput.customer.address},
          ${bookingInput.customer.postalCode}, ${bookingInput.customer.city},
          ${customerCompany}, ${customerNotes}, ${finalPortalToken}
        )
      `;
    }

    const [appointment] = await tx<Array<{ id: string }>>`
      INSERT INTO appointments (
        id, customer_id, vehicle_label, registration_number, service_label, report_label,
        appointment_date, appointment_time, appointment_end_time, status, payment_status,
        invoice_status, total, assigned_user, area_name, admin_notes, addons_json,
        booking_payload_json, source
      )
      VALUES (
        ${appointmentId}, ${finalCustomerId}, ${vehicleLabel},
        ${bookingInput.vehicle.registrationNumber}, ${pricing.service.title},
        'Batterirapport og systemdiagnose', ${bookingInput.appointmentDate}, ${bookingInput.appointmentTime},
        ${appointmentEndTime}, ${config.settings.defaultAppointmentStatus}, 'unpaid',
        'not_requested', ${pricing.total}, '', ${bookingInput.customer.city},
        ${customerNotes}, ${tx.json(pricing.addons)},
        ${tx.json({ vehicle: bookingInput.vehicle, customer: bookingInput.customer, pricing })}, 'website'
      )
      RETURNING id
    `;

    return {
      customerId: finalCustomerId,
      portalToken: finalPortalToken,
      appointmentId: appointment.id,
    };
  });

  const customer: Customer = {
    id: created.customerId,
    name: bookingInput.customer.name,
    email: normalizedEmail,
    phone: bookingInput.customer.phone,
    address: bookingInput.customer.address,
    postalCode: bookingInput.customer.postalCode,
    city: bookingInput.customer.city,
    company: customerCompany,
    notes: customerNotes,
    portalToken: created.portalToken,
    createdAt: todayKey(),
  };

  const appointment: Appointment = {
    id: created.appointmentId,
    customerId: created.customerId,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    vehicleLabel,
    registrationNumber: bookingInput.vehicle.registrationNumber,
    serviceLabel: pricing.service.title,
    reportLabel: "Batterirapport og systemdiagnose",
    appointmentDate: bookingInput.appointmentDate,
    appointmentTime: bookingInput.appointmentTime,
    appointmentEndTime,
    status: config.settings.defaultAppointmentStatus,
    paymentStatus: "unpaid",
    invoiceStatus: "not_requested",
    invoiceNumber: "",
    total: pricing.total,
    assignedUser: "",
    areaName: customer.city,
    adminNotes: customer.notes,
    createdAt: todayKey(),
  };

  try {
    if (config.settings.emailAutomation.customerOnCreate) {
      await sendCustomerAppointmentEmail({
        customer,
        appointment,
        settings: config.settings,
        portalUrl: `${process.env.APP_URL || "https://ev-check.dk"}/kunde/${created.portalToken}`,
      });
    }
  } catch {
    // Booking is saved; email status is tracked separately when SMTP is configured.
  }

  try {
    if (config.settings.emailAutomation.adminOnCreate) {
      await sendAdminBookingEmail({
        customer,
        appointment,
        settings: config.settings,
      });
    }
  } catch {
    // Booking is saved; email status is tracked separately when SMTP is configured.
  }

  return {
    bookingId: created.appointmentId,
    portalToken: created.portalToken,
    portalUrl: `/kunde/${created.portalToken}`,
    total: pricing.total,
    appointmentLabel: `${bookingInput.appointmentDate} kl. ${bookingInput.appointmentTime}`,
    serviceLabel: pricing.service.title,
  };
}
