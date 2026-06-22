import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/admin", "/agent", "/kunde"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
