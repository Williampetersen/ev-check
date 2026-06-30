import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  BatteryUseCasesSection,
  ContactSection,
  DiagnosticDetailsSection,
  FaqSection,
  JsonLd,
  PriceCard,
  SectionHeading,
  ServiceAreaSection,
  SitePage,
  TestimonialsSection,
  faqs,
  siteUrl,
} from "@/components/site/public-site";
import { ButtonLink } from "@/components/ui/button";
import {
  batteryServiceJsonLd,
  brandLogoUrl,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  businessJsonLd,
  privatSeoKeywords,
  seoKeywords,
  servicePrice,
  websiteJsonLd,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/privat`;
const pageTitle = "Batteritest af elbil til privatkunder – book online";
const pageDescription = `Få en uvildig batteritest af din elbil eller plug-in hybrid med EV-Check. Fast pris ${servicePrice} kr., mobil test hos dig og PDF-rapport samme dag. Bestil tid online i dag.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [...privatSeoKeywords, ...seoKeywords],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `${pageTitle} | EV-Check.dk`,
    description: pageDescription,
    url: pageUrl,
    siteName: "EV-Check.dk",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: `${siteUrl}/wp/17740.jpg`,
        width: 1200,
        height: 630,
        alt: "Privatkunde får batteritest af sin elbil med EV-Check.dk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | EV-Check.dk`,
    description: pageDescription,
    images: [brandLogoUrl],
  },
};

const heroFacts = [
  { label: "Fast pris", value: `${servicePrice} kr.`, icon: Wallet },
  { label: "Testtid", value: "15 min.", icon: Clock },
  { label: "Rapport", value: "Samme dag", icon: FileText },
  { label: "Binding", value: "Ingen", icon: CheckCircle2 },
];

const trustPoints = [
  { label: "Uvildig test", icon: ShieldCheck },
  { label: "Vi kommer til dig", icon: Home },
  { label: "Book på 3 minutter", icon: Smartphone },
];

const bookingSteps = [
  {
    step: "1",
    title: "Vælg bil og service",
    text: "Angiv bilmærke og model online, og se prisen med det samme.",
  },
  {
    step: "2",
    title: "Vælg dato og tid",
    text: "Se ledige tider live, og book det tidspunkt der passer dig bedst.",
  },
  {
    step: "3",
    title: "Mobil batteritest hos dig",
    text: "Vores tekniker kommer ud til adressen. Selve testen tager ca. 15 minutter.",
  },
  {
    step: "4",
    title: "Få din PDF-rapport",
    text: "Du modtager en professionel batterirapport, typisk samme dag som testen.",
  },
];

const conditions = [
  `Fast pris ${servicePrice} kr. inkl. moms — ingen skjulte gebyrer.`,
  "Ingen binding eller abonnement. Book én test, når du har brug for det.",
  "Vi kommer hjem til dig, på arbejdspladsen eller der, hvor bilen holder.",
  "Testen tager ca. 15 minutter og kræver ikke et værkstedsbesøg.",
  "PDF-rapport leveres typisk samme dag som testen.",
  "Testen åbner ikke batteripakken og påvirker hverken garanti eller bilens drift.",
  "Betaling foregår nemt efter testen er udført.",
  "Book online på få minutter — vælg bil, dato og tidspunkt selv.",
];

export default function PrivatPage() {
  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          batteryServiceJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Privat", url: pageUrl },
          ]),
          buildFaqJsonLd(faqs),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: "Batteritest af elbil til privatkunder",
            description: pageDescription,
            inLanguage: "da-DK",
            isPartOf: { "@id": `${siteUrl}#website` },
            about: { "@id": `${siteUrl}/batteritest-elbil#service` },
            mainEntity: { "@id": `${siteUrl}/batteritest-elbil#service` },
          },
        ]}
      />
      <PrivatHero />
      <BatteryUseCasesSection />
      <DiagnosticDetailsSection />
      <PrivatBookingStepsSection />
      <ConditionsSection />
      <ServiceAreaSection />
      <TestimonialsSection />
      <FaqSection
        eyebrow="FAQ privat"
        title="Spørgsmål fra privatkunder"
        description="Kort og praktisk svar på det, private bilejere typisk spørger om før en batteritest."
        items={faqs}
      />
      <ContactSection booking />
    </SitePage>
  );
}

function PrivatHero() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white/70 px-3 py-2 text-xs font-bold tracking-[0.14em] text-sky-800 uppercase shadow-sm shadow-sky-950/5">
            <ShieldCheck className="h-4 w-4" />
            Til privatkunder
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            Batteritest af elbil til private
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Få en uvildig batteritest af din elbil eller plug-in hybrid, uden
            at du skal på værksted. Vi kommer hjem til dig eller på
            arbejdspladsen, og du får en klar PDF-rapport samme dag.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/book-tid" className="h-12 px-5">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest
            </ButtonLink>
            <ButtonLink
              href="/batteritest-elbil"
              variant="outline"
              className="h-12 px-5"
            >
              Se hvad vi tester
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Booker du for en virksomhed?{" "}
            <Link
              href="/erhverv"
              className="font-semibold text-sky-700 underline-offset-4 hover:underline"
            >
              Se erhvervsrabat og flådebooking her
            </Link>
            .
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {heroFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label}
                  className="glass-card rounded-lg p-4 text-slate-950"
                >
                  <Icon className="h-5 w-5 text-sky-700" />
                  <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-lg font-bold">{fact.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative min-h-[22rem] overflow-hidden rounded-lg shadow-2xl shadow-sky-950/12 sm:min-h-[30rem]">
          <Image
            src="/wp/17740.jpg"
            alt="Privatkunde får batteritest af sin elbil med EV-Check.dk"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/68 via-slate-950/10 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-5 text-white sm:p-6">
            <p className="text-sm font-semibold tracking-[0.14em] text-sky-100 uppercase">
              Til private bilejere
            </p>
            <p className="mt-2 max-w-md text-2xl font-bold">
              Tryg besked om batteriet uden værkstedsbesøg.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivatBookingStepsSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative min-h-[20rem] overflow-hidden rounded-lg shadow-xl shadow-sky-950/8 lg:min-h-[26rem]">
            <Image
              src="/wp/2149169765.jpg"
              alt="Book batteritest af elbil online som privatkunde"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Sådan booker du"
              title="Book din batteritest online på få minutter"
              description="Hele forløbet foregår online — fra du booker, til du har en bekræftet tid og kan se frem til din rapport."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {bookingSteps.map((item) => (
                <div key={item.step} className="glass-card rounded-lg p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
            <ButtonLink href="/book-tid" className="mt-7">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest nu
            </ButtonLink>
            <div className="mt-5 flex flex-wrap gap-3">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <span
                    key={point.label}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-sky-800 shadow-sm shadow-sky-950/5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {point.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConditionsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Vilkår og betingelser"
            title="Betingelser for batteritest som privatkund"
            description="Enkle vilkår uden overraskelser, så du ved præcis, hvad du får, og hvad det koster."
          />
          <div className="mt-6">
            <PriceCard />
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {conditions.map((condition) => (
            <div
              key={condition}
              className="glass-card flex gap-3 rounded-lg p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
              <dd className="text-sm leading-6 text-slate-700">
                {condition}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
