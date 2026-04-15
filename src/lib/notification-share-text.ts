export type ShareableNotification = {
  newsTitle?: string;
  shortInfo?: string;
  reporterName?: string;
  timeAgo?: string;
};

export function buildNotificationShareText(n: ShareableNotification, siteOrigin: string) {
  const base = siteOrigin.replace(/\/$/, "");
  const title = (n.newsTitle || "चरावां अपडेट").trim();
  const short = (n.shortInfo || "").trim();
  const by = (n.reporterName || "चरावां").trim();
  const when = (n.timeAgo || "").trim();

  const lines: string[] = [
    "नमस्ते! 🙂",
    "",
    `🗞️ ${title}`,
  ];
  if (short) lines.push(`✉️ ${short}`);
  lines.push("");
  lines.push(`👤 ${by}${when ? ` · ⏳ ${when}` : ""}`);
  lines.push("", `🌐 स्रोत: ${base}/notifications`, "", "धन्यवाद! 😊");
  return lines.join("\n");
}

