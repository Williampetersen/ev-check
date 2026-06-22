"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  FileText,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "1",
    title: "Book",
    detail: "Tid og adresse",
    href: "/book-tid",
    icon: CalendarCheck,
    tone: "from-violet-700 to-fuchsia-600",
    glow: "shadow-violet-900/20",
  },
  {
    number: "2",
    title: "Test",
    detail: "SoH og BMS",
    href: "/batteritest-elbil",
    icon: Gauge,
    tone: "from-teal-600 to-sky-500",
    glow: "shadow-teal-900/20",
  },
  {
    number: "3",
    title: "Rapport",
    detail: "PDF samme dag",
    href: "/min-konto",
    icon: FileText,
    tone: "from-slate-900 to-violet-700",
    glow: "shadow-slate-900/20",
  },
];

const facts = [
  { label: "Mobil test", icon: Car },
  { label: "15 min.", icon: CheckCircle2 },
  { label: "1300 kr.", icon: CheckCircle2 },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const stepMotion = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HowItWorksSection() {
  return (
    <motion.section
      id="saadan-fungerer-det"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgba(241,245,249,0.92),rgba(255,255,255,0.64)_48%,rgba(235,250,246,0.62))] py-14 text-slate-950 sm:py-16 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={stepMotion} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-700">
            Sådan fungerer det
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">
            Book. Test. Rapport.
          </h2>
        </motion.div>

        <div className="relative mx-auto mt-10 max-w-6xl sm:mt-12">
          <div className="absolute left-[10%] right-[10%] top-9 hidden h-1 rounded-full bg-slate-200/90 sm:block">
            <motion.div
              className="h-full origin-left rounded-full bg-gradient-to-r from-violet-700 via-teal-500 to-violet-700"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.65 }}
              transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
            />
          </div>

          <motion.div
            variants={container}
            className="grid gap-7 sm:grid-cols-3 sm:gap-5 lg:gap-8"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  variants={stepMotion}
                  className="relative flex justify-center"
                >
                  <Link
                    href={step.href}
                    className="group grid justify-items-center outline-none"
                    aria-label={`${step.title}: ${step.detail}`}
                  >
                    <motion.span
                      className={cn(
                        "z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold text-white shadow-xl ring-4 ring-white/80 sm:h-[4.5rem] sm:w-[4.5rem]",
                        step.tone,
                        step.glow,
                      )}
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.18,
                      }}
                    >
                      {step.number}
                    </motion.span>

                    <motion.div
                      whileHover={{ y: -8, scale: 1.035 }}
                      whileTap={{ scale: 0.985 }}
                      className="relative -mt-4 flex h-40 w-40 items-center justify-center rounded-full border border-white/80 bg-white/[0.58] p-4 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition group-hover:border-violet-200 group-focus-visible:border-violet-400 group-focus-visible:ring-4 group-focus-visible:ring-violet-500/20 sm:h-44 sm:w-44 lg:h-52 lg:w-52"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full bg-gradient-to-br opacity-[0.18] blur-[1px] transition group-hover:opacity-[0.28]",
                          step.tone,
                        )}
                      />
                      <div className="absolute inset-[1.15rem] rounded-full border border-white/60" />
                      <div className="relative">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-violet-700 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-3 text-lg font-bold text-slate-950">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {step.detail}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          variants={container}
          className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3"
        >
          {facts.map((fact) => {
            const Icon = fact.icon;

            return (
              <motion.div
                key={fact.label}
                variants={stepMotion}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/80 bg-white/60 px-4 py-3 text-sm font-bold text-slate-800 shadow-sm shadow-slate-900/5 backdrop-blur-xl"
              >
                <Icon className="h-4 w-4 text-teal-700" />
                {fact.label}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
