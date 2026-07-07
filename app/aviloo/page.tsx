import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  CalendarCheck,
  CarFront,
  CheckCircle2,
  FileCheck2,
  FileText,
  Gauge,
  MapPin,
  ScanLine,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  ContactSection,
  JsonLd,
  SectionHeading,
  SitePage,
  siteUrl,
} from "@/components/site/public-site";
import { BookTidTrigger } from "@/components/site/book-tid-button";
import { ButtonLink } from "@/components/ui/button";
import {
  batteryServiceJsonLd,
  brandLogoUrl,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  businessJsonLd,
  seoKeywords,
  servicePrice,
  websiteJsonLd,
} from "@/lib/seo";

const pageUrl = `${siteUrl}/aviloo`;
const pageTitle = "AVILOO i Danmark | Batteritest i København";
const pageDescription =
  "AVILOO-batteritest i Danmark med EV-Check.dk. Få mobil test af elbilens højvoltsbatteri i København og på Sjælland før køb, salg eller leasing.";

const officialSources = [
  "https://aviloo.com/en-us/",
  "https://aviloo.com/en-us/aviloo-business",
  "https://aviloo.com/en-us/read-out-vs-testing",
  "https://aviloo.com/en-us/vehicle-coverage",
  "https://aviloo.com/en-us/aviloo-certified",
];

