import Link from "next/link";
import { readJsonFile } from "@/lib/read-data";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleTranslateWidget } from "@/components/google-translate";

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
  { href: "/games", key: "nav.games" },
];

export async function SiteHeader() {
  const lang: Lang = "hi";
  const i18n = await readJsonFile<I18nRoot>("i18n.json");
  const site = await readJsonFile<{ village: { nameHi: string; nameEn: string } }>(
    "site.json",
  );
  const t = (k: string) => i18n[lang][k] ?? k;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 shadow-lg shadow-slate-900/20">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-white">
              {site.village.nameHi}
            </span>
            <span className="text-xs font-medium text-teal-100/80">{site.village.nameEn}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ThemeToggle
              labelLight={t("theme.light")}
              labelDark={t("theme.dark")}
            />
            <div className="flex max-h-9 items-center rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 backdrop-blur">
              <GoogleTranslateWidget hint={t("translate.hint")} />
            </div>
          </div>
        </div>
      </div>
      <nav className="border-b border-slate-800/80 bg-slate-950/98 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-2 py-2.5 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1 sm:gap-2">
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
            <div className="flex flex-wrap items-center justify-start gap-1 sm:justify-end sm:gap-2">
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
          <div className="flex flex-wrap gap-1 border-t border-white/10 pt-2 text-xs sm:text-sm">
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
