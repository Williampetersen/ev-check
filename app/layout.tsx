import "./globals.css";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { brandLogoPath, seoKeywords, siteName, siteUrl } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Batteritest af elbil på Sjælland | EV-Check.dk",
    template: "%s | EV-Check.dk",
  },
  description:
    "EV-Check.dk tilbyder mobil batteritest og elbil-diagnose på Sjælland med SoH, BMS-data, cellebalance og professionel PDF-rapport.",
  keywords: seoKeywords,
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: brandLogoPath,
    shortcut: brandLogoPath,
    apple: brandLogoPath,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body
        className={cx(
          sfPro.variable,
          inter.variable,
          "bg-[#fbfaf5] text-slate-950",
        )}
      >
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
