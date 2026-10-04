import { TERRAINS, BASE, ORDER, RANK, MASKS, TILE, COLUMNS } from "./tileset.js";
import { PROPS, PROPS_IMAGE } from "./props.js";
import { TILESET_IMAGE } from "./tileset.js";
import { hash2i, clamp } from "./noise.js";

const CACHE_SIZES = [512, 1024, 2048, 4096];

export const DECAL_KIND = "decal";
export const NO_SHADOW = new Set(["plant", "decal", "crop", "reed", "fence", "good", "furniture", "mushroom"]);

export function isDecal(row) {
  return !!row && row[4] === DECAL_KIND;
}

export function planCell(corners, salt) {
  const uniq = [];
  for (let k = 0; k < 4; k++) {
    const t = corners[k];
    if (!uniq.includes(t)) uniq.push(t);
  }
  uniq.sort((a, b) => (RANK[a] ?? -1) - (RANK[b] ?? -1));
  const ids = [];
  const first = uniq[0];
  ids.push(fillId(first, salt));
  for (const t of uniq) {
    let m = 0;
    for (let k = 0; k < 4; k++) if (corners[k] === t) m |= 1 << k;
    const cell = MASKS[t] ? MASKS[t][m] : 0;
    if (!cell) continue;
    ids.push(Array.isArray(cell) ? cell[salt % cell.length] : cell);
  }
  return ids;
}

function fillId(t, salt) {
  const cell = MASKS[t] ? MASKS[t][15] : 0;
  if (Array.isArray(cell) && cell.length) return cell[salt % cell.length];
  if (typeof cell === "number" && cell) return cell;
  return BASE[t];
}

export function tileKey(ids) {
  let s = "";
  for (let i = 0; i < ids.length; i++) s += ids[i] + (i === ids.length - 1 ? "" : ",");
  return s;
}

export class Renderer {
  constructor() {
    this.terrainImg = null;
    this.propImg = null;
    this.ready = false;
    this.cacheLevel = 0;
    this.cacheCanvas = null;
    this.cacheCtx = null;
    this.cacheMap = new Map();
    this.cacheCursor = 0;
    this.composeCount = 0;
    this.shadowCache = new Map();
    this._alloc(0);
  }

  async load(assets = {}) {
    const [t, p] = await Promise.all([
      loadImage(assets.tilesetUrl || TILESET_IMAGE),
      loadImage(assets.propsUrl || PROPS_IMAGE),
    ]);
    this.terrainImg = t;
    this.propImg = p;
    this.ready = true;
    return this;
  }

  _alloc(level) {
    const size = CACHE_SIZES[level];
    this.cacheLevel = level;
    this.cacheCanvas = new OffscreenCanvas(size, size);
    this.cacheCtx = this.cacheCanvas.getContext("2d");
    this.cacheCtx.imageSmoothingEnabled = false;
    this.cols = size / TILE;
    this.cacheMap = new Map();
    this.cacheCursor = 0;
    if (this.slotMap) this.slotMap.fill(-1);
    this.worldImage = null;
    this.worldImageWorld = null;
  }

  invalidate() {
    this.cacheMap.clear();
    this.cacheCursor = 0;
    if (this.slotMap) this.slotMap.fill(-1);
    this.worldImage = null;
    this.worldImageWorld = null;
  }

  pptFor(world) {
    return clamp(Math.floor(4096 / Math.max(world.W, world.H)), 8, 32);
  }

  worldImageValid(world) {
    return !!(this.worldImage && this.worldImageWorld === world && world.W * this.worldImagePpt === this.worldImage.width);
  }

