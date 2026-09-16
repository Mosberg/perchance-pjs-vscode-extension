// LPC Map Forge - bundle build pipeline
//
// Bundles src/forge.js (plus every module it imports) into a single ES-module bundle
// that the Perchance plugin facade in main.pjs can `import()` lazily.
//
// Usage (from this folder):
//   npm install          # installs esbuild
//   npm run build        # writes ../06-dist/forge-bundle.js
//
// Paths are relative to the package layout of this archive:
//   ../01-internal-code/src   -> bundle input
//   ../06-dist/forge-bundle.js -> bundle output
// Override with:  SRC=/path/to/src OUT=/path/to/out.js node build.mjs
//
// The source tree is never modified; this script only reads src/ and writes the bundle.
// See ../04-project-resources/README.md -> "Rebuilding the plugin bundle" for the
// equivalent browser-side recipe (esbuild-wasm inside a Web Worker), which is what the
// Perchance editor itself uses.

import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";

const SRC = process.env.SRC || "../01-internal-code/src";
const OUT = process.env.OUT || "../06-dist/forge-bundle.js";

// Minimal plugin: `import atlas from "./props.png"` becomes `export default "./props.png"`
// (the PNGs are hosted separately and their URLs are injected by main.pjs at runtime),
// and anything that is not a PNG is inlined as JavaScript by walking the src/ tree.
const assetUrls = {
  name: "asset-urls",
  setup(build) {
    build.onResolve({ filter: /^\// }, (args) => ({
      path: args.path.slice(1),
      namespace: "assets",
    }));
    build.onResolve({ filter: /^\./ }, (args) => ({
      path: args.path,
      namespace: "assets",
      pluginData: { resolveDir: args.resolveDir },
    }));
    build.onLoad({ filter: /.*/, namespace: "assets" }, (args) => {
      const dir = args.pluginData?.resolveDir ?? SRC;
      if (args.path.endsWith(".png")) {
        return { contents: `export default "./${basename(args.path)}";`, loader: "js" };
      }
      const file = resolve(dir, args.path);
      return {
        contents: readFileSync(file, "utf8"),
        loader: "js",
        resolveDir: dirname(file),
      };
    });
  },
};

const result = await esbuild.build({
  stdin: {
    contents: `export * from "./forge.js";`,
    resolveDir: SRC,
    loader: "js",
    sourcefile: "entry.js",
  },
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: true,
  write: false,
  plugins: [assetUrls],
  logLevel: "warning",
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, result.outputFiles[0].text);
console.log(`${OUT} written (${result.outputFiles[0].text.length} bytes)`);
