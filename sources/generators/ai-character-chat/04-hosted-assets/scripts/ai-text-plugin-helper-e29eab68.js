/*
Change tokenizer:
Pass `--tokenizer=/abs/path/to/tokenizer.json`.

Generate `inference.js`:
```sh
deno run --allow-write=. --allow-net ./train.js
```

Use `inference.js`:
```js
import { countTokensApprox } from "./inference.js";

console.log(countTokensApprox("hello world"));
console.log(countTokensApprox("hello 世界 👋"));
```

Default remote datasets:
- train: https://user.uploads.dev/file/3f12eadda3a055b282f8e315884d9ebb.jsonl
- test: https://user.uploads.dev/file/53a2308e585e419352f831a7f4e674bb.jsonl

This trainer is self-contained. By default it fetches the train/test JSONL files and the tokenizer
JSON/config over the network, trains the estimator, prints held-out accuracy metrics, and writes a
single bundled `inference.js`.

Tokenizer config format:
```json
{
  "name": "your-tokenizer",
  "modelId": "optional-label",
  "tokenizerJsonUrl": "https://.../tokenizer.json",
  "tokenizerConfigUrl": "https://.../tokenizer_config.json",
  "timeoutMs": 60000
}
```

Notes:
- default training uses the first `50,000` train rows and all test rows
- use `--train-limit=all` to train on the full remote training set
- if you pass a local tokenizer config file, also add `--allow-read`
*/

const DEFAULT_TRAIN_INPUT = new URL(
  "https://user.uploads.dev/file/3f12eadda3a055b282f8e315884d9ebb.jsonl",
);
const DEFAULT_TEST_INPUT = new URL(
  "https://user.uploads.dev/file/53a2308e585e419352f831a7f4e674bb.jsonl",
);
const DEFAULT_OUTPUT = new URL("./inference.js", import.meta.url);

const DEFAULT_TOKENIZER = {
  name: "deepseek-r1-0528",
  modelId: "deepseek-ai/DeepSeek-R1-0528",
  tokenizerJsonUrl:
    "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/resolve/main/tokenizer.json",
  tokenizerConfigUrl:
    "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/resolve/main/tokenizer_config.json",
  timeoutMs: 60000,
};

const MAGIC = [0x44, 0x42, 0x47, 0x31]; // "DBG1"
const VERSION = 1;
const BASELINE_CHARS_PER_TOKEN = 3.9;
const UNIGRAM_SCALE = 4096;
const BIGRAM_SCALE = 2048;
const BIGRAM_KEEP = 3072;
const SENTINEL = 256;
const DEFAULT_TRAIN_LIMIT = 50000;

function getArgValue(name, fallback) {
  const prefix = `${name}=`;
  const direct = Deno.args.find((arg) => arg.startsWith(prefix));
  return direct ? direct.slice(prefix.length) : fallback;
}

function parseOptionalInt(value) {
  if (value === "" || value === "all") return Infinity;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
}

function parseArgs() {
  return {
    trainInput: resolveSpecifier(getArgValue("--train-input", DEFAULT_TRAIN_INPUT.href)),
    testInput: resolveSpecifier(getArgValue("--test-input", DEFAULT_TEST_INPUT.href)),
    output: resolveSpecifier(getArgValue("--output", DEFAULT_OUTPUT.href)),
    keep: Number(getArgValue("--keep", String(BIGRAM_KEEP))),
    tokenizerConfigPath: getArgValue("--tokenizer", ""),
    trainLimit: parseOptionalInt(getArgValue("--train-limit", String(DEFAULT_TRAIN_LIMIT))),
    testLimit: parseOptionalInt(getArgValue("--test-limit", "all")),
  };
}

async function readJson(pathOrUrl) {
  const url = pathOrUrl instanceof URL ? pathOrUrl : new URL(pathOrUrl);
  return JSON.parse(await Deno.readTextFile(url));
}

function resolveSpecifier(value, baseUrl = import.meta.url) {
  if (value instanceof URL) return value;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("file://")) {
    return new URL(value);
  }
  return new URL(value, baseUrl);
}

async function fetchJson(url, timeoutMs) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

async function fetchText(url, timeoutMs) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

function resolveTokenizerConfig(tokenizerConfigPath) {
  if (!tokenizerConfigPath) return DEFAULT_TOKENIZER;
  return readJson(resolveSpecifier(tokenizerConfigPath));
}

async function loadJsonResource(pathOrUrl, timeoutMs) {
  const specifier = resolveSpecifier(pathOrUrl);
  if (specifier.protocol === "file:") {
    return await readJson(specifier);
  }
  return await fetchJson(specifier.href, timeoutMs);
}