  ensureWorldImage(world) {
    const ppt = this.pptFor(world);
    if (this.worldImageValid(world) && this.worldImagePpt === ppt) return this.worldImage;
    const W = world.W, H = world.H;
    const w = Math.max(1, W * ppt), h = Math.max(1, H * ppt);
    const c = new OffscreenCanvas(w, h);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    this.ensureSlotMap(world);
    const cache = this.cacheCanvas;
    const cols = this.cols;
    if (ppt === TILE) {
      for (let ty = 0; ty < H; ty++) {
        for (let tx = 0; tx < W; tx++) {
          const slot = this.slotFor(world, tx, ty);
          g.drawImage(cache, (slot % cols) * TILE, Math.floor(slot / cols) * TILE, TILE, TILE, tx * ppt, ty * ppt, ppt, ppt);
        }
      }
    } else {
      if (!this.stripCanvas || this.stripCanvas.width !== W * TILE) {
        this.stripCanvas = new OffscreenCanvas(W * TILE, TILE);
        this.stripCtx = this.stripCanvas.getContext("2d");
      }
      const sg = this.stripCtx;
      sg.imageSmoothingEnabled = false;
      const sw = W * ppt;
      for (let ty = 0; ty < H; ty++) {
        for (let tx = 0; tx < W; tx++) {
          const slot = this.slotFor(world, tx, ty);
          sg.drawImage(cache, (slot % cols) * TILE, Math.floor(slot / cols) * TILE, TILE, TILE, tx * TILE, 0, TILE, TILE);
        }
        g.drawImage(this.stripCanvas, 0, 0, W * TILE, TILE, 0, ty * ppt, sw, ppt);
      }
    }
    this.worldImage = c;
    this.worldImageCtx = g;
    this.worldImagePpt = ppt;
    this.worldImageWorld = world;
    return c;
  }

  patchWorldImage(world, x0, y0, x1, y1) {
    if (!this.worldImageValid(world)) return;
    const ppt = this.worldImagePpt;
    const g = this.worldImageCtx;
    g.imageSmoothingEnabled = true;
    const W = world.W, H = world.H;
    const ax = Math.max(0, x0), bx = Math.min(W - 1, x1);
    const ay = Math.max(0, y0), by = Math.min(H - 1, y1);
    for (let y = ay; y <= by; y++) {
      for (let x = ax; x <= bx; x++) {
        const slot = this.slotFor(world, x, y);
        g.drawImage(this.cacheCanvas, (slot % this.cols) * TILE, Math.floor(slot / this.cols) * TILE, TILE, TILE, x * ppt, y * ppt, ppt, ppt);
      }
    }
  }

  ensureSlotMap(world) {
    if (this.slotMap && this.slotW === world.W && this.slotH === world.H) return;
    this.slotMap = new Int32Array(world.W * world.H).fill(-1);
    this.slotW = world.W;
    this.slotH = world.H;
  }

  cornersFor(world, tx, ty) {
    const c = world.corners, cw = world.cw;
    const r0 = ty * cw, r1 = (ty + 1) * cw;
    return [c[r0 + tx], c[r0 + tx + 1], c[r1 + tx], c[r1 + tx + 1]];
  }

  slotFor(world, tx, ty) {
    const i = ty * this.slotW + tx;
    const s = this.slotMap[i];
    if (s >= 0) return s;
    const v = this.cellSlot(this.cornersFor(world, tx, ty), tx, ty);
    this.slotMap[i] = v;
    return v;
  }

  invalidateCells(x0, y0, x1, y1) {
    if (!this.slotMap) return;
    const W = this.slotW, H = this.slotH;
    const ax = Math.max(0, x0), bx = Math.min(W - 1, x1);
    const ay = Math.max(0, y0), by = Math.min(H - 1, y1);
    for (let y = ay; y <= by; y++) {
      const row = y * W;
      for (let x = ax; x <= bx; x++) this.slotMap[row + x] = -1;
    }
    if (this.worldImageWorld) this.patchWorldImage(this.worldImageWorld, ax, ay, bx, by);
  }

