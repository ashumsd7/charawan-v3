"use client";

import { useLayoutEffect } from "react";

export function ThemeScript() {
  useLayoutEffect(() => {
    const stored = localStorage.getItem("charawan_theme");
    const prefersDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);
  return null;
}
