import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";
import { homeCarouselPhotos } from "@/data/home-carousel-photos";
import { NEW_TAB_FALLBACK_HREF, WHATSAPP_CONTACT_HREF } from "@/lib/constants";

export const metadata: Metadata = {
  title: "इतिहास",
  description: "चरावां का इतिहास — वीडियो और सामुदायिक योगदान।",
};

type HistoryJson = {
  banner: { title: string };
  heading: string;
  body: string;
  whatsapp: string;
  youtubeEmbed: string;
};

/** First gallery photo doubles as history hero (same set as home carousel). */
const HISTORY_BANNER_PHOTO = homeCarouselPhotos[0];

export default async function HistoryPage() {
  const data = await readJsonFile<HistoryJson>("history.json");
  const embedSrc = data.youtubeEmbed.trim();
  const whatsappHref = WHATSAPP_CONTACT_HREF || data.whatsapp || NEW_TAB_FALLBACK_HREF;

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:space-y-12 sm:py-12">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:ring-white/10 sm:aspect-[2/1] sm:max-h-[min(22rem,50vw)]">
          <Image
            src={HISTORY_BANNER_PHOTO.src}
            alt={data.banner.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">इतिहास</p>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
              {data.heading}
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90 sm:text-lg">
            {data.body}
          </p>
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95"
          >
            WhatsApp समूह
          </Link>
        </div>

        {embedSrc ? (
          <section
            id="yt-frame"
            aria-label="चरावां इतिहास वीडियो"
            className="space-y-3"
          >
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              वीडियो
            </h2>
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-xl ring-1 ring-slate-900/5 dark:border-slate-600 dark:ring-white/10">
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={embedSrc}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-muted dark:border-slate-600">
            वीडियो लिंक जल्द जोड़ा जाएगा — <code className="text-xs">data/history.json → youtubeEmbed</code>
          </p>
        )}
      </div>
    </div>
  );
}
