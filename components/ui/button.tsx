import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-teal-600 text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700",
  secondary: "bg-slate-900 text-white shadow-sm shadow-slate-900/15 hover:bg-slate-800",
  outline: "border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
