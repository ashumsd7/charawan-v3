import Link from "next/link";
import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "हमारे बारे में",
  description: "चरावां वेबसाइट का उद्देश्य।",
};

type AboutJson = {
  title: string;
  paragraphs: string[];
  donateCta: string;
  donateHref: string;
};

export default async function AboutPage() {
  const data = await readJsonFile<AboutJson>("about.json");
  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{data.title}</h1>
        {data.paragraphs.map((p, i) => (
          <p key={i} className="text-lg font-medium leading-relaxed text-foreground/90">
            {p}
          </p>
        ))}
        <Link
          href={data.donateHref}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 text-base font-extrabold text-accent-foreground shadow-lg transition hover:opacity-95"
        >
          <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden />
          {data.donateCta}
        </Link>
      </div>
    </div>
  );
}
