"use client";

import Link from "next/link";
import { ArrowLeft, Download, Printer } from "lucide-react";

export function InvoiceToolbar({
  backHref,
  backLabel = "Back",
  downloadHref,
}: {
  backHref: string;
  backLabel?: string;
  downloadHref?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-sky-200 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition hover:border-sky-300 hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-500/90 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-700/20 transition hover:bg-sky-600"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        {downloadHref ? (
          <a
            href={downloadHref}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-sky-300/70 bg-sky-500/90 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-700/20 transition hover:bg-sky-600"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}
