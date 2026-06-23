import { NextRequest, NextResponse } from "next/server";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";
import { ensureInvoiceForAppointment } from "@/lib/server/invoices";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";

export const runtime = "nodejs";

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

  const session = verifySessionToken(
    request.cookies.get(CUSTOMER_COOKIE_NAME)?.value,
    "customer",
  );
  const expectedToken = portal.customer.portalToken || portal.customer.id;
  if (
    !session ||
    session.sub !== expectedToken ||
    session.email.toLowerCase() !== portal.customer.email.toLowerCase()
  ) {
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
        "content-disposition": "inline",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to render invoice PDF", error);
    return NextResponse.json(
      { error: "Fakturaen kunne ikke genereres." },
      { status: 500 },
    );
  }
}
