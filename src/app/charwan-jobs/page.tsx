import type { Metadata } from "next";
import Link from "next/link";
import { IndianRupee, Mic, MessageCircle } from "lucide-react";
import { NEW_TAB_FALLBACK_HREF, WHATSAPP_CONTACT_HREF } from "@/lib/constants";

export const metadata: Metadata = {
  title: "चरावां जॉब्स",
  description: "ग्राम न्यूज़ रिपोर्टर — पार्ट टाइम काम और कमाई।",
};

export default function CharwanJobsPage() {
  const whatsappHref = WHATSAPP_CONTACT_HREF || NEW_TAB_FALLBACK_HREF;

  return (
    <div className="village-page-bg">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:space-y-10 sm:py-12">
        <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-extrabold text-accent ring-1 ring-accent/20">
                  <Mic className="h-4 w-4" aria-hidden />
                  ग्राम न्यूज़ रिपोर्टर
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200">
                  <IndianRupee className="h-4 w-4" aria-hidden />
                  ₹3000 तक/माह
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                अब आपका गाँव, आपकी खबरें!
              </h1>
              <p className="mt-2 text-base leading-relaxed text-muted">
                हमें आपके गाँव के पार्ट टाइम रिपोर्टर की तलाश है। काम करें और महीने के लिए ₹3000 तक कमाएँ!
              </p>
            </div>

            <Link
              href="/news"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-bold text-foreground transition hover:bg-white/80 dark:border-slate-700 dark:bg-slate-900/40"
            >
              ← समाचार देखें
            </Link>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90 sm:text-lg">
            अब आप अपने गाँव के खबरों को पोस्ट करें और पार्ट टाइम पैसे कमाएँ। हमें गर्व होगा आपके साथ काम करने पर।
          </p>

          <h2 className="text-lg font-extrabold text-foreground">आपका पार्ट टाइम काम क्या होगा?</h2>
          <p className="whitespace-pre-line text-base leading-relaxed text-muted">
            आपको करना होगा दिन के 5 से 10 WhatsApp/instagram/facebook/twitter पोस्ट, जिसमें गाँव के रिपोर्टर जैसा काम करना होगा।
            कुछ फोटो और शब्दों के माध्यम से आपको दिन में 5 से 10 पोस्ट करने होंगे। प्रति पोस्ट से आप 5 से 10 रुपये कमा सकते हैं।
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-accent/10 p-4 ring-1 ring-accent/15">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">पदों की संख्या</p>
              <p className="mt-1 text-xl font-extrabold text-foreground">1</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/15">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">कमाई</p>
              <p className="mt-1 text-xl font-extrabold text-foreground">₹3000 तक / माह</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-sm font-bold text-foreground">संपर्क करें:</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp पर बात करें
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

