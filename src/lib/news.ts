import axios from "axios";
import { CHARAWAN_NOTIFICATIONS_FIREBASE_URL } from "@/lib/notifications-firebase";

export type FirebaseNewsItem = {
  key?: string;
  slug?: string;
  reporterName?: string;
  newsTitle?: string;
  shortInfo?: string;
  detailedInfo?: string;
  timeStamp?: number;
  isAdmin?: boolean;
  img1?: string;
  img2?: string;
  likeCounter?: number;
  timeAgo?: string;
};

export function calcTimeAgo(fromMs: number) {
  let seconds = Math.floor((Date.now() - fromMs) / 1000);
  let unit = " सेकंड ";
  let direction = "पहले";
  if (seconds < 0) {
    seconds = -seconds;
    direction = "अब से";
  }
  let value = seconds;
  if (seconds >= 31536000) {
    value = Math.floor(seconds / 31536000);
    unit = " साल ";
  } else if (seconds >= 86400) {
    value = Math.floor(seconds / 86400);
    unit = " दिन ";
  } else if (seconds >= 3600) {
    value = Math.floor(seconds / 3600);
    unit = " घंटे ";
  } else if (seconds >= 60) {
    value = Math.floor(seconds / 60);
    unit = " मिनट ";
  }
  return `${value}${unit}${direction}`;
}

export function createNewsSlug(input?: string) {
  const value = (input ?? "").trim().toLowerCase();
  const slug = value
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug;
}

export function normalizeManualSlug(input?: string) {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  const fromUrl = raw.includes("/") ? raw.split("/").filter(Boolean).at(-1) ?? raw : raw;
  const clean = fromUrl.split("?")[0].split("#")[0];
  return createNewsSlug(clean);
}

export function getNewsPathSegment(news: Pick<FirebaseNewsItem, "newsTitle" | "key" | "slug">) {
  const manual = normalizeManualSlug(news.slug);
  if (manual) return manual;
  const titleSlug = createNewsSlug(news.newsTitle);
  if (titleSlug) return titleSlug;
  return (news.key ?? "").trim() || "news";
}

export function getNewsHref(news: Pick<FirebaseNewsItem, "newsTitle" | "key" | "slug">) {
  return `/news/${getNewsPathSegment(news)}`;
}

export async function fetchNewsFromFirebase() {
  const { data } = await axios.get<Record<string, FirebaseNewsItem> | null>(
    CHARAWAN_NOTIFICATIONS_FIREBASE_URL,
    { timeout: 25_000, headers: { Accept: "application/json" } },
  );

  const list: FirebaseNewsItem[] = [];
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      const timeStamp = typeof value?.timeStamp === "number" ? value.timeStamp : undefined;
      list.push({
        ...value,
        key,
        timeAgo: timeStamp ? calcTimeAgo(timeStamp) : "—",
      });
    }
  }

  list.sort((a, b) => (b.timeStamp ?? 0) - (a.timeStamp ?? 0));
  return list;
}
