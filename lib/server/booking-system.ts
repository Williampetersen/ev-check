import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import {
  defaultSettings,
  OTHER_MODEL_SUFFIX,
  type Appointment,
  type AppointmentStatus,
  type BookingUnavailablePeriod,
  type Customer,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { erhvervDiscountPercent, siteUrl } from "@/lib/seo";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";
import { ensureInvoiceRecord } from "@/lib/server/invoices";
import {
  sendAdminBookingEmail,
  sendAdminErhvervBookingEmail,
  sendCustomerAppointmentEmail,
  sendCustomerErhvervBookingEmail,
} from "@/lib/server/mail";
import {
  nowMinutesInTimeZone,
  resolveTimeZone,
  todayKeyInTimeZone,
} from "@/lib/server/timezone";

export type BookingService = {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
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

export type CarModelOption = {
  id: string;
  label: string;
};

export type CarBrand = {
  id: string;
  label: string;
  logo: string;
  models: CarModelOption[];
};

export type BookingConfig = {
  settings: DashboardSettings;
  services: BookingService[];
  addons: BookingAddon[];
  carBrands: CarBrand[];
  unavailablePeriods: BookingUnavailablePeriod[];
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
    model?: string;
    year?: string;
    registrationNumber?: string;
    currentRange?: string;
  };
};

export type ErhvervBookingCreateInput = {
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    company: string;
    cvr: string;
    notes?: string;
    acceptsTerms: boolean;
  };
  vehicles: Array<{ make: string }>;
};

const id = (prefix: string) => `${prefix}_${randomBytes(8).toString("hex")}`;
const portalToken = () => randomBytes(18).toString("base64url");

// Pure calendar math on a "YYYY-MM-DD" key, done in UTC so the result never
// depends on the host machine's local timezone setting.
const toDateKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;

const addMonths = (dateKey: string, months: number) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return toDateKey(new Date(Date.UTC(year, month - 1 + months, day)));
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map((item) => Number(item || 0));
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) =>
  `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;

const addMinutesToTime = (time: string, minutes: number) =>
  minutesToTime(timeToMinutes(time) + minutes);

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

function normalizeErhvervBookingInput(input: unknown): ErhvervBookingCreateInput {
  const payload = isObject(input) ? input : {};
  const customer = isObject(payload.customer) ? payload.customer : {};
  const vehicles = Array.isArray(payload.vehicles) ? payload.vehicles : [];

  return {
    serviceId: sanitize(payload.serviceId),
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
      cvr: sanitize(customer.cvr).replace(/\s+/g, ""),
      notes: sanitize(customer.notes),
      acceptsTerms: customer.acceptsTerms === true,
    },
    vehicles: vehicles
      .filter(isObject)
      .map((vehicle) => ({ make: sanitize(vehicle.make) }))
      .filter((vehicle) => vehicle.make.length > 0)
      .slice(0, 50),
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
    adminNotifyEmail:
      sanitize(row?.admin_notify_email) || defaultSettings.adminNotifyEmail,
    defaultAppointmentStatus: normalizeStatus(
      sanitize(row?.default_appointment_status) ||
        defaultSettings.defaultAppointmentStatus,
    ),
    bookingEnabled: Boolean(
      row?.booking_enabled ?? defaultSettings.bookingEnabled,
    ),
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
    services: Array.isArray(row?.services_json)
      ? row.services_json
      : defaultSettings.services,
    emailAutomation:
      row?.email_automation_json &&
      typeof row.email_automation_json === "object"
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

export const bookingServices: BookingService[] = [
  {
    id: "battery-health",
    title: "Batteritest af elbil",
    description:
      "Fast batteritest med gennemgang af bilens batteristatus og en klar rapport.",
    duration: "15 min.",
    durationMinutes: 15,
    bufferBeforeMinutes: 60,
    bufferAfterMinutes: 0,
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

function mapServiceRow(row: any): BookingService {
  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    durationMinutes: Number(row.duration_minutes || 0),
    duration: formatDuration(Number(row.duration_minutes || 0)),
    bufferBeforeMinutes: Math.max(0, Number(row.buffer_before_minutes ?? 60)),
    bufferAfterMinutes: Math.max(0, Number(row.buffer_after_minutes ?? 0)),
    badge: row.badge || "",
    price: Number(row.price || 0),
    imageUrl: row.image_data || "",
    features: Array.isArray(row.features_json) ? row.features_json : [],
  };
}

export async function getAllBookingServices(): Promise<BookingService[]> {
  if (!isDatabaseConfigured()) return bookingServices;

  try {
    await ensureSchema({ force: true });
    const sql = getSql();
    const rows = await sql<any[]>`
      SELECT *
      FROM booking_services
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows.length > 0 ? rows.map(mapServiceRow) : bookingServices;
  } catch {
    return bookingServices;
  }
}

