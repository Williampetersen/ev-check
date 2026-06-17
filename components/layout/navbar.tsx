"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { LayoutDashboard } from "lucide-react";

export default function NavBar() {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled
            ? "border-b border-white/50 bg-white/60 shadow-sm shadow-sky-950/5 backdrop-blur-2xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
        <div className="mx-5 flex h-16 w-full max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center font-display text-2xl">
            <Image
              src="/logo.png"
              alt="EV Check logo"
              width="30"
              height="30"
              className="mr-2 rounded-sm"
            ></Image>
            <p>EV Check</p>
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 rounded-full border border-slate-950/80 bg-slate-950/85 px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-slate-950/20 backdrop-blur transition-colors hover:bg-white/80 hover:text-black"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
