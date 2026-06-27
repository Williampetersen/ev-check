"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function BatteryCertificateSection() {
  return (
    <motion.section
      className="py-14 text-slate-950 sm:py-16 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          className="grid overflow-hidden rounded-2xl border border-sky-200 shadow-lg shadow-sky-950/10 lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <p className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              15 minutter.
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-sky-500 sm:text-3xl">
              Én certificeret rapport.
            </p>
            <p className="mt-4 max-w-md text-slate-600">
              Tilslut AVILOO Flash-testeren, og få en{" "}
              <Link
                href="/batteritest-elbil"
                className="font-semibold text-sky-600 underline underline-offset-2 hover:text-sky-700"
              >
                fuldstændig diagnose
              </Link>{" "}
              af batteriets tilstand på 15 minutter – med SoH, cellebalance
              og fejlkoder samlet i én rapport.
            </p>
            <ButtonLink href="/book-tid" className="mt-6 w-fit">
              <CalendarCheck className="h-4 w-4" />
              Book batteritest nu
            </ButtonLink>
            <p className="mt-3 text-xs text-slate-400">
              Rapporten leveres med QR-kode, så den nemt kan deles ved køb
              og salg.
            </p>
          </div>
          <div className="relative min-h-[18rem] lg:min-h-[26rem]">
            <Image
              src="/batterycertificateproof.jpg"
              alt="AVILOO-batterirapport vist på en tablet"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
