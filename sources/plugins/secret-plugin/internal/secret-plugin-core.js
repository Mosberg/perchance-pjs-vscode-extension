/* ==========================================================================
 * secret-plugin — plugin-authored core (extracted from main.pjs)
 * ==========================================================================
 * Begins at main.pjs line 708 ("let kem, hkdf, sha256, gcm, fflate;") and ends
 * at line 889. Everything inbetween is written by the plugin author; every
 * identifier ending in "_Module" comes from external/vendored-in-main-pjs/.
 *
 * Public API (also exposed as root.secretPlugin / $output of the generator):
 *   generateKeyPair()                     -> { public, private }   (plain text)
 *   encrypt(plainText, publicKey)         -> "ENCRYPTED_1_..._ENCRYPTED_END"
 *   decrypt(encryptedText, privateKey)    -> plainText
 * ========================================================================== */

let kem, hkdf, sha256, gcm, fflate;
async function initIfNeeded() {
  if(!kem) {
    let { MlKem768 } = MlKem768_Module();
    kem = new MlKem768();
    hkdf = hkdf_Module().hkdf;
    sha256 = sha256_Module().sha256;
    gcm = gcm_Module().gcm;
    // pako = pako_Module().default;
    fflate = fflate_Module();
  }
}

// just for testing
function bytesAreSame(a, b) {
  // to also support arraybuffers:
  a = new Uint8Array(a);
  b = new Uint8Array(b);
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

function deriveKeySync(sharedSecret, salt) {
  const info = new Uint8Array(); // Empty info
  const dkLen = 32; // 256 bits key length
  const key = hkdf(sha256, sharedSecret, salt, info, dkLen);
  return key; // returns a Uint8Array of length 32
}
// UNUSED async / crypto.subtle version of above:
async function deriveKey(sharedSecret, salt) {
  let keyMaterial = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveKey']);
  let key = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: new Uint8Array() },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  // Can get raw bytes like this: new Uint8Array(await window.crypto.subtle.exportKey("raw", key));
  return key;
}

// This is an exact sync equivalent to: await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
function aesGcmEncryptSync(key, iv, bytes) {
  const cipher = gcm(key, iv); // gcm is from @noble/ciphers - see above
  return cipher.encrypt(bytes).buffer;
}

// This is an exact sync equivalent to: await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedContent);
function aesGcmDecryptSync(key, iv, encryptedContent) {
  const cipher = gcm(key, iv); // gcm is from @noble/ciphers - see above
  return cipher.decrypt(encryptedContent).buffer;
}

function compressBytesWithGzipSync(bytes) {
  const inputBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  // return pako.gzip(inputBytes);
  return fflate.gzipSync(inputBytes);  // flate package is much smaller than pako
}
// UNUSED async version of above:
async function compressBytesWithGzip(bytes) {
  let blob = new Blob([bytes], { type: 'application/octet-stream' });
  const compressedStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
  let outputBlob = await new Response(compressedStream).blob();
  let outputBytes = new Uint8Array(await outputBlob.arrayBuffer());
  return outputBytes;
}


function decompressBytesWithGzipSync(bytes) {
  const inputBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  // return pako.ungzip(inputBytes);
  return fflate.gunzipSync(inputBytes); // flate package is much smaller than pako
}
// UNUSED async version of above:
async function decompressBytesWithGzip(bytes) {
  let blob = new Blob([bytes], { type: 'application/octet-stream' });
  const decompressedStream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
  let outputBlob = await new Response(decompressedStream).blob();
  let outputBytes = new Uint8Array(await outputBlob.arrayBuffer());
  return outputBytes;
}


