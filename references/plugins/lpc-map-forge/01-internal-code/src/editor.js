import { TERRAINS, TERRAIN_INDEX, BASE, TILE, COLUMNS } from "./tileset.js";
import { PROPS } from "./props.js";
import { PREFABS, buildPrefab } from "./prefabs.js";
import { isDecal } from "./render.js";

const MIN_ZOOM = 0.03;
const MAX_ZOOM = 8;

export class Editor {
  constructor(renderer) {
    this.renderer = renderer;
    this.world = null;
    this.canvas = null;
    this.ctx = null;
    this.view = { x: 0, y: 0, zoom: 1 };
    this.opts = { grid: true, props: true, shadows: true, field: "", selectedProp: -1 };
    this.tool = "brush";
    this.terrain = TERRAIN_INDEX.Grass;
    this.propIndex = -1;
    this.prefabIndex = PREFABS.length ? 0 : -1;
    this.propScale = 1;
    this.brushSize = 4;
    this.shape = "square";
    this.clip = null;
    this._cloneSrc = null;
    this.selectedLabel = -1;
    this.labelTool = "label";
    this._undoStack = [];
    this._redoStack = [];
    this._undoBytes = 0;
    this.maxHistBytes = 96 * 1024 * 1024;
    this.dirty = false;
    this.pointer = { tx: 0, ty: 0, px: 0, py: 0, inside: false };
    this.selectedProp = -1;
    this.minimapCanvas = null;
    this.minimapDirty = true;
    this.minimapSize = 320;
    this.onStatus = () => {};
    this.onChange = () => {};
    this.onHistory = () => {};
    this.onDirty = () => {};
    this.onRequestLabel = () => {};
    this._dragging = null;
    this._panning = null;
    this._space = false;
    this._paintLast = null;
    this._pendingSnap = null;
    this._raf = 0;
  }

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    const cv = canvas;
    const onDown = (e) => this._onDown(e);
    const onMove = (e) => this._onMove(e);
    const onUp = (e) => this._onUp(e);
    const onLeave = () => { this.pointer.inside = false; this.requestDraw(); };
    const onWheel = (e) => this._onWheel(e);
    const onCtx = (e) => e.preventDefault();
    const onKeyDown = (e) => this._onKey(e);
    const onKeyUp = (e) => { if (e.code === "Space") { this._space = false; this._syncCursor(); } };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("contextmenu", onCtx);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    this._teardown = () => {
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    this.resize();
  }

  detach() {
    if (this._teardown) { this._teardown(); this._teardown = null; }
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    this.canvas = null;
    this.ctx = null;
  }

  setWorld(world, keepView) {
    this.world = world;
    this.selectedProp = -1;
    this.opts.selectedProp = -1;
    this.selectedLabel = -1;
    this._labelDrag = null;
    this._undoStack = [];
    this._redoStack = [];
    this._undoBytes = 0;
    this._pendingSnap = null;
    this.minimapDirty = true;
    if (!keepView) this.fit();
    this.onHistory();
    this.markDirty(false);
    this.status();
    this.requestDraw();
  }

