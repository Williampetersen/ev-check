"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice, type Appointment } from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

type ChartRange = "today" | "7" | "14" | "30" | "90" | "custom";

type BookingTrendPoint = {
  key: string;
  label: string;
  bookings: number;
  completed: number;
  pending: number;
  cancelled: number;
  revenue: number;
  outstanding: number;
};

const rangeLabels: Record<ChartRange, string> = {
  today: "Today",
  "7": "7 days",
  "14": "14 days",
  "30": "30 days",
  "90": "90 days",
  custom: "Custom",
};

export function BookingTrendChart({
  appointments,
  timeZone,
}: {
  appointments: Appointment[];
  timeZone: string;
}) {
  const [range, setRange] = useState<ChartRange>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const todayKey = useMemo(
    () => dateKeyInTimeZone(new Date(), timeZone),
    [timeZone],
  );

  const { from, to } = useMemo(() => {
    if (range === "today") return { from: todayKey, to: todayKey };
    if (range === "custom") {
      if (!customFrom || !customTo) return { from: todayKey, to: todayKey };
      return customFrom <= customTo
        ? { from: customFrom, to: customTo }
        : { from: customTo, to: customFrom };
    }

    const fromDate = dateFromKey(todayKey);
    fromDate.setDate(fromDate.getDate() - Number(range) + 1);
    return { from: toDateKey(fromDate), to: todayKey };
  }, [customFrom, customTo, range, todayKey]);

  const data = useMemo(
    () => buildDailyBookingData(appointments, from, to),
    [appointments, from, to],
  );

  const totals = useMemo(() => {
    const bookings = data.reduce((sum, point) => sum + point.bookings, 0);
    const completed = data.reduce((sum, point) => sum + point.completed, 0);
    const pending = data.reduce((sum, point) => sum + point.pending, 0);
    const revenue = data.reduce((sum, point) => sum + point.revenue, 0);
    const outstanding = data.reduce((sum, point) => sum + point.outstanding, 0);
    const busiest = data.reduce<BookingTrendPoint | null>(
      (best, point) => (!best || point.bookings > best.bookings ? point : best),
      null,
    );

    return { bookings, completed, pending, revenue, outstanding, busiest };
  }, [data]);

  const xAxisInterval = data.length <= 7 ? 0 : data.length <= 14 ? 1 : 4;
  const hasBookings = totals.bookings > 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Booking trend</p>
          <p className="mt-1 text-sm text-slate-500">
            {data.length} day{data.length === 1 ? "" : "s"} - {totals.bookings}{" "}
            booking{totals.bookings === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl leading-none font-bold text-slate-950">
            {formatPrice(totals.revenue)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {formatPrice(totals.outstanding)} open
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["today", "7", "14", "30", "90", "custom"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={cn(
              "h-9 rounded-lg px-3 text-xs font-bold transition",
              range === item
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                : "border border-white/70 bg-white/65 text-slate-600 hover:border-sky-300 hover:bg-white hover:text-sky-700",
            )}
          >
            {rangeLabels[item]}
          </button>
        ))}
      </div>

      {range === "custom" ? (
        <div className="grid gap-2 sm:max-w-lg sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <input
            type="date"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
            className="h-10 rounded-lg border border-white/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 transition outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
          />
          <span className="hidden text-sm font-semibold text-slate-400 sm:block">
            to
          </span>
          <input
            type="date"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
            className="h-10 rounded-lg border border-white/70 bg-white/70 px-3 text-sm font-semibold text-slate-700 transition outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-4">
        <TrendMetric label="Bookings" value={String(totals.bookings)} />
        <TrendMetric label="Completed" value={String(totals.completed)} />
        <TrendMetric label="Pending" value={String(totals.pending)} />
        <TrendMetric
          label="Busiest day"
          value={
            totals.busiest && totals.busiest.bookings > 0
              ? `${totals.busiest.bookings} on ${totals.busiest.label}`
              : "-"
          }
        />
      </div>

      <div className="relative h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ left: -18, right: 12, top: 18, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#dbeafe"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="label"
              interval={xAxisInterval}
              minTickGap={10}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              width={32}
            />
            <Tooltip
              content={<BookingTrendTooltip />}
              cursor={{
                stroke: "#0284c7",
                strokeDasharray: "4 4",
                strokeWidth: 1.5,
              }}
            />
            <Line
              activeDot={{
                r: 6,
                fill: "#0284c7",
                stroke: "#ffffff",
                strokeWidth: 3,
              }}
              dataKey="bookings"
              dot={data.length <= 14}
              name="Bookings"
              stroke="#0284c7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              type="monotone"
            />
            <Line
              dataKey="completed"
              dot={false}
              name="Completed"
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeLinecap="round"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="pending"
              dot={false}
              name="Pending"
              stroke="#f59e0b"
              strokeDasharray="3 5"
              strokeLinecap="round"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>

        {!hasBookings ? (
          <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-lg border border-dashed border-slate-200 bg-white/80 px-4 py-3 text-center text-sm font-semibold text-slate-500 shadow-sm backdrop-blur">
            No bookings in this period.
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
        <LegendDot color="bg-sky-600" label="Bookings" />
        <LegendDot color="bg-emerald-500" label="Completed" />
        <LegendDot color="bg-amber-500" label="Pending" />
      </div>
    </div>
  );
}

function TrendMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/50 px-3 py-2 backdrop-blur">
      <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

function BookingTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload?: BookingTrendPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length || !payload[0]?.payload) return null;

  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-sky-100 bg-white/95 px-3 py-2 text-sm shadow-xl shadow-sky-900/10 backdrop-blur">
      <p className="font-bold text-slate-950">{label}</p>
      <div className="mt-2 grid gap-1 text-xs font-semibold text-slate-600">
        <span>{point.bookings} bookings</span>
        <span>{point.completed} completed</span>
        <span>{point.pending} pending</span>
        <span>{point.cancelled} cancelled</span>
        <span>{formatPrice(point.revenue)} revenue</span>
      </div>
    </div>
  );
}

function buildDailyBookingData(
  appointments: Appointment[],
  from: string,
  to: string,
) {
  const days: BookingTrendPoint[] = [];
  const current = dateFromKey(from);
  const end = dateFromKey(to);

  while (current <= end) {
    const key = toDateKey(current);
    days.push({
      key,
      label: formatChartDate(current),
      bookings: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      revenue: 0,
      outstanding: 0,
    });
    current.setDate(current.getDate() + 1);
  }

  const dayMap = new Map(days.map((day) => [day.key, day]));

  for (const appointment of appointments) {
    const day = dayMap.get(appointment.appointmentDate);
    if (!day) continue;

    if (appointment.status === "cancelled") {
      day.cancelled += 1;
      continue;
    }

    day.bookings += 1;
    day.revenue += appointment.total;
    if (appointment.status === "completed") day.completed += 1;
    if (appointment.status === "pending") day.pending += 1;
    if (appointment.paymentStatus !== "paid") {
      day.outstanding += appointment.total;
    }
  }

  return days;
}

function dateKeyInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1, 12);
}

function toDateKey(date: Date) {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatChartDate(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(date);
  } catch {
    return toDateKey(date);
  }
}