export async function createBookingServiceRecord(input: {
  title: string;
  description: string;
  badge: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  price: number;
  imageData: string;
  features: string[];
}) {
  if (!isDatabaseConfigured()) {
    throw new Error("Bookingsystemet mangler databaseopsætning.");
  }
  await ensureSchema({ force: true });
  const sql = getSql();
  const [{ next_order }] = await sql<Array<{ next_order: number }>>`
    SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM booking_services
  `;
  const serviceId = id("svc");
  await sql`
    INSERT INTO booking_services (
      id, title, description, badge, duration_minutes, buffer_before_minutes,
      buffer_after_minutes, price, image_data, features_json, sort_order
    )
    VALUES (
      ${serviceId}, ${input.title}, ${input.description}, ${input.badge},
      ${input.durationMinutes}, ${Math.max(0, input.bufferBeforeMinutes)},
      ${Math.max(0, input.bufferAfterMinutes)}, ${input.price}, ${input.imageData},
      ${sql.json(input.features)}, ${next_order}
    )
  `;
  return serviceId;
}

export async function updateBookingServiceRecord(
  serviceId: string,
  input: {
    title: string;
    description: string;
    badge: string;
    durationMinutes: number;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    price: number;
    imageData: string | null;
    features: string[];
  },
) {
  if (!isDatabaseConfigured()) {
    throw new Error("Bookingsystemet mangler databaseopsætning.");
  }
  await ensureSchema({ force: true });
  const sql = getSql();
  if (input.imageData === null) {
    await sql`
      UPDATE booking_services
      SET title = ${input.title}, description = ${input.description}, badge = ${
      input.badge
    },
          duration_minutes = ${input.durationMinutes},
          buffer_before_minutes = ${Math.max(0, input.bufferBeforeMinutes)},
          buffer_after_minutes = ${Math.max(0, input.bufferAfterMinutes)},
          price = ${input.price},
          features_json = ${sql.json(input.features)}, updated_at = NOW()
      WHERE id = ${serviceId}
    `;
  } else {
    await sql`
      UPDATE booking_services
      SET title = ${input.title}, description = ${input.description}, badge = ${
      input.badge
    },
          duration_minutes = ${input.durationMinutes},
          buffer_before_minutes = ${Math.max(0, input.bufferBeforeMinutes)},
          buffer_after_minutes = ${Math.max(0, input.bufferAfterMinutes)},
          price = ${input.price},
          image_data = ${input.imageData}, features_json = ${sql.json(
      input.features,
    )},
          updated_at = NOW()
      WHERE id = ${serviceId}
    `;
  }
}

export async function deleteBookingServiceRecord(serviceId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error("Bookingsystemet mangler databaseopsætning.");
  }
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`DELETE FROM booking_services WHERE id = ${serviceId}`;
}

function rowDateKey(value: unknown) {
  if (value instanceof Date) return toDateKey(value);
  return sanitize(value).slice(0, 10);
}

function mapUnavailablePeriodRow(row: any): BookingUnavailablePeriod {
  const startDate = rowDateKey(row.start_date);
  const endDate = rowDateKey(row.end_date) || startDate;
  return {
    id: row.id,
    title: sanitize(row.title) || "Closed",
    startDate,
    endDate,
    startTime: sanitize(row.start_time).slice(0, 5) || "00:00",
    endTime: sanitize(row.end_time).slice(0, 5) || "23:59",
    isFullDay: Boolean(row.is_full_day),
  };
}

export async function getUnavailablePeriods(): Promise<
  BookingUnavailablePeriod[]
> {
  if (!isDatabaseConfigured()) return [];

  try {
    await ensureSchema({ force: true });
    const sql = getSql();
    const rows = await sql<any[]>`
      SELECT id, title, start_date, end_date, start_time, end_time, is_full_day
      FROM booking_unavailable_periods
      ORDER BY start_date ASC, start_time ASC, created_at ASC
    `;
    return rows.map(mapUnavailablePeriodRow);
  } catch {
    return [];
  }
}

