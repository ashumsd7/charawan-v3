import Image from "next/image";
import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "गैलरी",
  description: "चरावां की फोटो व वीडियो गैलरी — यूट्यूब व गूगल फोटो लिंक।",
};

export default async function GalleryPage() {
  const data = await readJsonFile<{
    heading: string;
    items: {
      title: string;
      subTitle: string;
      link: string;
      info: string;
      numberOfPhotos: string;
      type: string;
      icon: string;
    }[];
  }>("gallery.json");

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold">{data.heading}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <a
            key={item.title + item.subTitle}
            href={item.link || "#"}
            target={item.link ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex flex-col rounded-3xl border border-slate-200 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent dark:border-slate-700"
          >
            <div className="relative mb-3 h-14 w-14">
              <Image src={item.icon} alt="" fill className="object-contain" sizes="56px" />
            </div>
            <h2 className="text-lg font-semibold text-foreground group-hover:text-accent">
              {item.title}
            </h2>
            <p className="text-sm text-muted">{item.subTitle}</p>
            <p className="mt-2 text-xs text-accent">{item.numberOfPhotos}</p>
            {item.info ? (
              <p className="mt-2 line-clamp-3 text-xs text-muted">{item.info}</p>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}
