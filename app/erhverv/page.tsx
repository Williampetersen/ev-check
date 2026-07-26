import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Phone,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  ContactSection,
  DiagnosticDetailsSection,
  FaqSection,
  JsonLd,
  SectionHeading,
  ServiceAreaSection,
  SitePage,
} from "@/components/site/public-site";
import { ButtonLink } from "@/components/ui/button";
import {
  calculateServiceCharge,
  formatPrice,
  type ServiceChargeBreakdown,
} from "@/lib/ev-domain";
import {
  filterServicesForAudience,
  getBookingConfig,
} from "@/lib/server/booking-system";
import {
  brandLogoUrl,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  businessJsonLd,
  erhvervSeoKeywords,
  erhvervServiceJsonLd,
  erhvervServicePriceExclVat,
  seoKeywords,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/erhverv`;
const pageTitle = "Batteritest af elbil for erhverv – pris ekskl. moms";
const pageDescription = `Batteritest af elbil og plug-in hybrid for virksomheder, leasingselskaber og bilforhandlere. Mobil test hos jer, PDF-rapport pr. bil og fast pris fra ${erhvervServicePriceExclVat} kr. ekskl. moms. Bestil tid online i dag.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [...erhvervSeoKeywords, ...seoKeywords],
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
        url: `${siteUrl}/wp/17739.jpg`,
        width: 1200,
        height: 630,
        alt: "Batteritest af elbil for erhverv og firmaflåder med EV-Check.dk",
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

const erhvervFaqs = [
  {
    question: "Hvem kan booke batteritest som erhvervskund?",
    answer:
      "Virksomheder, leasingselskaber, bilforhandlere, flådeejere og andre med et gyldigt CVR-nummer kan booke som erhvervskund til en fast pris pr. bil.",
  },
  {
    question: "Er prisen inkl. eller ekskl. moms?",
    answer:
      "Prisen for erhverv vises ekskl. moms. Moms lægges automatisk til, når I booker, så I altid ser den fulde pris, før I bekræfter. Fakturaen viser pris ekskl. moms, moms og totalpris hver for sig.",
  },
  {
    question: "Kan I teste flere biler i flåden samme dag?",
    answer:
      "Ja. Vi planlægger gerne ét samlet besøg, hvor vi tester flere biler efter hinanden hos jer, på depotet eller hos leasingselskabet, så driften forstyrres mindst muligt.",
  },
  {
    question: "Hvordan foregår faktureringen for virksomheder?",
    answer:
      "I modtager én samlet faktura til virksomheden med betalingsfrist på 8 dage, uanset om I får testet én bil eller hele flåden.",
  },
  {
    question: "Er der binding eller et minimumsantal biler?",
    answer:
      "Nej. I kan booke en enkelt batteritest eller hele bilflåden uden binding og uden abonnement.",
  },
  {
    question: "Kan rapporten bruges ved videresalg eller leasing-aflevering?",
    answer:
      "Ja. PDF-rapporten er uvildig og dokumenterer batteriets SoH, BMS-status og fejlkoder. Den kan bruges over for køber, leasingselskab eller revisor.",
  },
  {
    question: "Hvordan booker vi som erhvervskund i dag?",
    answer:
      "Brug vores dedikerede erhvervsbooking online: tilføj alle jeres biler, vælg ét tidspunkt, og udfyld virksomhedens oplysninger med CVR-nummer. Prisen ekskl. moms samt moms og totalpris beregnes automatisk, og I kan også skrive til os på info@ev-check.dk, hvis I foretrækker det.",
  },
  {
    question: "Hvor i landet udfører I erhvervstest?",
    answer:
      "Vi kører ud til virksomheder, depoter og leasingselskaber i København, Storkøbenhavn og store dele af Sjælland.",
  },
];

const heroFacts = [
  { label: "Faktura", value: "Samlet til CVR", icon: Receipt },
  { label: "Testtid", value: "15 min./bil", icon: Clock },
  { label: "Booking", value: "100% online", icon: CalendarCheck },
];

const whyErhverv = [
  {
    title: "Flådestyring og leasing",
    text: "Hold styr på batteriets reelle tilstand på tværs af flåden, og undgå ubehagelige overraskelser ved tilbagelevering eller forlængelse af leasingaftaler.",
    icon: Users,
  },
  {
    title: "Bilforhandlere",
    text: "Dokumentér batteriets SoH før videresalg af brugte elbiler, og giv jeres kunder tryghed med en uvildig batterirapport på hver bil.",
    icon: Building2,
  },
  {
    title: "Virksomheder med firmabiler",
    text: "Få overblik over batteritilstanden på firmabilerne, og planlæg service eller udskiftning, før rækkevidden bliver et driftsproblem.",
    icon: ShieldCheck,
  },
  {
    title: "Dokumentation og revision",
    text: "Brug batterirapporterne som dokumentation i flåderegnskabet, ved CSR-rapportering eller når bilparkens værdi skal vurderes.",
    icon: FileCheck2,
  },
];

const bookingSteps = [
  {
    step: "1",
    title: "Book online eller skriv til os",
    text: "Angiv antal biler, ønsket lokation og jeres CVR-nummer. Prisen ekskl. moms samt moms og totalpris beregnes automatisk.",
  },
  {
    step: "2",
    title: "Vi planlægger en fast dag",
    text: "Vi aftaler tid og sted, så testen passer ind i driften, og kan teste flere biler i samme besøg.",
  },
  {
    step: "3",
    title: "Mobil batteritest på stedet",
    text: "Vores tekniker kommer ud til jer, depotet eller leasingselskabet. Hver test tager ca. 15 minutter.",
  },
  {
    step: "4",
    title: "Samlet rapport og faktura",
    text: "I modtager en PDF-rapport pr. bil samme dag samt én samlet faktura til virksomheden med 8 dages betalingsfrist.",
  },
];

const conditions = [
  "Ingen bindingsperiode eller minimumsantal — book én bil eller hele flåden.",
  "Prisen vises ekskl. moms — moms lægges automatisk til ved booking, så I ser den fulde pris før I bekræfter.",
  "Fakturaen viser pris ekskl. moms, moms og totalpris hver for sig.",
  "Samlet fakturering til virksomheden med betalingsfrist på 8 dage.",
  "Vi kommer ud til jer — på adressen, depotet eller hvor bilerne holder.",
  "Testen tager ca. 15 minutter pr. bil og kan udføres på flere biler samme dag.",
  "PDF-rapport leveres pr. bil, typisk samme dag som testen.",
  "Testen åbner ikke batteripakken og påvirker hverken garanti eller bilens drift.",
];

export const dynamic = "force-dynamic";

export default async function ErhvervPage() {
  const fullConfig = await getBookingConfig();
  const erhvervServices = filterServicesForAudience(
    fullConfig.services,
    "erhverv",
  );
  const service = erhvervServices[0];
  const vatPercent = fullConfig.settings.vat.percent;
  const charge = service
    ? calculateServiceCharge(service, 1, fullConfig.settings.vat)
    : calculateServiceCharge(
        { price: erhvervServicePriceExclVat, priceExcludesVat: true },
        1,
        fullConfig.settings.vat,
      );

  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          erhvervServiceJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "Erhverv", url: pageUrl },
          ]),
          buildFaqJsonLd(erhvervFaqs),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: "Batteritest af elbil for erhverv",
            description: pageDescription,
            inLanguage: "da-DK",
            isPartOf: { "@id": `${siteUrl}#website` },
            about: { "@id": `${pageUrl}#service` },
            mainEntity: { "@id": `${pageUrl}#service` },
          },
        ]}
      />
      <ErhvervHero charge={charge} />
      <PriceBanner charge={charge} vatPercent={vatPercent} />
      <WhyErhvervSection />
      <DiagnosticDetailsSection />
      <BookingStepsSection />
      <ConditionsSection charge={charge} vatPercent={vatPercent} />
      <ServiceAreaSection />
      <FaqSection
        eyebrow="FAQ erhverv"
        title="Spørgsmål om batteritest for virksomheder"
        description="Kort og praktisk svar på det, virksomheder, leasingselskaber og bilforhandlere typisk spørger om."
        items={erhvervFaqs}
      />
      <ContactSection booking />
    </SitePage>
  );
}

