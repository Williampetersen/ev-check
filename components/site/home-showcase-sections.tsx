"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  FileText,
  Gauge,
  MapPin,
  ShieldCheck,
  ThermometerSun,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    eyebrow: "Mobil test",
    title: "Vi tester bilen, hvor den står",
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
    eyebrow: "Batteridata",
    title: "Få de vigtige signaler frem",
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
    eyebrow: "Rapport",
    title: "Dokumentation du kan bruge",
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
];

const sectionMotion = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HomeShowcaseSections() {
  return (
    <div className="overflow-hidden">
      {sections.map((section, index) => {
        const reverse = index % 2 === 1;

        return (
          <motion.section
            key={section.title}
            className={cn(
              "relative py-14 sm:py-16 lg:py-20",
              index === 1
                ? "bg-white/48"
                : "bg-[linear-gradient(180deg,rgba(248,253,255,0.78),rgba(236,253,245,0.42))]",
            )}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.28 }}
          >
            <motion.div
              aria-hidden
              className={cn(
                "absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-20 blur-3xl sm:h-56 sm:w-56",
                section.tone,
              )}
              animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.4,
              }}
            />

            <div
              className={cn(
                "relative mx-auto grid max-w-7xl items-center gap-7 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8",
              )}
            >
              <motion.div
                variants={sectionMotion}
                className={cn(reverse && "lg:order-2")}
              >
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                  {section.text}
                </p>

                <div className="mt-6 grid gap-2 sm:max-w-xl sm:grid-cols-3">
                  {section.points.map((point) => {
                    const Icon = point.icon;

                    return (
                      <motion.div
                        key={point.label}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="min-h-12 flex items-center gap-2 rounded-lg border border-white/80 bg-white/[0.72] px-3 py-2 text-sm font-bold text-slate-800 shadow-sm shadow-sky-950/5 backdrop-blur-xl"
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
                      </motion.div>
                    );
                  })}
                </div>

                <Link
                  href={section.href}
                  className="bg-white/78 mt-7 inline-flex h-11 items-center gap-2 rounded-lg border border-sky-200 px-4 text-sm font-bold text-slate-900 shadow-sm shadow-sky-950/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white"
                >
                  {section.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div
                variants={sectionMotion}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.28 }}
                className={cn(
                  "relative min-h-[18rem] overflow-hidden rounded-lg border border-white/80 bg-white/60 shadow-2xl shadow-sky-950/10 backdrop-blur-xl sm:min-h-[24rem] lg:min-h-[31rem]",
                  reverse && "lg:order-1",
                )}
              >
                <Image
                  src={section.image}
                  alt={section.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/[0.62] via-slate-950/10 to-white/[0.08]" />
                <motion.div
                  aria-hidden
                  className={cn(
                    "absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl",
                    section.tone,
                  )}
                  animate={{ x: [0, -18, 0], y: [0, 16, 0] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.25,
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  {section.points.slice(0, 2).map((point) => (
                    <span
                      key={point.label}
                      className="rounded-lg border border-white/20 bg-white/[0.16] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-black/10 backdrop-blur-xl"
                    >
                      {point.label}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
