import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-sky-600 text-white shadow-sm shadow-sky-600/20 hover:bg-sky-700",
  secondary:
    "bg-indigo-950 text-white shadow-sm shadow-indigo-950/15 hover:bg-indigo-900",
  outline:
    "border border-sky-200 bg-white/70 text-slate-700 backdrop-blur hover:border-sky-400 hover:text-sky-700",
  ghost: "text-slate-600 hover:bg-sky-50 hover:text-slate-950",
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
