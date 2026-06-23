export type AppointmentStatus = "pending" | "approved" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";
export type InvoiceStatus = "not_requested" | "ready" | "sent" | "paid";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  company: string;
  notes: string;
  portalToken: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleLabel: string;
  registrationNumber: string;
  serviceLabel: string;
  reportLabel: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentEndTime: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  invoiceNumber: string;
  total: number;
  assignedUser: string;
  areaName: string;
  adminNotes: string;
  createdAt: string;
};

export type EmailLog = {
  id: string;
  appointmentId: string;
  customerId: string;
  recipient: string;
  recipientRole: "admin" | "customer" | "user";
  templateKey: string;
  subject: string;
  status: "sent" | "failed" | "not_configured" | "pending";
  errorMessage: string;
  sentAt: string;
  createdAt: string;
};

export type DashboardUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "inspector" | "admin";
  status: "active" | "inactive";
  assignedServices: string[];
  workingArea: string;
};

export type DashboardSettings = {
  companyName: string;
  supportEmail: string;
  adminNotifyEmail: string;
  defaultAppointmentStatus: AppointmentStatus;
  bookingEnabled: boolean;
  timezone: string;
  startHour: number;
  endHour: number;
  slotMinutes: number;
  serviceAreas: string[];
  services: Array<{ id: string; label: string; price: number; durationMinutes: number }>;
  emailAutomation: {
    customerOnCreate: boolean;
    customerOnApprove: boolean;
    customerOnComplete: boolean;
    customerOnCancel: boolean;
    adminOnCreate: boolean;
  };
};

export type AdminDashboardData = {
  stats: {
    todayAppointments: number;
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    activeCustomers: number;
    totalRevenue: number;
    outstandingRevenue: number;
  };
  appointments: Appointment[];
  customers: Customer[];
  users: DashboardUser[];
  emailLogs: EmailLog[];
  settings: DashboardSettings;
  databaseConfigured: boolean;
  databaseError?: string;
};

export const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
};

export const invoiceLabels: Record<InvoiceStatus, string> = {
  not_requested: "Not requested",
  ready: "Ready",
  sent: "Sent",
  paid: "Paid",
};

export const defaultSettings: DashboardSettings = {
  companyName: "EV-Check.dk",
  supportEmail: "info@ev-check.dk",
  adminNotifyEmail: "",
  defaultAppointmentStatus: "pending",
  bookingEnabled: true,
  timezone: "Europe/Copenhagen",
  startHour: 9,
  endHour: 18,
  slotMinutes: 15,
  serviceAreas: ["København", "Nordsjælland", "Roskilde", "Køge", "Hele Sjælland"],
  services: [
    { id: "battery-health", label: "Batteritest af elbil", price: 1300, durationMinutes: 15 },
  ],
  emailAutomation: {
    customerOnCreate: true,
    customerOnApprove: true,
    customerOnComplete: true,
    customerOnCancel: true,
    adminOnCreate: true,
  },
};

const today = new Date();
const dateText = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const demoCustomers: Customer[] = [
  {
    id: "cus_demo_1",
    name: "Anna Jensen",
    email: "anna@example.com",
    phone: "+45 22 11 33 44",
    address: "Amager Strandvej 10",
    postalCode: "2300",
    city: "Copenhagen",
    company: "",
    notes: "Interested in a resale report.",
    portalToken: "demo-anna",
    createdAt: dateText(-18),
  },
  {
    id: "cus_demo_2",
    name: "Nordic Fleet A/S",
    email: "fleet@example.com",
    phone: "+45 70 20 40 60",
    address: "Industrivej 4",
    postalCode: "4000",
    city: "Roskilde",
    company: "Nordic Fleet A/S",
    notes: "Fleet customer.",
    portalToken: "demo-fleet",
    createdAt: dateText(-42),
  },
  {
    id: "cus_demo_3",
    name: "Mikkel Larsen",
    email: "mikkel@example.com",
    phone: "+45 28 80 10 11",
    address: "Søndergade 8",
    postalCode: "8000",
    city: "Aarhus",
    company: "",
    notes: "",
    portalToken: "demo-mikkel",
    createdAt: dateText(-7),
  },
];

