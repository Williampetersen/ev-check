import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/seo";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { sendCustomerReportReadyEmail } from "@/lib/server/mail";
import { getReportMeta, markReportSent } from "@/lib/server/reports";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const { id } = await params;

  try {
    const report = await getReportMeta(id);
    if (!report) throw new Error("Report not found.");

    const dashboard = await getAdminDashboardData();
    const customer = dashboard.customers.find(
      (item) => item.id === report.customerId,
    );
    if (!customer) throw new Error("Customer not found.");

    const portalUrl = `${siteUrl}/kunde/${customer.portalToken || customer.id}`;
    await sendCustomerReportReadyEmail({
      customer,
      settings: dashboard.settings,
      portalUrl,
      reportTitle: report.title,
    });
    await markReportSent(id);

    return NextResponse.redirect(
      new URL("/admin?view=reports&saved=email", request.url),
      303,
    );
  } catch (error) {
    console.error("Failed to send report notification email", error);
    return NextResponse.redirect(
      new URL("/admin?view=reports&error=1", request.url),
      303,
    );
  }
}
