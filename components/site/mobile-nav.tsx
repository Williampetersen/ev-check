"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, Phone, UserRound, X } from "lucide-react";

export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    const id = window.setTimeout(close, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Luk menu" : "Åbn menu"}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:text-teal-800 lg:hidden"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Menu
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(6,78,75,0.14)] lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-teal-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid gap-3">
              <Link
                href="/min-konto"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800"
              >
                <UserRound className="h-4 w-4" />
                Min konto
              </Link>
              <Link
                href="/book-tid"
                onClick={close}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(245,158,11,0.24)] transition hover:bg-amber-600"
              >
                <CalendarCheck className="h-4 w-4" />
                Book tid
              </Link>
              <a
                href="tel:+4571900530"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                <Phone className="h-4 w-4" />
                +45 71 90 05 30
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
