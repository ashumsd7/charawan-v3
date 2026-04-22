import { readFileSync } from "fs";
import path from "path";
import {
  OPENROUTER_API_URL,
  OPENROUTER_MODEL,
  OPENROUTER_SITE_NAME,
  OPENROUTER_SITE_URL,
} from "@/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const DATA_PATH = path.join(process.cwd(), "src/constants/dataForLLM.txt");

/** Prepended to the raw dump so the model follows site-only, Hindi answers. */
const SYSTEM_PREFIX = `तुम "Charawan" (चरावां) गाँव के बारे में जानकारी देने वाले एक AI सहायक हो। तुम्हें जो context दिया जाएगा, उसी के आधार पर सही और स्पष्ट जवाब देना है। तुम केवल दिए गए data से ही जवाब दोगे, बाहर की कोई जानकारी नहीं जोड़ोगे। अगर context में जवाब नहीं मिलता, तो साफ बोलो कि जानकारी उपलब्ध नहीं है।

हमेशा जवाब हिंदी में, आसान भाषा में और सीधे तरीके से दो।

User जो भी सवाल पूछे, पहले दिए गए context को ध्यान से समझो, फिर उसी से relevant जानकारी निकालकर जवाब बनाओ।

कोई अंदाज़ा, झूठ या extra जानकारी मत जोड़ो।

जवाब साफ़ दिखे तो साधारण HTML लिखो: <p>, <br>, <strong>, <ul>, <li>, <a> — मोटा टेक्स्ट के लिए <strong>…</strong> इस्तेमाल करो, **…** जैसा markdown नहीं।

नीचे पूरा डेटा src/constants/dataForLLM.txt से है — इसी के आधार पर जवाब दो।`;

let cachedSiteData: string | null = null;

function normalizeOpenRouterKey(): string | undefined {
  const raw =
    process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!raw) return undefined;
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s || undefined;
}

/** Full website dump for LLM (src/constants/dataForLLM.txt). */
function loadWebsiteDataset(): string {
  if (cachedSiteData !== null) return cachedSiteData;
  cachedSiteData = readFileSync(DATA_PATH, "utf-8");
  return cachedSiteData;
}

/** `WEBSITE_DATASET` = instructions + full txt file (OpenRouter system message). */
function buildWebsiteDataset(): string {
  return `${SYSTEM_PREFIX}\n\n${loadWebsiteDataset()}`;
}

type ClientTurn = { isBot?: boolean; text?: string };

function parseMessagesFromBody(body: Record<string, unknown>): ClientTurn[] {
  const raw = body.messages;
  if (!Array.isArray(raw)) return [];
  const out: ClientTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.text !== "string" || !o.text.trim()) continue;
    out.push({
      isBot: o.isBot === true,
      text: o.text.trim(),
    });
  }
  return out.slice(-24);
}

/** Legacy: { role, content } from older client. */
function parseHistoryLegacy(raw: unknown): ClientTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ClientTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const content = typeof o.content === "string" ? o.content.trim() : "";
    if (!content) continue;
    const isBot = o.role === "assistant";
    if (o.role !== "user" && o.role !== "assistant") continue;
    out.push({ isBot, text: content });
  }
  return out.slice(-24);
}

export async function POST(req: Request) {
  const apiKey = normalizeOpenRouterKey();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "OpenRouter API कुंजी नहीं मिली। .env.local में OPENROUTER_API_KEY=sk-or-... जोड़ें, सेव करके डेव सर्वर रीस्टार्ट करें।",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "अमान्य अनुरोध (JSON)।" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const inputMessage =
    typeof b.inputMessage === "string"
      ? b.inputMessage.trim()
      : typeof b.question === "string"
        ? b.question.trim()
        : "";

  if (!inputMessage) {
    return Response.json({ error: "कृपया एक सवाल लिखें।" }, { status: 400 });
  }

  let turns = parseMessagesFromBody(b);
  if (turns.length === 0 && "history" in b) {
    turns = parseHistoryLegacy(b.history);
  }

  let WEBSITE_DATASET: string;
  try {
    WEBSITE_DATASET = buildWebsiteDataset();
  } catch {
    return Response.json(
      { error: "डेटा फ़ाइल नहीं पढ़ी जा सकी: src/constants/dataForLLM.txt" },
      { status: 500 },
    );
  }

  const model = (process.env.OPENROUTER_MODEL || OPENROUTER_MODEL).trim();

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": OPENROUTER_SITE_URL,
        "X-Title": OPENROUTER_SITE_NAME,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: WEBSITE_DATASET,
          },
          ...turns.map((msg) => ({
            role: msg.isBot ? "assistant" : "user",
            content: msg.text,
          })),
          {
            role: "user",
            content: inputMessage,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(55_000),
    });

    const raw = await response.text();
    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      return Response.json(
        {
          error: `OpenRouter से अमान्य जवाब (${response.status})।`,
          detail: raw.slice(0, 400),
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      const errObj = json as { error?: { message?: string } };
      const msg =
        errObj?.error?.message ||
        (typeof json === "object" && json !== null && "message" in json
          ? String((json as { message: unknown }).message)
          : raw.slice(0, 500));
      return Response.json(
        { error: `OpenRouter: ${msg}`, status: response.status },
        { status: response.status >= 400 && response.status < 600 ? response.status : 502 },
      );
    }

    const dataOut = json as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text =
      typeof dataOut?.choices?.[0]?.message?.content === "string"
        ? dataOut.choices[0].message.content.trim()
        : "";

    if (!text) {
      return Response.json(
        { error: "मॉडल से खाली जवाब मिला। दोबारा कोशिश करें।" },
        { status: 502 },
      );
    }

    return Response.json({ answer: text, modelUsed: model });
  } catch (e) {
    console.error("[api/chat] OpenRouter", e);
    return Response.json(
      {
        error:
          e instanceof Error
            ? `नेटवर्क/सर्वर त्रुटि: ${e.message}`
            : "OpenRouter अनुरोध विफल।",
      },
      { status: 502 },
    );
  }
}
