# 05 — Build & config files

The only build step in the project: turning the `src/` ES-module tree into the single
minified bundle that the Perchance plugin facade lazy-loads.

| File | Role |
| --- | --- |
| `package.json` | Package metadata + the `build` script and the `esbuild` devDependency. |
| `build.mjs` | The esbuild pipeline (entry `src/forge.js` -> `dist/forge-bundle.js`). |

## Usage

```bash
npm install            # installs esbuild (^0.21.5)
npm run build          # ../06-dist/forge-bundle.js
```

Override the paths if you rearranged the archive:

```bash
SRC=../01-internal-code/src OUT=../06-dist/forge-bundle.js node build.mjs
```

## What the build does

1. Entry point is `export * from "./forge.js"` fed to esbuild via `stdin`, so the bundle's
   named exports are exactly the module's public API (`generate`, `serialize`, `buildTmx`,
   `renderFull`, `mountMapForge`, `openMapForge`, `pluginInfo`, ...).
2. `format: "esm"`, `target: "es2020"`, `minify: true`, `bundle: true`, `write: false`.
3. A tiny plugin resolves the two asset imports (`./terrain.png`, `./props.png`) into
   `export default "./terrain.png"` strings — the actual PNGs are hosted separately and their
   URLs are injected at runtime by `lpcMapForgePlugin()` in `main.pjs`. Every other import is
   read from disk and inlined, so the whole `src/` tree lands in one file.

## Browser variant (what the Perchance editor uses)

The editor runs the *same* pipeline entirely in the browser, via `esbuild-wasm` inside a Web
Worker — no Node, no install:

```js
const esbuild = (await import("https://esm.sh/esbuild-wasm@0.21.5?bundle")).default;
await esbuild.initialize({ wasmURL: "https://esm.sh/esbuild-wasm@0.21.5/esbuild.wasm" });

const assetUrls = {
  name: "asset-urls",
  setup(build) {
    build.onResolve({ filter: /^\// }, (a) => ({ path: a.path.slice(1), namespace: "assets" }));
    build.onResolve({ filter: /^\./ }, (a) => ({
      path: a.path, namespace: "assets", pluginData: { resolveDir: a.resolveDir },
    }));
    build.onLoad({ filter: /.*/, namespace: "assets" }, async (a) => {
      const dir = a.pluginData?.resolveDir ?? "src";
      if (a.path.endsWith(".png")) return { contents: `export default "./${a.path.split("/").pop()}";`, loader: "js" };
      let p = a.path.replace(/^\/+/, "").replace(/^\.\//, "");
      if (!p.startsWith("src/")) p = (dir === "src" ? "src/" : dir + "/") + p;
      const contents = await fs.readTextFile(p);            // the editor's virtual FS
      return { contents, loader: "js", resolveDir: p.split("/").slice(0, -1).join("/") || "." };
    });
  },
};

const out = await esbuild.build({
  stdin: { contents: `export * from "./forge.js";`, resolveDir: "src", loader: "js", sourcefile: "entry.js" },
  bundle: true, format: "esm", target: "es2020", minify: true, write: false, plugins: [assetUrls],
});
// out.outputFiles[0].text  ->  upload_file  ->  paste the URL as BUNDLE_URL in main.pjs
```

## Release checklist

1. `npm run build`
2. Upload `06-dist/forge-bundle.js` (Perchance `upload_file`) and paste the URL into
   `BUNDLE_URL` in `main.pjs`.
3. If `src/props.png` or `src/terrain.png` changed, upload those too and update `PROPS_URL` /
   `TILESET_URL`.
4. Bump `VERSION` in `lpcMapForgePlugin()`.
5. Reload the generator and confirm the console is clean.
