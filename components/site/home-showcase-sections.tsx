"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Gauge,
  MapPin,
  ShieldCheck,
  ThermometerSun,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = [
  {
    titleLine1: "Vi tester bilen,",
    titleLine2: "hvor den står",
    formula: "15 minutter = Mobil test = Ingen værkstedsbesøg",
    text: "Kort besøg. Klar måling. Ingen værkstedsdag.",
    image: "/wp/ev-car-danmark-1.png",
    imageAlt: "Mobil batteritest af elbil med diagnoseudstyr",
    href: "/book-tid",
    cta: "Book tid",
    tone: "from-sky-500 to-cyan-300",
    points: [
      { label: "OBD/BMS", icon: Gauge },
      { label: "SoH", icon: BatteryCharging },
      { label: "Sjælland", icon: MapPin },
    ],
  },
  {
    titleLine1: "Få de vigtige",
    titleLine2: "signaler frem",
    formula: "Digitalt aflæst = Fuldt overblik = Klar besked",
    text: "SoH, cellebalance og temperatur samlet i et let overblik.",
    image: "/wp/ev-car-danmark-2.png",
    imageAlt: "Batteridata og energistrømme for elbil",
    href: "/batteritest-elbil",
    cta: "Se testen",
    tone: "from-emerald-400 to-sky-500",
    points: [
      { label: "Celler", icon: Zap },
      { label: "Temperatur", icon: ThermometerSun },
      { label: "Fejlkoder", icon: ShieldCheck },
    ],
  },
  {
    titleLine1: "Dokumentation du",
    titleLine2: "kan bruge",
    formula: "Samme dag = PDF-rapport = Klar dokumentation",
    text: "PDF samme dag til køb, salg eller tryg fejlfinding.",
    image: "/wp/ev-car-danmark-3.png",
    imageAlt: "Batterirapport og målinger på tablet",
    href: "/kontakt",
    cta: "Kontakt os",
    tone: "from-blue-500 to-lime-300",
    points: [
      { label: "PDF", icon: FileText },
      { label: "Køb/salg", icon: CheckCircle2 },
      { label: "Tryghed", icon: ShieldCheck },
    ],
  },
  {
    titleLine1: "Et synligt bevis",
    titleLine2: "på bilens stand",
    formula: "Certifikat = Tryghed = Salg",
    text: "Når testen er gennemført, sætter vi et EV-Check-certifikat på bilen – dokumentation der skaber tillid ved køb, salg og leasing.",
    image: "/badge/carcertificate.jpg",
    imageAlt: "EV-Check-certifikat sættes på elbilens forrude",
    href: "/batteritest-elbil",
    cta: "Læs om testen",
    tone: "from-indigo-500 to-sky-400",
    points: [
      { label: "Uafhængig", icon: ShieldCheck },
      { label: "Synligt", icon: CheckCircle2 },
      { label: "Værdi", icon: BadgeCheck },
    ],
  },
  {
    titleLine1: "Alle data, samlet",
    titleLine2: "på 15 minutter",
    formula: "15 minutter = Komplet rapport = Direkte adgang",
    text: "SoH, cellebalance og fejlkoder samlet i én rapport, du kan gennemgå direkte på testen.",
    image: "/batterycertificateproof.jpg",
    imageAlt: "EV-Check-rapport vist på en tablet",
    href: "/batteritest-elbil",
    cta: "Se rapporten",
    tone: "from-violet-500 to-sky-400",
    points: [
      { label: "SoH", icon: BatteryCharging },
      { label: "Cellebalance", icon: Zap },
      { label: "Fejlkoder", icon: ShieldCheck },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HomeShowcaseSections() {
  return (
    <div className="overflow-hidden">
      {sections.map((section, index) => {
        const reverse = index % 2 === 1;

        return (
          <section
            key={section.titleLine1}
            className={cn(
              "py-7 sm:py-8 lg:py-10",
              index % 2 === 1
                ? "bg-white/48"
                : "bg-[linear-gradient(180deg,rgba(248,253,255,0.78),rgba(236,253,245,0.42))]",
            )}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                className="grid overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-lg shadow-sky-950/10 lg:grid-cols-2"
              >
                <div
                  className={cn(
                    "relative min-h-[16rem] sm:min-h-[20rem] lg:min-h-[28rem]",
                    reverse && "lg:order-2",
                  )}
                >
                  <Image
                    src={section.image}
                    alt={section.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div
                  className={cn(
                    "flex flex-col justify-center p-8 sm:p-10 lg:p-12",
                    reverse && "lg:order-1",
                  )}
                >
                  <p className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                    {section.titleLine1}
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight text-sky-500 sm:text-3xl">
                    {section.titleLine2}
                  </p>

                  <div className="mt-5 border-l-4 border-sky-400 pl-4">
                    <p className="text-base font-bold text-sky-600">
                      {section.formula}
                    </p>
                    <p className="mt-2 text-slate-600">{section.text}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <ButtonLink href="/book-tid" className="h-11 sm:h-10">
                      <CalendarCheck className="h-4 w-4" />
                      Book batteritest
                    </ButtonLink>
                    {section.href !== "/book-tid" ? (
                      <Link
                        href={section.href}
                        className="inline-flex h-11 items-center gap-2 rounded-lg border border-sky-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm shadow-sky-950/5 transition hover:-translate-y-0.5 hover:border-sky-300 sm:h-10"
                      >
                        {section.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-7 grid gap-2 sm:grid-cols-3">
                    {section.points.map((point) => {
                      const Icon = point.icon;

                      return (
                        <div
                          key={point.label}
                          className="flex min-h-12 items-center gap-2 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm font-bold text-slate-800"
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                              section.tone,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
