"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowUpRight,
  Bell,
  Flag,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { CHARAWAN_NOTIFICATIONS_FIREBASE_URL } from "@/lib/notifications-firebase";
import { WHATSAPP_CONTACT_HREF } from "@/lib/constants";
import { buildNotificationShareText } from "@/lib/notification-share-text";

type FirebaseNewsItem = {
  key?: string;
  reporterName?: string;
  newsTitle?: string;
  shortInfo?: string;
  detailedInfo?: string;
  timeStamp?: number;
  isAdmin?: boolean;
  img1?: string;
  img2?: string;
  likeCounter?: number;
  timeAgo?: string;
};

function calcTimeAgo(fromMs: number) {
  let seconds = Math.floor((Date.now() - fromMs) / 1000);
  let unit = " सेकंड ";
  let direction = "पहले";
  if (seconds < 0) {
    seconds = -seconds;
    direction = "अब से";
  }
  let value = seconds;
  if (seconds >= 31536000) {
    value = Math.floor(seconds / 31536000);
    unit = " साल ";
  } else if (seconds >= 86400) {
    value = Math.floor(seconds / 86400);
    unit = " दिन ";
  } else if (seconds >= 3600) {
    value = Math.floor(seconds / 3600);
    unit = " घंटे ";
  } else if (seconds >= 60) {
    value = Math.floor(seconds / 60);
    unit = " मिनट ";
  }
  return `${value}${unit}${direction}`;
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
  const [loading, setLoading] = useState(true);
  const [allNews, setAllNews] = useState<FirebaseNewsItem[]>([]);

  const siteOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://charawan.netlify.app";

  const callApi = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Record<string, FirebaseNewsItem> | null>(
        CHARAWAN_NOTIFICATIONS_FIREBASE_URL,
        { timeout: 25_000, headers: { Accept: "application/json" } },
      );
      const list: FirebaseNewsItem[] = [];
      if (data && typeof data === "object") {
        for (const [key, value] of Object.entries(data)) {
          const timeStamp = typeof value?.timeStamp === "number" ? value.timeStamp : undefined;
          list.push({
            ...value,
            key,
            timeAgo: timeStamp ? calcTimeAgo(timeStamp) : "—",
          });
        }
      }
      list.sort((a, b) => (b.timeStamp ?? 0) - (a.timeStamp ?? 0));
      setAllNews(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void callApi();
  }, [callApi]);

  const reportHref = useMemo(() => {
    const base = WHATSAPP_CONTACT_HREF;
    if (!base) return "";
    // group links don't accept text param reliably; open group link only
    return base || "";
  }, []);

  const onShare = async (n: FirebaseNewsItem) => {
    const text = buildNotificationShareText(n, siteOrigin);
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: n.newsTitle || "चरावां नोटिफिकेशन",
          text,
          url: `${siteOrigin.replace(/\/$/, "")}/notifications`,
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
      {showHeader ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200">
                <Bell className="h-5 w-5" aria-hidden />
              </span>
              ग्राम सूचना केंद्र
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
                नोटिफिकेशन जोड़ें
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
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40"
            >
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
                        aria-label="अधिक"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="mt-2 space-y-1">
                      {news.newsTitle ? (
                        <p className="text-sm font-extrabold text-foreground">{news.newsTitle}</p>
                      ) : null}
                      {news.shortInfo ? (
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {news.shortInfo}
                        </p>
                      ) : null}
                      {news.detailedInfo?.trim() ? (
                        <p className="text-xs leading-relaxed text-muted">{news.detailedInfo.trim()}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Media (always show placeholder like X) */}
              <div className="px-4 pb-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  {news.img1 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={news.img1} alt="पोस्ट इमेज" className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
                  )}
                </div>
                {news.img2 ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={news.img2} alt="पोस्ट इमेज 2" className="aspect-[16/9] w-full object-cover" />
                  </div>
                ) : null}
              </div>

              {/* X/Twitter-like actions */}
              <div className="flex items-center justify-between border-t border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => void hitLike(news)}
                  className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-rose-100 dark:bg-slate-800 dark:group-hover:bg-rose-950/40">
                    <ThumbsUp className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="hidden sm:inline">लाइक</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-extrabold text-white dark:bg-white dark:text-slate-900">
                    {news.likeCounter ?? 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => void onShare(news)}
                  className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 dark:text-slate-200 dark:hover:bg-sky-950/30 dark:hover:text-sky-200"
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
                  className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 dark:text-slate-200 dark:hover:bg-amber-950/30 dark:hover:text-amber-200"
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
            <p className="py-10 text-center text-sm font-semibold text-muted">कोई नोटिफिकेशन नहीं मिला।</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

