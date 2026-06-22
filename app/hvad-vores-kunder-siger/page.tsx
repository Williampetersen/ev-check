import type { Metadata } from "next";
import {
  ContactSection,
  JsonLd,
  SitePage,
  TestimonialsSection,
  siteUrl,
} from "@/components/site/public-site";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kundeoplevelser med batteritest af elbil",
  description:
    "Læs kundeoplevelser med EV-Check.dk: professionel batteritest, klar rapport og rådgivning før køb, salg eller fejlfinding på elbil.",
  alternates: { canonical: `${siteUrl}/hvad-vores-kunder-siger` },
};

export default function TestimonialsPage() {
  return (
    <SitePage>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            {
              name: "Kundeoplevelser",
              url: `${siteUrl}/hvad-vores-kunder-siger`,
            },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Kundeoplevelser med batteritest af elbil",
            url: `${siteUrl}/hvad-vores-kunder-siger`,
            inLanguage: "da-DK",
          },
        ]}
      />
      <TestimonialsSection />
      <ContactSection booking />
    </SitePage>
  );
}
