import type { Metadata } from "next";
import axios from "axios";
import { ShopsDirectory } from "@/components/shops/shops-directory";
import { CHARAWAN_SHOPS_FIREBASE_URL, type ShopWithKey } from "@/lib/shops-firebase";
import { readJsonFile } from "@/lib/read-data";
import type { ShopRecord } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "दुकान खोजें",
  description: "चरावां और आसपास की दुकानें व सेवाएँ — फोन, पता और विवरण।",
};

export const revalidate = 300;

function normalizeShops(payload: unknown): ShopWithKey[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const entries = Object.entries(payload as Record<string, ShopRecord>);
  const list = entries.map(([key, value]) => ({
    ...value,
    key: value.key ?? key,
  }));
  return list.sort((a, b) =>
    (a.shopName || "").localeCompare(b.shopName || "", "hi", { sensitivity: "base" }),
  );
}

type SiteJson = { domain: string };

export default async function ShopsPage() {
  let shops: ShopWithKey[] = [];
  let fetchError: string | undefined;

  const site = await readJsonFile<SiteJson>("site.json").catch(() => ({ domain: "charawan.netlify.app" }));
  const siteOrigin = `https://${site.domain}`;

  try {
    const { data } = await axios.get<Record<string, ShopRecord>>(CHARAWAN_SHOPS_FIREBASE_URL, {
      timeout: 25_000,
      headers: { Accept: "application/json" },
    });
    shops = normalizeShops(data);
  } catch {
    fetchError =
      "दुकान सूची इस समय लोड नहीं हो सकी। इंटरनेट जाँचें या कुछ देर बाद पुनः प्रयास करें।";
  }

  return (
    <div className="village-page-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-8 text-center sm:pt-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">दुकान खोजें</h1>
      </div>
      <div className="mt-6">
        <ShopsDirectory shops={shops} fetchError={fetchError} siteOrigin={siteOrigin} />
      </div>
    </div>
  );
}
