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
  Loader2,
  Plus,
  Search,
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
  UploadCloud,
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

function stripJson(url: string) {
  return url.replace(/\.json$/, "");
}

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

  // list controls
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "public">("all");

  // edit/delete dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editReporterName, setEditReporterName] = useState("");
  const [editNewsTitle, setEditNewsTitle] = useState("");
  const [editShortInfo, setEditShortInfo] = useState("");
  const [editDetailedInfo, setEditDetailedInfo] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(true);
  const [editImg1, setEditImg1] = useState("");
  const [editImg2, setEditImg2] = useState("");
  const [confirmOpen, setConfirmOpen] = useState<null | {
    title: string;
    body: string;
    actionLabel: string;
    onConfirm: () => void | Promise<void>;
  }>(null);

  // form fields
  const [reporterName, setReporterName] = useState("");
  const [newsTitle, setNewsTitle] = useState("");
  const [shortInfo, setShortInfo] = useState("");
  const [detailedInfo, setDetailedInfo] = useState("");
  const [isAdmin, setIsAdmin] = useState(true);
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [saving, setSaving] = useState(false);

  const cleanReporter = reporterName.trim() || "Admin";
  const cleanTitle = newsTitle.trim();
  const cleanShort = shortInfo.trim();

  const canSubmit = useMemo(() => {
    return Boolean(cleanTitle && cleanShort && !saving && !uploading1 && !uploading2);
  }, [cleanTitle, cleanShort, saving, uploading1, uploading2]);

  const onPickImage = async (slot: 1 | 2, file?: File | null) => {
    if (!file) return;
    if (slot === 1) setUploading1(true);
    else setUploading2(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axios.post<{ ok: boolean; url?: string; error?: string }>(
        "/api/upload-image",
        fd,
        { timeout: 60_000 },
      );
      if (!data.ok || !data.url) throw new Error(data.error || "Upload failed");
      if (slot === 1) setImg1(data.url);
      else setImg2(data.url);
      pushToast({ type: "success", title: "फोटो अपलोड हो गई", body: "इमेज लिंक लग गया।" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "अपलोड नहीं हो सका";
      pushToast({ type: "error", title: "अपलोड विफल", body: msg });
    } finally {
      if (slot === 1) setUploading1(false);
      else setUploading2(false);
    }
  };

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

    try {
      const nextLike = (news.likeCounter ?? 0) + 1;
      setAllNews((prev) => prev.map((n) => (n.key === key ? { ...n, likeCounter: nextLike } : n)));
      await axios.patch(
        `${stripJson(CHARAWAN_NOTIFICATIONS_FIREBASE_URL)}/${key}.json`,
        { likeCounter: nextLike },
        { timeout: 25_000, headers: { "Content-Type": "application/json" } },
      );
    } catch {
      pushToast({ type: "error", title: "लाइक सेव नहीं हुआ", body: "इंटरनेट चेक करें।" });
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allNews.filter((n) => {
      if (filter === "admin" && !n.isAdmin) return false;
      if (filter === "public" && n.isAdmin) return false;
      if (!q) return true;
      const hay = `${n.reporterName ?? ""}\n${n.newsTitle ?? ""}\n${n.shortInfo ?? ""}\n${n.detailedInfo ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allNews, query, filter]);

  const openEdit = (n: FirebaseNewsItem) => {
    const key = n.key ?? null;
    if (!key) return;
    setEditingKey(key);
    setEditReporterName(n.reporterName ?? "");
    setEditNewsTitle(n.newsTitle ?? "");
    setEditShortInfo(n.shortInfo ?? "");
    setEditDetailedInfo(n.detailedInfo ?? "");
    setEditIsAdmin(Boolean(n.isAdmin));
    setEditImg1(n.img1 ?? "");
    setEditImg2(n.img2 ?? "");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingKey(null);
  };

  const saveEdit = async () => {
    if (!editingKey) return;
    const cleanTitle = editNewsTitle.trim();
    const cleanShort = editShortInfo.trim();
    if (!cleanTitle || !cleanShort) {
      pushToast({ type: "error", title: "फ़ॉर्म अधूरा", body: "शीर्षक और छोटा विवरण लिखिए।" });
      return;
    }

    const patch: FirebaseNewsItem = {
      reporterName: editReporterName.trim() || "Admin",
      newsTitle: cleanTitle,
      shortInfo: cleanShort,
      detailedInfo: editDetailedInfo.trim(),
      isAdmin: editIsAdmin,
      img1: editImg1.trim(),
      img2: editImg2.trim(),
    };

    await axios.patch(
      `${stripJson(CHARAWAN_NOTIFICATIONS_FIREBASE_URL)}/${editingKey}.json`,
      patch,
      { timeout: 25_000, headers: { "Content-Type": "application/json" } },
    );
    pushToast({ type: "success", title: "अपडेट हो गया", body: "नोटिफिकेशन अपडेट सेव हो गया।" });
    closeEdit();
    await callApi();
  };

  const askDelete = (n: FirebaseNewsItem) => {
    const key = n.key;
    if (!key) return;
    setConfirmOpen({
      title: "Delete confirm",
      body: `क्या आप «${n.newsTitle ?? "नोटिफिकेशन"}» को हटाना चाहते हैं? यह वापस नहीं आएगा।`,
      actionLabel: "हटाएँ",
      onConfirm: async () => {
        await axios.delete(`${stripJson(CHARAWAN_NOTIFICATIONS_FIREBASE_URL)}/${key}.json`, { timeout: 25_000 });
        pushToast({ type: "success", title: "हटा दिया गया", body: "नोटिफिकेशन डिलीट हो गया।" });
        setConfirmOpen(null);
        await callApi();
      },
    });
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
      {confirmOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            onClick={() => setConfirmOpen(null)}
            aria-label="बंद करें"
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-extrabold">{confirmOpen.title}</p>
                <p className="mt-1 text-xs text-white/75">{confirmOpen.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15 active:scale-95"
                aria-label="बंद करें"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-white/10"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => void confirmOpen.onConfirm()}
                className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700"
              >
                {confirmOpen.actionLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-black/65" onClick={closeEdit} aria-label="बंद करें" />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-card/95 shadow-2xl backdrop-blur dark:border-slate-700">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Edit</p>
                <p className="mt-1 text-lg font-extrabold text-foreground">नोटिफिकेशन अपडेट करें</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900"
                aria-label="बंद करें"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">रिपोर्टर नाम</label>
                  <input
                    value={editReporterName}
                    onChange={(e) => setEditReporterName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Admin</label>
                  <label className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-bold text-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <input
                      type="checkbox"
                      checked={editIsAdmin}
                      onChange={(e) => setEditIsAdmin(e.target.checked)}
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
                    value={editNewsTitle}
                    onChange={(e) => setEditNewsTitle(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">
                    <span className="text-rose-600">*</span> छोटा विवरण
                  </label>
                  <textarea
                    value={editShortInfo}
                    onChange={(e) => setEditShortInfo(e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">विस्तृत विवरण (optional)</label>
                  <textarea
                    value={editDetailedInfo}
                    onChange={(e) => setEditDetailedInfo(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Image 1</label>
                  <input
                    value={editImg1}
                    onChange={(e) => setEditImg1(e.target.value)}
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Image 2</label>
                  <input
                    value={editImg2}
                    onChange={(e) => setEditImg2(e.target.value)}
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                onClick={closeEdit}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirmOpen({
                    title: "Update confirm",
                    body: "क्या आप यह बदलाव सेव करना चाहते हैं?",
                    actionLabel: "अपडेट सेव करें",
                    onConfirm: async () => {
                      setConfirmOpen(null);
                      await saveEdit();
                    },
                  })
                }
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
              >
                अपडेट सेव करें
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
              <div className="rounded-3xl border border-slate-200 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Image 1 (optional)</p>
                <div className="mt-3 flex flex-col gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900">
                    <UploadCloud className="h-4 w-4 text-slate-500" aria-hidden />
                    {uploading1 ? "अपलोड हो रहा है…" : "फोटो चुनें"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      disabled={uploading1}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        void onPickImage(1, f);
                      }}
                    />
                  </label>
                  {img1 ? (
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img1} alt="img1" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                      <div className="min-w-0 flex-1">
                        <p className="break-all text-xs text-muted">{img1}</p>
                        <button
                          type="button"
                          onClick={() => setImg1("")}
                          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-foreground transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          हटाएँ
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="text-xs text-muted">या लिंक पेस्ट करें:</div>
                  <input
                    value={img1}
                    onChange={(e) => setImg1(e.target.value)}
                    placeholder="https://..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Image 2 (optional)</p>
                <div className="mt-3 flex flex-col gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900">
                    <UploadCloud className="h-4 w-4 text-slate-500" aria-hidden />
                    {uploading2 ? "अपलोड हो रहा है…" : "फोटो चुनें"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      disabled={uploading2}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        void onPickImage(2, f);
                      }}
                    />
                  </label>
                  {img2 ? (
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img2} alt="img2" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                      <div className="min-w-0 flex-1">
                        <p className="break-all text-xs text-muted">{img2}</p>
                        <button
                          type="button"
                          onClick={() => setImg2("")}
                          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-foreground transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          हटाएँ
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="text-xs text-muted">या लिंक पेस्ट करें:</div>
                  <input
                    value={img2}
                    onChange={(e) => setImg2(e.target.value)}
                    placeholder="https://..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
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
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <Search className="h-4 w-4 text-slate-400" aria-hidden />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search… (शीर्षक/विवरण/रिपोर्टर)"
                      className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as typeof filter)}
                      className="h-11 rounded-2xl border border-slate-200 bg-white/70 px-3 text-sm font-extrabold text-foreground shadow-sm outline-none transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
                    >
                      <option value="all">All</option>
                      <option value="admin">Admin</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-white/60 shadow-sm dark:border-slate-700 dark:bg-slate-900/30">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white/90 backdrop-blur dark:bg-slate-950/60">
                      <tr className="text-xs font-extrabold text-muted">
                        <th className="px-4 py-3">शीर्षक</th>
                        <th className="px-4 py-3">रिपोर्टर</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Likes</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/60">
                      {visible.map((n) => (
                        <tr
                          key={n.key ?? String(n.timeStamp ?? Math.random())}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30"
                        >
                          <td className="px-4 py-3">
                            <p className="font-extrabold text-foreground">{n.newsTitle ?? "—"}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-muted">{n.shortInfo ?? ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">{n.reporterName ?? "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-extrabold ${
                                n.isAdmin
                                  ? "bg-amber-500/10 text-amber-900 ring-1 ring-amber-500/20 dark:text-amber-100"
                                  : "bg-sky-500/10 text-sky-900 ring-1 ring-sky-500/20 dark:text-sky-100"
                              }`}
                            >
                              {n.isAdmin ? "ADMIN" : "PUBLIC"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => void hitLike(n)}
                              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-rose-700 active:scale-[0.98]"
                            >
                              +1
                              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">{n.likeCounter ?? 0}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
                              <Clock className="h-3.5 w-3.5" aria-hidden />
                              {n.timeAgo ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(n)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                aria-label="Edit"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(n)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 shadow-sm transition hover:bg-rose-100 active:scale-95 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100 dark:hover:bg-rose-950/45"
                                aria-label="Delete"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!visible.length ? (
                        <tr>
                          <td className="px-4 py-10 text-center text-sm font-semibold text-muted" colSpan={6}>
                            कोई नोटिफिकेशन नहीं मिला।
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

