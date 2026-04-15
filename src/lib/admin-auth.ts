/** Same key as before; value is now the passcode string (not `"true"`). */
export const ADMIN_PASSCODE_STORAGE_KEY = "charawan_passcode";

/** Must be `NEXT_PUBLIC_PASSCODE` so the browser bundle can read it (.env.local / Netlify). */
export function getExpectedAdminPasscode(): string {
  return (process.env.NEXT_PUBLIC_PASSCODE ?? "").trim();
}

export function isAdminAuthenticatedClient(): boolean {
  if (typeof window === "undefined") return false;
  const expected = getExpectedAdminPasscode();
  if (!expected) return false;
  try {
    const stored = localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY);
    return !!stored && stored === expected;
  } catch {
    return false;
  }
}

export function persistAdminPasscode(passcode: string): void {
  localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, passcode.trim());
}
