"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import ShopCard from "@/components/shops/ShopCard";
import type { ShopWithKey } from "@/lib/shops-firebase";

export function ShopsDirectory({
  shops,
  fetchError,
  siteOrigin,
}: {
  shops: ShopWithKey[];
  fetchError?: string;
  siteOrigin: string;
}) {
  const [draft, setDraft] = useState("");
  const [applied, setApplied] = useState("");

  const filtered = useMemo(() => {
    const needle = applied.trim().toLowerCase();
    if (!needle) return shops;
    return shops.filter((s) => {
      const hay = [
        s.shopName,
        s.owenerName,
        s.shopAddress,
        s.shopInfo,
        s.villageName,
        s.key,
        ...(s.shopType ?? []).filter(Boolean).map(String),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [shops, applied]);

  const runSearch = () => {
    setApplied(draft.trim());
    requestAnimationFrame(() => {
      document.getElementById("shops-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex min-h-[200px] w-full items-center justify-center bg-accent px-4 py-8 md:min-h-[min(22rem,44vh)] md:py-10">
        <div className="flex w-full max-w-5xl flex-col gap-4 md:flex-row md:items-stretch md:gap-4">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 md:left-5 md:h-6 md:w-6"
              aria-hidden
            />
            <input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder="नंबर, नाम, पता लिखिए…"
              className="h-14 w-full rounded-2xl border-2 border-white/30 bg-white py-2 pl-12 pr-4 text-base font-semibold text-slate-900 shadow-lg outline-none ring-2 ring-white/25 placeholder:text-slate-500 focus:border-white focus:ring-white/50 md:h-[4.5rem] md:rounded-3xl md:pl-14 md:text-lg"
              autoComplete="off"
              aria-label="दुकान खोजें"
            />
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:flex-col md:justify-center lg:flex-row">
            <button
              type="button"
              onClick={runSearch}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-base font-extrabold text-white shadow-lg transition hover:bg-slate-800 md:h-[4.5rem] md:rounded-3xl md:px-8 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Search className="h-5 w-5 shrink-0" aria-hidden />
              खोजें
            </button>
            <Link
              href="/add-contact"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-white/80 bg-white/15 px-5 text-base font-extrabold text-white shadow-md backdrop-blur transition hover:bg-white/25 md:h-[4.5rem] md:rounded-3xl md:px-6"
            >
              <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
              नया संपर्क
            </Link>
          </div>
        </div>
      </div>

      <div id="shops-grid" className="w-full bg-slate-200/80 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-12">
          {fetchError ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              {fetchError}
            </p>
          ) : null}
          {!fetchError && shops.length === 0 ? (
            <p className="text-center text-sm font-medium text-muted">कोई दुकान डेटा उपलब्ध नहीं।</p>
          ) : null}
          <p className="mb-6 text-center text-sm font-semibold text-muted">
            {fetchError ? null : (
              <>
                कुल <span className="text-accent">{filtered.length}</span> दुकानें
                {applied.trim() ? ` · खोज: “${applied.trim()}”` : null}
              </>
            )}
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((data) => (
              <ShopCard key={data.key} data={data} siteOrigin={siteOrigin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
