import { readFile } from "fs/promises";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureInvoiceForAppointment } from "@/lib/server/invoices";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export async function GET(
  request: Request,
  { params }: { params: { appointmentId: string } },
) {
  const session = verifySessionToken(
    cookies().get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    const invoice = await ensureInvoiceForAppointment(params.appointmentId);
    const file = await readFile(invoice.pdfPath);
    return new NextResponse(file, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/admin?view=invoices&error=1", request.url), 303);
  }
}
