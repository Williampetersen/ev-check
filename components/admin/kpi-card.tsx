import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  sky: "bg-sky-50/80 text-sky-700 ring-sky-100",
  slate: "bg-slate-100/80 text-slate-700 ring-slate-200",
  emerald: "bg-emerald-50/80 text-emerald-700 ring-emerald-100",
};

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "sky",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <section className="glass-card rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-950 sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 backdrop-blur",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </section>
  );
}
