#!/usr/bin/env node
// Rebuilds 02-embedded-assets/ from 01-internal-code/ (node:fs only, no dependencies).
// Usage: node extract-assets.mjs [package-root]   (defaults to ".." relative to this script)
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), "..");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const FONT_RE = /url\(data:application\/font-woff2;base64,([A-Za-z0-9+/=]+)\)/;

const mainPjs = await readFile(join(pkgRoot, "01-internal-code/main.pjs"), "utf8");
const indexHtml = await readFile(join(pkgRoot, "01-internal-code/index.html"), "utf8");

const cssLine = mainPjs.split("\n").find((l) => l.startsWith("getRPGAwesomeCSSText() =>"));
if (!cssLine) throw new Error("getRPGAwesomeCSSText() line not found in main.pjs");
const css = cssLine.slice(cssLine.indexOf("`") + 1, cssLine.lastIndexOf("`"));

const base64 = css.match(FONT_RE)[1];
const font = Buffer.from(base64, "base64");
if (font.subarray(0, 4).toString("latin1") !== "wOF2") throw new Error("decoded font is not WOFF2");

const out = join(pkgRoot, "02-embedded-assets");
await mkdir(join(out, "fonts"), { recursive: true });
await mkdir(join(out, "css"), { recursive: true });
await mkdir(join(out, "data"), { recursive: true });
await writeFile(join(out, "fonts/rpgawesome.woff2"), font);
await writeFile(join(out, "css/rpgawesome.css"), css.replace(FONT_RE, "url(rpgawesome.woff2) format('woff2')"));

const tokens = [...indexHtml.matchAll(/<h2>([^<]+)<\/h2>|<i title="([^"]+)"/g)];
const cats = []; let cur = null;
for (const t of tokens) {
  if (t[1]) cats.push((cur = { category: t[1], icons: [] }));
  else if (cur) cur.icons.push(t[2]);
}
const all = cats.flatMap((c) => c.icons);
await writeFile(join(out, "data/icon-names.txt"), all.join("\n") + "\n");
await writeFile(join(out, "data/icon-names.json"), JSON.stringify({
  total: all.length,
  categories: cats.map((c) => ({ name: c.category, count: c.icons.length })),
  icons: cats.reduce((o, c) => ((o[c.category] = c.icons), o), {}),
}, null, 2) + "\n");

const glyphs = [...css.matchAll(/\.ra-([a-z0-9-]+):before\{content:"([^"]+)"\}/g)].map((m) => ({
  name: m[1],
  glyph: "U+" + m[2].codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
}));
await writeFile(join(out, "data/glyph-map.json"), JSON.stringify({
  fontFamily: "RPGAwesome", ruleCount: glyphs.length, glyphs,
}, null, 2) + "\n");

console.log(JSON.stringify({
  cssChars: css.length,
  fontBytes: font.length,
  fontSha256: sha(font),
  iconCount: all.length,
  categories: cats.length,
  glyphRules: glyphs.length,
}, null, 2));
