import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Netlify provides env variables via process.env.<NAME> too,
  // but for edge compatibility and to support Netlify's recommended pattern,
  // allow fallback to process.env but first try Netlify's runtime env:
  const key =
    process.env.IMGBB_API_KEY ||
    (typeof globalThis !== "undefined" && (globalThis as any).IMGBB_API_KEY) ||
    undefined;
 
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "IMGBB_API_KEY missing on server" },
      { status: 500 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Expected multipart/form-data" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing image file" }, { status: 400 });
  }

  if (!file.type || !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Only PNG/JPEG images are allowed" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "Image too large (max 8MB)" }, { status: 400 });
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const body = new URLSearchParams();
  body.set("image", base64);

  const upstream = await fetch(`https://api.imgbb.com/1/upload?expiration=0&key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const json = (await upstream.json()) as {
    success?: boolean;
    data?: { display_url?: string };
    error?: { message?: string };
  };

  if (!upstream.ok || !json?.success || !json.data?.display_url) {
    return NextResponse.json(
      { ok: false, error: json?.error?.message ?? "Upload failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, url: json.data.display_url });
}
