import "server-only";
import { readFile, readdir } from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function readJsonFile<T>(filename: string): Promise<T> {
  const full = path.join(dataDir, filename);
  const raw = await readFile(full, "utf-8");
  return JSON.parse(raw) as T;
}

export type ShopRecord = {
  key?: string;
  shopName: string;
  owenerName?: string;
  ownerPhoto?: string;
  shopAddress?: string;
  shopInfo?: string;
  shopPhotos?: string;
  mobileNumber?: string;
  mobileNumber2?: string;
  openTime?: string;
  closeTime?: string;
  closedOn?: string[] | Record<string, string>;
  shopType?: (string | null)[];
  villageName?: string;
  inCharawan?: string;
};

export async function readShops(): Promise<Record<string, ShopRecord>> {
  const merged: Record<string, ShopRecord> = {};
  const shopsDir = path.join(dataDir, "shops");

  try {
    const files = (await readdir(shopsDir))
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const file of files) {
      const chunk = JSON.parse(
        await readFile(path.join(shopsDir, file), "utf-8"),
      ) as Record<string, ShopRecord>;
      Object.assign(merged, chunk);
    }
    if (Object.keys(merged).length > 0) {
      return merged;
    }
  } catch {
    /* fall through */
  }

  return readJsonFile<Record<string, ShopRecord>>("shops.json");
}
