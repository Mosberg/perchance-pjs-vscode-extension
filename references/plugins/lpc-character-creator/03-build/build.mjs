// Bundles the LPC Character Creator sources into one self-contained ES module.
//
// Usage:  node build.mjs [--src <dir>] [--out <file>]
//   --src  directory holding creator.js / engine.js / ui.js   (default: ../src)
//   --out  output file for the built bundle                    (default: ../dist/lpc-creator-plugin.js)
//
// Requires esbuild (devDependency). The dist file is what main.pjs loads as
// BUNDLE_URL; bump PLUGIN_VERSION in creator.js whenever you rebuild.
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const srcDir = path.resolve(here, arg("--src", "../src"));
const outFile = path.resolve(here, arg("--out", "../dist/lpc-creator-plugin.js"));

const result = await build({
  entryPoints: ["lpc-entry"],
  bundle: true,
  format: "esm",
  write: false,
  minify: false,
  logLevel: "info",
  plugins: [
    {
      name: "lpc-entry",
      setup(b) {
        b.onResolve({ filter: /^lpc-entry$/ }, () => ({ path: "lpc-entry", namespace: "lpc" }));
        b.onLoad({ filter: /^lpc-entry$/, namespace: "lpc" }, () => ({
          contents: 'export * from "./creator.js";',
          resolveDir: srcDir,
          loader: "js",
        }));
      },
    },
  ],
});

const text = result.outputFiles[0].text;
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, text);
console.log("built " + outFile + " (" + text.length + " bytes)");
