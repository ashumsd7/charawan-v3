import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export function SupportCricket({
  clubTitle,
  body,
  ctaHref,
  ctaLabel,
}: {
  clubTitle: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-700 ring-1 ring-amber-400/25 dark:text-amber-300">
          <Trophy className="h-5 w-5" aria-hidden />
        </span>
        {clubTitle}
      </h2>
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-accent/12 via-card to-card p-6 shadow-sm dark:border-slate-700">
        <p className="text-sm leading-relaxed text-muted">{body}</p>
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition hover:opacity-95"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
