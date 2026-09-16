/**
 * tools/package.mjs
 *
 * Rebuilds `select-leaves-plugin-complete.zip` (byte-exact sources + a
 * SHA-256 `INVENTORY.md`) from a source tree.
 *
 * This is HANDOFF TOOLING ONLY — it is not part of the Perchance generator
 * and has no effect on the shipped `main.pjs` / `index.html`.
 *
 * Run it in the Perchance AI-helper worker (which provides `fs` and
 * `tools`), e.g.:
 *
 *     await import("./tools/package.mjs");
 *
 * or copy the body into an execute_js call. Requires only `@zip.js/zip.js`
 * from esm.sh.
 */

const SRC = "workspace-root";            // prefix of the source snapshot
const OUT = "scratch/select-leaves-plugin-complete.zip";
const ROOT = "select-leaves-plugin-complete";

/** Source path (as it exists in the workspace) -> path inside the zip. */
const LAYOUT = [
  // ---- 01 internal / first-party code -------------------------------------
  ["main.pjs",                                  `${ROOT}/01-internal-code/main.pjs`],
  ["index.html",                                `${ROOT}/01-internal-code/index.html`],

  // ---- 02 dependencies (vendored by the engine into imports/) ------------
  ["imports/select-leaf-plugin/main.pjs",       `${ROOT}/02-dependencies/imports/select-leaf-plugin/main.pjs`],

  // ---- 03 external generators (siblings this project links to) -----------
  ["scratch/generators/select-leaf-plugin/main.pjs",
   `${ROOT}/03-external-generators/select-leaf-plugin/main.pjs`],
  ["scratch/generators/select-leaf-plugin/index.html",
   `${ROOT}/03-external-generators/select-leaf-plugin/index.html`],
  ["scratch/generators/consumable-leaf-list-plugin/main.pjs",
   `${ROOT}/03-external-generators/consumable-leaf-list-plugin/main.pjs`],
  ["scratch/generators/consumable-leaf-list-plugin/index.html",
   `${ROOT}/03-external-generators/consumable-leaf-list-plugin/index.html`],
  ["scratch/generators/select-leaves-plugin-example/main.pjs",
   `${ROOT}/03-external-generators/select-leaves-plugin-example/main.pjs`],
  ["scratch/generators/select-leaves-plugin-example/index.html",
   `${ROOT}/03-external-generators/select-leaves-plugin-example/index.html`],

  // ---- 04 assets (none by nature; the record is the asset) ---------------
  ["scratch/pkg/ASSETS.md",                     `${ROOT}/04-assets/ASSETS.md`],

  // ---- 05 build/config ---------------------------------------------------
  ["scratch/pkg/BUILD.md",                      `${ROOT}/05-build-config/BUILD.md`],
  ["scratch/pkg/package.json",                  `${ROOT}/05-build-config/package.json`],
  ["scratch/pkg/tools/package.mjs",             `${ROOT}/05-build-config/tools/package.mjs`],

  // ---- 99 harness instructions (shipped for completeness) ----------------
  ["AGENTS.md",                                 `${ROOT}/99-agent-instructions/AGENTS.md`],

  // ---- docs --------------------------------------------------------------
  ["scratch/pkg/README.md",                     `${ROOT}/README.md`],
];

const enc = new TextEncoder();

export async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function build({ zipjs, fs, writeZip = true } = {}) {
  const lib = zipjs || await import("https://esm.sh/@zip.js/zip.js@2.7.45");
  const { ZipWriter, BlobWriter, BlobReader } = lib;
  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
  const rows = [];

  for (const [srcPath, zipPath] of LAYOUT) {
    const bytes = await fs.readFile(srcPath);          // Uint8Array, byte-exact
    await zipWriter.add(zipPath, new BlobReader(new Blob([bytes])));
    rows.push({
      zipPath,
      source: srcPath,
      bytes: bytes.byteLength,
      sha256: await sha256Hex(bytes),
    });
  }

  // INVENTORY.md is generated from the bytes actually written, so it can
  // never drift from the payload.
  const totalBytes = rows.reduce((n, r) => n + r.bytes, 0);
  const inventory = [
    "# INVENTORY — every file in this package",
    "",
    `Total files: **${rows.length}**  |  Total source size: **${totalBytes} bytes** (${(totalBytes / 1024).toFixed(2)} KiB)`,
    "",
    "SHA-256 hashes are of the exact bytes stored in the zip.",
    "",
    "| # | Path in package | Source path | Bytes | SHA-256 |",
    "|---|---|---|---|---|",
    ...rows.map((r, i) => `| ${i + 1} | \`${r.zipPath.slice(ROOT.length + 1)}\` | \`${r.source}\` | ${r.bytes} | \`${r.sha256}\` |`),
    "",
    "## Roles",
    "",
    "| Folder | Category | Contents |",
    "|---|---|---|",
    "| `01-internal-code` | Internal code | This generator's own `main.pjs` + `index.html` |",
    "| `02-dependencies` | External code (imported) | `imports/` reference copy of `{import:select-leaf-plugin}` |",
    "| `03-external-generators` | External code (related) | Standalone sources of the linked sibling generators |",
    "| `04-assets` | Project resources | No binary assets exist; `ASSETS.md` documents the inventory |",
    "| `05-build-config` | Build / config | No build step; packaging metadata + reproducible zipper |",
    "| `99-agent-instructions` | Tooling docs | The AI-helper instruction file, shipped for completeness |",
    "",
    `Assembled: ${new Date().toISOString()}`,
    "",
  ].join("\n");

  await zipWriter.add(`${ROOT}/INVENTORY.md`, new BlobReader(new Blob([enc.encode(inventory)])));

  if (writeZip) {
    const blob = await zipWriter.close();
    const buf = new Uint8Array(await blob.arrayBuffer());
    await fs.writeFile(OUT, buf);
    await fs.writeTextFile("scratch/INVENTORY.md", inventory);
    return { ok: true, zip: OUT, bytes: buf.byteLength, files: rows.length, totalSourceBytes: totalBytes, rows };
  }
  return { ok: true, rows, inventory };
}

// Allow `await import("./tools/package.mjs")` to just run it.
if (typeof fs !== "undefined" && typeof crypto !== "undefined" && globalThis.__PACKAGE_ON_IMPORT__ !== false) {
  try {
    const zipjs = await import("https://esm.sh/@zip.js/zip.js@2.7.45");
    const result = await build({ zipjs, fs });
    console.log(`wrote ${result.zip} (${result.files} files, ${result.bytes} bytes)`);
  } catch (e) {
    console.log("package.mjs: not running in the helper worker (no global fs) — import and call build() explicitly");
  }
}
