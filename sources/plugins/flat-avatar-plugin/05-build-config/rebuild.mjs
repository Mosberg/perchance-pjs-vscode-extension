#!/usr/bin/env node
// Reassembles main.pjs from the six byte-exact segments and verifies the result.
//
//   node rebuild.mjs --check    verify (default)
//   node rebuild.mjs --write    also write ./main.pjs.rebuilt
//
// The segments are raw contiguous slices of the shipped main.pjs, so concatenating them in
// order must reproduce the file bit-for-bit.

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SEG_DIR = join(HERE, "..", "01-internal-code", "segments");

const ORDER = [
  "01-plugin-lists-and-output.pjs",
  "02-init-plugin-header.pjs",
  "03-react-17.production.min.js.inc",
  "04-react-dom-17.production.min.js.inc",
  "05-avataaars.bundle.js.inc",
  "06-avatarexports-shim.pjs",
];

const EXPECTED_SHA256 = "609d66f7117a5d4d606ab9ef60af7344a08115a0cdca19bee0372fa258867adb";
const EXPECTED_BYTES = 656792;

const parts = ORDER.map((name) => readFileSync(join(SEG_DIR, name)));
const out = Buffer.concat(parts);
const sha256 = createHash("sha256").update(out).digest("hex");

console.log("segments:");
ORDER.forEach((name, i) => console.log("  " + String(parts[i].length).padStart(7) + "  " + name));
console.log("total:    " + String(out.length).padStart(7) + " bytes");
console.log("sha256:   " + sha256);
console.log("expected: " + EXPECTED_SHA256);

const ok = sha256 === EXPECTED_SHA256 && out.length === EXPECTED_BYTES;
if (!ok) {
  console.error("MISMATCH: reassembled main.pjs does not match the shipped generator.");
  process.exit(1);
}
console.log("OK: byte-exact match with the shipped main.pjs.");

if (process.argv.includes("--write")) {
  const target = join(process.cwd(), "main.pjs.rebuilt");
  writeFileSync(target, out);
  console.log("wrote " + target);
}
