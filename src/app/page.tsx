import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  Link2,
  MapPin,
  Sparkles,
  Store,
} from "lucide-react";
import { readJsonFile } from "@/lib/read-data";
import type { Metadata } from "next";
import { CharawanRepresentatives } from "@/components/charawan-representatives";
import { SupportCricket } from "@/components/support-cricket";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeNotificationsFeed } from "@/components/home-notifications-feed";
import { VillageSupportSection } from "@/components/village-support-section";
import { EmergencyContactsSection } from "@/components/emergency-contacts-section";
import { homeCarouselPhotos } from "@/data/home-carousel-photos";
import { WHATSAPP_CONTACT_HREF } from "@/lib/constants";
import { CHARAWAN_DONATIONS_FIREBASE_URL, normalizeDonateDbShape, type DonateDbShape } from "@/lib/donations-firebase";

export const metadata: Metadata = {
  title: "मुख्य पेज",
};

type HomeJson = typeof import("../../data/home.json");
type SiteJson = typeof import("../../data/site.json");
type EmergencyJson = typeof import("../../data/emergency-contacts.json");

export default async function HomePage() {
  const [home, site, emergency, donatePayload] = await Promise.all([
    readJsonFile<HomeJson>("home.json"),
    readJsonFile<SiteJson>("site.json"),
    readJsonFile<EmergencyJson>("emergency-contacts.json"),
    fetch(CHARAWAN_DONATIONS_FIREBASE_URL, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    }).then((r) => r.json()),
  ]);
  const donate: DonateDbShape = (() => {
    const normalized = normalizeDonateDbShape(donatePayload);
    if (!normalized) throw new Error("Invalid donations payload from Firebase");
    return normalized;
  })();

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:space-y-16 sm:py-12">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-800/50 dark:bg-slate-900/60 dark:text-teal-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden />
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" aria-hidden />
              {home.hero.welcomeEn}
            </div>
            <h1 className="font-serif text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-emerald-300 dark:to-amber-300">
                {home.hero.titleEn}
              </span>
            </h1>
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {home.hero.welcomeHi}
            </p>
            <p className="text-sm text-muted">{home.hero.hopeLine}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/shops"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Store className="h-4 w-4" aria-hidden />
                {home.hero.shopsCta}
              </Link>
            </div>
          </div>

          <HeroCarousel
            slides={homeCarouselPhotos.map((p, idx) => ({
              src: p.src,
              alt: `चरावां — गैलरी ${idx + 1}`,
            }))}
            whatsappHref={WHATSAPP_CONTACT_HREF || site.social.whatsappGroup}
            whatsappLabel={home.hero.joinWhatsappCta}
          />
        </section>

        <VillageSupportSection data={home.villageDevelopment} donate={donate} />

        <HomeNotificationsFeed />

        <EmergencyContactsSection
          sectionId={emergency.sectionId}
          heading={emergency.heading}
          subheading={emergency.subheading}
          cards={emergency.cards}
          helplinesHeading={emergency.helplinesHeading}
          helplines={emergency.helplines}
        />

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Link2 className="h-5 w-5" aria-hidden />
            </span>
            महत्वपूर्ण लिंक
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {home.importantLinks.map((l) => (
              <li key={l.href + l.label}>
                <a
                  href={l.href}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-card/90 px-4 py-3 text-sm font-semibold text-accent shadow-sm backdrop-blur transition hover:border-accent/40 hover:bg-accent/5 dark:border-slate-700"
                >
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  <span className="leading-snug">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700">
          <p className="flex gap-2 text-lg leading-relaxed text-foreground/90">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <span>{home.intro}</span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
            <BarChart3 className="h-4 w-4 text-accent" aria-hidden />
            <span>जनसांख्यिकी संक्षेप</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {home.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-accent/10 px-3 py-4 text-center ring-1 ring-accent/15"
              >
                <p className="text-2xl font-bold text-accent">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{home.statsNote}</p>
        </section>

        <SupportCricket
          clubTitle={home.cricketSection.title}
          body={home.cricketSection.body}
          ctaHref={home.cricketSection.ctaHref}
          ctaLabel={home.cricketSection.ctaLabel}
        />

        <CharawanRepresentatives people={home.leaders} />

        <section className="flex gap-3 rounded-3xl border border-slate-200 bg-card/90 p-6 text-sm leading-relaxed text-muted shadow-sm backdrop-blur dark:border-slate-700">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>{home.aboutTeaser}</div>
        </section>
      </div>
    </div>
  );
}
