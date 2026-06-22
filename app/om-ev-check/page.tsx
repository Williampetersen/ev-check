import type { Metadata } from "next";
import {
  AboutSection,
  BrandsAndCertificate,
  ContactSection,
  JsonLd,
  SitePage,
  siteUrl,
} from "@/components/site/public-site";
import { buildBreadcrumbJsonLd, businessJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Om os og certificeret elbil batteridiagnose",
  description:
    "EV-Check.dk udfører professionel batteritest af elbiler på Sjælland med certificerede teknikere, Tesla-træning og værkstedsniveau udstyr.",
  alternates: { canonical: `${siteUrl}/om-ev-check` },
};

export default function AboutPage() {
  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Om EV-Check", url: `${siteUrl}/om-ev-check` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Om EV-Check.dk",
            url: `${siteUrl}/om-ev-check`,
            inLanguage: "da-DK",
            about: { "@id": `${siteUrl}#business` },
          },
        ]}
      />
      <section className="px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
        <div className="glass-shell mx-auto max-w-7xl rounded-lg p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700">
            Om EV-Check
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal sm:text-6xl">
            Din trygge partner i elbil-batteridiagnose.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Vi giver elbilejere, købere og forhandlere et klart indblik i
            batteriets reelle tilstand og bilens tekniske data.
          </p>
        </div>
      </section>
      <AboutSection />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <BrandsAndCertificate />
      </div>
      <ContactSection />
    </SitePage>
  );
}
