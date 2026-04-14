import type { ShopRecord } from "@/lib/read-data";

/** Firebase Realtime DB export (object keyed by shop id). */
export const CHARAWAN_SHOPS_FIREBASE_URL =
  "https://charwan-shops-default-rtdb.firebaseio.com/charawan-shops.json";

export type ShopWithKey = ShopRecord & { key: string };
