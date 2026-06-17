import type { Metadata } from "next";
import {
  AboutSection,
  ContactSection,
  FaqSection,
  HeroSection,
  HowItWorks,
  JsonLd,
  ServicesSection,
  SitePage,
  TestimonialsSection,
  faqs,
  siteUrl,
} from "@/components/site/public-site";

export const metadata: Metadata = {
  title: "EV-Check.dk | Professionel batteritest og elbil-diagnose på Sjælland",
  description:
    "Få testet elbilens batteri, SoH, SoC, cellebalance, temperatur og BMS-status. EV-Check.dk kører ud på Sjælland og leverer professionel PDF-rapport.",
  keywords: [
    "batteritest elbil",
    "EV Check",
    "elbil diagnose",
    "SoH test",
    "Tesla batteritest",
    "batterirapport elbil",
    "København",
    "Sjælland",
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "EV-Check.dk | Batteritest af elbiler",
    description: "Professionel batteritest og elbil-diagnose med rapport samme dag. Vi kører ud til dig på Sjælland.",
    url: siteUrl,
    siteName: "EV-Check.dk",
    locale: "da_DK",
    type: "website",
    images: [{ url: `${siteUrl}/wp/ev-car-danmark-1.png`, width: 1200, height: 630, alt: "EV-Check batteritest af elbil" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV-Check.dk | Batteritest af elbiler",
    description: "Få klar besked om din elbils batteri med professionel diagnose og PDF-rapport.",
    images: [`${siteUrl}/wp/ev-car-danmark-1.png`],
  },
};

export default function Home() {
  return (
    <SitePage>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "EV-Check.dk",
            url: siteUrl,
            image: `${siteUrl}/wp/ev-check-dk.png`,
            telephone: "+45 71 90 05 30",
            email: "info@ev-check.dk",
            address: {
              "@type": "PostalAddress",
              addressLocality: "København",
              addressCountry: "DK",
            },
            areaServed: ["København", "Sjælland", "Danmark"],
            priceRange: "DKK 1300",
            description: "Professionel batteritest og elbil-diagnose med PDF-rapport.",
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Batteritest og systemdiagnose for elbiler",
            provider: { "@type": "LocalBusiness", name: "EV-Check.dk" },
            areaServed: "Sjælland",
            offers: { "@type": "Offer", price: "1300", priceCurrency: "DKK" },
            description: "Test af SoH, SoC, cellebalance, temperatur, BMS-status og fejlkoder for elbiler.",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />
      <HeroSection />
      <HowItWorks />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection booking />
    </SitePage>
  );
}
