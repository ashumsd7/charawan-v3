import Image from "next/image";
import { CopyPhoneButton } from "@/components/copy-phone-button";
import { PhoneCall, Users } from "lucide-react";

export type Representative = {
  name: string;
  role: string;
  tenure?: string;
  phone?: string;
  photo: string;
};

function isDialable(tel?: string) {
  if (!tel || !tel.startsWith("tel:")) return false;
  const n = tel.replace("tel:", "").replace(/\s/g, "");
  return n.length >= 8;
}

function digitsFromTel(tel?: string) {
  if (!tel || !tel.startsWith("tel:")) return "";
  return tel.replace(/\D/g, "");
}

export function CharawanRepresentatives({
  title = "चरावां के प्रतिनिधि",
  people,
}: {
  title?: string;
  people: Representative[];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-md ring-1 ring-slate-900/5 dark:border-slate-700 dark:ring-white/10">
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-teal-900 to-emerald-900 px-6 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-emerald-300/10 blur-2xl" />
        </div>
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-teal-100/80">
            <Users className="h-4 w-4" aria-hidden />
            ग्राम प्रशासन
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-teal-50/90">
            चरावां के वर्तमान पदाधिकारी — त्वरित सम्पर्क हेतु कॉल करें या नंबर कॉपी करें।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-200 dark:divide-slate-700 md:grid-cols-3 md:divide-x md:divide-y-0">
        {people.map((p) => {
          const canCall = isDialable(p.phone);
          const copy = digitsFromTel(p.phone);
          return (
            <div key={p.name + p.role} className="flex flex-col items-center gap-4 px-5 py-8 text-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-teal-400/40 via-amber-200/30 to-transparent blur-md" />
                <Image
                  src={p.photo}
                  alt={`${p.name} photo`}
                  width={168}
                  height={168}
                  className="relative rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-teal-700/25 dark:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {p.name}
                </h3>
                <p className="text-sm font-semibold text-accent">{p.role}</p>
                {p.tenure ? (
                  <p className="text-xs font-medium text-muted">{p.tenure}</p>
                ) : null}
              </div>

              <div
                className={`grid w-full max-w-[280px] gap-2 ${copy ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
              >
                {canCall ? (
                  <a
                    href={p.phone}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-extrabold text-accent-foreground shadow-sm transition hover:opacity-95"
                  >
                    <PhoneCall className="h-4 w-4" aria-hidden />
                    कॉल करें
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    कॉल उपलब्ध नहीं
                  </span>
                )}
                {copy ? (
                  <CopyPhoneButton
                    textToCopy={copy}
                    label="नंबर कॉपी"
                    className="!py-2.5 !text-sm"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
