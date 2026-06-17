import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-transparent px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 text-slate-950 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-[1500px]">{children}</div>
    </main>
  );
}
