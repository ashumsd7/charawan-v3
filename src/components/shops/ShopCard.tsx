"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Clock, Copy, MapPin, Phone, PhoneCall, Share2, Store, Tag } from "lucide-react";
import type { ShopWithKey } from "@/lib/shops-firebase";
import { ShopShareModal } from "@/components/shops/shop-share-modal";

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

/** Card image: prefer मालिक फोटो (ownerPhoto), then shopPhotos. Supports alternate Firebase key casing. */
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
      onClick={onCopy}
      aria-label={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {done ? (
        <Check className="h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

export default function ShopCard({ data, siteOrigin }: { data: ShopWithKey; siteOrigin: string }) {
  const [shareOpen, setShareOpen] = useState(false);
  const types = (data.shopType ?? []).filter((t): t is string => Boolean(t));
  const phone1 = telDigits(data.mobileNumber);
  const phone2 = telDigits(data.mobileNumber2);
  const dup = phone1 && phone2 && phone1 === phone2;
  const has1 = isDialable(data.mobileNumber);
  const has2 = isDialable(data.mobileNumber2) && !dup;

  const imageUrl = pickCardImageUrl(data);

  const shareUrl = useMemo(() => {
    const u = new URL("/shops", siteOrigin);
    u.searchParams.set("q", data.shopName || "");
    return u.toString();
  }, [siteOrigin, data.shopName]);

  const shareDescription = useMemo(() => {
    const parts = [
      data.shopName,
      data.owenerName ? `मालिक: ${data.owenerName}` : "",
      data.shopAddress || "",
      data.villageName ? `गाँव: ${data.villageName}` : "",
      has1 ? `फोन: ${phone1}` : "",
      has2 ? `फोन २: ${phone2}` : "",
      `\n${shareUrl}`,
    ].filter(Boolean);
    return parts.join("\n");
  }, [data, has1, has2, phone1, phone2, shareUrl]);

  const primaryTelHref = has1 ? data.mobileNumber : has2 ? data.mobileNumber2 : undefined;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-card shadow-md ring-1 ring-slate-900/5 transition hover:shadow-lg dark:border-slate-700 dark:ring-white/10">
      <div className="relative aspect-[5/4] min-h-[11rem] w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {imageUrl ? (
          // Native <img>: avoids Next/Image remote + optimizer issues (e.g. imgbb referrer / unknown hosts).
          <img
            src={imageUrl}
            alt={data.shopName}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full min-h-[8rem] items-center justify-center">
            <Store className="h-12 w-12 text-slate-400" aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute right-2 top-2 z-10">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg ring-1 ring-slate-900/10 transition hover:bg-white dark:bg-slate-900/95 dark:text-white dark:ring-white/20"
              aria-label="शेयर करें"
            >
              <Share2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {primaryTelHref ? (
            <div className="pointer-events-auto absolute bottom-2 right-2 z-10">
              <a
                href={primaryTelHref}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg ring-2 ring-white/40 transition hover:opacity-95"
                aria-label="फोन करें"
              >
                <PhoneCall className="h-5 w-5" aria-hidden />
              </a>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="min-h-0 flex-1 space-y-1.5">
          <h2 className="line-clamp-2 pr-1 text-sm font-extrabold leading-snug tracking-tight text-foreground sm:text-base">
            {data.shopName}
          </h2>
          {data.owenerName ? (
            <p className="line-clamp-1 text-xs font-bold text-foreground/85">मालिक: {data.owenerName}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-semibold text-muted sm:text-xs">
            {data.villageName ? (
              <span className="inline-flex max-w-full items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0 text-accent" aria-hidden />
                <span className="truncate">{data.villageName}</span>
              </span>
            ) : null}
            {data.openTime || data.closeTime ? (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-3 w-3 shrink-0 text-accent" aria-hidden />
                {data.openTime || "—"}–{data.closeTime || "—"}
              </span>
            ) : null}
          </div>
          {data.shopAddress ? (
            <p className="line-clamp-2 text-[11px] font-medium leading-snug text-foreground/80">
              {data.shopAddress}
            </p>
          ) : null}
          {data.shopInfo ? (
            <p className="line-clamp-3 text-[11px] leading-snug text-muted">{data.shopInfo}</p>
          ) : null}
          {types.length ? (
            <p className="flex flex-wrap items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-accent">
              <Tag className="h-3 w-3 shrink-0" aria-hidden />
              <span className="line-clamp-2">{types.join(" · ")}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-3 border-t border-slate-200/80 pt-3 dark:border-slate-600/80">
          {has1 && !has2 ? (
            <a
              href={data.mobileNumber}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-extrabold text-accent-foreground shadow-sm transition hover:opacity-95"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              फोन करें
            </a>
          ) : null}

          {has1 && has2 ? (
            <div className="grid grid-cols-2 gap-2">
              <a
                href={data.mobileNumber}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent py-3 text-xs font-extrabold text-accent-foreground shadow-sm transition hover:opacity-95"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                कॉल १
              </a>
              <a
                href={data.mobileNumber2}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-accent/70 bg-accent/5 py-3 text-xs font-extrabold text-accent transition hover:bg-accent/10"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                कॉल २
              </a>
            </div>
          ) : null}

          {!has1 && has2 ? (
            <a
              href={data.mobileNumber2}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-extrabold text-accent-foreground shadow-sm transition hover:opacity-95"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              फोन करें
            </a>
          ) : null}

          {(has1 && has2) || (has1 && phone1) || (has2 && phone2) ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
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
      </div>

      <ShopShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={data.shopName}
        description={shareDescription}
      />
    </article>
  );
}
