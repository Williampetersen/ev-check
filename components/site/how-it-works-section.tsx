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
    tone: "from-sky-400 via-cyan-300 to-blue-600",
    glow: "shadow-sky-500/30",
    iconTone: "text-sky-700",
  },
  {
    number: "2",
    title: "Test",
    detail: "SoH og BMS",
    href: "/batteritest-elbil",
    icon: Gauge,
    tone: "from-cyan-300 via-sky-400 to-blue-500",
    glow: "shadow-cyan-500/30",
    iconTone: "text-cyan-700",
  },
  {
    number: "3",
    title: "Rapport",
    detail: "PDF samme dag",
    href: "/min-konto",
    icon: FileText,
    tone: "from-blue-600 via-sky-400 to-cyan-200",
    glow: "shadow-blue-500/30",
    iconTone: "text-blue-700",
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
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#eef8ff_0%,#f8fdff_42%,#e8f7ff_100%)] py-14 text-slate-950 sm:py-16 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.72)_42%,rgba(125,211,252,0.28)_50%,transparent_62%)]"
        initial={{ x: "-70%", opacity: 0 }}
        whileInView={{ x: "70%", opacity: [0, 0.75, 0] }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 2.2, delay: 0.35, ease: "easeOut" }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={stepMotion} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">
            Sådan fungerer det
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">
            Book. Test. Rapport.
          </h2>
        </motion.div>

        <div className="relative mx-auto mt-10 max-w-6xl sm:mt-12">
          <div className="absolute left-[10%] right-[10%] top-9 hidden h-1.5 overflow-hidden rounded-full bg-white/80 shadow-inner shadow-sky-200/70 sm:block">
            <motion.div
              className="h-full origin-left rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-500 shadow-[0_0_28px_rgba(56,189,248,0.75)]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.65 }}
              transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-y-0 left-0 w-24 rounded-full bg-white/90 blur-sm"
              animate={{ x: ["-25%", "520%"] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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
                        "z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold text-white shadow-xl ring-4 ring-white/95 sm:h-[4.5rem] sm:w-[4.5rem]",
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
                      className="relative -mt-4 flex h-40 w-40 items-center justify-center rounded-full border border-white/90 bg-white/[0.72] p-4 text-center shadow-2xl shadow-sky-900/10 backdrop-blur-2xl transition group-hover:border-sky-200 group-focus-visible:border-sky-400 group-focus-visible:ring-4 group-focus-visible:ring-sky-500/20 sm:h-44 sm:w-44 lg:h-52 lg:w-52"
                    >
                      <motion.div
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(255,255,255,0.9),rgba(125,211,252,0.32),rgba(255,255,255,0.78),rgba(59,130,246,0.22),rgba(255,255,255,0.9))]"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 13,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full bg-gradient-to-br opacity-[0.20] blur-[1px] transition group-hover:opacity-[0.34]",
                          step.tone,
                        )}
                      />
                      <div className="absolute inset-[0.62rem] rounded-full border border-white/70 shadow-inner shadow-sky-200/50" />
                      <div className="absolute inset-[1.15rem] rounded-full border border-sky-100/80 bg-white/40" />
                      <div className="relative">
                        <span
                          className={cn(
                            "mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 shadow-sm shadow-sky-900/5 backdrop-blur-xl",
                            step.iconTone,
                          )}
                        >
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
                className="flex items-center justify-center gap-2 rounded-lg border border-sky-100/90 bg-white/70 px-4 py-3 text-sm font-bold text-slate-800 shadow-sm shadow-sky-900/5 backdrop-blur-xl"
              >
                <Icon className="h-4 w-4 text-sky-700" />
                {fact.label}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
