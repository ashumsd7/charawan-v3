/**
 * Fetches live Firebase data and merges all local data/*.json files into
 * src/constants/dataForLLM.txt for LLM / chatbot context.
 *
 * Run: node scripts/dump-data-for-llm.mjs
 */
import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outDir = path.join(root, "src", "constants");
const outFile = path.join(outDir, "dataForLLM.txt");

const FIREBASE = {
  notifications:
    "https://charawan-notification-default-rtdb.firebaseio.com/Notification.json",
  shops: "https://charwan-shops-default-rtdb.firebaseio.com/charawan-shops.json",
  donations:
    process.env.NEXT_PUBLIC_DONATIONS_FIREBASE_URL ||
    "https://charwanwan-donations-db-default-rtdb.firebaseio.com/.json",
};

async function fetchJson(url, label) {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return { ok: false, error: `${label}: HTTP ${res.status}`, data: null };
    }
    const data = await res.json();
    return { ok: true, error: null, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `${label}: ${msg}`, data: null };
  }
}

async function collectJsonFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...(await collectJsonFiles(full, base)));
    } else if (ent.isFile() && ent.name.endsWith(".json")) {
      files.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return files;
}

function section(title, body) {
  return `\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}\n\n${body}\n`;
}

async function main() {
  const lines = [];
  const now = new Date().toISOString();
  lines.push("# Charawan website — data dump for LLM / chatbot");
  lines.push(`# Generated: ${now}`);
  lines.push("# Do not edit by hand; regenerate with: node scripts/dump-data-for-llm.mjs");
  lines.push("");

  const [notif, shops, donate] = await Promise.all([
    fetchJson(FIREBASE.notifications, "notifications"),
    fetchJson(FIREBASE.shops, "shops"),
    fetchJson(FIREBASE.donations, "donations"),
  ]);

  lines.push(
    section(
      "LIVE: Charawan notifications (Firebase)",
      notif.ok
        ? JSON.stringify(notif.data, null, 2)
        : `FETCH FAILED\n${notif.error}\nURL: ${FIREBASE.notifications}`,
    ),
  );
  lines.push(
    section(
      "LIVE: Charawan shops (Firebase)",
      shops.ok
        ? JSON.stringify(shops.data, null, 2)
        : `FETCH FAILED\n${shops.error}\nURL: ${FIREBASE.shops}`,
    ),
  );
  lines.push(
    section(
      "LIVE: Charawan donations (Firebase)",
      donate.ok
        ? JSON.stringify(donate.data, null, 2)
        : `FETCH FAILED\n${donate.error}\nURL: ${FIREBASE.donations}`,
    ),
  );

  let relFiles;
  try {
    relFiles = await collectJsonFiles(dataDir);
  } catch (e) {
    relFiles = [];
    lines.push(section("STATIC: data/ (error reading directory)", String(e)));
  }

  for (const rel of relFiles) {
    const full = path.join(dataDir, rel);
    try {
      const raw = await readFile(full, "utf-8");
      JSON.parse(raw); // validate
      lines.push(section(`STATIC: data/${rel}`, raw.trimEnd()));
    } catch (e) {
      lines.push(
        section(
          `STATIC: data/${rel}`,
          `READ/PARSE ERROR: ${e instanceof Error ? e.message : String(e)}`,
        ),
      );
    }
  }

  const appDir = path.join(root, "src", "app");
  try {
    const routeFiles = [];
    async function walkRoutes(d, prefix = "") {
      const ents = await readdir(d, { withFileTypes: true });
      for (const ent of ents.sort((a, b) => a.name.localeCompare(b.name))) {
        if (ent.name.startsWith("_") || ent.name.startsWith(".")) continue;
        const full = path.join(d, ent.name);
        if (ent.isDirectory()) {
          const seg = ent.name.startsWith("(") ? "" : `/${ent.name}`;
          await walkRoutes(full, prefix + seg);
        } else if (ent.name === "page.tsx" || ent.name === "page.ts") {
          routeFiles.push(prefix || "/");
        }
      }
    }
    await walkRoutes(appDir);
    const unique = [...new Set(routeFiles)].sort();
    lines.push(
      section(
        "Site routes (Next.js app router pages)",
        unique.length ? unique.join("\n") : "(none found)",
      ),
    );
  } catch (e) {
    lines.push(
      section(
        "Site routes (Next.js app router pages)",
        `Could not scan: ${e instanceof Error ? e.message : String(e)}`,
      ),
    );
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, lines.join("\n"), "utf-8");
  console.log(`Wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
