"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
      <section className="border-b border-slate-200/90 bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">
                चरावां · वेब सूची
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                संपर्क सूची
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                आस-पास के संपर्क ढूँढें — दुकान, सेवा, फोन व पता एक ही जगह।
              </p>
            </div>
            <Link
              href="/manage-contacts"
              className="inline-flex shrink-0 items-center justify-center self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-teal-600/40 hover:bg-teal-50/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-teal-500/40 dark:hover:bg-slate-700"
            >
              नया संपर्क जोड़ें
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-md ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900/80 dark:ring-white/10 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">संपर्क खोजें</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                  placeholder="नाम, पता, गाँव, फोन…"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-11 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500/60 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400/50 sm:h-11 sm:text-base"
                  autoComplete="off"
                />
              </label>
              <button
                type="button"
                onClick={runSearch}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:h-11 sm:px-8 dark:bg-teal-700 dark:hover:bg-teal-600"
              >
                <Search className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                खोजें
              </button>
            </div>
          </div>
        </div>
      </section>

      <div id="shops-grid" className="w-full bg-slate-100/90 dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pt-10">
          {fetchError ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              {fetchError}
            </p>
          ) : null}
          {!fetchError && shops.length === 0 ? (
            <p className="text-center text-sm font-medium text-muted">इस समय कोई संपर्क डेटा उपलब्ध नहीं है।</p>
          ) : null}
          <p className="mb-6 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            {fetchError ? null : (
              <>
                कुल <span className="font-bold text-teal-700 dark:text-teal-400">{filtered.length}</span>{" "}
                प्रविष्टियाँ
                {applied.trim() ? ` · खोज: “${applied.trim()}”` : null}
              </>
            )}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((data) => (
              <ShopCard key={data.key} data={data} siteOrigin={siteOrigin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