const avilooKeywords = [
  "AVILOO Danmark",
  "AVILOO i Danmark",
  "AVILOO København",
  "AVILOO Copenhagen",
  "AVILOO batteritest",
  "AVILOO battery test Denmark",
  "AVILOO batteritest København",
  "batteritest København",
  "batteritest før køb af elbil",
  "tjek batteri elbil før køb",
  "check af elektrisk bil før køb",
  "brugt elbil batteritest",
  "uafhængig batteritest elbil",
  "SoH test elbil",
  "State of Health batteri",
  "BMS test elbil",
  "elbil diagnose Sjælland",
];

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [...avilooKeywords, ...seoKeywords],
  alternates: { canonical: pageUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${pageTitle} | EV-Check.dk`,
    description: pageDescription,
    url: pageUrl,
    siteName: "EV-Check.dk",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: `${siteUrl}/billide2.jpeg`,
        width: 1200,
        height: 630,
        alt: "AVILOO batteritest tilsluttet elbil i Danmark",
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
  { label: "Område", value: "København og Sjælland", icon: MapPin },
  { label: "Pris", value: `${servicePrice} kr.`, icon: FileText },
  { label: "Rapport", value: "Samme dag", icon: FileCheck2 },
];

const avilooHighlights = [
  {
    title: "Uafhængig batteridiagnose",
    text: "AVILOO vurderer batteriets tilstand med data fra bilen og egne analysemodeller i stedet for kun at stole på bilens display.",
    icon: ShieldCheck,
  },
  {
    title: "SoH og batteriets reelle stand",
    text: "Rapporten hjælper dig med at forstå State of Health, brugbar kapacitet og om bilen ligger fornuftigt i forhold til alder og brug.",
    icon: Gauge,
  },
  {
    title: "Celle- og systemkontrol",
    text: "Testen kigger på vigtige signaler fra højvoltsbatteriet, blandt andet cellebalance, sensorer, BMS-data, temperaturer og kommunikation.",
    icon: ScanLine,
  },
  {
    title: "Dokumentation før handel",
    text: "En AVILOO-baseret batterirapport giver køber og sælger et mere konkret beslutningsgrundlag før køb, salg, leasing eller bytte.",
    icon: FileCheck2,
  },
];

const buyCheckItems = [
  "Er den viste rækkevidde realistisk, eller er den påvirket af kørestil og temperatur?",
  "Stemmer bilens egen SoH-visning med en uafhængig analyse?",
  "Er der celleubalance, usædvanlige temperaturer eller relevante fejlkoder?",
  "Kan rapporten bruges som dokumentation i prisforhandling eller ved salg?",
  "Er bilen relevant at købe, eller bør du undersøge batteriet dybere først?",
];

const bookingSteps = [
  {
    title: "Book online",
    text: "Vælg privat eller erhverv, udfyld bilens oplysninger, og vælg en ledig tid.",
  },
  {
    title: "Vi kommer til bilen",
    text: "EV-Check kører ud i København, Storkøbenhavn og store dele af Sjælland.",
  },
  {
    title: "AVILOO-testen udføres",
    text: "Udstyret tilsluttes bilens diagnoseport, og relevante batteridata indsamles uden at åbne batteripakken.",
  },
  {
    title: "Du får rapporten",
    text: "Du får en PDF-rapport med målinger, vurdering og praktisk forklaring, typisk samme dag.",
  },
];

const comparisonRows = [
  {
    label: "Bilens display",
    readout:
      "Viser ofte estimeret rækkevidde, som kan ændre sig med temperatur, kørestil og seneste ture.",
    aviloo:
      "Ser på batteriets tilstand med flere datapunkter, så vurderingen ikke kun bygger på rækkeviddetallet.",
  },
  {
    label: "Almindelig BMS-aflæsning",
    readout:
      "Kan give et SoH-tal, men tallet afhænger af producentens logik og datatilgængelighed.",
    aviloo:
      "Giver en uafhængig vurdering og sammenholder flere signaler fra batteri og køretøj.",
  },
  {
    label: "Køb af brugt elbil",
    readout:
      "Du får et øjebliksbillede, men ikke altid forklaring på risiko, ubalance eller afvigelser.",
    aviloo:
      "Du får en rapport, der er nemmere at bruge som dokumentation før køb, salg eller forhandling.",
  },
];

const serviceAreas = [
  "AVILOO København",
  "AVILOO Copenhagen",
  "AVILOO på Sjælland",
  "Batteritest i Storkøbenhavn",
  "Batteritest før køb af brugt elbil",
  "Elbil diagnose hos dig",
];

const avilooFaqs = [
  {
    question: "Kan jeg booke AVILOO-batteritest i Danmark hos EV-Check.dk?",
    answer:
      "Ja. EV-Check.dk tilbyder AVILOO-baseret batteritest i København, Storkøbenhavn og store dele af Sjælland. Du booker online, og vi kommer ud til bilen.",
  },
  {
    question: "Hvad er forskellen på AVILOO og en almindelig BMS-aflæsning?",
    answer:
      "En almindelig BMS-aflæsning viser data fra bilens batteristyring. En AVILOO-baseret diagnose bruger flere datapunkter og en uafhængig analyse, så du får et mere brugbart billede af batteriets tilstand.",
  },
  {
    question: "Er AVILOO relevant før køb af brugt elbil?",
    answer:
      "Ja. Batteriet er en af de dyreste og vigtigste dele af en elbil. En batteritest før køb kan give dokumentation for SoH, BMS-status, cellebalance og andre forhold, som er svære at vurdere på en kort prøvetur.",
  },
  {
    question: "Åbner I batteripakken under testen?",
    answer:
      "Nej. Testen udføres via bilens systemer og diagnoseport. Højvoltsbatteriet åbnes ikke, og testen er en diagnose, ikke en reparation.",
  },
  {
    question: "Hvad koster en AVILOO-baseret batteritest?",
    answer: `Hos EV-Check.dk koster en almindelig mobil batteritest ${servicePrice} kr. inkl. moms for privatkunder. Erhvervskunder kan booke via erhvervsflowet.`,
  },
  {
    question: "Hvor hurtigt får jeg rapporten?",
    answer:
      "Rapporten leveres typisk samme dag som testen. Den kan bruges til at forstå bilens batteritilstand og som dokumentation ved køb, salg eller leasing.",
  },
];

export default function AvilooPage() {
  return (
    <SitePage>
      <JsonLd
        data={[
          businessJsonLd,
          websiteJsonLd,
          batteryServiceJsonLd,
          buildBreadcrumbJsonLd([
            { name: "Forside", url: siteUrl },
            { name: "AVILOO", url: pageUrl },
          ]),
          buildFaqJsonLd(avilooFaqs),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: "AVILOO i Danmark",
            alternateName: [
              "AVILOO Danmark",
              "AVILOO Copenhagen",
              "AVILOO batteritest København",
            ],
            description: pageDescription,
            inLanguage: "da-DK",
            isPartOf: { "@id": `${siteUrl}#website` },
            about: [
              { "@id": `${siteUrl}/batteritest-elbil#service` },
              {
                "@type": "Thing",
                name: "AVILOO Battery Diagnostics",
                sameAs: "https://aviloo.com/en-us/",
              },
              {
                "@type": "Thing",
                name: "Elbil batteritest før køb",
              },
            ],
            mentions: [
              "AVILOO i Danmark",
              "AVILOO København",
              "AVILOO Copenhagen",
              "batteritest før køb af brugt elbil",
              "State of Health elbil",
              "BMS diagnose elbil",
            ],
            mainEntity: { "@id": `${pageUrl}#aviloo-service` },
            citation: officialSources,
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${pageUrl}#aviloo-service`,
            name: "AVILOO-baseret batteritest i Danmark",
            serviceType: "Mobil AVILOO-baseret batteritest og elbil-diagnose",
            category: "Elbil batteridiagnose",
            provider: { "@id": `${siteUrl}#business` },
            areaServed: [
              { "@type": "City", name: "København" },
              { "@type": "AdministrativeArea", name: "Sjælland" },
              { "@type": "Country", name: "Danmark" },
            ],
            offers: {
              "@type": "Offer",
              url: `${siteUrl}/book-tid`,
              price: servicePrice,
              priceCurrency: "DKK",
              availability: "https://schema.org/InStock",
            },
            audience: [
              { "@type": "PeopleAudience", audienceType: "Privatkunder" },
              {
                "@type": "BusinessAudience",
                audienceType:
                  "Bilforhandlere, leasingselskaber og virksomheder",
              },
            ],
            description:
              "EV-Check.dk udfører AVILOO-baseret batteritest af elbiler i København og på Sjælland med SoH, BMS-data, cellebalance, temperaturer, fejlkoder og PDF-rapport.",
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "@id": `${pageUrl}#booking-howto`,
            name: "Sådan booker du AVILOO-batteritest hos EV-Check.dk",
            inLanguage: "da-DK",
            totalTime: "PT3M",
            step: bookingSteps.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: step.title,
              text: step.text,
              url: `${pageUrl}#book-aviloo`,
            })),
          },
        ]}
      />
      <AvilooHero />
      <WhatIsAvilooSection />
      <BeforeBuyingSection />
      <ComparisonSection />
      <CertificateSection />
      <BookingSection />
      <ServiceAreaSection />
      <FaqSection />
      <SourcesSection />
      <ContactSection booking />
    </SitePage>
  );
}

