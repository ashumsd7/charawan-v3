import Image from "next/image";
import Link from "next/link";
import { Bell, IndianRupee, ListTree, Mic, ThumbsUp } from "lucide-react";
import { NEW_TAB_FALLBACK_HREF, WHATSAPP_CONTACT_HREF } from "@/lib/constants";

export type NotificationItem = {
  id: string;
  headline: string;
  message: string;
  author: string;
  timeLabel: string;
  likes: number;
  unread?: boolean;
  thumbnail?: string;
};

export type NotificationsPanelCopy = {
  heading: string;
  subtitle: string;
  seeAllHref: string;
  seeAllLabel: string;
  addLabel: string;
  addHref: string;
};

export function NotificationsSection({
  panel,
  items,
  previewCount = 4,
}: {
  panel: NotificationsPanelCopy;
  items: NotificationItem[];
  previewCount?: number;
}) {
  const preview = items.slice(0, previewCount);
  const contactHref = WHATSAPP_CONTACT_HREF || panel.addHref || NEW_TAB_FALLBACK_HREF;

  return (
    <section id="gram-notifications" className="scroll-mt-24">
      <div className="rounded-3xl border border-slate-200 bg-card/90 p-5 shadow-sm backdrop-blur dark:border-slate-700 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/25">
                <Bell className="h-5 w-5" aria-hidden />
              </span>
              {panel.heading}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">{panel.subtitle}</p>
          </div>

          <Link
            href={panel.seeAllHref}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent/20"
          >
            <ListTree className="h-4 w-4" aria-hidden />
            {panel.seeAllLabel}
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {preview.map((n) => (
            <article
              key={n.id}
              className={`relative flex gap-3 overflow-hidden rounded-2xl border bg-card p-3 shadow-sm transition hover:shadow-md dark:bg-card ${
                n.unread
                  ? "border-teal-300/80 ring-1 ring-teal-400/30 dark:border-teal-700/50"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {n.unread ? (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.25)]" />
              ) : null}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {n.thumbnail ? (
                  <Image
                    src={n.thumbnail}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-300">
                    <Bell className="h-5 w-5" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold leading-snug text-foreground">
                    {n.headline}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted dark:bg-slate-800">
                    <ListTree className="h-3 w-3" aria-hidden />
                    सूचना
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {n.message}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                  <span className="font-medium text-foreground/80">{n.author}</span>
                  <span>·</span>
                  <time>{n.timeLabel}</time>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                    {n.likes}
                  </span>
                </div>
              </div>
            </article>
          ))}

          <article className="overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-4 shadow-sm dark:border-amber-800/40 dark:from-slate-900/60 dark:via-slate-900/30 dark:to-emerald-900/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-slate-900/60 dark:text-amber-200 dark:ring-amber-800/40">
                    <Mic className="h-3.5 w-3.5" aria-hidden />
                    ग्राम न्यूज़ रिपोर्टर
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-slate-900/60 dark:text-emerald-200 dark:ring-emerald-800/40">
                    <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                    कमाई का मौका
                  </span>
                </p>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  बने गाँव के रिपोर्टर और पैसे कमाएँ
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  अब आपका गाँव, आपकी खबरें! पार्ट टाइम रिपोर्टर बनें और महीने के लिए ₹3000 तक कमाएँ।
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/charwan-jobs"
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700"
                >
                  सूचना जोड़ें
                </Link>
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-bold text-foreground transition hover:bg-white/80 dark:border-slate-700 dark:bg-slate-900/40"
                >
                  संपर्क करें
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
