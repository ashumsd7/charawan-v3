import type { MetadataRoute } from "next";
import { fetchNewsFromFirebase, getNewsHref } from "@/lib/news";

const base = "https://charawan.netlify.app";

const paths = [
  "/",
  "/shops",
  "/history",
  "/gallery",
  "/cricket",
  "/election",
  "/contacts",
  "/add-contact",
  "/about",
  "/links",
  "/donate",
  "/games",
  "/news",
  "/develop-village",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const last = new Date();
  const safeDate = (value: unknown) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return last;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? last : parsed;
  };

  const staticEntries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: last,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  try {
    const allNews = await fetchNewsFromFirebase();
    const newsEntries: MetadataRoute.Sitemap = allNews.map((item) => ({
      url: `${base}${getNewsHref(item)}`,
      lastModified: safeDate(item.timeStamp),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
    return [...staticEntries, ...newsEntries];
  } catch {
    return staticEntries;
  }
}
