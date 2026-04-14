import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { readJsonFile } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "इलेक्शन",
  description: "चरावां ग्राम पंचायत चुनाव — वर्षानुसार परिणाम और आधिकारिक लिंक।",
};

type Row = {
  type: string;
  winnerImg?: string;
  img?: string;
  downloadLink?: string | null;
  winner?: string;
  opponent?: string;
  about?: string;
};

type ElectionPayload = {
  banner: { title: string; image: string; mobileImage: string };
  heading: string;
  years: string[];
  electionData: { year: string; data: Row[] }[];
};

export default async function ElectionPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const data = await readJsonFile<ElectionPayload>("election.json");
  const year = yearParam && data.years.includes(yearParam) ? yearParam : data.years[0];
  const block = data.electionData.find((b) => b.year === year) ?? data.electionData[0];

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:py-12">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:ring-white/10 sm:aspect-[2.2/1] sm:max-h-[min(20rem,55vw)]">
        <Image
          src={data.banner.image}
          alt={data.banner.title}
          fill
          className="object-cover object-[center_30%]"
          priority
          sizes="(max-width: 1152px) 100vw, 1152px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white drop-shadow md:text-base">
          {data.banner.title}
        </p>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{data.heading}</h1>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted">साल चुनें</span>
        {data.years.map((y) => (
          <Link
            key={y}
            href={`/election?year=${y}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              y === year
                ? "bg-accent text-accent-foreground"
                : "border border-slate-300 text-foreground hover:border-accent dark:border-slate-600"
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {block.data.map((item) => (
          <section
            key={item.type}
            className="space-y-3 rounded-3xl border border-slate-200 bg-card p-5 dark:border-slate-700"
          >
            {item.winnerImg ? (
              <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-full ring-4 ring-accent/30">
                <Image
                  src={item.winnerImg}
                  alt={item.winner ?? item.type}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <h2 className="text-center text-xl font-semibold text-accent">{item.type}</h2>
            {item.winner ? (
              <p className="text-center text-lg font-bold text-foreground">{item.winner}</p>
            ) : null}
            {item.opponent ? (
              <p className="text-center text-sm text-muted">{item.opponent}</p>
            ) : null}
            <p className="text-center text-xs text-muted">{block.year}</p>
            {item.downloadLink ? (
              <a
                href={item.downloadLink}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-sm font-semibold text-accent hover:underline"
              >
                सरकारी डेटा डाउनलोड करें
              </a>
            ) : (
              <p className="text-center text-xs text-muted">डेटा उपलब्ध नहीं</p>
            )}
            {item.img ? (
              <div className="relative mt-2 h-56 w-full overflow-hidden rounded-2xl">
                <Image src={item.img} alt="" fill className="object-contain bg-slate-50 dark:bg-slate-900" />
              </div>
            ) : null}
            {item.about ? (
              <p className="text-sm leading-relaxed text-muted">{item.about}</p>
            ) : null}
          </section>
        ))}
      </div>

      </div>
    </div>
  );
}
