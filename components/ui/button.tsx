import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-sky-300/70 bg-sky-600/90 text-white shadow-lg shadow-sky-600/20 backdrop-blur-xl hover:bg-sky-700",
  secondary:
    "border border-white/70 bg-white/70 text-slate-800 shadow-sm shadow-sky-950/5 backdrop-blur-xl hover:bg-white/90 hover:text-sky-700",
  outline:
    "border border-white/75 bg-white/55 text-slate-700 shadow-sm shadow-sky-950/5 backdrop-blur-xl hover:border-sky-300 hover:bg-white/80 hover:text-sky-700",
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
