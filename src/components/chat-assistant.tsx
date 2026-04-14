"use client";

import { useState } from "react";

export function ChatAssistant({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={title}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-accent-foreground shadow-lg ring-2 ring-white/30 transition hover:scale-105 dark:ring-black/30"
      >
        <span aria-hidden>🎙️</span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <button
                type="button"
                className="rounded-full px-2 py-1 text-sm text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
