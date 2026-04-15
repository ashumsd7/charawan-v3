import type { ShopWithKey } from "@/lib/shops-firebase";

function telDigits(tel?: string) {
  if (!tel || !tel.startsWith("tel:")) return "";
  return tel.replace(/^tel:\+?/, "").replace(/\D/g, "");
}

/** Hindi message copied when user taps “शेयर” on a shop card. */
export function buildShopShareMessage(data: ShopWithKey, siteOrigin: string): string {
  const base = siteOrigin.replace(/\/$/, "");
  const name = (data.shopName || "यह संपर्क").trim();
  const lines: string[] = [
    "नमस्ते! 🙂",
    "",
    `👋 Hello! यहाँ «${name}» की संपर्क जानकारी है।`,
    "",
    "📌 यह नंबर/जानकारी मुझे Charawan वेबसाइट से मिली है।",
  ];
  if (data.owenerName?.trim()) {
    lines.push(`👤 मालिक: ${data.owenerName.trim()}`);
  }
  if (data.shopAddress?.trim()) {
    lines.push(`📍 पता: ${data.shopAddress.trim()}`);
  }
  const p1 = telDigits(data.mobileNumber);
  const p2 = telDigits(data.mobileNumber2);
  if (p1) lines.push(`📞 फोन: ${p1}`);
  if (p2 && p2 !== p1) lines.push(`📞 फोन (दूसरा): ${p2}`);
  lines.push("", `🌐 वेबसाइट: ${base}/shops`, "", "धन्यवाद! 😊");
  return lines.join("\n");
}
