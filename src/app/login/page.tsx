"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock } from "lucide-react";
import {
  getExpectedAdminPasscode,
  isAdminAuthenticatedClient,
  persistAdminPasscode,
} from "@/lib/admin-auth";

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminAuthenticatedClient()) {
      router.replace("/admin");
    }
  }, [router]);

  const onLogin = () => {
    const next = passcode.trim();
    if (!next) {
      setError("कृपया पासकोड दर्ज करें।");
      return;
    }
    const expected = getExpectedAdminPasscode();
    if (!expected) {
      setError("पासकोड सर्वर पर सेट नहीं है (NEXT_PUBLIC_PASSCODE)।");
      return;
    }
    if (next !== expected) {
      setError("पासकोड गलत है।");
      return;
    }
    try {
      persistAdminPasscode(next);
      setError(null);
      router.push("/admin");
    } catch {
      setError("लॉगिन अभी उपलब्ध नहीं है।");
    }
  };

  return (
    <div className="village-page-bg min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/25">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">लॉगिन</h1>
          </div>

          <p className="mt-2 text-sm text-muted">एडमिन पैनल के लिए पासकोड दर्ज करें।</p>

          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">पासकोड</span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 shadow-sm ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900/50 dark:ring-white/10">
                <KeyRound className="h-5 w-5 text-slate-400" aria-hidden />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onLogin();
                  }}
                  placeholder="••••••"
                  className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                  autoComplete="off"
                />
              </div>
            </label>

            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onLogin}
              className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              लॉगिन
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

