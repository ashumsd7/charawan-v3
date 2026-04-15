"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GoogleTranslateWidget } from "@/components/google-translate";

export type MobileNavItem = { href: string; label: string };

export function MobileNavMenu({
  items,
  translateHint,
}: {
  items: MobileNavItem[];
  translateHint: string;
}) {
  const [open, setOpen] = useState(false);
  const safeItems = useMemo(
    () => items.filter((i) => (i.href ?? "").trim() && (i.label ?? "").trim()),
    [items],
  );

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        aria-label={open ? "मेनू बंद करें" : "मेनू खोलें"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur transition hover:bg-white/10"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/98 shadow-2xl shadow-slate-900/40 backdrop-blur">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              मेनू
            </p>
          </div>

          <div className="space-y-1 p-2">
            {safeItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              भाषा
            </p>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <GoogleTranslateWidget hint={translateHint} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