async function loadTextResource(pathOrUrl, timeoutMs = 60000) {
  const specifier = resolveSpecifier(pathOrUrl);
  if (specifier.protocol === "file:") {
    return await Deno.readTextFile(specifier);
  }
  return await fetchText(specifier.href, timeoutMs);
}

async function loadTokenizer(tokenizerConfigPath) {
  const config = await resolveTokenizerConfig(tokenizerConfigPath);
  const timeoutMs = config.timeoutMs ?? 60000;
  const [{ Tokenizer }, tokenizerJson, tokenizerConfig] = await Promise.all([
    import("npm:@huggingface/tokenizers@0.1.2"),
    loadJsonResource(config.tokenizerJsonUrl, timeoutMs),
    loadJsonResource(config.tokenizerConfigUrl, timeoutMs),
  ]);
  const tokenizer = new Tokenizer(tokenizerJson, tokenizerConfig);
  return {
    config,
    encodeCount(text) {
      return tokenizer.encode(text).ids.length;
    },
  };
}

async function readJsonLines(path, limit = Infinity) {
  const rows = [];
  const text = await loadTextResource(path);
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line));
    if (rows.length >= limit) break;
  }
  return rows;
}

function summarizeGroups(rows) {
  const counts = {};
  for (const row of rows) {
    counts[row.group] = (counts[row.group] ?? 0) + 1;
  }
  return counts;
}

async function countRows(rows, tokenizer, label) {
  const countedRows = new Array(rows.length);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    countedRows[index] = {
      ...row,
      tokenCount: tokenizer.encodeCount(row.text),
    };
    if ((index + 1) % 5000 === 0 || index + 1 === rows.length) {
      console.error(`[${label}] Counted ${index + 1}/${rows.length} rows...`);
    }
  }
  return countedRows;
}

function quantizeSigned(values, scale) {
  const result = new Int16Array(values.length);
  for (let index = 0; index < values.length; index += 1) {
    result[index] = Math.max(-32768, Math.min(32767, Math.round(values[index] * scale)));
  }
  return result;
}

function sparseByteCounts(text, encoder) {
  const bytes = encoder.encode(text);
  const counts = new Uint16Array(256);
  const indices = [];
  for (const byte of bytes) {
    if (counts[byte] === 0) indices.push(byte);
    counts[byte] += 1;
  }
  return [indices, indices.map((index) => counts[index])];
}

function buildBoundaryPairCounts(text, encoder) {
  const bytes = encoder.encode(text);
  const counts = new Map();
  let prev = SENTINEL;
  for (const byte of bytes) {
    const pair = prev * 257 + byte;
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
    prev = byte;
  }
  counts.set(prev * 257 + SENTINEL, (counts.get(prev * 257 + SENTINEL) ?? 0) + 1);
  const indices = [...counts.keys()];
  const values = indices.map((index) => counts.get(index));
  return [indices, values];
}

function buildSelectedPairCounts(text, encoder, pairToIndex) {
  const bytes = encoder.encode(text);
  const counts = new Map();
  let prev = SENTINEL;
  for (const byte of bytes) {
    const pair = prev * 257 + byte;
    const mapped = pairToIndex.get(pair);
    if (mapped !== undefined) counts.set(mapped, (counts.get(mapped) ?? 0) + 1);
    prev = byte;
  }
  const endMapped = pairToIndex.get(prev * 257 + SENTINEL);
  if (endMapped !== undefined) counts.set(endMapped, (counts.get(endMapped) ?? 0) + 1);
  const indices = [...counts.keys()];
  const values = indices.map((index) => counts.get(index));
  return [indices, values];
}

function trainSparseLinearModel(
  { featureCount, epochs, learningRate, l2, rows, buildExample, label },
) {
  const weights = new Float64Array(featureCount);
  let bias = 0;
  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const rate = learningRate / (1 + epoch * 0.35);
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const example = buildExample(rows[rowIndex]);
      const [indices, values] = example.x;
      let pred = bias;
      let norm = 1;
      for (let i = 0; i < indices.length; i += 1) {
        pred += weights[indices[i]] * values[i];
        norm += values[i] * values[i];
      }
      const error = pred - example.y;
      const step = (rate * error) / norm;
      bias -= step;
      for (let i = 0; i < indices.length; i += 1) {
        const featureIndex = indices[i];
        weights[featureIndex] = weights[featureIndex] * (1 - rate * l2) - step * values[i];
      }
    }
    console.error(`[${label}] Finished epoch ${epoch + 1}/${epochs}`);
  }
  return { bias, weights };
}

