"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Phone,
  PlusCircle,
  Store,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { CHARAWAN_SHOPS_FIREBASE_URL } from "@/lib/shops-firebase";

const PASSCODE_FLAG_KEY = "charawan_passcode";

type Toast = { id: string; type: "success" | "error" | "info"; title: string; body?: string };

const DAYS = ["सोमवार", "मंगलवार", "बुधवार", "वृहस्पतिवार", "शुक्रवार", "शनिवार", "रविवार"] as const;

const FILTERS: { value: string; title: string }[] = [
  { value: "kirana", title: "किराना" },
  { value: "medical", title: "मेडिकल" },
  { value: "doctor", title: "डॉक्टर" },
  { value: "hospital", title: "अस्पताल" },
  { value: "pathology", title: "पैथोलॉजी" },
  { value: "electrician", title: "इलेक्ट्रीशियन" },
  { value: "plumber", title: "प्लंबर" },
  { value: "mobile", title: "मोबाइल/रिचार्ज" },
  { value: "hardware", title: "हार्डवेयर" },
  { value: "tailor", title: "दर्जी" },
  { value: "salon", title: "सैलून" },
  { value: "restaurant", title: "रेस्टोरेंट" },
  { value: "milk", title: "दूध/डेयरी" },
  { value: "other", title: "अन्य" },
];

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

function isValidIndianMobile(s: string) {
  const d = onlyDigits(s);
  return d.length === 10;
}

function telFromMobile(s: string) {
  const d = onlyDigits(s);
  return d.length ? `tel:+91${d}` : "";
}

