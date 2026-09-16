#!/usr/bin/env node
// Download every large media asset referenced by the ai-rpg generator.
// Usage: node download-media.mjs [output-dir]   (default: ./downloads)
import { createWriteStream, existsSync, mkdirSync, statSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] || "downloads");
const rows = readFileSync(join(here, "media-filelist.txt"), "utf8").split("\n").filter(Boolean).map(l => l.split("\t"));

let n = 0, ok = 0, skipped = 0;
const failed = [];
for (const [url, dest] of rows) {
  n++;
  const target = join(outDir, dest);
  if (existsSync(target) && statSync(target).size > 0) { skipped++; continue; }
  mkdirSync(dirname(target), { recursive: true });
  process.stdout.write("[" + n + "/" + rows.length + "] " + dest + " ... ");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(target));
    ok++;
    console.log("ok");
  } catch (e) { failed.push([url, String(e)]); console.log("FAILED: " + e); }
}
console.log("\n" + ok + " downloaded, " + skipped + " skipped, " + failed.length + " failed -> " + outDir);
if (failed.length) { console.log("\nFailed URLs:"); for (const [u, e] of failed) console.log("  " + u + "  (" + e + ")"); process.exitCode = 1; }
