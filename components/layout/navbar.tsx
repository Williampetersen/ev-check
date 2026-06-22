"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { LayoutDashboard } from "lucide-react";
import { brandLogoPath } from "@/lib/seo";

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
              src={brandLogoPath}
              alt="EV Check logo"
              width="30"
              height="30"
              className="mr-2 rounded-sm object-contain"
            ></Image>
            <p>EV Check</p>
          </Link>
          <Link
            href="/admin/login"
            className="hover:bg-white/85 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/60 px-4 py-1.5 text-sm font-semibold text-slate-800 shadow-sm shadow-sky-950/5 backdrop-blur-xl transition-colors hover:border-sky-300 hover:text-sky-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