export async function createUnavailablePeriodRecord(input: {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isFullDay: boolean;
}) {
  if (!isDatabaseConfigured()) {
    throw new Error("Bookingsystemet mangler databaseopsÃ¦tning.");
  }

  let startDate = sanitize(input.startDate).slice(0, 10);
  let endDate = sanitize(input.endDate).slice(0, 10) || startDate;
  if (!validateDate(startDate) || !validateDate(endDate)) {
    throw new Error("VÃ¦lg en gyldig lukket dato.");
  }
  if (endDate < startDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  const isFullDay = Boolean(input.isFullDay);
  const startTime = isFullDay
    ? "00:00"
    : sanitize(input.startTime).slice(0, 5) || "00:00";
  const endTime = isFullDay
    ? "23:59"
    : sanitize(input.endTime).slice(0, 5) || "23:59";
  if (!validateTime(startTime) || !validateTime(endTime)) {
    throw new Error("VÃ¦lg et gyldigt lukket tidsrum.");
  }
  if (!isFullDay && timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new Error("Sluttidspunktet skal vÃ¦re efter starttidspunktet.");
  }

  await ensureSchema({ force: true });
  const sql = getSql();
  const periodId = id("off");
  await sql`
    INSERT INTO booking_unavailable_periods (
      id, title, start_date, end_date, start_time, end_time, is_full_day
    )
    VALUES (
      ${periodId}, ${sanitize(input.title) || "Closed"}, ${startDate},
      ${endDate}, ${startTime}, ${endTime}, ${isFullDay}
    )
  `;
  return periodId;
}

export async function deleteUnavailablePeriodRecord(periodId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error("Bookingsystemet mangler databaseopsÃ¦tning.");
  }
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`DELETE FROM booking_unavailable_periods WHERE id = ${periodId}`;
}

// The most popular EV brands sold in Denmark, with their current EV model
// lineups. Logos are optional: any brand without a matching file in
// public/bilbrands/ simply falls back to a generic car icon in the UI.
const evBrandData: Array<{ id: string; label: string; models: string[] }> = [
  { id: "tesla", label: "Tesla", models: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] },
  { id: "vw", label: "Volkswagen", models: ["ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz", "Golf eHybrid", "Tiguan eHybrid", "Passat eHybrid"] },
  { id: "bmw", label: "BMW", models: ["i3", "i4", "iX1", "iX2", "iX3", "iX", "i7", "330e", "X1 xDrive25e", "X3 xDrive30e", "530e"] },
  { id: "audi", label: "Audi", models: ["Q4 e-tron", "Q6 e-tron", "A6 e-tron", "e-tron GT", "Q8 e-tron", "A3 TFSI e", "Q3 TFSI e", "Q5 TFSI e"] },
  { id: "mercedes", label: "Mercedes-Benz", models: ["EQA", "EQB", "EQC", "EQE", "EQS", "C 300 e", "E 300 e", "GLC 300 e"] },
  { id: "skoda", label: "Skoda", models: ["Enyaq", "Enyaq Coupé", "Elroq", "Octavia iV", "Superb iV"] },
  { id: "volvo", label: "Volvo", models: ["EX30", "EX40", "EC40", "EX90", "XC60 Recharge", "XC90 Recharge", "S60 Recharge"] },
  { id: "polestar", label: "Polestar", models: ["Polestar 2", "Polestar 3", "Polestar 4"] },
  { id: "kia", label: "Kia", models: ["Niro EV", "EV3", "EV6", "EV9", "Soul EV", "Niro Hybrid", "Sportage Hybrid", "Ceed Hybrid"] },
  { id: "hyundai", label: "Hyundai", models: ["Kona Electric", "Ioniq 5", "Ioniq 6", "Ioniq 9", "Kona Hybrid", "Tucson Hybrid", "Santa Fe Hybrid"] },
  { id: "byd", label: "BYD", models: ["Atto 3", "Dolphin", "Seal", "Tang", "Han", "Seal U DM-i"] },
  { id: "renault", label: "Renault", models: ["Zoe", "Megane E-Tech", "Scenic E-Tech", "5 E-Tech", "Clio Hybrid", "Captur Hybrid", "Austral Hybrid"] },
  { id: "peugeot", label: "Peugeot", models: ["e-208", "e-2008", "e-308", "e-3008", "208 Hybrid", "2008 Hybrid", "308 Hybrid", "408 Hybrid", "3008 Hybrid", "508 Hybrid"] },
  { id: "citroen", label: "Citroën", models: ["ë-C4", "ë-C3", "ë-Berlingo", "C4 Hybrid", "C5 Aircross Hybrid", "C5 X Hybrid"] },
  { id: "cupra", label: "Cupra", models: ["Born", "Tavascan", "Leon eHybrid", "Formentor eHybrid"] },
  { id: "opel", label: "Opel", models: ["Corsa Electric", "Astra Electric", "Mokka Electric", "Grandland Electric", "Astra Hybrid", "Grandland Hybrid"] },
  { id: "ford", label: "Ford", models: ["Mustang Mach-E", "Explorer", "Puma Gen-E", "Puma Hybrid", "Kuga Hybrid", "Focus Hybrid"] },
  { id: "toyota", label: "Toyota", models: ["bZ4X", "Corolla Cross EV", "Yaris Hybrid", "Corolla Hybrid", "C-HR Hybrid", "RAV4 Hybrid", "Camry Hybrid", "Prius Hybrid"] },
  { id: "nissan", label: "Nissan", models: ["Leaf", "Ariya", "Qashqai e-Power", "X-Trail e-Power"] },
  { id: "mg", label: "MG", models: ["MG4", "MG5", "ZS EV", "Marvel R", "MG3 Hybrid+", "HS PHEV"] },
  { id: "porsche", label: "Porsche", models: ["Taycan", "Macan Electric", "Cayenne E-Hybrid", "Panamera E-Hybrid"] },
  { id: "fiat", label: "Fiat", models: ["500e", "Panda Electric", "500 Hybrid", "Panda Hybrid", "Tipo Hybrid"] },
  { id: "mini", label: "MINI", models: ["Cooper Electric", "Aceman", "Countryman Electric", "Countryman SE"] },
  { id: "honda", label: "Honda", models: ["e:Ny1", "Civic e:HEV", "Jazz e:HEV", "CR-V Hybrid", "HR-V Hybrid"] },
  { id: "mazda", label: "Mazda", models: ["MX-30", "MX-30 R-EV", "CX-60 PHEV", "Mazda2 Hybrid"] },
  { id: "jaguar", label: "Jaguar", models: ["I-Pace"] },
  { id: "landrover", label: "Land Rover", models: ["Range Rover Electric", "Range Rover P400e", "Range Rover Sport PHEV", "Defender P400e"] },
  { id: "smart", label: "Smart", models: ["#1", "#3"] },
  { id: "dacia", label: "Dacia", models: ["Spring", "Jogger Hybrid", "Duster Hybrid"] },
  { id: "lexus", label: "Lexus", models: ["UX 300e", "RZ", "UX 250h", "NX 350h", "RX 450h+", "ES 300h"] },
  { id: "alfaromeo", label: "Alfa Romeo", models: ["Junior Elettrica", "Junior Hybrid"] },
  { id: "chevrolet", label: "Chevrolet", models: ["Bolt EV", "Volt"] },
  { id: "genesis", label: "Genesis", models: ["GV60", "Electrified GV70", "Electrified G80"] },
  { id: "jeep", label: "Jeep", models: ["Avenger Electric", "Avenger Hybrid", "Compass 4xe", "Renegade 4xe"] },
  { id: "mitsubishi", label: "Mitsubishi", models: ["Eclipse Cross PHEV", "Outlander PHEV"] },
  { id: "suzuki", label: "Suzuki", models: ["e-Vitara", "Across PHEV", "Swace Hybrid"] },
];

