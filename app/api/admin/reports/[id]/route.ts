import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getReportPdf } from "@/lib/server/reports";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const runtime = "nodejs";

export async function GET(
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
  const report = await getReportPdf(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(report.pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${report.fileName}"`,
      "cache-control": "no-store",
    },
  });
}
