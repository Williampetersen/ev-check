import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveReportForCustomer } from "@/lib/server/reports";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const customerId = String(formData.get("customer_id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file");

  if (!customerId || !(file instanceof File)) {
    return NextResponse.redirect(
      new URL("/admin?view=reports&error=1", request.url),
      303,
    );
  }

  try {
    await saveReportForCustomer({ customerId, title, file });
    return NextResponse.redirect(
      new URL("/admin?view=reports&saved=report", request.url),
      303,
    );
  } catch (error) {
    console.error("Failed to save customer report", error);
    return NextResponse.redirect(
      new URL("/admin?view=reports&error=1", request.url),
      303,
    );
  }
}
