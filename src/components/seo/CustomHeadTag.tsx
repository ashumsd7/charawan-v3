import type { Metadata } from "next";

export type CustomHeadInput = {
  baseUrl: string; // e.g. https://charawan.in
  path: string; // e.g. /news/some-slug
  title: string;
  description: string;
  imageUrl: string; // absolute preferred
  siteName?: string;
  locale?: string;
  type?: "website" | "article";
};

function toAbsoluteUrl(baseUrl: string, url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = baseUrl.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

export function buildCustomMetadata(input: CustomHeadInput): Metadata {
  const baseUrl = input.baseUrl.replace(/\/$/, "");
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const canonicalUrl = `${baseUrl}${path}`;
  const ogImage = toAbsoluteUrl(baseUrl, input.imageUrl);
  const siteName = input.siteName ?? "चरावां समाचार";
  const locale = input.locale ?? "hi_IN";
  const type = input.type ?? "article";

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: input.title,
      description: input.description,
      url: canonicalUrl,
      siteName,
      locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}

