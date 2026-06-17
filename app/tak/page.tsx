import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { SitePage, siteUrl } from "@/components/site/public-site";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tak for din henvendelse | EV-Check.dk",
  description: "Tak for din booking eller henvendelse til EV-Check.dk. Vi vender tilbage hurtigst muligt.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteUrl}/tak` },
};

export default function ThanksPage() {
  return (
    <SitePage>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white p-8 text-center shadow-sm shadow-slate-200/70">
          <CheckCircle2 className="mx-auto h-14 w-14 text-teal-600" />
          <h1 className="mt-6 text-4xl font-bold text-slate-950">Tak for din henvendelse</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Din forespørgsel er registreret. Vi vender tilbage hurtigst muligt med bekræftelse på tid og praktisk information om batteritesten.
          </p>
          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            <Link href="mailto:info@ev-check.dk" className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-teal-700" />
              info@ev-check.dk
            </Link>
            <Link href="tel:+4571900530" className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-teal-700" />
              +45 71 90 05 30
            </Link>
          </div>
          <ButtonLink href="/" className="mt-8">Til forsiden</ButtonLink>
        </div>
      </section>
    </SitePage>
  );
}
