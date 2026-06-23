import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureInvoiceForAppointment } from "@/lib/server/invoices";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    const { appointmentId } = await params;
    const invoice = await ensureInvoiceForAppointment(appointmentId);
    return new NextResponse(new Uint8Array(invoice.pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to render invoice PDF", error);
    return NextResponse.redirect(new URL("/admin?view=invoices&error=1", request.url), 303);
  }
}
