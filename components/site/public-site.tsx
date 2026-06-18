import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  CalendarCheck,
  Car,
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

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/ev_check.dk?igsh=MTJkbXZ4em5tejBubg%3D%3D&utm_source=qr",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1PK3SGWZbf/?mibextid=wwXIfr",
    icon: Facebook,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/omid-mohebi-8b7644345?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    icon: Linkedin,
  },
  {
    label: "X",
    href: "https://x.com/ev_checkdk",
    icon: Twitter,
  },
  {
    label: "Trustpilot",
    href: "https://dk.trustpilot.com/review/ev-check.dk",
    icon: Star,
  },
];

export const services = [
  {
    title: "Batteriets sundhed",
    text: "SoH viser, hvor meget kapacitet batteriet reelt har tilbage.",
    icon: BatteryCharging,
  },
  {
    title: "Rækkevidde og opladning",
    text: "Vi kontrollerer SoC, ladestatus og om bilens data giver mening.",
    icon: Gauge,
  },
  {
    title: "Cellebalance",
    text: "Ubalance kan påvirke rækkevidde, ydelse og bilens værdi.",
    icon: Zap,
  },
  {
    title: "Temperaturer",
    text: "Vi ser efter ujævn varme og forhold, der kan forkorte levetiden.",
    icon: Clock,
  },
  {
    title: "BMS og fejlkoder",
    text: "Vi læser relevante signaler fra bilens batteristyring.",
    icon: ShieldCheck,
  },
  {
    title: "Klar rapport",
    text: "Du får dokumentation, konklusion og målinger i én PDF.",
    icon: FileText,
  },
];

