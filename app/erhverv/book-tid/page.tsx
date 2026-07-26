import type { Metadata } from "next";
import { ErhvervBookingFlow } from "@/components/booking/erhverv-booking-flow";
import { JsonLd, SitePage, siteUrl } from "@/components/site/public-site";
import {
  filterServicesForAudience,
  getBookingConfig,
} from "@/lib/server/booking-system";
import {
  buildBreadcrumbJsonLd,
  businessJsonLd,
  erhvervServiceJsonLd,
  erhvervServicePriceExclVat,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/erhverv/book-tid`;

export const metadata: Metadata = {
  title: "Book erhvervsbooking – pris ekskl. moms",
  description: `Book batteritest til jeres bilflåde online. Tilføj op til 50 biler, vælg ét tidspunkt, og se prisen fra ${erhvervServicePriceExclVat} kr. pr. bil ekskl. moms med CVR-nummer.`,
  alternates: { canonical: pageUrl },
};

// Always read live settings/services/schedule from the database instead of a
// build-time snapshot, so admin dashboard changes show up immediately.
export const dynamic = "force-dynamic";

export default async function ErhvervBookPage() {
  const fullConfig = await getBookingConfig();
  const config = {
    ...fullConfig,
    services: filterServicesForAudience(fullConfig.services, "erhverv"),
  };

  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          erhvervServiceJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Erhverv", url: `${siteUrl}/erhverv` },
            { name: "Book erhvervsbooking", url: pageUrl },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Book batteritest for erhverv",
            url: pageUrl,
            inLanguage: "da-DK",
            mainEntity: { "@id": `${siteUrl}/erhverv#service` },
            potentialAction: {
              "@type": "ReserveAction",
              target: pageUrl,
              object: config.services.map((service) => ({
                "@type": "Offer",
                name: service.title,
                price: service.price,
                priceCurrency: "DKK",
              })),
            },
          },
        ]}
      />
      <ErhvervBookingFlow config={config} />
    </SitePage>
  );
}
