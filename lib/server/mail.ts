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

function renderMessage(title: string, intro: string, rows: Array<[string, string]>, settings: DashboardSettings) {
  return `
    <div style="margin:0;padding:0;background:#f6fbfa;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6fbfa;">
        <tr><td align="center" style="padding:32px 16px;">
          <table width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #d9efec;border-radius:18px;overflow:hidden;">
            <tr><td style="background:#083f3b;padding:26px 32px;color:#ffffff;">
              <div style="font-size:20px;font-weight:700;">${escapeHtml(settings.companyName)}</div>
              <div style="margin-top:6px;color:#5eead4;font-size:12px;text-transform:uppercase;letter-spacing:.12em;">EV appointment update</div>
            </td></tr>
            <tr><td style="padding:30px 32px;">
              <h1 style="margin:0 0 10px;color:#0f172a;font-size:24px;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 22px;color:#475569;line-height:1.65;">${escapeHtml(intro)}</p>
              <div style="border:1px solid #d9efec;border-radius:14px;overflow:hidden;">
                ${rows
                  .map(
                    ([label, value]) =>
                      `<div style="display:flex;justify-content:space-between;gap:16px;padding:12px 16px;border-bottom:1px solid #eef7f5;">
                        <span style="color:#64748b;">${escapeHtml(label)}</span>
                        <strong style="color:#0f172a;text-align:right;">${escapeHtml(value || "-")}</strong>
                      </div>`,
                  )
                  .join("")}
              </div>
            </td></tr>
            <tr><td style="padding:20px 32px;background:#f8fafc;color:#64748b;font-size:13px;">
              Support: ${escapeHtml(settings.supportEmail || defaultSettings.supportEmail)}
            </td></tr>
          </table>
        </td></tr>
      </table>
    </div>
  `;
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
      html: renderMessage("SMTP is working", "This is a test email from EV Check.", [], settings),
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
  const subject = `${input.settings.companyName}: appointment ${input.appointment.status}`;
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

  await transporter.sendMail({
    from: getMailConfig().from,
    to: input.customer.email,
    subject,
    text: `Your EV Check appointment is ${input.appointment.status}.`,
    html: renderMessage(
      "Appointment update",
      `Your EV Check appointment is now ${input.appointment.status}.`,
      [
        ["Service", input.appointment.serviceLabel],
        ["Vehicle", input.appointment.vehicleLabel],
        ["Date", input.appointment.appointmentDate],
        ["Time", input.appointment.appointmentTime],
        ["Portal", input.portalUrl || ""],
      ],
      input.settings,
    ),
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
}
