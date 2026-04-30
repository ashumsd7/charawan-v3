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
  const title = (n.newsTitle || "चरावां अपडेट").trim();
  const short = (n.shortInfo || "").trim();
  const detail = (n.detailedInfo || "").trim();
  const by = (n.reporterName || "चरावां").trim();
  const when = (n.timeAgo || "").trim();
  const img1 = (n.img1 || "").trim();
  const img2 = (n.img2 || "").trim();

  const lines: string[] = [
    "🗞️ चरावां समाचार",
    `${title}`,
  ];
  if (img1) lines.push("", `🖼️ फोटो: ${img1}`);
  if (short) lines.push(`✉️ ${short}`);
  if (detail) lines.push("", `📝 विवरण: ${detail}`);
  lines.push("");
  lines.push(`👤 ${by}${when ? ` · ⏳ ${when}` : ""}`);
  lines.push("", "पूरी खबर पढ़ें 👇", "", "धन्यवाद!");
  return lines.join("\n");
}

