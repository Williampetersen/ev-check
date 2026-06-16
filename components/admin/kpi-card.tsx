import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm shadow-slate-200/60 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </section>
  );
}
