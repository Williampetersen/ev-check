import type { AppointmentStatus, PaymentStatus } from "@/lib/ev-domain";
import { paymentLabels, statusLabels } from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

const statusStyles: Record<AppointmentStatus, string> = {
  pending: "border-amber-200/80 bg-amber-50/80 text-amber-700",
  approved: "border-teal-200/80 bg-teal-50/80 text-teal-700",
  completed: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  cancelled: "border-rose-200/80 bg-rose-50/80 text-rose-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "border-rose-200/80 bg-rose-50/80 text-rose-700",
  pending: "border-amber-200/80 bg-amber-50/80 text-amber-700",
  paid: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700",
  refunded: "border-slate-200/80 bg-slate-50/80 text-slate-600",
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
