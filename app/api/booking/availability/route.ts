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

  // Optional: total block duration for group/fleet bookings
  // (e.g. 5 cars × 15 min = 75 min). When provided, availability is
  // computed for the full block so the customer picks a single start time.
  const rawBlock = searchParams.get("blockDurationMinutes");
  const blockDurationMinutes = rawBlock ? Math.max(1, Number(rawBlock)) : undefined;

  try {
    const slots = await getAvailableSlots({
      date,
      serviceId,
      addonIds,
      blockDurationMinutes,
    });
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke hente ledige tider." },
      { status: 500 },
    );
  }
}
