import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://charawan.netlify.app/sitemap.xml",
    host: "https://charawan.netlify.app",
  };
}
