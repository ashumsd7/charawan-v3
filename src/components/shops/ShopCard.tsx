"use client";

import { useCallback, useState } from "react";
import { Check, Clock, Copy, Flag, MapPin, PhoneCall, Share2, Store, Tag } from "lucide-react";
import type { ShopWithKey } from "@/lib/shops-firebase";
import { buildShopShareMessage } from "@/lib/shop-share-text";
import { WHATSAPP_CONTACT_HREF } from "@/lib/constants";

function telDigits(tel?: string) {
  if (!tel || !tel.startsWith("tel:")) return "";
  return tel.replace(/^tel:\+?/, "").replace(/\D/g, "");
}

function isDialable(tel?: string) {
  return telDigits(tel).length >= 8;
}

function looksLikeHttpUrl(s: string) {
  const t = s.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("//");
}

function normalizeImageUrl(s: string) {
  let t = s.trim();
  if (t.startsWith("//")) t = `https:${t}`;
  return t;
}

function pickCardImageUrl(data: ShopWithKey): string | undefined {
  const raw = data as Record<string, unknown>;
  const candidates: unknown[] = [
    data.ownerPhoto,
    raw.OwnerPhoto,
    raw.owner_photo,
    data.shopPhotos,
    raw.shopPhotos,
  ];

  for (const c of candidates) {
    if (typeof c !== "string") continue;
    const n = normalizeImageUrl(c);
    if (n.length > 8 && looksLikeHttpUrl(n)) return n;
  }
  return undefined;
}

