"use client";

import {
  CalendarCheck2,
  CalendarDays,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListChecks,
} from "lucide-react";
import { AdminTabs, type AdminTabItem } from "@/components/admin/admin-tabs";
import {
  formatPrice,
  formatShortDate,
  statusLabels,
  type Appointment,
  type AppointmentStatus,
  type BookingUnavailablePeriod,
  type DashboardSettings,
} from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

export type CalendarMode = "day" | "week" | "agenda";

const ROW_HEIGHT = 64;
const MIN_BLOCK_HEIGHT = 34;

const statusBlockStyles: Record<AppointmentStatus, string> = {
  pending: "border-amber-200 bg-amber-50/95 text-amber-900",
  approved: "border-sky-200 bg-sky-50/95 text-sky-900",
  completed: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
  cancelled: "border-rose-200 bg-rose-50/90 text-rose-900 line-through",
};

const statusDotStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-500",
  approved: "bg-sky-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

function toDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1, 12);
}

function toKey(date: Date) {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export function CalendarView({
  appointments,
  unavailablePeriods = [],
  settings,
  date,
  mode,
  onDateChange,
  onModeChange,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  unavailablePeriods?: BookingUnavailablePeriod[];
  settings: DashboardSettings;
  date: string;
  mode: CalendarMode;
  onDateChange: (date: string) => void;
  onModeChange: (mode: CalendarMode) => void;
  onSelectAppointment: (id: string) => void;
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

  const shift = mode === "day" ? 1 : 7;
  const prevDate = addDays(anchor, -shift);
  const nextDate = addDays(anchor, shift);
  const periodLabel =
    mode === "day"
      ? formatDayHeader(anchor)
      : formatWeekRange(weekStart, addDays(weekStart, 6));
  const periodAppointments = days
    .flatMap((day) => appointmentsByDay.get(day) || [])
    .sort((a, b) =>
      `${a.appointmentDate}T${a.appointmentTime}`.localeCompare(
        `${b.appointmentDate}T${b.appointmentTime}`,
      ),
    );
  const activePeriodAppointments = periodAppointments.filter(
    (item) => item.status !== "cancelled",
  );
  const periodClosedItems = days.flatMap((day) =>
    unavailablePeriodsForDay(day, unavailablePeriods).map((period) => ({
      day,
      period,
    })),
  );
  const modeTabs: AdminTabItem<CalendarMode>[] = [
    { id: "day", label: "Day", icon: CalendarDays },
    { id: "week", label: "Week", icon: CalendarCheck2 },
    { id: "agenda", label: "Agenda", icon: ListChecks },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CalendarMetric
          label="This period"
          value={String(activePeriodAppointments.length)}
          detail="Active bookings"
        />
        <CalendarMetric
          label="Pending"
          value={String(
            periodAppointments.filter((item) => item.status === "pending")
              .length,
          )}
          detail="Needs review"
        />
        <CalendarMetric
          label="Completed"
          value={String(
            periodAppointments.filter((item) => item.status === "completed")
              .length,
          )}
          detail="Done checks"
        />
        <CalendarMetric
          label="Revenue"
          value={formatPrice(
            activePeriodAppointments.reduce((sum, item) => sum + item.total, 0),
          )}
          detail="Booked value"
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{periodLabel}</p>
          <p className="text-sm text-slate-500">
            {activePeriodAppointments.length}{" "}
            {activePeriodAppointments.length === 1 ? "booking" : "bookings"}{" "}
            shown
          </p>
        </div>

        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-[auto_auto] sm:items-center xl:flex">
          <AdminTabs active={mode} items={modeTabs} onSelect={onModeChange} />
          <div className="flex flex-wrap items-center gap-2">
            <NavButton onClick={() => onDateChange(todayKey)}>Today</NavButton>
            <div className="flex items-center gap-1">
              <NavButton
                onClick={() => onDateChange(prevDate)}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </NavButton>
              <input
                type="date"
                value={anchor}
                onChange={(event) =>
                  event.target.value && onDateChange(event.target.value)
                }
                className="h-9 rounded-lg border border-white/70 bg-white/70 px-2 text-sm font-medium text-slate-700 backdrop-blur outline-none focus:border-sky-400"
              />
              <NavButton
                onClick={() => onDateChange(nextDate)}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </NavButton>
            </div>
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
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Closed time
        </span>
      </div>

      {mode === "agenda" ? (
        <AgendaList
          appointments={periodAppointments}
          closedPeriods={periodClosedItems}
          onSelectAppointment={onSelectAppointment}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/60">
          <div
            className="grid min-w-[760px]"
            style={{
              gridTemplateColumns: `4rem repeat(${days.length}, minmax(10rem,1fr))`,
            }}
          >
            <div className="border-b border-white/60 bg-white/40" />
            {days.map((day) => {
              const dayAppointments = (appointmentsByDay.get(day) || []).filter(
                (item) => item.status !== "cancelled",
              );
              const dayClosedPeriods = unavailablePeriodsForDay(
                day,
                unavailablePeriods,
              );
              return (
                <div
                  key={day}
                  className={cn(
                    "border-b border-l border-white/60 px-2 py-2 text-center",
                    day === todayKey && "bg-sky-50/70",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-bold tracking-wide uppercase",
                      day === todayKey ? "text-sky-700" : "text-slate-500",
                    )}
                  >
                    {formatDayHeader(day)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">
                    {dayAppointments.length} booked
                    {dayClosedPeriods.length > 0
                      ? ` - ${dayClosedPeriods.length} closed`
                      : ""}
                  </p>
                </div>
              );
            })}

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
                  day === todayKey && "bg-sky-50/30",
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
                {layoutUnavailablePeriods(
                  unavailablePeriodsForDay(day, unavailablePeriods),
                  startHour,
                  endHour,
                ).map((layout) => (
                  <div
                    key={`${layout.period.id}-${layout.top}`}
                    className="pointer-events-none absolute inset-x-1 overflow-hidden rounded-md border border-rose-200 bg-rose-100/80 px-2 py-1 text-[11px] leading-tight font-semibold text-rose-800 shadow-sm"
                    style={{
                      top: layout.top,
                      height: layout.height,
                    }}
                  >
                    <p className="truncate font-bold">
                      {layout.period.title}
                    </p>
                    <p className="truncate text-[10px] opacity-80">
                      {layout.label}
                    </p>
                  </div>
                ))}
                {layoutAppointments(
                  appointmentsByDay.get(day) || [],
                  settings,
                  startHour,
                  endHour,
                ).map((layout) => (
                  <button
                    key={layout.appointment.id}
                    type="button"
                    onClick={() => onSelectAppointment(layout.appointment.id)}
                    className={cn(
                      "absolute overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition hover:z-10 hover:shadow-md",
                      statusBlockStyles[layout.appointment.status],
                    )}
                    style={{
                      top: layout.top,
                      height: layout.height,
                      left: `calc(${(layout.lane / layout.laneCount) * 100}% + 0.25rem)`,
                      width: `calc(${100 / layout.laneCount}% - 0.5rem)`,
                    }}
                  >
                    <p className="truncate font-bold">
                      {layout.appointment.appointmentTime}{" "}
                      {layout.appointment.customerName}
                    </p>
                    <p className="truncate">
                      {layout.appointment.serviceLabel}
                    </p>
                    <p className="truncate text-[10px] opacity-80">
                      {formatPrice(layout.appointment.total)}
                    </p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarMetric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-950">
            {value}
          </p>
          <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50/80 text-sky-700 ring-1 ring-sky-100 backdrop-blur">
          <Clock3 className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function AgendaList({
  appointments,
  closedPeriods,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  closedPeriods: Array<{ day: string; period: BookingUnavailablePeriod }>;
  onSelectAppointment: (id: string) => void;
}) {
  const items = [
    ...appointments.map((appointment) => ({
      kind: "appointment" as const,
      sort: `${appointment.appointmentDate}T${appointment.appointmentTime}`,
      appointment,
    })),
    ...closedPeriods.map((item) => ({
      kind: "closed" as const,
      sort: `${item.day}T${item.period.isFullDay ? "00:00" : item.period.startTime}`,
      ...item,
    })),
  ].sort((a, b) => a.sort.localeCompare(b.sort));

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/70 bg-white/40 px-4 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur">
        No bookings in this period.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => {
        if (item.kind === "closed") {
          return (
            <div
              key={`${item.period.id}-${item.day}`}
              className="grid gap-3 rounded-lg border border-rose-200/80 bg-rose-50/80 p-4 text-left text-rose-950 backdrop-blur sm:grid-cols-[9rem_1fr_auto] sm:items-center"
            >
              <div>
                <p className="text-xs font-bold tracking-wide text-rose-500 uppercase">
                  {formatShortDate(item.day)}
                </p>
                <p className="mt-1 font-bold">
                  {item.period.isFullDay
                    ? "All day"
                    : `${item.period.startTime} - ${item.period.endTime}`}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{item.period.title}</p>
                <p className="truncate text-sm text-rose-700">
                  Closed for website booking
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-200 bg-white/65 px-2.5 py-1 text-xs font-bold text-rose-700">
                <CalendarX2 className="h-3.5 w-3.5" />
                Closed
              </span>
            </div>
          );
        }

        const { appointment } = item;
        return (
          <button
            key={appointment.id}
            type="button"
            onClick={() => onSelectAppointment(appointment.id)}
            className="glass-card grid gap-3 rounded-lg p-4 text-left transition hover:border-sky-300 sm:grid-cols-[9rem_1fr_auto] sm:items-center"
          >
            <div>
              <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                {formatShortDate(appointment.appointmentDate)}
              </p>
              <p className="mt-1 font-bold text-slate-950">
                {appointment.appointmentTime}
              </p>
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">
                {appointment.customerName}
              </p>
              <p className="truncate text-sm text-slate-500">
                {appointment.serviceLabel} - {appointment.vehicleLabel}
              </p>
            </div>
            <span
              className={cn(
                "w-fit rounded-full border px-2.5 py-1 text-xs font-bold",
                statusBlockStyles[appointment.status],
              )}
            >
              {statusLabels[appointment.status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function unavailablePeriodsForDay(
  day: string,
  periods: BookingUnavailablePeriod[],
) {
  return periods.filter((period) => {
    const endDate = period.endDate || period.startDate;
    return day >= period.startDate && day <= endDate;
  });
}

function layoutUnavailablePeriods(
  periods: BookingUnavailablePeriod[],
  startHour: number,
  endHour: number,
) {
  const startBoundary = startHour * 60;
  const endBoundary = endHour * 60;
  return periods
    .flatMap((period) => {
      const start = period.isFullDay ? startBoundary : minutesOf(period.startTime);
      const end = period.isFullDay ? endBoundary : minutesOf(period.endTime);
      const clampedStart = Math.max(start, startBoundary);
      const clampedEnd = Math.min(end, endBoundary);
      if (clampedEnd <= clampedStart) return [];
      return [{
        period,
        label: period.isFullDay ? "All day" : `${period.startTime} - ${period.endTime}`,
        top: ((clampedStart - startBoundary) / 60) * ROW_HEIGHT,
        height: Math.max(
          MIN_BLOCK_HEIGHT,
          ((clampedEnd - clampedStart) / 60) * ROW_HEIGHT,
        ),
      }];
    });
}

function layoutAppointments(
  appointments: Appointment[],
  settings: DashboardSettings,
  startHour: number,
  endHour: number,
) {
  const startBoundary = startHour * 60;
  const endBoundary = endHour * 60;
  const events = appointments
    .map((appointment) => {
      const start = minutesOf(appointment.appointmentTime);
      const end = appointment.appointmentEndTime
        ? minutesOf(appointment.appointmentEndTime)
        : start + (settings.slotMinutes || 30);
      return { appointment, start, end: Math.max(end, start + 15) };
    })
    .filter((event) => event.end > startBoundary && event.start < endBoundary)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const laneEnds: number[] = [];
  const laidOut = events.map((event) => {
    const laneIndex = laneEnds.findIndex((end) => end <= event.start);
    const lane = laneIndex >= 0 ? laneIndex : laneEnds.length;
    laneEnds[lane] = event.end;

    const clampedStart = Math.max(event.start, startBoundary);
    const clampedEnd = Math.min(event.end, endBoundary);
    return {
      appointment: event.appointment,
      lane,
      laneCount: 1,
      top: ((clampedStart - startBoundary) / 60) * ROW_HEIGHT,
      height: Math.max(
        MIN_BLOCK_HEIGHT,
        ((clampedEnd - clampedStart) / 60) * ROW_HEIGHT,
      ),
    };
  });

  const laneCount = Math.max(1, ...laidOut.map((item) => item.lane + 1));
  return laidOut.map((item) => ({ ...item, laneCount }));
}

function NavButton({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/70 bg-white/55 px-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-sky-300 hover:text-sky-700"
    >
      {children}
    </button>
  );
}
