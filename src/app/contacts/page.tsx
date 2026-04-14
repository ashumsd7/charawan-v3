import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "सम्पर्क करें",
  description: "चरावां वेबसाइट से जुड़ने के तरीके।",
};

export default async function ContactsPage() {
  const data = await readJsonFile<{
    title: string;
    intro: string;
    channels: { label: string; href: string }[];
  }>("contacts.json");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="text-muted">{data.intro}</p>
      <ul className="space-y-3">
        {data.channels.map((c) => (
          <li key={c.href}>
            <a
              href={c.href}
              className="block rounded-2xl border border-slate-200 bg-card px-4 py-4 text-lg font-semibold text-accent transition hover:bg-accent/10 dark:border-slate-700"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