// CAUTION: This is a special purely-alphanumeric version of base64 by using Z as an escape (for special chars, and itself)
function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  let base64 = btoa(binary);
  return base64.replace(/Z/g, 'ZZ').replace(/\+/g, 'ZP').replace(/\//g, 'ZS').replace(/=/g, 'ZE');
}
// CAUTION: This is a special purely-alphanumeric version of base64 by using Z as an escape (for special chars, and itself)
function base64ToBytes(encoded) {
  const map = { Z: 'Z', P: '+', S: '/', E: '=' };
  const base64 = encoded.replace(/Z(Z|P|S|E)/g, (match, p1) => map[p1]);
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function generateKeyPair() {
  initIfNeeded();
  let [publicKey, privateKey] = kem.generateKeyPair();
  return { public: "PUBLIC_1_" + bytesToBase64(publicKey) + "_PUBLIC_END", private: "PRIVATE_1_" + bytesToBase64(privateKey) + "_PRIVATE_END" };
}

function encrypt(text, pubKeyB64) {
  if (/^PRIVATE_[0-9]+_/.test(pubKeyB64)) throw new Error("Looks like you're trying to execute 'encrypt' using a private key. You should use a public key for encryption.");
  if (!/^PUBLIC_[0-9]+_.+_PUBLIC_END$/.test(pubKeyB64)) throw new Error("A public key should start with PUBLIC_ and end with PUBLIC_END. Did you input the full public key?");
  if (typeof text !== "string") throw new Error("The first parameter of 'encrypt' must be a string/text.");
  
  initIfNeeded();
  pubKeyB64 = pubKeyB64.slice(9, -11);
  try { base64ToBytes(pubKeyB64); } catch (e) { throw new Error("The public key you used seems to be invalid. Are you sure you didn't miss part of the public key when copying/saving it?"); }

  let [ciphertext, sharedSecret] = kem.encap(base64ToBytes(pubKeyB64));
  
  let iv = crypto.getRandomValues(new Uint8Array(12));
  let salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random 128-bit salt
  
  // let key_orig = await deriveKey(sharedSecret, salt);
  // let key_orig_exported = new Uint8Array(await window.crypto.subtle.exportKey("raw", key_orig));
  let key = deriveKeySync(sharedSecret, salt);
  // if(!bytesAreSame(key_orig_exported, key)) throw new Error("subtle !== sync");

  let textBytes = new TextEncoder().encode(text);
  
  // let compressedTextBytes_orig = await compressBytesWithGzip(textBytes);
  let compressedTextBytes = compressBytesWithGzipSync(textBytes);
  // if(!bytesAreSame(compressedTextBytes_orig, compressedTextBytes)) throw new Error("pako !== web");
  
  // let encryptedContent_orig = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key_orig, compressedTextBytes);
  let encryptedContent = aesGcmEncryptSync(key, iv, compressedTextBytes);
  // if(!bytesAreSame(encryptedContent_orig, encryptedContent)) throw new Error("subtle !== sync");

  let ciphertextLength = BigInt(ciphertext.length);
  let ciphertextLengthBytes = new Uint8Array(8); // 64 bits = 8 bytes
  let view = new DataView(ciphertextLengthBytes.buffer);
  view.setBigUint64(0, ciphertextLength, false); // false for big-endian
  
  let outputText = bytesToBase64(new Uint8Array([...iv, ...salt, ...ciphertextLengthBytes, ...ciphertext, ...new Uint8Array(encryptedContent)]));
  return `ENCRYPTED_1_${outputText}_ENCRYPTED_END`;
}

function decrypt(encryptedB64, privKeyB64) {
  if (/^PUBLIC_[0-9]+_/.test(privKeyB64)) throw new Error("Looks like you're trying to execute 'decrypt' using a public key. You should use a private key for decryption.");
  if (!/^PRIVATE_[0-9]+_.+_PRIVATE_END$/.test(privKeyB64)) throw new Error("A private key should start with PRIVATE_ and end with PRIVATE_END. Did you input the full private key?");
  if (typeof encryptedB64 !== "string") throw new Error("The first parameter of 'decrypt' must be a base64 string/text.");
  
  initIfNeeded();
  privKeyB64 = privKeyB64.slice(10, -12);
  try { base64ToBytes(privKeyB64); } catch (e) { throw new Error("The private key you used seems to be invalid. Are you sure you didn't miss part of the private key when copying/saving it?"); }

  encryptedB64 = encryptedB64.slice(12, -14);

  let combined = base64ToBytes(encryptedB64);

  let iv = combined.slice(0, 12);
  let salt = combined.slice(12, 28); // Extract the salt

  let ciphertextLengthBytes = combined.slice(28, 36); // 8 bytes for 64-bit length
  let view = new DataView(ciphertextLengthBytes.buffer);
  let ciphertextLength = view.getBigUint64(0, false); // false for big-endian

  let ciphertext = combined.slice(36, 36 + Number(ciphertextLength));
  let encryptedContent = combined.slice(36 + Number(ciphertextLength));

  let sharedSecret = kem.decap(ciphertext, base64ToBytes(privKeyB64));
  
  // let key_orig = await deriveKey(sharedSecret, salt);
  // let key_orig_exported = new Uint8Array(await window.crypto.subtle.exportKey("raw", key_orig));
  let key = deriveKeySync(sharedSecret, salt);
  // if(!bytesAreSame(key_orig_exported, key_orig_exported)) throw new Error("subtle !== sync");

  // let compressedBytes_orig = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key_orig, encryptedContent);
  let compressedBytes = aesGcmDecryptSync(key, iv, encryptedContent);
  // if(!bytesAreSame(compressedBytes_orig, compressedBytes)) throw new Error("subtle !== sync");
  
  // let bytes_orig = await decompressBytesWithGzip(compressedBytes);
  let bytes = decompressBytesWithGzipSync(compressedBytes);
  // if(!bytesAreSame(bytes_orig, bytes)) throw new Error("pako !== web");
  
  return new TextDecoder().decode(bytes);
}
