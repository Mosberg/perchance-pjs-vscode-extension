// Standalone decoder for the DBG1 tokenizer-model blob embedded in main.pjs.
// Usage: deno run --allow-read decode-tokenizer-model.mjs tokenizer-model.bin > tokenizer-model.json
export function parseModelBytes(bytes){
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let q = 0;
  const magic = [dv.getUint8(q++), dv.getUint8(q++), dv.getUint8(q++), dv.getUint8(q++)];
  if(String.fromCharCode(...magic) !== "DBG1") throw new Error("Invalid model header.");
  const version = dv.getUint16(q, true); q += 2; q += 2;
  if(version !== 1) throw new Error("Unsupported model version: " + version);
  const bias = dv.getFloat32(q, true); q += 4;
  const unigramScale = dv.getFloat32(q, true); q += 4;
  const bigramScale = dv.getFloat32(q, true); q += 4;
  const bigramCount = dv.getUint32(q, true); q += 4;
  const varintBytesLen = dv.getUint32(q, true); q += 4;
  const unigramWeights = new Int16Array(bytes.buffer, bytes.byteOffset + q, 256); q += 256 * 2;
  const varintBytes = bytes.subarray(q, q + varintBytesLen); q += varintBytesLen;
  const tableWeights = new Int16Array(bytes.buffer, bytes.byteOffset + q, bigramCount);
  let h = 0;
  const readVarUint = () => { let v = 0, s = 0, b; do { b = varintBytes[h++]; v |= (b & 0x7f) << s; s += 7; } while(b & 0x80); return v >>> 0; };
  const tableKeys = new Uint32Array(bigramCount);
  let acc = 0;
  for(let i = 0; i < bigramCount; i++){ acc = (acc + readVarUint()) >>> 0; tableKeys[i] = acc; }
  return { bias, unigramScale, bigramScale, unigramWeights, tableKeys, tableWeights };
}
export function base64ToBytes(b64){ const s = atob(b64); const out = new Uint8Array(s.length); for(let i=0;i<s.length;i++) out[i]=s.charCodeAt(i); return out; }
