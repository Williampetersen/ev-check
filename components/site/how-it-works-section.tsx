"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  {
    title: "Plug & play",
    detail: "Diagnoseudstyret tilsluttes bilen, og testen er klar på 15 minutter.",
    image: "/step/step1.png",
  },
  {
    title: "Den reelle værdi",
    detail: "En uvildig SoH-rapport viser batteriets sande værdi til køb og salg.",
    image: "/step/step2.png",
  },
  {
    title: "Branchens standard",
    detail: "Sikker, dokumenteret rapport anerkendt som standard for elbilbatterier.",
    image: "/step/step3.png",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

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
    <motion.section
      id="saadan-fungerer-det"
      className="relative isolate overflow-hidden bg-white py-14 text-slate-950 sm:py-16 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div variants={fadeUp}>
            <p className="text-3xl font-extrabold tracking-tight text-sky-500 sm:text-4xl">
              Tryghed
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              i ét nemt trin
            </p>
            <p className="mt-4 max-w-md text-slate-600">
              Få svar på batteriets tilstand på 15 minutter – uvildigt,
              præcist og uden at åbne højvoltsbatteriet. Book din
              batteritest, og stå med en garantineutral rapport samme dag.
            </p>
            <ButtonLink href="/book-tid" className="mt-6">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest nu
            </ButtonLink>
            <p className="mt-3 text-xs text-slate-400">
              Mobil test i hele Danmark · Fra 1.300 kr.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            className="grid gap-8 sm:grid-cols-3 sm:gap-6"
          >
            {steps.map((step) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="flex flex-col items-center text-center"
              >
                <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
