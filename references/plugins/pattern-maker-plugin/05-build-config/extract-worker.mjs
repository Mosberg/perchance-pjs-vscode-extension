// Rebuilds 01-internal-code/wavefunction-collapse.worker.js from 01-internal-code/main.pjs.
// There is no other "build step" for this generator: Perchance compiles main.pjs + index.html
// in the browser at load time. The one pre-built artifact is the minified WFC worker, which
// lives *inside* main.pjs as a template string and is extracted here for readability/diffing.
//
//   node 05-build-config/extract-worker.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const mainPjs = readFileSync(join(root, "01-internal-code/main.pjs"), "utf8");

const startMarker = "new Blob([";
const start = mainPjs.indexOf(startMarker) + startMarker.length;
const endMarker = '], { type: "text/javascript" })';
const end = mainPjs.indexOf(endMarker, start);
if (start < startMarker.length || end === -1) throw new Error("could not locate workerScriptBlob in main.pjs");

let lines = mainPjs.slice(start + 1, end).split("\n");
while (lines.length && lines[0].trim() === "") lines.shift();
while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length);
const dedent = Math.min(...indents);
const body = lines
  .map((l) => (l.startsWith(" ".repeat(dedent)) ? l.slice(dedent) : l))
  .join("\n")
  .replace(/\\`/g, "`")
  .replace(/\\(\$\{)/g, "$1");

const header = `// wavefunction-collapse.worker.js
// EXTRACTED (verbatim) from the "workerScriptBlob" template string inside main.pjs.
// Runtime: classic WebWorker (Worker(URL.createObjectURL(blob)), not a module worker).
// Contents: minified build of kchapelier/wavefunctioncollapse (model.js + overlapping-model.js +
// random-indice.js, MIT) plus a project-specific worker harness (request/stop protocol).
// Upstream unminified source: ../02-external-code/wavefunctioncollapse/
// Regenerate this file from main.pjs with: node 05-build-config/extract-worker.mjs
`;

writeFileSync(join(root, "01-internal-code/wavefunction-collapse.worker.js"), header + body + "\n");
console.log("wrote 01-internal-code/wavefunction-collapse.worker.js");
