import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings2,
  Users,
  Wrench,
} from "lucide-react";
import { formatPrice, type AdminDashboardData } from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

const items = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "calendar", label: "Calendar", icon: CalendarRange },
  { id: "customers", label: "Customers", icon: Users },
  { id: "users", label: "Users", icon: Wrench },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

export type AdminView = (typeof items)[number]["id"];

export function AdminSidebar({
  dashboard,
  sessionEmail,
  view,
}: {
  dashboard: AdminDashboardData;
  sessionEmail: string;
  view: string;
}) {
  return (
    <aside className="glass-shell overflow-hidden rounded-lg xl:sticky xl:top-5 xl:self-start">
      <div className="border-b border-white/50 px-4 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950/90 text-sm font-black text-teal-300 shadow-sm shadow-slate-950/20 backdrop-blur">
            EV
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              EV Check
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Command center
            </p>
            <p className="truncate text-xs text-slate-500">{sessionEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] xl:grid xl:grid-cols-1 xl:overflow-visible [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <Link
              key={item.id}
              href={`/admin?view=${item.id}`}
              className={cn(
                "flex min-w-[8.5rem] items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition xl:min-w-0 xl:py-2.5",
                active
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-500/30"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-950",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/50 px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          <SidebarStat
            label="Today"
            value={String(dashboard.stats.todayAppointments)}
          />
          <SidebarStat
            label="Open"
            value={String(dashboard.stats.pendingAppointments)}
          />
          <SidebarStat
            label="Due"
            value={formatPrice(dashboard.stats.outstandingRevenue)}
          />
        </div>
      </div>

      <div className="border-t border-white/50 px-4 py-4">
        <form action="/api/admin/logout" method="POST">
          <button className="flex h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-white/60 hover:text-slate-950">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/45 px-2.5 py-2 backdrop-blur">
      <span className="block truncate text-[11px] font-medium text-slate-500">
        {label}
      </span>
      <strong className="mt-1 block truncate text-xs text-slate-950">
        {value}
      </strong>
    </div>
  );
}
