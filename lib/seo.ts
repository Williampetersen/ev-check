export const siteUrl = "https://evcheck.dk";
export const siteName = "EV-Check.dk";
export const brandLogoPath = "/evfaviconlogo.png";
export const brandLogoUrl = `${siteUrl}${brandLogoPath}`;
export const contactPhone = "+45 71 90 05 30";
export const contactEmail = "info@ev-check.dk";
export const companyCvr = "44022559";
export const servicePrice = 1300;

export const sameAsLinks = [
  "https://www.instagram.com/ev_check.dk?igsh=MTJkbXZ4em5tejBubg%3D%3D&utm_source=qr",
  "https://www.facebook.com/share/1PK3SGWZbf/?mibextid=wwXIfr",
  "https://www.linkedin.com/in/omid-mohebi-8b7644345?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  "https://x.com/ev_checkdk",
  "https://dk.trustpilot.com/review/ev-check.dk",
];

export const seoKeywords = [
  "batteritest elbil",
  "batteritest af elbil",
  "elbil batteritest",
  "test batteri elbil",
  "højvoltsbatteri test",
  "SoH test elbil",
  "State of Health elbil",
  "BMS diagnose elbil",
  "OBD batteritest",
  "cellebalance elbil",
  "batterirapport elbil",
  "brugt elbil batteritest",
  "Tesla batteritest",
  "BYD batteritest",
  "Polestar batteritest",
  "Volkswagen ID batteritest",
  "batteritest København",
  "batteritest Sjælland",
];

export const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  "@id": `${siteUrl}#business`,
  name: siteName,
  url: siteUrl,
  logo: brandLogoUrl,
  image: `${siteUrl}/wp/ev-car-danmark-1.png`,
  telephone: contactPhone,
  email: contactEmail,
  address: {
    "@type": "PostalAddress",
    addressLocality: "København",
    addressRegion: "Sjælland",
    addressCountry: "DK",
  },
  areaServed: [
    "København",
    "Frederiksberg",
    "Roskilde",
    "Køge",
    "Nordsjælland",
    "Sjælland",
  ],
  priceRange: "DKK 1300",
  sameAs: sameAsLinks,
  description:
    "Mobil batteritest og elbil-diagnose på Sjælland med SoH, BMS-data, cellebalance og PDF-rapport.",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}#website`,
  name: siteName,
  url: siteUrl,
  inLanguage: "da-DK",
  publisher: {
    "@id": `${siteUrl}#business`,
  },
};

export const batteryServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteUrl}/batteritest-elbil#service`,
  name: "Batteritest af elbil",
  serviceType: "Mobil batteritest og elbil-diagnose",
  category: "Elbil-diagnose",
  provider: {
    "@id": `${siteUrl}#business`,
  },
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Sjælland",
    },
    {
      "@type": "City",
      name: "København",
    },
  ],
  offers: {
    "@type": "Offer",
    url: `${siteUrl}/book-tid`,
    price: servicePrice,
    priceCurrency: "DKK",
    availability: "https://schema.org/InStock",
  },
  description:
    "Test af elbilens højvoltsbatteri med SoH, SoC, BMS-status, cellebalance, temperaturer, fejlkoder og professionel PDF-rapport.",
};

export const privatSeoKeywords = [
  "batteritest elbil privat",
  "batteritest til privatkunder",
  "elbil batteritest pris",
  "batteritest før køb af brugt elbil",
  "batteritest før salg af elbil",
  "SoH test privat elbil",
  "mobil batteritest hjemme",
  "batteritest elbil hjemme",
  "uvildig batteritest elbil",
  "batteritest elbil København privat",
  "tjek batteri elbil før køb",
  "elbil rækkevidde test",
];

export const erhvervSeoKeywords = [
  "batteritest erhverv",
  "elbil batteritest virksomhed",
  "firmabil batteritest",
  "flådetest elbil",
  "batteritest leasingselskab",
  "bilforhandler batteritest elbil",
  "SoH test firmabiler",
  "batteritest plug-in hybrid erhverv",
  "erhverv elbil diagnose",
  "batteritest CVR faktura",
  "mobil batteritest virksomhed",
  "batteritest flåde Sjælland",
  "erhvervsrabat batteritest",
];

export const erhvervDiscountPercent = 15;
export const erhvervServicePrice = Math.round(
  servicePrice * (1 - erhvervDiscountPercent / 100),
);

export const erhvervServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteUrl}/erhverv#service`,
  name: "Batteritest af elbil for erhverv",
  serviceType: "Mobil batteritest og elbil-diagnose til virksomheder og flåder",
  category: "Elbil-diagnose for erhverv",
  provider: {
    "@id": `${siteUrl}#business`,
  },
  audience: {
    "@type": "BusinessAudience",
    audienceType:
      "Virksomheder, flådeejere, leasingselskaber og bilforhandlere",
  },
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Sjælland",
    },
    {
      "@type": "City",
      name: "København",
    },
  ],
  offers: {
    "@type": "Offer",
    url: `${siteUrl}/book-tid`,
    price: erhvervServicePrice,
    priceCurrency: "DKK",
    availability: "https://schema.org/InStock",
    description: `${servicePrice} kr. pr. bil før rabat. Erhvervskunder med CVR-nummer får ${erhvervDiscountPercent}% rabat, svarende til ${erhvervServicePrice} kr. pr. bil.`,
  },
  description:
    "Mobil batteritest af firmabiler, leasingbiler og bilflåder med SoH, BMS-status, cellebalance, fejlkoder og PDF-rapport pr. bil. Samlet fakturering til virksomheden og 15% rabat til erhvervskunder.",
};

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqJsonLd(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
