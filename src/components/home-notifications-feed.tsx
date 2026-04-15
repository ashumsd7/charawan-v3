"use client";

import Link from "next/link";
import { Bell, ListTree, RefreshCw } from "lucide-react";
import { NotificationsFeed } from "@/app/notifications/notifications-feed";
import { useState } from "react";

export function HomeNotificationsFeed() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <section id="gram-notifications" className="scroll-mt-24">
      <div className="rounded-3xl border border-slate-200 bg-card/90 p-5 shadow-sm backdrop-blur dark:border-slate-700 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200">
                <Bell className="h-5 w-5" aria-hidden />
              </span>
              ग्राम सूचना केंद्र
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              गाँव की आधिकारिक व सामुदायिक अपडेट यहीं दिखाई जाती हैं।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((v) => v + 1)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              रिफ्रेश
            </button>
            <Link
              href="/notifications"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent/20"
            >
              <ListTree className="h-4 w-4" aria-hidden />
              सभी सूचनाएँ देखें
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <NotificationsFeed
            key={refreshKey}
            limit={6}
            columns={2}
            showHeader={false}
            showAddButton={false}
            variant="plain"
          />
        </div>
      </div>
    </section>
  );
}

