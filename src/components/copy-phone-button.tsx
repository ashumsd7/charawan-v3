"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyPhoneButton({
  textToCopy,
  label = "नंबर कॉपी करें",
  className = "",
}: {
  textToCopy: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  const onCopy = useCallback(async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  }, [textToCopy]);

  if (!textToCopy) {
    return null;
  }

  return (
    <button
      type="button"
      translate="no"
      onClick={onCopy}
      className={`notranslate inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`}
    >
      <span key={done ? "copied" : "idle"} className="inline-flex items-center gap-2">
        {done ? (
          <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <Copy className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        )}
        <span>{done ? "कॉपी हो गया" : label}</span>
      </span>
    </button>
  );
}
