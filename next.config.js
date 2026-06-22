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
    ],
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/Williampetersen/ev-check",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
