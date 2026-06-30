import { NextRequest, NextResponse } from "next/server";
import { createErhvervBooking } from "@/lib/server/booking-system";
import { erhvervBookingCreateSchema } from "@/lib/server/booking-validation";

export async function POST(request: NextRequest) {
  try {
    const input = erhvervBookingCreateSchema.parse(await request.json());
    const booking = await createErhvervBooking(input);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erhvervsbookingen kunne ikke oprettes.";
    const status =
      message.includes("databaseops") || message.includes("mangler database")
        ? 503
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
