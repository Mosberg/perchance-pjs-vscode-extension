#!/usr/bin/env node
// Rebuilds an IIFE bundle of `marked` with global name __docsMarkedBundle - the shape the plugin expects.
// Content-equivalent to the shipped bundle, not guaranteed byte-identical.
//
//   npm i marked esbuild
//   node rebuild-marked-bundle.mjs [outFile]
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const out = process.argv[2] || "marked.bundle.min.js";
const result = await build({
  entryPoints: ["marked"],
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "__docsMarkedBundle",
  platform: "browser",
  write: false,
});
writeFileSync(out, result.outputFiles[0].text);
console.log("wrote " + out);