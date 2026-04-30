import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { readJsonFile } from "@/lib/read-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeScript } from "@/components/theme-script";
import { ChatAssistant } from "@/components/chat-assistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await readJsonFile<{
    seo: { defaultTitle: string; defaultDescription: string };
    village: { nameHi: string };
    domain?: string;
  }>("site.json");
  const baseUrl = `https://${site.domain || "charawan.in"}`;
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: site.seo.defaultTitle,
      template: `%s · ${site.village.nameHi}`,
    },
    description: site.seo.defaultDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "hi_IN",
      title: site.seo.defaultTitle,
      description: site.seo.defaultDescription,
      siteName: site.village.nameHi,
      url: baseUrl,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: site.village.nameHi,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.defaultTitle,
      description: site.seo.defaultDescription,
      images: ["/logo.png"],
    },
    icons: {
      icon: [{ url: "/logo.png" }],
      apple: [{ url: "/logo.png" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = "hi" as const;
  const i18n = await readJsonFile<Record<typeof lang, Record<string, string>>>(
    "i18n.json",
  );
  const t = (k: string) => i18n[lang][k] ?? k;

  return (
    <html
      lang="hi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <ThemeScript />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ChatAssistant
          labels={{
            title: t("chat.title"),
            subtitle: t("chat.subtitle"),
            welcome: t("chat.welcome"),
            hintsTitle: t("chat.hintsTitle"),
            hint1: t("chat.hint1"),
            hint2: t("chat.hint2"),
            hint3: t("chat.hint3"),
            hint4: t("chat.hint4"),
            placeholder: t("chat.placeholder"),
            send: t("chat.send"),
            thinking: t("chat.thinking"),
            close: t("chat.close"),
            fabAria: t("chat.fabAria"),
            copy: t("chat.copy"),
            share: t("chat.share"),
            copied: t("chat.copied"),
            sourceIntro: t("chat.sourceIntro"),
            sourceOutro: t("chat.sourceOutro"),
            shareFallback: t("chat.shareFallback"),
          }}
        />
      </body>
    </html>
  );
}
