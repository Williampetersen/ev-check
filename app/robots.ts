import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const privateRoutes = ["/api", "/admin", "/agent", "/kunde", "/min-konto"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard web crawlers — full access to all public pages
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: privateRoutes,
      },
      // AI training & answer-engine crawlers — explicitly invited for AI SEO
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "YouBot",
        allow: "/",
        disallow: privateRoutes,
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: privateRoutes,
      },
      // All other crawlers — same public access
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
