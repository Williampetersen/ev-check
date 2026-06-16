import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const publicRoutes = [
    "",
    "/service",
    "/service-2",
    "/om-ev-check",
    "/kontakt",
    "/book-tid",
    "/booking",
    "/tak",
    "/hvad-vores-kunder-siger",
    "/cookiepolitik",
    "/min-konto",
  ];

  return publicRoutes.map((route) => ({
    url: `https://ev-check.dk${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/book-tid" || route === "/booking" ? 0.9 : 0.7,
  }));
}
