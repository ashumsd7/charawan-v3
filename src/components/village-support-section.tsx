import Link from "next/link";
import { ArrowRight, HeartHandshake, QrCode } from "lucide-react";
import { donationQrSrc } from "@/lib/donation-qr";

export type VillageDevelopment = {
  heading: string;
  subheading: string;
  qrImage: string;
  contributionsCta: string;
  contributionsHref: string;
  workDone: string[];
  requirements: string[];
  donateCta: string;
  donateHref: string;
};

export function VillageSupportSection({ data }: { data: VillageDevelopment }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm dark:border-slate-700">
      <div className="border-b border-slate-200 bg-gradient-to-r from-teal-700 to-emerald-800 px-6 py-5 text-white dark:border-slate-700">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <HeartHandshake className="h-5 w-5" aria-hidden />
          </span>
          {data.heading}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-teal-50/95">{data.subheading}</p>
      </div>
      <div className="grid gap-8 p-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-600">
            <QrCode
              className="pointer-events-none absolute right-2 top-2 z-10 h-5 w-5 text-slate-400"
              aria-hidden
            />
            <img
              src={donationQrSrc(data.qrImage)}
              alt="दान हेतु फोनपे QR कोड"
              width={192}
              height={192}
              className="h-full w-full object-contain p-1"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          <Link
            href={data.contributionsHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-center text-sm font-bold text-accent-foreground shadow-sm transition hover:opacity-95"
          >
            {data.contributionsCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={data.donateHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent bg-transparent px-4 py-3 text-center text-sm font-bold text-accent transition hover:bg-accent/10"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden />
            {data.donateCta}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
              चरावां में किए गए कार्य
            </h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-foreground/90">
              {data.workDone.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
              वर्तमान आवश्यकताएँ
            </h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-foreground/90">
              {data.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
