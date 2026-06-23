import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Min konto - EV-Check.dk",
  description: "Log ind for at se og administrere dine EV-Check bookinger.",
  robots: { index: false, follow: false },
};

export default async function CustomerLoginPage() {
  const session = verifySessionToken(
    (await cookies()).get(CUSTOMER_COOKIE_NAME)?.value,
    "customer",
  );

  if (session) redirect(`/kunde/${encodeURIComponent(session.sub)}`);

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(125,211,252,0.60),transparent_28rem),linear-gradient(180deg,#dff5ff_0%,#b9e5fb_46%,#77c5f3_100%)] px-4 py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-white/20 blur-3xl" />
      <div className="relative flex w-full justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
