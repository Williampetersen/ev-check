import type { Metadata } from "next";
import { ContactSection, FaqSection, JsonLd, ServicesSection, SitePage, siteUrl } from "@/components/site/public-site";

export const metadata: Metadata = {
  title: "Service | Batteritest, SoH og elbil-diagnose | EV-Check.dk",
  description:
    "Se hvad EV-Check tester: SoH, SoC, cellebalance, temperatur, BMS-status, fejlkoder og professionel PDF-rapport for elbiler.",
  alternates: { canonical: `${siteUrl}/service` },
};

export default function ServicePage() {
  return (
    <SitePage>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Batteritest og systemdiagnose for elbiler",
          provider: { "@type": "LocalBusiness", name: "EV-Check.dk", url: siteUrl },
          areaServed: "Sjælland",
          offers: { "@type": "Offer", price: "1300", priceCurrency: "DKK" },
        }}
      />
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Service</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal sm:text-6xl">
            Batteritest og elbil-diagnose med data, du kan bruge.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Vi tester bilens batterisundhed, opladningsstatus, cellebalance, temperaturer og systemfejl uden at åbne batteriet.
          </p>
        </div>
      </section>
      <ServicesSection />
      <FaqSection />
      <ContactSection booking />
    </SitePage>
  );
}
