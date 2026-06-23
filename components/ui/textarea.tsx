import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-slate-200/90 bg-white/85 px-3 py-2.5 text-base text-slate-950 shadow-inner shadow-slate-200/40 backdrop-blur transition outline-none placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 sm:min-h-24 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
