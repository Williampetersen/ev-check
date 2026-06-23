import type { Metadata } from "next";
import {
  ContactSection,
  JsonLd,
  SitePage,
  siteUrl,
} from "@/components/site/public-site";
import { buildBreadcrumbJsonLd, businessJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kontakt og book batteritest af elbil",
  description:
    "Kontakt EV-Check.dk for batteritest, elbil-diagnose, PDF-rapport og rådgivning. Telefon: +45 71 90 05 30 og info@ev-check.dk",
  alternates: { canonical: `${siteUrl}/kontakt` },
};

export default function ContactPage() {
  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Kontakt", url: `${siteUrl}/kontakt` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Kontakt EV-Check.dk",
            url: `${siteUrl}/kontakt`,
            inLanguage: "da-DK",
            about: { "@id": `${siteUrl}#business` },
          },
        ]}
      />
      <ContactSection />
    </SitePage>
  );
}
