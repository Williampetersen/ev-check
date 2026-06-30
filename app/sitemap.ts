import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

type SitemapEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified: Date;
};

const today = new Date("2026-06-30");
const lastMonth = new Date("2026-06-22");

const routes: SitemapEntry[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0, lastModified: today },
  {
    path: "/batteritest-elbil",
    changeFrequency: "weekly",
    priority: 0.95,
    lastModified: today,
  },
  {
    path: "/privat",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified: today,
  },
  {
    path: "/erhverv",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified: today,
  },
  {
    path: "/erhverv/book-tid",
    changeFrequency: "weekly",
    priority: 0.85,
    lastModified: today,
  },
  {
    path: "/book-tid",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified: today,
  },
  {
    path: "/om-ev-check",
    changeFrequency: "monthly",
    priority: 0.65,
    lastModified: lastMonth,
  },
  {
    path: "/hvad-vores-kunder-siger",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: lastMonth,
  },
  {
    path: "/kontakt",
    changeFrequency: "monthly",
    priority: 0.75,
    lastModified: lastMonth,
  },
  {
    path: "/cookiepolitik",
    changeFrequency: "yearly",
    priority: 0.2,
    lastModified: lastMonth,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
