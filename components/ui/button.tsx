import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-teal-700/70 bg-[#064E4B] text-white shadow-lg shadow-teal-900/18 backdrop-blur-xl hover:bg-teal-800",
  secondary:
    "border border-slate-200/80 bg-white/75 text-slate-800 shadow-sm shadow-teal-950/5 backdrop-blur-xl hover:bg-white/95 hover:text-[#064E4B]",
  outline:
    "border border-slate-200/80 bg-white/60 text-slate-700 shadow-sm shadow-teal-950/5 backdrop-blur-xl hover:border-teal-300 hover:bg-white/85 hover:text-[#064E4B]",
  ghost: "text-slate-600 hover:bg-white/55 hover:text-slate-950",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

type Variant = keyof typeof variants;

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-10",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <Link
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition sm:h-10",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
