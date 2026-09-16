/**
 * verify-vendored.mjs — audit script for the wheel-plugin export package.
 *
 * Re-extracts the vendored third-party code out of the generator's own main.pjs and checks it against
 * the upstream originals shipped in this package, printing sizes and SHA-256 hashes for every file.
 *
 * Usage (Node >= 18, zero dependencies):
 *   cd 05-build-config && node verify-vendored.mjs
 *
 * Exits with code 0 when every check passes, 1 otherwise.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, "..");
const mainPjs = join(pkg, "01-internal-code", "main.pjs");

// The vendored regions of main.pjs, 1-based inclusive, as shipped.
const REGIONS = {
  // Perchance function bodies are indented two spaces; extractions dedent by two.
  winwheelVendored: { lines: [354, 445], file: "02-external-code/winwheel-2.8.0/winwheel-2.8.0.vendored.js" },
  gsapVendored: { lines: [455, 462], file: "02-external-code/gsap-tweenmax-2.0.2/TweenMax-2.0.2.vendored.js" },
  pluginFunctions: { lines: [117, 345], file: "01-internal-code/wheel-plugin-functions.js" },
};

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const dedent = (s) => (s.startsWith("  ") ? s.slice(2) : s);
const stripWs = (s) => s.replace(/\s+/g, "");

let failures = 0;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
  if (!ok) failures++;
};

const mainText = readFileSync(mainPjs, "utf8");
const mainLines = mainText.split("\n");
const extract = ([a, b]) => mainLines.slice(a - 1, b).map(dedent).join("\n");

console.log(`\nmain.pjs: ${mainText.length} bytes, ${mainLines.length} lines, sha256 ${sha256(Buffer.from(mainText)).slice(0, 16)}…\n`);

// 1. Header lines of each extraction match the shipped *.vendored.js files (which add comment headers).
for (const [name, r] of Object.entries(REGIONS)) {
  const body = extract(r.lines);
  const shipped = readFileSync(join(pkg, r.file), "utf8");
  const ok = shipped.includes(body.trimEnd());
  console.log(`[${name}] main.pjs lines ${r.lines[0]}-${r.lines[1]} -> ${body.length} chars`);
  check(ok, `${r.file} contains the extracted region verbatim`);
}

// 2. Vendored GSAP must equal upstream TweenMax 2.0.2 modulo whitespace (the lib is wrapped in a fakeWindow).
const upGsap = readFileSync(join(pkg, "02-external-code/gsap-tweenmax-2.0.2/upstream/TweenMax.min.js"), "utf8");
const upGsapBody = upGsap.replace(/^\/\*![\s\S]*?\*\//, "");
const vendGsapBody = extract(REGIONS.gsapVendored.lines)
  .split("\n")
  .filter((l) => !/^\s*(let fakeWindow|\(function\(window\)|\}\)\(fakeWindow\);|\/\/)/.test(l))
  .join("\n");
console.log(`\n[gsap] vendored non-ws chars ${stripWs(vendGsapBody).length}, upstream non-ws chars ${stripWs(upGsapBody).length}`);
check(stripWs(vendGsapBody) === stripWs(upGsapBody), "vendored GSAP == upstream gsap@2.0.2 TweenMax.min.js modulo whitespace");

// 3. Vendored Winwheel must contain the plugin's two documented local edits.
const vendWheel = extract(REGIONS.winwheelVendored.lines);
check(/EDIT: I added this to suit wheel-plugin defaults/.test(vendWheel), "Winwheel local edit marker present (this.drawSegments() in the segmentImage branch)");
check(/window\.Winwheel = function/.test(vendWheel), "Winwheel exported onto window.Winwheel");
check(/window\.winwheelResize = function/.test(vendWheel), "responsive resize helper present");

// 4. Every file in the package: size + hash (this is the data MANIFEST.md is built from).
console.log("\n[files]");
const walk = (dir) =>
  readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [relative(pkg, p)];
  });
for (const rel of walk(pkg).sort()) {
  if (rel === "05-build-config/verify-vendored.mjs") continue;
  const buf = readFileSync(join(pkg, rel));
  console.log(`  ${String(buf.length).padStart(8)}  ${sha256(buf).slice(0, 12)}  ${rel}`);
}

console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) FAILED.\n`);
process.exit(failures === 0 ? 0 : 1);
