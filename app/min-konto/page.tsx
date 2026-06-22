import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brandLogoPath } from "@/lib/seo";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";

export const metadata = {
  title: "Min konto",
  robots: { index: false, follow: false },
};

export default function CustomerLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const session = verifySessionToken(
    cookies().get(CUSTOMER_COOKIE_NAME)?.value,
    "customer",
  );
  if (session) redirect(`/kunde/${session.sub}`);

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-3 py-10">
      <section className="glass-shell w-full max-w-md rounded-lg p-5 sm:p-6">
        <Image
          src={brandLogoPath}
          alt="EV-Check.dk logo"
          width={52}
          height={52}
          className="h-12 w-12 rounded-lg bg-white object-contain shadow-sm shadow-slate-950/10"
        />
        <h1 className="mt-6 text-2xl font-bold leading-tight text-slate-950">
          Customer portal
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the email used for your EV Check appointment to open your
          customer dashboard.
        </p>
        {searchParams?.error ? (
          <div className="mt-5 rounded-lg border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur">
            No customer was found for that email.
          </div>
        ) : null}
        <form
          action="/api/customer/auth/send-code"
          method="POST"
          className="mt-6 grid gap-4"
        >
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Email
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <Button type="submit">Open portal</Button>
        </form>
      </section>
    </main>
  );
}
