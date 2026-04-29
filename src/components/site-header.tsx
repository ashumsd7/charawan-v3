import Link from "next/link";
import { readJsonFile } from "@/lib/read-data";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleTranslateWidget } from "@/components/google-translate";
import { MobileNavMenu } from "@/components/mobile-nav";

type Lang = "hi";
type I18nRoot = Record<Lang, Record<string, string>>;

const navLeft: { href: string; key: string }[] = [
  { href: "/", key: "nav.home" },
  { href: "/history", key: "nav.history" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/cricket", key: "nav.cricket" },
  { href: "/election", key: "nav.election" },
  { href: "/contacts", key: "nav.contact" },
];

const navRight: { href: string; key: string }[] = [
  { href: "/#emergency-contacts", key: "nav.emergency" },
  { href: "/shops", key: "nav.shops" },
];

const extraNav: { href: string; key: string }[] = [
  { href: "/about", key: "nav.about" },
  { href: "/links", key: "nav.links" },
  { href: "/donate", key: "nav.donate" },
 
];

export async function SiteHeader() {
  const lang: Lang = "hi";
  const i18n = await readJsonFile<I18nRoot>("i18n.json");
  const site = await readJsonFile<{ village: { nameHi: string; nameEn: string } }>(
    "site.json",
  );
  const t = (k: string) => i18n[lang][k] ?? k;
  const mobileItems = [{ href: "/news", label: "चरावां समाचार" }, ...[...navLeft, ...navRight, ...extraNav].map((i) => ({
    href: i.href,
    label: t(i.key),
  }))];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 shadow-lg shadow-slate-900/20">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-white">
              {site.village.nameHi}
            </span>
            <span className="text-xs font-medium text-teal-100/80 sm:block">
              {site.village.nameEn}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle labelLight={t("theme.light")} labelDark={t("theme.dark")} />

            <div className="hidden max-h-9 items-center rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 backdrop-blur sm:flex">
              <GoogleTranslateWidget hint={t("translate.hint")} />
            </div>

            <MobileNavMenu items={mobileItems} translateHint={t("translate.hint")} />
          </div>
        </div>
      </div>

      <nav className="hidden border-b border-slate-800/80 bg-slate-950/98 backdrop-blur-md sm:block">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {navLeft.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-teal-50/95 transition hover:bg-white/10 hover:text-white"
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href="/news"
                className="rounded-full border border-red-300/35 bg-red-500/20 px-3 py-1.5 text-sm font-extrabold text-white underline underline-offset-2 transition hover:bg-red-500/30"
              >
                <span className="animate-pulse">चरावां समाचार</span>
              </Link>
              {navRight.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-white/10 hover:text-white ${
                    item.key === "nav.shops"
                      ? "bg-white/10 text-white ring-1 ring-white/15"
                      : "text-amber-100/95 ring-1 ring-amber-300/25 hover:ring-amber-200/40"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 border-t border-white/10 pt-2 text-sm">
            {extraNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-1 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