function IconCopy({
  text,
  label,
  size = "md",
}: {
  text: string;
  label: string;
  size?: "sm" | "md";
}) {
  const [done, setDone] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {
      setDone(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      translate="no"
      onClick={onCopy}
      aria-label={label}
      className={`notranslate inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${
        size === "sm" ? "h-7 w-7" : "h-9 w-9"
      }`}
    >
      <span key={done ? "c" : "i"} className="inline-flex items-center justify-center">
        {done ? (
          <Check
            className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} text-emerald-600`}
            aria-hidden
          />
        ) : (
          <Copy className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
        )}
      </span>
    </button>
  );
}

const callBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm ring-1 ring-red-600/25 transition hover:bg-red-700 active:scale-[0.99] dark:bg-red-500 dark:hover:bg-red-400";

const callBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm ring-1 ring-red-600/25 transition hover:bg-red-700 active:scale-[0.99] dark:bg-red-500 dark:hover:bg-red-400";

export default function ShopCard({ data, siteOrigin }: { data: ShopWithKey; siteOrigin: string }) {
  const [shareDone, setShareDone] = useState(false);
  const types = (data.shopType ?? []).filter((t): t is string => Boolean(t));
  const phone1 = telDigits(data.mobileNumber);
  const phone2 = telDigits(data.mobileNumber2);
  const dup = phone1 && phone2 && phone1 === phone2;
  const has1 = isDialable(data.mobileNumber);
  const has2 = isDialable(data.mobileNumber2) && !dup;

  const imageUrl = pickCardImageUrl(data);

  const onShare = useCallback(async () => {
    const text = buildShopShareMessage(data, siteOrigin);
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title: data.shopName || "संपर्क",
          text,
          url: `${siteOrigin.replace(/\/$/, "")}/shops`,
        });
        setShareDone(true);
        setTimeout(() => setShareDone(false), 2200);
        return;
      }
    } catch {
      // fall back to clipboard copy below
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareDone(true);
      setTimeout(() => setShareDone(false), 2200);
    } catch {
      setShareDone(false);
    }
  }, [data, siteOrigin]);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md dark:border-slate-700 dark:from-slate-900/70 dark:via-slate-950/40 dark:to-emerald-950/20 dark:ring-white/10 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.10),transparent_42%),radial-gradient(circle_at_80%_25%,rgba(59,130,246,0.09),transparent_45%),radial-gradient(circle_at_30%_85%,rgba(245,158,11,0.08),transparent_45%)] before:opacity-100 dark:before:bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.14),transparent_42%),radial-gradient(circle_at_80%_25%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_30%_85%,rgba(245,158,11,0.10),transparent_45%)]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 opacity-80"
      />
      <a
        href={WHATSAPP_CONTACT_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-16 top-3 flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
        aria-label="रिपोर्ट करें"
        title="रिपोर्ट करें"
      >
        <Flag className="h-4 w-4" aria-hidden />
        <span className="text-[10px] font-extrabold leading-none text-slate-700 dark:text-slate-200">
          रिपोर्ट
        </span>
      </a>
      <button
        type="button"
        translate="no"
        onClick={onShare}
        className="notranslate absolute right-3 top-3 flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
        aria-label={shareDone ? "शेयर हो गया" : "शेयर करें"}
        title="शेयर करें"
      >
        {shareDone ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden />
        )}
        <span className="text-[10px] font-extrabold leading-none text-slate-700 dark:text-slate-200">
          शेयर करें
        </span>
      </button>

      {/* Top: image + title */}
      <div className="flex gap-3 p-3 pr-14">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/90 dark:bg-slate-800 dark:ring-slate-600/80">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={data.shopName}
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800/90">
              <Store className="h-10 w-10 text-slate-400 dark:text-slate-500" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-foreground sm:text-xl">
            {data.shopName}
          </h2>
          {data.owenerName ? (
            <p className="mt-1 text-xs font-semibold text-foreground/85">
              मालिक: {data.owenerName}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-medium text-muted">
            {data.villageName ? (
              <span className="inline-flex max-w-full items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                <span className="truncate">{data.villageName}</span>
              </span>
            ) : null}
            {data.openTime || data.closeTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                {data.openTime || "—"}–{data.closeTime || "—"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Below: details + copy */}
      <div className="flex flex-1 flex-col gap-2 border-t border-slate-200/70 px-3 pb-3 pt-2.5 dark:border-slate-700/60">
        <div className="min-w-0 space-y-1">
          {data.shopAddress ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-foreground/85">
              {data.shopAddress}
            </p>
          ) : null}
          {data.shopInfo ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted">{data.shopInfo}</p>
          ) : null}
          {types.length ? (
            <p className="flex flex-wrap items-center gap-1 text-[10px] font-semibold text-teal-700 dark:text-teal-400">
              <Tag className="h-3 w-3 shrink-0" aria-hidden />
              <span className="line-clamp-2">{types.join(" · ")}</span>
            </p>
          ) : null}
        </div>

        {(has1 && has2) || (has1 && phone1) || (has2 && phone2) ? (
          <div className="mt-auto space-y-2 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              नंबर
            </p>
            <div className="space-y-2">
              {has1 && phone1 ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold text-foreground ring-1 ring-slate-200/70 dark:bg-slate-900/40 dark:ring-slate-700/60">
                  <span className="font-mono">{phone1}</span>
                  <IconCopy text={phone1} label="नंबर कॉपी" size="sm" />
                </div>
              ) : null}
              {has2 && phone2 ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold text-foreground ring-1 ring-slate-200/70 dark:bg-slate-900/40 dark:ring-slate-700/60">
                  <span className="font-mono">{phone2}</span>
                  <IconCopy text={phone2} label="नंबर कॉपी" size="sm" />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-2 grid grid-cols-1 gap-2">
          {has1 || has2 ? (
            <div className={`grid gap-2 ${has1 && has2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {has1 ? (
                <a href={data.mobileNumber} className={callBtn} aria-label="कॉल करें">
                  <PhoneCall className="h-4 w-4" aria-hidden />
                  कॉल करें
                </a>
              ) : null}
              {has2 ? (
                <a
                  href={data.mobileNumber2}
                  className={has1 ? callBtnSecondary : callBtn}
                  aria-label="कॉल करें"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden />
                  कॉल करें
                </a>
              ) : null}
            </div>
          ) : (
            <span className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-[11px] font-bold text-muted dark:border-slate-600">
              कॉल उपलब्ध नहीं
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
