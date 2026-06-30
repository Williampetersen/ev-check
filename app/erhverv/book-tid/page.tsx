import type { Metadata } from "next";
import { ErhvervBookingFlow } from "@/components/booking/erhverv-booking-flow";
import { JsonLd, SitePage, siteUrl } from "@/components/site/public-site";
import { getBookingConfig } from "@/lib/server/booking-system";
import {
  buildBreadcrumbJsonLd,
  businessJsonLd,
  erhvervDiscountPercent,
  erhvervServiceJsonLd,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/erhverv/book-tid`;

export const metadata: Metadata = {
  title: `Book erhvervsbooking – ${erhvervDiscountPercent}% rabat`,
  description:
    "Book batteritest til jeres bilflåde online. Tilføj op til 50 biler, vælg ét tidspunkt, og få automatisk 15% erhvervsrabat med CVR-nummer.",
  alternates: { canonical: pageUrl },
};

export default async function ErhvervBookPage() {
  const config = await getBookingConfig();

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
                price: Math.round(service.price * (1 - erhvervDiscountPercent / 100)),
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
