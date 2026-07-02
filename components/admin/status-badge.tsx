import type {
  AppointmentStatus,
  PaymentStatus,
  ReportPaymentStatus,
} from "@/lib/ev-domain";
import {
  paymentLabels,
  reportPaymentLabels,
  statusLabels,
} from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

const statusStyles: Record<AppointmentStatus, string> = {
  pending: "border-sky-200/80 bg-sky-50/80 text-sky-700",
  approved: "border-sky-200/80 bg-sky-50/80 text-sky-700",
  completed: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  cancelled: "border-rose-200/80 bg-rose-50/80 text-rose-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "border-rose-200/80 bg-rose-50/80 text-rose-700",
  pending: "border-sky-200/80 bg-sky-50/80 text-sky-700",
  paid: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  refunded: "border-slate-200/80 bg-slate-50/80 text-slate-600",
};

const reportPaymentStyles: Record<ReportPaymentStatus, string> = {
  paid: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  unpaid: "border-rose-200/80 bg-rose-50/80 text-rose-700",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur",
        paymentStyles[status],
      )}
    >
      {paymentLabels[status]}
    </span>
  );
}

export function ReportPaymentBadge({ status }: { status: ReportPaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur",
        reportPaymentStyles[status],
      )}
    >
      {reportPaymentLabels[status]}
    </span>
  );
}
