import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  BatteryUseCasesSection,
  ContactSection,
  DiagnosticDetailsSection,
  FaqSection,
  HowItWorks,
  JsonLd,
  ServiceAreaSection,
  ServicesSection,
  SitePage,
} from "@/components/site/public-site";
import { ButtonLink } from "@/components/ui/button";
import {
  batteryServiceJsonLd,
  buildBreadcrumbJsonLd,
  businessJsonLd,
  seoKeywords,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/batteritest-elbil`;
const pageDescription =
  "Batteritest af elbil på Sjælland. Få målt SoH, BMS-status, cellebalance, temperaturer og fejlkoder med mobil test og professionel PDF-rapport.";

export const metadata: Metadata = {
  title: "Batteritest elbil | SoH, BMS og PDF-rapport",
  description: pageDescription,
  keywords: seoKeywords,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Batteritest af elbil på Sjælland | EV-Check.dk",
    description: pageDescription,
    url: pageUrl,
    siteName: "EV-Check.dk",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: `${siteUrl}/wp/ev-car-danmark-1.png`,
        width: 1200,
        height: 630,
        alt: "EV-Check batteritest af elbil på Sjælland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Batteritest af elbil | EV-Check.dk",
    description: pageDescription,
    images: [`${siteUrl}/wp/ev-car-danmark-1.png`],
  },
};

export default function BatteryTestPage() {
  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          batteryServiceJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Batteritest elbil", url: pageUrl },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: "Batteritest af elbil på Sjælland",
            description: pageDescription,
            inLanguage: "da-DK",
            isPartOf: { "@id": `${siteUrl}#website` },
            about: { "@id": `${pageUrl}#service` },
            mainEntity: { "@id": `${pageUrl}#service` },
          },
        ]}
      />
      <BatteryTestHero />
      <BatteryUseCasesSection />
      <DiagnosticDetailsSection />
      <ServicesSection compact />
      <HowItWorks />
      <ServiceAreaSection />
      <FaqSection />
      <ContactSection booking />
    </SitePage>
  );
}

function BatteryTestHero() {
  const facts = [
    { label: "Pris", value: "1300 kr.", icon: CheckCircle2 },
    { label: "Område", value: "Sjælland", icon: MapPin },
    { label: "Rapport", value: "Samme dag", icon: FileText },
  ];

  return (
    <section className="relative isolate overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-800 shadow-sm shadow-teal-950/5">
            <ShieldCheck className="h-4 w-4" />
            Mobil elbil-diagnose
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            Batteritest af elbil på Sjælland
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Få en professionel vurdering af højvoltsbatteriets tilstand med SoH,
            BMS-data, cellebalance og PDF-rapport. En oplagt test før køb eller
            salg af brugt elbil.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/book-tid" className="h-12 px-5">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest
            </ButtonLink>
            <ButtonLink href="/kontakt" variant="outline" className="h-12 px-5">
              Spørg om din bil
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label}
                  className="glass-card rounded-lg p-4 text-slate-950"
                >
                  <Icon className="h-5 w-5 text-teal-700" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-lg font-bold">{fact.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="shadow-teal-950/12 relative min-h-[22rem] overflow-hidden rounded-lg shadow-2xl sm:min-h-[30rem]">
          <Image
            src="/wp/ev-car-danmark-1.png"
            alt="Batteritest af elbil med EV-Check.dk"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div className="from-slate-950/68 absolute inset-0 bg-gradient-to-t via-slate-950/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-100">
              SoH, BMS og rapport
            </p>
            <p className="mt-2 max-w-md text-2xl font-bold">
              Klar dokumentation uden værkstedsbesøg.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
