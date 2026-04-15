import type { Metadata } from "next";
import Link from "next/link";
import { IndianRupee, Mic } from "lucide-react";
import { NEW_TAB_FALLBACK_HREF, WHATSAPP_CONTACT_HREF } from "@/lib/constants";
import { NotificationsFeed } from "@/app/notifications/notifications-feed";

export const metadata: Metadata = {
  title: "सभी सूचनाएँ",
  description: "चरावां ग्राम सूचनाएँ — पूर्ण सूची।",
};

export default async function NotificationsPage() {
  const whatsappHref = WHATSAPP_CONTACT_HREF || NEW_TAB_FALLBACK_HREF;

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <Link
          href="/charwan-jobs"
          className="group block overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 shadow-sm transition hover:shadow-md dark:border-amber-800/40 dark:from-slate-900/60 dark:via-slate-900/30 dark:to-emerald-900/20"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-muted">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-slate-900/60 dark:text-amber-200 dark:ring-amber-800/40">
                  <Mic className="h-3.5 w-3.5" aria-hidden />
                  ग्राम न्यूज़ रिपोर्टर
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-slate-900/60 dark:text-emerald-200 dark:ring-emerald-800/40">
                  <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                  ₹3000 तक/माह
                </span>
              </p>
              <p className="mt-2 text-base font-extrabold text-foreground">
                अब आपका गाँव, आपकी खबरें! पार्ट टाइम रिपोर्टर बनें और कमाएँ।
              </p>
              <p className="mt-1 text-sm text-muted">
                आवेदन/जानकारी के लिए क्लिक करें →
              </p>
            </div>
            <span className="inline-flex w-fit items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition group-hover:bg-red-700">
              सूचना जोड़ें
            </span>
          </div>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">ग्राम सूचना केंद्र</h1>
            <p className="mt-1 text-sm text-muted">गाँव की आधिकारिक व सामुदायिक अपडेट।</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white/60 dark:border-slate-600"
            >
              ← मुख्य पृष्ठ
            </Link>
            <Link
              href="/manage-notifications"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              नोटिफिकेशन जोड़ें
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              संपर्क करें
            </a>
          </div>
        </div>

        <NotificationsFeed columns={2} showHeader={false} showAddButton={false} variant="plain" />
      </div>
    </div>
  );
}
