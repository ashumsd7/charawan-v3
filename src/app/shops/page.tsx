import type { Metadata } from "next";
import axios from "axios";
import { ShopsDirectory } from "@/components/shops/shops-directory";
import { CHARAWAN_SHOPS_FIREBASE_URL, type ShopWithKey } from "@/lib/shops-firebase";
import { readJsonFile } from "@/lib/read-data";
import type { ShopRecord } from "@/lib/read-data";

export const metadata: Metadata = {
  title: "संपर्क सूची",
  description: "आस-पास के संपर्क ढूँढें — चरावां वेबसाइट पर दुकान, सेवा, फोन व पता।",
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

  const site = await readJsonFile<SiteJson>("site.json").catch(() => ({ domain: "charawan.in" }));
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
      <ShopsDirectory shops={shops} fetchError={fetchError} siteOrigin={siteOrigin} />
    </div>
  );
}
