#!/usr/bin/env node
// Extracts the byte-exact inlined `marked` bundle from the plugin source (main.pjs).
// Usage: node extract-marked-bundle.mjs [sourceMainPjs] [outputBundle]
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const src = process.argv[2] || new URL("../../01-internal-code/main.pjs", import.meta.url);
const out = process.argv[3] || new URL("../../03-third-party-assets/marked/marked.bundle.min.js", import.meta.url);

const text = readFileSync(src, "utf8");
const line = text.split("\n").find((l) => l.includes("__docsMarkedBundle=("));
if (!line) throw new Error("could not find the inline marked bundle in " + src);

const start = line.indexOf("var __docsMarkedBundle=");
const end = line.indexOf(" return __docsMarkedBundle.marked;");
if (start < 0 || end < 0) throw new Error("bundle markers not found");

const bundle = line.slice(start, end).trim() + "\n";
writeFileSync(out, bundle);
console.log("wrote " + (out.pathname || out) + " (" + Buffer.byteLength(bundle) + " bytes)");
console.log("sha256 " + createHash("sha256").update(bundle).digest("hex"));