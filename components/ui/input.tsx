import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-lg border border-white/70 bg-white/65 px-3 text-base text-slate-950 outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white/85 focus:ring-4 focus:ring-sky-500/10 sm:h-10 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
