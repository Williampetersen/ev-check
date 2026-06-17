import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const metadata = {
  title: "Admin login - EV Check",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; configured?: string };
}) {
  const session = verifySessionToken(
    cookies().get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (session) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-3 py-10">
      <section className="glass-shell w-full max-w-md rounded-lg p-5 sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950/90 text-teal-300 shadow-sm shadow-slate-950/20">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-bold leading-tight text-slate-950">
          Admin login
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Access appointments, customers, users, emails, invoices, and settings.
        </p>

        {searchParams?.error ? (
          <div className="mt-5 rounded-lg border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur">
            Login failed. Check `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
            `ADMIN_SESSION_SECRET`.
          </div>
        ) : null}

        <form
          action="/api/admin/login"
          method="POST"
          className="mt-6 grid gap-4"
        >
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Email
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Password
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <Button type="submit" className="mt-2 w-full">
            Log in
          </Button>
        </form>
      </section>
    </main>
  );
}
