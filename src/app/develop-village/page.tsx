import type { Metadata } from "next";
import Link from "next/link";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "गाँव का विकास",
  description: "चरावां में किए गए कार्य व योगदान की जानकारी।",
};

export default async function DevelopVillagePage() {
  const data = await readJsonFile<{
    title: string;
    intro: string;
    milestones: string[];
  }>("develop-village.json");

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="leading-relaxed text-muted">{data.intro}</p>
        <ul className="list-inside list-disc space-y-2 text-foreground/90">
          {data.milestones.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/donate"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
          >
            दान पृष्ठ पर जाएँ
          </Link>
          <Link href="/" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold dark:border-slate-600">
            मुख्य पृष्ठ
          </Link>
        </div>
      </div>
    </div>
  );
}
