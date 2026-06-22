import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const lastModified = new Date("2026-06-22");

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/batteritest-elbil", changeFrequency: "weekly", priority: 0.95 },
  { path: "/book-tid", changeFrequency: "weekly", priority: 0.9 },
  { path: "/om-ev-check", changeFrequency: "monthly", priority: 0.65 },
  {
    path: "/hvad-vores-kunder-siger",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  { path: "/kontakt", changeFrequency: "monthly", priority: 0.75 },
  { path: "/cookiepolitik", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
