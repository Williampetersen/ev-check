import type { Metadata } from "next";
import { SitePage, siteUrl } from "@/components/site/public-site";

export const metadata: Metadata = {
  title: "Cookiepolitik | EV-Check.dk",
  description: "Læs EV-Check.dk's cookiepolitik og information om nødvendige cookies, statistik og kontaktformularer.",
  alternates: { canonical: `${siteUrl}/cookiepolitik` },
};

export default function CookiePage() {
  return (
    <SitePage>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl rounded-3xl border border-white/70 bg-white p-8 shadow-sm shadow-slate-200/70">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Cookiepolitik</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">Cookies på EV-Check.dk</h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
            <p>
              EV-Check.dk bruger kun cookies og lignende teknologier, når de er nødvendige for at få hjemmesiden, formularer og sikkerhed til at fungere korrekt, eller når de hjælper os med at forstå brugen af siden.
            </p>
            <p>
              Nødvendige cookies kan bruges til sikkerhed, formularbeskyttelse, sessionshåndtering og teknisk drift. Statistikcookies bruges kun til at forbedre hjemmesiden og vores information om batteritest af elbiler.
            </p>
            <p>
              Du kan altid slette eller blokere cookies i din browser. Hvis du blokerer nødvendige cookies, kan enkelte funktioner som formularer eller login virke dårligere.
            </p>
            <p>
              Har du spørgsmål, kan du kontakte os på <a className="font-semibold text-teal-700" href="mailto:info@ev-check.dk">info@ev-check.dk</a>.
            </p>
          </div>
        </article>
      </section>
    </SitePage>
  );
}
