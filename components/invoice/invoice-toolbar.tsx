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
  downloadHref: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <a
          href={downloadHref}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-teal-700/70 bg-[#064E4B] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </div>
    </div>
  );
}
