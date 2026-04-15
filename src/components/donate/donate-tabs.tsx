"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Heart, Link as LinkIcon } from "lucide-react";
import { ShareButton } from "@/components/share-button";

type Need = {
  id: string;
  name: string;
  image: string;
  description: string;
  priceStarts: number;
  buyLink?: string;
  timesDonated: number;
  donors: {
    name: string;
    photo?: string;
    description?: string;
    thankYouNote?: string;
  }[];
};

function scrollToQr() {
  const el = document.getElementById("donate-qr");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function currencyLabel(priceStarts: number) {
  if (!Number.isFinite(priceStarts) || priceStarts <= 0) return "Price: योगदान (QR)";
  return `Price starts: ₹${priceStarts}`;
}

export function DonateTabs({ needs }: { needs: Need[] }) {
  const [tab, setTab] = useState<"needs" | "donors">("needs");

  const donors = useMemo(() => {
    const list: { needId: string; needName: string; donor: Need["donors"][number] }[] = [];
    for (const n of needs) {
      for (const d of n.donors ?? []) {
        list.push({ needId: n.id, needName: n.name, donor: d });
      }
    }
    return list;
  }, [needs]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-card/80 p-1 shadow-sm backdrop-blur dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTab("needs")}
            className={`rounded-2xl px-4 py-2 text-sm font-extrabold transition ${
              tab === "needs"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-foreground/80 hover:bg-slate-900/5 dark:hover:bg-white/5"
            }`}
          >
            Needs
          </button>
          <button
            type="button"
            onClick={() => setTab("donors")}
            className={`rounded-2xl px-4 py-2 text-sm font-extrabold transition ${
              tab === "donors"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-foreground/80 hover:bg-slate-900/5 dark:hover:bg-white/5"
            }`}
          >
            Donors
          </button>
        </div>

        <p className="text-sm font-semibold text-muted">
          {tab === "needs"
            ? `कुल आवश्यकताएँ: ${needs.length}`
            : `कुल दानदाता: ${donors.length}`}
        </p>
      </div>

      {tab === "needs" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {needs.map((n) => (
            <article
              key={n.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-card/85 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700"
            >
              <div className="grid gap-0 sm:grid-cols-[140px_1fr]">
                <div className="relative h-44 w-full overflow-hidden bg-white sm:h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.image}
                    alt={n.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight">{n.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-muted">
                        {currencyLabel(n.priceStarts)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-extrabold text-accent ring-1 ring-accent/15">
                      <Heart className="h-3.5 w-3.5" aria-hidden />
                      {n.timesDonated || 0}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90">{n.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {n.buyLink?.trim() ? (
                      <a
                        href={n.buyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                      >
                        <LinkIcon className="h-4 w-4" aria-hidden />
                        Buy link
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={scrollToQr}
                      className="inline-flex items-center justify-center rounded-xl border-2 border-accent bg-transparent px-3 py-2 text-xs font-extrabold text-accent transition hover:bg-accent/10"
                    >
                      दान करें
                    </button>
                    <ShareButton
                      title={`Charawan needs: ${n.name}`}
                      text={`चरावां गाँव के लिए मदद: ${n.name}\n${currencyLabel(n.priceStarts)}\nछोटा सा सहयोग भी मदद करता है।`}
                      className="ml-auto"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {donors.length ? (
            donors.map((entry, idx) => (
              <article
                key={`${entry.needId}-${entry.donor.name}-${idx}`}
                className="rounded-3xl border border-slate-200 bg-card/85 p-5 shadow-sm backdrop-blur dark:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.donor.photo?.trim() ? entry.donor.photo : "/og-image-placeholder.svg"}
                      alt={entry.donor.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-muted">Donor</p>
                    <p className="truncate text-lg font-extrabold">{entry.donor.name}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground/90">
                      Donated for: <span className="font-extrabold">{entry.needName}</span>
                    </p>
                    {entry.donor.thankYouNote?.trim() ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {entry.donor.thankYouNote}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ShareButton
                        title="I donated to Charawan village"
                        text={`मैंने चरावां गाँव के लिए दान किया। अब आपकी बारी है।\nहर एक पैसा मदद करता है।`}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-card/85 p-6 text-sm font-semibold text-muted shadow-sm backdrop-blur dark:border-slate-700">
              अभी कोई donor entry नहीं है।
            </div>
          )}
        </div>
      )}
    </section>
  );
}

