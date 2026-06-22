/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["lh3.googleusercontent.com", "vercel.com", "evcheck.dk"],
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
