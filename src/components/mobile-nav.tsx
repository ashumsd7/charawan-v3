"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GoogleTranslateWidget } from "@/components/google-translate";
import { AnimatePresence, motion } from "framer-motion";

export type MobileNavItem = { href: string; label: string };

export function MobileNavMenu({
  items,
  translateHint,
}: {
  items: MobileNavItem[];
  translateHint: string;
}) {
  const [open, setOpen] = useState(false);
  const safeItems = useMemo(
    () => items.filter((i) => (i.href ?? "").trim() && (i.label ?? "").trim()),
    [items],
  );

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "मेनू बंद करें" : "मेनू खोलें"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur transition hover:bg-white/10"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-nav-overlay"
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="मेनू बंद करें"
              className="absolute inset-0 h-full w-full bg-black/50"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="absolute inset-x-0 top-0 h-full overflow-y-auto bg-slate-950/98 backdrop-blur"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            >
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  मेनू
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  aria-label="बंद करें"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="mx-auto max-w-6xl px-4 pb-8">
                <div className="space-y-2">
                  {safeItems.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    भाषा
                  </p>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                    <GoogleTranslateWidget hint={translateHint} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

