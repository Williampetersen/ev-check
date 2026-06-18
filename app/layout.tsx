import "./globals.css";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

export const metadata = {
  title: "EV-Check.dk",
  description:
    "Professionel batteritest og elbil-diagnose i Danmark.",
  metadataBase: new URL("https://ev-check.dk"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className={cx(sfPro.variable, inter.variable, "bg-[#fbfaf5] text-slate-950")}>
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
