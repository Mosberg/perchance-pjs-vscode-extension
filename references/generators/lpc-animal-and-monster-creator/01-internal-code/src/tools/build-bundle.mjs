// Bundle builder for the LPC Animal & Monster Creator.
//
// Bundles src/plugin.js (which pulls in core.js + app.js + styles.js) into one
// ES module, with DEFAULT_CATALOG_URL baked in, so another generator can do
// `import("<hosted bundle url>")` and use the sprite API without knowing
// anything about this generator's src/ tree.
//
// Run it from any environment that can load esbuild-wasm and read/write the
// workspace files (the agent's execute_js tool, or a browser worker):
//
//   const esbuild = await import("https://esm.sh/esbuild-wasm@0.21.5?bundle");
//   const mod = await import("./src/tools/build-bundle.mjs");
//   await mod.buildBundle({ fs, catalogUrl: "<hosted catalog.json url>", outPath: "scratch/lpc-animals.bundle.js" });
//
// The exact recipe (including the upload steps whose URLs you need to paste
// back into main.pjs) is written up in src/BUILD.md.
//
// This file deliberately has no imports so it can be loaded from a Blob URL
// (or any single-file context); the caller passes the version in, taken from
// PLUGIN_VERSION in src/lpc-creatures/core.js.

export const ESBUILD_VERSION = "0.21.5";

export async function buildBundle({ fs, catalogUrl, outPath = "scratch/lpc-animals.bundle.js", minify = true, version = "1.0.0" }) {
  if (!fs || typeof fs.readTextFile !== "function") throw new Error("buildBundle({ fs }): a filesystem is required");
  if (!catalogUrl) throw new Error("buildBundle({ catalogUrl }): the hosted catalog.json url is required");

  const esbuildMod = await import("https://esm.sh/esbuild-wasm@" + ESBUILD_VERSION + "?bundle");
  const esbuild = esbuildMod.default && typeof esbuildMod.default.initialize === "function" ? esbuildMod.default : esbuildMod;
  if (typeof esbuild.initialize !== "function") {
    throw new Error("esbuild-wasm did not expose initialize() (keys: " + Object.keys(esbuildMod).join(", ") + ")");
  }
  await esbuild.initialize({ wasmURL: "https://esm.sh/esbuild-wasm@" + ESBUILD_VERSION + "/esbuild.wasm" });

  const normalize = (p) => {
    const parts = [];
    for (const seg of p.replace(/^\.\//, "").split("/")) {
      if (seg === "." || seg === "") continue;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    }
    return parts.join("/");
  };
  const dirname = (p) => p.split("/").slice(0, -1).join("/");

  const result = await esbuild.build({
    entryPoints: ["src/plugin.js"],
    bundle: true,
    format: "esm",
    target: "es2022",
    minify,
    legalComments: "none",
    write: false,
    define: { __CATALOG_URL__: JSON.stringify(catalogUrl) },
    banner: {
      js: "/* LPC Animal & Monster Creator v" + version + " — bundle of src/plugin.js (see src/BUILD.md).\n" +
        "   Catalog: " + catalogUrl + "\n" +
        "   Art: LPC community packs — see catalog.packs for the per-pack attribution. */",
    },
    plugins: [
      {
        name: "workspace",
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            // The entry point comes in with no importer; everything else is a
            // relative import from a file we already resolved.
            if (!args.importer) return { path: normalize(args.path), namespace: "workspace" };
            if (!/^\.\.?\//.test(args.path)) {
              throw new Error("The bundle must stay self-contained; unexpected bare import: " + args.path);
            }
            return { path: normalize(dirname(args.importer) + "/" + args.path), namespace: "workspace" };
          });
          build.onLoad({ filter: /.*/, namespace: "workspace" }, async (args) => {
            const contents = await fs.readTextFile(args.path);
            return { contents, loader: args.path.endsWith(".json") ? "json" : "js", resolveDir: dirname(args.path) };
          });
        },
      },
    ],
  });

  const file = result.outputFiles[0];
  const text = file.text;
  if (typeof fs.writeTextFile === "function") await fs.writeTextFile(outPath, text);
  else await fs.writeFile(outPath, new TextEncoder().encode(text));
  return { path: outPath, bytes: new TextEncoder().encode(text).length, catalogUrl, version };
}
