import type { Metadata } from "next";
import { ContactSection, JsonLd, SitePage, TestimonialsSection, siteUrl, testimonials } from "@/components/site/public-site";

export const metadata: Metadata = {
  title: "Hvad vores kunder siger | EV-Check.dk",
  description:
    "Læs kundeoplevelser med EV-Check.dk: professionel batteritest, klar rapport og rådgivning før køb, salg eller fejlfinding på elbil.",
  alternates: { canonical: `${siteUrl}/hvad-vores-kunder-siger` },
};

export default function TestimonialsPage() {
  return (
    <SitePage>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "EV-Check.dk",
          review: testimonials.map((item) => ({
            "@type": "Review",
            author: { "@type": "Person", name: item.name },
            reviewBody: item.quote,
          })),
        }}
      />
      <TestimonialsSection />
      <ContactSection booking />
    </SitePage>
  );
}
