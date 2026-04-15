"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  HandHeart,
  Image as ImageIcon,
  Link2,
  ShieldAlert,
  Users,
} from "lucide-react";

const PASSCODE_FLAG_KEY = "charawan_passcode";

type AdminCard = {
  title: string;
  icon: React.ReactNode;
  href?: string;
  enabled: boolean;
  bgClass: string;
  ringClass: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [ok] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PASSCODE_FLAG_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!ok) router.replace("/login");
  }, [ok, router]);

  const cards = useMemo<AdminCard[]>(
    () => [
      {
        title: "Manage Contacts",
        icon: <Users className="h-5 w-5" aria-hidden />,
        href: "/manage-contacts",
        enabled: true,
        bgClass: "bg-sky-500/10 text-sky-700 dark:text-sky-200",
        ringClass: "ring-sky-500/20",
      },
      {
        title: "Manage Gallery",
        icon: <ImageIcon className="h-5 w-5" aria-hidden />,
        enabled: false,
        bgClass: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200",
        ringClass: "ring-fuchsia-500/20",
      },
      {
        title: "Notifications",
        icon: <Bell className="h-5 w-5" aria-hidden />,
        href: "/manage-notifications",
        enabled: true,
        bgClass: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
        ringClass: "ring-amber-500/20",
      },
      {
        title: "Manage Links",
        icon: <Link2 className="h-5 w-5" aria-hidden />,
        enabled: false,
        bgClass: "bg-teal-500/10 text-teal-800 dark:text-teal-200",
        ringClass: "ring-teal-500/20",
      },
      {
        title: "Manage Donations",
        icon: <HandHeart className="h-5 w-5" aria-hidden />,
        enabled: false,
        bgClass: "bg-rose-500/10 text-rose-800 dark:text-rose-200",
        ringClass: "ring-rose-500/20",
      },
      {
        title: "Manage Emergency Contacts",
        icon: <ShieldAlert className="h-5 w-5" aria-hidden />,
        enabled: false,
        bgClass: "bg-red-500/10 text-red-800 dark:text-red-200",
        ringClass: "ring-red-500/20",
      },
    ],
    [],
  );

  if (!ok) {
    return (
      <div className="village-page-bg min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700">
            <p className="text-sm font-semibold text-muted">कृपया लॉगिन करें…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="village-page-bg min-h-screen">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:py-12">
        <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Admin</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            आपका स्वागत है , Admin
          </h1>
          <p className="mt-2 text-sm text-muted">यह पैनल अभी पासकोड-आधारित है।</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const className = `group relative flex items-start gap-3 rounded-3xl border border-slate-200 bg-card/90 p-5 shadow-sm backdrop-blur transition hover:shadow-md dark:border-slate-700 ${
              c.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-55"
            }`;

            const body = (
              <>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${c.bgClass} ${c.ringClass}`}
                >
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-foreground">{c.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {c.enabled ? "खोलें" : "जल्द उपलब्ध होगा"}
                  </p>
                </div>
              </>
            );

            return c.enabled && c.href ? (
              <Link key={c.title} href={c.href} className={className}>
                {body}
              </Link>
            ) : (
              <div key={c.title} className={className} role="button" aria-disabled>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

