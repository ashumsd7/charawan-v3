import Link from "next/link";
import { readJsonFile } from "@/lib/read-data";
import {
  FACEBOOK_HREF,
  INSTAGRAM_HREF,
  TWITTER_HREF,
  WHATSAPP_CONTACT_HREF,
  YOUTUBE_HREF,
} from "@/lib/constants";

type Lang = "hi";
type I18nRoot = Record<Lang, Record<string, string>>;

export async function SiteFooter() {
  const lang: Lang = "hi";
  const [i18n, site, home] = await Promise.all([
    readJsonFile<I18nRoot>("i18n.json"),
    readJsonFile<{
      domain: string;
      map: { embedUrl: string; link: string };
    }>("site.json"),
    readJsonFile<{
      footer: { copyright: string; terms: string };
    }>("home.json"),
  ]);
  const t = (k: string) => i18n[lang][k] ?? k;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 text-sm text-muted dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-card py-8 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="text-lg font-bold text-foreground">गाँव का स्थान (मानचित्र)</h3>
          <p className="mt-1 text-xs text-muted">
            नीचे एम्बेडेड मैप देखें — पूर्ण स्क्रीन के लिए लिंक खोलें।
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
            <iframe
              title="Charawan map"
              src={site.map.embedUrl}
              className="h-[280px] w-full sm:h-[320px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-muted">Google Maps</span>
            <a
              className="font-semibold text-accent hover:underline"
              href={site.map.link}
              target="_blank"
              rel="noreferrer"
            >
              {site.domain} पर खोलें
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">{site.domain}</p>
          <p className="mt-2">{home.footer.copyright}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-foreground">{t("nav.links")}</span>
          <Link className="hover:text-accent" href="/links">
            महत्वपूर्ण लिंक
          </Link>
          <Link className="hover:text-accent" href="/contacts">
            सम्पर्क सूची
          </Link>
          <Link className="hover:text-accent" href="/about">
            परिचय
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-foreground">Social</span>
          {[
            { label: "WhatsApp", href: WHATSAPP_CONTACT_HREF },
            { label: "Facebook", href: FACEBOOK_HREF },
            { label: "Instagram", href: INSTAGRAM_HREF },
            { label: "YouTube", href: YOUTUBE_HREF },
            { label: "Twitter", href: TWITTER_HREF },
          ].map((s) => {
            const href = (s.href ?? "").trim();
            const disabled = !href;
            return disabled ? (
              <span key={s.label} className="cursor-not-allowed opacity-50">
                {s.label}
              </span>
            ) : (
              <a
                key={s.label}
                className="hover:text-accent"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            );
          })}
          {/* <a className="hover:text-accent" href={"mailto:hello@charawan.netlify.app"}>
            Email
          </a> */}
          <Link className="hover:text-accent" href="/admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
