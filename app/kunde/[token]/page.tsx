import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CustomerDashboardClient } from "@/components/kunde/customer-dashboard-client";
import type { CustomerView } from "@/components/kunde/customer-sidebar";
import { getCustomerDashboardByToken } from "@/lib/server/dashboard";
import {
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server/sessions";

export const metadata = {
  title: "Customer portal - EV Check",
  robots: { index: false, follow: false },
};

const views: CustomerView[] = [
  "appointments",
  "invoices",
  "reports",
  "settings",
];

export default async function CustomerTokenPage({
  params,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ view?: string; saved?: string; error?: string }>;
}) {
  const { token } = await params;
  const searchParams = await searchParamsPromise;
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

  const view = views.includes(searchParams?.view as CustomerView)
    ? (searchParams?.view as CustomerView)
    : "appointments";

  return (
    <main className="min-h-screen bg-transparent px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-5">
      <div className="mx-auto max-w-[1500px]">
        <CustomerDashboardClient
          token={token}
          portal={portal}
          initialView={view}
          savedNotice={Boolean(searchParams?.saved)}
          errorNotice={Boolean(searchParams?.error)}
        />
      </div>
    </main>
  );
}
