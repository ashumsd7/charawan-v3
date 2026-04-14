import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { lang?: string };
  const lang = body.lang === "en" ? "en" : "hi";
  const res = NextResponse.json({ ok: true, lang });
  res.cookies.set("charawan_lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
