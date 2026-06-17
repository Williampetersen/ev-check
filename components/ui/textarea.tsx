import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-white/70 bg-white/65 px-3 py-2.5 text-base text-slate-950 outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white/85 focus:ring-4 focus:ring-sky-500/10 sm:min-h-24 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
