const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "vercel.com" },
      { protocol: "https", hostname: "evcheck.dk" },
      { protocol: "https", hostname: "ev-check.dk" },
    ],
  },
  // pdfkit reads its standard-14 font metrics (.afm files) off disk at
  // runtime; serverless file tracing can miss them unless explicitly
  // included, which silently breaks invoice PDF downloads in production.
  outputFileTracingIncludes: {
    "/api/admin/invoices/[appointmentId]": ["./node_modules/pdfkit/js/data/**"],
    "/api/customer/invoices/[appointmentId]": ["./node_modules/pdfkit/js/data/**"],
  },
  async headers() {
    return [
      // Belt-and-suspenders noindex headers for all private/internal routes.
      // These supplement the <meta name="robots"> tags set per-page and the
      // robots.txt disallow rules — all three layers together prevent admin,
      // api, and customer-portal paths from ever appearing in search results.
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/agent/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/kunde/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/min-konto",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // Correct the wrong sitemap URL submitted to Google Search Console
      // (/sitemap_index.xml → /sitemap.xml).
      {
        source: "/sitemap_index.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/Williampetersen/ev-check",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