export default function ManageContactsPage() {
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

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  };

  const [showDialog, setShowDialog] = useState(false);
  const [selectedShopType, setSelectedShopType] = useState<string>("");
  const [shopName, setShopName] = useState("");
  const [owenerName, setOwenerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileNumber2, setMobileNumber2] = useState("");
  const [shopOpenAt, setShopOpenAt] = useState("");
  const [shopClosedAt, setShopClosedAt] = useState("");
  const [closedOn, setClosedOn] = useState<string[]>([]);
  const [shopDetails, setShopDetails] = useState("");
  const [inCharawan, setInCharawan] = useState<"" | "charawan" | "outOfCharawan">("");
  const [villageName, setVillageName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [ownerPhoto, setOwnerPhoto] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const cleanShopName = shopName.trim();
  const cleanOwner = owenerName.trim();
  const cleanVillageName = villageName.trim();
  const cleanAddress = shopAddress.trim();
  const cleanDetails = shopDetails.trim();

  const previewBadge = useMemo(() => cleanShopName || "आपकी दुकान/सेवा", [cleanShopName]);

  const resetForm = () => {
    setShowDialog(false);
    setSelectedShopType("");
    setShopName("");
    setOwenerName("");
    setMobileNumber("");
    setMobileNumber2("");
    setShopOpenAt("");
    setShopClosedAt("");
    setClosedOn([]);
    setShopDetails("");
    setInCharawan("");
    setVillageName("");
    setShopAddress("");
    setOwnerPhoto("");
    setIsUploading(false);
    setIsDisabled(false);
  };

  const validate = () => {
    if (!selectedShopType) {
      pushToast({
        type: "error",
        title: "एंट्री #1",
        body: "कृपया दुकान/सर्विस का प्रकार चुनें।",
      });
      return false;
    }
    if (!cleanShopName) {
      pushToast({ type: "error", title: "एंट्री #2", body: "दुकान/सर्विस का नाम लिखिए।" });
      return false;
    }
    if (!isValidIndianMobile(mobileNumber)) {
      pushToast({ type: "error", title: "एंट्री #4", body: "मोबाइल नंबर सही नहीं है (10 अंक)।" });
      return false;
    }
    if (mobileNumber2.trim() && !isValidIndianMobile(mobileNumber2)) {
      pushToast({ type: "error", title: "एंट्री #5", body: "दूसरा मोबाइल नंबर सही नहीं है (10 अंक)।" });
      return false;
    }
    if (inCharawan === "outOfCharawan" && !cleanVillageName) {
      pushToast({ type: "error", title: "एंट्री #10.1", body: "अपने गाँव का नाम लिखिए।" });
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (isDisabled) return;
    if (!validate()) return;
    setIsDisabled(true);

    const payload = {
      shopName: cleanShopName,
      owenerName: cleanOwner || undefined,
      shopType: [selectedShopType],
      mobileNumber: telFromMobile(mobileNumber),
      mobileNumber2: mobileNumber2.trim() ? telFromMobile(mobileNumber2) : "",
      openTime: shopOpenAt || "",
      closeTime: shopClosedAt || "",
      closedOn: closedOn.length ? closedOn : "",
      shopInfo: cleanDetails || "",
      shopAddress: cleanAddress || "",
      shopPhotos: null,
      ownerPhoto: ownerPhoto || "",
      inCharawan: inCharawan || "",
      villageName: inCharawan === "charawan" ? "चरावां" : cleanVillageName || "",
    };

    try {
      await axios.post(CHARAWAN_SHOPS_FIREBASE_URL, payload, {
        timeout: 25_000,
        headers: { "Content-Type": "application/json" },
      });
      setShowDialog(true);
      pushToast({
        type: "success",
        title: "सफलतापूर्वक सेव हो गया",
        body: `«${cleanShopName}» को जोड़ दिया गया है।`,
      });
    } catch {
      pushToast({
        type: "error",
        title: "सेव नहीं हो सका",
        body: "सर्वर/इंटरनेट समस्या हो सकती है। थोड़ी देर बाद पुनः प्रयास करें।",
      });
    } finally {
      setIsDisabled(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onPickImage = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axios.post<{ ok: boolean; url?: string; error?: string }>(
        "/api/upload-image",
        fd,
        { timeout: 60_000 },
      );
      if (!data.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      setOwnerPhoto(data.url);
      pushToast({ type: "success", title: "फोटो अपलोड हो गई", body: "अब जानकारी सेव कर सकते हैं।" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "अपलोड नहीं हो सका";
      pushToast({ type: "error", title: "अपलोड विफल", body: msg });
    } finally {
      setIsUploading(false);
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
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Admin पर वापस
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 p-6 shadow-xl dark:border-slate-700 sm:p-8">
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_10%,#22c55e33,transparent_55%),radial-gradient(circle_at_90%_30%,#0ea5e933,transparent_55%)]" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Admin</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              अपने आस पास की दुकानें जोड़े
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              सही जानकारी भरें — इससे लोगों को दुकान/सेवा ढूँढने में आसानी होगी।
            </p>
          </div>
        </div>

        {/* Toasts */}
        <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
                t.type === "success"
                  ? "border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-50"
                  : t.type === "error"
                    ? "border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-900/40 dark:bg-rose-950/35 dark:text-rose-50"
                    : "border-slate-200 bg-white/90 text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              }`}
            >
              <div className="flex items-start gap-2">
                {t.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden />
                ) : null}
                <div className="min-w-0">
                  <p className="text-sm font-extrabold">{t.title}</p>
                  {t.body ? <p className="mt-0.5 text-xs opacity-90">{t.body}</p> : null}
                </div>
                <button
                  type="button"
                  className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/5 bg-black/5 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                  onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
                  aria-label="बंद करें"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showDialog ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/25 sm:p-8">
            <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-rose-700 ring-1 ring-rose-200 dark:bg-slate-900/50 dark:text-rose-200 dark:ring-rose-900/40">
                <Store className="h-4 w-4" aria-hidden />
                {previewBadge}
              </span>{" "}
              को सफलता पूर्वक <span className="font-black text-rose-600">चरावां की वेबसाइट</span> पर जोड़ दिया गया है।
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <PlusCircle className="h-4 w-4" aria-hidden />
              एक और जोड़ें
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-card/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 sm:p-8">
            <label className="block text-sm font-extrabold text-foreground">
              <span className="text-rose-600">*</span> #1. दुकान / सर्विस का प्रकार चुनिये
            </label>
            <p className="mt-1 text-xs text-muted">
              एक समय में <span className="font-bold text-foreground">एक ही</span> प्रकार चुनें।
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {FILTERS.map((f) => (
                <label
                  key={f.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-white dark:hover:bg-slate-900 ${
                    selectedShopType === f.value
                      ? "border-teal-500/60 bg-teal-50/70 text-teal-950 ring-2 ring-teal-500/20 dark:border-teal-500/40 dark:bg-teal-950/25 dark:text-teal-50"
                      : "border-slate-200 bg-white/60 text-foreground dark:border-slate-700 dark:bg-slate-900/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="shopType"
                    value={f.value}
                    checked={selectedShopType === f.value}
                    onChange={() => setSelectedShopType(f.value)}
                    className="h-4 w-4 accent-teal-600"
                  />
                  <span className="truncate">{f.title}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-extrabold text-foreground">
                  <span className="text-rose-600">*</span> #2. दुकान / सर्विस का नाम
                </label>
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  maxLength={40}
                  placeholder="अपने सर्विस या दुकान का नाम लिखिए"
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">#3. मालिक का नाम</label>
                <input
                  value={owenerName}
                  onChange={(e) => setOwenerName(e.target.value)}
                  maxLength={40}
                  placeholder="दुकान मालिक का नाम लिखिए"
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">
                  <span className="text-rose-600">*</span> #4. मोबाइल नंबर
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    inputMode="numeric"
                    placeholder="मोबाइल नंबर लिखिए"
                    className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">#5. मोबाइल नंबर (दूसरा)</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    value={mobileNumber2}
                    onChange={(e) => setMobileNumber2(e.target.value)}
                    inputMode="numeric"
                    placeholder="दूसरा मोबाइल नंबर लिखिए"
                    className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">#6. खुलने का समय</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <Clock className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    type="time"
                    value={shopOpenAt}
                    onChange={(e) => setShopOpenAt(e.target.value)}
                    className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">#7. बंद होने का समय</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <Clock className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    type="time"
                    value={shopClosedAt}
                    onChange={(e) => setShopClosedAt(e.target.value)}
                    className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-extrabold text-foreground">
                  #8. जिस दिन दुकान बंद रहती है (वैकल्पिक)
                </label>
                <p className="mt-1 text-xs text-muted">
                  अगर हर दिन खुली रहती है तो कुछ न चुनें।
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DAYS.map((d) => (
                    <label
                      key={d}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 text-xs font-semibold text-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
                    >
                      <input
                        type="checkbox"
                        checked={closedOn.includes(d)}
                        onChange={(e) => {
                          setClosedOn((prev) =>
                            e.target.checked ? [...prev, d] : prev.filter((x) => x !== d),
                          );
                        }}
                        className="h-4 w-4 accent-teal-600"
                      />
                      <span className="truncate">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">
                  #9. दुकान/सर्विस के बारे में
                </label>
                <textarea
                  value={shopDetails}
                  onChange={(e) => setShopDetails(e.target.value)}
                  rows={6}
                  placeholder="यहाँ लिखें कि आप किस तरह की सर्विस देते हैं..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-extrabold text-foreground">
                  #10. आपकी दुकान/सर्विस किस गाँव में है?
                </label>
                <div className="mt-3 space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-3 py-3 text-sm font-semibold text-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <input
                      type="radio"
                      name="inCharawan"
                      value="charawan"
                      checked={inCharawan === "charawan"}
                      onChange={() => setInCharawan("charawan")}
                      className="h-4 w-4 accent-teal-600"
                    />
                    <span className="font-bold text-accent">चरावां में है</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-3 py-3 text-sm font-semibold text-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <input
                      type="radio"
                      name="inCharawan"
                      value="outOfCharawan"
                      checked={inCharawan === "outOfCharawan"}
                      onChange={() => setInCharawan("outOfCharawan")}
                      className="h-4 w-4 accent-teal-600"
                    />
                    <span className="font-bold text-accent">चरावां से बाहर है</span>
                  </label>
                </div>

                {inCharawan === "outOfCharawan" ? (
                  <div className="mt-3">
                    <label className="text-sm font-extrabold text-foreground">
                      <span className="text-rose-600">*</span> #10.1 अपने गाँव का नाम
                    </label>
                    <input
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      maxLength={20}
                      placeholder="गाँव का नाम"
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900/40"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-extrabold text-foreground">#11. पूरा पता</label>
                <div className="mt-2 flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" aria-hidden />
                  <textarea
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    rows={6}
                    placeholder="पूरा पता/लैंडमार्क लिखिए"
                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <Tag className="h-4 w-4 text-accent" aria-hidden />
                  #13. फोटो/कार्ड (वैकल्पिक)
                </p>
                <p className="mt-1 text-xs text-muted">
                  PNG/JPEG अपलोड करें — फोटो सर्वर से ImgBB पर अपलोड होगी और लिंक सेव होगा।
                </p>

                <div className="mt-3 flex flex-col gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-extrabold text-foreground shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-900">
                    <UploadCloud className="h-4 w-4 text-slate-500" aria-hidden />
                    {isUploading ? "अपलोड हो रहा है…" : "फोटो चुनें"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        void onPickImage(f);
                      }}
                    />
                  </label>

                  {isUploading ? (
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      कृपया इंतज़ार करिये…
                    </div>
                  ) : null}

                  {ownerPhoto ? (
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ownerPhoto}
                        alt="पूर्वावलोकन"
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-full border border-slate-200 object-cover shadow-sm dark:border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-rose-700 dark:text-rose-200">
                          फोटो कुछ ऐसी दिखाई देगी। अगर सही नहीं है तो फिर से अपलोड करें।
                        </p>
                        <button
                          type="button"
                          onClick={() => setOwnerPhoto("")}
                          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-foreground transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          हटाएँ
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs font-bold text-muted">या लिंक पेस्ट करें (optional)</p>
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                      <UploadCloud className="h-4 w-4 text-slate-400" aria-hidden />
                      <input
                        value={ownerPhoto}
                        onChange={(e) => setOwnerPhoto(e.target.value)}
                        placeholder="https://..."
                        className="h-11 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isDisabled || isUploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDisabled || isUploading ? "कृपया इंतज़ार करिये" : "जानकारी सेव करें"}
                </button>
                 
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