export const demoUsers: DashboardUser[] = [
  {
    id: "usr_demo_1",
    fullName: "Sara Holm",
    email: "sara@ev-check.dk",
    phone: "+45 31 10 20 30",
    role: "inspector",
    status: "active",
    assignedServices: ["Battery health check", "Pre-purchase EV inspection"],
    workingArea: "Copenhagen",
  },
  {
    id: "usr_demo_2",
    fullName: "Jonas Meyer",
    email: "jonas@ev-check.dk",
    phone: "+45 41 55 22 10",
    role: "inspector",
    status: "active",
    assignedServices: ["Charging and range report"],
    workingArea: "Sjælland",
  },
];

export const demoAppointments: Appointment[] = [
  {
    id: "apt_demo_1",
    customerId: "cus_demo_1",
    customerName: "Anna Jensen",
    customerEmail: "anna@example.com",
    customerPhone: "+45 22 11 33 44",
    vehicleLabel: "Tesla Model 3 Long Range",
    registrationNumber: "AB12345",
    serviceLabel: "Battery health check",
    reportLabel: "Battery and charging summary",
    appointmentDate: dateText(0),
    appointmentTime: "10:00",
    appointmentEndTime: "11:00",
    status: "approved",
    paymentStatus: "paid",
    invoiceStatus: "sent",
    invoiceNumber: "EV-1001",
    total: 995,
    assignedUser: "Sara Holm",
    areaName: "Copenhagen",
    adminNotes: "Bring OBD reader and charging adapter.",
    createdAt: dateText(-2),
  },
  {
    id: "apt_demo_2",
    customerId: "cus_demo_2",
    customerName: "Nordic Fleet A/S",
    customerEmail: "fleet@example.com",
    customerPhone: "+45 70 20 40 60",
    vehicleLabel: "Volkswagen ID.4",
    registrationNumber: "CD67890",
    serviceLabel: "Pre-purchase EV inspection",
    reportLabel: "Fleet readiness report",
    appointmentDate: dateText(1),
    appointmentTime: "13:30",
    appointmentEndTime: "15:00",
    status: "pending",
    paymentStatus: "unpaid",
    invoiceStatus: "not_requested",
    invoiceNumber: "",
    total: 1495,
    assignedUser: "Unassigned",
    areaName: "Roskilde",
    adminNotes: "Customer asked for fast turnaround.",
    createdAt: dateText(-1),
  },
  {
    id: "apt_demo_3",
    customerId: "cus_demo_3",
    customerName: "Mikkel Larsen",
    customerEmail: "mikkel@example.com",
    customerPhone: "+45 28 80 10 11",
    vehicleLabel: "Hyundai Ioniq 5",
    registrationNumber: "EF24680",
    serviceLabel: "Charging and range report",
    reportLabel: "Range estimate",
    appointmentDate: dateText(-3),
    appointmentTime: "09:00",
    appointmentEndTime: "09:45",
    status: "completed",
    paymentStatus: "paid",
    invoiceStatus: "paid",
    invoiceNumber: "EV-1000",
    total: 795,
    assignedUser: "Jonas Meyer",
    areaName: "Aarhus",
    adminNotes: "",
    createdAt: dateText(-6),
  },
];

export const demoEmailLogs: EmailLog[] = [
  {
    id: "mail_demo_1",
    appointmentId: "apt_demo_1",
    customerId: "cus_demo_1",
    recipient: "anna@example.com",
    recipientRole: "customer",
    templateKey: "customer_approved",
    subject: "EV Check: your appointment is approved",
    status: "sent",
    errorMessage: "",
    sentAt: dateText(-1),
    createdAt: dateText(-1),
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatShortDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}

export function buildStats(
  appointments: Appointment[],
  customers: Customer[],
  todayKey: string = new Date().toISOString().slice(0, 10),
) {
  const activeAppointments = appointments.filter((item) => item.status !== "cancelled");
  return {
    todayAppointments: activeAppointments.filter((item) => item.appointmentDate === todayKey).length,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((item) => item.status === "pending").length,
    completedAppointments: appointments.filter((item) => item.status === "completed").length,
    activeCustomers: customers.length,
    totalRevenue: activeAppointments.reduce((sum, item) => sum + item.total, 0),
    outstandingRevenue: activeAppointments
      .filter((item) => item.paymentStatus !== "paid")
      .reduce((sum, item) => sum + item.total, 0),
  };
}

export const OTHER_MODEL_SUFFIX = "-other";
