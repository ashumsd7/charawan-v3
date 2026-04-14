import type { MetadataRoute } from "next";

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
  "/notifications",
  "/develop-village",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const last = new Date();
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: last,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
