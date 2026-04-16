"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { isAdminAuthenticatedClient } from "@/lib/admin-auth";
import {
  CHARAWAN_DONATIONS_FIREBASE_URL,
  normalizeDonateDbShape,
  stripJson,
  type DonateDbShape,
  type DonationDonor,
  type DonationNeed,
} from "@/lib/donations-firebase";

type Toast = { id: string; type: "success" | "error" | "info"; title: string; body?: string };

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.set("image", file);
  const res = await fetch("/api/upload-image", { method: "POST", body: form });
  const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !json.ok || !json.url) throw new Error(json.error || "Upload failed");
  return json.url;
}

function safeIdFromName(name: string) {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

const EMPTY_DB: DonateDbShape = {
  heading: "दान",
  upiId: "",
  qrImage: "",
  shipTo: { name: "", addressLines: [""], phone: "" },
  screenshotNoteHref: "/contacts",
  screenshotNoteLabel: "सम्पर्क पृष्ठ",
  bodyParagraphs: [],
  needs: [],
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1">
      <p className="text-xs font-extrabold text-muted">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="space-y-1">
      <p className="text-xs font-extrabold text-muted">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}

function UploadUrlField({
  label,
  value,
  onChange,
  busy,
  setBusy,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  busy: boolean;
  setBusy: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-extrabold text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-card/80 px-4 py-3 text-xs font-extrabold text-foreground transition hover:bg-card dark:border-slate-700">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          Upload
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                const url = await uploadImage(file);
                onChange(url);
              } finally {
                setBusy(false);
                e.currentTarget.value = "";
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

export default function ManageDonationsPage() {
  const router = useRouter();
  const [ok] = useState<boolean>(() => isAdminAuthenticatedClient());

  useEffect(() => {
    if (!ok) router.replace("/login");
  }, [ok, router]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 3));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  };

  const [loading, setLoading] = useState(false);
  const [db, setDb] = useState<DonateDbShape>(EMPTY_DB);
  const [query, setQuery] = useState("");

  const fetchDb = useCallback(async () => {
    setLoading(true);
    try {
      const { data: payload } = await axios.get(CHARAWAN_DONATIONS_FIREBASE_URL, {
        timeout: 25_000,
        headers: { Accept: "application/json" },
      });
      setDb(normalizeDonateDbShape(payload) ?? EMPTY_DB);
    } catch {
      pushToast({ type: "error", title: "लोड नहीं हो सका", body: "Firebase से donations नहीं लोड हुआ।" });
      setDb(EMPTY_DB);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDb();
  }, [fetchDb]);

  const needs = useMemo(() => {
    const list = db.needs;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((n) => `${n.name} ${n.id}`.toLowerCase().includes(q));
  }, [db.needs, query]);

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerMobileImage, setBannerMobileImage] = useState("");
  const [heading, setHeading] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [shipName, setShipName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAddr, setShipAddr] = useState("");
  const [screenshotHref, setScreenshotHref] = useState("");
  const [screenshotLabel, setScreenshotLabel] = useState("");
  const [bodyParagraphs, setBodyParagraphs] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [uploadingBannerMobileImage, setUploadingBannerMobileImage] = useState(false);

  const openSettings = () => {
    setBannerTitle(db.banner?.title || "");
    setBannerImage(db.banner?.image || "");
    setBannerMobileImage(db.banner?.mobileImage || "");
    setHeading(db.heading || "");
    setUpiId(db.upiId || "");
    setQrImage(db.qrImage || "");
    setShipName(db.shipTo?.name || "");
    setShipPhone(db.shipTo?.phone || "");
    setShipAddr((db.shipTo?.addressLines || []).join("\n"));
    setScreenshotHref(db.screenshotNoteHref || "/contacts");
    setScreenshotLabel(db.screenshotNoteLabel || "सम्पर्क पृष्ठ");
    setBodyParagraphs((db.bodyParagraphs || []).join("\n\n"));
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    if (settingsBusy) return;
    setSettingsBusy(true);
    const patch = {
      banner: {
        title: bannerTitle.trim(),
        image: bannerImage.trim(),
        mobileImage: bannerMobileImage.trim(),
      },
      heading: heading.trim() || "दान",
      upiId: upiId.trim(),
      qrImage: qrImage.trim(),
      shipTo: {
        name: shipName.trim(),
        phone: shipPhone.trim(),
        addressLines: shipAddr
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
      },
      screenshotNoteHref: screenshotHref.trim() || "/contacts",
      screenshotNoteLabel: screenshotLabel.trim() || "सम्पर्क पृष्ठ",
      bodyParagraphs: bodyParagraphs
        .split(/\n\s*\n/)
        .map((x) => x.trim())
        .filter(Boolean),
    };

    try {
      await axios.patch(CHARAWAN_DONATIONS_FIREBASE_URL, patch, {
        timeout: 25_000,
        headers: { "Content-Type": "application/json" },
      });
      pushToast({ type: "success", title: "सेव हो गया", body: "Donation settings अपडेट हो गया।" });
      setSettingsOpen(false);
      await fetchDb();
    } catch {
      pushToast({ type: "error", title: "सेव नहीं हुआ", body: "Firebase write fail. Rules/URL जाँचें।" });
    } finally {
      setSettingsBusy(false);
    }
  };

  // Need modal state
  const [needOpen, setNeedOpen] = useState(false);
  const [needBusy, setNeedBusy] = useState(false);
  const [needId, setNeedId] = useState("");
  const [needName, setNeedName] = useState("");
  const [needImage, setNeedImage] = useState("");
  const [needDesc, setNeedDesc] = useState("");
  const [needPriceStarts, setNeedPriceStarts] = useState<number>(0);
  const [needBuyLink, setNeedBuyLink] = useState("");
  const [needPaymentQrImage, setNeedPaymentQrImage] = useState("");
  const [needTimesDonated, setNeedTimesDonated] = useState<number>(0);
  const [needDonors, setNeedDonors] = useState<DonationDonor[]>([]);
  const [uploadingNeedImage, setUploadingNeedImage] = useState(false);
  const [uploadingNeedQr, setUploadingNeedQr] = useState(false);

  const openNeed = (n?: DonationNeed) => {
    setNeedId(n?.id || "");
    setNeedName(n?.name || "");
    setNeedImage(n?.image || "");
    setNeedDesc(n?.description || "");
    setNeedPriceStarts(Number.isFinite(n?.priceStarts) ? (n?.priceStarts ?? 0) : 0);
    setNeedBuyLink(n?.buyLink || "");
    setNeedPaymentQrImage(n?.paymentQrImage || "");
    setNeedTimesDonated(Number.isFinite(n?.timesDonated) ? (n?.timesDonated ?? 0) : 0);
    setNeedDonors(Array.isArray(n?.donors) ? n!.donors : []);
    setNeedOpen(true);
  };

  const closeNeed = () => setNeedOpen(false);

  const addDonor = () => {
    setNeedDonors((prev) => [...prev, { name: "", number: "", address: "", photo: "", description: "", thankYouNote: "" }]);
  };

  const updateDonor = (idx: number, patch: Partial<DonationDonor>) => {
    setNeedDonors((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const removeDonor = (idx: number) => setNeedDonors((prev) => prev.filter((_, i) => i !== idx));

  const saveNeed = async () => {
    if (needBusy) return;
    const cleanName = needName.trim();
    const cleanId = (needId.trim() || safeIdFromName(cleanName)).trim();
    if (!cleanName) {
      pushToast({ type: "error", title: "Need name missing", body: "Need name लिखिए।" });
      return;
    }
    if (!cleanId) {
      pushToast({ type: "error", title: "Need id missing", body: "Need id generate नहीं हो पाया।" });
      return;
    }

    setNeedBusy(true);
    const record: DonationNeed = {
      id: cleanId,
      name: cleanName,
      image: needImage.trim(),
      description: needDesc.trim(),
      priceStarts: Number.isFinite(Number(needPriceStarts)) ? Number(needPriceStarts) : 0,
      buyLink: needBuyLink.trim(),
      paymentQrImage: needPaymentQrImage.trim(),
      timesDonated: Number.isFinite(Number(needTimesDonated)) ? Number(needTimesDonated) : 0,
      donors: (needDonors || [])
        .filter((d) => d?.name?.trim())
        .map((d) => ({
          name: d.name.trim(),
          number: (d.number || "").trim(),
          address: (d.address || "").trim(),
          photo: (d.photo || "").trim(),
          description: (d.description || "").trim(),
          thankYouNote: (d.thankYouNote || "").trim(),
        })),
    };

    try {
      const base = stripJson(CHARAWAN_DONATIONS_FIREBASE_URL);
      await axios.put(`${base}/needs/${encodeURIComponent(record.id)}.json`, record, {
        timeout: 25_000,
        headers: { "Content-Type": "application/json" },
      });
      pushToast({ type: "success", title: "सेव हो गया", body: `Need «${record.name}» सेव हो गया।` });
      setNeedOpen(false);
      await fetchDb();
    } catch {
      pushToast({ type: "error", title: "सेव नहीं हुआ", body: "Firebase write fail. Rules/URL जाँचें।" });
    } finally {
      setNeedBusy(false);
    }
  };

  const deleteNeed = async (n: DonationNeed) => {
    const yes = window.confirm(`Delete «${n.name}»? यह वापस नहीं आएगा।`);
    if (!yes) return;
    try {
      const base = stripJson(CHARAWAN_DONATIONS_FIREBASE_URL);
      await axios.delete(`${base}/needs/${encodeURIComponent(n.id)}.json`, { timeout: 25_000 });
      pushToast({ type: "success", title: "डिलीट", body: `Need «${n.name}» हट गया।` });
      await fetchDb();
    } catch {
      pushToast({ type: "error", title: "डिलीट नहीं हुआ", body: "Firebase delete fail." });
    }
  };

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
      <div className="fixed right-4 top-4 z-[95] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-[320px] rounded-2xl border p-3 shadow-lg backdrop-blur ${
              t.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-50"
                : t.type === "error"
                  ? "border-rose-500/30 bg-rose-950/80 text-rose-50"
                  : "border-slate-500/30 bg-slate-950/80 text-slate-50"
            }`}
          >
            <p className="text-sm font-extrabold">{t.title}</p>
            {t.body ? <p className="mt-1 text-xs opacity-90">{t.body}</p> : null}
          </div>
        ))}
      </div>

      {/* Settings modal */}
      {settingsOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-black/65" onClick={() => setSettingsOpen(false)} />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-card/95 shadow-2xl backdrop-blur dark:border-slate-700">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Settings</p>
                <p className="mt-1 text-lg font-extrabold text-foreground">Donation page settings</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-card/80 text-foreground transition hover:bg-card dark:border-slate-700"
                aria-label="बंद करें"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField label="Banner title" value={bannerTitle} onChange={setBannerTitle} />
              </div>
              <UploadUrlField
                label="Banner image URL (desktop)"
                value={bannerImage}
                onChange={setBannerImage}
                busy={uploadingBannerImage}
                setBusy={setUploadingBannerImage}
              />
              <UploadUrlField
                label="Banner image URL (mobile)"
                value={bannerMobileImage}
                onChange={setBannerMobileImage}
                busy={uploadingBannerMobileImage}
                setBusy={setUploadingBannerMobileImage}
              />

              <TextField label="Heading" value={heading} onChange={setHeading} />
              <TextField label="UPI ID" value={upiId} onChange={setUpiId} />

              <div className="md:col-span-2">
                <UploadUrlField
                  label="QR Image URL"
                  value={qrImage}
                  onChange={setQrImage}
                  busy={uploadingQr}
                  setBusy={setUploadingQr}
                />
              </div>

              <TextField label="Ship to name" value={shipName} onChange={setShipName} />
              <TextField label="Ship to phone" value={shipPhone} onChange={setShipPhone} />

              <div className="md:col-span-2">
                <TextAreaField label="Ship to address (one line per line)" value={shipAddr} onChange={setShipAddr} rows={4} />
              </div>

              <TextField label="Screenshot note href" value={screenshotHref} onChange={setScreenshotHref} />
              <TextField label="Screenshot note label" value={screenshotLabel} onChange={setScreenshotLabel} />

              <div className="md:col-span-2">
                <TextAreaField
                  label="Body paragraphs (blank line separates paragraphs)"
                  value={bodyParagraphs}
                  onChange={setBodyParagraphs}
                  rows={8}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-card/80 px-4 py-2 text-xs font-extrabold text-foreground transition hover:bg-card dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={settingsBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {settingsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save settings
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Need modal */}
      {needOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-black/65" onClick={closeNeed} />
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-card/95 shadow-2xl backdrop-blur dark:border-slate-700">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Need</p>
                <p className="mt-1 text-lg font-extrabold text-foreground">{needName || "Donation need"}</p>
              </div>
              <button
                type="button"
                onClick={closeNeed}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-card/80 text-foreground transition hover:bg-card dark:border-slate-700"
                aria-label="बंद करें"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <TextField label="Need id" value={needId} onChange={setNeedId} placeholder="e.g. anti-rabies-vaccine" />
              <TextField label="Need name" value={needName} onChange={setNeedName} />

              <div className="lg:col-span-2">
                <UploadUrlField
                  label="Need image URL"
                  value={needImage}
                  onChange={setNeedImage}
                  busy={uploadingNeedImage}
                  setBusy={setUploadingNeedImage}
                />
              </div>

              <div className="lg:col-span-2">
                <TextAreaField label="Description" value={needDesc} onChange={setNeedDesc} rows={3} />
              </div>

              <label className="space-y-1">
                <p className="text-xs font-extrabold text-muted">Price starts (₹)</p>
                <input
                  type="number"
                  value={needPriceStarts}
                  onChange={(e) => setNeedPriceStarts(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <label className="space-y-1">
                <p className="text-xs font-extrabold text-muted">Times donated</p>
                <input
                  type="number"
                  value={needTimesDonated}
                  onChange={(e) => setNeedTimesDonated(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <div className="lg:col-span-2">
                <TextField label="Buy link" value={needBuyLink} onChange={setNeedBuyLink} />
              </div>

              <div className="lg:col-span-2">
                <UploadUrlField
                  label="Payment QR image URL (optional)"
                  value={needPaymentQrImage}
                  onChange={setNeedPaymentQrImage}
                  busy={uploadingNeedQr}
                  setBusy={setUploadingNeedQr}
                />
              </div>

              <div className="space-y-3 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-foreground">Donors</p>
                  <button
                    type="button"
                    onClick={addDonor}
                    className="inline-flex items-center gap-2 rounded-2xl bg-accent px-3 py-2 text-xs font-extrabold text-accent-foreground transition hover:opacity-95"
                  >
                    <PlusCircle className="h-4 w-4" aria-hidden />
                    Add donor
                  </button>
                </div>

                {needDonors.length ? (
                  <div className="space-y-3">
                    {needDonors.map((d, idx) => (
                      <div
                        key={idx}
                        className="rounded-3xl border border-slate-200 bg-card/80 p-4 shadow-sm backdrop-blur dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-extrabold text-muted">Donor #{idx + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeDonor(idx)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <TextField label="Name" value={d.name || ""} onChange={(v) => updateDonor(idx, { name: v })} />
                          <TextField label="Number" value={d.number || ""} onChange={(v) => updateDonor(idx, { number: v })} />
                          <div className="md:col-span-2">
                            <TextField label="Address" value={d.address || ""} onChange={(v) => updateDonor(idx, { address: v })} />
                          </div>

                          <div className="md:col-span-2">
                            <UploadUrlField
                              label="Photo URL"
                              value={d.photo || ""}
                              onChange={(v) => updateDonor(idx, { photo: v })}
                              busy={false}
                              setBusy={() => {}}
                            />
                            <p className="mt-1 text-[11px] font-semibold text-muted">
                              (Tip: ऊपर Upload button से donor photo भी डाल सकते हैं)
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <TextAreaField
                              label="Thank you note"
                              value={d.thankYouNote || ""}
                              onChange={(v) => updateDonor(idx, { thankYouNote: v })}
                              rows={2}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <TextAreaField
                              label="Description"
                              value={d.description || ""}
                              onChange={(v) => updateDonor(idx, { description: v })}
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-card/85 p-5 text-sm font-semibold text-muted shadow-sm backdrop-blur dark:border-slate-700">
                    अभी कोई donor entry नहीं है।
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                onClick={closeNeed}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-card/80 px-4 py-2 text-xs font-extrabold text-foreground transition hover:bg-card dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveNeed()}
                disabled={needBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {needBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save need
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Admin</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Manage donations</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-card/80 px-4 py-2 text-xs font-extrabold text-foreground shadow-sm backdrop-blur transition hover:bg-card dark:border-slate-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Admin
            </Link>
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-card/80 px-4 py-2 text-xs font-extrabold text-foreground shadow-sm backdrop-blur transition hover:bg-card dark:border-slate-700"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit page settings
            </button>
            <button
              type="button"
              onClick={() => openNeed(undefined)}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground shadow-sm transition hover:opacity-95"
            >
              <PlusCircle className="h-4 w-4" aria-hidden />
              Add need
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-card/85 p-4 shadow-sm backdrop-blur dark:border-slate-700">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <Search className="h-4 w-4 text-muted" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name/id…"
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => void fetchDb()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-card/80 px-4 py-2 text-xs font-extrabold text-foreground transition hover:bg-card dark:border-slate-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-card/85 shadow-sm backdrop-blur dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <tr>
                  <th className="px-4 py-3 text-xs font-extrabold">Image</th>
                  <th className="px-4 py-3 text-xs font-extrabold">Name</th>
                  <th className="px-4 py-3 text-xs font-extrabold">ID</th>
                  <th className="px-4 py-3 text-xs font-extrabold">₹</th>
                  <th className="px-4 py-3 text-xs font-extrabold">Donors</th>
                  <th className="px-4 py-3 text-xs font-extrabold">Times</th>
                  <th className="px-4 py-3 text-xs font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {needs.map((n) => (
                  <tr key={n.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={n.image?.trim() ? n.image : "/og-image-placeholder.svg"}
                          alt={n.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-foreground">{n.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{n.id}</td>
                    <td className="px-4 py-3 font-extrabold text-foreground">₹{n.priceStarts || 0}</td>
                    <td className="px-4 py-3 font-semibold text-muted">{n.donors?.length || 0}</td>
                    <td className="px-4 py-3 font-semibold text-muted">{n.timesDonated || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openNeed(n)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-card/80 px-3 py-2 text-xs font-extrabold text-foreground transition hover:bg-card dark:border-slate-700"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteNeed(n)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!needs.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm font-semibold text-muted">
                      कोई donation need नहीं मिला।
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

