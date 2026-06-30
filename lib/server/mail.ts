import nodemailer from "nodemailer";
import {
  defaultSettings,
  type Appointment,
  type Customer,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { brandLogoPath, siteUrl as canonicalSiteUrl } from "@/lib/seo";
import { CODE_EXPIRY_MINUTES } from "@/lib/server/customer-auth";
import { recordEmailLog } from "@/lib/server/dashboard";

const getMailConfig = () => ({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASSWORD || "",
  from:
    process.env.MAIL_FROM ||
    `${process.env.MAIL_FROM_NAME || "EV Check"} <${
      process.env.SMTP_USER || ""
    }>`,
});

export const isMailConfigured = () => {
  const config = getMailConfig();
  return Boolean(config.host && config.user && config.pass && config.from);
};

const getTransporter = () => {
  const config = getMailConfig();
  if (!isMailConfigured()) return null;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Always use the canonical evcheck.dk domain for links/images in emails,
// regardless of any (potentially misconfigured) APP_URL env var, so emails
// never point to a stale or wrong domain (e.g. the old ev-check.dk).
const siteUrl = () => canonicalSiteUrl;
const logoUrl = () => `${siteUrl()}${brandLogoPath}`;

type MessageAction = {
  label: string;
  url: string;
};

type MessageOptions = {
  title: string;
  eyebrow: string;
  intro: string;
  rows: Array<[string, string]>;
  settings: DashboardSettings;
  action?: MessageAction;
  notice?: string;
  preheader?: string;
};

function renderRows(rows: Array<[string, string]>) {
  if (!rows.length) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid #d9efec;border-radius:14px;overflow:hidden;background:#ffffff;">
      ${rows
        .map(
          ([label, value], index) => `
            <tr>
              <td style="padding:13px 16px;border-bottom:${
                index === rows.length - 1 ? "0" : "1px solid #edf7f5"
              };font-size:13px;line-height:18px;color:#64748b;width:38%;">
                ${escapeHtml(label)}
              </td>
              <td style="padding:13px 16px;border-bottom:${
                index === rows.length - 1 ? "0" : "1px solid #edf7f5"
              };font-size:14px;line-height:20px;color:#0f172a;font-weight:700;text-align:right;">
                ${escapeHtml(value || "-")}
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

function renderMessage({
  title,
  eyebrow,
  intro,
  rows,
  settings,
  action,
  notice,
  preheader,
}: MessageOptions) {
  const supportEmail = settings.supportEmail || defaultSettings.supportEmail;
  const actionHtml =
    action && action.url
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 2px;">
          <tr>
            <td style="border-radius:12px;background:#0f766e;">
              <a href="${escapeHtml(
                action.url,
              )}" style="display:inline-block;padding:13px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;line-height:18px;">
                ${escapeHtml(action.label)}
              </a>
            </td>
          </tr>
        </table>
      `
      : "";
  const noticeHtml = notice
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-collapse:separate;border-spacing:0;">
        <tr>
          <td style="padding:13px 15px;border-radius:14px;background:#ecfdf5;border:1px solid #bbf7d0;color:#14532d;font-size:13px;line-height:20px;">
            ${escapeHtml(notice)}
          </td>
        </tr>
      </table>
    `
    : "";

  return `
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @media only screen and (max-width: 600px) {
            .email-shell { padding: 12px !important; }
            .email-card { border-radius: 16px !important; }
            .email-header { padding: 18px 18px 16px !important; }
            .email-body { padding: 18px !important; }
            .email-title { font-size: 23px !important; line-height: 29px !important; }
            .email-logo { width: 44px !important; height: 44px !important; }
            .email-brand { font-size: 17px !important; }
            .mobile-stack { display:block !important; width:100% !important; text-align:left !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:#eef7f5;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(preheader || intro)}
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef7f5;">
          <tr>
            <td class="email-shell" align="center" style="padding:28px 14px;">
              <table role="presentation" width="640" cellpadding="0" cellspacing="0" class="email-card" style="width:100%;max-width:640px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #d3ebe7;border-radius:22px;overflow:hidden;box-shadow:0 14px 42px rgba(15,23,42,0.08);">
                <tr>
                  <td class="email-header" style="padding:24px 26px 20px;background:#083f3b;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="mobile-stack" style="vertical-align:middle;width:52px;">
                          <img class="email-logo" src="${escapeHtml(
                            logoUrl(),
                          )}" width="52" height="52" alt="${escapeHtml(
                            settings.companyName,
                          )}" style="display:block;width:52px;height:52px;border-radius:14px;background:#ffffff;" />
                        </td>
                        <td class="mobile-stack" style="vertical-align:middle;padding-left:14px;">
                          <div class="email-brand" style="font-size:20px;line-height:24px;font-weight:800;color:#ffffff;">${escapeHtml(
                            settings.companyName,
                          )}</div>
                          <div style="margin-top:5px;font-size:11px;line-height:14px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#5eead4;">${escapeHtml(
                            eyebrow,
                          )}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-body" style="padding:26px;">
                    <h1 class="email-title" style="margin:0 0 10px;font-size:28px;line-height:34px;color:#0f172a;font-weight:800;">${escapeHtml(
                      title,
                    )}</h1>
                    <p style="margin:0;color:#475569;font-size:15px;line-height:24px;">${escapeHtml(
                      intro,
                    )}</p>
                    ${actionHtml}
                    <div style="height:20px;line-height:20px;">&nbsp;</div>
                    ${renderRows(rows)}
                    ${noticeHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:17px 26px;background:#f8fafc;border-top:1px solid #edf7f5;color:#64748b;font-size:12px;line-height:19px;">
                    Spørgsmål? Svar på denne mail eller skriv til
                    <a href="mailto:${escapeHtml(
                      supportEmail,
                    )}" style="color:#0f766e;font-weight:700;text-decoration:none;">${escapeHtml(
                      supportEmail,
                    )}</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();
}

export async function verifyMailConnection() {
  const transporter = getTransporter();
  if (!transporter) {
    return { configured: false, connection: "missing" as const };
  }
  await transporter.verify();
  return { configured: true, connection: "ok" as const };
}

export async function sendTestEmail(to: string, settings: DashboardSettings) {
  const transporter = getTransporter();
  const subject = `${settings.companyName}: test email`;
  if (!transporter) {
    await recordEmailLog({
      recipient: to,
      recipientRole: "admin",
      templateKey: "test_email",
      subject,
      status: "not_configured",
      errorMessage: "SMTP is not configured.",
    });
    return { success: false, error: "SMTP is not configured." };
  }

  try {
    const info = await transporter.sendMail({
      from: getMailConfig().from,
      to,
      subject,
      text: "SMTP is working for EV Check.",
      html: renderMessage({
        title: "SMTP is working",
        eyebrow: "Email test",
        intro:
          "This is a test email from EV-Check.dk. Your SMTP settings are connected correctly.",
        rows: [["Recipient", to]],
        settings,
        preheader: "EV-Check.dk SMTP test email",
      }),
    });
    await recordEmailLog({
      recipient: to,
      recipientRole: "admin",
      templateKey: "test_email",
      subject,
      status: "sent",
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    await recordEmailLog({
      recipient: to,
      recipientRole: "admin",
      templateKey: "test_email",
      subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function sendCustomerVerificationCodeEmail(input: {
  customerEmail: string;
  code: string;
  settings: DashboardSettings;
}) {
  const supportEmail =
    input.settings.supportEmail || defaultSettings.supportEmail;
  const subject = `${input.settings.companyName}: Din bekræftelseskode`;
  const codeDigits = input.code.split("").join(" ");
  const transporter = getTransporter();

  if (!transporter) {
    await recordEmailLog({
      recipient: input.customerEmail,
      recipientRole: "customer",
      templateKey: "customer_verification_code",
      subject,
      status: "not_configured",
      errorMessage: "SMTP is not configured.",
    });
    throw new Error("SMTP is not configured.");
  }

  try {
    await transporter.sendMail({
      from: getMailConfig().from,
      to: input.customerEmail,
      replyTo: supportEmail,
      subject,
      text: [
        subject,
        "",
        `Din bekræftelseskode: ${input.code}`,
        `Koden udløber om ${CODE_EXPIRY_MINUTES} minutter.`,
        "",
        "Hvis du ikke har bedt om denne kode, kan du ignorere denne e-mail.",
        `Support: ${supportEmail}`,
      ].join("\n"),
      html: renderMessage({
        title: "Bekræft din e-mail",
        eyebrow: "Engangskode",
        intro:
          "Brug koden herunder for at få adgang til din kundeportal hos EV-Check.dk.",
        rows: [
          ["Din kode", codeDigits],
          ["Udløber", `${CODE_EXPIRY_MINUTES} minutter`],
        ],
        settings: input.settings,
        notice:
          "Hvis du ikke har bedt om denne kode, kan du ignorere denne e-mail.",
        preheader: `Din bekræftelseskode er ${input.code}`,
      }),
    });

    await recordEmailLog({
      recipient: input.customerEmail,
      recipientRole: "customer",
      templateKey: "customer_verification_code",
      subject,
      status: "sent",
    });
  } catch (error) {
    await recordEmailLog({
      recipient: input.customerEmail,
      recipientRole: "customer",
      templateKey: "customer_verification_code",
      subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function sendCustomerAppointmentEmail(input: {
  customer: Customer;
  appointment: Appointment;
  settings: DashboardSettings;
  portalUrl?: string;
}) {
  const supportEmail =
    input.settings.supportEmail || defaultSettings.supportEmail;
  const subject = `${input.settings.companyName}: Bookingbekræftelse`;
  const transporter = getTransporter();
  if (!transporter) {
    await recordEmailLog({
      appointmentId: input.appointment.id,
      customerId: input.customer.id,
      recipient: input.customer.email,
      recipientRole: "customer",
      templateKey: `customer_${input.appointment.status}`,
      subject,
      status: "not_configured",
      errorMessage: "SMTP is not configured.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: getMailConfig().from,
      to: input.customer.email,
      replyTo: supportEmail,
      subject,
      text: `Din booking hos EV-Check.dk er modtaget til ${input.appointment.appointmentDate} kl. ${input.appointment.appointmentTime}.`,
      html: renderMessage({
        title: "Din booking er modtaget",
        eyebrow: "Bookingbekræftelse",
        intro:
          "Tak for din booking. Vi har modtaget dine oplysninger og reserveret den valgte tid til batteritest af din elbil.",
        rows: [
          ["Booking", input.appointment.id],
          ["Faktura", input.appointment.invoiceNumber],
          ["Service", input.appointment.serviceLabel],
          ["Bil", input.appointment.vehicleLabel],
          ["Dato", input.appointment.appointmentDate],
          [
            "Tid",
            `${input.appointment.appointmentTime}-${input.appointment.appointmentEndTime}`,
          ],
          ["Pris", `${input.appointment.total} DKK`],
          [
            "Adresse",
            [
              input.customer.address,
              input.customer.postalCode,
              input.customer.city,
            ]
              .filter(Boolean)
              .join(", "),
          ],
        ],
        settings: input.settings,
        action: input.portalUrl
          ? { label: "Åbn kundeportal", url: input.portalUrl }
          : undefined,
        notice:
          "Næste skridt: Vi gennemgår bookingen og kontakter dig, hvis vi mangler oplysninger. Efter testen modtager du rapporten digitalt.",
        preheader: `Booking modtaget til ${input.appointment.appointmentDate} kl. ${input.appointment.appointmentTime}`,
      }),
    });

    await recordEmailLog({
      appointmentId: input.appointment.id,
      customerId: input.customer.id,
      recipient: input.customer.email,
      recipientRole: "customer",
      templateKey: `customer_${input.appointment.status}`,
      subject,
      status: "sent",
    });
  } catch (error) {
    await recordEmailLog({
      appointmentId: input.appointment.id,
      customerId: input.customer.id,
      recipient: input.customer.email,
      recipientRole: "customer",
      templateKey: `customer_${input.appointment.status}`,
      subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
export async function sendAdminBookingEmail(input: {
  customer: Customer;
  appointment: Appointment;
  settings: DashboardSettings;
}) {
  const recipient =
    input.settings.adminNotifyEmail ||
    process.env.BOOKING_ADMIN_EMAIL ||
    input.settings.supportEmail ||
    defaultSettings.supportEmail;
  const subject = `${input.settings.companyName}: Ny booking fra ${input.customer.name}`;
  const transporter = getTransporter();
  const rows: Array<[string, string]> = [
    ["Kunde", input.customer.name],
    ["E-mail", input.customer.email],
    ["Telefon", input.customer.phone],
    [
      "Adresse",
      [input.customer.address, input.customer.postalCode, input.customer.city]
        .filter(Boolean)
        .join(", "),
    ],
    ["Bil", input.appointment.vehicleLabel],
    ["Faktura", input.appointment.invoiceNumber],
    ["Service", input.appointment.serviceLabel],
    ["Dato", input.appointment.appointmentDate],
    [
      "Tid",
      `${input.appointment.appointmentTime}-${input.appointment.appointmentEndTime}`,
    ],
    ["Pris", `${input.appointment.total} DKK`],
    ["Besked", input.customer.notes],
  ];

  if (!transporter) {
    await recordEmailLog({
      appointmentId: input.appointment.id,
      customerId: input.customer.id,
      recipient,
      recipientRole: "admin",
      templateKey: "admin_booking_created",
      subject,
      status: "not_configured",
      errorMessage: "SMTP is not configured.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: getMailConfig().from,
      to: recipient,
      replyTo: input.customer.email,
      subject,
      text: `Ny booking: ${input.customer.name}, ${input.appointment.appointmentDate} kl. ${input.appointment.appointmentTime}`,
      html: renderMessage({
        title: "Ny booking modtaget",
        eyebrow: "Admin notifikation",
        intro:
          "En kunde har booket en batteritest via hjemmesiden. Her er alle oplysninger til opfølgning.",
        rows,
        settings: input.settings,
        action: {
          label: "Åbn admin dashboard",
          url: `${siteUrl()}/admin?view=bookings`,
        },
        notice:
          "Husk at kontrollere adresse, bil og tidspunkt før endelig planlægning.",
        preheader: `Ny booking fra ${input.customer.name}`,
      }),
    });

    await recordEmailLog({
      appointmentId: input.appointment.id,
      customerId: input.customer.id,
      recipient,
      recipientRole: "admin",
      templateKey: "admin_booking_created",
      subject,
      status: "sent",
    });
  } catch (error) {
    await recordEmailLog({
      appointmentId: input.appointment.id,
      customerId: input.customer.id,
      recipient,
      recipientRole: "admin",
      templateKey: "admin_booking_created",
      subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function sendCustomerErhvervBookingEmail(input: {
  customer: Customer;
  appointments: Appointment[];
  settings: DashboardSettings;
  portalUrl?: string;
  totalPrice: number;
  discountPercent: number;
}) {
  const supportEmail =
    input.settings.supportEmail || defaultSettings.supportEmail;
  const carCount = input.appointments.length;
  const carWord = carCount === 1 ? "bil" : "biler";
  const subject = `${input.settings.companyName}: Erhvervsbooking modtaget (${carCount} ${carWord})`;
  const transporter = getTransporter();
  const first = input.appointments[0];
  const groupId = first?.groupId || first?.id || "";

  const carRows: Array<[string, string]> = input.appointments.map(
    (appointment, index) => [
      `Bil ${index + 1}`,
      `${appointment.vehicleLabel} · ${appointment.appointmentTime}-${appointment.appointmentEndTime}`,
    ],
  );

  const rows: Array<[string, string]> = [
    ["Erhvervsbooking", groupId],
    ["Firma", input.customer.company],
    ["CVR-nummer", input.customer.cvr || ""],
    ["Dato", first?.appointmentDate || ""],
    ...carRows,
    ["Rabat", `${input.discountPercent}%`],
    ["Total pris", `${input.totalPrice} DKK`],
    [
      "Adresse",
      [
        input.customer.address,
        input.customer.postalCode,
        input.customer.city,
      ]
        .filter(Boolean)
        .join(", "),
    ],
  ];

  if (!transporter) {
    await recordEmailLog({
      appointmentId: first?.id,
      customerId: input.customer.id,
      recipient: input.customer.email,
      recipientRole: "customer",
      templateKey: "customer_erhverv_booking_created",
      subject,
      status: "not_configured",
      errorMessage: "SMTP is not configured.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: getMailConfig().from,
      to: input.customer.email,
      replyTo: supportEmail,
      subject,
      text: `Jeres erhvervsbooking hos EV-Check.dk er modtaget til ${first?.appointmentDate} fra kl. ${first?.appointmentTime}. ${carCount} ${carWord}, total ${input.totalPrice} DKK efter ${input.discountPercent}% erhvervsrabat.`,
      html: renderMessage({
        title: "Jeres erhvervsbooking er modtaget",
        eyebrow: "Erhvervsbooking",
        intro: `Tak for jeres booking. Vi har reserveret tid til batteritest af ${carCount} ${carWord}, og I har fået ${input.discountPercent}% erhvervsrabat på prisen.`,
        rows,
        settings: input.settings,
        action: input.portalUrl
          ? { label: "Åbn kundeportal", url: input.portalUrl }
          : undefined,
        notice:
          "Vi kontakter jer, hvis vi mangler oplysninger. I modtager en PDF-rapport pr. bil samt faktura efter testen.",
        preheader: `Erhvervsbooking modtaget: ${carCount} ${carWord} til ${first?.appointmentDate}`,
      }),
    });

    await recordEmailLog({
      appointmentId: first?.id,
      customerId: input.customer.id,
      recipient: input.customer.email,
      recipientRole: "customer",
      templateKey: "customer_erhverv_booking_created",
      subject,
      status: "sent",
    });
  } catch (error) {
    await recordEmailLog({
      appointmentId: first?.id,
      customerId: input.customer.id,
      recipient: input.customer.email,
      recipientRole: "customer",
      templateKey: "customer_erhverv_booking_created",
      subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function sendAdminErhvervBookingEmail(input: {
  customer: Customer;
  appointments: Appointment[];
  settings: DashboardSettings;
  totalPrice: number;
  discountPercent: number;
}) {
  const recipient =
    input.settings.adminNotifyEmail ||
    process.env.BOOKING_ADMIN_EMAIL ||
    input.settings.supportEmail ||
    defaultSettings.supportEmail;
  const carCount = input.appointments.length;
  const carWord = carCount === 1 ? "bil" : "biler";
  const first = input.appointments[0];
  const groupId = first?.groupId || first?.id || "";
  const subject = `${input.settings.companyName}: Ny erhvervsbooking fra ${
    input.customer.company || input.customer.name
  } (${carCount} ${carWord})`;
  const transporter = getTransporter();

  const carRows: Array<[string, string]> = input.appointments.map(
    (appointment, index) => [
      `Bil ${index + 1}`,
      `${appointment.vehicleLabel} · ${appointment.appointmentTime}-${appointment.appointmentEndTime} · ${
        appointment.invoiceNumber || "faktura følger"
      }`,
    ],
  );

  const rows: Array<[string, string]> = [
    ["Erhvervsbooking", groupId],
    ["Firma", input.customer.company],
    ["CVR-nummer", input.customer.cvr || ""],
    ["Kontaktperson", input.customer.name],
    ["E-mail", input.customer.email],
    ["Telefon", input.customer.phone],
    [
      "Adresse",
      [
        input.customer.address,
        input.customer.postalCode,
        input.customer.city,
      ]
        .filter(Boolean)
        .join(", "),
    ],
    ["Dato", first?.appointmentDate || ""],
    ...carRows,
    ["Rabat", `${input.discountPercent}%`],
    ["Total pris", `${input.totalPrice} DKK`],
    ["Besked", input.customer.notes],
  ];

  if (!transporter) {
    await recordEmailLog({
      appointmentId: first?.id,
      customerId: input.customer.id,
      recipient,
      recipientRole: "admin",
      templateKey: "admin_erhverv_booking_created",
      subject,
      status: "not_configured",
      errorMessage: "SMTP is not configured.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: getMailConfig().from,
      to: recipient,
      replyTo: input.customer.email,
      subject,
      text: `Ny erhvervsbooking: ${
        input.customer.company || input.customer.name
      }, ${carCount} ${carWord}, ${first?.appointmentDate} fra kl. ${first?.appointmentTime}.`,
      html: renderMessage({
        title: "Ny erhvervsbooking modtaget",
        eyebrow: "Admin notifikation",
        intro:
          "En virksomhed har booket batteritest til flere biler via erhvervsbookingen på hjemmesiden.",
        rows,
        settings: input.settings,
        action: {
          label: "Åbn admin dashboard",
          url: `${siteUrl()}/admin?view=bookings`,
        },
        notice:
          "Husk at kontrollere adresse, CVR-nummer og biler før endelig planlægning.",
        preheader: `Ny erhvervsbooking fra ${
          input.customer.company || input.customer.name
        }`,
      }),
    });

    await recordEmailLog({
      appointmentId: first?.id,
      customerId: input.customer.id,
      recipient,
      recipientRole: "admin",
      templateKey: "admin_erhverv_booking_created",
      subject,
      status: "sent",
    });
  } catch (error) {
    await recordEmailLog({
      appointmentId: first?.id,
      customerId: input.customer.id,
      recipient,
      recipientRole: "admin",
      templateKey: "admin_erhverv_booking_created",
      subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
