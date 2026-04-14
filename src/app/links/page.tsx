import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "महत्वपूर्ण लिंक",
  description: "उपयोगी सरकारी व सामुदायिक लिंक।",
};

export default async function LinksPage() {
  const data = await readJsonFile<{ title: string; items: { label: string; href: string }[] }>(
    "links.json",
  );
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <ul className="space-y-3">
        {data.items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-slate-200 bg-card px-4 py-3 font-medium text-accent hover:bg-accent/10 dark:border-slate-700"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
