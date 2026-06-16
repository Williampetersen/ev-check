import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/server/booking-system";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const serviceId = searchParams.get("serviceId") || "";
  const addonIds = (searchParams.get("addonIds") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  try {
    const slots = await getAvailableSlots({ date, serviceId, addonIds });
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Kunne ikke hente ledige tider." }, { status: 500 });
  }
}
