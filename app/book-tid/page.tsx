import type { Metadata } from "next";
import { EvBookingFlow } from "@/components/booking/ev-booking-flow";
import { JsonLd, SitePage, siteUrl } from "@/components/site/public-site";
import { getBookingConfig } from "@/lib/server/booking-system";
import {
  batteryServiceJsonLd,
  buildBreadcrumbJsonLd,
  businessJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book batteritest af elbil 1300 kr.",
  description:
    "Book batteritest af din elbil. EV-Check.dk kommer ud til dig på Sjælland og leverer professionel PDF-rapport samme dag.",
  alternates: { canonical: `${siteUrl}/book-tid` },
};

export default async function BookPage() {
  const config = await getBookingConfig();

  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          batteryServiceJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Book tid", url: `${siteUrl}/book-tid` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Book batteritest af elbil",
            url: `${siteUrl}/book-tid`,
            inLanguage: "da-DK",
            mainEntity: { "@id": `${siteUrl}/batteritest-elbil#service` },
            potentialAction: {
              "@type": "ReserveAction",
              target: `${siteUrl}/book-tid`,
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
      <EvBookingFlow config={config} />
    </SitePage>
  );
}
