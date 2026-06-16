import type { AppointmentStatus, PaymentStatus } from "@/lib/ev-domain";
import { paymentLabels, statusLabels } from "@/lib/ev-domain";
import { cn } from "@/lib/utils";

const statusStyles: Record<AppointmentStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-teal-200 bg-teal-50 text-teal-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "border-rose-200 bg-rose-50 text-rose-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  refunded: "border-slate-200 bg-slate-50 text-slate-600",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusStyles[status])}>
      {statusLabels[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", paymentStyles[status])}>
      {paymentLabels[status]}
    </span>
  );
}
