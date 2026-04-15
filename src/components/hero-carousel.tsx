"use client";

import { useEffect, useState } from "react";
import { ImageIcon, MessageCircle } from "lucide-react";

export function HeroCarousel({
  slides,
  whatsappHref,
  whatsappLabel,
}: {
  slides: { src: string; alt: string }[];
  whatsappHref: string;
  whatsappLabel: string;
}) {
  const [i, setI] = useState(0);
  const safe = slides.length ? slides : [{ src: "/og-image-placeholder.svg", alt: "" }];

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % safe.length), 5000);
    return () => clearInterval(t);
  }, [safe.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-card shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:ring-white/10">
        {safe.map((s, idx) => (
          <div
            key={s.src + idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div
              role="img"
              aria-label={s.alt}
              className="hero-carousel-fade absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${s.src}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-sm font-medium text-white drop-shadow">
              <ImageIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {s.alt}
            </p>
          </div>
        ))}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {safe.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`स्लाइड ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-center text-base font-bold text-white shadow-lg transition hover:brightness-110"
      >
        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
        {whatsappLabel}
      </a>
    </div>
  );
}
