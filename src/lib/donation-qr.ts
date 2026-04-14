/** PhonePe / UPI donation QR (imgbb). Used as fallback if JSON omits URL. */
export const DONATION_QR_URL = "https://i.ibb.co/6cKfd2V/qe.jpg";

export function donationQrSrc(fromJson?: string) {
  const t = fromJson?.trim() ?? "";
  return t.startsWith("http") ? t : DONATION_QR_URL;
}
