import { permanentRedirect } from "next/navigation";

export default function LegacyBookingRedirectPage() {
  permanentRedirect("/book-tid");
}
