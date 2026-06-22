import { NextRequest, NextResponse } from "next/server";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";
import { ensureInvoiceForAppointment } from "@/lib/server/invoices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  const { appointmentId } = await params;
  const token = request.nextUrl.searchParams.get("token") || "";
  const portal = token ? await getCustomerDashboardByToken(token) : null;
  if (!portal) {
    return NextResponse.json({ error: "Ikke godkendt." }, { status: 401 });
  }

  const ownsAppointment = portal.appointments.some(
    (item) => item.id === appointmentId,
  );
  if (!ownsAppointment) {
    return NextResponse.json(
      { error: "Bookingen blev ikke fundet." },
      { status: 404 },
    );
  }

  try {
    const invoice = await ensureInvoiceForAppointment(appointmentId);
    return new NextResponse(new Uint8Array(invoice.pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Fakturaen kunne ikke genereres." },
      { status: 500 },
    );
  }
}
