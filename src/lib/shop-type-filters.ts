import shopTypeFiltersJson from "../../data/shop-type-filters.json";

export type ShopTypeFilter = { title: string; value: string };

/** Categories only (no "all"). Loaded from `data/shop-type-filters.json`. */
export const SHOP_TYPE_FILTERS: ShopTypeFilter[] = shopTypeFiltersJson;

const titleByValue = new Map(SHOP_TYPE_FILTERS.map((f) => [f.value, f.title]));

/** Older `shopType` values from Firebase → current canonical `value`. */
const LEGACY_SHOP_TYPE_ALIASES: Record<string, string> = {
  kirana: "generalStore",
  medical: "medicalStore",
  doctor: "doctors",
  pathology: "medicalStore",
  electrician: "homeElectronic",
  mobile: "mobileStore",
  hardware: "machineryStore",
  salon: "barber",
  restaurant: "fastfood",
  other: "others",
};

export function canonicalShopTypeValue(value: string): string {
  const v = value.trim();
  if (!v) return v;
  return LEGACY_SHOP_TYPE_ALIASES[v] ?? v;
}

export function getShopTypeTitle(value: string): string {
  const v = value.trim();
  if (!v) return "—";
  const key = canonicalShopTypeValue(v);
  return titleByValue.get(key) ?? titleByValue.get(v) ?? v;
}
