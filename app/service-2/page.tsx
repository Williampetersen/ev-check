import { permanentRedirect } from "next/navigation";

export default function LegacyServiceRedirectPage() {
  permanentRedirect("/batteritest-elbil");
}
