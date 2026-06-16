import { NextResponse } from "next/server";
import { getBookingConfig } from "@/lib/server/booking-system";

export async function GET() {
  const config = await getBookingConfig();

  return NextResponse.json(config, {
    headers: {
      "cache-control": "public, max-age=30, s-maxage=120, stale-while-revalidate=600",
    },
  });
}
