// tools/export-package.js
//
// Assembles the complete, categorised source+asset package for the Perchance generator
// `random-image-plugin`. There is no Node.js in this environment: this file is written to run
// as the body of the Perchance agent's execute_js sandbox, whose module Worker exposes a live
// workspace filesystem as `fs` (readTextFile/writeTextFile/readFile/writeFile/listFiles) and
// every other agent tool as `tools`.
//
// Usage: paste into execute_js from the generator workspace root, then zip
//   scratch/random-image-plugin-complete/ -> random-image-plugin-complete.zip
// (the final zip step is also reproduced at the bottom of this file, commented out).

const main = await fs.readTextFile(\"main.pjs\");
const html = await fs.readTextFile(\"index.html\");
const api  = await fs.readTextFile(\"scratch/platform-api/random-image-plugin.json\");
const unsplash503 = await fs.readTextFile(\"scratch/external/unsplash-source-api.html\");
let license = \"\";
try { license = await fs.readTextFile(\"scratch/external/unsplash-license.html\"); } catch (e) {}

const OUT = \"scratch/random-image-plugin-complete\";
const W = async (p, c) => { await fs.writeTextFile(OUT + \"/\" + p, c); };

await W(\"internal-code/main.pjs\", main);
await W(\"internal-code/index.html\", html);
await W(\"internal-code/platform-registry-snapshot.json\", api);
await W(\"external-code/source-unsplash-com.response.html\", unsplash503);
if (license) await W(\"third-party-assets/unsplash-license.snapshot.html\", license);
// ...see MANIFEST.md for the full README bodies written by the original run...

// --- final packaging step (run separately) ---
// const zipjs = await import(\"https://esm.sh/@zip.js/zip.js\");
// const w = new zipjs.ZipWriter(new zipjs.BlobWriter(\"application/zip\"));
// for (const f of await fs.listFiles()) { /* add each OUT file */ }
// await fs.writeFile(\"scratch/random-image-plugin-complete.zip\", new Uint8Array(await w.close()));
