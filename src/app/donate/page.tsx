import type { Metadata } from "next";
import Link from "next/link";
import axios from "axios";
import { HeartHandshake, Home, MapPin, QrCode, Smartphone } from "lucide-react";
import { donationQrSrc } from "@/lib/donation-qr";
import { CopyPhoneButton } from "@/components/copy-phone-button";
import { DonateTabs } from "@/components/donate/donate-tabs";
import { CHARAWAN_DONATIONS_FIREBASE_URL, normalizeDonateDbShape, type DonateDbShape } from "@/lib/donations-firebase";

export const metadata: Metadata = {
  title: "दान",
  description: "चरावां गाँव के विकास में योगदान — UPI व QR।",
};

export const revalidate = 300;

export default async function DonatePage() {
  const { data: payload } = await axios.get(CHARAWAN_DONATIONS_FIREBASE_URL, {
    timeout: 25_000,
    headers: { Accept: "application/json" },
  });
  const data = normalizeDonateDbShape(payload);
  if (!data) {
    throw new Error("Invalid donations payload from Firebase");
  }

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:space-y-12 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {data.heading}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-card dark:border-slate-700"
            >
              <Home className="h-4 w-4 text-accent" aria-hidden />
              मुख्य पेज
            </Link>
            <Link
              href={data.screenshotNoteHref}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-sm transition hover:opacity-95"
            >
              <HeartHandshake className="h-4 w-4" aria-hidden />
              {data.screenshotNoteLabel}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-card/85 p-6 shadow-sm backdrop-blur dark:border-slate-700">
          <p className="text-sm font-bold uppercase tracking-wide text-muted">
            Thanks for donating to Charawan
          </p>
          <p className="mt-2 text-base font-semibold text-foreground/90">
            आपका छोटा सा सहयोग भी बड़ा बदलाव ला सकता है। QR/UPI से दान करें या जरूरत का सामान नीचे दिए पते पर भेजें।
          </p>
        </div>

        <div id="donate-qr" className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-foreground">UPI / QR</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent ring-1 ring-accent/15">
                <QrCode className="h-3.5 w-3.5" aria-hidden />
                Scan to donate
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
              <div className="mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-inner dark:border-slate-700 dark:bg-white">
                <img
                  src={donationQrSrc(data.qrImage)}
                  alt="दान हेतु फोनपे QR कोड"
                  className="h-full w-full object-contain"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted">UPI ID</p>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-3 py-2 font-mono text-sm font-extrabold text-slate-900 dark:bg-amber-400">
                  <Smartphone className="h-4 w-4" aria-hidden />
                  {data.upiId}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <CopyPhoneButton
                    textToCopy={data.upiId}
                    label="UPI कॉपी करें"
                    className="border-2"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-card/80 p-4 text-sm text-foreground/90 dark:border-slate-700">
                  <p className="font-bold">नोट</p>
                  <p className="mt-1 leading-relaxed">
                    पेमेंट के बाद स्क्रीनशॉट भेजने के लिए{" "}
                    <Link href={data.screenshotNoteHref} className="font-extrabold text-accent underline">
                      {data.screenshotNoteLabel}
                    </Link>{" "}
                    पर जाएँ।
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-card/85 p-6 shadow-sm backdrop-blur dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted">
                  Ship to this address
                </p>
                <p className="mt-2 text-xl font-extrabold text-foreground">{data.shipTo.name}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/15">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <div className="mt-4 space-y-1.5 text-sm font-semibold text-foreground/90">
              {data.shipTo.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="pt-2">
                Phone: <span className="font-extrabold">{data.shipTo.phone}</span>
              </p>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-muted shadow-inner dark:border-slate-700 dark:bg-slate-950/40">
              <p className="font-bold text-foreground">How it works</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5">
                <li>आप QR/UPI से दान कर सकते हैं</li>
                <li>या नीचे दिए “Buy link” से सामान खरीदकर ऊपर दिए पते पर भेज सकते हैं</li>
                <li>खरीद लिंक न हो तो “Donate now / दान करें” से QR सेक्शन पर जाएँ</li>
              </ul>
            </div>
          </div>
        </div>

        <DonateTabs needs={data.needs} />

        <div className="rounded-3xl border border-slate-200 bg-card/85 p-6 text-sm leading-relaxed text-muted shadow-sm backdrop-blur dark:border-slate-700">
          {data.bodyParagraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "font-semibold text-foreground/90" : "mt-3"}>
              {p}
            </p>
          ))}
          <p className="mt-4 flex items-center gap-2 font-semibold text-muted">
            <HeartHandshake className="h-4 w-4 text-red-500" aria-hidden />
            चरावां डिजिटल पहल — आपके सहयोग से
          </p>
        </div>
      </div>
    </div>
  );
}
