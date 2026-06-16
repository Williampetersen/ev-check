import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AGENT_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const metadata = {
  title: "User login - EV Check",
  robots: { index: false, follow: false },
};

export default function AgentLoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const session = verifySessionToken(cookies().get(AGENT_COOKIE_NAME)?.value, "agent");
  if (session) redirect("/agent");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <User className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-950">Service user login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Field users can view assigned EV checks and daily work.
        </p>
        {searchParams?.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            Login failed.
          </div>
        ) : null}
        <form action="/api/agent/login" method="POST" className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Email
            <Input name="email" type="email" required />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Password
            <Input name="password" type="password" required />
          </label>
          <Button type="submit">Log in</Button>
        </form>
      </section>
    </main>
  );
}
