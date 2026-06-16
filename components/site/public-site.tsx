import Image from "next/image";
import Link from "next/link";
import {
  BatteryCharging,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const siteUrl = "https://ev-check.dk";

export const navItems = [
  { href: "/", label: "Forside" },
  { href: "/service", label: "Service" },
  { href: "/om-ev-check", label: "Om EV-Check" },
  { href: "/hvad-vores-kunder-siger", label: "Kunder" },
  { href: "/kontakt", label: "Kontakt" },
];

export const services = [
  {
    title: "Batteriets sundhed (SoH)",
    text: "Vi måler batteriets reelle kapacitet i forhold til, da bilen var ny.",
    icon: BatteryCharging,
  },
  {
    title: "Opladningstilstand (SoC)",
    text: "Vi kontrollerer opladningsniveau, ladestatus og om bilen rapporterer værdierne korrekt.",
    icon: Zap,
  },
  {
    title: "Celle-spændingsbalance",
    text: "Vi ser efter ubalance mellem cellerne, som kan påvirke rækkevidde og ydeevne.",
    icon: Wrench,
  },
  {
    title: "Batteri- og modultemperatur",
    text: "Vi tjekker for ujævn varme eller overophedning, som kan reducere batteriets levetid.",
    icon: Clock,
  },
  {
    title: "Fejlkoder og BMS-status",
    text: "Vi læser relevante fejlkoder direkte fra bilens batteristyring og systemer.",
    icon: ShieldCheck,
  },
  {
    title: "Professionel PDF-rapport",
    text: "Du modtager en overskuelig rapport med data, konklusion og dokumentation.",
    icon: FileText,
  },
];

export const faqs = [
  {
    question: "Hvad er en batteritest, og hvad indeholder rapporten?",
    answer:
      "En batteritest er en ikke-invasiv diagnose af elbilens højvoltsbatteri. Vi måler blandt andet SoH, SoC, celle-spændingsbalance, temperaturer og relevante BMS-fejlkoder. Efter testen får du en professionel PDF-rapport.",
  },
  {
    question: "Skader testen batteriet eller garantien?",
    answer:
      "Nej. Testen udføres digitalt via bilens systemer. Batteripakken åbnes ikke, og testen påvirker hverken batteriets levetid eller bilens garanti.",
  },
  {
    question: "Hvor lang tid tager en batteritest?",
    answer:
      "Typisk tager testen 15-40 minutter afhængigt af bilmærke, model og adgang til bilens data. Rapporten leveres normalt samme dag.",
  },
  {
    question: "Hvilke bilmærker tester I?",
    answer:
      "Vi tester alle elbiler, herunder Tesla, BYD, Polestar, Volkswagen ID, Kia, Hyundai og andre populære elbilmodeller.",
  },
  {
    question: "Hvor udfører I testen?",
    answer:
      "Vi kører ud til dig på Sjælland, herunder København og omegn. Testen kan udføres hjemme hos dig, på arbejdet eller et andet egnet sted.",
  },
  {
    question: "Hvad koster en batteritest?",
    answer:
      "Standard batteri- og systemdiagnose koster fra 950 kr. Prisen kan afhænge af bilmodel, placering og opgavens omfang.",
  },
];

export const testimonials = [
  {
    quote:
      "Fantastisk service. Teknikeren kom ud samme dag og leverede en detaljeret rapport om min Tesla. Nu ved jeg præcis, hvordan batteriet har det.",
    name: "Mikkel",
    detail: "Tesla Model 3 ejer",
    date: "10. november 2025",
  },
  {
    quote:
      "Jeg fik testet min BYD Atto 3 før køb. Rapporten var professionel og let at forstå, så jeg kunne træffe en tryg beslutning.",
    name: "Sofie",
    detail: "København",
    date: "24. november 2025",
  },
  {
    quote:
      "Super professionelt setup. EV-Check fandt en celle-ubalance, som værkstedet ikke havde opdaget. Helt klart pengene værd.",
    name: "Jonas",
    detail: "Polestar 2 ejer",
    date: "13. december 2025",
  },
];

const brandLogos = [
  { src: "/wp/teslalogo.png", alt: "Tesla elbil batteritest" },
  { src: "/wp/bydlogo.png", alt: "BYD elbil batteritest" },
  { src: "/wp/polestarlogo.png", alt: "Polestar elbil batteritest" },
  { src: "/wp/vwlogo.png", alt: "Volkswagen ID batteritest" },
  { src: "/wp/kialogo.png", alt: "Kia elbil batteritest" },
  { src: "/wp/hyundailogo.png", alt: "Hyundai elbil batteritest" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/wp/ev-check-dk.png" alt="EV-Check.dk logo" width={42} height={42} className="rounded-xl" />
          <span className="font-display text-lg font-bold text-slate-950">EV-Check.dk</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 hover:text-teal-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/min-konto" variant="outline" className="hidden sm:inline-flex">
            Se rapport
          </ButtonLink>
          <ButtonLink href="/book-tid">Book tid</ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/wp/ev-check-dk.png" alt="EV-Check.dk logo" width={40} height={40} className="rounded-xl bg-white" />
            <p className="font-display text-lg font-bold">EV-Check.dk</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Professionel batteritest og elbil-diagnose på Sjælland. Vi kommer ud til dig og leverer en klar rapport uden at åbne batteriet.
          </p>
        </div>
        <div>
          <p className="font-semibold">Kontakt</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <a href="tel:+4536212370" className="hover:text-teal-300">+45 36 21 23 70</a>
            <a href="mailto:info@ev-check.dk" className="hover:text-teal-300">info@ev-check.dk</a>
            <span>København, Danmark</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">Sider</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-teal-300">
                {item.label}
              </Link>
            ))}
            <Link href="/cookiepolitik" className="hover:text-teal-300">Cookiepolitik</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SitePage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("min-h-screen bg-slate-50", className)}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-40">
        <Image src="/wp/ev-car-danmark-1.png" alt="Elbil klar til batteritest i Danmark" fill priority className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/35" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm font-semibold text-teal-200">
            Professionel batteritest af elbiler
          </p>
          <h1 className="max-w-4xl text-5xl font-bold tracking-normal sm:text-6xl lg:text-7xl">
            Få klar besked om din elbils batteri på få minutter.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            EV-Check.dk tester batteriets sundhed, kapacitet og systemstatus med professionelt diagnoseudstyr. Vi kommer ud til dig på Sjælland, og du får en tydelig PDF-rapport.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/book-tid">Book din test nu</ButtonLink>
            <ButtonLink href="/min-konto" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white hover:text-slate-950">
              Se din rapport
            </ButtonLink>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
            <HeroFact value="950 kr." label="fra-pris for test" />
            <HeroFact value="15-40 min." label="typisk testtid" />
            <HeroFact value="Sjælland" label="vi kører ud" />
          </div>
        </div>
        <PriceCard />
      </div>
    </section>
  );
}

function HeroFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="mt-1 text-slate-300">{label}</p>
    </div>
  );
}

export function PriceCard() {
  const points = [
    "Professionel test af batteriets sundhed (SoH)",
    "Opladningstilstand (SoC) og cellebalance",
    "Temperaturmåling på batteri og moduler",
    "Kontrol af fejl- og BMS-status",
    "PDF-rapport med alle resultater",
    "Vi kører ud til din adresse",
  ];

  return (
    <aside className="rounded-3xl border border-white/70 bg-white/95 p-5 text-slate-950 shadow-2xl shadow-teal-950/20">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Mest valgt</p>
      <h2 className="mt-3 text-2xl font-bold">Batteri- og systemdiagnose</h2>
      <div className="mt-4 flex items-end gap-2">
        <p className="text-4xl font-bold">950 kr.</p>
        <p className="pb-1 text-sm text-slate-500">inkl. rapport</p>
      </div>
      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 text-sm text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>{point}</span>
          </div>
        ))}
      </div>
      <ButtonLink href="/book-tid" className="mt-6 w-full">Book din test nu</ButtonLink>
    </aside>
  );
}

export function HowItWorks() {
  const steps = [
    ["Book online", "Vælg den tid, der passer dig. Det tager under 1 minut."],
    ["Vi kommer til dig", "Vi udfører testen hjemme hos dig eller på din arbejdsplads."],
    ["Rapport samme dag", "Du modtager en klar batterirapport med målinger og konklusion."],
  ];
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Sådan fungerer det" title="En enkel proces uden værkstedsbesøg" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <article key={title} className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 font-bold text-white">{index + 1}</span>
              <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Vores services"
          title="Batteritest og elbil-diagnose med klare svar"
          description="Vi tester de vigtigste data omkring batteri, opladning og bilens batteristyring, så du kan købe, sælge eller eje elbil med større tryghed."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.text}</p>
              </article>
            );
          })}
        </div>
        {!compact ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <PriceCard />
            <BrandsAndCertificate />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="relative min-h-[24rem] overflow-hidden rounded-3xl">
          <Image src="/wp/teslacertificate.jpg" alt="EV-Check certificering og træning" fill className="object-cover" />
        </div>
        <div className="self-center">
          <SectionHeading
            eyebrow="Din trygge partner"
            title="Certificerede EV-teknikere med erfaring siden 2021"
            description="Vi arbejder efter professionelle procedurer og bruger diagnostisk udstyr på værkstedsniveau. Testen sker digitalt uden at åbne batteriet."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Officiel Tesla-træning", "EV Diagnostics Certified", "Over 4 års erfaring", "Sikkerheds- og producentstandarder"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">Udvikling</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
              <li>2021 - Certificering hos Tesla Body Repair Training Center</li>
              <li>2022 - Grundlagt: EV-Check.dk</li>
              <li>2023-2025 - Diagnostik af Tesla, BYD, Polestar, VW, Kia, Hyundai m.fl.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandsAndCertificate() {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Mærker vi tester</p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {brandLogos.map((brand) => (
          <div key={brand.src} className="flex h-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <Image src={brand.src} alt={brand.alt} width={90} height={42} className="max-h-10 w-auto object-contain" />
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        Vi tester alle elbiler og tilpasser målingen efter bilens model, adgang til systemdata og batteristyring.
      </p>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kundeoplevelser"
          title="Hvad vores kunder siger om EV-Check"
          description="Vi hjælper elbilejere, købere og forhandlere med præcis batteridiagnose og professionel rådgivning."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <p className="text-base leading-7 text-slate-700">“{item.quote}”</p>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="font-bold text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-700">{item.date}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Spørgsmål om batteritest for elbiler"
          description="Svar på de mest almindelige spørgsmål om SoH, SoC, rapport, garanti og booking."
        />
        <div className="mt-8 grid gap-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-white/70 bg-white p-5 shadow-sm shadow-slate-200/60">
              <summary className="cursor-pointer list-none font-bold text-slate-950">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-teal-700 group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection({ booking = false }: { booking?: boolean }) {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow={booking ? "Book tid" : "Kontakt"}
            title={booking ? "Book batteritest af din elbil" : "Kontakt EV-Check.dk"}
            description="Fortæl kort om din elbil og hvad du ønsker hjælp til. Vi vender tilbage med næste ledige tid og praktisk information."
          />
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <ContactLine icon={Phone} text="+45 36 21 23 70" href="tel:+4536212370" />
            <ContactLine icon={Mail} text="info@ev-check.dk" href="mailto:info@ev-check.dk" />
            <ContactLine icon={MapPin} text="København, Danmark - vi dækker hele Sjælland" />
            <ContactLine icon={Clock} text="Vi bestræber os på at svare samme dag på hverdage" />
          </div>
        </div>
        <form action="/tak" method="GET" className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fulde navn"><Input name="navn" required /></Field>
            <Field label="Telefonnummer"><Input name="telefon" type="tel" required /></Field>
            <Field label="E-mailadresse"><Input name="email" type="email" required /></Field>
            <Field label="Bilmærke">
              <select name="maerke" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10">
                {["Tesla", "BYD", "Polestar", "Kia", "Volkswagen", "Hyundai", "Anden elbil"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Bilmodel"><Input name="model" /></Field>
            <Field label="Adresse for inspektion"><Input name="adresse" placeholder="Gade, by" /></Field>
            <Field label="Besked" className="sm:col-span-2">
              <Textarea name="besked" placeholder="Fortæl gerne mærke, model, årgang og hvad du ønsker testet." />
            </Field>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <input required type="checkbox" className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            Jeg accepterer, at EV-Check må kontakte mig vedrørende min henvendelse.
          </label>
          <Button type="submit" className="mt-5 w-full sm:w-auto">
            {booking ? "Send bookingforespørgsel" : "Send besked"}
          </Button>
        </form>
      </div>
    </section>
  );
}

function ContactLine({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-sm shadow-slate-200/60">
      <Icon className="h-4 w-4 text-teal-700" />
      <span>{text}</span>
    </span>
  );
  return href ? <a href={href}>{content}</a> : content;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-semibold text-slate-700", className)}>
      {label}
      {children}
    </label>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
