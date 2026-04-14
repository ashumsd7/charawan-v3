"use client";

import { useEffect } from "react";

type TranslateCtor = new (opts: Record<string, unknown>, id: string) => void;

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslateWidget({ hint }: { hint: string }) {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      try {
        const ctor = (
          window as unknown as {
            google?: { translate?: { TranslateElement?: TranslateCtor } };
          }
        ).google?.translate?.TranslateElement;
        if (!ctor) return;
        new ctor(
          { pageLanguage: "hi", includedLanguages: "hi,en" },
          "google_translate_element",
        );
      } catch {
        /* ignore */
      }
    };

    const id = "google-translate-sdk";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(s);
    } else if (window.googleTranslateElementInit) {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div className="translate-widget-compact flex items-center gap-2">
      <span className="hidden text-[10px] font-semibold text-teal-100/80 sm:inline">
        {hint}
      </span>
      <div id="google_translate_element" className="leading-none" />
    </div>
  );
}
