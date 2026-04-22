"use client";

import Link from "next/link";
import { MessageCircle, Store } from "lucide-react";

const OPEN_CHAT_EVENT = "charawan:open-chat";

export function dispatchOpenCharawanChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}

type Props = {
  shopsHref: string;
  shopsLabel: string;
  chatbotTitle: string;
  chatbotHintHi: string;
};

export function HomeHeroActions({ shopsHref, shopsLabel, chatbotTitle, chatbotHintHi }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
      <Link
        href={shopsHref}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      >
        <Store className="h-4 w-4" aria-hidden />
        {shopsLabel}
      </Link>
      <button
        type="button"
        onClick={() => dispatchOpenCharawanChat()}
        className="group inline-flex flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-accent/50 bg-gradient-to-br from-accent/15 via-card to-amber-400/10 px-6 py-3 text-left shadow-md ring-1 ring-accent/20 transition hover:border-accent hover:shadow-lg hover:ring-accent/35 dark:from-accent/20 dark:to-amber-500/10"
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
          <MessageCircle
            className="h-4 w-4 text-accent transition group-hover:scale-110"
            aria-hidden
          />
          {chatbotTitle}
        </span>
        <span className="text-xs font-medium text-muted">{chatbotHintHi}</span>
      </button>
    </div>
  );
}
