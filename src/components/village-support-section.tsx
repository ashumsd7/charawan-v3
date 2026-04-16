import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import type { DonateDbShape } from "@/lib/donations-firebase";

export type VillageDevelopment = {
  heading: string;
  subheading: string;
  qrImage: string;
  contributionsCta: string;
  contributionsHref: string;
  workDone: string[];
  requirements: string[];
  donateCta: string;
  donateHref: string;
};

function takeRandom<T>(arr: T[], count: number) {
  if (!arr.length || count <= 0) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export function VillageSupportSection({
  data,
  donate,
}: {
  data: VillageDevelopment;
  donate: DonateDbShape;
}) {
  const needs = donate?.needs ?? [];
  const topNeeds = takeRandom(needs, 3);
  const allDonors = (needs ?? []).flatMap((n) =>
    (n.donors ?? []).map((d) => ({ needName: n.name, donor: d })),
  );
  const topDonors = takeRandom(allDonors, 3);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-sm dark:border-slate-700">
      <div className="border-b border-slate-200 bg-gradient-to-r from-teal-700 to-emerald-800 px-6 py-5 text-white dark:border-slate-700">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <HeartHandshake className="h-5 w-5" aria-hidden />
          </span>
          {data.heading}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-teal-50/95">{data.subheading}</p>
      </div>
      <div className="grid gap-8 p-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-600">
            <img
              src="https://www.asterhospitals.in/sites/default/files/styles/webp/public/2023-08/organ-donation.jpg.webp?itok=3TbZWtP1"
              alt="अंगदान — सहायता का संदेश"
              width={192}
              height={192}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          <Link
            href={data.donateHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent bg-transparent px-4 py-3 text-center text-sm font-bold text-accent transition hover:bg-accent/10"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden />
            दान करें
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center justify-between gap-3 text-sm font-bold uppercase tracking-wide text-muted">
              वर्तमान आवश्यकताएँ
            </h3>
            <div className="mt-4 grid gap-3">
              {topNeeds.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-card/80 px-3 py-3 shadow-sm backdrop-blur dark:border-slate-700"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
                    <img
                      src={n.image}
                      alt={n.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-foreground">
                      {n.name}
                    </p>
                    <p className="truncate text-xs font-semibold text-muted">
                      ₹{n.priceStarts || 0}+
                    </p>
                  </div>
                  <Link
                    href="/donate"
                    className="shrink-0 rounded-xl border-2 border-accent px-3 py-2 text-xs font-extrabold text-accent transition hover:bg-accent/10"
                  >
                    दान करें
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Link
                href="/donate"
                className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-extrabold text-accent ring-1 ring-accent/15 transition hover:bg-accent/15"
              >
                सारी आवश्यकताएँ देखें
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
              दानदाता
            </h3>
            <div className="mt-4 grid gap-3">
              {topDonors.length ? (
                topDonors.map((row) => (
                  <div
                    key={`${row.needName}-${row.donor.name}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-card/80 px-3 py-3 shadow-sm backdrop-blur dark:border-slate-700"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
                      <img
                        src={
                          row.donor.photo?.trim()
                            ? row.donor.photo
                            : "/og-image-placeholder.svg"
                        }
                        alt={row.donor.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-foreground">
                        {row.donor.name}
                      </p>
                      <p className="truncate text-xs font-semibold text-muted">
                        {row.needName}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="mt-3 text-sm text-muted">अभी donor list अपडेट हो रही है।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
