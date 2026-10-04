#!/usr/bin/env node
// Re-extracts the vendored libraries from generator/main.pjs and compares them against
// dependencies/*.min.js (the upstream UMD files). Run from the package root:
//
//   node tools/verify-embedded-deps.mjs
//
// Exit code 0 = both inlined copies match upstream (modulo whitespace, the upstream banner
// comment and the //# sourceMappingURL trailer).

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const main = readFileSync(join(root, "generator/main.pjs"), "utf8");

const POPPER_MARK = "/* https://unpkg.com/@popperjs/core@2.5.2";
const TIPPY_MARK = "/* https://unpkg.com/tippy.js@6.2.6";

function unindent(s) {
  return s.split("\n").map(l => l.replace(/^ {0,2}/, "")).join("\n").trim();
}
function unescapeTemplate(s) {
  return s.replace(/\\`/g, "`").replace(/\\\$\{/g, "${").replace(/\\\\/g, "\\");
}
function body(text, start, end) {
  const chunk = unescapeTemplate(unindent(text.slice(start, end)));
  return chunk.slice(chunk.indexOf("*/") + 2).trim();
}
const norm = s => s.replace(/\s+/g, "");
const stripTrailer = s => s.replace(/\/\/#\s*sourceMappingURL[^\n]*/g, "");
const afterFirstComment = s => { const i = s.indexOf("*/"); return i < 0 ? s : s.slice(i + 2); };
const sha = s => createHash("sha256").update(s).digest("hex");

const ip = main.indexOf(POPPER_MARK);
const it = main.indexOf(TIPPY_MARK);
const ie = main.lastIndexOf("`;");
if (ip < 0 || it < 0 || ie < 0) { console.error("Could not locate the vendored blocks in main.pjs"); process.exit(2); }

const popperUp = stripTrailer(afterFirstComment(readFileSync(join(root, "dependencies/popper-2.5.2.min.js"), "utf8")));
const tippyUp = stripTrailer(afterFirstComment(readFileSync(join(root, "dependencies/tippy-6.2.6.min.js"), "utf8")));
const rows = [["@popperjs/core 2.5.2", body(main, ip, it), popperUp], ["tippy.js 6.2.6", body(main, it, ie), tippyUp]];

let ok = true;
for (const [name, a, b] of rows) {
  const match = norm(a) === norm(b);
  ok = ok && match;
  console.log((match ? "OK   " : "FAIL ") + name);
  console.log("     inlined : " + a.length + " bytes  sha256 " + sha(a));
  console.log("     upstream: " + b.length + " bytes  sha256 " + sha(b));
}
console.log(ok ? "\nAll inlined dependencies match upstream." : "\nMISMATCH - re-vendor from dependencies/.");
process.exit(ok ? 0 : 1);
