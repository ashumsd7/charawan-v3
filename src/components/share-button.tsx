"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";

export function ShareButton({
  title,
  text,
  url,
  className = "",
}: {
  title: string;
  text: string;
  url?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const onShare = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const shareData: ShareData = { title, text };
      if (url) shareData.url = url;

      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      const shareText = url ? `${text}\n${url}` : text;
      await navigator.clipboard.writeText(shareText);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }, [busy, text, title, url]);

  return (
    <button
      type="button"
      onClick={onShare}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-card/80 px-3 py-2 text-xs font-bold text-foreground shadow-sm backdrop-blur transition hover:bg-card dark:border-slate-700 ${className}`}
      aria-label="Share"
    >
      <Share2 className="h-4 w-4 text-accent" aria-hidden />
      {busy ? "Sharing..." : "Share"}
    </button>
  );
}

