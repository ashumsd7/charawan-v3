export type ShareableNotification = {
  newsTitle?: string;
  shortInfo?: string;
  detailedInfo?: string;
  reporterName?: string;
  timeAgo?: string;
  img1?: string;
  img2?: string;
};

export function buildNotificationShareText(
  n: ShareableNotification,
  siteOrigin: string,
  sourcePath = "/news",
) {
  const base = siteOrigin.replace(/\/$/, "");
  const title = (n.newsTitle || "चरावां अपडेट").trim();
  const short = (n.shortInfo || "").trim();
  const detail = (n.detailedInfo || "").trim();
  const by = (n.reporterName || "चरावां").trim();
  const when = (n.timeAgo || "").trim();
  const img1 = (n.img1 || "").trim();
  const img2 = (n.img2 || "").trim();

  const lines: string[] = [
    "नमस्ते! 🙂",
    "",
    `🗞️ ${title}`,
  ];
  if (short) lines.push(`✉️ ${short}`);
  if (detail) lines.push("", `📝 विवरण: ${detail}`);
  if (img1 || img2) {
    lines.push("");
    if (img1) lines.push(`🖼️ फोटो: ${img1}`);
    if (img2) lines.push(`🖼️ फोटो (2): ${img2}`);
  }
  lines.push("");
  lines.push(`👤 ${by}${when ? ` · ⏳ ${when}` : ""}`);
  lines.push("", `🌐 स्रोत: ${base}${sourcePath}`, "", "धन्यवाद! 😊");
  return lines.join("\n");
}