function AvilooHero() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white/70 px-3 py-2 text-xs font-bold tracking-[0.14em] text-sky-800 uppercase shadow-sm shadow-sky-950/5">
            <ShieldCheck className="h-4 w-4" />
            AVILOO i Danmark
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            AVILOO-batteritest i København og på Sjælland
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Få en AVILOO-baseret batteritest af din elbil hos EV-Check.dk. Vi
            kommer ud til bilen i Danmark, tester højvoltsbatteriet og giver dig
            en klar rapport, før du køber, sælger eller vurderer en elektrisk
            bil.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <BookTidTrigger variant="primary" className="h-12 px-5">
              <CalendarCheck className="h-4 w-4" />
              Book AVILOO-test
            </BookTidTrigger>
            <ButtonLink
              href="/batteritest-elbil"
              variant="outline"
              className="h-12 px-5"
            >
              Se hvad vi tester
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
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
            src="/billide2.jpeg"
            alt="AVILOO batteritest tilsluttet en elbil i Danmark"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/18 to-transparent" />
          <div className="absolute top-5 right-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/35 bg-white/85 p-2 shadow-xl shadow-black/20 backdrop-blur sm:h-24 sm:w-24">
            <Image
              src="/badge/aviloo-badge.png"
              alt="AVILOO Certified badge"
              width={84}
              height={84}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="absolute right-0 bottom-0 left-0 p-5 text-white sm:p-6">
            <p className="text-sm font-semibold tracking-[0.14em] text-sky-100 uppercase">
              Batteritest før køb
            </p>
            <p className="mt-2 max-w-md text-2xl font-bold">
              Tjek elbilens batteri før du skriver under.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatIsAvilooSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Hvad er AVILOO?"
            title="Uafhængig diagnose af elbilens vigtigste komponent"
            description="AVILOO er en international teknologi til batteridiagnose af elbiler og plug-in hybrider. Hos EV-Check.dk bruger vi AVILOO som en del af vores mobile batteritest, så du får et bedre beslutningsgrundlag end bilens egen rækkeviddevisning."
          />
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Pointen er enkel: en brugt elbil kan se fin ud, men batteriets
            tilstand afgør meget af bilens værdi, rækkevidde og risiko. AVILOO
            hjælper med at dokumentere batteriets tilstand, så du kan købe,
            sælge eller lease med mere ro i maven.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {avilooHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="glass-card rounded-lg p-5 transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-950/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
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

function BeforeBuyingSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8">
        <div className="relative min-h-[20rem] overflow-hidden rounded-lg shadow-xl shadow-sky-950/8 lg:min-h-[27rem]">
          <Image
            src="/batterycertificateproof.jpg"
            alt="AVILOO battericertifikat som dokumentation før køb af elbil"
            fill
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="Før du køber"
            title="Tjek batteriet før køb af brugt elbil"
            description="Når du køber en brugt elektrisk bil, er en kort prøvetur og et flot display ikke nok. En AVILOO-baseret batteritest hjælper dig med at stille de rigtige spørgsmål, før pengene skifter hænder."
          />
          <div className="mt-7 grid gap-3">
            {buyCheckItems.map((item) => (
              <div
                key={item}
                className="glass-card flex gap-3 rounded-lg p-4 text-sm leading-6 text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <BookTidTrigger variant="primary">
              <CalendarCheck className="h-4 w-4" />
              Book før køb
            </BookTidTrigger>
            <ButtonLink href="/privat" variant="outline">
              Privat batteritest
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AVILOO vs. aflæsning"
          title="Hvorfor en uafhængig batteritest er bedre end kun et SoH-tal"
          description="Et SoH-tal fra bilen kan være nyttigt, men det står sjældent alene. AVILOO er relevant, fordi batteriets reelle tilstand kræver flere datapunkter, modelkendskab og en rapport, der kan forklares."
        />
        <div className="mt-8 overflow-hidden rounded-lg border border-sky-100 bg-white/76 shadow-sm shadow-sky-950/5 backdrop-blur">
          <div className="grid border-b border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-bold text-slate-950 sm:grid-cols-[0.7fr_1fr_1fr] sm:px-5">
            <span>Situation</span>
            <span className="hidden sm:block">Kun aflæsning</span>
            <span className="hidden sm:block">AVILOO-baseret diagnose</span>
          </div>
          <div className="divide-y divide-sky-100">
            {comparisonRows.map((row) => (
              <article
                key={row.label}
                className="grid gap-4 px-4 py-5 sm:grid-cols-[0.7fr_1fr_1fr] sm:px-5"
              >
                <h2 className="font-bold text-slate-950">{row.label}</h2>
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase sm:hidden">
                    Kun aflæsning
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 sm:mt-0">
                    {row.readout}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-sky-700 uppercase sm:hidden">
                    AVILOO-baseret diagnose
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700 sm:mt-0">
                    {row.aviloo}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CertificateSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Rapport og certifikat"
            title="Klar dokumentation til køber, sælger og forhandler"
            description="En AVILOO-baseret rapport gør batteriets tilstand mere konkret. Den kan bruges, når du skal vurdere prisen, forklare bilens stand eller dokumentere, at bilen er testet professionelt."
          />
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              "SoH og batteriets sundhed",
              "BMS-data og relevante signaler",
              "Cellebalance og spændingsafvigelser",
              "Temperaturer og fejlkoder",
              "PDF-rapport med praktisk forklaring",
              "Dokumentation før køb, salg eller leasing",
            ].map((item) => (
              <div
                key={item}
                className="glass-card flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-sky-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[0.78fr_1.22fr]">
          <div className="flex min-h-[16rem] items-center justify-center rounded-lg border border-sky-100 bg-white/80 p-8 shadow-xl shadow-sky-950/8 backdrop-blur">
            <Image
              src="/badge/aviloo-badge.png"
              alt="AVILOO Certified logo for batteritest"
              width={260}
              height={260}
              className="h-auto w-full max-w-[15rem] object-contain"
            />
          </div>
          <div className="relative min-h-[18rem] overflow-hidden rounded-lg shadow-xl shadow-sky-950/8">
            <Image
              src="/badge/carcertificate.jpg"
              alt="AVILOO certificeret batteritest på elbil"
              fill
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingSection() {
  return (
    <section
      id="book-aviloo"
      className="bg-white/36 py-16 backdrop-blur-sm sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Sådan booker du"
              title="Book AVILOO-batteritest online på få minutter"
              description="Du vælger kunde-type, bil, dato og adresse. Derefter kommer EV-Check ud til bilen, tester batteriet og sender rapporten."
            />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <BookTidTrigger variant="primary">
                <CalendarCheck className="h-4 w-4" />
                Book tid
              </BookTidTrigger>
              <ButtonLink href="/erhverv" variant="outline">
                Erhverv og flåde
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bookingSteps.map((step, index) => (
              <article key={step.title} className="glass-card rounded-lg p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h2 className="mt-4 text-base font-bold text-slate-950">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceAreaSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8">
        <div className="relative min-h-[20rem] overflow-hidden rounded-lg shadow-xl shadow-sky-950/8 lg:min-h-[25rem]">
          <Image
            src="/batterywaranty.jpg"
            alt="AVILOO batteritest og dokumentation i Danmark"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="Danmark og København"
            title="AVILOO-batteritest der hvor bilen står"
            description="EV-Check.dk dækker København, Storkøbenhavn og store dele af Sjælland. Det gør testen praktisk, når bilen står hos en privat sælger, forhandler, virksomhed eller hjemme hos dig."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-white/70 px-3 py-2 text-sm font-semibold text-sky-800 shadow-sm shadow-sky-950/5"
              >
                <MapPin className="h-3.5 w-3.5" />
                {area}
              </span>
            ))}
          </div>
          <div className="mt-7 rounded-lg border border-sky-200/80 bg-sky-50/70 p-5 shadow-sm shadow-sky-700/10 backdrop-blur">
            <div className="flex items-start gap-3">
              <SearchCheck className="mt-1 h-5 w-5 shrink-0 text-sky-700" />
              <p className="text-sm leading-6 text-slate-700">
                Søger du efter AVILOO i Copenhagen, AVILOO i Danmark eller
                batteritest før køb af elbil? Det er netop den praktiske løsning
                denne side handler om: mobil AVILOO-baseret diagnose gennem
                EV-Check.dk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Spørgsmål om AVILOO i Danmark"
          description="Kort svar på det kunder typisk spørger om, før de booker AVILOO-baseret batteritest hos EV-Check.dk."
        />
        <div className="mt-8 grid gap-3">
          {avilooFaqs.map((faq) => (
            <details
              key={faq.question}
              className="glass-card group rounded-lg p-5 transition hover:border-sky-200 hover:bg-white/90"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-950">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-sky-700 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SourcesSection() {
  const links = [
    {
      label: "AVILOO officiel hjemmeside",
      href: "https://aviloo.com/en-us/",
      icon: CarFront,
    },
    {
      label: "AVILOO Business og FLASH Test",
      href: "https://aviloo.com/en-us/aviloo-business",
      icon: Zap,
    },
    {
      label: "Read-out vs. Testing",
      href: "https://aviloo.com/en-us/read-out-vs-testing",
      icon: BatteryCharging,
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-sky-100 bg-white/76 p-5 shadow-sm shadow-sky-950/5 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-sky-700 uppercase">
                Kildegrundlag
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Fakta om AVILOO er baseret på officielle AVILOO-sider
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                EV-Check.dk beskriver AVILOO med egne ord og bruger officielle
                AVILOO-kilder som baggrund for information om uafhængig
                batteridiagnose, FLASH Test, certifikat, BMS-aflæsning og
                modeldækning.
              </p>
            </div>
            <div className="grid gap-2 sm:min-w-[21rem]">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-100"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
