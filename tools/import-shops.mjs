/**
 * Merge Firebase-style shop export into data/shops/all-shops.json
 * Usage: node tools/import-shops.mjs path/to/export.json
 *    or:  type export.json | node tools/import-shops.mjs
 */
import fs from "fs";
import path from "path";

const out = path.join(process.cwd(), "data", "shops", "all-shops.json");

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const file = process.argv[2];
  let raw;
  if (file) {
    raw = fs.readFileSync(path.resolve(file), "utf8");
  } else if (!process.stdin.isTTY) {
    raw = await readStdin();
  } else {
    console.error("Usage: node tools/import-shops.mjs <export.json>");
    console.error("   or:  Get-Content export.json | node tools/import-shops.mjs");
    process.exit(1);
  }
  const data = JSON.parse(raw);
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Root JSON must be an object of id -> shop");
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data, null, 2), "utf8");
  console.log("Wrote", out, "keys:", Object.keys(data).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
