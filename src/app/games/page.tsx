import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "खेल",
  description: "चरावां वेबसाइट पर मनोरंजन व गेम्स (प्लेसहोल्डर)।",
};

export default async function GamesPage() {
  const data = await readJsonFile<{ title: string; body: string }>("games.json");
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="leading-relaxed text-muted">{data.body}</p>
    </div>
  );
}
