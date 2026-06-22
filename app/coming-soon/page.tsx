import type { Metadata } from "next";
import Image from "next/image";
import { getSafeNextPath } from "@/lib/site-access";

export const metadata: Metadata = {
  title: "Kommer snart",
  description:
    "EV-Check.dk er midlertidigt privat, mens hjemmesiden bliver opdateret.",
  robots: { index: false, follow: false },
};

export default function ComingSoon({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const nextPath = getSafeNextPath(searchParams?.next);
  const formAction = `/api/site-access?next=${encodeURIComponent(nextPath)}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf5] text-slate-950">
      <Image
        src="/wp/ev-car-danmark-1.png"
        alt="EV-Check elbil batteritest"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,250,245,0.96)_0%,rgba(255,255,255,0.86)_52%,rgba(255,255,255,0.64)_100%)]" />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_0.62fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <Image
              src="/wp/ev-check-dk.png"
              alt="EV-Check.dk logo"
              width={48}
              height={48}
              className="rounded-xl bg-white"
            />
            <span className="font-display text-xl font-bold">EV-Check.dk</span>
          </div>

          <p className="mt-10 text-sm font-bold uppercase tracking-[0.22em] text-sky-700">
            Privat forhåndsvisning
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-bold tracking-normal sm:text-6xl">
            Hjemmesiden kommer snart.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
            Vi opdaterer EV-Check.dk. Indtil åbningen er forsiden skjult for
            besøgende og kun tilgængelig med adgangskode.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="border-l border-sky-300/70 pl-4">
              <p className="font-bold text-slate-950">Batteritest</p>
              <p className="mt-1 text-slate-600">SoH og diagnose</p>
            </div>
            <div className="border-l border-sky-300/70 pl-4">
              <p className="font-bold text-slate-950">PDF-rapport</p>
              <p className="mt-1 text-slate-600">Klar dokumentation</p>
            </div>
            <div className="border-l border-sky-300/70 pl-4">
              <p className="font-bold text-slate-950">Sjælland</p>
              <p className="mt-1 text-slate-600">Vi kører ud</p>
            </div>
          </div>
        </div>

        <div className="glass-shell w-full rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/70 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                Access
              </p>
              <h2 className="mt-1 text-2xl font-bold">Enter preview</h2>
            </div>
            <span className="bg-white/55 rounded-full border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-700 backdrop-blur">
              Locked
            </span>
          </div>

          <form action={formAction} method="post" className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Username
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                className="bg-white/55 h-12 w-full rounded-xl border border-white/75 px-4 text-base text-slate-950 outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white/80 focus:ring-4 focus:ring-sky-400/10"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-white/55 h-12 w-full rounded-xl border border-white/75 px-4 text-base text-slate-950 outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white/80 focus:ring-4 focus:ring-sky-400/10"
              />
            </label>

            {searchParams?.error ? (
              <p className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-700">
                Forkert username eller password.
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-1 inline-flex h-12 items-center justify-center rounded-xl border border-sky-300/70 bg-sky-600/90 px-5 text-sm font-bold text-white shadow-lg shadow-sky-600/20 backdrop-blur-xl transition hover:bg-sky-700"
            >
              Åbn websitet
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
