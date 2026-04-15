import Image from "next/image";
import Link from "next/link";
import { Bell, ListTree, PlusCircle, ThumbsUp } from "lucide-react";

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
  const rest = items.slice(previewCount);

  return (
    <section id="gram-notifications" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/25">
              <Bell className="h-5 w-5" aria-hidden />
            </span>
            {panel.heading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{panel.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
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
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-card to-slate-50/80 p-5 shadow-sm dark:border-slate-700 dark:from-card dark:to-slate-900/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              अधिक
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">सूचनाएँ</p>
          </div>
          <ul className="space-y-2 text-sm text-muted">
            {rest.length ? (
              rest.map((n) => (
                <li
                  key={n.id}
                  className="line-clamp-2 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <span className="font-medium text-foreground">{n.headline}</span>
                  <span className="text-muted"> — {n.timeLabel}</span>
                </li>
              ))
            ) : (
              <li className="text-xs">अतिरिक्त सूचनाएँ यहीं दिखेंगी।</li>
            )}
          </ul>
          <Link
            href={panel.seeAllHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-bold text-accent transition hover:bg-accent/20"
          >
            <ListTree className="h-4 w-4" aria-hidden />
            {panel.seeAllLabel}
          </Link>
          <a
            href={panel.addHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-red-700"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            {panel.addLabel}
          </a>
        </aside>
      </div>
    </section>
  );
}
