#!/usr/bin/env node
// build-inventory.mjs — regenerate inventory.json and CHECKSUMS.sha256 for this package.
//
// Walks the package tree, hashes every file, assigns a category from its path, and (where possible)
// recovers the original remote URL for the file. Run it after adding/removing files:
//
//   node tools/build-inventory.mjs            # writes inventory.json + CHECKSUMS.sha256 in the package root
//   node tools/build-inventory.mjs --root ../ai-furry-generator-package
//
// URL recovery, in order of precedence:
//   1. an existing inventory.json entry for the same path (preserves curated mapping)
//   2. 04-project-assets/ASSET-URLS.tsv  (local file -> original URL, produced by the extraction pass)
//   3. a table of known upstream URLs for 03-third-party-vendor/{css,js} files
// Files with no known remote origin get `sourceUrl: null` (the project's own files).

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const rootFlag = argv.indexOf("--root");
const ROOT = resolve(rootFlag !== -1 && argv[rootFlag + 1] ? argv[rootFlag + 1] : join(HERE, ".."));

const SKIP = new Set(["inventory.json", "CHECKSUMS.sha256"]);

const VENDOR_URLS = {
  "03-third-party-vendor/css/google-fonts-open-sans.css": "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap",
  "03-third-party-vendor/css/google-fonts-material-symbols.css": "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
  "03-third-party-vendor/css/google-fonts-kalam.css": "https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap",
  "03-third-party-vendor/css/font-awesome-7.0.1-all.min.css": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css",
  "03-third-party-vendor/js/tally-embed.js": "https://tally.so/widgets/embed.js",
  "03-third-party-vendor/js/jszip-3.10.1.esm.js": "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm",
};

const EMOJI_HASHES = ["d974f4d206a97233ec5ad6ec93300790", "a39d52b89a33865b9a903fcc5786a2da",
                      "ee2216fa015cefb692547c2455d45d3b", "7613ce5d622bc5a7806da86b6139c681",
                      "6a94a2e57992b3c62fe8a37533209040"];

function categorize(rel) {
  if (rel.startsWith("01-internal-code/")) return "internal-code";
  if (rel.startsWith("02-external-code/")) return "external-code";
  if (rel.startsWith("03-third-party-vendor/fonts/")) return "third-party-fonts";
  if (rel.startsWith("03-third-party-vendor/")) return "third-party-vendor";
  if (rel.startsWith("04-project-assets/images/")) return "project-assets";
  if (rel.startsWith("04-project-assets/video/")) return "project-assets";
  if (rel.startsWith("04-project-assets/emoji-images/")) return "emoji-images";
  if (rel.startsWith("04-project-assets/emoji/")) return "emoji-lists";
  if (rel.startsWith("04-project-assets/import-assets/")) return "import-assets/" + rel.split("/import-assets/")[1].split("/")[0];
  if (rel.startsWith("05-external-services/")) return "docs";
  if (rel.startsWith("06-config/")) return "build-config";
  if (rel.startsWith("tools/")) return "tooling";
  return "docs";
}

async function walk(dir, out = []) {
  for (const name of (await readdir(dir)).sort()) {
    if (name === ".git" || name === "node_modules") continue;
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

async function readTsvMap() {
  const p = join(ROOT, "04-project-assets/ASSET-URLS.tsv");
  const map = {};
  if (!existsSync(p)) return map;
  for (const line of (await readFile(p, "utf8")).split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const cols = line.split("\t").map((c) => c.trim());
    if (cols[0] === "local file") continue;
    const local = cols.find((c) => c && !/^https?:/.test(c));
    const url = cols.find((c) => /^https?:/.test(c));
    if (local && url) map[local] = url;
  }
  return map;
}

const prev = existsSync(join(ROOT, "inventory.json"))
  ? JSON.parse(await readFile(join(ROOT, "inventory.json"), "utf8"))
  : null;
const prevByPath = {};
for (const f of prev?.files || []) prevByPath[f.path] = f;

const tsvMap = await readTsvMap();
const paths = await walk(ROOT);
const files = [];
for (const abs of paths) {
  const rel = relative(ROOT, abs).split("\\").join("/");
  if (SKIP.has(rel)) continue;
  const buf = await readFile(abs);
  const base = basename(rel);
  let url = null;
  if (prevByPath[rel]?.sourceUrl) url = prevByPath[rel].sourceUrl;
  else if (tsvMap[base]) url = tsvMap[base];
  else if (VENDOR_URLS[rel]) url = VENDOR_URLS[rel];
  else if (rel.startsWith("04-project-assets/emoji/emoji-list-")) {
    const h = rel.replace(/^.*emoji-list-/, "").replace(/\.txt$/, "");
    if (EMOJI_HASHES.includes(h)) url = `https://user.uploads.dev/file/${h}.txt`;
  }
  files.push({
    path: rel,
    bytes: buf.length,
    sha256: createHash("sha256").update(buf).digest("hex"),
    category: categorize(rel),
    sourceUrl: url,
  });
}

const byCat = {};
for (const f of files) {
  const c = (byCat[f.category] = byCat[f.category] || { files: 0, bytes: 0 });
  c.files++; c.bytes += f.bytes;
}
const totals = { files: files.length, bytes: files.reduce((a, f) => a + f.bytes, 0) };

await writeFile(join(ROOT, "CHECKSUMS.sha256"),
  files.map((f) => `${f.sha256}  ${f.path}`).join("\n") + "\n");

await writeFile(join(ROOT, "inventory.json"), JSON.stringify({
  ...(prev || {}),
  totals,
  categories: Object.fromEntries(Object.entries(byCat).sort().map(([k, v]) => [k, { files: v.files, bytes: v.bytes, megabytes: +(v.bytes / 1048576).toFixed(2) }])),
  files,
}, null, 1) + "\n");

console.log(`${files.length} files, ${(totals.bytes / 1048576).toFixed(1)} MB`);
for (const [k, v] of Object.entries(byCat).sort()) console.log(`  ${k}: ${v.files} files, ${(v.bytes / 1048576).toFixed(2)} MB`);
