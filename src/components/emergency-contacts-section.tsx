import Link from "next/link";
import { CopyPhoneButton } from "@/components/copy-phone-button";
import { Flame, Mail, PhoneCall, ShieldAlert } from "lucide-react";

export type EmergencyCard = {
  id: string;
  categoryHi: string;
  name: string;
  designation: string;
  phoneDisplay: string;
  tel: string;
  copyDigits: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export type EmergencyHelpline = {
  id: string;
  label: string;
  number: string;
  tel: string;
};

export function EmergencyContactsSection({
  sectionId,
  heading,
  subheading,
  cards,
  helplinesHeading,
  helplines,
}: {
  sectionId: string;
  heading: string;
  subheading: string;
  cards: EmergencyCard[];
  helplinesHeading: string;
  helplines: EmergencyHelpline[];
}) {
  return (
    <section
      id={sectionId}
      className="scroll-mt-28 rounded-3xl border border-slate-200 bg-card/95 shadow-sm backdrop-blur dark:border-slate-700"
    >
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:text-red-400">
            <ShieldAlert className="h-5 w-5" aria-hidden />
          </span>
          {heading}
        </h2>
        <p className="mt-2 text-sm text-muted">{subheading}</p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const tel = c.tel ?? "";
            const isTel = tel.startsWith("tel:");
            const dial = tel.replace(/^tel:/i, "").replace(/\D/g, "");
            const canCall = isTel && dial.length >= 3;
            const isMail = tel.startsWith("mailto:");
            const hasCopy = Boolean(c.copyDigits?.trim());
            return (
              <article
                key={c.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-950/40"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  {c.categoryHi}
                </p>
                <h3 className="mt-1 text-lg font-bold text-foreground">{c.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{c.designation}</p>
                <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                  {c.phoneDisplay}
                </p>
                <div
                  className={`mt-3 grid gap-2 ${hasCopy && (canCall || isMail || c.ctaHref) ? "sm:grid-cols-2" : "grid-cols-1"}`}
                >
                  {canCall ? (
                    <a
                      href={tel}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-center text-xs font-bold text-accent-foreground shadow-sm transition hover:opacity-95"
                    >
                      <PhoneCall className="h-4 w-4" aria-hidden />
                      कॉल करें
                    </a>
                  ) : isMail ? (
                    <a
                      href={tel}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-center text-xs font-bold text-accent-foreground shadow-sm transition hover:opacity-95"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      ईमेल करें
                    </a>
                  ) : c.ctaHref ? (
                    <Link
                      href={c.ctaHref}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-center text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      <PhoneCall className="h-4 w-4" aria-hidden />
                      {c.ctaLabel ?? "खोलें"}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      कॉल उपलब्ध नहीं
                    </span>
                  )}
                  {hasCopy ? <CopyPhoneButton textToCopy={c.copyDigits} /> : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 dark:border-slate-600 dark:bg-slate-900/30">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Flame className="h-4 w-4 text-orange-600" aria-hidden />
            {helplinesHeading}
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {helplines.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-muted">{h.label}</p>
                  <p className="font-mono text-base font-bold text-foreground">{h.number}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <a
                    href={h.tel}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-accent px-2 py-1 text-center text-[10px] font-bold text-accent-foreground"
                  >
                    <PhoneCall className="h-3 w-3" aria-hidden />
                    कॉल
                  </a>
                  <CopyPhoneButton textToCopy={h.number} label="कॉपी" className="!px-2 !py-1 !text-[10px]" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
