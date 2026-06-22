import type { Metadata } from "next";
import {
  AboutSection,
  BatteryUseCasesSection,
  ContactSection,
  DiagnosticDetailsSection,
  FaqSection,
  HeroSection,
  HowItWorks,
  JsonLd,
  ServicesSection,
  SitePage,
  TestimonialsSection,
  siteUrl,
} from "@/components/site/public-site";
import {
  batteryServiceJsonLd,
  businessJsonLd,
  seoKeywords,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Batteritest af elbil på Sjælland | EV-Check.dk",
  description:
    "Mobil batteritest af elbil på Sjælland. Få SoH, BMS-data, cellebalance og PDF-rapport før køb, salg eller fejlfinding.",
  keywords: seoKeywords,
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Batteritest af elbil på Sjælland | EV-Check.dk",
    description:
      "Professionel batteritest og elbil-diagnose med rapport samme dag. Vi kører ud til dig på Sjælland.",
    url: siteUrl,
    siteName: "EV-Check.dk",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: `${siteUrl}/wp/ev-car-danmark-1.png`,
        width: 1200,
        height: 630,
        alt: "EV-Check batteritest af elbil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Batteritest af elbil | EV-Check.dk",
    description:
      "Få klar besked om din elbils batteri med professionel diagnose og PDF-rapport.",
    images: [`${siteUrl}/wp/ev-car-danmark-1.png`],
  },
};

export default function Home() {
  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          batteryServiceJsonLd,
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${siteUrl}#webpage`,
            url: siteUrl,
            name: "Batteritest af elbil på Sjælland",
            inLanguage: "da-DK",
            isPartOf: { "@id": `${siteUrl}#website` },
            mainEntity: { "@id": `${siteUrl}/batteritest-elbil#service` },
          },
        ]}
      />
      <HeroSection />
      <HowItWorks />
      <BatteryUseCasesSection />
      <DiagnosticDetailsSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection booking />
    </SitePage>
  );
}
