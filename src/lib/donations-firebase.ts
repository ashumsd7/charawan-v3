export const CHARAWAN_DONATIONS_FIREBASE_URL =
  process.env.NEXT_PUBLIC_DONATIONS_FIREBASE_URL ||
  // User-provided URL (can be overridden via env).
  "https://charwanwan-donations-db-default-rtdb.firebaseio.com/.json";

export type DonationDonor = {
  name: string;
  number?: string;
  address?: string;
  photo?: string;
  description?: string;
  thankYouNote?: string;
};

export type DonationNeed = {
  id: string;
  name: string;
  image: string;
  description: string;
  priceStarts: number;
  buyLink?: string;
  paymentQrImage?: string;
  timesDonated: number;
  donors: DonationDonor[];
};

export type DonateDbShape = {
  banner?: {
    title?: string;
    image?: string;
    mobileImage?: string;
  };
  heading: string;
  upiId: string;
  qrImage: string;
  shipTo: { name: string; addressLines: string[]; phone: string };
  screenshotNoteHref: string;
  screenshotNoteLabel: string;
  bodyParagraphs: string[];
  /** Always normalized to an array (sorted). */
  needs: DonationNeed[];
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumber(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim()) as string[];
  return [];
}

function normalizeDonor(v: unknown): DonationDonor | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const name = asString(o.name).trim();
  if (!name) return null;
  return {
    name,
    number: asString(o.number),
    address: asString(o.address),
    photo: asString(o.photo),
    description: asString(o.description),
    thankYouNote: asString(o.thankYouNote),
  };
}

function normalizeNeed(v: unknown, fallbackId?: string): DonationNeed | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const id = (asString(o.id) || fallbackId || "").trim();
  const name = asString(o.name).trim();
  if (!id || !name) return null;

  const donorsRaw = Array.isArray(o.donors) ? o.donors : [];
  const donors = donorsRaw.map(normalizeDonor).filter(Boolean) as DonationDonor[];

  return {
    id,
    name,
    image: asString(o.image),
    description: asString(o.description),
    priceStarts: asNumber(o.priceStarts),
    buyLink: asString(o.buyLink),
    paymentQrImage: asString(o.paymentQrImage),
    timesDonated: asNumber(o.timesDonated),
    donors,
  };
}

export function normalizeDonateDbShape(payload: unknown): DonateDbShape | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const o = payload as Record<string, unknown>;

  const needsValue = o.needs;
  let needs: DonationNeed[] = [];

  if (Array.isArray(needsValue)) {
    needs = needsValue.map((x) => normalizeNeed(x)).filter(Boolean) as DonationNeed[];
  } else if (needsValue && typeof needsValue === "object" && !Array.isArray(needsValue)) {
    const entries = Object.entries(needsValue as Record<string, unknown>);
    needs = entries
      .map(([key, value]) => normalizeNeed(value, key))
      .filter(Boolean) as DonationNeed[];
  }

  needs.sort((a, b) => (a.name || "").localeCompare(b.name || "", "hi", { sensitivity: "base" }));

  const shipToRaw = (o.shipTo && typeof o.shipTo === "object" && !Array.isArray(o.shipTo) ? o.shipTo : {}) as Record<
    string,
    unknown
  >;

  return {
    banner:
      o.banner && typeof o.banner === "object" && !Array.isArray(o.banner)
        ? {
            title: asString((o.banner as Record<string, unknown>).title),
            image: asString((o.banner as Record<string, unknown>).image),
            mobileImage: asString((o.banner as Record<string, unknown>).mobileImage),
          }
        : undefined,
    heading: asString(o.heading) || "दान",
    upiId: asString(o.upiId),
    qrImage: asString(o.qrImage),
    shipTo: {
      name: asString(shipToRaw.name),
      addressLines: asStringArray(shipToRaw.addressLines),
      phone: asString(shipToRaw.phone),
    },
    screenshotNoteHref: asString(o.screenshotNoteHref) || "/contacts",
    screenshotNoteLabel: asString(o.screenshotNoteLabel) || "सम्पर्क पृष्ठ",
    bodyParagraphs: Array.isArray(o.bodyParagraphs)
      ? (o.bodyParagraphs.filter((x) => typeof x === "string" && x.trim()) as string[])
      : [],
    needs,
  };
}

export function stripJson(url: string) {
  // Handles both ".../foo.json" and the common RTDB root ".../.json"
  return url.replace(/\/?\.json$/, "");
}

