import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-shell rounded-lg p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50/80 text-sky-700 backdrop-blur">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "sky" | "rose";
}) {
  const styles = {
    sky: "border-sky-200/80 bg-sky-50/80 text-sky-800",
    rose: "border-rose-200/80 bg-rose-50/80 text-rose-700",
  };
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium backdrop-blur",
        styles[tone],
      )}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "grid gap-1.5 text-sm font-semibold text-slate-700",
        className,
      )}
    >
      {label}
      {children}
    </label>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/70 bg-white/45 px-4 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur">
      {text}
    </div>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 backdrop-blur">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}
