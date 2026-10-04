/* ==========================================================================
 * MlKem768_Module() — ML-KEM-768 (FIPS 203) key encapsulation
 * ==========================================================================
 * Embodied (vendored) into secret-plugin's main.pjs — this file is the exact
 * source text of that embedded module, extracted verbatim.
 *
 * Upstream:  https://github.com/dajiaji/crystals-kyber-js/tree/2.3.0  (MIT)
 * Note:      upstream async setup()/loadCrypto() removed (Node-only); contains a nested sha3_Module() copy of @noble/hashes sha3
 * Usage:     const { MlKem768 } = MlKem768_Module();  (or the matching factory)
 * ========================================================================== */

    // This is this module: https://github.com/dajiaji/crystals-kyber-js/tree/2.3.0
    // Except with the async setup/loadCrypto removed, since that's only needed for Node.js support (dynamic import of node:crypto - see utils.ts at above repo).
    function MlKem768_Module() {

      function sha3_Module() {
        /* esm.sh - esbuild bundle(@noble/hashes@1.5.0/sha3) es2022 production */
        function b(t) { if (!Number.isSafeInteger(t) || t < 0) throw new Error(`positive integer expected, not ${t}`) } function M(t) { return t instanceof Uint8Array || t != null && typeof t == "object" && t.constructor.name === "Uint8Array" } function p(t, ...e) { if (!M(t)) throw new Error("Uint8Array expected"); if (e.length > 0 && !e.includes(t.length)) throw new Error(`Uint8Array expected of length ${e}, not of length=${t.length}`) } function L(t, e = !0) { if (t.destroyed) throw new Error("Hash instance has been destroyed"); if (e && t.finished) throw new Error("Hash#digest() has already been called") } function m(t, e) { p(t); let n = e.outputLen; if (t.length < n) throw new Error(`digestInto() expects output buffer of length at least ${n}`) } var x = BigInt(4294967295), A = BigInt(32); function D(t, e = !1) { return e ? { h: Number(t & x), l: Number(t >> A & x) } : { h: Number(t >> A & x) | 0, l: Number(t & x) | 0 } } function B(t, e = !1) { let n = new Uint32Array(t.length), r = new Uint32Array(t.length); for (let s = 0; s < t.length; s++) { let { h: i, l: o } = D(t[s], e);[n[s], r[s]] = [i, o] } return [n, r] } var O = (t, e, n) => t << n | e >>> 32 - n, I = (t, e, n) => e << n | t >>> 32 - n, S = (t, e, n) => e << n - 32 | t >>> 64 - n, H = (t, e, n) => t << n - 32 | e >>> 64 - n; var E = t => new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4)); var k = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, P = t => t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255; function _(t) { for (let e = 0; e < t.length; e++)t[e] = P(t[e]) } function W(t) { if (typeof t != "string") throw new Error(`utf8ToBytes expected string, got ${typeof t}`); return new Uint8Array(new TextEncoder().encode(t)) } function w(t) { return typeof t == "string" && (t = W(t)), p(t), t } var y = class { clone() { return this._cloneInto() } }, nt = {}.toString; function U(t) { let e = r => t().update(w(r)).digest(), n = t(); return e.outputLen = n.outputLen, e.blockLen = n.blockLen, e.create = () => t(), e } function T(t) { let e = (r, s) => t(s).update(w(r)).digest(), n = t({}); return e.outputLen = n.outputLen, e.blockLen = n.blockLen, e.create = r => t(r), e } var X = [], $ = [], C = [], v = BigInt(0), h = BigInt(1), q = BigInt(2), z = BigInt(7), G = BigInt(256), J = BigInt(113); for (let t = 0, e = h, n = 1, r = 0; t < 24; t++) { [n, r] = [r, (2 * n + 3 * r) % 5], X.push(2 * (5 * r + n)), $.push((t + 1) * (t + 2) / 2 % 64); let s = v; for (let i = 0; i < 7; i++)e = (e << h ^ (e >> z) * J) % G, e & q && (s ^= h << (h << BigInt(i)) - h); C.push(s) } var [K, Q] = B(C, !0), F = (t, e, n) => n > 32 ? S(t, e, n) : O(t, e, n), j = (t, e, n) => n > 32 ? H(t, e, n) : I(t, e, n); function Y(t, e = 24) { let n = new Uint32Array(10); for (let r = 24 - e; r < 24; r++) { for (let o = 0; o < 10; o++)n[o] = t[o] ^ t[o + 10] ^ t[o + 20] ^ t[o + 30] ^ t[o + 40]; for (let o = 0; o < 10; o += 2) { let c = (o + 8) % 10, l = (o + 2) % 10, a = n[l], u = n[l + 1], R = F(a, u, 1) ^ n[c], V = j(a, u, 1) ^ n[c + 1]; for (let d = 0; d < 50; d += 10)t[o + d] ^= R, t[o + d + 1] ^= V } let s = t[2], i = t[3]; for (let o = 0; o < 24; o++) { let c = $[o], l = F(s, i, c), a = j(s, i, c), u = X[o]; s = t[u], i = t[u + 1], t[u] = l, t[u + 1] = a } for (let o = 0; o < 50; o += 10) { for (let c = 0; c < 10; c++)n[c] = t[o + c]; for (let c = 0; c < 10; c++)t[o + c] ^= ~n[(c + 2) % 10] & n[(c + 4) % 10] } t[0] ^= K[r], t[1] ^= Q[r] } n.fill(0) } var g = class t extends y { constructor(e, n, r, s = !1, i = 24) { if (super(), this.blockLen = e, this.suffix = n, this.outputLen = r, this.enableXOF = s, this.rounds = i, this.pos = 0, this.posOut = 0, this.finished = !1, this.destroyed = !1, b(r), 0 >= this.blockLen || this.blockLen >= 200) throw new Error("Sha3 supports only keccak-f1600 function"); this.state = new Uint8Array(200), this.state32 = E(this.state) } keccak() { k || _(this.state32), Y(this.state32, this.rounds), k || _(this.state32), this.posOut = 0, this.pos = 0 } update(e) { L(this); let { blockLen: n, state: r } = this; e = w(e); let s = e.length; for (let i = 0; i < s;) { let o = Math.min(n - this.pos, s - i); for (let c = 0; c < o; c++)r[this.pos++] ^= e[i++]; this.pos === n && this.keccak() } return this } finish() { if (this.finished) return; this.finished = !0; let { state: e, suffix: n, pos: r, blockLen: s } = this; e[r] ^= n, n & 128 && r === s - 1 && this.keccak(), e[s - 1] ^= 128, this.keccak() } writeInto(e) { L(this, !1), p(e), this.finish(); let n = this.state, { blockLen: r } = this; for (let s = 0, i = e.length; s < i;) { this.posOut >= r && this.keccak(); let o = Math.min(r - this.posOut, i - s); e.set(n.subarray(this.posOut, this.posOut + o), s), this.posOut += o, s += o } return e } xofInto(e) { if (!this.enableXOF) throw new Error("XOF is not possible for this instance"); return this.writeInto(e) } xof(e) { return b(e), this.xofInto(new Uint8Array(e)) } digestInto(e) { if (m(e, this), this.finished) throw new Error("digest() was already called"); return this.writeInto(e), this.destroy(), e } digest() { return this.digestInto(new Uint8Array(this.outputLen)) } destroy() { this.destroyed = !0, this.state.fill(0) } _cloneInto(e) { let { blockLen: n, suffix: r, outputLen: s, rounds: i, enableXOF: o } = this; return e || (e = new t(n, r, s, o, i)), e.state32.set(this.state32), e.pos = this.pos, e.posOut = this.posOut, e.finished = this.finished, e.rounds = i, e.suffix = r, e.outputLen = s, e.enableXOF = o, e.destroyed = this.destroyed, e } }, f = (t, e, n) => U(() => new g(e, t, n)), ct = f(6, 144, 224 / 8), ft = f(6, 136, 256 / 8), ut = f(6, 104, 384 / 8), pt = f(6, 72, 512 / 8), ht = f(1, 144, 224 / 8), lt = f(1, 136, 256 / 8), at = f(1, 104, 384 / 8), dt = f(1, 72, 512 / 8), N = (t, e, n) => T((r = {}) => new g(e, t, r.dkLen === void 0 ? n : r.dkLen, !0)), xt = N(31, 168, 128 / 8), yt = N(31, 136, 256 / 8);
        return { Keccak: g, keccakP: Y, keccak_224: ht, keccak_256: lt, keccak_384: at, keccak_512: dt, sha3_224: ct, sha3_256: ft, sha3_384: ut, sha3_512: pt, shake128: xt, shake256: yt };
      }
      // import { sha3_256, sha3_512, shake128, shake256 } from "@noble/hashes@1.5.0/sha3";
      const { sha3_256, sha3_512, shake128, shake256 } = sha3_Module();

      const N = 256;
      const Q = 3329;
      const Q_INV = 62209;
      const NTT_ZETAS = [
        2285, 2571, 2970, 1812, 1493, 1422, 287, 202, 3158, 622, 1577, 182, 962,
        2127, 1855, 1468, 573, 2004, 264, 383, 2500, 1458, 1727, 3199, 2648, 1017,
        732, 608, 1787, 411, 3124, 1758, 1223, 652, 2777, 1015, 2036, 1491, 3047,
        1785, 516, 3321, 3009, 2663, 1711, 2167, 126, 1469, 2476, 3239, 3058, 830,
        107, 1908, 3082, 2378, 2931, 961, 1821, 2604, 448, 2264, 677, 2054, 2226,
        430, 555, 843, 2078, 871, 1550, 105, 422, 587, 177, 3094, 3038, 2869, 1574,
        1653, 3083, 778, 1159, 3182, 2552, 1483, 2727, 1119, 1739, 644, 2457, 349,
        418, 329, 3173, 3254, 817, 1097, 603, 610, 1322, 2044, 1864, 384, 2114, 3193,
        1218, 1994, 2455, 220, 2142, 1670, 2144, 1799, 2051, 794, 1819, 2475, 2459,
        478, 3221, 3021, 996, 991, 958, 1869, 1522, 1628,
      ];
      const NTT_ZETAS_INV = [
        1701, 1807, 1460, 2371, 2338, 2333, 308, 108, 2851, 870, 854, 1510, 2535,
        1278, 1530, 1185, 1659, 1187, 3109, 874, 1335, 2111, 136, 1215, 2945, 1465,
        1285, 2007, 2719, 2726, 2232, 2512, 75, 156, 3000, 2911, 2980, 872, 2685,
        1590, 2210, 602, 1846, 777, 147, 2170, 2551, 246, 1676, 1755, 460, 291, 235,
        3152, 2742, 2907, 3224, 1779, 2458, 1251, 2486, 2774, 2899, 1103, 1275, 2652,
        1065, 2881, 725, 1508, 2368, 398, 951, 247, 1421, 3222, 2499, 271, 90, 853,
        1860, 3203, 1162, 1618, 666, 320, 8, 2813, 1544, 282, 1838, 1293, 2314, 552,
        2677, 2106, 1571, 205, 2918, 1542, 2721, 2597, 2312, 681, 130, 1602, 1871,
        829, 2946, 3065, 1325, 2756, 1861, 1474, 1202, 2367, 3147, 1752, 2707, 171,
        3127, 3042, 1907, 1836, 1517, 359, 758, 1441,
      ];
      class MlKemError extends Error {
        constructor(e) {
          let message;
          if (e instanceof Error) {
            message = e.message;
          }
          else if (typeof e === "string") {
            message = e;
          }
          else {
            message = "";
          }
          super(message);
          this.name = this.constructor.name;
        }
      }
      function byte(n) {
        return n % 256;
      }
      function int16(n) {
        const end = -32768;
        const start = 32767;
        if (n >= end && n <= start) {
          return n;
        }
        if (n < end) {
          n = n + 32769;
          n = n % 65536;
          return start + n;
        }
        n = n - 32768;
        n = n % 65536;
        return end + n;
      }
      function uint16(n) {
        return n % 65536;
      }
      function int32(n) {
        const end = -2147483648;
        const start = 2147483647;
        if (n >= end && n <= start) {
          return n;
        }
        if (n < end) {
          n = n + 2147483649;
          n = n % 4294967296;
          return start + n;
        }
        n = n - 2147483648;
        n = n % 4294967296;
        return end + n;
      }
      function uint32(n) {
        return n % 4294967296;
      }
      function constantTimeCompare(x, y) {
        if (x.length != y.length) {
          return 0;
        }
        const v = new Uint8Array([0]);
        for (let i = 0; i < x.length; i++) {
          v[0] |= x[i] ^ y[i];
        }
        const z = new Uint8Array([0]);
        z[0] = ~(v[0] ^ z[0]);
        z[0] &= z[0] >> 4;
        z[0] &= z[0] >> 2;
        z[0] &= z[0] >> 1;
        return z[0];
      }
      function equalUint8Array(x, y) {
        if (x.length != y.length) {
          return false;
        }
        for (let i = 0; i < x.length; i++) {
          if (x[i] !== y[i]) {
            return false;
          }
        }
        return true;
      }
      function prf(len, seed, nonce) {
        return shake256.create({ dkLen: len }).update(seed).update(new Uint8Array([nonce])).digest();
      }
      function byteopsLoad24(x) {
        let r = uint32(x[0]);
        r |= uint32(x[1]) << 8;
        r |= uint32(x[2]) << 16;
        return r;
      }
      function byteopsLoad32(x) {
        let r = uint32(x[0]);
        r |= uint32(x[1]) << 8;
        r |= uint32(x[2]) << 16;
        r |= uint32(x[3]) << 24;
        return uint32(r);
      }
      class MlKemBase {
        constructor() {
          this._api = undefined;
          this._k = 0;
          this._du = 0;
          this._dv = 0;
          this._eta1 = 0;
          this._eta2 = 0;
          this._skSize = 0;
          this._pkSize = 0;
          this._compressedUSize = 0;
          this._compressedVSize = 0;
        }
        generateKeyPair() {
          this._setup();
          try {
            const rnd = new Uint8Array(64);
            this._api.getRandomValues(rnd);
            return this._deriveKeyPair(rnd);
          }
          catch (e) {
            throw new MlKemError(e);
          }
        }
        deriveKeyPair(seed) {
          this._setup();
          try {
            if (seed.byteLength !== 64) {
              throw new Error("seed must be 64 bytes in length");
            }
            return this._deriveKeyPair(seed);
          }
          catch (e) {
            throw new MlKemError(e);
          }
        }
        encap(pk, seed) {
          this._setup();
          try {
            if (pk.length !== 384 * this._k + 32) {
              throw new Error("invalid encapsulation key");
            }
            const m = this._getSeed(seed);
            const [k, r] = g(m, h(pk));
            const ct = this._encap(pk, m, r);
            return [ct, k];
          }
          catch (e) {
            throw new MlKemError(e);
          }
        }
        decap(ct, sk) {
          this._setup();
          try {
            if (ct.byteLength !== this._compressedUSize + this._compressedVSize) {
              throw new Error("Invalid ct size");
            }
            if (sk.length !== 768 * this._k + 96) {
              throw new Error("Invalid decapsulation key");
            }
            const sk2 = sk.subarray(0, this._skSize);
            const pk = sk.subarray(this._skSize, this._skSize + this._pkSize);
            const hpk = sk.subarray(this._skSize + this._pkSize, this._skSize + this._pkSize + 32);
            const z = sk.subarray(this._skSize + this._pkSize + 32, this._skSize + this._pkSize + 64);
            const m2 = this._decap(ct, sk2);
            const [k2, r2] = g(m2, hpk);
            const kBar = kdf(z, ct);
            const ct2 = this._encap(pk, m2, r2);
            return constantTimeCompare(ct, ct2) === 1 ? k2 : kBar;
          }
          catch (e) {
            throw new MlKemError(e);
          }
        }
        _setup() {
          if (this._api !== undefined) {
            return;
          }
          this._api = globalThis.crypto;
        }
        _getSeed(seed) {
          if (seed == undefined) {
            const s = new Uint8Array(32);
            this._api.getRandomValues(s);
            return s;
          }
          if (seed.byteLength !== 32) {
            throw new Error("seed must be 32 bytes in length");
          }
          return seed;
        }
        _deriveKeyPair(seed) {
          const cpaSeed = seed.subarray(0, 32);
          const z = seed.subarray(32, 64);
          const [pk, skBody] = this._deriveCpaKeyPair(cpaSeed);
          const pkh = h(pk);
          const sk = new Uint8Array(this._skSize + this._pkSize + 64);
          sk.set(skBody, 0);
          sk.set(pk, this._skSize);
          sk.set(pkh, this._skSize + this._pkSize);
          sk.set(z, this._skSize + this._pkSize + 32);
          return [pk, sk];
        }
        _deriveCpaKeyPair(cpaSeed) {
          const [publicSeed, noiseSeed] = g(cpaSeed, new Uint8Array([this._k]));
          const a = this._sampleMatrix(publicSeed, false);
          const s = this._sampleNoise1(noiseSeed, 0, this._k);
          const e = this._sampleNoise1(noiseSeed, this._k, this._k);
          for (let i = 0; i < this._k; i++) {
            s[i] = ntt(s[i]);
            s[i] = reduce(s[i]);
            e[i] = ntt(e[i]);
          }
          const pk = new Array(this._k);
          for (let i = 0; i < this._k; i++) {
            pk[i] = polyToMont(multiply(a[i], s));
            pk[i] = add(pk[i], e[i]);
            pk[i] = reduce(pk[i]);
          }
          const pubKey = new Uint8Array(this._pkSize);
          for (let i = 0; i < this._k; i++) {
            pubKey.set(polyToBytes(pk[i]), i * 384);
          }
          pubKey.set(publicSeed, this._skSize);
          const privKey = new Uint8Array(this._skSize);
          for (let i = 0; i < this._k; i++) {
            privKey.set(polyToBytes(s[i]), i * 384);
          }
          return [pubKey, privKey];
        }
        _encap(pk, msg, seed) {
          const tHat = new Array(this._k);
          const pkCheck = new Uint8Array(384 * this._k);
          for (let i = 0; i < this._k; i++) {
            tHat[i] = polyFromBytes(pk.subarray(i * 384, (i + 1) * 384));
            pkCheck.set(polyToBytes(tHat[i]), i * 384);
          }
          if (!equalUint8Array(pk.subarray(0, pkCheck.length), pkCheck)) {
            throw new Error("invalid encapsulation key");
          }
          const rho = pk.subarray(this._skSize);
          const a = this._sampleMatrix(rho, true);
          const r = this._sampleNoise1(seed, 0, this._k);
          const e1 = this._sampleNoise2(seed, this._k, this._k);
          const e2 = this._sampleNoise2(seed, this._k * 2, 1)[0];
          for (let i = 0; i < this._k; i++) {
            r[i] = ntt(r[i]);
            r[i] = reduce(r[i]);
          }
          const u = new Array(this._k);
          for (let i = 0; i < this._k; i++) {
            u[i] = multiply(a[i], r);
            u[i] = nttInverse(u[i]);
            u[i] = add(u[i], e1[i]);
            u[i] = reduce(u[i]);
          }
          const m = polyFromMsg(msg);
          let v = multiply(tHat, r);
          v = nttInverse(v);
          v = add(v, e2);
          v = add(v, m);
          v = reduce(v);
          const ret = new Uint8Array(this._compressedUSize + this._compressedVSize);
          this._compressU(ret.subarray(0, this._compressedUSize), u);
          this._compressV(ret.subarray(this._compressedUSize), v);
          return ret;
        }
        _decap(ct, sk) {
          const u = this._decompressU(ct.subarray(0, this._compressedUSize));
          const v = this._decompressV(ct.subarray(this._compressedUSize));
          const privateKeyPolyvec = this._polyvecFromBytes(sk);
          for (let i = 0; i < this._k; i++) {
            u[i] = ntt(u[i]);
          }
          let mp = multiply(privateKeyPolyvec, u);
          mp = nttInverse(mp);
          mp = subtract(v, mp);
          mp = reduce(mp);
          return polyToMsg(mp);
        }
        _sampleMatrix(seed, transposed) {
          const a = new Array(this._k);
          const transpose = new Uint8Array(2);
          for (let ctr = 0, i = 0; i < this._k; i++) {
            a[i] = new Array(this._k);
            for (let j = 0; j < this._k; j++) {
              if (transposed) {
                transpose[0] = i;
                transpose[1] = j;
              }
              else {
                transpose[0] = j;
                transpose[1] = i;
              }
              const output = xof(seed, transpose);
              const result = indcpaRejUniform(output.subarray(0, 504), 504, N);
              a[i][j] = result[0];
              ctr = result[1];
              while (ctr < N) {
                const outputn = output.subarray(504, 672);
                const result1 = indcpaRejUniform(outputn, 168, N - ctr);
                const missing = result1[0];
                const ctrn = result1[1];
                for (let k = ctr; k < N; k++) {
                  a[i][j][k] = missing[k - ctr];
                }
                ctr = ctr + ctrn;
              }
            }
          }
          return a;
        }
        _sampleNoise1(sigma, offset, size) {
          const r = new Array(size);
          for (let i = 0; i < size; i++) {
            r[i] = byteopsCbd(prf(this._eta1 * N / 4, sigma, offset), this._eta1);
            offset++;
          }
          return r;
        }
        _sampleNoise2(sigma, offset, size) {
          const r = new Array(size);
          for (let i = 0; i < size; i++) {
            r[i] = byteopsCbd(prf(this._eta2 * N / 4, sigma, offset), this._eta2);
            offset++;
          }
          return r;
        }
        _polyvecFromBytes(a) {
          const r = new Array(this._k);
          for (let i = 0; i < this._k; i++) {
            r[i] = polyFromBytes(a.subarray(i * 384, (i + 1) * 384));
          }
          return r;
        }
        _compressU(r, u) {
          const t = new Array(4);
          for (let rr = 0, i = 0; i < this._k; i++) {
            for (let j = 0; j < N / 4; j++) {
              for (let k = 0; k < 4; k++) {
                t[k] = (((u[i][4 * j + k] << 10) + Q / 2) / Q) &
                  0b1111111111;
              }
              r[rr++] = byte(t[0] >> 0);
              r[rr++] = byte((t[0] >> 8) | (t[1] << 2));
              r[rr++] = byte((t[1] >> 6) | (t[2] << 4));
              r[rr++] = byte((t[2] >> 4) | (t[3] << 6));
              r[rr++] = byte(t[3] >> 2);
            }
          }
          return r;
        }
        _compressV(r, v) {
          const t = new Uint8Array(8);
          for (let rr = 0, i = 0; i < N / 8; i++) {
            for (let j = 0; j < 8; j++) {
              t[j] = byte(((v[8 * i + j] << 4) + Q / 2) / Q) & 0b1111;
            }
            r[rr++] = t[0] | (t[1] << 4);
            r[rr++] = t[2] | (t[3] << 4);
            r[rr++] = t[4] | (t[5] << 4);
            r[rr++] = t[6] | (t[7] << 4);
          }
          return r;
        }
        _decompressU(a) {
          const r = new Array(this._k);
          for (let i = 0; i < this._k; i++) {
            r[i] = new Array(384);
          }
          const t = new Array(4);
          for (let aa = 0, i = 0; i < this._k; i++) {
            for (let j = 0; j < N / 4; j++) {
              t[0] = (uint16(a[aa + 0]) >> 0) | (uint16(a[aa + 1]) << 8);
              t[1] = (uint16(a[aa + 1]) >> 2) | (uint16(a[aa + 2]) << 6);
              t[2] = (uint16(a[aa + 2]) >> 4) | (uint16(a[aa + 3]) << 4);
              t[3] = (uint16(a[aa + 3]) >> 6) | (uint16(a[aa + 4]) << 2);
              aa = aa + 5;
              for (let k = 0; k < 4; k++) {
                r[i][4 * j + k] = int16((((uint32(t[k] & 0x3FF)) * (uint32(Q))) + 512) >> 10);
              }
            }
          }
          return r;
        }
        _decompressV(a) {
          const r = new Array(384);
          for (let aa = 0, i = 0; i < N / 2; i++, aa++) {
            r[2 * i + 0] = int16(((uint16(a[aa] & 15) * uint16(Q)) + 8) >> 4);
            r[2 * i + 1] = int16(((uint16(a[aa] >> 4) * uint16(Q)) + 8) >> 4);
          }
          return r;
        }
      }
      function g(a, b) {
        const hash = sha3_512.create().update(a);
        if (b !== undefined) {
          hash.update(b);
        }
        const res = hash.digest();
        return [res.subarray(0, 32), res.subarray(32, 64)];
      }
      function h(msg) {
        return sha3_256.create().update(msg).digest();
      }
      function kdf(a, b) {
        const hash = shake256.create({ dkLen: 32 }).update(a);
        if (b !== undefined) {
          hash.update(b);
        }
        return hash.digest();
      }
      function xof(seed, transpose) {
        return shake128.create({ dkLen: 672 }).update(seed).update(transpose)
          .digest();
      }
      function polyToBytes(a) {
        let t0 = 0;
        let t1 = 0;
        const r = new Uint8Array(384);
        const a2 = subtractQ(a);
        for (let i = 0; i < N / 2; i++) {
          t0 = uint16(a2[2 * i]);
          t1 = uint16(a2[2 * i + 1]);
          r[3 * i + 0] = byte(t0 >> 0);
          r[3 * i + 1] = byte(t0 >> 8) | byte(t1 << 4);
          r[3 * i + 2] = byte(t1 >> 4);
        }
        return r;
      }
      function polyFromBytes(a) {
        const r = new Array(384).fill(0);
        for (let i = 0; i < N / 2; i++) {
          r[2 * i] = int16(((uint16(a[3 * i + 0]) >> 0) | (uint16(a[3 * i + 1]) << 8)) & 0xFFF);
          r[2 * i + 1] = int16(((uint16(a[3 * i + 1]) >> 4) | (uint16(a[3 * i + 2]) << 4)) & 0xFFF);
        }
        return r;
      }
      function polyToMsg(a) {
        const msg = new Uint8Array(32);
        let t;
        const a2 = subtractQ(a);
        for (let i = 0; i < N / 8; i++) {
          msg[i] = 0;
          for (let j = 0; j < 8; j++) {
            t = (((uint16(a2[8 * i + j]) << 1) + uint16(Q / 2)) /
              uint16(Q)) & 1;
            msg[i] |= byte(t << j);
          }
        }
        return msg;
      }
      function polyFromMsg(msg) {
        const r = new Array(384).fill(0);
        let mask;
        for (let i = 0; i < N / 8; i++) {
          for (let j = 0; j < 8; j++) {
            mask = -1 * int16((msg[i] >> j) & 1);
            r[8 * i + j] = mask & int16((Q + 1) / 2);
          }
        }
        return r;
      }
      function indcpaRejUniform(buf, bufl, len) {
        const r = new Array(384).fill(0);
        let ctr = 0;
        let val0, val1;
        for (let pos = 0; ctr < len && pos + 3 <= bufl;) {
          val0 = (uint16((buf[pos]) >> 0) | (uint16(buf[pos + 1]) << 8)) & 0xFFF;
          val1 = (uint16((buf[pos + 1]) >> 4) | (uint16(buf[pos + 2]) << 4)) & 0xFFF;
          pos = pos + 3;
          if (val0 < Q) {
            r[ctr] = val0;
            ctr = ctr + 1;
          }
          if (ctr < len && val1 < Q) {
            r[ctr] = val1;
            ctr = ctr + 1;
          }
        }
        return [r, ctr];
      }
      function byteopsCbd(buf, eta) {
        let t, d;
        let a, b;
        const r = new Array(384).fill(0);
        for (let i = 0; i < N / 8; i++) {
          t = byteopsLoad32(buf.subarray(4 * i, buf.length));
          d = t & 0x55555555;
          d = d + ((t >> 1) & 0x55555555);
          for (let j = 0; j < 8; j++) {
            a = int16((d >> (4 * j + 0)) & 0x3);
            b = int16((d >> (4 * j + eta)) & 0x3);
            r[8 * i + j] = a - b;
          }
        }
        return r;
      }
      function ntt(r) {
        for (let j = 0, k = 1, l = 128; l >= 2; l >>= 1) {
          for (let start = 0; start < 256; start = j + l) {
            const zeta = NTT_ZETAS[k];
            k = k + 1;
            for (j = start; j < start + l; j++) {
              const t = nttFqMul(zeta, r[j + l]);
              r[j + l] = r[j] - t;
              r[j] = r[j] + t;
            }
          }
        }
        return r;
      }
      function nttFqMul(a, b) {
        return byteopsMontgomeryReduce(a * b);
      }
      function reduce(r) {
        for (let i = 0; i < N; i++) {
          r[i] = barrett(r[i]);
        }
        return r;
      }
      function barrett(a) {
        const v = ((1 << 24) + Q / 2) / Q;
        let t = v * a >> 24;
        t = t * Q;
        return a - t;
      }
      function byteopsMontgomeryReduce(a) {
        const u = int16(int32(a) * Q_INV);
        let t = u * Q;
        t = a - t;
        t >>= 16;
        return int16(t);
      }
      function polyToMont(r) {
        const f = 1353;
        for (let i = 0; i < N; i++) {
          r[i] = byteopsMontgomeryReduce(int32(r[i]) * int32(f));
        }
        return r;
      }
      function multiply(a, b) {
        let r = polyBaseMulMontgomery(a[0], b[0]);
        let t;
        for (let i = 1; i < a.length; i++) {
          t = polyBaseMulMontgomery(a[i], b[i]);
          r = add(r, t);
        }
        return reduce(r);
      }
      function polyBaseMulMontgomery(a, b) {
        let rx, ry;
        for (let i = 0; i < N / 4; i++) {
          rx = nttBaseMul(a[4 * i + 0], a[4 * i + 1], b[4 * i + 0], b[4 * i + 1], NTT_ZETAS[64 + i]);
          ry = nttBaseMul(a[4 * i + 2], a[4 * i + 3], b[4 * i + 2], b[4 * i + 3], -NTT_ZETAS[64 + i]);
          a[4 * i + 0] = rx[0];
          a[4 * i + 1] = rx[1];
          a[4 * i + 2] = ry[0];
          a[4 * i + 3] = ry[1];
        }
        return a;
      }
      function nttBaseMul(a0, a1, b0, b1, zeta) {
        const r = new Array(2);
        r[0] = nttFqMul(a1, b1);
        r[0] = nttFqMul(r[0], zeta);
        r[0] += nttFqMul(a0, b0);
        r[1] = nttFqMul(a0, b1);
        r[1] += nttFqMul(a1, b0);
        return r;
      }
      function add(a, b) {
        const c = new Array(384);
        for (let i = 0; i < N; i++) {
          c[i] = a[i] + b[i];
        }
        return c;
      }
      function subtract(a, b) {
        for (let i = 0; i < N; i++) {
          a[i] -= b[i];
        }
        return a;
      }
      function nttInverse(r) {
        let j = 0;
        for (let k = 0, l = 2; l <= 128; l <<= 1) {
          for (let start = 0; start < 256; start = j + l) {
            const zeta = NTT_ZETAS_INV[k];
            k = k + 1;
            for (j = start; j < start + l; j++) {
              const t = r[j];
              r[j] = barrett(t + r[j + l]);
              r[j + l] = t - r[j + l];
              r[j + l] = nttFqMul(zeta, r[j + l]);
            }
          }
        }
        for (j = 0; j < 256; j++) {
          r[j] = nttFqMul(r[j], NTT_ZETAS_INV[127]);
        }
        return r;
      }
      function subtractQ(r) {
        for (let i = 0; i < N; i++) {
          r[i] -= Q;
          r[i] += (r[i] >> 31) & Q;
        }
        return r;
      }
      class MlKem768 extends MlKemBase {
        constructor() {
          super();
          this._k = 3;
          this._du = 10;
          this._dv = 4;
          this._eta1 = 2;
          this._eta2 = 2;
          this._skSize = 12 * this._k * N / 8;
          this._pkSize = this._skSize + 32;
          this._compressedUSize = this._k * this._du * N / 8;
          this._compressedVSize = this._dv * N / 8;
        }
      }

      return { MlKem768 };
    }