function ErhvervHero({ charge }: { charge: ServiceChargeBreakdown }) {
  const heroFactsWithPrice = [
    {
      label: "Fast pris",
      value: `${formatPrice(charge.unitHeadline)} ${charge.unitHeadlineIncludesVat ? "inkl. moms" : "ekskl. moms"}`,
      icon: Wallet,
    },
    ...heroFacts,
  ];

  return (
    <section className="relative isolate overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white/70 px-3 py-2 text-xs font-bold tracking-[0.14em] text-sky-800 uppercase shadow-sm shadow-sky-950/5">
            <Briefcase className="h-4 w-4" />
            Erhverv og flåde
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            Batteritest af elbil for erhverv
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Få en uvildig batteritest af jeres elbiler og plug-in hybrider med
            EV-Check. Vi kommer ud til virksomheden, leasingselskabet eller
            bilforhandleren og leverer en professionel SoH-rapport pr. bil —
            til en fast pris på {formatPrice(charge.unitNet)} ekskl. moms pr.
            bil. Moms lægges automatisk til ved booking.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/erhverv/book-tid" className="h-12 px-5">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest
            </ButtonLink>
            <ButtonLink href="/kontakt" variant="outline" className="h-12 px-5">
              Få et erhvervstilbud
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Privatkund?{" "}
            <Link href="/privat" className="font-semibold text-sky-700 underline-offset-4 hover:underline">
              Se priser og book som privat her
            </Link>
            .
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {heroFactsWithPrice.map((fact) => {
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
            src="/wp/17739.jpg"
            alt="Erhvervskunde får batteritest af firmabil med EV-Check.dk"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/68 via-slate-950/10 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-5 text-white sm:p-6">
            <p className="text-sm font-semibold tracking-[0.14em] text-sky-100 uppercase">
              Til virksomheder og flåder
            </p>
            <p className="mt-2 max-w-md text-2xl font-bold">
              Mobil batteritest uden at forstyrre driften.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceBanner({
  charge,
  vatPercent,
}: {
  charge: ServiceChargeBreakdown;
  vatPercent: number;
}) {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-400/30 bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 px-6 py-10 text-white shadow-[0_24px_70px_rgba(14,116,184,0.32)] sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/15 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.14em] uppercase backdrop-blur">
                <Receipt className="h-4 w-4" />
                Pris for erhverv
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatPrice(charge.unitNet)} ekskl. moms pr. bil
              </h2>
              <p className="mt-3 text-base leading-7 text-white/90">
                Gælder leasingselskaber, bilforhandlere, flådeejere og
                virksomheder med firmabiler. Moms ({vatPercent}%) lægges
                automatisk til ved booking, så I ser den fulde pris —{" "}
                {formatPrice(charge.unitGross)} inkl. moms pr. bil — før I
                bekræfter. Fakturaen viser altid pris ekskl. moms, moms og
                totalpris.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink
                href="/erhverv/book-tid"
                variant="secondary"
                className="h-12 border-white/40 bg-white px-6 text-sky-700 hover:bg-white/90"
              >
                <CalendarCheck className="h-4 w-4" />
                Book batteritest
              </ButtonLink>
              <a
                href="tel:+4571900530"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Phone className="h-4 w-4" />
                Ring og hør mere
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyErhvervSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hvorfor EV-Check"
          title="Batteridokumentation til virksomheder, flåder og forhandlere"
          description="Uanset om I leaser, ejer eller sælger elbiler, giver en batteritest jer et klart og uvildigt billede af batteriets reelle tilstand — til brug i drift, salg eller dokumentation."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyErhverv.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="glass-card rounded-lg p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-950/8"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50/90 text-sky-700 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BookingStepsSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative min-h-[20rem] overflow-hidden rounded-lg shadow-xl shadow-sky-950/8 lg:min-h-[26rem]">
            <Image
              src="/wp/ev-bil-denmark-3.jpg"
              alt="Online booking af batteritest til virksomhedens elbiler"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Sådan booker I"
              title="100% online booking — fra forespørgsel til faktura"
              description="I behøver ikke aflevere bilerne på værksted. Hele forløbet planlægges online, og vi kommer ud til jer med diagnoseudstyret."
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
            <ButtonLink href="/erhverv/book-tid" className="mt-7">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest til jeres flåde
            </ButtonLink>
            <p className="mt-3 text-xs text-slate-500">
              Tilføj alle jeres biler i ét bookingforløb, og se prisen ekskl.
              moms, moms og totalpris beregnet automatisk, før I bekræfter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConditionsSection({
  charge,
  vatPercent,
}: {
  charge: ServiceChargeBreakdown;
  vatPercent: number;
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Vilkår og betingelser"
            title="Betingelser for batteritest som erhvervskund"
            description="Klare og enkle vilkår, så I ved præcis, hvad I får, hvad det koster, og hvordan fakturering foregår."
          />
          <div className="glass-panel mt-6 rounded-lg p-5">
            <div className="flex items-center gap-2 text-sky-700">
              <Receipt className="h-5 w-5" />
              <p className="text-sm font-bold tracking-[0.1em] uppercase">
                Pris pr. bil
              </p>
            </div>
            <p className="mt-3 text-4xl font-bold text-sky-700">
              {formatPrice(charge.unitNet)}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Ekskl. moms. Moms ({vatPercent}%) lægges automatisk til ved
              booking, så totalprisen bliver{" "}
              {formatPrice(charge.unitGross)} inkl. moms pr. bil.
            </p>
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {conditions.map((condition) => (
            <div key={condition} className="glass-card flex gap-3 rounded-lg p-5">
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
