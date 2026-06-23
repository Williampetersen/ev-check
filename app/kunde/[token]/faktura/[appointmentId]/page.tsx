import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice/invoice-document";
import { InvoiceToolbar } from "@/components/invoice/invoice-toolbar";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";
import { ensureInvoiceRecord } from "@/lib/server/invoices";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";

export const metadata = {
  title: "Invoice - EV Check",
  robots: { index: false, follow: false },
};

export default async function CustomerInvoicePage({
  params,
}: {
  params: Promise<{ token: string; appointmentId: string }>;
}) {
  const { token, appointmentId } = await params;
  const portal = await getCustomerDashboardByToken(token);
  if (!portal) notFound();

  const session = verifySessionToken(
    (await cookies()).get(CUSTOMER_COOKIE_NAME)?.value,
    "customer",
  );
  const expectedToken = portal.customer.portalToken || portal.customer.id;
  if (
    !session ||
    session.sub !== expectedToken ||
    session.email.toLowerCase() !== portal.customer.email.toLowerCase()
  ) {
    redirect("/min-konto");
  }

  const appointment = portal.appointments.find(
    (item) => item.id === appointmentId,
  );
  if (!appointment) notFound();

  const { invoiceNumber } = await ensureInvoiceRecord({
    appointment,
    customer: portal.customer,
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <InvoiceToolbar backHref={`/kunde/${token}`} />
        <InvoiceDocument
          invoiceNumber={invoiceNumber}
          appointment={appointment}
          customer={portal.customer}
          settings={portal.settings}
        />
      </div>
    </main>
  );
}