const OTHER_BRAND_ID = "other";
export { OTHER_MODEL_SUFFIX };

function findBrandLogo(id: string): string {
  const dir = path.join(process.cwd(), "public", "bilbrands");
  const extensions = ["png", "jpg", "jpeg", "svg", "webp"];
  for (const ext of extensions) {
    try {
      if (fs.existsSync(path.join(dir, `${id}.${ext}`))) {
        return `/bilbrands/${id}.${ext}`;
      }
    } catch {
      // Filesystem not readable (e.g. some serverless environments); fall
      // through to the next extension / generic icon fallback in the UI.
    }
  }
  return "";
}

export function getCarBrands(): CarBrand[] {
  const brands: CarBrand[] = evBrandData
    .map((brand) => ({
      id: brand.id,
      label: brand.label,
      logo: findBrandLogo(brand.id),
      models: [
        ...brand.models.map((label, index) => ({
          id: `${brand.id}-${index}`,
          label,
        })),
        { id: `${brand.id}${OTHER_MODEL_SUFFIX}`, label: "Andet model / ikke på listen" },
      ],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [
    ...brands,
    {
      id: OTHER_BRAND_ID,
      label: "Andet bilmærke / ikke på listen",
      logo: "",
      models: [],
    },
  ];
}

export async function getBookingConfig(): Promise<BookingConfig> {
  const settings = await getBookingSettings();
  const minDate = todayKeyInTimeZone(settings.timezone);
  const [services, unavailablePeriods] = await Promise.all([
    getAllBookingServices(),
    getUnavailablePeriods(),
  ]);
  return {
    settings,
    services,
    addons: [],
    carBrands: getCarBrands(),
    unavailablePeriods,
    minDate,
    maxDate: addMonths(minDate, 6),
    databaseConfigured: isDatabaseConfigured(),
  };
}

export function getBookingService(
  serviceId: string,
  services: BookingService[] = bookingServices,
) {
  return services.find((item) => item.id === serviceId);
}

export function getBookingAddons(
  addonIds: string[],
  addons: BookingAddon[] = bookingAddons,
) {
  const idSet = new Set(addonIds);
  return addons.filter((item) => idSet.has(item.id));
}

export function calculateBooking(
  input: { serviceId: string; addonIds: string[] },
  services: BookingService[] = bookingServices,
  availableAddons: BookingAddon[] = bookingAddons,
) {
  const service =
    getBookingService(input.serviceId, services) ||
    services[0] ||
    bookingServices[0];
  const addons = getBookingAddons(input.addonIds, availableAddons);
  const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  const durationMinutes =
    service.durationMinutes +
    addons.reduce((sum, addon) => sum + addon.durationMinutes, 0);

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

function validatePhone(phone: string) {
  const digits = sanitize(phone).replace(/[\s-]/g, "");
  return /^\+?\d{8,12}$/.test(digits);
}

function minutesValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function rangesOverlap(
  start: number,
  end: number,
  otherStart: number,
  otherEnd: number,
) {
  return start < otherEnd && end > otherStart;
}

function unavailableIntervalsForDate(
  periods: BookingUnavailablePeriod[],
  date: string,
) {
  return periods
    .filter((period) => {
      const startDate = period.startDate;
      const endDate = period.endDate || period.startDate;
      return date >= startDate && date <= endDate;
    })
    .map((period) => {
      if (period.isFullDay) return { start: 0, end: 24 * 60, period };
      const start = Math.max(0, Math.min(24 * 60, timeToMinutes(period.startTime)));
      const end = Math.max(0, Math.min(24 * 60, timeToMinutes(period.endTime)));
      return { start, end, period };
    })
    .filter((interval) => interval.end > interval.start);
}

export async function getAvailableSlots(input: {
  date: string;
  serviceId: string;
  addonIds: string[];
}) {
  if (!validateDate(input.date)) return [];

  const config = await getBookingConfig();
  if (!config.settings.bookingEnabled) return [];
  const selectedService = getBookingService(input.serviceId, config.services);
  if (!selectedService) return [];

  const pricing = calculateBooking(input, config.services, config.addons);
  const requestedBufferBefore = minutesValue(
    selectedService.bufferBeforeMinutes,
    60,
  );
  const requestedBufferAfter = minutesValue(selectedService.bufferAfterMinutes);
  const start = config.settings.startHour * 60;
  const end = config.settings.endHour * 60;
  const interval = Math.max(15, config.settings.slotMinutes);
  const [selectedYear, selectedMonth, selectedDay] = input.date
    .split("-")
    .map(Number);
  const weekday = new Date(
    Date.UTC(selectedYear, selectedMonth - 1, selectedDay),
  ).getUTCDay();

  if (!config.settings.workingDays.includes(weekday)) return [];
  if (input.date < config.minDate || input.date > config.maxDate) return [];

  // Live cutoff: a slot today must still be in the future in the configured
  // timezone, with the selected service's notice buffer included.
  const timezone = config.settings.timezone;
  const isToday = input.date === todayKeyInTimeZone(timezone);
  const cutoffMinutes = isToday
    ? nowMinutesInTimeZone(timezone) + requestedBufferBefore
    : -1;
  const unavailableIntervals = unavailableIntervalsForDate(
    config.unavailablePeriods,
    input.date,
  );

  let existing: Array<{
    appointment_time: string;
    appointment_end_time: string;
    service_id: string | null;
    duration_minutes: number | null;
    buffer_before_minutes: number | null;
    buffer_after_minutes: number | null;
  }> = [];
  if (isDatabaseConfigured()) {
    try {
      await ensureSchema({ force: true });
      const sql = getSql();
      existing = await sql<
        Array<{
          appointment_time: string;
          appointment_end_time: string;
          service_id: string | null;
          duration_minutes: number | null;
          buffer_before_minutes: number | null;
          buffer_after_minutes: number | null;
        }>
      >`
        SELECT
          a.appointment_time,
          a.appointment_end_time,
          a.service_id,
          bs.duration_minutes,
          bs.buffer_before_minutes,
          bs.buffer_after_minutes
        FROM appointments a
        LEFT JOIN booking_services bs ON bs.id = a.service_id
        WHERE a.appointment_date = ${input.date}
          AND a.status <> 'cancelled'
      `;
    } catch {
      existing = [];
    }
  }

  const slots: string[] = [];
  for (
    let minutes = start;
    minutes + pricing.durationMinutes <= end;
    minutes += interval
  ) {
    if (minutes < cutoffMinutes) continue;
    const slot = minutesToTime(minutes);
    const slotEnd = minutes + pricing.durationMinutes;
    const protectedStart = minutes - requestedBufferBefore;
    const protectedEnd = slotEnd + requestedBufferAfter;
    const isUnavailable = unavailableIntervals.some((interval) =>
      rangesOverlap(
        protectedStart,
        protectedEnd,
        interval.start,
        interval.end,
      ),
    );
    if (isUnavailable) continue;

    const hasConflict = existing.some((item) => {
      const existingStart = timeToMinutes(
        String(item.appointment_time || "00:00").slice(0, 5),
      );
      const existingEnd = timeToMinutes(
        String(item.appointment_end_time || "").slice(0, 5) ||
          addMinutesToTime(
            String(item.appointment_time || "00:00").slice(0, 5),
            Number(item.duration_minutes || pricing.durationMinutes),
          ),
      );
      const existingBufferBefore = minutesValue(
        item.buffer_before_minutes,
        requestedBufferBefore,
      );
      const existingBufferAfter = minutesValue(item.buffer_after_minutes);
      return rangesOverlap(
        protectedStart,
        protectedEnd,
        existingStart - existingBufferBefore,
        existingEnd + existingBufferAfter,
      );
    });
    if (!hasConflict) slots.push(slot);
  }

  return slots;
}

function validateBooking(
  input: BookingCreateInput,
  services: BookingService[],
) {
  if (!input.customer.acceptsTerms)
    return "Du skal acceptere, at EV-Check må kontakte dig om bookingen.";
  if (!sanitize(input.customer.name)) return "Indtast dit fulde navn.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(input.customer.email)))
    return "Indtast en gyldig e-mailadresse.";
  if (!validatePhone(input.customer.phone))
    return "Indtast et gyldigt telefonnummer.";
  if (
    !sanitize(input.customer.address) ||
    !sanitize(input.customer.postalCode) ||
    !sanitize(input.customer.city)
  ) {
    return "Indtast adressen, hvor testen skal udføres.";
  }
  if (!sanitize(input.vehicle.make)) return "Indtast bilens navn.";
  if (
    !validateDate(input.appointmentDate) ||
    !validateTime(input.appointmentTime)
  )
    return "Vælg en ledig dato og tid.";
  if (!getBookingService(input.serviceId, services))
    return "Vælg en gyldig testpakke.";
  return "";
}

function validateErhvervBooking(
  input: ErhvervBookingCreateInput,
  services: BookingService[],
) {
  if (!input.customer.acceptsTerms)
    return "Du skal acceptere, at EV-Check må kontakte dig om bookingen.";
  if (!sanitize(input.customer.name)) return "Indtast dit fulde navn.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(input.customer.email)))
    return "Indtast en gyldig e-mailadresse.";
  if (!validatePhone(input.customer.phone))
    return "Indtast et gyldigt telefonnummer.";
  if (
    !sanitize(input.customer.address) ||
    !sanitize(input.customer.postalCode) ||
    !sanitize(input.customer.city)
  ) {
    return "Indtast adressen, hvor testen skal udføres.";
  }
  if (!sanitize(input.customer.company)) return "Indtast firmanavn.";
  if (!/^\d{8}$/.test(sanitize(input.customer.cvr)))
    return "Indtast et gyldigt CVR-nummer (8 cifre).";
  if (input.vehicles.length === 0) return "Tilføj mindst én bil.";
  if (input.vehicles.length > 50) return "Maks. 50 biler pr. erhvervsbooking.";
  if (
    !validateDate(input.appointmentDate) ||
    !validateTime(input.appointmentTime)
  )
    return "Vælg en ledig dato og tid.";
  if (!getBookingService(input.serviceId, services))
    return "Vælg en gyldig testpakke.";
  return "";
}

export async function createBooking(input: BookingCreateInput) {
  const bookingInput = normalizeBookingInput(input);

  if (!isDatabaseConfigured()) {
    throw new Error(
      "Bookingsystemet mangler databaseopsætning. Tilføj DATABASE_URL før rigtige bookinger kan gemmes.",
    );
  }

  const config = await getBookingConfig();
  if (!config.settings.bookingEnabled) {
    throw new Error(
      "Online booking er midlertidigt lukket. Kontakt EV-Check for at aftale en tid.",
    );
  }

  const validationError = validateBooking(bookingInput, config.services);
  if (validationError) throw new Error(validationError);

  const addonIds: string[] = [];
  const pricing = calculateBooking(
    { serviceId: bookingInput.serviceId, addonIds },
    config.services,
    config.addons,
  );
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
  const vehicleLabel = bookingInput.vehicle.make;
  const vehicleRegistrationNumber =
    bookingInput.vehicle.registrationNumber || "";
  const appointmentEndTime = addMinutesToTime(
    bookingInput.appointmentTime,
    pricing.durationMinutes,
  );
  const customerCompany = bookingInput.customer.company || "";
  const customerNotes = bookingInput.customer.notes || "";

  const created = await sql.begin(async (tx) => {
    const [existingCustomer] = await tx<
      Array<{ id: string; portal_token: string | null }>
    >`
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
        id, customer_id, vehicle_label, registration_number, service_label, service_id, report_label,
        appointment_date, appointment_time, appointment_end_time, status, payment_status,
        invoice_status, total, assigned_user, area_name, admin_notes, addons_json,
        booking_payload_json, source
      )
      VALUES (
        ${appointmentId}, ${finalCustomerId}, ${vehicleLabel},
        ${vehicleRegistrationNumber}, ${pricing.service.title}, ${pricing.service.id},
        'Batterirapport og systemdiagnose', ${bookingInput.appointmentDate}, ${
      bookingInput.appointmentTime
    },
        ${appointmentEndTime}, ${
      config.settings.defaultAppointmentStatus
    }, 'unpaid',
        'not_requested', ${pricing.total}, '', ${bookingInput.customer.city},
        ${customerNotes}, ${tx.json(pricing.addons)},
        ${tx.json({
          vehicle: bookingInput.vehicle,
          customer: bookingInput.customer,
          pricing,
        })}, 'website'
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
    createdAt: todayKeyInTimeZone(config.settings.timezone),
  };

  const appointment: Appointment = {
    id: created.appointmentId,
    customerId: created.customerId,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    vehicleLabel,
    registrationNumber: vehicleRegistrationNumber,
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
    createdAt: todayKeyInTimeZone(config.settings.timezone),
  };

  try {
    const invoice = await ensureInvoiceRecord({ appointment, customer });
    appointment.invoiceStatus = "ready";
    appointment.invoiceNumber = invoice.invoiceNumber;
  } catch (error) {
    // Booking is saved either way; the invoice number/PDF can still be
    // generated later from the admin dashboard or customer portal.
    console.error("Failed to create invoice record for booking", appointment.id, error);
  }

  try {
    if (config.settings.emailAutomation.customerOnCreate !== false) {
      await sendCustomerAppointmentEmail({
        customer,
        appointment,
        settings: config.settings,
        portalUrl: `${siteUrl}/kunde/${created.portalToken}`,
      });
    }
  } catch {
    // Booking is saved; email status is tracked separately when SMTP is configured.
  }

  try {
    if (config.settings.emailAutomation.adminOnCreate !== false) {
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

export async function createErhvervBooking(input: ErhvervBookingCreateInput) {
  const bookingInput = normalizeErhvervBookingInput(input);

  if (!isDatabaseConfigured()) {
    throw new Error(
      "Bookingsystemet mangler databaseopsætning. Tilføj DATABASE_URL før rigtige bookinger kan gemmes.",
    );
  }

  const config = await getBookingConfig();
  if (!config.settings.bookingEnabled) {
    throw new Error(
      "Online booking er midlertidigt lukket. Kontakt EV-Check for at aftale en tid.",
    );
  }

  const validationError = validateErhvervBooking(bookingInput, config.services);
  if (validationError) throw new Error(validationError);

  const service =
    getBookingService(bookingInput.serviceId, config.services) ||
    config.services[0];
  const durationMinutes = service.durationMinutes;
  const carCount = bookingInput.vehicles.length;
  const unitPrice = Math.max(
    0,
    Math.round(service.price * (1 - erhvervDiscountPercent / 100)),
  );

  const slots = await getAvailableSlots({
    date: bookingInput.appointmentDate,
    serviceId: bookingInput.serviceId,
    addonIds: [],
  });
  const carTimes = Array.from({ length: carCount }, (_, index) =>
    addMinutesToTime(bookingInput.appointmentTime, index * durationMinutes),
  );
  if (!carTimes.every((time) => slots.includes(time))) {
    throw new Error(
      "Der er ikke ledig tid nok i træk til alle biler på den valgte dato og tid. Vælg en anden tid, eller book færre biler ad gangen.",
    );
  }

  await ensureSchema({ force: true });
  const sql = getSql();
  const normalizedEmail = normalizeEmail(bookingInput.customer.email);
  const token = portalToken();
  const customerId = id("cus");
  const groupId = id("grp");
  const customerCompany = bookingInput.customer.company;
  const customerCvr = bookingInput.customer.cvr;
  const customerNotes = bookingInput.customer.notes || "";

  type CreatedAppointment = {
    id: string;
    vehicleLabel: string;
    appointmentTime: string;
    appointmentEndTime: string;
  };

  const created = await sql.begin(async (tx) => {
    const [existingCustomer] = await tx<
      Array<{ id: string; portal_token: string | null }>
    >`
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
          cvr = ${customerCvr},
          notes = ${customerNotes},
          portal_token = ${finalPortalToken},
          updated_at = NOW()
        WHERE id = ${finalCustomerId}
      `;
    } else {
      await tx`
        INSERT INTO customers (
          id, name, email, phone, address, postal_code, city, company, cvr, notes, portal_token
        )
        VALUES (
          ${finalCustomerId}, ${bookingInput.customer.name}, ${normalizedEmail},
          ${bookingInput.customer.phone}, ${bookingInput.customer.address},
          ${bookingInput.customer.postalCode}, ${bookingInput.customer.city},
          ${customerCompany}, ${customerCvr}, ${customerNotes}, ${finalPortalToken}
        )
      `;
    }

    const appointments: CreatedAppointment[] = [];
    for (let index = 0; index < bookingInput.vehicles.length; index += 1) {
      const vehicle = bookingInput.vehicles[index];
      const appointmentId = id("apt");
      const appointmentTime = carTimes[index];
      const appointmentEndTime = addMinutesToTime(
        appointmentTime,
        durationMinutes,
      );

      await tx`
        INSERT INTO appointments (
          id, customer_id, vehicle_label, registration_number, service_label, service_id, report_label,
          appointment_date, appointment_time, appointment_end_time, status, payment_status,
          invoice_status, total, assigned_user, area_name, admin_notes, addons_json,
          booking_payload_json, source, customer_type, booking_group_id, discount_percent
        )
        VALUES (
          ${appointmentId}, ${finalCustomerId}, ${vehicle.make},
          '', ${service.title}, ${service.id},
          'Batterirapport og systemdiagnose', ${bookingInput.appointmentDate}, ${appointmentTime},
          ${appointmentEndTime}, ${config.settings.defaultAppointmentStatus}, 'unpaid',
          'not_requested', ${unitPrice}, '', ${bookingInput.customer.city},
          ${customerNotes}, ${tx.json([])},
          ${tx.json({ vehicle, customer: bookingInput.customer, erhverv: true })}, 'website',
          'business', ${groupId}, ${erhvervDiscountPercent}
        )
      `;

      appointments.push({
        id: appointmentId,
        vehicleLabel: vehicle.make,
        appointmentTime,
        appointmentEndTime,
      });
    }

    return {
      customerId: finalCustomerId,
      portalToken: finalPortalToken,
      appointments,
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
    cvr: customerCvr,
    notes: customerNotes,
    portalToken: created.portalToken,
    createdAt: todayKeyInTimeZone(config.settings.timezone),
  };

  const appointments: Appointment[] = created.appointments.map((row) => ({
    id: row.id,
    customerId: created.customerId,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    vehicleLabel: row.vehicleLabel,
    registrationNumber: "",
    serviceLabel: service.title,
    reportLabel: "Batterirapport og systemdiagnose",
    appointmentDate: bookingInput.appointmentDate,
    appointmentTime: row.appointmentTime,
    appointmentEndTime: row.appointmentEndTime,
    status: config.settings.defaultAppointmentStatus,
    paymentStatus: "unpaid",
    invoiceStatus: "not_requested",
    invoiceNumber: "",
    total: unitPrice,
    assignedUser: "",
    areaName: customer.city,
    adminNotes: customer.notes,
    createdAt: todayKeyInTimeZone(config.settings.timezone),
    customerType: "business",
    groupId,
    discountPercent: erhvervDiscountPercent,
  }));

  for (const appointment of appointments) {
    try {
      const invoice = await ensureInvoiceRecord({ appointment, customer });
      appointment.invoiceStatus = "ready";
      appointment.invoiceNumber = invoice.invoiceNumber;
    } catch (error) {
      // Booking is saved either way; invoices can still be generated later
      // from the admin dashboard or customer portal.
      console.error(
        "Failed to create invoice record for erhverv booking",
        appointment.id,
        error,
      );
    }
  }

  const totalPrice = appointments.reduce((sum, item) => sum + item.total, 0);

  try {
    if (config.settings.emailAutomation.customerOnCreate !== false) {
      await sendCustomerErhvervBookingEmail({
        customer,
        appointments,
        settings: config.settings,
        portalUrl: `${siteUrl}/kunde/${created.portalToken}`,
        totalPrice,
        discountPercent: erhvervDiscountPercent,
      });
    }
  } catch {
    // Booking is saved; email status is tracked separately when SMTP is configured.
  }

  try {
    if (config.settings.emailAutomation.adminOnCreate !== false) {
      await sendAdminErhvervBookingEmail({
        customer,
        appointments,
        settings: config.settings,
        totalPrice,
        discountPercent: erhvervDiscountPercent,
      });
    }
  } catch {
    // Booking is saved; email status is tracked separately when SMTP is configured.
  }

  return {
    bookingGroupId: groupId,
    portalToken: created.portalToken,
    portalUrl: `/kunde/${created.portalToken}`,
    total: totalPrice,
    carCount,
    unitPrice,
    discountPercent: erhvervDiscountPercent,
    appointmentLabel: `${bookingInput.appointmentDate} kl. ${bookingInput.appointmentTime}`,
    serviceLabel: service.title,
    appointments: appointments.map((item) => ({
      id: item.id,
      vehicleLabel: item.vehicleLabel,
      appointmentTime: item.appointmentTime,
      appointmentEndTime: item.appointmentEndTime,
      invoiceNumber: item.invoiceNumber,
    })),
  };
}
