import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BatteryCharging,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Facebook,
  FileText,
  Gauge,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Twitter,
  UserRound,
  Zap,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HowItWorksSection } from "@/components/site/how-it-works-section";
import { MobileNav } from "@/components/site/mobile-nav";
import { brandLogoPath, companyCvr, sameAsLinks, siteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

export { siteUrl };

export const navItems = [
  { href: "/", label: "Forside" },
  { href: "/batteritest-elbil", label: "Batteritest" },
  { href: "/om-ev-check", label: "Om EV-Check" },
  { href: "/hvad-vores-kunder-siger", label: "Kunder" },
  { href: "/kontakt", label: "Kontakt" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: sameAsLinks[0],
    icon: Instagram,
    hoverColor: "#E1306C",
  },
  {
    label: "Facebook",
    href: sameAsLinks[1],
    icon: Facebook,
    hoverColor: "#1877F2",
  },
  {
    label: "LinkedIn",
    href: sameAsLinks[2],
    icon: Linkedin,
    hoverColor: "#0A66C2",
  },
  {
    label: "X",
    href: sameAsLinks[3],
    icon: Twitter,
    hoverColor: "#111827",
  },
  {
    label: "Trustpilot",
    href: sameAsLinks[4],
    icon: Star,
    hoverColor: "#00B67A",
  },
];

export const services = [
  {
    title: "SoH og kapacitet",
    text: "State of Health viser, hvor meget brugbar batterikapacitet bilen reelt har tilbage.",
    icon: BatteryCharging,
  },
  {
    title: "Rækkevidde og SoC",
    text: "Vi kontrollerer ladestatus, rækkeviddedata og om bilens egne tal hænger sammen.",
    icon: Gauge,
  },
  {
    title: "Cellebalance",
    text: "Celle- eller modulubalance kan påvirke rækkevidde, ydelse og bilens værdi.",
    icon: Zap,
  },
  {
    title: "Temperatur og belastning",
    text: "Vi ser efter ujævn varme og forhold, der kan forkorte batteriets levetid.",
    icon: Clock,
  },
  {
    title: "BMS og OBD-data",
    text: "Vi læser relevante signaler fra batteristyringen og tjekker fejlkoder.",
    icon: ShieldCheck,
  },
  {
    title: "Klar batterirapport",
    text: "Du får målinger, konklusion og beslutningsgrundlag samlet i én PDF.",
    icon: FileText,
  },
];

export const faqs = [
  {
    question: "Hvad er en batteritest, og hvad indeholder rapporten?",
    answer:
      "En batteritest er en digital diagnose af elbilens højvoltsbatteri. Vi måler blandt andet SoH, SoC, cellebalance, temperaturer og relevante BMS-fejlkoder. Efter testen får du en professionel PDF-rapport.",
  },
  {
    question: "Skader testen batteriet eller garantien?",
    answer:
      "Nej. Testen udføres via bilens systemer. Batteripakken åbnes ikke, og testen påvirker hverken batteriets levetid eller bilens garanti.",
  },
  {
    question: "Hvor lang tid tager en batteritest?",
    answer:
      "Selve testen er sat til 15 minutter. Rapport og praktisk gennemgang afhænger af bilmodel og adgang til data.",
  },
  {
    question: "Hvilke bilmærker tester I?",
    answer:
      "Vi tester alle elbiler, herunder Tesla, BYD, Polestar, Volkswagen ID, Kia, Hyundai og andre populære elbilmodeller.",
  },
  {
    question: "Hvor udfører I testen?",
    answer: "Vi kører ud til dig på Sjælland, herunder København og omegn.",
  },
  {
    question: "Hvad koster en batteritest?",
    answer:
      "Batteritest af elbil koster 1300 kr. og bookes som en fast 15 minutters service.",
  },
  {
    question: "Hvornår giver en batteritest mest mening?",
    answer:
      "En batteritest er særligt relevant før køb eller salg af en brugt elbil, ved mistanke om lavere rækkevidde, før garantien udløber eller når du ønsker dokumentation for batteriets tilstand.",
  },
  {
    question: "Er EV-Check en reparation eller en diagnose?",
    answer:
      "EV-Check er en diagnose og vurdering af batteriets data. Vi åbner ikke batteripakken og udfører ikke reparationer, men rapporten kan bruges som dokumentation over for køber, sælger eller værksted.",
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

const heroFacts = [
  { label: "Fast pris", value: "1300 kr.", icon: CheckCircle2 },
  { label: "Testtid", value: "15 min.", icon: Clock },
  { label: "PDF-rapport", value: "Samme dag", icon: FileText },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 px-4 py-3 text-slate-950 shadow-[0_18px_60px_rgba(14,116,184,0.10)] backdrop-blur-xl sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src={brandLogoPath}
                alt="EV-Check.dk logo"
                width={48}
                height={48}
                className="shrink-0 rounded-xl bg-white object-contain"
                priority
              />
              <div className="min-w-0">
                <span className="font-display block truncate text-base font-bold text-slate-950 sm:text-lg">
                  EV-Check.dk
                </span>
                <span className="hidden text-xs font-semibold text-sky-700 min-[420px]:block">
                  Mobil batteritest
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-sky-50 hover:text-sky-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/min-konto"
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-800"
              >
                <UserRound className="h-4 w-4" />
                Min konto
              </Link>
              <Link
                href="/book-tid"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(14,116,184,0.24)] transition hover:bg-sky-600"
              >
                <CalendarCheck className="h-4 w-4" />
                Book tid
              </Link>
            </div>

            <div className="lg:hidden">
              <MobileNav items={navItems} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-4 pt-8 pb-8 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 px-6 py-10 text-slate-900 shadow-[0_18px_60px_rgba(14,116,184,0.10)] backdrop-blur-xl sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <Image
                src={brandLogoPath}
                alt="EV-Check.dk logo"
                width={52}
                height={52}
                className="rounded-xl bg-white object-contain"
              />
              <div>
                <p className="font-display text-xl font-bold">EV-Check.dk</p>
                <p className="text-xs font-semibold tracking-[0.16em] text-sky-700 uppercase">
                  Batteritest af elbiler
                </p>
              </div>
            </div>
            <h2 className="font-display mt-5 text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
              Mobil batteritest på Sjælland med klar rapport.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              EV-Check kommer ud til dig privat, på jobbet eller der hvor bilen
              holder. Book online på få minutter og få professionel
              batteridiagnose uden værkstedsbesøg.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-[0.18em] text-slate-500 uppercase">
              Hurtige links
            </h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-sky-800"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/book-tid" className="transition hover:text-sky-800">
                Book batteritest
              </Link>
              <Link
                href="/cookiepolitik"
                className="transition hover:text-sky-800"
              >
                Cookiepolitik
              </Link>
              <a
                href="mailto:info@ev-check.dk"
                className="transition hover:text-sky-800"
              >
                Skriv til os
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-[0.18em] text-slate-500 uppercase">
              Kontakt
            </h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
              <a
                href="tel:+4571900530"
                className="transition hover:text-sky-800"
              >
                +45 71 90 05 30
              </a>
              <a
                href="mailto:info@ev-check.dk"
                className="transition hover:text-sky-800"
              >
                info@ev-check.dk
              </a>
              <p>CVR-nummer {companyCvr}</p>
              <p>Alle ugens dage kl. 08-17</p>
              Dækker København, Storkøbenhavn og store dele af Sjælland
            </div>
            <Link
              href="/book-tid"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(14,116,184,0.24)] transition hover:bg-sky-600"
            >
              <CalendarCheck className="h-4 w-4" />
              Book tid
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase">
                Følg os
              </p>
              <div className="mt-3 flex items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="social-btn flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-md"
                      style={
                        { "--ev-social": item.hoverColor } as CSSProperties
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .social-btn:hover { background: var(--ev-social); }
        `}</style>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} EV-Check.dk. Alle rettigheder
            forbeholdes.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/min-konto" className="transition hover:text-sky-800">
              Min konto
            </Link>
            <Link
              href="/cookiepolitik"
              className="transition hover:text-sky-800"
            >
              Cookiepolitik
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SitePage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn("min-h-screen bg-transparent text-slate-900", className)}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-3.5rem)] w-full max-w-[100vw] items-center overflow-hidden text-white sm:min-h-[calc(100svh-4rem)]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/herovideo.mp4"
        poster="/wp/ev-car-danmark-1.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/48 to-slate-950/16" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbfaf5] to-transparent" />
      <div className="relative mx-auto w-full max-w-[100vw] overflow-hidden px-4 py-20 text-center sm:max-w-5xl sm:px-6 sm:py-24 lg:px-8">
        <p className="mx-auto inline-flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center text-[11px] font-bold tracking-[0.12em] text-sky-100 uppercase shadow-lg shadow-black/10 backdrop-blur-xl sm:max-w-full sm:text-xs sm:tracking-[0.16em]">
          <ShieldCheck className="h-4 w-4" />
          <span>Mobil batteritest af elbil på Sjælland</span>
        </p>
        <h1 className="mx-auto mt-5 w-full max-w-[22rem] text-3xl font-bold tracking-normal [text-wrap:balance] sm:max-w-4xl sm:text-6xl lg:text-7xl">
          Batteritest af elbil med klar rapport samme dag
        </h1>
        <p className="mx-auto mt-5 max-w-[19.5rem] text-sm leading-7 text-white/84 sm:max-w-2xl sm:text-lg">
          Få målt SoH, BMS-status, cellebalance og relevante fejlkoder før køb,
          salg eller fejlfinding, uden at du skal på værksted.
        </p>
        <div className="mx-auto mt-8 grid w-full max-w-[19.5rem] gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
          <ButtonLink
            href="/book-tid"
            className="h-12 w-full px-5 shadow-xl shadow-black/30 sm:h-11 sm:w-auto"
          >
            <CalendarCheck className="h-4 w-4" />
            Book batteritest
          </ButtonLink>
          <ButtonLink
            href="/batteritest-elbil"
            variant="secondary"
            className="h-12 w-full border-white/25 bg-white/14 px-5 text-white shadow-xl shadow-black/15 hover:bg-white/22 hover:text-white sm:h-11 sm:w-auto"
          >
            Se hvad vi tester
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mx-auto mt-10 grid w-full max-w-[calc(100vw-2rem)] gap-3 sm:max-w-3xl sm:grid-cols-3">
          {heroFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="rounded-lg border border-white/16 bg-white/10 px-4 py-3 text-left shadow-lg shadow-black/10 backdrop-blur-xl"
              >
                <Icon className="h-4 w-4 text-sky-200" />
                <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-white/58 uppercase">
                  {fact.label}
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {fact.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PriceCard() {
  const points = [
    "State of Health (SoH)",
    "Højvoltsbatteriets tilstand",
    "Cellebalance og temperaturer",
    "Fejlkoder og BMS-status",
    "PDF-rapport inkluderet",
  ];

  return (
    <aside className="glass-shell rounded-lg p-5 text-slate-950 sm:p-6">
      <p className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-xs font-bold tracking-[0.14em] text-sky-700 uppercase">
        <Star className="h-3.5 w-3.5" />
        Fast service
      </p>
      <h2 className="mt-4 text-2xl font-bold">Batteritest af elbil</h2>
      <div className="mt-4 flex items-end gap-2">
        <p className="text-4xl font-bold text-sky-700">1300 kr.</p>
        <p className="pb-1 text-sm font-semibold text-slate-500">mobil test</p>
      </div>
      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 text-sm text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <span>{point}</span>
          </div>
        ))}
      </div>
      <ButtonLink href="/book-tid" className="mt-6 w-full">
        <CalendarCheck className="h-4 w-4" />
        Book tid
      </ButtonLink>
    </aside>
  );
}

export function HowItWorks() {
  return <HowItWorksSection />;
}

export function ServicesSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Det får du"
          title="Et klart billede af højvoltsbatteriets sundhed"
          description="Skjulte batteriproblemer kan påvirke rækkevidde, værdi og driftssikkerhed. Vi gør bilens data lette at forstå, så rapporten kan bruges før køb, salg eller service."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="glass-card rounded-lg p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-950/8"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50/90 text-sky-700 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {service.text}
                </p>
              </article>
            );
          })}
        </div>
        {!compact ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
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
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="relative min-h-[24rem] overflow-hidden rounded-lg shadow-xl shadow-sky-950/8">
          <Image
            src="/wp/teslacertificate.jpg"
            alt="EV-Check certificering og træning"
            fill
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="self-center">
          <SectionHeading
            eyebrow="Din trygge partner"
            title="Uafhængig batterivurdering uden værkstedsbesøg"
            description="Vi arbejder med professionelt diagnoseudstyr og tester digitalt via bilens systemer. Højvoltsbatteriet åbnes ikke."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Tesla-træning",
              "EV Diagnostics Certified",
              "Siden 2021",
              "Alle populære elbiler",
            ].map((item) => (
              <div
                key={item}
                className="glass-card flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 text-sky-600" />
                {item}
              </div>
            ))}
          </div>
          <div className="glass-panel mt-6 rounded-lg p-5">
            <p className="font-semibold text-slate-950">
              Undgå dyre overraskelser
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ville du købe en elbil uden at kende batteriets tilstand? En kort
              batteritest kan give dokumentation, ro og bedre beslutninger.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandsAndCertificate() {
  return (
    <section className="glass-card rounded-lg p-5 sm:p-6">
      <p className="text-sm font-semibold tracking-[0.14em] text-sky-700 uppercase">
        Mærker vi tester
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {brandLogos.map((brand) => (
          <div
            key={brand.src}
            className="flex h-16 items-center justify-center rounded-lg border border-white/70 bg-white/68 p-3 shadow-sm shadow-sky-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
          >
            <Image
              src={brand.src}
              alt={brand.alt}
              width={90}
              height={42}
              sizes="90px"
              className="max-h-10 w-auto object-contain"
            />
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        Vi tester alle elbiler og tilpasser målingen efter model, systemdata og
        batteristyring.
      </p>
    </section>
  );
}

const batteryUseCases = [
  {
    title: "Før køb af brugt elbil",
    text: "Få dokumentation for batteriets sundhed, før du skriver under. Det er især nyttigt ved Tesla, BYD, Polestar, Volkswagen ID, Kia og Hyundai.",
    icon: ShieldCheck,
  },
  {
    title: "Før salg eller bytte",
    text: "En batterirapport gør det lettere at forklare bilens reelle stand og kan give køber mere tryghed.",
    icon: FileText,
  },
  {
    title: "Ved mistanke om lav rækkevidde",
    text: "Hvis bilen mister rækkevidde, oplader mærkeligt eller viser advarsler, kan en diagnose give et klart næste skridt.",
    icon: Gauge,
  },
];

const diagnosticRows = [
  {
    label: "SoH / State of Health",
    value:
      "Indikation af hvor meget batterikapacitet bilen har tilbage i forhold til ny tilstand.",
  },
  {
    label: "SoC og ladedata",
    value:
      "Kontrol af opladningsstatus, rækkeviddedata og relevante signaler fra bilen.",
  },
  {
    label: "Cellebalance",
    value:
      "Gennemgang af ubalancer, som kan påvirke ydelse, rækkevidde og batteriets drift.",
  },
  {
    label: "Temperaturer",
    value:
      "Tjek af batteriets temperaturdata for at se efter afvigelser eller unormale mønstre.",
  },
  {
    label: "BMS og fejlkoder",
    value:
      "Aflæsning af batteristyringens data via bilens systemer, når modellen understøtter det.",
  },
  {
    label: "PDF-rapport",
    value:
      "Samlet dokumentation med målinger, konklusion og praktisk vurdering samme dag.",
  },
];

const serviceAreas = [
  "København",
  "Frederiksberg",
  "Roskilde",
  "Køge",
  "Hillerød",
  "Nordsjælland",
  "Holbæk",
  "Næstved",
  "Sjælland",
];

export function BatteryUseCasesSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hvornår"
          title="Batteritest før køb, salg eller fejlfinding"
          description="Brugte elbiler, SoH og dokumentation er kernebehov i markedet. EV-Check.dk fokuserer på en mobil batteritest med klar rapport på Sjælland."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {batteryUseCases.map((item) => {
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

export function DiagnosticDetailsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Målepunkter"
            title="Hvad viser en batteritest af elbil?"
            description="Rapporten samler de vigtigste batteridata i et format, der er nemt at bruge, når du skal vurdere en brugt elbil eller dokumentere bilens tilstand."
          />
          <ButtonLink href="/book-tid" className="mt-6">
            <CalendarCheck className="h-4 w-4" />
            Book batteritest
          </ButtonLink>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {diagnosticRows.map((row) => (
            <div key={row.label} className="glass-card rounded-lg p-5">
              <dt className="font-bold text-slate-950">{row.label}</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-600">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ServiceAreaSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Område"
            title="Mobil batteritest i København og på Sjælland"
            description="Vi kommer ud til bilen, så du ikke behøver planlægge et værkstedsbesøg for at få en professionel batteridiagnose og rapport."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="rounded-lg border border-sky-200/80 bg-white/70 px-3 py-2 text-sm font-semibold text-sky-800 shadow-sm shadow-sky-950/5"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-shell rounded-lg p-5 sm:p-6">
          <MapPin className="h-8 w-8 text-sky-700" />
          <h2 className="mt-4 text-2xl font-bold text-slate-950">
            Vi kommer til bilen
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Testen kan udføres hjemme, på arbejdspladsen eller dér, hvor bilen
            står. Det gør batteritesten nem at bruge før en handel eller som
            dokumentation, når rækkevidden føles forkert.
          </p>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-white/36 py-16 backdrop-blur-sm sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kunder"
          title="Klar rapport, tryggere beslutning"
          description="Kunder bruger EV-Check før køb, salg og fejlfinding, når batteriets reelle tilstand skal være dokumenteret."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="glass-card rounded-lg p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-950/8"
            >
              <div className="flex gap-1 text-sky-600" aria-label="5 stjerner">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                “{item.quote}”
              </p>
              <div className="mt-5 border-t border-sky-100 pt-4">
                <p className="font-bold text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
                <p className="mt-1 text-xs font-semibold tracking-wide text-sky-700 uppercase">
                  {item.date}
                </p>
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
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Spørgsmål om batteritest"
          description="Kort og praktisk svar på det, kunder typisk spørger om før en test."
        />
        <div className="mt-8 grid gap-3">
          {faqs.map((faq) => (
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

export function ContactSection({ booking = false }: { booking?: boolean }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow={booking ? "Book tid" : "Kontakt"}
            title={booking ? "Klar til batteritest?" : "Kontakt EV-Check.dk"}
            description={
              booking
                ? "Book direkte online, eller skriv kort om bilen, så hjælper vi med næste ledige tid."
                : "Skriv kort om bilen, så vender vi tilbage med praktisk information."
            }
          />
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <ContactLine
              icon={Phone}
              text="+45 71 90 05 30"
              href="tel:+4571900530"
            />
            <ContactLine
              icon={Mail}
              text="info@ev-check.dk"
              href="mailto:info@ev-check.dk"
            />
            <ContactLine icon={MapPin} text="København og Sjælland" />
            <ContactLine icon={Clock} text="Svar samme dag på hverdage" />
          </div>
        </div>
        <form
          action="/tak"
          method="GET"
          className="glass-panel rounded-lg p-5 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fulde navn">
              <Input name="navn" required />
            </Field>
            <Field label="Telefonnummer">
              <Input name="telefon" type="tel" required />
            </Field>
            <Field label="E-mailadresse">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Bilmærke">
              <select
                name="maerke"
                className="h-12 w-full rounded-lg border border-slate-200/90 bg-white/85 px-3 text-base backdrop-blur transition outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 sm:h-10 sm:text-sm"
              >
                {[
                  "Tesla",
                  "BYD",
                  "Polestar",
                  "Kia",
                  "Volkswagen",
                  "Hyundai",
                  "Anden elbil",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Bilmodel">
              <Input name="model" />
            </Field>
            <Field label="Adresse for test">
              <Input name="adresse" placeholder="Gade, by" />
            </Field>
            <Field label="Besked" className="sm:col-span-2">
              <Textarea
                name="besked"
                placeholder="Skriv gerne model, årgang og hvornår bilen ønskes testet."
              />
            </Field>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <input
              required
              type="checkbox"
              className="mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Jeg accepterer vilkår og betingelser og giver EV-Check lov til at
            kontakte mig vedrørende min henvendelse.
          </label>
          <Button type="submit" className="mt-5 w-full sm:w-auto">
            {booking ? "Send forespørgsel" : "Send besked"}
            <ArrowRight className="h-4 w-4" />
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
    <span className="glass-card flex items-center gap-3 rounded-lg px-4 py-3 transition hover:border-sky-200 hover:bg-white/90">
      <Icon className="h-4 w-4 text-sky-700" />
      <span>{text}</span>
    </span>
  );
  return href ? <a href={href}>{content}</a> : content;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "grid gap-1.5 text-sm font-semibold text-slate-700",
        className,
      )}
    >
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
      <p className="text-sm font-bold tracking-[0.14em] text-sky-700 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
