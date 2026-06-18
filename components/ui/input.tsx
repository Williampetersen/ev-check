import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-lg border border-slate-200/90 bg-white/85 px-3 text-base text-slate-950 shadow-inner shadow-slate-200/40 outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 sm:h-10 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
