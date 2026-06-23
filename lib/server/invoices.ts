import { randomBytes } from "crypto";
import path from "path";
import PDFDocument from "pdfkit";
import {
  formatPrice,
  type Appointment,
  type Customer,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { brandLogoPath, companyCvr } from "@/lib/seo";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";
import { getAdminDashboardData } from "@/lib/server/dashboard";

type InvoiceResult = {
  invoiceNumber: string;
  pdf: Buffer;
};

const DANISH_VAT_RATE = 0.25;

const invoiceId = () => `inv_${randomBytes(8).toString("hex")}`;

const nextInvoiceNumber = (date = new Date()) =>
  `EV-${date.getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

const brandLogoFile = () =>
  path.join(process.cwd(), "public", brandLogoPath.replace(/^\//, ""));

function drawRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  y: number,
) {
  doc.fillColor("#6B7280").fontSize(10).text(label, 56, y, { width: 170 });
  doc
    .fillColor("#111827")
    .fontSize(10)
    .text(value || "-", 260, y, { width: 280, align: "right" });
}

async function renderInvoicePdf(input: {
  appointment: Appointment;
  customer: Customer;
  settings: DashboardSettings;
  invoiceNumber: string;
}) {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "A4", margin: 48 });

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.rect(0, 0, 595, 132).fill("#064E4B");
  doc
    .roundedRect(48, 30, 62, 62, 12)
    .fillOpacity(0.94)
    .fill("#FFFFFF")
    .fillOpacity(1);
  doc.image(brandLogoFile(), 56, 38, { width: 46, height: 46 });
  doc
    .fillColor("#FFFFFF")
    .fontSize(24)
    .text(input.settings.companyName || "EV-Check.dk", 128, 42);
  doc
    .fillColor("#F6C65B")
    .fontSize(10)
    .text("BOOKING RECEIPT", 128, 76, { characterSpacing: 1.2 });
  doc
    .fillColor("#FFFFFF")
    .fontSize(12)
    .text(input.settings.supportEmail || "info@ev-check.dk", 128, 94);

  doc
    .roundedRect(390, 38, 150, 56, 10)
    .fillOpacity(0.12)
    .fill("#FFFFFF")
    .fillOpacity(1);
  doc
    .fillColor("#FFFFFF")
    .fontSize(10)
    .text("Invoice", 410, 50)
    .fontSize(14)
    .text(input.invoiceNumber, 410, 66);

  doc.fillColor("#111827").fontSize(18).text("Booking details", 56, 170);

  const rows: Array<[string, string]> = [
    ["Booking ID", input.appointment.id],
    ["Invoice number", input.invoiceNumber],
    ["CVR-nummer", companyCvr],
    ["Customer", input.customer.name],
    ["Email", input.customer.email],
    ["Phone", input.customer.phone],
    ["Service", input.appointment.serviceLabel],
    ["Car", input.appointment.vehicleLabel],
    [
      "Date and time",
      `${input.appointment.appointmentDate} kl. ${input.appointment.appointmentTime}`,
    ],
    [
      "Address",
      [input.customer.address, input.customer.postalCode, input.customer.city]
        .filter(Boolean)
        .join(", "),
    ],
    ["Payment status", input.appointment.paymentStatus],
  ];

  let y = 210;
  for (const [label, value] of rows) {
    doc
      .roundedRect(48, y - 8, 499, 28, 6)
      .fill(y % 2 === 0 ? "#FAFAF7" : "#FFFFFF");
    drawRow(doc, label, value, y);
    y += 34;
  }

  const amountExclVat = Math.round(
    input.appointment.total / (1 + DANISH_VAT_RATE),
  );
  const vatAmount = input.appointment.total - amountExclVat;
  const vatPercent = Math.round(DANISH_VAT_RATE * 100);

  doc
    .moveTo(48, y + 10)
    .lineTo(547, y + 10)
    .strokeColor("#E5E7EB")
    .stroke();
  y += 28;
  drawRow(doc, "Pris uden moms", formatPrice(amountExclVat), y);
  y += 22;
  drawRow(doc, `Moms (${vatPercent}%)`, formatPrice(vatAmount), y);
  y += 30;
  doc
    .fillColor("#111827")
    .fontSize(13)
    .text("Total (inkl. moms)", 56, y);
  doc
    .fillColor("#064E4B")
    .fontSize(22)
    .text(formatPrice(input.appointment.total), 360, y - 5, {
      width: 180,
      align: "right",
    });

  doc
    .fillColor("#6B7280")
    .fontSize(9)
    .text(
      `Alle priser er i DKK og inkl. ${vatPercent}% moms. Denne PDF fungerer som bookingkvittering og fakturagrundlag.`,
      56,
      770,
      { width: 480, align: "center" },
    );

  doc.end();
  return done;
}

export async function createInvoicePdf(input: {
  appointment: Appointment;
  customer: Customer;
  settings: DashboardSettings;
  invoiceNumber?: string;
}): Promise<InvoiceResult> {
  const invoiceNumber = input.invoiceNumber || nextInvoiceNumber();
  const pdf = await renderInvoicePdf({ ...input, invoiceNumber });
  return { invoiceNumber, pdf };
}

// Invoices are stored as bytes in Postgres (not on local disk) because the
// app runs on serverless hosting, where the filesystem is read-only/ephemeral
// outside of build time.
export async function saveInvoiceForAppointment(input: {
  appointment: Appointment;
  customer: Customer;
  settings: DashboardSettings;
  invoiceNumber?: string;
}): Promise<InvoiceResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await ensureSchema({ force: true });
  const invoice = await createInvoicePdf(input);
  const sql = getSql();

  await sql`
    INSERT INTO invoices (
      id, "appointmentId", "invoiceNumber", amount, currency, "pdfData"
    )
    VALUES (
      ${invoiceId()}, ${input.appointment.id}, ${invoice.invoiceNumber},
      ${input.appointment.total}, 'DKK', ${invoice.pdf}
    )
    ON CONFLICT ("appointmentId")
    DO UPDATE SET
      "invoiceNumber" = EXCLUDED."invoiceNumber",
      amount = EXCLUDED.amount,
      currency = EXCLUDED.currency,
      "pdfData" = EXCLUDED."pdfData"
  `;

  await sql`
    UPDATE appointments
    SET invoice_status = 'ready',
        invoice_number = ${invoice.invoiceNumber},
        updated_at = NOW()
    WHERE id = ${input.appointment.id}
  `;

  return invoice;
}

// Creates the invoice number/row without rendering a PDF, so that viewing the
// HTML invoice (and booking creation) never depends on pdfkit succeeding.
// The PDF binary is rendered lazily, only when someone actually downloads it.
export async function ensureInvoiceRecord(input: {
  appointment: Appointment;
  customer: Customer;
}): Promise<{ invoiceNumber: string }> {
  if (!isDatabaseConfigured()) {
    return {
      invoiceNumber:
        input.appointment.invoiceNumber ||
        `EV-${input.appointment.id.slice(-8).toUpperCase()}`,
    };
  }

  await ensureSchema({ force: true });
  const sql = getSql();
  const [existing] = await sql<Array<{ invoiceNumber: string }>>`
    SELECT "invoiceNumber" FROM invoices WHERE "appointmentId" = ${input.appointment.id} LIMIT 1
  `;
  if (existing) return { invoiceNumber: existing.invoiceNumber };

  const invoiceNumber = input.appointment.invoiceNumber || nextInvoiceNumber();
  await sql`
    INSERT INTO invoices (id, "appointmentId", "invoiceNumber", amount, currency)
    VALUES (${invoiceId()}, ${input.appointment.id}, ${invoiceNumber}, ${input.appointment.total}, 'DKK')
    ON CONFLICT ("appointmentId") DO NOTHING
  `;
  await sql`
    UPDATE appointments
    SET invoice_number = ${invoiceNumber},
        invoice_status = CASE WHEN invoice_status = 'not_requested' THEN 'ready' ELSE invoice_status END,
        updated_at = NOW()
    WHERE id = ${input.appointment.id}
  `;

  return { invoiceNumber };
}

export async function ensureInvoiceForAppointment(
  appointmentId: string,
): Promise<InvoiceResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await ensureSchema({ force: true });
  const sql = getSql();
  const [existing] = await sql<
    Array<{ invoiceNumber: string; pdfData: Buffer | null }>
  >`
    SELECT "invoiceNumber", "pdfData"
    FROM invoices
    WHERE "appointmentId" = ${appointmentId}
    LIMIT 1
  `;

  if (existing?.pdfData) {
    return { invoiceNumber: existing.invoiceNumber, pdf: existing.pdfData };
  }

  const dashboard = await getAdminDashboardData();
  const appointment = dashboard.appointments.find(
    (item) => item.id === appointmentId,
  );
  if (!appointment) throw new Error("Booking was not found.");
  const customer = dashboard.customers.find(
    (item) => item.id === appointment.customerId,
  );
  if (!customer) throw new Error("Customer was not found.");

  return saveInvoiceForAppointment({
    appointment,
    customer,
    settings: dashboard.settings,
    invoiceNumber:
      existing?.invoiceNumber || appointment.invoiceNumber || undefined,
  });
}
