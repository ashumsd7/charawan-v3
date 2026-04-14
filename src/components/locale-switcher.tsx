"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LocaleSwitcher({
  current,
  labelHi,
  labelEn,
}: {
  current: "hi" | "en";
  labelHi: string;
  labelEn: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [lang, setLang] = useState(current);

  const setLocale = (next: "hi" | "en") => {
    start(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      });
      setLang(next);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-card p-1 text-xs dark:border-slate-600">
      <button
        type="button"
        disabled={pending}
        onClick={() => setLocale("hi")}
        className={`rounded-full px-2 py-1 ${
          lang === "hi"
            ? "bg-accent text-accent-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        {labelHi}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setLocale("en")}
        className={`rounded-full px-2 py-1 ${
          lang === "en"
            ? "bg-accent text-accent-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        {labelEn}
      </button>
    </div>
  );
}
