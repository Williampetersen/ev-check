"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Briefcase, User, X } from "lucide-react";
import { buttonVariants, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookTidTrigger({
  className,
  variant,
  children,
}: {
  className?: string;
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant
            ? cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition sm:h-10",
                buttonVariants[variant],
                className,
              )
            : className
        }
      >
        {children}
      </button>
      <BookingChoiceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function BookingChoiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-choice-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-shell relative w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Luk"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/60 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          id="booking-choice-title"
          className="text-center text-xl font-bold text-slate-950 sm:text-2xl"
        >
          Book batteritest
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Er du privat eller erhverv?
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/book-tid"
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-lg border border-sky-200/80 bg-white/70 px-4 py-5 text-center shadow-sm shadow-sky-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <User className="h-5 w-5" />
            </span>
            <span className="font-bold text-slate-950">Jeg er privat</span>
          </Link>
          <Link
            href="/erhverv/book-tid"
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-lg border border-sky-200/80 bg-white/70 px-4 py-5 text-center shadow-sm shadow-sky-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Briefcase className="h-5 w-5" />
            </span>
            <span className="font-bold text-slate-950">Jeg er erhverv</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
