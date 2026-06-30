import { randomBytes } from "crypto";
import { MAX_CUSTOMER_REPORTS, type CustomerReport } from "@/lib/ev-domain";
import { ensureSchema, getSql, isDatabaseConfigured } from "@/lib/server/db";

const MAX_REPORT_PDF_BYTES = 4 * 1024 * 1024;

const reportId = () => `rpt_${randomBytes(8).toString("hex")}`;

const dateKey = (value: unknown) =>
  value ? new Date(value as string).toISOString().slice(0, 10) : "";

function mapReportRow(row: any): CustomerReport {
  return {
    id: row.id,
    customerId: row.customer_id,
    title: row.title || "",
    fileName: row.file_name || "",
    fileSize: Number(row.file_size || 0),
    sentAt: dateKey(row.sent_at),
    createdAt: dateKey(row.created_at),
  };
}

export async function saveReportForCustomer(input: {
  customerId: string;
  title: string;
  file: File;
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

  const [row] = await sql<any[]>`
    INSERT INTO customer_reports (id, customer_id, title, file_name, file_size, pdf_data)
    VALUES (
      ${reportId()}, ${input.customerId}, ${title}, ${input.file.name},
      ${buffer.length}, ${buffer}
    )
    RETURNING id, customer_id, title, file_name, file_size, sent_at, created_at
  `;
  return mapReportRow(row);
}

export async function getReportPdf(
  reportId: string,
): Promise<{ pdf: Buffer; fileName: string; title: string; customerId: string } | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema({ force: true });
  const sql = getSql();
  const [row] = await sql<any[]>`
    SELECT customer_id, title, file_name, pdf_data
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
  };
}

export async function getReportMeta(
  reportId: string,
): Promise<CustomerReport | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSchema({ force: true });
  const sql = getSql();
  const [row] = await sql<any[]>`
    SELECT id, customer_id, title, file_name, file_size, sent_at, created_at
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
