import { randomBytes } from "crypto";
import {
  MAX_CUSTOMER_REPORTS,
  type CustomerReport,
  type ReportPaymentStatus,
} from "@/lib/ev-domain";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";

const MAX_REPORT_PDF_BYTES = 4 * 1024 * 1024;

const reportId = () => `rpt_${randomBytes(8).toString("hex")}`;

const dateKey = (value: unknown) =>
  value ? new Date(value as string).toISOString().slice(0, 10) : "";

export function normalizeReportPaymentStatus(value: unknown): ReportPaymentStatus {
  return value === "unpaid" ? "unpaid" : "paid";
}

function mapReportRow(row: any): CustomerReport {
  return {
    id: row.id,
    customerId: row.customer_id,
    title: row.title || "",
    fileName: row.file_name || "",
    fileSize: Number(row.file_size || 0),
    paymentStatus: normalizeReportPaymentStatus(row.payment_status),
    sentAt: dateKey(row.sent_at),
    createdAt: dateKey(row.created_at),
  };
}

export async function saveReportForCustomer(input: {
  customerId: string;
  title: string;
  file: File;
  paymentStatus?: ReportPaymentStatus;
}): Promise<CustomerReport> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!input.file || input.file.size === 0) {
    throw new Error("Vælg en PDF-fil.");
  }
  if (input.file.type !== "application/pdf") {
    throw new Error("Rapporten skal være en PDF-fil.");
  }
  if (input.file.size > MAX_REPORT_PDF_BYTES) {
    throw new Error("PDF-filen er for stor. Maks 4 MB.");
  }

  await ensureSchema({ force: true });
  const sql = getSql();

  const [{ count }] = await sql<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS count
    FROM customer_reports
    WHERE customer_id = ${input.customerId}
  `;
  if (Number(count) >= MAX_CUSTOMER_REPORTS) {
    throw new Error(
      `Denne kunde har allerede ${MAX_CUSTOMER_REPORTS} rapporter. Slet en gammel rapport for at tilføje en ny.`,
    );
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const title = input.title.trim() || input.file.name.replace(/\.pdf$/i, "");
  const paymentStatus = normalizeReportPaymentStatus(input.paymentStatus);

  const [row] = await sql<any[]>`
    INSERT INTO customer_reports (id, customer_id, title, file_name, file_size, pdf_data, payment_status)
    VALUES (
      ${reportId()}, ${input.customerId}, ${title}, ${input.file.name},
      ${buffer.length}, ${buffer}, ${paymentStatus}
    )
    RETURNING id, customer_id, title, file_name, file_size, payment_status, sent_at, created_at
  `;
  return mapReportRow(row);
}

export async function getReportPdf(reportId: string): Promise<{
  pdf: Buffer;
  fileName: string;
  title: string;
  customerId: string;
  paymentStatus: ReportPaymentStatus;
} | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema({ force: true });
  const sql = getSql();
  const [row] = await sql<any[]>`
    SELECT customer_id, title, file_name, pdf_data, payment_status
    FROM customer_reports
    WHERE id = ${reportId}
    LIMIT 1
  `;
  if (!row || !row.pdf_data) return null;
  return {
    pdf: row.pdf_data,
    fileName: row.file_name || `${row.title || "rapport"}.pdf`,
    title: row.title || "",
    customerId: row.customer_id,
    paymentStatus: normalizeReportPaymentStatus(row.payment_status),
  };
}

export async function getReportMeta(
  reportId: string,
): Promise<CustomerReport | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema({ force: true });
  const sql = getSql();
  const [row] = await sql<any[]>`
    SELECT id, customer_id, title, file_name, file_size, payment_status, sent_at, created_at
    FROM customer_reports
    WHERE id = ${reportId}
    LIMIT 1
  `;
  return row ? mapReportRow(row) : null;
}

export async function markReportSent(reportId: string) {
  if (!isDatabaseConfigured()) return;
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`
    UPDATE customer_reports SET sent_at = NOW() WHERE id = ${reportId}
  `;
}

export async function updateReportPaymentStatus(
  reportId: string,
  paymentStatus: ReportPaymentStatus,
) {
  if (!isDatabaseConfigured()) return;
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`
    UPDATE customer_reports
    SET payment_status = ${normalizeReportPaymentStatus(paymentStatus)}
    WHERE id = ${reportId}
  `;
}
