import { NextRequest, NextResponse } from "next/server";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";
import { getReportPdf } from "@/lib/server/reports";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const ownedReport = portal.reports.find((item) => item.id === id);
  if (!ownedReport) {
    return NextResponse.json(
      { error: "Rapporten blev ikke fundet." },
      { status: 404 },
    );
  }

  if (ownedReport.paymentStatus === "unpaid") {
    return NextResponse.json(
      {
        error:
          "Betaling er ikke modtaget endnu. Betal fakturaen for at se og downloade din rapport.",
      },
      { status: 402 },
    );
  }

  const report = await getReportPdf(id);
  if (!report || report.paymentStatus === "unpaid") {
    return NextResponse.json(
      { error: "Rapporten blev ikke fundet." },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(report.pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${report.fileName}"`,
      "cache-control": "no-store",
    },
  });
}