  cellSlot(corners, tx, ty) {
    const salt = hash2i(tx, ty, 0x9e37) >>> 0;
    const ids = planCell(corners, salt);
    const key = tileKey(ids);
    let slot = this.cacheMap.get(key);
    if (slot !== undefined) return slot;
    if (this.cacheCursor >= this.cols * this.cols) {
      if (this.cacheLevel + 1 < CACHE_SIZES.length) this._alloc(this.cacheLevel + 1);
      else { this.invalidate(); }
    }
    slot = this.cacheCursor++;
    const sx = (slot % this.cols) * TILE;
    const sy = Math.floor(slot / this.cols) * TILE;
    const ctx = this.cacheCtx;
    for (const id of ids) {
      const ix = (id % COLUMNS) * TILE;
      const iy = Math.floor(id / COLUMNS) * TILE;
      ctx.drawImage(this.terrainImg, ix, iy, TILE, TILE, sx, sy, TILE, TILE);
    }
    this.composeCount++;
    this.cacheMap.set(key, slot);
    return slot;
  }

  drawCell(ctx, world, tx, ty, dx, dy, ts) {
    const slot = this.slotFor(world, tx, ty);
    const sx = (slot % this.cols) * TILE;
    const sy = Math.floor(slot / this.cols) * TILE;
    const size = ts || TILE;
    ctx.drawImage(this.cacheCanvas, sx, sy, TILE, TILE, dx, dy, size, size);
  }

  shadowSprite(w, h) {
    const key = Math.round(w) + "x" + Math.round(h);
    let c = this.shadowCache.get(key);
    if (c) return c;
    const rx = Math.max(3, w * 0.34), ry = Math.max(2, rx * 0.40);
    const pad = 2;
    c = new OffscreenCanvas(Math.ceil(rx * 2 + pad * 2), Math.ceil(ry * 2 + pad * 2));
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, Math.max(c.width, c.height) / 2);
    grad.addColorStop(0, "rgba(0,0,0,0.30)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.save();
    g.translate(c.width / 2, c.height / 2);
    g.scale(1, ry / rx);
    g.beginPath();
    g.arc(0, 0, rx, 0, Math.PI * 2);
    g.fill();
    g.restore();
    this.shadowCache.set(key, c);
    return c;
  }

  drawPropShadow(ctx, prop) {
    const row = PROPS[prop.s];
    if (!row) return;
    if (NO_SHADOW.has(row[4])) return;
    const sc = prop.sc || 1;
    const w = row[2] * sc, h = row[3] * sc;
    const sh = this.shadowSprite(w, h);
    ctx.drawImage(sh, Math.round(prop.x - sh.width / 2), Math.round(prop.y - sh.height * 0.52));
  }