function estimateUnigram(text, bias, weights, encoder) {
  const bytes = encoder.encode(text);
  let total = bias;
  for (const byte of bytes) total += weights[byte];
  return total;
}

function selectTopBigrams(rows, unigramBias, unigramWeights, keep, encoder) {
  const freq = new Uint32Array(257 * 257);
  const corr = new Float64Array(257 * 257);

  for (const row of rows) {
    const residual = row.tokenCount -
      estimateUnigram(row.text, unigramBias, unigramWeights, encoder);
    const [indices, values] = buildBoundaryPairCounts(row.text, encoder);
    for (let index = 0; index < indices.length; index += 1) {
      const pair = indices[index];
      const value = values[index];
      freq[pair] += value;
      corr[pair] += residual * value;
    }
  }

  const scored = [];
  for (let pair = 0; pair < freq.length; pair += 1) {
    if (freq[pair] < 4) continue;
    const score = Math.abs(corr[pair]) / Math.sqrt(freq[pair]);
    if (score <= 0) continue;
    scored.push({ pair, score });
  }
  scored.sort((left, right) => right.score - left.score);
  return Uint32Array.from(scored.slice(0, keep).map((item) => item.pair));
}

function encodeVarUint(value, output) {
  let remaining = value >>> 0;
  while (remaining >= 0x80) {
    output.push((remaining & 0x7f) | 0x80);
    remaining >>>= 7;
  }
  output.push(remaining);
}

function encodeDeltaVarints(sortedKeys) {
  const bytes = [];
  let prev = 0;
  for (const key of sortedKeys) {
    const delta = key - prev;
    encodeVarUint(delta, bytes);
    prev = key;
  }
  return Uint8Array.from(bytes);
}

