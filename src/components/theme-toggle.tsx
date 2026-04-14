"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({
  labelLight,
  labelDark,
}: {
  labelLight: string;
  labelDark: string;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("charawan_theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-slate-300 bg-card px-3 py-1.5 text-sm text-foreground shadow-sm transition hover:border-accent hover:text-accent dark:border-slate-600"
      aria-pressed={dark}
    >
      {dark ? labelLight : labelDark}
    </button>
  );
}
