import nodemailer from "nodemailer";
import { defaultSettings, type Appointment, type Customer, type DashboardSettings } from "@/lib/ev-domain";
import { recordEmailLog } from "@/lib/server/dashboard";

const getMailConfig = () => ({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASSWORD || "",
  from:
    process.env.MAIL_FROM ||
    `${process.env.MAIL_FROM_NAME || "EV Check"} <${process.env.SMTP_USER || ""}>`,
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

const siteUrl = () => String(process.env.APP_URL || "https://ev-check.dk").replace(/\/$/, "");
const logoUrl = () => `${siteUrl()}/wp/ev-check-dk.png`;

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
              <td style="padding:13px 16px;border-bottom:${index === rows.length - 1 ? "0" : "1px solid #edf7f5"};font-size:13px;line-height:18px;color:#64748b;width:38%;">
                ${escapeHtml(label)}
              </td>
              <td style="padding:13px 16px;border-bottom:${index === rows.length - 1 ? "0" : "1px solid #edf7f5"};font-size:14px;line-height:20px;color:#0f172a;font-weight:700;text-align:right;">
                ${escapeHtml(value || "-")}
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

function renderMessage({ title, eyebrow, intro, rows, settings, action, notice, preheader }: MessageOptions) {
  const supportEmail = settings.supportEmail || defaultSettings.supportEmail;
  const actionHtml =
    action && action.url
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 2px;">
          <tr>
            <td style="border-radius:12px;background:#0f766e;">
              <a href="${escapeHtml(action.url)}" style="display:inline-block;padding:13px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;line-height:18px;">
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
                          <img class="email-logo" src="${escapeHtml(logoUrl())}" width="52" height="52" alt="${escapeHtml(settings.companyName)}" style="display:block;width:52px;height:52px;border-radius:14px;background:#ffffff;" />
                        </td>
                        <td class="mobile-stack" style="vertical-align:middle;padding-left:14px;">
                          <div class="email-brand" style="font-size:20px;line-height:24px;font-weight:800;color:#ffffff;">${escapeHtml(settings.companyName)}</div>
                          <div style="margin-top:5px;font-size:11px;line-height:14px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#5eead4;">${escapeHtml(eyebrow)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-body" style="padding:26px;">
                    <h1 class="email-title" style="margin:0 0 10px;font-size:28px;line-height:34px;color:#0f172a;font-weight:800;">${escapeHtml(title)}</h1>
                    <p style="margin:0;color:#475569;font-size:15px;line-height:24px;">${escapeHtml(intro)}</p>
                    ${actionHtml}
                    <div style="height:20px;line-height:20px;">&nbsp;</div>
                    ${renderRows(rows)}
                    ${noticeHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:17px 26px;background:#f8fafc;border-top:1px solid #edf7f5;color:#64748b;font-size:12px;line-height:19px;">
                    Spørgsmål? Svar på denne mail eller skriv til
                    <a href="mailto:${escapeHtml(supportEmail)}" style="color:#0f766e;font-weight:700;text-decoration:none;">${escapeHtml(supportEmail)}</a>.
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
        intro: "This is a test email from EV-Check.dk. Your SMTP settings are connected correctly.",
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
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendCustomerAppointmentEmail(input: {
  customer: Customer;
  appointment: Appointment;
  settings: DashboardSettings;
  portalUrl?: string;
}) {
  const subject = `${input.settings.companyName}: booking confirmation`;
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
      subject,
      text: `Din booking hos EV-Check.dk er modtaget til ${input.appointment.appointmentDate} kl. ${input.appointment.appointmentTime}.`,
      html: renderMessage({
        title: "Din booking er modtaget",
        eyebrow: "Bookingbekraeftelse",
        intro:
          "Tak for din booking. Vi har modtaget dine oplysninger og reserveret den valgte tid til batteritest af din elbil.",
        rows: [
          ["Booking", input.appointment.id],
          ["Faktura", input.appointment.invoiceNumber],
          ["Service", input.appointment.serviceLabel],
          ["Bil", input.appointment.vehicleLabel],
          ["Dato", input.appointment.appointmentDate],
          ["Tid", `${input.appointment.appointmentTime}-${input.appointment.appointmentEndTime}`],
          ["Pris", `${input.appointment.total} DKK`],
          ["Adresse", [input.customer.address, input.customer.postalCode, input.customer.city].filter(Boolean).join(", ")],
        ],
        settings: input.settings,
        action: input.portalUrl ? { label: "Aabn kundeportal", url: input.portalUrl } : undefined,
        notice:
          "Naeste skridt: Vi gennemgaar bookingen og kontakter dig, hvis vi mangler oplysninger. Efter testen modtager du rapporten digitalt.",
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
  const subject = `${input.settings.companyName}: ny booking`;
  const transporter = getTransporter();
  const rows: Array<[string, string]> = [
    ["Kunde", input.customer.name],
    ["Email", input.customer.email],
    ["Telefon", input.customer.phone],
    ["Adresse", [input.customer.address, input.customer.postalCode, input.customer.city].filter(Boolean).join(", ")],
    ["Bil", input.appointment.vehicleLabel],
    ["Faktura", input.appointment.invoiceNumber],
    ["Service", input.appointment.serviceLabel],
    ["Dato", input.appointment.appointmentDate],
    ["Tid", `${input.appointment.appointmentTime}-${input.appointment.appointmentEndTime}`],
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
      subject,
      text: `Ny booking: ${input.customer.name}, ${input.appointment.appointmentDate} kl. ${input.appointment.appointmentTime}`,
      html: renderMessage({
        title: "Ny booking modtaget",
        eyebrow: "Admin notifikation",
        intro: "En kunde har booket en batteritest via hjemmesiden. Her er alle oplysninger til opfoelgning.",
        rows,
        settings: input.settings,
        action: { label: "Aabn admin dashboard", url: `${siteUrl()}/admin?view=bookings` },
        notice: "Husk at kontrollere adresse, bil og tidspunkt foer endelig planlaegning.",
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