export const faqs = [
  {
    question: "Hvad er en batteritest, og hvad indeholder rapporten?",
    answer:
      "En batteritest er en digital diagnose af elbilens højspændingsbatteri. Vi måler blandt andet SoH, SoC, cellebalance, temperaturer og relevante BMS-fejlkoder. Efter testen får du en professionel PDF-rapport.",
  },
  {
    question: "Skader testen batteriet eller garantien?",
    answer:
      "Nej. Testen udføres via bilens systemer. Batteripakken åbnes ikke, og testen påvirker hverken batteriets levetid eller bilens garanti.",
  },
  {
    question: "Hvor lang tid tager en batteritest?",
    answer:
      "Selve servicen er sat til 15 minutter. Rapport og praktisk gennemgang afhænger af bilmodel og adgang til data.",
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

const heroBullets = [
  "Dokumentation af batteriets tilstand",
  "Professionel og uafhængig analyse",
  "Ideelt før køb eller salg",
  "Undgå dyre overraskelser",
];

const testMoments = [
  { text: "Før køb af en brugt elbil", icon: Car },
  { text: "Før salg af din elbil", icon: CalendarCheck },
  { text: "Når rækkevidden føles lavere", icon: Gauge },
  { text: "Når du vil kende bilens reelle værdi", icon: ShieldCheck },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 shadow-sm shadow-sky-950/5 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/wp/ev-check-dk.png"
            alt="EV-Check.dk logo"
            width={42}
            height={42}
            className="h-9 w-9 rounded-lg bg-white sm:h-[42px] sm:w-[42px]"
          />
          <span className="truncate font-display text-base font-bold text-slate-950 sm:text-lg">
            EV-Check.dk
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 hover:text-sky-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink
            href="/min-konto"
            variant="outline"
            className="hidden sm:inline-flex"
          >
            <FileText className="h-4 w-4" />
            Rapport
          </ButtonLink>
          <ButtonLink href="/book-tid" className="h-10 px-3 sm:h-10 sm:px-4">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden min-[380px]:inline">Book tid</span>
            <span className="min-[380px]:hidden">Book</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/75 bg-white/60 text-slate-800 shadow-[0_-18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/wp/ev-check-dk.png"
              alt="EV-Check.dk logo"
              width={42}
              height={42}
              className="rounded-lg bg-white"
            />
            <div>
              <p className="font-display text-lg font-bold">EV-Check.dk</p>
              <p className="text-xs font-semibold text-sky-700">
                Batteritest af elbiler
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            Professionel og uafhængig batteridiagnose på Sjælland. Fast pris,
            klar rapport og booking direkte online.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/75 bg-white/55 text-sky-700 shadow-sm shadow-sky-950/5 backdrop-blur-xl hover:border-sky-300 hover:bg-white/85"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <p className="font-semibold">Kontakt</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <a href="tel:+4571900530" className="hover:text-sky-700">
              +45 71 90 05 30
            </a>
            <a href="mailto:info@ev-check.dk" className="hover:text-sky-700">
              info@ev-check.dk
            </a>
            <span>København og Sjælland</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">Sider</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-sky-700"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/cookiepolitik" className="hover:text-sky-700">
              Cookiepolitik
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/70 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} EV-Check.dk. Alle rettigheder forbeholdes.
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
    <section className="relative overflow-hidden text-slate-950">
      <div className="absolute inset-0">
        <Image
          src="/wp/ev-car-danmark-1.png"
          alt="Elbil klar til batteritest i Danmark"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,250,245,0.96),rgba(255,255,255,0.82),rgba(255,255,255,0.56))]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(251,250,245,0),rgba(251,250,245,0.96))]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:px-8">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/75 bg-white/55 px-3 py-1.5 text-sm font-semibold text-sky-700 shadow-sm shadow-sky-950/5 backdrop-blur-xl">
            <BatteryCharging className="h-4 w-4" />
            Batteriet er den dyreste del af elbilen
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal sm:text-6xl lg:text-7xl">
            Kender du den reelle tilstand af dit elbilbatteri?
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            Få en professionel batteridiagnose før køb, salg eller når
            rækkevidden virker lavere.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink
              href="/book-tid"
              className="shadow-xl shadow-sky-600/20"
            >
              <CalendarCheck className="h-4 w-4" />
              Book batteritest
            </ButtonLink>
            <ButtonLink
              href="/service"
              variant="outline"
              className="bg-white/55"
            >
              Se hvad vi tester
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-2">
            {heroBullets.map((point) => (
              <div
                key={point}
                className="flex items-center gap-2 rounded-lg border border-white/75 bg-white/50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-sky-950/5 backdrop-blur-xl"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-600" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
        <PriceCard />
      </div>
    </section>
  );
}

export function PriceCard() {
  const points = [
    "Batteriets sundhed (SoH)",
    "Analyse af batteriets tilstand",
    "Fejlkoder og BMS-status",
    "PDF-rapport inkluderet",
  ];

  return (
    <aside className="glass-shell rounded-lg p-5 text-slate-950">
      <p className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
        <Star className="h-3.5 w-3.5" />
        Fast service
      </p>
      <h2 className="mt-4 text-2xl font-bold">Batteritest af elbil</h2>
      <div className="mt-4 flex items-end gap-2">
        <p className="text-4xl font-bold text-sky-700">1300 kr.</p>
        <p className="pb-1 text-sm font-semibold text-slate-500">15 min.</p>
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
  return (
    <section className="bg-white/25 py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hvornår bør du teste?"
          title="Før en beslutning bliver dyr"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testMoments.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.text} className="glass-card rounded-lg p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/70 text-sky-700 shadow-sm backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-bold text-slate-950">
                  {item.text}
                </h3>
              </article>
            );
          })}
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
          eyebrow="Det får du"
          title="Et klart billede af batteriets sundhed"
          description="Skjulte batteriproblemer kan påvirke rækkevidde, værdi og driftssikkerhed. EV-Check gør data let at forstå."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="glass-card rounded-lg p-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50/80 text-sky-700 backdrop-blur">
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
    <section className="bg-white/25 py-16 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="relative min-h-[24rem] overflow-hidden rounded-lg">
          <Image
            src="/wp/teslacertificate.jpg"
            alt="EV-Check certificering og træning"
            fill
            className="object-cover"
          />
        </div>
        <div className="self-center">
          <SectionHeading
            eyebrow="Din trygge partner"
            title="Uafhængig batterivurdering uden værkstedsbesøg"
            description="Vi arbejder med professionelt diagnoseudstyr og tester digitalt via bilens systemer. Batteripakken åbnes ikke."
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
              test kan give dokumentation, ro og bedre beslutninger.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandsAndCertificate() {
  return (
    <section className="glass-card rounded-lg p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
        Mærker vi tester
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {brandLogos.map((brand) => (
          <div
            key={brand.src}
            className="flex h-16 items-center justify-center rounded-lg border border-white/70 bg-white/60 p-3 backdrop-blur"
          >
            <Image
              src={brand.src}
              alt={brand.alt}
              width={90}
              height={42}
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

export function TestimonialsSection() {
  return (
    <section className="bg-white/25 py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kunder"
          title="Korte svar, klare beslutninger"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="glass-card rounded-lg p-5">
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
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
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
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Spørgsmål om batteritest" />
        <div className="mt-8 grid gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="glass-card group rounded-lg p-5"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-950">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-sky-700 group-open:rotate-45">+</span>
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
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow={booking ? "Book tid" : "Kontakt"}
            title={booking ? "Klar til batteritest?" : "Kontakt EV-Check.dk"}
            description="Skriv kort om bilen, så vender vi tilbage med praktisk information."
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
        <form action="/tak" method="GET" className="glass-panel rounded-lg p-5">
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
                className="h-12 w-full rounded-lg border border-white/70 bg-white/70 px-3 text-base outline-none backdrop-blur focus:border-sky-400 focus:bg-white/85 focus:ring-4 focus:ring-sky-500/10 sm:h-10 sm:text-sm"
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
            Jeg accepterer, at EV-Check må kontakte mig vedrørende min
            henvendelse.
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
    <span className="glass-card flex items-center gap-3 rounded-lg px-4 py-3">
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
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
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
