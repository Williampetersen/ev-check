"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarCheck, FileText, Gauge } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  { label: "Book", detail: "Tid og adresse", icon: CalendarCheck },
  { label: "Test", detail: "SoH og BMS", icon: Gauge },
  { label: "Rapport", detail: "PDF samme dag", icon: FileText },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HowItWorksSection() {
  return (
    <section
      id="saadan-fungerer-det"
      className="py-7 text-slate-950 sm:py-8 lg:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="grid overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-lg shadow-sky-950/10 lg:grid-cols-2"
        >
          <div className="relative min-h-[16rem] sm:min-h-[20rem] lg:min-h-[28rem]">
            <Image
              src="/wp/ev-bil-denmark-1.jpg"
              alt="EV-Check tekniker udfører batteritest af elbil"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <p className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Book. Test.
            </p>
            <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              <span className="rounded bg-sky-500 px-2 py-0.5 text-white">
                Rapport
              </span>{" "}
              <span className="text-sky-500">på 15 minutter</span>
            </p>

            <div className="mt-5 border-l-4 border-sky-400 pl-4">
              <p className="text-base font-bold text-sky-600">
                Book = Test = Rapport
              </p>
              <p className="mt-2 text-slate-600">
                Vælg tid og adresse, vi tester bilen der hvor den står, og du
                får en garantineutral rapport samme dag – uden
                værkstedsbesøg.
              </p>
            </div>

            <ButtonLink href="/book-tid" className="mt-6 w-fit">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest nu
            </ButtonLink>

            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="flex min-h-12 items-center gap-2 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm font-bold text-slate-800"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-300 text-white shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">
                      {step.label}
                      <span className="block text-xs font-semibold text-slate-500">
                        {step.detail}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
