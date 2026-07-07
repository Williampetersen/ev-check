import "./globals.css";
import cx from "classnames";
import Script from "next/script";
import { sfPro, inter } from "./fonts";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { brandLogoPath, seoKeywords, siteName, siteUrl } from "@/lib/seo";

const META_PIXEL_ID = "901758528938529";

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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
