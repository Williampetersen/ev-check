import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CUSTOMER_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const metadata = {
  title: "My account - EV Check",
  robots: { index: false, follow: false },
};

export default function CustomerLoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const session = verifySessionToken(cookies().get(CUSTOMER_COOKIE_NAME)?.value, "customer");
  if (session) redirect(`/kunde/${session.sub}`);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-950">Customer portal</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the email used for your EV Check appointment to open your customer dashboard.
        </p>
        {searchParams?.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            No customer was found for that email.
          </div>
        ) : null}
        <form action="/api/customer/auth/send-code" method="POST" className="mt-6 grid gap-4">
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
