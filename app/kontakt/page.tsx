import type { Metadata } from "next";
import { ContactSection, JsonLd, SitePage, siteUrl } from "@/components/site/public-site";

export const metadata: Metadata = {
  title: "Kontakt EV-Check.dk | Book batteritest af elbil",
  description:
    "Kontakt EV-Check.dk for batteritest, elbil-diagnose, PDF-rapport og rådgivning. Telefon +45 71 90 05 30 og info@ev-check.dk.",
  alternates: { canonical: `${siteUrl}/kontakt` },
};

export default function ContactPage() {
  return (
    <SitePage>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Kontakt EV-Check.dk",
          url: `${siteUrl}/kontakt`,
        }}
      />
      <ContactSection />
    </SitePage>
  );
}
