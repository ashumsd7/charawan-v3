import Image from "next/image";
import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "क्रिकेट",
  description: "चरावां क्रिकेट क्लब — टूर्नामेंट वीडियो और जानकारी।",
};

export default async function CricketPage() {
  const data = await readJsonFile<{
    banner: { title: string; image: string; mobileImage: string };
    heading: string;
    body: string;
    whatsapp: string;
    sections: { id: string; title: string; videos: string[] }[];
  }>("cricket.json");

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div className="relative h-48 w-full overflow-hidden rounded-3xl sm:h-64">
        <Image src={data.banner.image} alt={data.banner.title} fill className="object-cover" priority />
      </div>
      <h1 className="text-3xl font-bold">{data.heading}</h1>
      <p className="whitespace-pre-line leading-relaxed text-muted">{data.body}</p>
      <a
        href={data.whatsapp}
        className="inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
      >
        WhatsApp समूह
      </a>

      {data.sections.map((sec) => (
        <section key={sec.id} id={sec.id} className="space-y-4">
          <h2 className="text-2xl font-semibold">{sec.title}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sec.videos.map((url) => (
              <div
                key={url}
                className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700"
              >
                <iframe className="aspect-video w-full" src={url} title="Cricket video" allowFullScreen />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
