"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  ThumbsUp,
  X,
} from "lucide-react";
import { CHARAWAN_NOTIFICATIONS_FIREBASE_URL } from "@/lib/notifications-firebase";

const PASSCODE_FLAG_KEY = "charawan_passcode";

type Toast = { id: string; type: "success" | "error" | "info"; title: string; body?: string };

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

export default function ManageNotificationsPage() {
  const router = useRouter();
  const [ok] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PASSCODE_FLAG_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!ok) router.replace("/login");
  }, [ok, router]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  };

  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState("अभी अभी");
  const [allNews, setAllNews] = useState<FirebaseNewsItem[]>([]);

  // form fields
  const [reporterName, setReporterName] = useState("");
  const [newsTitle, setNewsTitle] = useState("");
  const [shortInfo, setShortInfo] = useState("");
  const [detailedInfo, setDetailedInfo] = useState("");
  const [isAdmin, setIsAdmin] = useState(true);
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [saving, setSaving] = useState(false);

  const cleanReporter = reporterName.trim() || "Admin";
  const cleanTitle = newsTitle.trim();
  const cleanShort = shortInfo.trim();

  const canSubmit = useMemo(() => {
    return Boolean(cleanTitle && cleanShort && !saving);
  }, [cleanTitle, cleanShort, saving]);

  const callApi = useCallback(async () => {
    setLoading(true);
    setLastRefreshAt(Date.now());
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
    } catch {
      pushToast({
        type: "error",
        title: "लोड नहीं हो सका",
        body: "इंटरनेट/सर्वर समस्या हो सकती है।",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ok) return;
    void callApi();
  }, [ok, callApi]);

  useEffect(() => {
    if (!lastRefreshAt) return;
    const t = window.setInterval(() => {
      setCurrentTime(calcTimeAgo(lastRefreshAt));
    }, 1000);
    return () => window.clearInterval(t);
  }, [lastRefreshAt]);

  const resetForm = () => {
    setReporterName("");
    setNewsTitle("");
    setShortInfo("");
    setDetailedInfo("");
    setIsAdmin(true);
    setImg1("");
    setImg2("");
  };

  const onAdd = async () => {
    if (!cleanTitle || !cleanShort) {
      pushToast({ type: "error", title: "फ़ॉर्म अधूरा", body: "शीर्षक और छोटा विवरण लिखिए।" });
      return;
    }
    setSaving(true);
    const payload: FirebaseNewsItem = {
      reporterName: cleanReporter,
      newsTitle: cleanTitle,
      shortInfo: cleanShort,
      detailedInfo: detailedInfo.trim(),
      timeStamp: Date.now(),
      isAdmin,
      img1: img1.trim(),
      img2: img2.trim(),
      likeCounter: 0,
    };
    try {
      await axios.post(CHARAWAN_NOTIFICATIONS_FIREBASE_URL, payload, {
        timeout: 25_000,
        headers: { "Content-Type": "application/json" },
      });
      pushToast({ type: "success", title: "जोड़ दिया गया", body: "नोटिफिकेशन सेव हो गया।" });
      resetForm();
      setOpenForm(false);
      await callApi();
    } catch {
      pushToast({ type: "error", title: "सेव नहीं हो सका", body: "कृपया बाद में प्रयास करें।" });
    } finally {
      setSaving(false);
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
      pushToast({ type: "error", title: "लाइक सेव नहीं हुआ", body: "इंटरनेट चेक करें।" });
    }
  };

  if (!ok) {
    return (
      <div className="village-page-bg min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700">
            <p className="text-sm font-semibold text-muted">कृपया लॉगिन करें…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="village-page-bg min-h-screen">
      {/* Toasts */}
      <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-50"
                : t.type === "error"
                  ? "border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-900/40 dark:bg-rose-950/35 dark:text-rose-50"
                  : "border-slate-200 bg-white/90 text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            }`}
          >
            <div className="flex items-start gap-2">
              {t.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden />
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-extrabold">{t.title}</p>
                {t.body ? <p className="mt-0.5 text-xs opacity-90">{t.body}</p> : null}
              </div>
              <button
                type="button"
                className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/5 bg-black/5 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
                aria-label="बंद करें"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Admin पर वापस
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted">चरावां</p>
              <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200">
                  <Bell className="h-5 w-5" aria-hidden />
                </span>
                {openForm ? "जानकारी जोड़ें" : "नोटिफिकेशन"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                यहाँ Firebase से सभी नोटिफिकेशन लोड होते हैं और लाइक अपडेट भी यहीं से होगा।
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!openForm ? (
                <button
                  type="button"
                  onClick={() => setOpenForm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  जोड़ें
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  वापस
                </button>
              )}

              {!openForm ? (
                <button
                  type="button"
                  onClick={() => void callApi()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
                  {loading ? "रिफ्रेश..." : "रिफ्रेश करें"}
                </button>
              ) : null}
            </div>
          </div>

          {!openForm ? (
            <p className="mt-3 text-xs text-muted">
              <span className="font-bold text-rose-600">⌚ {currentTime}</span> रिफ्रेश किया गया
            </p>
          ) : null}
        </div>

        {openForm ? (
          <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
            <h2 className="text-lg font-extrabold text-foreground">नया नोटिफिकेशन जोड़ें</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">रिपोर्टर नाम</label>
                <input
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Admin / आपका नाम"
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Admin</label>
                <label className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-bold text-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden />
                  Admin पोस्ट
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="text-rose-600">*</span> शीर्षक
                </label>
                <input
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="नोटिफिकेशन शीर्षक"
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="text-rose-600">*</span> छोटा विवरण
                </label>
                <textarea
                  value={shortInfo}
                  onChange={(e) => setShortInfo(e.target.value)}
                  rows={3}
                  placeholder="1–2 लाइन में छोटा संदेश"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">विस्तृत विवरण (optional)</label>
                <textarea
                  value={detailedInfo}
                  onChange={(e) => setDetailedInfo(e.target.value)}
                  rows={4}
                  placeholder="अगर चाहें तो पूरा विवरण लिखें"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Image 1 URL (optional)</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <ImageIcon className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    value={img1}
                    onChange={(e) => setImg1(e.target.value)}
                    placeholder="https://..."
                    className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Image 2 URL (optional)</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <ImageIcon className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    value={img2}
                    onChange={(e) => setImg2(e.target.value)}
                    placeholder="https://..."
                    className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onAdd()}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                {saving ? "सेव हो रहा है..." : "सेव करें"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setOpenForm(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
              >
                बंद करें
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-card/90 p-4 shadow-sm backdrop-blur dark:border-slate-700 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                <p className="text-sm font-semibold">जानकारी लोड हो रही है…</p>
              </div>
            ) : null}

            {!loading ? (
              <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {allNews.map((news) => (
                  <article
                    key={news.key ?? String(news.timeStamp ?? Math.random())}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
                  >
                    <p className="text-xs font-bold text-muted">{news.newsTitle}</p>

                    <button
                      type="button"
                      onClick={() => void hitLike(news)}
                      className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-900 ring-1 ring-amber-500/20 transition hover:bg-amber-500/15 dark:text-amber-100"
                    >
                      <ThumbsUp className="h-4 w-4" aria-hidden />
                      लाइक करें
                      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        {news.likeCounter ?? 0}
                      </span>
                    </button>

                    <p className="mt-2 text-sm font-bold text-foreground">✉️ {news.shortInfo}</p>

                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white dark:bg-slate-950">
                      {news.isAdmin ? <span aria-hidden>🛡️</span> : null}
                      {news.reporterName ?? "—"} द्वारा
                      <span className="inline-flex items-center gap-1 text-white/80">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {news.timeAgo ?? "—"}
                      </span>
                    </p>

                    {(news.img1 || news.img2) ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {news.img1 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={news.img1} alt="news photo 1" className="h-28 w-full rounded-xl object-cover" />
                        ) : null}
                        {news.img2 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={news.img2} alt="news photo 2" className="h-28 w-full rounded-xl object-cover" />
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
                {!allNews.length ? (
                  <p className="py-10 text-center text-sm font-semibold text-muted">कोई नोटिफिकेशन नहीं मिला।</p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

