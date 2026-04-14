import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "सभी सूचनाएँ",
  description: "चरावां ग्राम सूचनाएँ — पूर्ण सूची।",
};

type HomePick = {
  notificationsPanel: {
    heading: string;
    subtitle: string;
    addLabel: string;
    addHref: string;
  };
  notifications: {
    id: string;
    headline: string;
    message: string;
    author: string;
    timeLabel: string;
    likes: number;
    unread?: boolean;
    thumbnail: string;
  }[];
};

export default async function NotificationsPage() {
  const home = await readJsonFile<HomePick>("home.json");

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{home.notificationsPanel.heading}</h1>
            <p className="mt-1 text-sm text-muted">{home.notificationsPanel.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white/60 dark:border-slate-600"
            >
              ← मुख्य पृष्ठ
            </Link>
            <a
              href={home.notificationsPanel.addHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              {home.notificationsPanel.addLabel}
            </a>
          </div>
        </div>

        <ul className="space-y-3">
          {home.notifications.map((n) => (
            <li
              key={n.id}
              className={`flex gap-4 rounded-2xl border bg-card p-4 shadow-sm ${
                n.unread
                  ? "border-teal-300/80 ring-1 ring-teal-400/25 dark:border-teal-800"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <Image src={n.thumbnail} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground">{n.headline}</h2>
                <p className="mt-1 text-sm text-muted">{n.message}</p>
                <p className="mt-2 text-xs text-muted">
                  {n.author} · {n.timeLabel} · 👍 {n.likes}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
