"use client";

import { useCallback, useState } from "react";
import { Check, Clock, Copy, MapPin, PhoneCall, Share2, Store, Tag } from "lucide-react";
import type { ShopWithKey } from "@/lib/shops-firebase";
import { buildShopShareMessage } from "@/lib/shop-share-text";

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

function IconCopy({ text, label }: { text: string; label: string }) {
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
      className="notranslate inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span key={done ? "c" : "i"} className="inline-flex items-center justify-center">
        {done ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </span>
    </button>
  );
}

const callFab =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-md ring-2 ring-teal-600/30 transition hover:bg-teal-700 hover:ring-teal-500/40 active:scale-[0.98] dark:bg-teal-500 dark:hover:bg-teal-400";

const callFabSecondary =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-teal-600 bg-white text-teal-700 shadow-sm transition hover:bg-teal-50 dark:border-teal-400 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-slate-800";

export default function ShopCard({ data, siteOrigin }: { data: ShopWithKey; siteOrigin: string }) {
  const [shareDone, setShareDone] = useState(false);
  const types = (data.shopType ?? []).filter((t): t is string => Boolean(t));
  const phone1 = telDigits(data.mobileNumber);
  const phone2 = telDigits(data.mobileNumber2);
  const dup = phone1 && phone2 && phone1 === phone2;
  const has1 = isDialable(data.mobileNumber);
  const has2 = isDialable(data.mobileNumber2) && !dup;

  const imageUrl = pickCardImageUrl(data);

  const primaryTelHref = has1 ? data.mobileNumber : has2 ? data.mobileNumber2 : undefined;

  const onShareCopy = useCallback(async () => {
    const text = buildShopShareMessage(data, siteOrigin);
    try {
      await navigator.clipboard.writeText(text);
      setShareDone(true);
      setTimeout(() => setShareDone(false), 2200);
    } catch {
      setShareDone(false);
    }
  }, [data, siteOrigin]);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md dark:border-slate-700 dark:ring-white/10">
      {/* Top: image left, actions right */}
      <div className="flex gap-3 p-3">
        <div className="relative h-[7.25rem] w-[7.25rem] shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/90 dark:bg-slate-800 dark:ring-slate-600/80">
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

        <div className="flex min-h-[7.25rem] min-w-0 flex-1 flex-col items-end justify-between gap-2">
          <button
            type="button"
            translate="no"
            onClick={onShareCopy}
            className="notranslate flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={shareDone ? "संदेश कॉपी हो गया" : "संदेश कॉपी करें"}
          >
            {shareDone ? (
              <Check className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden />
            )}
          </button>

          <div className="flex flex-col items-end gap-2">
            {has1 && !has2 ? (
              <a href={data.mobileNumber} className={callFab} aria-label="फोन करें">
                <PhoneCall className="h-5 w-5" aria-hidden />
              </a>
            ) : null}

            {has1 && has2 ? (
              <>
                <a
                  href={data.mobileNumber}
                  className={callFab}
                  aria-label="पहला नंबर पर कॉल"
                  title="कॉल १"
                >
                  <PhoneCall className="h-5 w-5" aria-hidden />
                </a>
                <a
                  href={data.mobileNumber2}
                  className={callFabSecondary}
                  aria-label="दूसरा नंबर पर कॉल"
                  title="कॉल २"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden />
                </a>
              </>
            ) : null}

            {!has1 && has2 ? (
              <a href={data.mobileNumber2} className={callFab} aria-label="फोन करें">
                <PhoneCall className="h-5 w-5" aria-hidden />
              </a>
            ) : null}

            {!has1 && !has2 ? (
              <span className="rounded-full border border-dashed border-slate-300 px-2 py-1.5 text-center text-[10px] font-bold leading-tight text-muted dark:border-slate-600">
                कॉल उपलब्ध नहीं
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Below: details + copy */}
      <div className="flex flex-1 flex-col gap-2 border-t border-slate-200/80 px-3 pb-3 pt-2.5 dark:border-slate-600/70">
        <div className="min-w-0 space-y-1">
          <h2 className="line-clamp-2 font-serif text-base font-bold leading-snug tracking-tight text-foreground">
            {data.shopName}
          </h2>
          {data.owenerName ? (
            <p className="text-sm font-medium text-foreground/90">मालिक: {data.owenerName}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs font-medium text-muted">
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
          {data.shopAddress ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-foreground/85">{data.shopAddress}</p>
          ) : null}
          {data.shopInfo ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-muted">{data.shopInfo}</p>
          ) : null}
          {types.length ? (
            <p className="flex flex-wrap items-center gap-1 text-[10px] font-semibold text-teal-700 dark:text-teal-400">
              <Tag className="h-3 w-3 shrink-0" aria-hidden />
              <span className="line-clamp-2">{types.join(" · ")}</span>
            </p>
          ) : null}
        </div>

        {shareDone ? (
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400" translate="no">
            हिंदी संदेश क्लिपबोर्ड पर कॉपी हो गया
          </p>
        ) : null}

        {(has1 && has2) || (has1 && phone1) || (has2 && phone2) ? (
          <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2 dark:border-slate-700/80">
            <span className="mr-auto text-[10px] font-semibold uppercase tracking-wide text-muted">नंबर</span>
            {has1 && has2 ? (
              <>
                <IconCopy text={phone1} label="पहला नंबर कॉपी" />
                <IconCopy text={phone2} label="दूसरा नंबर कॉपी" />
              </>
            ) : has1 && phone1 ? (
              <IconCopy text={phone1} label="नंबर कॉपी" />
            ) : has2 && phone2 ? (
              <IconCopy text={phone2} label="नंबर कॉपी" />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