  resize() {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(64, Math.round(r.width * dpr));
    const h = Math.max(64, Math.round(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.dpr = dpr;
    }
    this.requestDraw();
  }

  get viewW() { return this.canvas.width / this.dpr; }
  get viewH() { return this.canvas.height / this.dpr; }

  fit() {
    const w = this.world;
    if (!w || !this.canvas) return;
    const pad = 24;
    const zx = (this.viewW - pad * 2) / (w.W * TILE);
    const zy = (this.viewH - pad * 2) / (w.H * TILE);
    this.view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zx, zy)));
    this.centerOn(w.W * TILE / 2, w.H * TILE / 2);
  }

  centerOn(worldX, worldY) {
    this.view.x = worldX - this.viewW / (2 * this.view.zoom);
    this.view.y = worldY - this.viewH / (2 * this.view.zoom);
    this.clampView();
    this.requestDraw();
  }

  zoomAt(screenX, screenY, factor) {
    const wx = this.view.x + screenX / this.view.zoom;
    const wy = this.view.y + screenY / this.view.zoom;
    this.view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.view.zoom * factor));
    this.view.x = wx - screenX / this.view.zoom;
    this.view.y = wy - screenY / this.view.zoom;
    this.clampView();
    this.requestDraw();
  }

  clampView() {
    const w = this.world;
    if (!w) return;
    const mw = w.W * TILE, mh = w.H * TILE;
    const vw = this.viewW / this.view.zoom, vh = this.viewH / this.view.zoom;
    const slackX = mw * 0.6, slackY = mh * 0.6;
    this.view.x = Math.max(-slackX, Math.min(mw - vw + slackX, this.view.x));
    this.view.y = Math.max(-slackY, Math.min(mh - vh + slackY, this.view.y));
  }

  screenToWorld(sx, sy) {
    return { x: this.view.x + sx / this.view.zoom, y: this.view.y + sy / this.view.zoom };
  }

  worldToScreen(wx, wy) {
    return { x: (wx - this.view.x) * this.view.zoom, y: (wy - this.view.y) * this.view.zoom };
  }

  localPointer(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  markDirty(v) {
    if (this.dirty === v) return;
    this.dirty = v;
    this.onDirty(v);
  }

  requestDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this.draw(); });
  }

  draw() {
    const w = this.world;
    if (!w || !this.canvas) return;
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#080b0f";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderer.render(ctx, w, this.view, this.canvas.width, this.canvas.height, {
      dpr,
      background: "#0a1420",
      grid: this.opts.grid && this.view.zoom >= 0.5,
      hideProps: !this.opts.props,
      hideShadows: !this.opts.shadows,
      showFields: this.opts.field || false,
      selectedProp: this.opts.selectedProp >= 0 ? this.opts.selectedProp : null,
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._drawOverlay(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  _drawOverlay(ctx) {
    if (!this.world) return;
    this._drawToolOverlay(ctx);
    this._drawLabels(ctx);
  }

  _drawToolOverlay(ctx) {
    const p = this.pointer;
    if (!p.inside || !this.world) return;
    if (this.tool === "pan") return;
    if (this.tool === "clone") {
      this._drawCloneOverlay(ctx);
      return;
    }
    if (this.tool === "prop" && this.propIndex >= 0) {
      const row = PROPS[this.propIndex];
      if (!row) return;
      const decal = isDecal(row);
      const sc = (decal ? 1 : this.propScale) * this.view.zoom;
      const w = row[2] * sc, h = row[3] * sc;
      const a = decal ? this.decalAnchor(p.px, p.py, row) : { x: p.px, y: p.py };
      const s = this.worldToScreen(a.x, a.y);
      ctx.globalAlpha = 0.72;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], s.x - w / 2, s.y - h, w, h);
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffca45";
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(s.x - w / 2) + 0.5, Math.round(s.y - h) + 0.5, Math.round(w), Math.round(h));
      ctx.globalAlpha = 1;
      return;
    }
    if (this.tool === "stamp") {
      const pf = PREFABS[this.prefabIndex];
      if (!pf) return;
      const z = this.view.zoom;
      const ox = p.tx - ((pf.w - 1) >> 1), oy = p.ty - (pf.h - 1);
      ctx.globalAlpha = 0.68;
      ctx.imageSmoothingEnabled = false;
      for (const q of buildPrefab(this.prefabIndex, p.tx, p.ty, this.propScale)) {
        const row = PROPS[q.s];
        if (!row) continue;
        const s = this.worldToScreen(q.x, q.y);
        const w = row[2] * (q.sc || 1) * z, h = row[3] * (q.sc || 1) * z;
        ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], s.x - w / 2, s.y - h, w, h);
      }
      ctx.globalAlpha = 1;
      const a = this.worldToScreen(ox * TILE, oy * TILE);
      const b = this.worldToScreen((ox + pf.w) * TILE, (oy + pf.h) * TILE);
      ctx.strokeStyle = "#ffca45";
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
      return;
    }
    if (this.tool === "select") return;
    if (this.tool === "erase") {
      const s = this.worldToScreen(p.px, p.py);
      const r = Math.max(8, this.brushSize * TILE * 0.5) * this.view.zoom;
      ctx.strokeStyle = "rgba(255,106,106,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,106,106,0.10)";
      ctx.fill();
      return;
    }
    if (this._dragging && (this._dragging.tool === "rect" || this._dragging.tool === "line")) {
      this._drawDragPreview(ctx);
      return;
    }
    const cell = this._brushCells(p.tx, p.ty);
    if (!cell.length) return;
    const sc = this.view.zoom;
    ctx.strokeStyle = "rgba(255,202,69,0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const c of cell) {
      const s = this.worldToScreen(c[0] * TILE, c[1] * TILE);
      const x = Math.round(s.x) + 0.5, y = Math.round(s.y) + 0.5, z = Math.round(TILE * sc);
      ctx.rect(x, y, z, z);
    }
    ctx.stroke();
    if (this.view.zoom >= 0.6) {
      ctx.fillStyle = "rgba(255,202,69,0.10)";
      ctx.fill();
    }
  }

  _drawDragPreview(ctx) {
    const d = this._dragging;
    const zoom = this.view.zoom;
    ctx.strokeStyle = "rgba(255,202,69,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (d.tool === "line") {
      const z = Math.round(TILE * zoom);
      for (const c of this._lineCells(d.tx0, d.ty0, d.tx, d.ty)) {
        const s = this.worldToScreen(c[0] * TILE, c[1] * TILE);
        ctx.rect(Math.round(s.x) + 0.5, Math.round(s.y) + 0.5, z, z);
      }
    } else {
      const ax = Math.min(d.tx0, d.tx), bx = Math.max(d.tx0, d.tx);
      const ay = Math.min(d.ty0, d.ty), by = Math.max(d.ty0, d.ty);
      const a = this.worldToScreen(ax * TILE, ay * TILE);
      const b = this.worldToScreen((bx + 1) * TILE, (by + 1) * TILE);
      if (this.shape === "round" && d.tool !== "clone") {
        ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
      }
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(255,202,69,0.12)";
    ctx.fill();
  }

  _drawCloneOverlay(ctx) {
    const p = this.pointer;
    const z = this.view.zoom;
    if (this._dragging && this._dragging.tool === "clone") {
      this._drawDragPreview(ctx);
      return;
    }
    if (!this.clip) {
      ctx.fillStyle = "rgba(200,220,255,0.85)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Copy: drag a rectangle", 12, 18);
      return;
    }
    const c = this.clip;
    const ox = p.tx - (c.w >> 1), oy = p.ty - (c.h >> 1);
    const a = this.worldToScreen(ox * TILE, oy * TILE);
    const b = this.worldToScreen((ox + c.w) * TILE, (oy + c.h) * TILE);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.imageSmoothingEnabled = false;
    for (const q of this.clip.props) {
      const row = PROPS[q.s];
      if (!row) continue;
      const s = this.worldToScreen((ox + q.dx) * TILE + row[2] / 2, (oy + q.dy) * TILE + row[3]);
      const w = row[2] * (q.sc || 1) * z, h = row[3] * (q.sc || 1) * z;
      ctx.save();
      if (q.flip) {
        ctx.translate(s.x, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], -w / 2, s.y - h, w, h);
      } else {
        ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], s.x - w / 2, s.y - h, w, h);
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = "#7fd0ff";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(127,208,255,0.10)";
    ctx.fillRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
  }

  _drawLabels(ctx) {
    const w = this.world;
    const labels = w && w.labels;
    if (!labels || !labels.length) return;
    const z = this.view.zoom;
    const fs = Math.max(9, Math.min(15, Math.round(11 * Math.min(1.6, Math.max(0.85, z)))));
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      const s = this.worldToScreen((l.tx + 0.5) * TILE, (l.ty + 0.5) * TILE);
      if (s.x < -200 || s.y < -120 || s.x > this.viewW + 200 || s.y > this.viewH + 120) continue;
      ctx.save();
      ctx.font = "600 " + fs + "px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(l.name || "").width;
      const padX = 6, bw = tw + padX * 2, bh = fs + 8;
      const bx = Math.round(s.x - bw / 2), by = Math.round(s.y - bh / 2);
      const active = i === this.selectedLabel;
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = active ? "#2b4a6d" : "#141b24";
      ctx.strokeStyle = active ? "#ffca45" : "#7fd0ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx + 0.5, by + 0.5, bw, bh, 4);
      else ctx.rect(bx + 0.5, by + 0.5, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = active ? "#ffe9a8" : "#dbe4ee";
      ctx.fillText(l.name || "", s.x, s.y + 0.5);
      ctx.restore();
    }
  }

  labelAt(tx, ty, tol) {
    const labels = (this.world && this.world.labels) || [];
    const t = tol == null ? 1 : tol;
    for (let i = labels.length - 1; i >= 0; i--) {
      const l = labels[i];
      const hw = t + Math.max(1, ((l.name || "").length >> 1));
      if (ty >= l.ty - t && ty <= l.ty + t && tx >= l.tx - hw && tx <= l.tx + hw) return i;
    }
    return -1;
  }

  _brushCells(cx, cy) {
    const n = this.brushSize;
    const x0 = cx - Math.floor((n - 1) / 2);
    const y0 = cy - Math.floor((n - 1) / 2);
    const out = [];
    if (n <= 1) { out.push([cx, cy]); return out; }
    if (this.shape === "square") {
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) out.push([x, y]);
    } else {
      const c = (n - 1) / 2, r = n / 2 - 0.5;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = x - c, dy = y - c;
        if (dx * dx + dy * dy <= r * r) out.push([x0 + x, y0 + y]);
      }
    }
    return out;
  }

  _onDown(e) {
    if (!this.world) return;
    try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const lp = this.localPointer(e);
    const wp = this.screenToWorld(lp.x, lp.y);
    const tx = Math.floor(wp.x / TILE), ty = Math.floor(wp.y / TILE);
    if (e.button === 1 || this._space || this.tool === "pan" || e.button === 2 && this.tool === "pan") {
      this._panning = { sx: lp.x, sy: lp.y, vx: this.view.x, vy: this.view.y };
      this.canvas.classList.add("panning");
      e.preventDefault();
      return;
    }
    if (this.tool === "pick") {
      this.pickTerrain(tx, ty);
      return;
    }
    if (this.tool === "select") {
      this._selectDown(tx, ty, wp, e);
      return;
    }
    if (this.tool === "stamp") {
      this._beginOp("prefab");
      if (e.shiftKey || e.button === 2) this.erasePrefab(wp.x, wp.y);
      else this.placePrefab(wp.x, wp.y);
      this._commitOp();
      return;
    }
    if (this.tool === "prop") {
      this._beginOp("prop");
      if (e.shiftKey || e.button === 2) this.erasePropAt(wp.x, wp.y);
      else this.placeProp(wp.x, wp.y);
      this._commitOp();
      return;
    }
    if (this.tool === "clone") {
      if (tx < 0 || ty < 0 || tx >= this.world.W || ty >= this.world.H) return;
      this._dragging = { tool: "clone", tx0: tx, ty0: ty, tx, ty };
      this.requestDraw();
      return;
    }
    if (this.tool === "label") {
      const hit = this.labelAt(tx, ty, 1);
      if (hit >= 0) {
        this.selectedLabel = hit;
        this.snapshot("move label");
        this._labelDrag = hit;
        this.onChange("label");
      } else if (tx >= 0 && ty >= 0 && tx < this.world.W && ty < this.world.H) {
        this.onRequestLabel(tx, ty);
      }
      this.status();
      this.requestDraw();
      return;
    }
    if (this.tool === "erase") {
      this._beginOp("erase");
      this._erasing = true;
      this._eraseAt(wp.x, wp.y, e.shiftKey);
      this.canvas.classList.add("erasing");
      e.preventDefault();
      return;
    }
    if (tx < 0 || ty < 0 || tx >= this.world.W || ty >= this.world.H) return;
    this._beginOp(this.tool);
    if (this.tool === "fill") {
      this.floodFill(tx, ty);
      this._commitOp();
      this._paintLast = null;
      return;
    }
    this._dragging = { tool: this.tool, tx0: tx, ty0: ty, tx, ty };
    this._paintLast = null;
    if (this.tool === "brush") this._paintStroke(tx, ty);
    this.requestDraw();
  }

  _onMove(e) {
    if (!this.world) return;
    const lp = this.localPointer(e);
    const wp = this.screenToWorld(lp.x, lp.y);
    const tx = Math.floor(wp.x / TILE), ty = Math.floor(wp.y / TILE);
    this.pointer.px = wp.x; this.pointer.py = wp.y;
    this.pointer.tx = tx; this.pointer.ty = ty;
    this.pointer.inside = true;
    if (this._panning) {
      this.view.x = this._panning.vx - (lp.x - this._panning.sx) / this.view.zoom;
      this.view.y = this._panning.vy - (lp.y - this._panning.sy) / this.view.zoom;
      this.clampView();
      this.requestDraw();
      return;
    }
    if (this._dragging) {
      const d = this._dragging;
      if (d.tool === "brush") {
        this._paintStroke(tx, ty);
      } else {
        d.tx = tx; d.ty = ty;
      }
      this.status();
      this.requestDraw();
      return;
    }
    if (this._erasing) {
      this._eraseAt(wp.x, wp.y, e.shiftKey);
      this.status();
      this.requestDraw();
      return;
    }
    if (this._movingProp) {
      const p = this.world.props[this._movingProp];
      if (p) { p.x = Math.round(wp.x); p.y = Math.round(wp.y); this.markDirty(true); this.requestDraw(); }
      return;
    }
    if (this._labelDrag != null) {
      const l = this.world.labels && this.world.labels[this._labelDrag];
      if (l) { l.tx = tx; l.ty = ty; this.markDirty(true); this.requestDraw(); }
      return;
    }
    this.status();
    this.requestDraw();
  }

  _onUp(e) {
    if (this._panning) { this._panning = null; this.canvas.classList.remove("panning"); }
    if (this._erasing) {
      this._erasing = false;
      this.canvas.classList.remove("erasing");
      this._commitOp();
      this.afterEdit();
    }
    if (this._dragging) {
      const d = this._dragging;
      if (d.tool === "rect") this._applyRect(d.tx0, d.ty0, d.tx, d.ty);
      else if (d.tool === "line") this._applyLine(d.tx0, d.ty0, d.tx, d.ty);
      else if (d.tool === "clone") {
        const ax = Math.min(d.tx0, d.tx), bx = Math.max(d.tx0, d.tx);
        const ay = Math.min(d.ty0, d.ty), by = Math.max(d.ty0, d.ty);
        if (bx > ax || by > ay) this.copyRegion(ax, ay, bx, by);
        else if (this.clip) this.pasteAt(d.tx, d.ty);
      }
      this._dragging = null;
      this._paintLast = null;
      this._commitOp();
      this.afterEdit();
    }
    if (this._labelDrag != null) {
      this._labelDrag = null;
      this._commitOp();
      this.afterEdit();
    }
    if (this._movingProp != null) {
      this._movingProp = null;
      this.world.props.sort((a, b) => a.y - b.y || a.x - b.x);
      this.opts.selectedProp = -1;
      this.selectedProp = -1;
      this.afterEdit();
    }
    this.requestDraw();
  }

  _onWheel(e) {
    if (!this.world) return;
    e.preventDefault();
    const lp = this.localPointer(e);
    const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
    this.zoomAt(lp.x, lp.y, f);
    this.status();
  }

  _onKey(e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.code === "Space") { this._space = true; this._syncCursor(); e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && k === "z") {
      e.preventDefault();
      if (e.shiftKey) this.redo(); else this.undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); this.redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tools = { b: "brush", r: "rect", f: "fill", l: "line", i: "pick", t: "prop", v: "select", x: "erase", h: "pan", k: "stamp", c: "clone", m: "label" };
    if (tools[k]) { this.setTool(tools[k]); return; }
    if (k === "escape") {
      if (this.selectedProp >= 0 || this.selectedLabel >= 0) {
        this.selectedProp = -1;
        this.opts.selectedProp = -1;
        this.selectedLabel = -1;
        this.onChange("select");
        this.requestDraw();
      }
      return;
    }
    if (k === "g") { this.opts.grid = !this.opts.grid; this.onChange("opts"); this.requestDraw(); return; }
    if (k === "p") { this.opts.props = !this.opts.props; this.onChange("opts"); this.requestDraw(); return; }
    if (k === "0") { this.fit(); return; }
    if (k === "[" || k === "]") {
      this.setBrushSize(this.brushSize + (k === "]" ? 1 : -1));
      return;
    }
    if (k === "delete" || k === "backspace") {
      if (this.selectedProp >= 0) { this.snapshot("delete prop"); this.deleteProp(this.selectedProp); }
      return;
    }
    if (k === "e" && this.selectedProp >= 0) {
      const p = this.world.props[this.selectedProp];
      this.snapshot("flip prop");
      p.flip = p.flip ? 0 : 1;
      this.afterEdit();
    }
  }

  _syncCursor() {
    if (!this.canvas) return;
    this.canvas.classList.toggle("panning", !!this._space || this.tool === "pan");
    this.canvas.classList.toggle("picking", this.tool === "pick");
    this.canvas.classList.toggle("erasing", this.tool === "erase");
    this.canvas.classList.toggle("cloning", this.tool === "clone");
    this.canvas.classList.toggle("labelling", this.tool === "label");
  }

  setTool(t) {
    this.tool = t;
    this._dragging = null;
    this._syncCursor();
    this.onChange("tool");
    this.status();
    this.requestDraw();
  }

  setTerrain(i) {
    this.terrain = i;
    this.onChange("terrain");
  }

  setProp(i) {
    this.propIndex = i;
    if (i >= 0 && this.tool !== "prop") this.setTool("prop");
    this.onChange("prop");
  }

  setPrefab(i) {
    this.prefabIndex = Math.max(0, Math.min(PREFABS.length - 1, i | 0));
    if (this.tool !== "stamp") this.setTool("stamp");
    this.onChange("prefab");
    this.status();
    this.requestDraw();
  }

  setBrushSize(n) {
    this.brushSize = Math.max(1, Math.min(30, Math.round(n)));
    this.onChange("brush");
  }

  setPropScale(p) {
    this.propScale = Math.max(0.5, Math.min(2, p));
    this.onChange("brush");
  }

  setShape(s) { this.shape = s; this.onChange("brush"); this.requestDraw(); }

  cornerAt(tx, ty) {
    const w = this.world;
    if (!w) return 0;
    return w.corners[ty * w.cw + tx] || 0;
  }

  pickTerrain(tx, ty) {
    const w = this.world;
    if (tx < 0 || ty < 0 || tx >= w.W || ty >= w.H) return;
    const counts = new Map();
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const t = w.corners[(ty + oy) * w.cw + tx + ox];
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    let best = this.cornerAt(tx, ty), bestN = -1;
    for (const [t, n] of counts) if (n > bestN) { bestN = n; best = t; }
    this.setTerrain(best);
    this.setTool("brush");
  }

  setCorner(x, y, t) {
    const w = this.world;
    if (x < 0 || y < 0 || x >= w.cw || y >= w.ch) return;
    const i = y * w.cw + x;
    if (w.corners[i] !== t) { w.corners[i] = t; return true; }
    return false;
  }

  stamp(tx, ty) {
    const w = this.world;
    if (tx < 0 || ty < 0 || tx >= w.W || ty >= w.H) return false;
    let changed = false;
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      if (this.setCorner(tx + ox, ty + oy, this.terrain)) changed = true;
    }
    if (changed) this.renderer.invalidateCells(tx - 1, ty - 1, tx + 1, ty + 1);
    return changed;
  }

  _paintStroke(tx, ty) {
    const last = this._paintLast;
    let changed = false;
    if (last && (Math.abs(last[0] - tx) > 0 || Math.abs(last[1] - ty) > 0)) {
      const steps = Math.max(Math.abs(tx - last[0]), Math.abs(ty - last[1]));
      for (let s = 1; s <= steps; s++) {
        const ix = Math.round(last[0] + (tx - last[0]) * s / steps);
        const iy = Math.round(last[1] + (ty - last[1]) * s / steps);
        for (const c of this._brushCells(ix, iy)) if (this.stamp(c[0], c[1])) changed = true;
      }
    } else {
      for (const c of this._brushCells(tx, ty)) if (this.stamp(c[0], c[1])) changed = true;
    }
    this._paintLast = [tx, ty];
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  _applyRect(x0, y0, x1, y1) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const cx = (ax + bx + 1) / 2, cy = (ay + by + 1) / 2;
    const rx = (bx - ax + 1) / 2, ry = (by - ay + 1) / 2;
    let changed = false;
    for (let y = ay; y <= by + 1; y++) {
      for (let x = ax; x <= bx + 1; x++) {
        if (this.shape === "round") {
          const dx = (x - cx) / rx, dy = (y - cy) / ry;
          if (dx * dx + dy * dy > 1) continue;
        }
        if (this.setCorner(x, y, this.terrain)) changed = true;
      }
    }
    if (changed) this.renderer.invalidateCells(ax - 1, ay - 1, bx + 1, by + 1);
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  _lineCells(x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    const out = [];
    for (let s = 0; s <= steps; s++) {
      const ix = steps ? Math.round(x0 + (x1 - x0) * s / steps) : x0;
      const iy = steps ? Math.round(y0 + (y1 - y0) * s / steps) : y0;
      for (const c of this._brushCells(ix, iy)) out.push(c);
    }
    return out;
  }

  _applyLine(x0, y0, x1, y1) {
    let changed = false;
    for (const c of this._lineCells(x0, y0, x1, y1)) if (this.stamp(c[0], c[1])) changed = true;
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  floodFill(tx, ty) {
    const w = this.world;
    if (tx < 0 || ty < 0 || tx >= w.W || ty >= w.H) return;
    const sig = (x, y) => {
      const a = w.corners[y * w.cw + x], b = w.corners[y * w.cw + x + 1];
      const c = w.corners[(y + 1) * w.cw + x], d = w.corners[(y + 1) * w.cw + x + 1];
      return a + "," + b + "," + c + "," + d;
    };
    const target = sig(tx, ty);
    const seen = new Uint8Array(w.W * w.H);
    const stack = [tx, ty];
    let changed = false;
    while (stack.length) {
      const y = stack.pop(), x = stack.pop();
      if (x < 0 || y < 0 || x >= w.W || y >= w.H) continue;
      const i = y * w.W + x;
      if (seen[i]) continue;
      if (sig(x, y) !== target) continue;
      seen[i] = 1;
      if (this.stamp(x, y)) changed = true;
      stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
    }
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  erasePropAt(wx, wy) {
    for (let i = this.world.props.length - 1; i >= 0; i--) {
      const p = this.world.props[i];
      const row = PROPS[p.s];
      if (!row) continue;
      const sc = p.sc || 1;
      const hw = row[2] * sc / 2, h = row[3] * sc;
      if (wx >= p.x - hw && wx <= p.x + hw && wy >= p.y - h && wy <= p.y) {
        this.world.props.splice(i, 1);
        this.markDirty(true);
        this.minimapDirty = true;
        this.afterEdit();
        return true;
      }
    }
    return false;
  }

  _eraseAt(wx, wy, single) {
    const w = this.world;
    if (!w) return 0;
    const r = single ? 6 : Math.max(8, this.brushSize * TILE * 0.5);
    let removed = 0;
    for (let i = w.props.length - 1; i >= 0; i--) {
      const p = w.props[i];
      const row = PROPS[p.s];
      if (!row) continue;
      const sc = p.sc || 1;
      const hw = row[2] * sc / 2, h = row[3] * sc;
      const nx = Math.max(p.x - hw, Math.min(wx, p.x + hw));
      const ny = Math.max(p.y - h, Math.min(wy, p.y));
      const dx = nx - wx, dy = ny - wy;
      if (dx * dx + dy * dy <= r * r) { w.props.splice(i, 1); removed++; }
    }
    if (removed) {
      this.markDirty(true);
      this.minimapDirty = true;
      this.afterEdit();
    }
    return removed;
  }

  decalAnchor(wx, wy, row) {
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    return { x: tx * TILE + row[2] / 2, y: ty * TILE + row[3] };
  }

  placeProp(wx, wy) {
    if (this.propIndex < 0) return;
    const row = PROPS[this.propIndex];
    if (!row) return;
    const w = this.world;
    if (wx < 0 || wy < 0 || wx > w.W * TILE || wy > w.H * TILE) return;
    const decal = isDecal(row);
    const a = decal ? this.decalAnchor(wx, wy, row) : { x: Math.round(wx), y: Math.round(wy) };
    w.props.push({ x: a.x, y: a.y, s: this.propIndex, flip: decal ? 0 : (Math.random() < 0.5 ? 1 : 0), kind: row[4], sc: decal ? 1 : this.propScale });
    w.props.sort((a, b) => a.y - b.y || a.x - b.x);
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
  }

  placePrefab(wx, wy) {
    const pf = PREFABS[this.prefabIndex];
    if (!pf) return 0;
    const w = this.world;
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    const parts = buildPrefab(this.prefabIndex, tx, ty, this.propScale);
    if (!parts.length) return 0;
    let n = 0;
    for (const q of parts) {
      if (q.x < 0 || q.y < 0 || q.x > w.W * TILE || q.y > w.H * TILE) continue;
      w.props.push(q);
      n++;
    }
    if (!n) return 0;
    w.props.sort((a, b) => a.y - b.y || a.x - b.x);
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
    return n;
  }

  erasePrefab(wx, wy) {
    const pf = PREFABS[this.prefabIndex];
    const w = this.world;
    if (!pf || !w) return 0;
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    const ox = tx - ((pf.w - 1) >> 1), oy = ty - (pf.h - 1);
    const x0 = ox * TILE, y0 = oy * TILE, x1 = (ox + pf.w) * TILE, y1 = (oy + pf.h) * TILE;
    let removed = 0;
    for (let i = w.props.length - 1; i >= 0; i--) {
      const p = w.props[i];
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) { w.props.splice(i, 1); removed++; }
    }
    if (removed) {
      this.markDirty(true);
      this.minimapDirty = true;
      this.afterEdit();
    }
    return removed;
  }

  copyRegion(x0, y0, x1, y1) {
    const w = this.world;
    if (!w) return null;
    const ax = Math.max(0, Math.min(x0, x1)), bx = Math.min(w.W - 1, Math.max(x0, x1));
    const ay = Math.max(0, Math.min(y0, y1)), by = Math.min(w.H - 1, Math.max(y0, y1));
    const cw = bx - ax + 1, ch = by - ay + 1;
    if (cw < 1 || ch < 1) return null;
    const corners = new Uint8Array((cw + 1) * (ch + 1));
    for (let y = 0; y <= ch; y++) {
      for (let x = 0; x <= cw; x++) corners[y * (cw + 1) + x] = w.corners[(ay + y) * w.cw + ax + x];
    }
    const px0 = ax * TILE, py0 = ay * TILE, px1 = (bx + 1) * TILE, py1 = (by + 1) * TILE;
    const props = [];
    for (const p of w.props) {
      if (p.x < px0 || p.x > px1 || p.y < py0 || p.y > py1) continue;
      props.push({ dx: (p.x - px0) / TILE, dy: (p.y - py0) / TILE, s: p.s, flip: p.flip || 0, kind: p.kind, sc: p.sc || 1 });
    }
    this.clip = { w: cw, h: ch, corners, props };
    this._cloneSrc = { ax, ay, bx, by };
    return this.clip;
  }

  pasteAt(tx, ty) {
    const w = this.world;
    const c = this.clip;
    if (!w || !c) return 0;
    const ox = tx - (c.w >> 1), oy = ty - (c.h >> 1);
    this._beginOp("clone");
    let wrote = 0;
    const stride = c.w + 1;
    for (let y = 0; y <= c.h; y++) {
      for (let x = 0; x <= c.w; x++) {
        if (this.setCorner(ox + x, oy + y, c.corners[y * stride + x])) wrote++;
      }
    }
    let added = 0;
    for (const q of c.props) {
      const px = (ox + q.dx) * TILE + TILE / 2, py = (oy + q.dy) * TILE + TILE;
      if (px < 0 || py < 0 || px > w.W * TILE || py > w.H * TILE) continue;
      w.props.push({ x: px, y: py, s: q.s, flip: q.flip || 0, kind: q.kind, sc: q.sc || 1 });
      added++;
    }
    if (added) w.props.sort((a, b) => a.y - b.y || a.x - b.x);
    this.renderer.invalidateCells(ox - 1, oy - 1, ox + c.w + 1, oy + c.h + 1);
    this._commitOp();
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
    return added;
  }

  clearClip() {
    this.clip = null;
    this._cloneSrc = null;
    this.requestDraw();
  }

  addLabel(tx, ty, name) {
    const w = this.world;
    if (!w) return -1;
    if (!Array.isArray(w.labels)) w.labels = [];
    w.labels.push({ tx, ty, name: (name || "New label").slice(0, 40) });
    this.selectedLabel = w.labels.length - 1;
    this.markDirty(true);
    this.afterEdit();
    return this.selectedLabel;
  }

  renameLabel(i, name) {
    const w = this.world;
    if (!w || !w.labels || !w.labels[i]) return;
    w.labels[i].name = String(name || "").slice(0, 40);
    this.markDirty(true);
    this.afterEdit();
  }

  removeLabel(i) {
    const w = this.world;
    if (!w || !w.labels || !w.labels[i]) return;
    w.labels.splice(i, 1);
    this.selectedLabel = -1;
    this.markDirty(true);
    this.afterEdit();
  }

  _selectDown(tx, ty, wp, e) {
    let hit = -1;    for (let i = this.world.props.length - 1; i >= 0; i--) {
      const p = this.world.props[i];
      const row = PROPS[p.s];
      if (!row) continue;
      const sc = p.sc || 1;
      const hw = row[2] * sc / 2, h = row[3] * sc;
      if (wp.x >= p.x - hw && wp.x <= p.x + hw && wp.y >= p.y - h && wp.y <= p.y) { hit = i; break; }
    }
    this.selectedProp = hit;
    this.opts.selectedProp = hit;
    if (hit >= 0) {
      this.snapshot("move prop");
      this._movingProp = hit;
    }
    this.status();
    this.onChange("select");
    this.requestDraw();
  }

  deleteProp(i) {
    if (i < 0 || i >= this.world.props.length) return;
    this.world.props.splice(i, 1);
    this.selectedProp = -1;
    this.opts.selectedProp = -1;
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
  }

  clearProps() {
    this.snapshot("clear props");
    this.world.props.length = 0;
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
  }

  snapshot(label) {
    if (!this.world) return;
    this._beginOp(label);
    this._commitOp();
  }

  _beginOp(label) {
    if (!this.world || this._pendingSnap) return;
    this._pendingSnap = { label, corners: new Uint8Array(this.world.corners), props: this.world.props.map((p) => ({ ...p })) };
  }

  _commitOp() {
    if (!this._pendingSnap) return;
    this._undoStack = this._undoStack || [];
    this._redoStack = [];
    this._undoStack.push(this._pendingSnap);
    this._undoBytes = (this._undoBytes || 0) + this._pendingSnap.corners.length + this._pendingSnap.props.length * 40;
    this._pendingSnap = null;
    while (this._undoStack.length > 1 && this._undoBytes > this.maxHistBytes) {
      const gone = this._undoStack.shift();
      this._undoBytes -= gone.corners.length + gone.props.length * 40;
    }
    this.onHistory();
  }

  _cancelOp() { this._pendingSnap = null; }

  canUndo() { return !!(this._undoStack && this._undoStack.length); }
  canRedo() { return !!(this._redoStack && this._redoStack.length); }

  _currentState() {
    return { corners: new Uint8Array(this.world.corners), props: this.world.props.map((p) => ({ ...p })) };
  }

  _restore(snap) {
    this.world.corners = new Uint8Array(snap.corners);
    this.world.props = snap.props.map((p) => ({ ...p }));
    this.selectedProp = -1;
    this.opts.selectedProp = -1;
    this.minimapDirty = true;
    this.renderer.invalidate();
    this.markDirty(true);
    this.onHistory();
    this.afterEdit();
  }

  undo() {
    this._undoStack = this._undoStack || [];
    if (!this._undoStack.length) return;
    this._redoStack = this._redoStack || [];
    this._redoStack.push({ ...this._currentState() });
    const snap = this._undoStack.pop();
    this._undoBytes -= snap.corners.length + snap.props.length * 40;
    this._restore(snap);
  }

  redo() {
    this._redoStack = this._redoStack || [];
    if (!this._redoStack.length) return;
    this._undoStack = this._undoStack || [];
    this._undoStack.push({ ...this._currentState() });
    const snap = this._redoStack.pop();
    this._restore(snap);
  }

  afterEdit() {
    this.onChange("edit");
    this.status();
    this.requestDraw();
  }

  refreshMinimap() {
    const w = this.world;
    if (!w) return null;
    this.minimapCanvas = this.renderer.renderMinimap(w, this.minimapSize);
    this.minimapDirty = false;
    return this.minimapCanvas;
  }

  status() {
    const w = this.world;
    if (!w) return;
    const p = this.pointer;
    const inside = p.tx >= 0 && p.ty >= 0 && p.tx < w.W && p.ty < w.H;
    this.onStatus({
      tx: inside ? p.tx : null,
      ty: inside ? p.ty : null,
      terrain: inside ? this.cornerAt(p.tx, p.ty) : null,
      props: w.props.length,
      zoom: this.view.zoom,
      size: w.W + " x " + w.H,
      tool: this.tool,
      selected: this.selectedProp,
      propScale: this.propScale,
      brushSize: this.brushSize,
      shape: this.shape,
      prefab: this.prefabIndex,
      prefabLabel: PREFABS[this.prefabIndex] ? PREFABS[this.prefabIndex].label : null,
      label: this.selectedLabel,
      labelCount: (w.labels || []).length,
      clip: this.clip ? this.clip.w + "x" + this.clip.h : null,
    });
  }
}

export function terrainSwatchUrl(terrainIndex, size = 32) {
  const id = BASE[terrainIndex];
  return { id, ix: (id % COLUMNS) * TILE, iy: Math.floor(id / COLUMNS) * TILE, size };
}

export { TERRAINS, TERRAIN_INDEX, BASE, TILE, COLUMNS, PROPS };
