#!/usr/bin/env node
// fetch-remote-assets.mjs — re-download every remote asset this project references.
//
// The package ships local copies of all *code*, all *vendor* files, the generator's own images,
// and the emoji list data files — but NOT the ~93,000 custom-emoji images those lists point at
// (multiple GB). This script fetches everything from the public web on demand.
//
// Usage (Node 18+, no dependencies):
//   node tools/fetch-remote-assets.mjs                 # re-verify/re-download everything in inventory.json
//   node tools/fetch-remote-assets.mjs --emoji         # ...and the ~93k custom emoji images
//   node tools/fetch-remote-assets.mjs --only images   # restrict to a category: generator | vendor | import-assets | emoji-lists
//   node tools/fetch-remote-assets.mjs --verify        # don't write anything, just report missing/changed files
//   node tools/fetch-remote-assets.mjs --out /tmp/aifg # target root (default: the package root)
//
// Flags: --emoji --verify --only <cat> --out <dir> --concurrency <n> --retries <n> --force --quiet

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, "..");

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf("--" + name);
  if (i === -1) return def;
  const next = argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
};
const has = (name) => argv.includes("--" + name);

const OPTS = {
  root: String(flag("out", PKG)),
  only: flag("only", null),
  wantEmoji: has("emoji"),
  verify: has("verify"),
  force: has("force"),
  quiet: has("quiet"),
  concurrency: Number(flag("concurrency", 8)),
  retries: Number(flag("retries", 3)),
};

const log = (...a) => { if (!OPTS.quiet) console.log(...a); };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const exists = async (p) => { try { await access(p); return true; } catch { return false; } };

async function withRetry(fn, label) {
  let err;
  for (let attempt = 1; attempt <= OPTS.retries; attempt++) {
    try { return await fn(); }
    catch (e) {
      err = e;
      if (attempt < OPTS.retries) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw new Error(`${label}: ${err?.message || err}`);
}

async function runPool(items, worker) {
  const queue = items.slice();
  const results = [];
  const n = Math.max(1, OPTS.concurrency);
  await Promise.all(Array.from({ length: n }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  }));
  return results;
}

// ---------------------------------------------------------------- inventory

const invPath = join(PKG, "inventory.json");
let inventory = null;
if (await exists(invPath)) inventory = JSON.parse(await readFile(invPath, "utf8"));

if (!inventory) {
  console.error("inventory.json not found next to tools/ — nothing to fetch.");
  process.exit(1);
}

// Every inventory entry: { path, bytes, sha256, category, sourceUrl? }
const entries = (inventory.files || inventory).filter((f) => f && f.sourceUrl);

const catOf = (e) => e.category || "unknown";
const targets = entries.filter((e) =>
  (!OPTS.only || catOf(e).includes(OPTS.only)) &&
  (OPTS.wantEmoji || !catOf(e).includes("emoji-images")));

log(`Package root : ${OPTS.root}`);
log(`Inventory    : ${entries.length} remote-backed entries`);
log(`Selected     : ${targets.length}${OPTS.only ? ` (--only ${OPTS.only})` : ""}${OPTS.wantEmoji ? " (+emoji images)" : " (use --emoji for the ~93k emoji images)"}`);
log("");

let ok = 0, skipped = 0, mismatched = 0, failed = 0;
const failures = [];

async function fetchOne(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const results = await runPool(targets, async (e) => {
  const dest = join(OPTS.root, e.path);
  const label = e.path;
  try {
    if (!OPTS.force && !OPTS.verify && (await exists(dest))) {
      const have = await readFile(dest);
      if (!e.sha256 || sha256(have) === e.sha256) { skipped++; return "skipped"; }
    }
    const buf = await withRetry(() => fetchOne(e.sourceUrl, dest), label);
    if (OPTS.verify) {
      const good = !e.bytes || buf.length === e.bytes;
      if (!good) { mismatched++; failures.push(`${label} (size ${buf.length} != ${e.bytes})`); return "mismatch"; }
      ok++; return "ok";
    }
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    ok++;
    return "ok";
  } catch (err) {
    failed++;
    failures.push(`${label} <- ${e.sourceUrl} :: ${err.message}`);
    return "failed";
  }
});

log(`downloaded ${ok} · already present ${skipped} · failed ${failed}${OPTS.verify ? ` · mismatched ${mismatched}` : ""}`);

if (failures.length) {
  log("\nProblems:");
  for (const f of failures.slice(0, 200)) log("  " + f);
  if (failures.length > 200) log(`  ...and ${failures.length - 200} more`);
}

// ---------------------------------------------------------------- emoji images

if (OPTS.wantEmoji) {
  const emojiDir = join(OPTS.root, "04-project-assets/emoji");
  const lists = ["d974f4d206a97233ec5ad6ec93300790", "a39d52b89a33865b9a903fcc5786a2da",
                 "ee2216fa015cefb692547c2455d45d3b", "7613ce5d622bc5a7806da86b6139c681",
                 "6a94a2e57992b3c62fe8a37533209040"];
  const names = new Set();
  for (const h of lists) {
    const p = join(emojiDir, `emoji-list-${h}.txt`);
    if (!(await exists(p))) continue;
    for (const line of (await readFile(p, "utf8")).split("\n")) {
      const s = line.trim();
      if (!s || s.startsWith("#")) continue;
      const value = s.includes("=") ? s.slice(s.indexOf("=") + 1).trim() : s.trim();
      const file = value.startsWith("http") ? value.split("/").pop() : value;
      if (file && /\.[a-z0-9]{2,5}$/i.test(file)) names.add(file);
    }
  }
  const list = [...names];
  const outDir = join(OPTS.root, "04-project-assets/emoji-images");
  log(`\nEmoji images: ${list.length} unique files referenced by the emoji lists`);
  log(`Destination : ${outDir}`);
  let done = 0, miss = 0, skip = 0;
  await runPool(list, async (file) => {
    const dest = join(outDir, file);
    try {
      if (!OPTS.force && (await exists(dest))) { skip++; return; }
      const buf = await withRetry(() => fetchOne(`https://user.uploads.dev/file/${file}`, dest), file);
      await mkdir(outDir, { recursive: true });
      await writeFile(dest, buf);
      done++;
    } catch { miss++; }
    if ((done + miss + skip) % 500 === 0) log(`  ${done + miss + skip}/${list.length} (${miss} unavailable)`);
    return null;
  });
  log(`emoji images: downloaded ${done} · already present ${skip} · unavailable ${miss}`);
}

process.exit(failed ? 1 : 0);
