import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateBookingServiceRecord } from "@/lib/server/booking-system";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";
import { fileToDataUrl } from "@/lib/server/uploads";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = verifySessionToken(cookies().get(ADMIN_COOKIE_NAME)?.value, "admin");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    const formData = await request.formData();
    const removeImage = Boolean(formData.get("remove_image"));
    const uploadedImage = await fileToDataUrl(formData.get("image") as File | null);
    const imageData = uploadedImage || (removeImage ? "" : null);

    await updateBookingServiceRecord(params.id, {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      badge: String(formData.get("badge") || ""),
      durationMinutes: Number(formData.get("duration_minutes") || 15),
      price: Number(formData.get("price") || 0),
      imageData,
      features: String(formData.get("features") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    return NextResponse.redirect(new URL("/admin?view=services&saved=service", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin?view=services&error=1", request.url), 303);
  }
}
