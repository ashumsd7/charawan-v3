"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const onShare = async () => {
    const url = window.location.href;
    const text = `${title}\n\n${url}`;
    try {
      if ("share" in navigator) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      // fallback to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-sky-700"
    >
      <Share2 className="h-4 w-4" aria-hidden />
      शेयर करें
    </button>
  );
}
