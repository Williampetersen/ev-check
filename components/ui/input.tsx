import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-lg border border-sky-200/90 bg-white/70 px-3 text-base text-slate-950 shadow-inner shadow-sky-200/45 backdrop-blur-xl transition outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white/85 focus:ring-4 focus:ring-sky-400/20 sm:h-10 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
});
