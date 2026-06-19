"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Book en tid",
    text: "Vælg tidspunkt, bilmodel og testadresse. Bookingen er enkel og tager under ét minut.",
    detail: "Under 1 minut",
    action: "Book tid",
    href: "/book-tid",
    icon: CalendarCheck,
    accent: "from-teal-500 to-sky-500",
    iconClass: "border-teal-100 bg-teal-50 text-teal-700",
  },
  {
    number: "02",
    title: "Vi kommer til dig",
    text: "Teknikeren udfører testen hjemme hos dig eller på arbejdspladsen. Du skal blot give adgang til bilen.",
    detail: "Sjælland og København",
    action: "Se kontakt",
    href: "/kontakt",
    icon: Car,
    accent: "from-sky-500 to-cyan-400",
    iconClass: "border-sky-100 bg-sky-50 text-sky-700",
  },
  {
    number: "03",
    title: "Rapport samme dag",
    text: "Du får en overskuelig PDF-rapport med batteriets sundhed, målinger og en tydelig konklusion.",
    detail: "Klar dokumentation",
    action: "Se rapport",
    href: "/min-konto",
    icon: FileText,
    accent: "from-emerald-500 to-teal-400",
    iconClass: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
];

const facts = [
  { label: "Fast pris", value: "1300 kr.", icon: CheckCircle2 },
  { label: "Testtid", value: "15 min.", icon: Clock },
  { label: "Område", value: "Sjælland", icon: MapPin },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HowItWorksSection() {
  return (
    <motion.section
      id="saadan-fungerer-det"
      className="bg-white/55 relative isolate overflow-hidden py-16 backdrop-blur-sm sm:py-20"
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.28 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={item} className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
            Sådan fungerer det
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Fra booking til batterirapport uden værkstedsbesøg
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            En enkel proces med mobil test og dokumentation, du kan bruge ved
            køb, salg eller service.
          </p>
        </motion.div>

        <div className="relative mt-10 lg:mt-14">
          <div className="absolute left-[16.666%] right-[16.666%] top-16 hidden h-px overflow-hidden rounded-full bg-slate-200 lg:block">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.05, delay: 0.25, ease: "easeOut" }}
            />
          </div>

          <motion.div
            variants={container}
            className="grid gap-4 md:grid-cols-3 lg:gap-6"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.title}
                  variants={item}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white/88 group relative overflow-hidden rounded-lg border border-slate-200/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur-2xl transition-colors hover:border-teal-200 sm:p-6"
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                      step.accent,
                    )}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <motion.span
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-lg border shadow-sm",
                        step.iconClass,
                      )}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.18,
                      }}
                    >
                      <Icon className="h-7 w-7" />
                    </motion.span>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      {step.detail}
                    </span>
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition group-hover:text-teal-800"
                    >
                      {step.action}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          variants={container}
          className="mt-5 grid gap-3 sm:grid-cols-3"
        >
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <motion.div
                key={fact.label}
                variants={item}
                className="bg-white/78 flex items-center gap-3 rounded-lg border border-slate-200/80 px-4 py-3 shadow-sm shadow-teal-950/5 backdrop-blur-xl"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {fact.label}
                  </span>
                  <span className="text-sm font-bold text-slate-950">
                    {fact.value}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
