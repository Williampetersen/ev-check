import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice/invoice-document";
import { InvoiceToolbar } from "@/components/invoice/invoice-toolbar";
import { getAdminDashboardData } from "@/lib/server/dashboard";
import { ensureInvoiceRecord } from "@/lib/server/invoices";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/server/sessions";

export const metadata = {
  title: "Invoice - EV Check",
  robots: { index: false, follow: false },
};

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const session = verifySessionToken(
    (await cookies()).get(ADMIN_COOKIE_NAME)?.value,
    "admin",
  );
  if (!session) redirect("/admin/login");

  const { appointmentId } = await params;
  const dashboard = await getAdminDashboardData();
  const appointment = dashboard.appointments.find(
    (item) => item.id === appointmentId,
  );
  const customer = appointment
    ? dashboard.customers.find((item) => item.id === appointment.customerId)
    : undefined;
  if (!appointment || !customer) notFound();

  const { invoiceNumber } = await ensureInvoiceRecord({
    appointment,
    customer,
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <InvoiceToolbar
          backHref="/admin?view=invoices"
          downloadHref={`/api/admin/invoices/${appointment.id}`}
        />
        <InvoiceDocument
          invoiceNumber={invoiceNumber}
          appointment={appointment}
          customer={customer}
          settings={dashboard.settings}
        />
      </div>
    </main>
  );
}
