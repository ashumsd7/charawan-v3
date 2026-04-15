import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "सभी सूचनाएँ",
  description: "चरावां ग्राम सूचनाएँ — पूर्ण सूची।",
};

type NotificationsJson = {
  panel: {
    heading: string;
    subtitle: string;
    addLabel: string;
    addHref: string;
  };
  items: {
    id: string;
    headline: string;
    message: string;
    author: string;
    timeLabel: string;
    likes: number;
    unread?: boolean;
    thumbnail?: string;
  }[];
};

export default async function NotificationsPage() {
  const data = await readJsonFile<NotificationsJson>("notifications.json");

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data.panel.heading}</h1>
            <p className="mt-1 text-sm text-muted">{data.panel.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white/60 dark:border-slate-600"
            >
              ← मुख्य पृष्ठ
            </Link>
            <a
              href={data.panel.addHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              {data.panel.addLabel}
            </a>
          </div>
        </div>

        <ul className="space-y-3">
          {data.items.map((n) => (
            <li
              key={n.id}
              className={`flex gap-3 rounded-2xl border bg-card p-3 shadow-sm ${
                n.unread
                  ? "border-teal-300/80 ring-1 ring-teal-400/25 dark:border-teal-800"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
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
              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-snug text-foreground">
                  {n.headline}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {n.message}
                </p>
                <p className="mt-2 text-[11px] text-muted">
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
