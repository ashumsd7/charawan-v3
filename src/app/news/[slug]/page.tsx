import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Clock3, UserCircle2 } from "lucide-react";
import { createNewsSlug, fetchNewsFromFirebase, getNewsHref, getNewsPathSegment } from "@/lib/news";
import { ShareButton } from "@/app/news/[slug]/share-button";

type Params = { slug: string };
const SITE_BASE = "https://charawan.netlify.app";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const newsList = await fetchNewsFromFirebase();
  const news = newsList.find(
    (item) => getNewsPathSegment(item) === slug || createNewsSlug(item.newsTitle) === slug,
  );
  const title = news?.newsTitle ? `${news.newsTitle} | चरावां समाचार` : "समाचार विवरण | चरावां समाचार";
  const description = news?.shortInfo?.trim() || "चरावां समाचार विस्तृत समाचार पेज";
  const path = news ? getNewsHref(news) : `/news/${slug}`;
  const canonicalUrl = `${SITE_BASE}${path}`;
  const rawImageUrl = news?.img1 || news?.img2 || `${SITE_BASE}/logo.png`;
  const imageUrl =
    rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")
      ? rawImageUrl
      : `${SITE_BASE}${rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: "चरावां समाचार",
      locale: "hi_IN",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: news?.newsTitle || "चरावां समाचार" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const allNews = await fetchNewsFromFirebase();
  const selected = allNews.find(
    (item) => getNewsPathSegment(item) === slug || createNewsSlug(item.newsTitle) === slug,
  );

  if (!selected) notFound();

  const related = allNews.filter((item) => item.key !== selected.key).slice(0, 4);
  const dateLabel = selected.timeStamp
    ? new Date(selected.timeStamp).toLocaleString("hi-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "समय उपलब्ध नहीं";

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <article className="space-y-5">
          <header className="space-y-4">
            <p className="inline-block text-2xl font-black tracking-tight text-red-600 underline decoration-blue-600 decoration-2 underline-offset-4 sm:text-3xl">
              चरावां समाचार
            </p>
            <h1 className="text-left text-4xl font-black leading-tight text-foreground sm:text-5xl">
              {selected.newsTitle || "समाचार"}
            </h1>

            <div className="flex flex-wrap items-center gap-4 border-y border-slate-300 py-3 text-sm text-muted dark:border-slate-700">
              <span className="inline-flex items-center gap-1 font-semibold">
                <UserCircle2 className="h-4 w-4" aria-hidden />
                {selected.reporterName || "चरावां समाचार"}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <Clock3 className="h-4 w-4" aria-hidden />
                {selected.timeAgo || "अभी"}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <CalendarClock className="h-4 w-4" aria-hidden />
                {dateLabel}
              </span>
            </div>
          </header>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.img1 || selected.img2 || "/icon.png"}
            alt={selected.newsTitle || "समाचार फोटो"}
            className="aspect-video w-full max-w-3xl rounded-2xl border border-slate-200 object-contain object-left bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
          />

          {selected.shortInfo ? (
            <p className="text-xl font-semibold leading-relaxed text-foreground">{selected.shortInfo}</p>
          ) : null}

          {selected.img2 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.img2}
                alt={`${selected.newsTitle || "समाचार"} दूसरी फोटो`}
                className="aspect-video w-full max-w-3xl rounded-2xl border border-slate-200 object-contain object-left bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
              />
            </>
          ) : null}

          {selected.detailedInfo ? (
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted">{selected.detailedInfo}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <ShareButton title={selected.newsTitle || "समाचार"} />
            <Link href="/news" className="text-sm font-extrabold text-accent hover:underline">
              सभी समाचार देखें
            </Link>
          </div>
        </article>

        {related.length ? (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-card/90 p-4 dark:border-slate-700 sm:p-6">
            <h2 className="text-lg font-extrabold text-foreground">और ताज़ा समाचार</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.key ?? item.newsTitle}
                  href={getNewsHref(item)}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img1 || item.img2 || "/icon.png"}
                    alt={item.newsTitle || "समाचार"}
                    className="mb-3 aspect-[16/9] w-full rounded-xl object-cover"
                  />
                  <p className="line-clamp-2 text-sm font-extrabold text-foreground">{item.newsTitle || "समाचार"}</p>
                  <p className="mt-2 text-xs font-semibold text-muted">{item.timeAgo || "अभी"}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <Link
            href="/charwan-jobs"
            className="group block overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 shadow-sm transition hover:shadow-md dark:border-amber-800/40 dark:from-slate-900/60 dark:via-slate-900/30 dark:to-emerald-900/20"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-slate-900/60 dark:text-amber-200 dark:ring-amber-800/40">
                    ग्राम न्यूज़ रिपोर्टर
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-slate-900/60 dark:text-emerald-200 dark:ring-emerald-800/40">
                    ₹3000 तक/माह
                  </span>
                </p>
                <p className="mt-2 text-base font-extrabold text-foreground">
                  अब आपका गाँव, आपकी खबरें! पार्ट टाइम रिपोर्टर बनें और कमाएँ।
                </p>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
