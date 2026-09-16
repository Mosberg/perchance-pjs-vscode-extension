// Downloads every asset listed in referenced-assets.txt from the pinned CDN.
//
//   node fetch-assets.mjs [--out <dir>] [--concurrency 12]
//
// Paths that don't exist upstream (some item/animation/body-type combinations
// have no art) are skipped - those 404s are expected, not errors.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const COMMIT = "553ba7562534cbf32e7d9a502660f569d6b26512";
const CDN = "https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@" + COMMIT + "/";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const outDir = resolve(here, arg("--out", "./spritesheets"));
const concurrency = Math.max(1, parseInt(arg("--concurrency", "12"), 10));

const list = (await readFile(join(here, "referenced-assets.txt"), "utf8"))
  .split("\n").map(s => s.trim()).filter(Boolean).filter(p => p.startsWith("spritesheets/"));

let cursor = 0, ok = 0, missing = 0, failed = 0, bytes = 0;
async function worker() {
  while (cursor < list.length) {
    const rel = list[cursor++];
    const url = CDN + encodeURI(rel);
    try {
      const res = await fetch(url);
      if (res.status === 404) { missing++; continue; }
      if (!res.ok) { failed++; continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const dest = join(outDir, rel.replace(/^spritesheets\//, ""));
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      ok++; bytes += buf.length;
    } catch (e) { failed++; }
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log("downloaded " + ok + " files (" + (bytes / 1048576).toFixed(1) + " MB), " + missing + " missing upstream, " + failed + " failed");
