"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const benefits = [
  {
    title: "Uafhængig",
    detail: "Objektiv batterivurdering",
  },
  {
    title: "Værdifuld",
    detail: "Øger salgsværdien",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function AvilooCertifiedSection() {
  return (
    <motion.section
      className="bg-slate-50 py-14 text-slate-950 sm:py-16 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            variants={fadeUp}
            className="relative h-64 overflow-hidden rounded-2xl shadow-xl shadow-sky-950/10 sm:h-80 lg:h-[26rem]"
          >
            <Image
              src="/badge/carcertificate.jpg"
              alt="AVILOO-certifikat sættes på elbilens forrude"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Testet tryghed
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-sky-500 sm:text-3xl">
              AVILOO certificeret
            </p>

            <div className="mt-6 border-l-4 border-sky-400 pl-4">
              <p className="text-lg font-bold text-sky-600">
                Certifikat = Tryghed = Salg
              </p>
              <p className="mt-2 text-slate-600">
                Når testen er gennemført, får bilen et AVILOO-certifikat – et
                synligt bevis på, at batteriet er testet uafhængigt. Ved køb,
                salg eller leasing giver certifikatet klar dokumentation, der
                skaber tillid og kan øge bilens salgsværdi.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm shadow-sky-950/5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
              <div className="relative mx-auto h-20 w-20 shrink-0 sm:mx-0">
                <Image
                  src="/badge/aviloo-badge.png"
                  alt="AVILOO Certified badge"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <CheckCircle2 className="h-6 w-6 text-sky-500" />
                    <p className="mt-2 font-bold text-slate-950">
                      {benefit.title}
                    </p>
                    <p className="text-sm text-slate-500">{benefit.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
