import type { Metadata } from "next";
import { EvBookingFlow } from "@/components/booking/ev-booking-flow";
import { JsonLd, SitePage, siteUrl } from "@/components/site/public-site";
import { getBookingConfig } from "@/lib/server/booking-system";

export const metadata: Metadata = {
  title: "Book tid | Batteritest af elbil 1300 kr. | EV-Check.dk",
  description:
    "Book batteritest af din elbil. EV-Check.dk kommer ud til dig på Sjælland og leverer professionel PDF-rapport samme dag.",
  alternates: { canonical: `${siteUrl}/book-tid` },
};

export default async function BookPage() {
  const config = await getBookingConfig();

  return (
    <SitePage>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ReservationPackage",
          name: "Book batteritest af elbil",
          provider: { "@type": "LocalBusiness", name: "EV-Check.dk" },
          offers: config.services.map((service) => ({
            "@type": "Offer",
            name: service.title,
            price: service.price,
            priceCurrency: "DKK",
          })),
        }}
      />
      <EvBookingFlow config={config} />
    </SitePage>
  );
}
