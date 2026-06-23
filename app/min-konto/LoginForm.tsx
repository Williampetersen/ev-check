"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brandLogoPath } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Tab = "login" | "signup";
type Phase = "email" | "code";

type SendCodeResponse = {
  ok: boolean;
  error?: string;
  waitSeconds?: number;
  maskedEmail?: string;
  portalToken?: string;
};

type VerifyCodeResponse = {
  ok: boolean;
  error?: string;
  portalToken?: string;
};

const RESEND_COOLDOWN_SECONDS = 60;

export default function LoginForm() {
  const [tab, setTab] = useState<Tab>("login");
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [portalToken, setPortalToken] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = window.setTimeout(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  useEffect(() => {
    if (phase === "code") {
      const timeout = window.setTimeout(() => codeRef.current?.focus(), 50);
      return () => window.clearTimeout(timeout);
    }
  }, [phase]);

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Indtast en gyldig e-mailadresse.");
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch("/api/customer/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = (await response.json()) as SendCodeResponse;

      if (data.error === "cooldown" && data.portalToken) {
        setPortalToken(data.portalToken);
        setMaskedEmail(data.maskedEmail || trimmedEmail);
        setCooldown(data.waitSeconds || RESEND_COOLDOWN_SECONDS);
        setPhase("code");
        setInfo("Vi har allerede sendt en kode. Tjek din indbakke.");
        return;
      }

      if (!data.ok) {
        const messages: Record<string, string> = {
          not_found:
            "Vi fandt ingen kunde med den e-mail. Book din første batteritest for at oprette kontoen.",
          invalid_email: "Indtast en gyldig e-mailadresse.",
          email_failed: "Vi kunne ikke sende koden lige nu. Prøv igen om lidt.",
          server_error:
            "Kundeportalen er ikke klar lige nu. Prøv igen om lidt.",
        };
        setError(messages[data.error || ""] || "Noget gik galt. Prøv igen.");
        return;
      }

      setEmail(trimmedEmail);
      setPortalToken(data.portalToken || "");
      setMaskedEmail(data.maskedEmail || trimmedEmail);
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setPhase("code");
      setInfo("Vi har sendt en engangskode til din e-mail.");
    } catch {
      setError("Der opstod en fejl. Prøv igen.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError("Koden skal være 6 cifre.");
      return;
    }
    if (!portalToken) {
      setError("Send en ny kode og prøv igen.");
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await fetch("/api/customer/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalToken, code }),
      });
      const data = (await response.json()) as VerifyCodeResponse;

      if (data.ok) {
        setInfo("Bekræftet. Du sendes videre...");
        window.location.href = `/kunde/${encodeURIComponent(
          data.portalToken || portalToken,
        )}`;
        return;
      }

      const messages: Record<string, string> = {
        invalid: "Koden er ikke korrekt. Prøv igen.",
        expired: "Koden er udløbet. Send en ny kode.",
        max_attempts: "For mange forsøg. Send en ny kode.",
      };
      setError(messages[data.error || ""] || "Noget gik galt. Prøv igen.");

      if (data.error === "expired" || data.error === "max_attempts") {
        setCode("");
        setPhase("email");
        setCooldown(0);
      }
    } catch {
      setError("Der opstod en fejl. Prøv igen.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    setPhase("email");
    setCode("");
    setCooldown(0);
    resetMessages();
  };

  return (
    <section className="w-full max-w-[calc(100vw-32px)] min-w-0 overflow-hidden rounded-[28px] border border-white/55 bg-sky-300/20 shadow-[0_26px_70px_rgba(14,116,184,0.30),inset_0_1px_0_rgba(255,255,255,0.80),inset_0_-28px_70px_rgba(255,255,255,0.18)] backdrop-blur-2xl sm:max-w-[420px]">
      <div className="flex flex-col items-center px-6 pt-8 pb-5">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="EV-Check.dk"
        >
          <Image
            src={brandLogoPath}
            alt="EV-Check.dk logo"
            width={40}
            height={40}
            className="h-9 w-9 rounded-lg object-contain drop-shadow-sm"
            priority
          />
          <div className="leading-none">
            <p className="text-[27px] font-extrabold text-[#0b1f3a]">
              EV<span className="text-sky-600">Check</span>
            </p>
            <p className="mt-0.5 text-center text-[10px] font-bold text-[#0b1f3a]">
              Professionel batteritest
            </p>
          </div>
        </Link>
        <p className="mt-4 text-center text-sm text-slate-700">
          {tab === "login"
            ? "Log ind for at se og administrere dine bookinger"
            : "Bliv kunde og book din første batteritest"}
        </p>
      </div>

      <div className="mx-6 mb-5 flex min-w-0 rounded-2xl border border-white/55 bg-white/24 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item);
              resetMessages();
            }}
            className={cn(
              "flex h-10 min-w-0 flex-1 items-center justify-center rounded-xl border text-sm font-bold transition",
              tab === item
                ? "border-white/80 bg-white/72 text-[#0b1f3a] shadow-[0_8px_24px_rgba(14,116,184,0.20)] backdrop-blur-xl"
                : "border-transparent text-slate-600 hover:bg-white/30 hover:text-[#0b1f3a]",
            )}
          >
            {item === "login" ? "Log ind" : "Opret konto"}
          </button>
        ))}
      </div>

      {tab === "login" ? (
        <div className="px-6 pb-7">
          {info ? (
            <div
              className="mb-4 flex items-start gap-2 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm font-medium text-sky-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] backdrop-blur-xl"
              aria-live="polite"
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <span>{info}</span>
            </div>
          ) : null}

          {error ? (
            <div
              className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          {phase === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <label className="grid gap-2 text-sm font-bold text-[#0b1f3a]">
                E-mail
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  required
                  className="h-11 rounded-xl border-white/70 bg-white/60 px-3 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-slate-400 sm:h-11"
                />
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl border-sky-300/70 bg-sky-500/85 text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(14,116,184,0.28),inset_0_1px_0_rgba(255,255,255,0.30)] hover:bg-sky-600 sm:h-11"
              >
                {loading ? "Sender kode..." : "Send kode til e-mail"}
              </Button>

              <p className="px-2 text-center text-[13px] leading-5 text-slate-700">
                Vi sender en engangskode til din e-mail. Du behøver ikke en
                adgangskode.
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/40 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] backdrop-blur-xl">
                <Mail className="h-4 w-4 shrink-0 text-sky-600" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-600">
                    Kode sendt til
                  </p>
                  <p className="truncate text-sm font-bold text-[#0b1f3a]">
                    {maskedEmail}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <label className="grid gap-2 text-sm font-bold text-[#0b1f3a]">
                  Indtast kode
                  <Input
                    ref={codeRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(event) => {
                      setCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                      setError("");
                    }}
                    disabled={loading}
                    className="h-12 rounded-xl border-white/70 bg-white/60 text-center text-xl font-bold sm:h-12"
                  />
                </label>

                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="h-11 w-full rounded-xl border-sky-300/70 bg-sky-500/85 text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(14,116,184,0.28),inset_0_1px_0_rgba(255,255,255,0.30)] hover:bg-sky-600 sm:h-11"
                >
                  {loading ? "Bekræfter..." : "Bekræft og log ind"}
                </Button>
              </form>

              <div className="space-y-2 text-center text-sm">
                <p className="text-slate-700">
                  Modtog du ingen kode?{" "}
                  {cooldown > 0 ? (
                    <span className="font-semibold">
                      Send ny kode ({cooldown}s)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={goBackToEmail}
                      disabled={loading}
                      className="font-bold text-sky-700 hover:underline disabled:opacity-50"
                    >
                      Send ny kode
                    </button>
                  )}
                </p>
                <button
                  type="button"
                  onClick={goBackToEmail}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#0b1f3a]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Gå tilbage
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 px-6 pb-7">
          <div className="rounded-2xl border border-white/60 bg-white/35 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl">
            <p className="text-sm leading-5 font-extrabold text-[#0b1f3a]">
              Din konto oprettes automatisk, når du laver din første booking.
            </p>
            <p className="mt-3 text-[13px] leading-6 text-slate-700">
              Vi har ikke separate registreringer - du bliver kunde, første gang
              du booker. Derefter logger du ind med din e-mail og en
              engangskode.
            </p>
          </div>

          <Link
            href="/book-tid"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-sky-300/70 bg-sky-500/90 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(14,116,184,0.30),inset_0_1px_0_rgba(255,255,255,0.34)] transition hover:bg-sky-600"
          >
            <CalendarPlus className="h-5 w-5" />
            Book din første batteritest
          </Link>

          <p className="text-center text-sm text-slate-700">
            Har du allerede en booking?{" "}
            <button
              type="button"
              onClick={() => {
                setTab("login");
                resetMessages();
              }}
              className="font-extrabold text-sky-700 hover:underline"
            >
              Log ind her
            </button>
          </p>
        </div>
      )}

      <div className="border-t border-white/45 bg-white/20 px-6 py-4 text-center backdrop-blur-xl">
        <p className="text-xs break-words text-slate-700">
          EV-Check.dk · Batteritest af elbil · København &amp; Sjælland
        </p>
      </div>
    </section>
  );
}
