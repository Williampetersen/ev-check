import Link from "next/link";
import {
  statusLabels,
  type Appointment,
  type AppointmentStatus,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 56;
const MIN_BLOCK_HEIGHT = 24;

const statusBlockStyles: Record<AppointmentStatus, string> = {
  pending: "border-amber-300 bg-amber-100/90 text-amber-900",
  approved: "border-teal-300 bg-teal-100/90 text-teal-900",
  completed: "border-emerald-300 bg-emerald-100/90 text-emerald-900",
  cancelled: "border-rose-300 bg-rose-100/80 text-rose-900 line-through",
};

const statusDotStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-500",
  approved: "bg-teal-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

function toDate(key: string) {
  return new Date(`${key}T00:00:00`);
}

function toKey(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function addDays(key: string, amount: number) {
  const date = toDate(key);
  date.setDate(date.getDate() + amount);
  return toKey(date);
}

function mondayOf(key: string) {
  const date = toDate(key);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toKey(date);
}

function formatDayHeader(key: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(toDate(key));
  } catch {
    return key;
  }
}

function formatWeekRange(startKey: string, endKey: string) {
  try {
    const start = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(toDate(startKey));
    const end = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(toDate(endKey));
    return `${start} - ${end}`;
  } catch {
    return `${startKey} - ${endKey}`;
  }
}

function minutesOf(time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number(part || 0));
  return hours * 60 + minutes;
}

function buildHref(date: string, mode: "day" | "week") {
  return `/admin?view=calendar&date=${date}&mode=${mode}`;
}

export function CalendarView({
  appointments,
  settings,
  date,
  mode,
}: {
  appointments: Appointment[];
  settings: DashboardSettings;
  date: string;
  mode: "day" | "week";
}) {
  const todayKey = toKey(new Date());
  const anchor = date || todayKey;
  const weekStart = mondayOf(anchor);
  const days =
    mode === "day"
      ? [anchor]
      : Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const startHour = Math.min(Math.max(settings.startHour ?? 8, 0), 22);
  const endHour = Math.max(settings.endHour ?? 18, startHour + 1);
  const hours = Array.from(
    { length: endHour - startHour },
    (_, index) => startHour + index,
  );
  const gridHeight = hours.length * ROW_HEIGHT;

  const appointmentsByDay = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    appointmentsByDay.set(appointment.appointmentDate, [
      ...(appointmentsByDay.get(appointment.appointmentDate) || []),
      appointment,
    ]);
  }

  const prevDate = addDays(anchor, mode === "day" ? -1 : -7);
  const nextDate = addDays(anchor, mode === "day" ? 1 : 7);
  const periodLabel =
    mode === "day"
      ? formatDayHeader(anchor)
      : formatWeekRange(weekStart, addDays(weekStart, 6));
  const periodAppointments = days
    .flatMap((day) => appointmentsByDay.get(day) || [])
    .filter((item) => item.status !== "cancelled");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{periodLabel}</p>
          <p className="text-sm text-slate-500">
            {periodAppointments.length}{" "}
            {periodAppointments.length === 1 ? "booking" : "bookings"} shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink href={buildHref(todayKey, mode)}>Today</NavLink>
          <div className="flex items-center gap-1">
            <NavLink href={buildHref(prevDate, mode)} aria-label="Previous">
              ‹
            </NavLink>
            <form
              action="/admin"
              method="GET"
              className="flex items-center"
            >
              <input type="hidden" name="view" value="calendar" />
              <input type="hidden" name="mode" value={mode} />
              <input
                type="date"
                name="date"
                defaultValue={anchor}
                className="h-9 rounded-lg border border-white/70 bg-white/70 px-2 text-sm font-medium text-slate-700 outline-none backdrop-blur focus:border-teal-400"
              />
            </form>
            <NavLink href={buildHref(nextDate, mode)} aria-label="Next">
              ›
            </NavLink>
          </div>
          <div className="flex rounded-lg border border-white/70 bg-white/55 p-1 backdrop-blur">
            <ModeLink href={buildHref(anchor, "day")} active={mode === "day"}>
              Day
            </ModeLink>
            <ModeLink
              href={buildHref(anchor, "week")}
              active={mode === "week"}
            >
              Week
            </ModeLink>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
        {(Object.keys(statusLabels) as AppointmentStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className={cn("h-2 w-2 rounded-full", statusDotStyles[status])}
            />
            {statusLabels[status]}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/60">
        <div
          className="grid min-w-[640px]"
          style={{
            gridTemplateColumns: `4rem repeat(${days.length}, minmax(0,1fr))`,
          }}
        >
          <div className="border-b border-white/60 bg-white/40" />
          {days.map((day) => (
            <div
              key={day}
              className={cn(
                "border-b border-l border-white/60 px-2 py-2 text-center",
                day === todayKey && "bg-teal-50/70",
              )}
            >
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wide",
                  day === todayKey ? "text-teal-700" : "text-slate-500",
                )}
              >
                {formatDayHeader(day)}
              </p>
            </div>
          ))}

          <div
            className="relative bg-white/30"
            style={{ height: gridHeight }}
          >
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="absolute inset-x-0 -translate-y-1/2 pr-2 text-right text-[11px] font-semibold text-slate-400"
                style={{ top: index * ROW_HEIGHT }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {days.map((day) => (
            <div
              key={day}
              className={cn(
                "relative border-l border-white/60",
                day === todayKey && "bg-teal-50/30",
              )}
              style={{ height: gridHeight }}
            >
              {hours.map((hour, index) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-t border-white/45"
                  style={{ top: index * ROW_HEIGHT }}
                />
              ))}
              {(appointmentsByDay.get(day) || []).map((appointment) => {
                const startMinutes = minutesOf(appointment.appointmentTime);
                const endMinutes = appointment.appointmentEndTime
                  ? minutesOf(appointment.appointmentEndTime)
                  : startMinutes + (settings.slotMinutes || 30);
                const top = Math.max(
                  0,
                  ((startMinutes - startHour * 60) / 60) * ROW_HEIGHT,
                );
                const height = Math.max(
                  MIN_BLOCK_HEIGHT,
                  ((endMinutes - startMinutes) / 60) * ROW_HEIGHT,
                );
                return (
                  <Link
                    key={appointment.id}
                    href={`/admin?view=booking&id=${appointment.id}&from=calendar&date=${anchor}&mode=${mode}`}
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-[11px] leading-tight shadow-sm transition hover:z-10 hover:shadow-md",
                      statusBlockStyles[appointment.status],
                    )}
                    style={{ top, height }}
                  >
                    <p className="truncate font-bold">
                      {appointment.appointmentTime} {appointment.customerName}
                    </p>
                    <p className="truncate">{appointment.serviceLabel}</p>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      href={href}
      {...props}
      className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-teal-300 hover:text-teal-700"
    >
      {children}
    </Link>
  );
}

function ModeLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-7 items-center justify-center rounded-md px-3 text-xs font-bold transition",
        active
          ? "bg-teal-600 text-white shadow-sm shadow-teal-500/30"
          : "text-slate-600 hover:text-slate-950",
      )}
    >
      {children}
    </Link>
  );
}