async function gzipBytes(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function packModel({ bias, unigramWeights, selectedPairs, selectedWeights }) {
  const deltaBytes = encodeDeltaVarints(selectedPairs);
  const headerSize = 4 + 2 + 2 + 4 + 4 + 4 + 4 + 4;
  const unigramBytes = unigramWeights.byteLength;
  const bigramWeightBytes = selectedWeights.byteLength;
  const totalSize = headerSize + unigramBytes + deltaBytes.byteLength + bigramWeightBytes;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let offset = 0;

  for (const byte of MAGIC) view.setUint8(offset++, byte);
  view.setUint16(offset, VERSION, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setFloat32(offset, bias, true);
  offset += 4;
  view.setFloat32(offset, UNIGRAM_SCALE, true);
  offset += 4;
  view.setFloat32(offset, BIGRAM_SCALE, true);
  offset += 4;
  view.setUint32(offset, selectedPairs.length, true);
  offset += 4;
  view.setUint32(offset, deltaBytes.byteLength, true);
  offset += 4;

  new Uint8Array(buffer, offset, unigramBytes).set(
    new Uint8Array(unigramWeights.buffer, unigramWeights.byteOffset, unigramWeights.byteLength),
  );
  offset += unigramBytes;
  new Uint8Array(buffer, offset, deltaBytes.byteLength).set(deltaBytes);
  offset += deltaBytes.byteLength;
  new Uint8Array(buffer, offset, bigramWeightBytes).set(
    new Uint8Array(selectedWeights.buffer, selectedWeights.byteOffset, selectedWeights.byteLength),
  );
  return new Uint8Array(buffer);
}

function createQuantizedPredictor({ bias, unigramWeights, selectedPairs, selectedWeights }) {
  const pairWeights = new Map();
  for (let index = 0; index < selectedPairs.length; index += 1) {
    pairWeights.set(selectedPairs[index], selectedWeights[index] / BIGRAM_SCALE);
  }
  const encoder = new TextEncoder();
  return (text) => {
    const bytes = encoder.encode(text);
    let total = bias;
    let prev = SENTINEL;
    for (const byte of bytes) {
      total += unigramWeights[byte] / UNIGRAM_SCALE;
      total += pairWeights.get(prev * 257 + byte) ?? 0;
      prev = byte;
    }
    total += pairWeights.get(prev * 257 + SENTINEL) ?? 0;
    return total;
  };
}

function evaluatePredictor(rows, predictor) {
  const byGroup = {};
  let totalAbsError = 0;
  let totalSquaredError = 0;
  let totalActual = 0;
  let totalRelativeError = 0;
  for (const row of rows) {
    const predicted = predictor(row.text);
    const absError = Math.abs(predicted - row.tokenCount);
    const squaredError = (predicted - row.tokenCount) ** 2;
    const relativeError = absError / Math.max(1, row.tokenCount);
    totalAbsError += absError;
    totalSquaredError += squaredError;
    totalActual += row.tokenCount;
    totalRelativeError += relativeError;
    if (!byGroup[row.group]) {
      byGroup[row.group] = {
        count: 0,
        absError: 0,
        squaredError: 0,
        actual: 0,
      };
    }
    byGroup[row.group].count += 1;
    byGroup[row.group].absError += absError;
    byGroup[row.group].squaredError += squaredError;
    byGroup[row.group].actual += row.tokenCount;
  }
  const count = rows.length;
  const summary = {
    count,
    mae: totalAbsError / Math.max(1, count),
    rmse: Math.sqrt(totalSquaredError / Math.max(1, count)),
    wape: totalAbsError / Math.max(1, totalActual),
    meanRelativeError: totalRelativeError / Math.max(1, count),
  };
  summary.accuracy = 1 - summary.wape;

  const grouped = {};
  for (const [group, stats] of Object.entries(byGroup)) {
    const wape = stats.absError / Math.max(1, stats.actual);
    grouped[group] = {
      count: stats.count,
      mae: stats.absError / Math.max(1, stats.count),
      rmse: Math.sqrt(stats.squaredError / Math.max(1, stats.count)),
      wape,
      accuracy: 1 - wape,
    };
  }
  summary.byGroup = grouped;
  return summary;
}

function renderBundledInference(modelBase64) {
  return `const MODEL_GZ_BASE64 = ${JSON.stringify(modelBase64)};
const MAGIC = [0x44, 0x42, 0x47, 0x31];
const VERSION = 1;
const EMPTY_KEY = 0xffffffff;

function decodeVarUint(bytes, offsetRef) {
  let shift = 0;
  let value = 0;
  while (true) {
    const byte = bytes[offsetRef.value++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return value >>> 0;
    shift += 7;
  }
}

function nextPow2(value) {
  let size = 1;
  while (size < value) size <<= 1;
  return size;
}

function keyHash(key) {
  let value = key >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return value >>> 0;
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function gunzipBytes(gzipBytes) {
  const stream = new Blob([gzipBytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function parseModelBytes(modelBytes) {
  const view = new DataView(modelBytes.buffer, modelBytes.byteOffset, modelBytes.byteLength);
  let offset = 0;
  for (const expected of MAGIC) {
    if (view.getUint8(offset++) !== expected) {
      throw new Error("Invalid model header.");
    }
  }
  const version = view.getUint16(offset, true);
  offset += 2;
  offset += 2;
  if (version !== VERSION) {
    throw new Error(\`Unsupported model version: \${version}\`);
  }
  const bias = view.getFloat32(offset, true);
  offset += 4;
  const unigramScale = view.getFloat32(offset, true);
  offset += 4;
  const bigramScale = view.getFloat32(offset, true);
  offset += 4;
  const selectedCount = view.getUint32(offset, true);
  offset += 4;
  const deltaBytesLength = view.getUint32(offset, true);
  offset += 4;

  const unigramWeights = new Int16Array(modelBytes.buffer, modelBytes.byteOffset + offset, 256);
  offset += unigramWeights.byteLength;
  const deltaBytes = modelBytes.subarray(offset, offset + deltaBytesLength);
  offset += deltaBytesLength;
  const selectedWeights = new Int16Array(
    modelBytes.buffer,
    modelBytes.byteOffset + offset,
    selectedCount,
  );

  const selectedKeys = new Uint32Array(selectedCount);
  let prev = 0;
  const offsetRef = { value: 0 };
  for (let index = 0; index < selectedCount; index += 1) {
    prev += decodeVarUint(deltaBytes, offsetRef);
    selectedKeys[index] = prev >>> 0;
  }

  const tableSize = nextPow2(Math.max(8, selectedCount * 2));
  const tableKeys = new Uint32Array(tableSize);
  const tableWeights = new Int16Array(tableSize);
  tableKeys.fill(EMPTY_KEY);
  for (let index = 0; index < selectedCount; index += 1) {
    const key = selectedKeys[index];
    let slot = keyHash(key) & (tableSize - 1);
    while (tableKeys[slot] !== EMPTY_KEY) slot = (slot + 1) & (tableSize - 1);
    tableKeys[slot] = key;
    tableWeights[slot] = selectedWeights[index];
  }

  return {
    bias,
    unigramScale,
    bigramScale,
    unigramWeights,
    tableKeys,
    tableWeights,
  };
}

function createTokenCounter(model) {
  const encoder = new TextEncoder();
  const mask = model.tableKeys.length - 1;

  function lookupPairWeight(pair) {
    let slot = keyHash(pair) & mask;
    while (true) {
      const key = model.tableKeys[slot];
      if (key === EMPTY_KEY) return 0;
      if (key === pair) return model.tableWeights[slot] / model.bigramScale;
      slot = (slot + 1) & mask;
    }
  }

  function countTokensApprox(str) {
    const raw = encoder.encode(str);
    let total = model.bias;
    let prev = 256;
    for (let index = 0; index < raw.length; index += 1) {
      const byte = raw[index];
      total += model.unigramWeights[byte] / model.unigramScale;
      total += lookupPairWeight(prev * 257 + byte);
      prev = byte;
    }
    total += lookupPairWeight(prev * 257 + 256);
    return total;
  }

  return { countTokensApprox };
}

const model = parseModelBytes(await gunzipBytes(base64ToBytes(MODEL_GZ_BASE64)));
export const { countTokensApprox } = createTokenCounter(model);
export function loadTokenCounter() {
  return { countTokensApprox };
}
`;
}

async function main() {
  const args = parseArgs();
  const encoder = new TextEncoder();
  const tokenizer = await loadTokenizer(args.tokenizerConfigPath);

  const rawTrainRows = await readJsonLines(args.trainInput, args.trainLimit);
  const rawTestRows = await readJsonLines(args.testInput, args.testLimit);
  const countedTrainRows = await countRows(rawTrainRows, tokenizer, "train");
  const countedTestRows = await countRows(rawTestRows, tokenizer, "test");

  const unigramModel = trainSparseLinearModel({
    featureCount: 256,
    epochs: 5,
    learningRate: 1.2,
    l2: 1e-7,
    rows: countedTrainRows,
    buildExample: (row) => ({
      y: row.tokenCount,
      x: sparseByteCounts(row.text, encoder),
    }),
    label: "unigram",
  });

  const selectedPairs = selectTopBigrams(
    countedTrainRows,
    unigramModel.bias,
    unigramModel.weights,
    args.keep,
    encoder,
  );
  const pairToIndex = new Map();
  for (let index = 0; index < selectedPairs.length; index += 1) {
    pairToIndex.set(selectedPairs[index], index);
  }

  const bigramModel = trainSparseLinearModel({
    featureCount: selectedPairs.length,
    epochs: 4,
    learningRate: 0.6,
    l2: 1e-6,
    rows: countedTrainRows,
    buildExample: (row) => ({
      y: row.tokenCount -
        estimateUnigram(row.text, unigramModel.bias, unigramModel.weights, encoder),
      x: buildSelectedPairCounts(row.text, encoder, pairToIndex),
    }),
    label: "bigram",
  });

  const sortedPairs = [...selectedPairs].sort((left, right) => left - right);
  const selectedIndex = new Map();
  for (let index = 0; index < selectedPairs.length; index += 1) {
    selectedIndex.set(selectedPairs[index], index);
  }
  const quantizedUnigram = quantizeSigned(unigramModel.weights, UNIGRAM_SCALE);
  const quantizedBigram = quantizeSigned(
    sortedPairs.map((pair) => bigramModel.weights[selectedIndex.get(pair)]),
    BIGRAM_SCALE,
  );
  const combinedBias = unigramModel.bias + bigramModel.bias;
  const packed = packModel({
    bias: combinedBias,
    unigramWeights: quantizedUnigram,
    selectedPairs: Uint32Array.from(sortedPairs),
    selectedWeights: quantizedBigram,
  });
  const gzipped = await gzipBytes(packed);
  const bundledJs = renderBundledInference(btoa(String.fromCharCode(...gzipped)));
  await Deno.writeTextFile(args.output, bundledJs);

  const predictor = createQuantizedPredictor({
    bias: combinedBias,
    unigramWeights: quantizedUnigram,
    selectedPairs: Uint32Array.from(sortedPairs),
    selectedWeights: quantizedBigram,
  });
  const modelMetrics = evaluatePredictor(countedTestRows, predictor);

  console.log(
    JSON.stringify(
      {
        tokenizer: tokenizer.config,
        trainRows: countedTrainRows.length,
        testRows: countedTestRows.length,
        trainGroups: summarizeGroups(countedTrainRows),
        testGroups: summarizeGroups(countedTestRows),
        keptBigrams: sortedPairs.length,
        rawModelBytes: packed.byteLength,
        gzipModelBytes: gzipped.byteLength,
        bundledJsBytes: new TextEncoder().encode(bundledJs).byteLength,
        model: modelMetrics,
        output: args.output.href,
      },
      null,
      2,
    ),
  );
}

await main();
