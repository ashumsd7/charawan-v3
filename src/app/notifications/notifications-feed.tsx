"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowUpRight,
  Bell,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Heart,
  Flag,
  Loader2,
  Maximize2,
  MoreHorizontal,
  RefreshCw,
  Share2,
  X,
} from "lucide-react";
import { WHATSAPP_CONTACT_HREF } from "@/lib/constants";
import { buildNotificationShareText } from "@/lib/notification-share-text";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { fetchNewsFromFirebase, getNewsHref, type FirebaseNewsItem } from "@/lib/news";


function NewsMedia({
  img1,
  img2,
  title,
  onExpand,
}: {
  img1?: string;
  img2?: string;
  title?: string;
  onExpand: (src: string, alt: string) => void;
}) {
  const images = useMemo(
    () =>
      [
        img1 ? { src: img1, alt: `${title ?? "पोस्ट"} — इमेज 1` } : null,
        img2 ? { src: img2, alt: `${title ?? "पोस्ट"} — इमेज 2` } : null,
      ].filter(Boolean) as { src: string; alt: string }[],
    [img1, img2, title],
  );

  const [idx, setIdx] = useState(0);
  const safeIdx = Math.min(idx, Math.max(0, images.length - 1));

  if (images.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700">
            <Bell className="h-4 w-4" aria-hidden />
            समाचार
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    const one = images[0];
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => onExpand(one.src, one.alt)}
          className="absolute right-2 top-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur transition hover:bg-black/70 active:scale-95"
          aria-label="इमेज फुल स्क्रीन"
          title="फुल स्क्रीन"
        >
          <Maximize2 className="h-4 w-4" aria-hidden />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={one.src} alt={one.alt} className="aspect-[16/9] w-full object-cover" />
      </div>
    );
  }

  const current = images[safeIdx];
  const canPrev = safeIdx > 0;
  const canNext = safeIdx < images.length - 1;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => onExpand(current.src, current.alt)}
        className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur transition hover:bg-black/70 active:scale-95"
        aria-label="इमेज फुल स्क्रीन"
        title="फुल स्क्रीन"
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => setIdx((v) => Math.max(0, v - 1))}
        disabled={!canPrev}
        aria-label="पिछली इमेज"
        className={`absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-sm backdrop-blur transition active:scale-95 ${
          canPrev ? "hover:bg-black/65" : "cursor-not-allowed opacity-40"
        }`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setIdx((v) => Math.min(images.length - 1, v + 1))}
        disabled={!canNext}
        aria-label="अगली इमेज"
        className={`absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-sm backdrop-blur transition active:scale-95 ${
          canNext ? "hover:bg-black/65" : "cursor-not-allowed opacity-40"
        }`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current.src} alt={current.alt} className="aspect-[16/9] w-full object-cover" />

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`h-2 w-2 rounded-full transition ${i === safeIdx ? "bg-white" : "bg-white/45 hover:bg-white/70"}`}
            aria-label={`इमेज ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function NotificationsFeed({
  limit,
  showHeader = true,
  showAddButton = true,
  variant = "framed",
  columns = 2,
}: {
  limit?: number;
  showHeader?: boolean;
  showAddButton?: boolean;
  variant?: "framed" | "plain";
  columns?: 1 | 2;
}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allNews, setAllNews] = useState<FirebaseNewsItem[]>([]);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => setMounted(true), []);

  const siteOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://charawan.netlify.app";

  const callApi = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchNewsFromFirebase();
      setAllNews(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void callApi();
  }, [callApi]);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const reportHref = useMemo(() => {
    const base = WHATSAPP_CONTACT_HREF;
    if (!base) return "";
    // group links don't accept text param reliably; open group link only
    return base || "";
  }, []);

  const onShare = async (n: FirebaseNewsItem) => {
    const sourcePath = getNewsHref(n);
    const text = buildNotificationShareText(n, siteOrigin, sourcePath);
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: n.newsTitle || "समाचार Charawan",
          text,
          url: `${siteOrigin.replace(/\/$/, "")}${sourcePath}`,
        });
        return;
      }
    } catch {
      // fall back
    }
    try {
      await navigator.clipboard.writeText(text);
      // no toast system here; keep silent
    } catch {
      // ignore
    }
  };

  const hitLike = async (news: FirebaseNewsItem) => {
    const key = news.key;
    if (!key) return;

    const nextLike = (news.likeCounter ?? 0) + 1;
    setAllNews((prev) => prev.map((n) => (n.key === key ? { ...n, likeCounter: nextLike } : n)));

    const newsData: FirebaseNewsItem = {
      reporterName: news.reporterName,
      newsTitle: news.newsTitle,
      shortInfo: news.shortInfo,
      detailedInfo: news.detailedInfo,
      timeStamp: news.timeStamp,
      isAdmin: news.isAdmin,
      img1: news.img1,
      img2: news.img2,
      likeCounter: nextLike,
    };

    try {
      await axios.put(
        `https://charawan-notification-default-rtdb.firebaseio.com/Notification/${key}.json`,
        newsData,
        { timeout: 25_000, headers: { "Content-Type": "application/json" } },
      );
    } catch {
      // revert could be added; keep optimistic for now
    }
  };

  const visible = useMemo(() => (typeof limit === "number" ? allNews.slice(0, limit) : allNews), [allNews, limit]);

  const gridClass =
    columns === 2 ? "grid gap-4 md:grid-cols-2" : "grid gap-4 grid-cols-1";

  return (
    <div
      className={
        variant === "framed"
          ? "rounded-3xl border border-slate-200 bg-card/90 p-4 shadow-sm backdrop-blur dark:border-slate-700 sm:p-6"
          : ""
      }
    >
      {mounted
        ? createPortal(
            <AnimatePresence>
              {lightbox ? (
                <motion.div
                  key="lightbox"
                  className="fixed left-0 top-0 z-[9999] grid h-[100dvh] w-screen place-items-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.button
                    type="button"
                    aria-label="बंद करें"
                    onClick={() => setLightbox(null)}
                    className="absolute inset-0 bg-black/75"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />

                  <motion.div
                    className="relative z-[10000] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  >
                    <button
                      type="button"
                      aria-label="बंद करें"
                      onClick={() => setLightbox(null)}
                      className="absolute right-3 top-3 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/15 active:scale-95"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lightbox.src}
                      alt={lightbox.alt}
                      className="max-h-[85dvh] w-full object-contain"
                    />
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      {showHeader ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200">
                <Newspaper className="h-5 w-5" aria-hidden />
              </span>
              चरावां समाचार
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void callApi()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
              रिफ्रेश
            </button>
            {showAddButton ? (
              <Link
                href="/manage-notifications"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                समाचार जोड़ें
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <p className="text-sm font-semibold">लोड हो रहा है…</p>
        </div>
      ) : (
        <div className={`${showHeader ? "mt-5" : ""} ${gridClass}`}>
          {visible.map((news) => (
            <article
              key={news.key ?? String(news.timeStamp ?? Math.random())}
              className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50 to-rose-50/30 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-[1px] hover:shadow-lg dark:border-slate-700 dark:from-slate-900/60 dark:via-slate-950/30 dark:to-rose-950/15 dark:ring-white/10"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-teal-400 to-rose-400 opacity-80"
              />
              <div className="p-4">
                {/* Header row (X-style) */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {(news.reporterName?.trim()?.[0] ?? "च").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-foreground">
                          {news.reporterName ?? "चरावां"}
                          {news.isAdmin ? <span className="ml-1 text-[11px]" aria-hidden>🛡️</span> : null}
                          {news.timeAgo ? (
                            <span className="ml-2 text-xs font-semibold text-muted">· {news.timeAgo}</span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs font-semibold text-muted">@charawan</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 active:scale-95 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
                        aria-label="अधिक"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content (start under avatar, no extra left gap) */}
                <div className="mt-2 space-y-1">
                  {news.newsTitle ? (
                    <p className="text-sm font-extrabold text-foreground">{news.newsTitle}</p>
                  ) : null}
                  {news.shortInfo ? (
                    <p className="text-sm leading-relaxed text-foreground/90">{news.shortInfo}</p>
                  ) : null}
                  {news.detailedInfo?.trim() ? (
                    <p className="text-xs leading-relaxed text-muted">{news.detailedInfo.trim()}</p>
                  ) : null}
                  <Link
                    href={getNewsHref(news)}
                    className="flex justify-end text-sm font-extrabold text-red-700 underline underline-offset-2 dark:text-red-300"
                  >
                    पूरी खबर पढ़ें
                  </Link>
                </div>
              </div>

              {/* Media (always show placeholder like X) */}
              <div className="px-4 pb-4">
                <NewsMedia
                  img1={news.img1}
                  img2={news.img2}
                  title={news.newsTitle}
                  onExpand={(src, alt) => setLightbox({ src, alt })}
                />
              </div>

              {/* X/Twitter-like actions */}
              <div className="flex items-center justify-start gap-2 border-t border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-rose-50/50 px-4 py-3 dark:border-slate-700/60 dark:from-slate-950/30 dark:via-slate-950/10 dark:to-rose-950/10">
                <button
                  type="button"
                  onClick={() => void hitLike(news)}
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] dark:text-slate-200 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-rose-100 dark:bg-slate-800 dark:group-hover:bg-rose-950/40">
                    <Heart className="h-4 w-4" aria-hidden />
                  </span>
                  {/* <span className="hidden sm:inline">लाइक</span> */}
                  <span className="inline-flex items-center justify-center bg-black px-2 rounded-full   py-0.5 text-[10px] font-extrabold text-white">
                    {news.likeCounter ?? 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => void onShare(news)}
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 active:scale-[0.98] dark:text-slate-200 dark:hover:bg-sky-950/30 dark:hover:text-sky-200"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-sky-100 dark:bg-slate-800 dark:group-hover:bg-sky-950/40">
                    <Share2 className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="hidden sm:inline">शेयर</span>
                </button>

                <a
                  href={reportHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 active:scale-[0.98] dark:text-slate-200 dark:hover:bg-amber-950/30 dark:hover:text-amber-200"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-amber-100 dark:bg-slate-800 dark:group-hover:bg-amber-950/40">
                    <Flag className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="hidden sm:inline">रिपोर्ट</span>
                </a>
              </div>
            </article>
          ))}

          {!allNews.length ? (
            <p className="py-10 text-center text-sm font-semibold text-muted">कोई समाचार नहीं मिला।</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