  drawProp(ctx, prop) {
    const row = PROPS[prop.s];
    if (!row) return;
    const sc = prop.sc || 1;
    const [sx, sy, rw, rh] = row;
    const w = rw * sc, h = rh * sc;
    const dx = Math.round(prop.x - w / 2);
    const dy = Math.round(prop.y - h);
    if (prop.flip) {
      ctx.save();
      ctx.translate(dx + w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.propImg, sx, sy, w, h, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(this.propImg, sx, sy, w, h, dx, dy, w, h);
    }
  }

  render(ctx, world, view, canvasW, canvasH, opts = {}) {
    const z = view.zoom;
    const dpr = opts.dpr || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = opts.background || "#101418";
    ctx.fillRect(0, 0, canvasW, canvasH);
    if (!this.ready) return;
    const tx0 = clamp(Math.floor(view.x / TILE), 0, world.W - 1);
    const ty0 = clamp(Math.floor(view.y / TILE), 0, world.H - 1);
    const tx1 = clamp(Math.ceil((view.x + canvasW / (z * dpr)) / TILE), 0, world.W - 1);
    const ty1 = clamp(Math.ceil((view.y + canvasH / (z * dpr)) / TILE), 0, world.H - 1);
    ctx.setTransform(z * dpr, 0, 0, z * dpr, -view.x * z * dpr, -view.y * z * dpr);
    const viewW = canvasW / (z * dpr), viewH = canvasH / (z * dpr);
    this.ensureSlotMap(world);
    const ppt = this.pptFor(world);
    if (z * TILE * dpr <= ppt) {
      const img = this.ensureWorldImage(world);
      const scale = TILE / ppt;
      const eff = z * TILE * dpr / ppt;
      ctx.imageSmoothingEnabled = eff < 0.9;
      ctx.imageSmoothingQuality = "low";
      ctx.drawImage(img, view.x / scale, view.y / scale, viewW / scale, viewH / scale, view.x, view.y, viewW, viewH);
      ctx.imageSmoothingEnabled = false;
    } else {
      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          this.drawCell(ctx, world, tx, ty, tx * TILE, ty * TILE);
        }
      }
    }
    if (opts.showFields) {
      this.drawFieldOverlay(ctx, world, opts.showFields, tx0, ty0, tx1, ty1);
    }
    if (opts.grid && z >= 0.75) {
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1 / (z * dpr);
      ctx.beginPath();
      for (let tx = tx0; tx <= tx1 + 1; tx++) { ctx.moveTo(tx * TILE, ty0 * TILE); ctx.lineTo(tx * TILE, (ty1 + 1) * TILE); }
      for (let ty = ty0; ty <= ty1 + 1; ty++) { ctx.moveTo(tx0 * TILE, ty * TILE); ctx.lineTo((tx1 + 1) * TILE, ty * TILE); }
      ctx.stroke();
    }
    const props = world.props;
    const yMax = (ty1 + 2) * TILE;
    const yMin = ty0 * TILE - 400;
    let start = 0, end = props.length;
    while (start < end && props[start].y < yMin) start++;
    while (end > start && props[end - 1].y > yMax) end--;
    const xSpan = canvasW / (z * dpr);
    const offX = (p) => p.x < view.x - 400 || p.x > view.x + xSpan + 400;
    if (!opts.hideProps) {
      for (let i = start; i < end; i++) {
        const p = props[i];
        if (offX(p) || !isDecal(PROPS[p.s])) continue;
        this.drawProp(ctx, p);
      }
    }
    if (!opts.hideShadows) {
      for (let i = start; i < end; i++) {
        const p = props[i];
        if (offX(p)) continue;
        this.drawPropShadow(ctx, p);
      }
    }
    if (!opts.hideProps) {
      for (let i = start; i < end; i++) {
        const p = props[i];
        if (isDecal(PROPS[p.s])) continue;
        this.drawProp(ctx, p);
      }
    }
    if (opts.selectedProp != null && props[opts.selectedProp]) {
      const p = props[opts.selectedProp];
      const row = PROPS[p.s];
      const sc = p.sc || 1;
      ctx.strokeStyle = "#ffd34d";
      ctx.lineWidth = 1.5 / (z * dpr);
      ctx.strokeRect(p.x - row[2] * sc / 2, p.y - row[3] * sc, row[2] * sc, row[3] * sc);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawFieldOverlay(ctx, world, fieldName, tx0, ty0, tx1, ty1) {
    const f = world.fields[fieldName];
    if (!f) return;
    ctx.save();
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        let sum = 0;
        for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) sum += f[(ty + oy) * world.cw + tx + ox];
        const v = sum / 4;
        ctx.fillStyle = rampColor(v, fieldName);
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
    }
    ctx.restore();
  }

  renderFull(world, scale, opts = {}) {
    const W = Math.round(world.W * TILE * scale);
    const H = Math.round(world.H * TILE * scale);
    const canvas = new OffscreenCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = scale < 1;
    this.invalidate();
    this.ensureSlotMap(world);
    for (let ty = 0; ty < world.H; ty++) {
      const r0 = ty * world.cw, r1 = (ty + 1) * world.cw;
      for (let tx = 0; tx < world.W; tx++) {
        this.drawCell(ctx, world, tx, ty, Math.round(tx * TILE * scale), Math.round(ty * TILE * scale), Math.round(TILE * scale));
      }
    }
    if (!opts.hideProps) for (const p of world.props) {
      const row = PROPS[p.s];
      if (!row || !isDecal(row)) continue;
      this.drawPropScaled(ctx, p, scale);
    }
    if (!opts.hideShadows) for (const p of world.props) {
      const row = PROPS[p.s];
      if (!row || NO_SHADOW.has(row[4])) continue;
      const sc = p.sc || 1;
      const sh = this.shadowSprite(row[2] * sc * scale, row[3] * sc * scale);
      ctx.drawImage(sh, Math.round(p.x * scale - sh.width / 2), Math.round((p.y - row[3] * sc * 0.42) * scale - sh.height / 2));
    }
    if (!opts.hideProps) for (const p of world.props) {
      const row = PROPS[p.s];
      if (!row || isDecal(row)) continue;
      this.drawPropScaled(ctx, p, scale);
    }
    if (opts.labels !== false && world.labels && world.labels.length) {
      this.drawLabels(ctx, world, scale, Math.max(10, Math.round(11 * Math.min(3, Math.max(0.6, scale)))));
    }
    return canvas;
  }

  drawLabels(ctx, world, scale, fs) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 " + fs + "px system-ui, sans-serif";
    for (const l of world.labels) {
      const x = (l.tx + 0.5) * TILE * scale, y = (l.ty + 0.5) * TILE * scale;
      const tw = ctx.measureText(l.name || "").width;
      const bw = tw + fs * 0.7, bh = fs + fs * 0.6;
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = "#141b24";
      ctx.strokeStyle = "#7fd0ff";
      ctx.lineWidth = Math.max(1, fs / 11);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, fs * 0.35);
      else ctx.rect(x - bw / 2, y - bh / 2, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#dbe4ee";
      ctx.fillText(l.name || "", x, y + 0.5);
    }
    ctx.restore();
  }

  drawPropScaled(ctx, p, scale) {
    const row = PROPS[p.s];
    if (!row) return;
    const sc = p.sc || 1;
    const [sx, sy, rw, rh] = row;
    const w = rw * sc, h = rh * sc;
    const dx = Math.round((p.x - w / 2) * scale), dy = Math.round((p.y - h) * scale);
    if (p.flip) {
      ctx.save();
      ctx.translate(dx + w * scale, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.propImg, sx, sy, rw, rh, 0, 0, w * scale, h * scale);
      ctx.restore();
    } else {
      ctx.drawImage(this.propImg, sx, sy, rw, rh, dx, dy, w * scale, h * scale);
    }
  }

  renderMinimap(world, size) {
    const mw = size, mh = Math.max(1, Math.round(size * world.H / world.W));
    const c = new OffscreenCanvas(mw, mh);
    const ctx = c.getContext("2d");
    if (!this.ready) return c;
    const img = this.ensureWorldImage(world);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, mw, mh);
    if (world.labels && world.labels.length) {
      const sx = mw / world.W, sy = mh / world.H;
      for (const l of world.labels) {
        const x = (l.tx + 0.5) * sx, y = (l.ty + 0.5) * sy;
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "#141b24";
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "#7fd0ff";
        ctx.stroke();
      }
    }
    return c;
  }
}

const RAMPS = {
  elev: [[8, 22, 48], [24, 76, 128], [60, 140, 90], [140, 170, 80], [150, 130, 100], [235, 235, 240]],
  water: [[8, 20, 40], [40, 120, 200], [190, 230, 255]],
  depth: [[10, 20, 40], [30, 90, 170], [130, 200, 250]],
  moist: [[180, 140, 70], [160, 190, 110], [40, 110, 190]],
  temp: [[60, 90, 200], [90, 180, 160], [220, 190, 90], [220, 90, 60]],
  rock: [[60, 60, 66], [150, 150, 150], [240, 240, 240]],
  flow: [[20, 30, 40], [70, 160, 220]],
  distWater: [[20, 60, 140], [200, 220, 240]],
};

export function rampColor(v, name) {
  const ramp = RAMPS[name] || RAMPS.elev;
  const t = clamp(v, 0, 1) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(t));
  const f = t - i;
  const a = ramp[i], b = ramp[i + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load " + src));
    img.src = new URL(src, import.meta.url).href;
  });
}

export { TERRAINS };
