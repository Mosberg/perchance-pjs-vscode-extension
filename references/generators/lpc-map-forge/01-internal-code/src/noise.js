export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function hashInt(x) {
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}

export function hash2i(ix, iy, seed) {
  const h = hashInt(Math.imul(ix | 0, 0x27d4eb2d) ^ hashInt((iy | 0) ^ hashInt(seed | 0)));
  return h / 4294967296;
}

export function hash3i(ix, iy, iz, seed) {
  return hashInt(hashInt(Math.imul(ix | 0, 0x27d4eb2d) ^ (iy | 0)) ^ Math.imul(iz | 0, 0x165667b1) ^ hashInt(seed | 0)) / 4294967296;
}

export function seedFromString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

export function valueNoise2D(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const u = fade(x - ix), v = fade(y - iy);
  const n00 = hash2i(ix, iy, seed);
  const n10 = hash2i(ix + 1, iy, seed);
  const n01 = hash2i(ix, iy + 1, seed);
  const n11 = hash2i(ix + 1, iy + 1, seed);
  const a = n00 + (n10 - n00) * u;
  const b = n01 + (n11 - n01) * u;
  return a + (b - a) * v;
}

export function fbm2D(x, y, seed, octaves = 5, lacunarity = 2, gain = 0.5) {
  let total = 0, amp = 1, norm = 0, fx = x, fy = y;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise2D(fx, fy, seed + i * 131) * amp;
    norm += amp;
    amp *= gain;
    fx *= lacunarity;
    fy *= lacunarity;
  }
  return total / norm;
}

export function ridge2D(x, y, seed, octaves = 5, lacunarity = 2, gain = 0.5) {
  let total = 0, amp = 1, norm = 0, fx = x, fy = y;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise2D(fx, fy, seed + i * 977) * 2 - 1);
    total += n * n * amp;
    norm += amp;
    amp *= gain;
    fx *= lacunarity;
    fy *= lacunarity;
  }
  return total / norm;
}

export function warp2D(x, y, seed, strength, octaves = 3) {
  const wx = fbm2D(x + 5.2, y + 1.3, seed + 17, octaves) * 2 - 1;
  const wy = fbm2D(x + 9.7, y + 3.1, seed + 29, octaves) * 2 - 1;
  return [x + wx * strength, y + wy * strength];
}
