// LPC Animals & Monsters — the creator UI. Mounted into a shadow root so it can
// live inside any page (its own generator, or embedded in a game) without
// leaking styles. Everything it renders comes from `catalog.json` via core.js.

import * as core from "./core.js";
import CSS from "./styles.js";

const HTML = `
<div class="lpc-app">
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">LPC</div>
      <div>
        <h1>Animal &amp; Monster Creator</h1>
        <p id="brandSubEl">Loading bestiary…</p>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn" id="randomBtn" title="Random creature, animation and direction (R)">Randomize</button>
      <button class="btn" id="favBtn" title="Show starred creatures only">&#9733; Favourites</button>
      <button class="btn" id="creditsBtn">Credits</button>
      <button class="btn" id="exportBtn">Export</button>
      <button class="btn btn-primary" id="shareBtn">Share link</button>
    </div>
  </header>

  <div class="layout">
    <section class="panel col-browser">
      <div class="panel-head">
        <h2>Bestiary</h2>
        <span class="spacer"></span>
        <span class="meta" id="browserCountEl"></span>
      </div>
      <div class="panel-body">
        <input type="search" id="searchInput" placeholder="Search creatures, tags, packs&hellip;" autocomplete="off" style="margin-bottom:9px" />
        <div class="cat-chips" id="catChipsEl"></div>
        <div class="grid" id="browserEl"></div>
      </div>
    </section>

    <section class="panel col-stage">
      <div class="panel-head">
        <h2 id="stageTitleEl">Preview</h2>
        <div class="stage-tabs" id="stageTabsEl">
          <button data-tab="preview">Preview</button>
          <button data-tab="sheet">Sheet</button>
          <button data-tab="playground">Playground</button>
        </div>
      </div>
      <div class="stage-wrap">
        <div class="stage stage-bg-checker" id="stageEl">
          <div class="stage-badge" id="stageBadgeEl">&hellip;</div>
          <canvas id="previewCanvas" width="256" height="256"></canvas>
          <canvas id="sheetCanvas" hidden></canvas>
          <div class="playground-ctn" id="playgroundEl" hidden>
            <canvas id="playgroundCanvas"></canvas>
          </div>
        </div>
        <div class="stage-hint" id="stageHintEl"></div>

        <div class="stage-controls" id="previewControlsEl">
          <div class="ctrl-row">
            <span class="label">Anim</span>
            <select id="animSelect" style="width:auto"></select>
            <button class="btn btn-sm" id="playBtn" title="Play / pause (space)">&#10074;&#10074;</button>
            <div class="seg" id="dirSegEl" hidden></div>
            <div class="dpad" id="dpadEl" hidden>
              <button class="up" data-dir="up" title="Face up (arrow keys)">&#9650;</button>
              <button class="left" data-dir="left">&#9664;</button>
              <div class="mid">dir</div>
              <button class="right" data-dir="right">&#9654;</button>
              <button class="down" data-dir="down">&#9660;</button>
            </div>
          </div>
          <div class="ctrl-row">
            <span class="label">Frame</span>
            <input type="range" id="frameRange" class="grow" min="0" max="0" value="0" step="1" />
            <span class="meta" id="frameLabelEl">0 / 0</span>
            <span class="label" style="margin-left:6px">Zoom</span>
            <input type="range" id="zoomRange" min="1" max="14" step="1" value="5" />
            <button class="btn btn-sm" id="fitBtn" title="Fit creature to the stage">Fit</button>
          </div>
          <div class="ctrl-row">
            <label class="chk"><input type="checkbox" id="dirsToggle" /> 4-dir strip</label>
            <label class="chk"><input type="checkbox" id="gridToggle" /> grid &amp; pivot</label>
            <label class="chk"><input type="checkbox" id="shadowToggle" checked /> shadow</label>
            <span class="label" style="margin-left:6px">BG</span>
            <div class="seg" id="bgSegEl">
              <button data-bg="checker">Checker</button>
              <button data-bg="grass">Grass</button>
              <button data-bg="dark">Dark</button>
              <button data-bg="light">Light</button>
            </div>
          </div>
        </div>

        <div class="stage-controls" id="sheetControlsEl" hidden>
          <div class="ctrl-row">
            <span class="label">Scale</span>
            <div class="seg" id="sheetScaleSegEl"></div>
            <span class="meta" id="sheetInfoEl"></span>
            <span class="spacer"></span>
            <button class="btn btn-sm" id="sheetDownloadBtn">Download PNG</button>
          </div>
        </div>

        <div class="stage-controls" id="playgroundControlsEl" hidden>
          <div class="ctrl-row">
            <button class="btn btn-sm btn-primary" id="pgSpawnBtn">Spawn selected</button>
            <button class="btn btn-sm" id="pgAddBtn">Random creature</button>
            <button class="btn btn-sm" id="pgClearBtn">Clear</button>
            <span class="label" style="margin-left:6px">Speed</span>
            <input type="range" id="pgSpeedRange" min="10" max="240" value="80" />
            <span class="meta" id="pgCountEl"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel col-detail">
      <div class="panel-head">
        <h2>Creature</h2>
        <span class="spacer"></span>
        <button class="btn btn-sm btn-ghost" id="favStarBtn" title="Star this creature">&#9734; Star</button>
        <button class="btn btn-sm btn-ghost" id="resetBtn">Reset</button>
      </div>
      <div class="panel-body">
        <div class="section" id="variantsSection">
          <h3 id="variantTitleEl">Variants</h3>
          <div class="var-chips" id="variantsEl"></div>
        </div>
        <div class="section">
          <h3>Animations</h3>
          <div class="anim-list" id="animListEl"></div>
        </div>
        <div class="section">
          <h3>Details</h3>
          <dl class="info" id="infoEl"></dl>
          <div class="tags" id="tagsEl"></div>
        </div>
        <div class="section">
          <h3>Credits</h3>
          <div class="credits" id="creditsEl"></div>
        </div>
      </div>
    </section>
  </div>

  <div class="toast" id="toastEl"></div>
  <div class="modal-back" id="modalBack" hidden>
    <div class="modal" id="modalEl">
      <div class="modal-head">
        <h3 id="modalTitleEl"></h3>
        <button class="x" id="modalCloseEl">&#10005;</button>
      </div>
      <div class="modal-body" id="modalBodyEl"></div>
      <div class="modal-foot" id="modalFootEl"></div>
    </div>
  </div>
</div>
`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function makeStore(provided) {
  if (provided && typeof provided.get === "function") return provided;
  try {
    const ls = window.localStorage;
    if (ls) {
      return {
        get: async (k) => {
          const raw = ls.getItem("lpc-animals:" + k);
          return raw ? JSON.parse(raw) : null;
        },
        set: async (k, v) => ls.setItem("lpc-animals:" + k, JSON.stringify(v)),
      };
    }
  } catch {}
  const mem = new Map();
  return { get: async (k) => (mem.has(k) ? mem.get(k) : null), set: async (k, v) => mem.set(k, v) };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function creatureFrameTotal(creature) {
  let n = 0;
  for (const anim of Object.values(creature.anims || {})) {
    if (anim.frames) n += anim.frames.length;
    else for (const d of Object.values(anim.dirs || {})) n += d.cols.length;
  }
  return n;
}

function preferredAnim(creature) {
  const keys = core.animationsFor(creature);
  for (const k of ["idle", "walk", "fly", "swim", "hop", "gallop", "shoot", "attack", "die"]) {
    if (keys.includes(k)) return k;
  }
  return keys[0];
}

export async function mount(container, opts = {}) {
  const shadow = container.shadowRoot || container.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${CSS}</style>${HTML}`;
  const $ = (id) => shadow.querySelector("#" + id);
  const root = shadow.querySelector(".lpc-app");
  const store = makeStore(opts.store);
  const useHash = opts.hash === true;

  const el = {
    brandSub: $("brandSubEl"),
    randomBtn: $("randomBtn"), favBtn: $("favBtn"), creditsBtn: $("creditsBtn"),
    exportBtn: $("exportBtn"), shareBtn: $("shareBtn"),
    search: $("searchInput"), catChips: $("catChipsEl"), browser: $("browserEl"),
    browserCount: $("browserCountEl"),
    stageTitle: $("stageTitleEl"), stageTabs: $("stageTabsEl"), stage: $("stageEl"),
    stageBadge: $("stageBadgeEl"), stageHint: $("stageHintEl"),
    preview: $("previewCanvas"), sheet: $("sheetCanvas"),
    playgroundCtn: $("playgroundEl"), playground: $("playgroundCanvas"),
    previewControls: $("previewControlsEl"), sheetControls: $("sheetControlsEl"),
    playgroundControls: $("playgroundControlsEl"),
    animSelect: $("animSelect"), playBtn: $("playBtn"), dirSeg: $("dirSegEl"), dpad: $("dpadEl"),
    frameRange: $("frameRange"), frameLabel: $("frameLabelEl"), zoomRange: $("zoomRange"), fitBtn: $("fitBtn"),
    dirsToggle: $("dirsToggle"), gridToggle: $("gridToggle"), shadowToggle: $("shadowToggle"),
    bgSeg: $("bgSegEl"),
    sheetScaleSeg: $("sheetScaleSegEl"), sheetInfo: $("sheetInfoEl"), sheetDownloadBtn: $("sheetDownloadBtn"),
    pgSpawnBtn: $("pgSpawnBtn"), pgAddBtn: $("pgAddBtn"), pgClearBtn: $("pgClearBtn"),
    pgSpeed: $("pgSpeedRange"), pgCount: $("pgCountEl"),
    favStarBtn: $("favStarBtn"), resetBtn: $("resetBtn"),
    variantsSection: $("variantsSection"), variantTitle: $("variantTitleEl"), variants: $("variantsEl"),
    animList: $("animListEl"), info: $("infoEl"), tags: $("tagsEl"), credits: $("creditsEl"),
    toast: $("toastEl"),
    modalBack: $("modalBack"), modalEl: $("modalEl"), modalTitle: $("modalTitleEl"),
    modalBody: $("modalBodyEl"), modalFoot: $("modalFootEl"), modalClose: $("modalCloseEl"),
  };

  const state = {
    id: null, variant: null,
    anim: "idle", dir: "down", frame: 0, playing: true,
    scale: 5, fourDir: false, grid: false, shadow: true, bg: "checker",
    tab: "preview", sheetScale: 2,
    search: "", category: "all", tag: null, favOnly: false,
  };
  let destroyed = false;
  let raf = 0;
  let acc = 0;
  let previewSprite = null;
  let previewInfo = null;
  let previewToken = 0;
  let sheetToken = 0;
  const favourites = new Set();
  const recent = [];
  const thumbCache = new Map();
  const playground = { entities: [], sprites: new Map(), grass: null, grassW: 0, grassH: 0, seeded: false };
  let catalog = null;

  const creature = () => (state.id ? catalog.byId.get(state.id) : null);
  const ref = () => ({ id: state.id, variant: state.variant });
  const codeOf = () => core.creatureToCode({ id: state.id, variant: state.variant });

  // ------------------------------------------------------------------ toasts
  let toastTimer = 0;
  function toast(msg, isErr) {
    el.toast.textContent = msg;
    el.toast.className = "toast show" + (isErr ? " err" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.toast.className = "toast"; }, 2600);
  }

  // ------------------------------------------------------------------ modals
  // Returns the whole modal element (title + body + footer), so callers can
  // wire up buttons wherever they live — the export/share footers included.
  function openModal(title, bodyHtml, footHtml, wide) {
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = bodyHtml || "";
    el.modalFoot.innerHTML = footHtml || "";
    el.modalEl.className = "modal" + (wide ? " wide" : "");
    el.modalBack.hidden = false;
    return el.modalEl;
  }
  function closeModal() {
    el.modalBack.hidden = true;
    el.modalBody.innerHTML = "";
    el.modalFoot.innerHTML = "";
  }
  el.modalClose.addEventListener("click", closeModal);
  el.modalBack.addEventListener("click", (e) => { if (e.target === el.modalBack) closeModal(); });

  // ------------------------------------------------------------------ catalog
  const catalogOptions = { catalogUrl: opts.catalogUrl, sheetBase: opts.sheetBase };

  catalog = await core.loadCatalog(catalogOptions);
  const stats = core.catalogStats(catalog);

  const storedFavs = await store.get("favourites");
  if (Array.isArray(storedFavs)) for (const id of storedFavs) if (catalog.byId.has(id)) favourites.add(id);
  const storedLast = await store.get("last");
  const storedSettings = await store.get("settings");
  if (storedSettings && typeof storedSettings === "object") {
    for (const k of ["fourDir", "grid", "shadow", "bg", "tab", "sheetScale"]) {
      if (storedSettings[k] !== undefined) state[k] = storedSettings[k];
    }
  }
  function saveSettings() {
    store.set("settings", {
      fourDir: state.fourDir, grid: state.grid, shadow: state.shadow,
      bg: state.bg, tab: state.tab, sheetScale: state.sheetScale,
    });
  }
  function saveFavourites() {
    store.set("favourites", [...favourites]);
  }
  function remember() {
    const i = recent.indexOf(state.id);
    if (i >= 0) recent.splice(i, 1);
    recent.unshift(state.id);
    if (recent.length > 8) recent.length = 8;
    store.set("recent", [...recent]);
    store.set("last", { id: state.id, variant: state.variant });
  }

  el.brandSub.textContent =
    stats.creatures + " creatures \u00b7 " + stats.variants + " variants \u00b7 " +
    stats.animations + " animations \u00b7 " + stats.frames + " frames";

  // ------------------------------------------------------------------ filters
  function filtered() {
    const q = state.search.trim().toLowerCase();
    return catalog.creatures.filter((c) => {
      if (state.favOnly && !favourites.has(c.id)) return false;
      if (state.category !== "all" && c.category !== state.category) return false;
      if (state.tag && !(c.tags || []).includes(state.tag)) return false;
      if (!q) return true;
      const hay = [c.id, c.name, c.category, ...(c.tags || []), ...(c.packs || [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  function renderCatChips() {
    const chips = [];
    const cats = [{ key: "all", label: "All" }, ...(catalog.categories || [])];
    chips.push(`<button class="chip${state.category === "all" && !state.favOnly ? " on" : ""}" data-cat="all">All <span class="n">${catalog.creatures.length}</span></button>`);
    for (const c of cats) {
      if (c.key === "all") continue;
      const n = (catalog.byCategory[c.key] || []).length;
      if (!n) continue;
      chips.push(`<button class="chip${state.category === c.key ? " on" : ""}" data-cat="${esc(c.key)}" title="${esc(c.blurb || "")}">${esc(c.label)} <span class="n">${n}</span></button>`);
    }
    el.catChips.innerHTML = chips.join("");
    el.catChips.querySelectorAll("[data-cat]").forEach((b) =>
      b.addEventListener("click", () => {
        state.category = b.dataset.cat;
        state.favOnly = false;
        el.favBtn.classList.remove("on");
        renderCatChips();
        renderBrowser();
      }),
    );
  }

  function renderBrowser() {
    const list = filtered();
    el.browserCount.textContent = list.length + (list.length === 1 ? " creature" : " creatures");
    if (!list.length) {
      el.browser.innerHTML = `<div class="empty">No creatures match that filter.<br>Try clearing the search or the tag.</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((c) => {
      const b = document.createElement("button");
      b.className = "tile" + (c.id === state.id ? " on" : "");
      b.dataset.id = c.id;
      b.title = c.name + " \u2014 " + (c.tags || []).join(", ");
      const cv = document.createElement("canvas");
      cv.width = 104; cv.height = 104;
      b.appendChild(cv);
      const cap = document.createElement("span");
      cap.className = "cap";
      cap.textContent = c.name;
      b.appendChild(cap);
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = c.size || c.category;
      b.appendChild(badge);
      const fav = document.createElement("span");
      fav.className = "fav" + (favourites.has(c.id) ? " on" : "");
      fav.textContent = "\u2605";
      fav.title = "Star / unstar";
      fav.addEventListener("click", (e) => {
        e.stopPropagation();
        if (favourites.has(c.id)) favourites.delete(c.id);
        else favourites.add(c.id);
        fav.className = "fav" + (favourites.has(c.id) ? " on" : "");
        saveFavourites();
        updateStarButton();
        if (state.favOnly) renderBrowser();
      });
      b.appendChild(fav);
      b.addEventListener("click", () => selectCreature(c.id, null));
      frag.appendChild(b);
    });
    el.browser.innerHTML = "";
    el.browser.appendChild(frag);
    fillThumbnails();
  }

  function tileCanvas(id) {
    const b = el.browser.querySelector('.tile[data-id="' + attrEsc(id) + '"] canvas');
    return b;
  }
  function attrEsc(s) { return String(s).replace(/"/g, '\\"'); }

  // A swatch is a span.sw wrapping a small canvas, so any frame can be shown
  // inside the variant chips and the animation rows.
  function makeSwatch(size) {
    const sw = document.createElement("span");
    sw.className = "sw";
    const cv = document.createElement("canvas");
    cv.width = size || 52;
    cv.height = size || 52;
    sw.appendChild(cv);
    return { sw, cv };
  }

  // A frame's cell can be much larger than the art inside it (the shark is a
  // 56x126 subject in a 160x160 cell, the horse a 21x54 subject in 128x128), so
  // fitting the tile to the raw cell size made some thumbnails disappear. Trim
  // to the ink bounds once per source canvas and fit that.
  const thumbBoxCache = new WeakMap();
  function inkBox(src) {
    const cached = thumbBoxCache.get(src);
    if (cached) return cached;
    let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
    try {
      const d = src.getContext("2d").getImageData(0, 0, src.width, src.height).data;
      for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
          if (d[(y * src.width + x) * 4 + 3] > 8) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    } catch {}
    const box = maxX < 0 ? { x: 0, y: 0, w: src.width, h: src.height } : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    thumbBoxCache.set(src, box);
    return box;
  }

  function paintThumb(canvas, src) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const box = inkBox(src);
    // Big tiles carry a size badge + star at the top and a caption strip at the
    // bottom, so the art is fitted inside what is left; the small swatches are
    // just padded evenly. The tile canvas is square so nothing gets squashed.
    const big = canvas.width >= 96;
    const t = big ? 25 : Math.max(1, Math.round(canvas.width * 0.05));
    const r = big ? 8 : t;
    const b = big ? 22 : t;
    const l = big ? 8 : t;
    const availW = canvas.width - l - r;
    const availH = canvas.height - t - b;
    const s = Math.min(availW / box.w, availH / box.h);
    const smoothing = s < 1;
    ctx.imageSmoothingEnabled = smoothing;
    if (smoothing) ctx.imageSmoothingQuality = "high";
    const w = Math.round(box.w * s);
    const h = Math.round(box.h * s);
    ctx.drawImage(src, box.x, box.y, box.w, box.h,
      l + Math.round((availW - w) / 2), t + Math.round((availH - h) / 2), w, h);
  }

  async function thumbSource(creature) {
    if (thumbCache.has(creature.id)) return thumbCache.get(creature.id);
    const anim = preferredAnim(creature);
    const dir = core.isDirectional(creature) ? "down" : "down";
    let frame = null;
    try {
      frame = await core.renderFrame(catalog, creature.id, { anim, dir, frame: 0, ...catalogOptions });
    } catch {}
    if (!frame) {
      try {
        frame = await core.renderFrame(catalog, { id: creature.id, variant: creature.variants[0].key }, { anim: preferredAnim(creature), frame: 0, ...catalogOptions });
      } catch {}
    }
    thumbCache.set(creature.id, frame);
    return frame;
  }

  function fillThumbnails() {
    const tiles = [...el.browser.querySelectorAll(".tile")];
    let i = 0;
    const step = () => {
      if (destroyed) return;
      const end = Math.min(tiles.length, i + 4);
      for (; i < end; i++) {
        const tile = tiles[i];
        const c = catalog.byId.get(tile.dataset.id);
        if (!c) continue;
        thumbSource(c).then((src) => {
          if (!src || !tile.isConnected) return;
          const cv = tile.querySelector("canvas");
          if (cv) paintThumb(cv, src);
        });
      }
      if (i < tiles.length) setTimeout(step, 24);
    };
    step();
  }

  // ------------------------------------------------------------------ selection
  function selectCreature(id, variant, o = {}) {
    const c = catalog.byId.get(id);
    if (!c) return;
    state.id = id;
    state.variant = variant || (c.variants.find((v) => v.key === variant) ? variant : c.variants[0].key);
    const anims = core.animationsFor(c);
    if (!anims.includes(state.anim)) state.anim = preferredAnim(c);
    if (!core.isDirectional(c)) state.dir = "down";
    state.frame = 0;
    if (!o.keepZoom) fitZoom();
    el.browser.querySelectorAll(".tile").forEach((t) => t.classList.toggle("on", t.dataset.id === id));
    updateVariants();
    updateAnimList();
    updateInfo();
    updateCredits();
    updateStarButton();
    syncControls();
    buildPreview();
    if (state.tab === "sheet") renderSheetView();
    writeHash();
    if (!o.silent) {
      remember();
      if (typeof opts.onSelect === "function") {
        try { opts.onSelect(getSelection()); } catch (e) { console.error(e); }
      }
    }
  }

  function fitZoom() {
    const c = creature();
    if (!c) return;
    const m = Math.max(c.fw, c.fh);
    state.scale = clamp(Math.round(170 / m), 1, 14);
    el.zoomRange.value = String(state.scale);
  }

  function setAnim(k, o = {}) {
    const c = creature();
    if (!c || !k || !c.anims[k]) return;
    state.anim = k;
    state.frame = 0;
    if (state.tab === "sheet") renderSheetView();
    updateAnimList();
    updateDirUI();
    if (!o.silent) buildPreview();
    writeHash();
  }

  function setDir(d) {
    if (!d || (core.isDirectional(creature()) && !core.DIRECTIONS.includes(d))) return;
    state.dir = d;
    state.frame = 0;
    updateDirUI();
    buildPreview();
    writeHash();
  }

  function setFrame(i) {
    const n = frameMax() + 1;
    state.frame = n ? ((i % n) + n) % n : 0;
    acc = 0;
    updateFrameUI();
    drawPreview();
  }

  // Which directions the stage draws at once: the selected one, or all four
  // when the 4-dir strip is on and the animation is genuinely directional.
  function previewDirs() {
    const c = creature();
    const info = c && core.animInfo(c, state.anim);
    return state.fourDir && core.isDirectional(c) && info && !info.dirless ? core.DIRECTIONS : [state.dir];
  }

  // Feet-anchored drawing only makes sense when the frames are laid out around
  // the base frame; a single-view animation on a differently sized canvas is
  // drawn centred instead.
  function previewAnchor() {
    const c = creature();
    const info = c && core.animInfo(c, state.anim);
    if (!c || !info) return "center";
    if (core.isDirectional(c) || (info.fw === c.fw && info.fh === c.fh)) return "feet";
    return "center";
  }

  function frameMax() {
    if (!previewSprite) return 0;
    const dirs = previewDirs();
    let n = 0;
    for (const d of dirs) n = Math.max(n, previewSprite.frameCount(state.anim, d));
    return Math.max(0, n - 1);
  }

  function syncControls() {
    const c = creature();
    el.zoomRange.value = String(state.scale);
    el.dirsToggle.checked = state.fourDir;
    el.gridToggle.checked = state.grid;
    el.shadowToggle.checked = state.shadow;
    el.shadowToggle.disabled = !(c && c.shadow);
    el.dirsToggle.disabled = !core.isDirectional(c);
    el.bgSeg.querySelectorAll("[data-bg]").forEach((b) => b.classList.toggle("on", b.dataset.bg === state.bg));
    el.stage.className = "stage stage-bg-" + state.bg;
    el.stageTabs.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === state.tab));
    el.previewControls.hidden = state.tab !== "preview";
    el.sheetControls.hidden = state.tab !== "sheet";
    el.playgroundControls.hidden = state.tab !== "playground";
    el.preview.hidden = state.tab !== "preview";
    el.sheet.hidden = state.tab !== "sheet";
    el.playgroundCtn.hidden = state.tab !== "playground";
    el.stageTitle.textContent = state.tab === "preview" ? "Preview" : state.tab === "sheet" ? "Animation sheet" : "Playground";
    el.animSelect.disabled = state.tab === "playground";
    el.stageHint.innerHTML = state.tab === "playground"
      ? "A live demo of the exported API: every creature below is drawn with <code class=\"mono\">createSprite().drawWithShadow(ctx, x, y, { anim, dir, frame })</code> &mdash; the same call your game makes."
      : state.tab === "sheet"
      ? "Canonical sheet for one animation: one row per direction, in the order <b>up, left, down, right</b>. Transparent background."
      : "Feet sit on the ground line, so <code class=\"mono\">draw(ctx, x, y, { dir, frame })</code> drops straight into a top-down game loop.";
    if (state.tab === "playground") syncPlaygroundSize();
  }

  function updateStarButton() {
    const on = favourites.has(state.id);
    el.favStarBtn.innerHTML = on ? "&#9733; Starred" : "&#9734; Star";
    el.favStarBtn.classList.toggle("on", on);
  }

  function updateVariants() {
    const c = creature();
    const vs = c.variants || [];
    el.variantTitle.textContent = vs.length > 1 ? "Variants (" + vs.length + ")" : "Variant";
    el.variants.innerHTML = "";
    vs.forEach((v) => {
      const b = document.createElement("button");
      b.className = "var" + (v.key === state.variant ? " on" : "");
      const { sw, cv } = makeSwatch(48);
      b.appendChild(sw);
      const nm = document.createElement("span");
      nm.textContent = v.name || v.key;
      b.appendChild(nm);
      b.addEventListener("click", () => selectCreature(c.id, v.key, { keepZoom: true }));
      el.variants.appendChild(b);
      core.renderFrame(catalog, { id: c.id, variant: v.key }, { anim: preferredAnim(c), dir: "down", frame: 0, ...catalogOptions })
        .then((f) => { if (f) paintThumb(cv, f); })
        .catch(() => {});
    });
  }

  function updateAnimList() {
    const c = creature();
    el.animSelect.innerHTML = "";
    const infos = [];
    el.animList.innerHTML = "";
    for (const k of core.animationsFor(c)) {
      const info = core.animInfo(c, k);
      infos.push(info);
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      el.animSelect.appendChild(opt);
      const row = document.createElement("div");
      row.className = "anim-row" + (k === state.anim ? " on" : "");
      const { sw, cv } = makeSwatch(68);
      row.appendChild(sw);
      const nm = document.createElement("span");
      nm.className = "nm";
      nm.textContent = k;
      row.appendChild(nm);
      const meta = document.createElement("span");
      meta.className = "meta";
      const count = core.isDirectional(c) ? core.frameCount(c, k, "down") : (info.def.frames || []).length;
      meta.textContent = count + "f \u00b7 " + info.fps + "fps" + (info.loop ? "" : " \u00b7 once");
      row.appendChild(meta);
      row.addEventListener("click", () => setAnim(k));
      el.animList.appendChild(row);
      core.renderFrame(catalog, ref(), { anim: k, dir: "down", frame: 0, ...catalogOptions })
        .then((f) => { if (f) paintThumb(cv, f); })
        .catch(() => {});
    }
    el.animSelect.value = state.anim;
    updateDirUI();
  }

  function updateDirUI() {
    const c = creature();
    const directional = core.isDirectional(c);
    el.dirSeg.hidden = !directional;
    el.dpad.hidden = !directional;
    el.dirSeg.innerHTML = "";
    if (directional) {
      for (const d of core.DIRECTIONS) {
        const b = document.createElement("button");
        b.textContent = core.DIR_LABEL[d];
        b.className = d === state.dir ? "on" : "";
        b.addEventListener("click", () => setDir(d));
        el.dirSeg.appendChild(b);
      }
      el.dpad.querySelectorAll("[data-dir]").forEach((b) => b.classList.toggle("on", b.dataset.dir === state.dir));
    }
    updateFrameUI();
  }

  function updateFrameUI() {
    const max = frameMax();
    el.frameRange.max = String(max);
    el.frameRange.value = String(clamp(state.frame, 0, max));
    el.frameLabel.textContent = state.frame + 1 + " / " + (max + 1);
  }

  function updateInfo() {
    const c = creature();
    const v = core.variantOf(c, state.variant);
    const total = creatureFrameTotal(c);
    const rows = [
      ["Category", (catalog.categoryOf(c.category) || {}).label || c.category],
      ["Size class", c.size || "\u2014"],
      ["Frame size", c.fw + " \u00d7 " + c.fh + " px"],
      ["Directions", core.isDirectional(c) ? c.dirs || "lpc" : "single view"],
      ["Animations", core.animationsFor(c).length + " (" + total + " frames)"],
      ["Variants", (c.variants || []).length],
      ["Sheet", v.sheet],
      ["Ground pivot", c.ground ? c.ground.x + ", " + c.ground.y : "centred"],
      ["Shadow", c.shadow ? "yes" : "none"],
    ];
    el.info.innerHTML = rows.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join("");
    el.tags.innerHTML = "";
    (c.tags || []).forEach((t) => {
      const b = document.createElement("button");
      b.className = "tag" + (state.tag === t ? " on" : "");
      b.textContent = "#" + t;
      b.addEventListener("click", () => {
        state.tag = state.tag === t ? null : t;
        state.category = "all";
        renderCatChips();
        renderBrowser();
        updateInfo();
      });
      el.tags.appendChild(b);
    });
    if (c.notes) {
      const note = document.createElement("div");
      note.className = "note";
      note.style.marginTop = "8px";
      note.textContent = c.notes;
      el.tags.appendChild(note);
    }
  }

  function updateCredits() {
    const c = creature();
    const packs = (c.packs || []).map((p) => catalog.packs[p]).filter(Boolean);
    el.credits.innerHTML = packs.map((p) => `
      <div class="c">
        <b>${esc(p.name)}</b><br>
        ${(p.authors || []).map(esc).join(", ")}<br>
        <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>
        ${(p.extraUrls || []).map((u) => `<br><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join("")}
        <div>${String(p.license || "").split("/").map((l) => `<span class="lic">${esc(l.trim())}</span>`).join("")}</div>
      </div>`).join("");
  }

  // ------------------------------------------------------------------ preview
  async function buildPreview() {
    const c = creature();
    if (!c) return;
    const token = ++previewToken;
    const dirs = previewDirs();
    const withShadow = state.shadow && !!c.shadow;
    let sprite;
    try {
      sprite = await core.createSprite(catalog, ref(), {
        scale: state.scale, anims: [state.anim], directions: dirs, shadow: withShadow, ...catalogOptions,
      });
    } catch (e) {
      console.error(e);
      el.stageBadge.textContent = "Could not render this creature";
      return;
    }
    if (token !== previewToken || destroyed) return;
    previewSprite = sprite;
    previewInfo = core.animInfo(c, state.anim);
    state.frame = clamp(state.frame, 0, frameMax());
    updateFrameUI();
    drawPreview();
  }

  function drawPreview() {
    const sp = previewSprite;
    if (!sp) return;
    const info = previewInfo;
    const dirs = previewDirs();
    const anchor = previewAnchor();
    const scale = state.scale;
    const PAD = 12;
    const fw = info.fw * scale;
    const fh = info.fh * scale;
    const cellW = fw + PAD * 2;
    const cellH = fh + PAD * 2;
    const cv = el.preview;
    cv.width = cellW * dirs.length;
    cv.height = cellH;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const pivot = sp.pivot;
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i];
      const ox = i * cellW + PAD;
      if (state.grid) {
        ctx.strokeStyle = "rgba(120,140,170,0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(i * cellW + 0.5, 0.5, cellW - 1, cellH - 1);
      }
      const frame = Math.min(state.frame, Math.max(0, sp.frameCount(state.anim, d) - 1));
      const drawn = anchor === "feet"
        ? sp.drawWithShadow(ctx, ox + fw / 2, PAD + pivot.y, { anim: state.anim, dir: d, frame, anchor: "feet" })
        : sp.drawWithShadow(ctx, ox + fw / 2, PAD + fh / 2, { anim: state.anim, dir: d, frame, anchor: "center" });
      if (!drawn) {
        ctx.fillStyle = "rgba(255,120,120,0.75)";
        ctx.font = "12px monospace";
        ctx.fillText("no frame", ox + 4, PAD + 14);
      }
      if (state.grid && anchor === "feet") {
        ctx.strokeStyle = "rgba(240,180,41,0.7)";
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(i * cellW, PAD + pivot.y + 0.5);
        ctx.lineTo(i * cellW + cellW, PAD + pivot.y + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        if (anchor === "feet") {
          ctx.fillStyle = "#f0b429";
          ctx.beginPath();
          ctx.arc(ox + pivot.x, PAD + pivot.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (dirs.length > 1) {
          ctx.fillStyle = "rgba(147,160,180,0.9)";
          ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
          ctx.fillText(core.DIR_LABEL[d], i * cellW + 6, cellH - 4);
        }
      }
    }
    const n = sp.frameCount(state.anim, state.dir);
    el.stageBadge.textContent =
      state.anim + " \u00b7 " + (dirs.length > 1 ? "4 directions" : core.DIR_LABEL[state.dir]) +
      " \u00b7 " + n + " frame" + (n === 1 ? "" : "s") + " \u00b7 " + sp.fps(state.anim) + " fps" +
      " \u00b7 " + info.fw + "\u00d7" + info.fh + " @ " + scale + "x";
  }

  // ------------------------------------------------------------------ sheet view
  function renderSheetView() {
    const c = creature();
    if (!c) return;
    const token = ++sheetToken;
    const anim = (c.anims[state.anim] && state.anim) || preferredAnim(c);
    const maxW = Math.max(320, el.stage.clientWidth - 48);
    const cols = Math.max(1, ...core.DIRECTIONS.map((d) => core.frameCount(c, anim, d)));
    const info = core.animInfo(c, anim);
    const auto = clamp(Math.floor(Math.min(maxW / (cols * info.fw), 420 / (4 * info.fh))), 1, 6);
    if (!el.sheetScaleSeg.dataset.touched) state.sheetScale = auto;
    el.sheetScaleSeg.innerHTML = [1, 2, 3, 4].map((s) => `<button data-s="${s}" class="${s === state.sheetScale ? "on" : ""}">${s}x</button>`).join("");
    el.sheetScaleSeg.querySelectorAll("[data-s]").forEach((b) =>
      b.addEventListener("click", () => {
        el.sheetScaleSeg.dataset.touched = "1";
        state.sheetScale = Number(b.dataset.s);
        saveSettings();
        renderSheetView();
      }),
    );
    core.renderAnimSheet(catalog, ref(), anim, { scale: state.sheetScale, ...catalogOptions })
      .then((canvas) => {
        if (token !== sheetToken || destroyed) return;
        const cv = el.sheet;
        cv.width = canvas.width;
        cv.height = canvas.height;
        const ctx = cv.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(canvas, 0, 0);
        const directional = core.isDirectional(c);
        el.sheetInfo.textContent =
          anim + " \u00b7 " + (directional ? "up, left, down, right" : "single view") + " \u00b7 " +
          canvas.width + "\u00d7" + canvas.height + " px";
        el.stageHint.innerHTML = directional
          ? "One row per direction \u2014 <b>up, left, down, right</b>, " + cols + " columns. Frames are centred in their cell; the pivot stays put across rows, so a whole row animates as-is."
          : "Direction-independent animation (" + core.frameCount(c, anim, "down") + " frames).";
      })
      .catch((e) => {
        console.error(e);
        el.sheetInfo.textContent = "Could not render sheet";
      });
  }

  // ------------------------------------------------------------------ export
  let exportCache = null;

  // Cell grid a full game sheet would use, without rendering anything: enough
  // to refuse a scale that would blow past the browser's canvas limits.
  function predictSheet(c) {
    let cellW = c.fw;
    let cellH = c.fh;
    let cols = 0;
    let anims = 0;
    for (const k of core.animationsFor(c)) {
      const info = core.animInfo(c, k);
      cellW = Math.max(cellW, info.fw);
      cellH = Math.max(cellH, info.fh);
      anims++;
      for (const d of core.DIRECTIONS) cols = Math.max(cols, core.frameCount(c, k, d));
    }
    cols = Math.max(1, cols);
    let rows = anims * 4;
    if (c.shadow) rows += 4;
    return { cols, rows, cellW, cellH };
  }

  function cappedScale(c, wanted) {
    const p = predictSheet(c);
    let s = wanted;
    while (s > 1 && (p.cols * p.cellW * s > 8000 || p.rows * p.cellH * s > 8000 || p.cols * p.cellW * s * p.rows * p.cellH * s > 24000000)) s--;
    return s;
  }

  async function buildExport(scale, withShadow) {
    const c = creature();
    const safe = cappedScale(c, scale);
    const res = await core.renderSheet(catalog, ref(), { scale: safe, shadow: withShadow, ...catalogOptions });
    const manifest = core.sheetManifest(catalog, ref(), { scale: safe, shadow: withShadow }, res);
    manifest.scaleLimit = safe < scale ? { requested: scale, applied: safe, reason: "canvas size limit" } : null;
    return { res, manifest, scale: safe, withShadow };
  }

  function spriteSnippet() {
    const c = creature();
    const v = core.variantOf(c, state.variant);
    const anims = core.animationsFor(c).slice(0, 4).join('", "');
    const dir = core.isDirectional(c) ? state.dir : "down";
    const generatorName = typeof window.generatorName === "string" ? window.generatorName : "lpc-animal-and-monster-creator";
    return [
      "// main.pjs",
      "lpcAnimals = {import:" + generatorName + "}",
      "",
      "// game code (importing the generator gives you the plugin object directly)",
      "const creator = root.lpcAnimals;",
      "const sprite = await creator.createSprite(" + JSON.stringify(codeOf()) + ", { scale: 1 });",
      "",
      "// each frame, with the feet anchored at (entity.x, entity.y):",
      "sprite.drawWithShadow(ctx, entity.x, entity.y, {",
      '  anim: "' + state.anim + '",',
      '  dir: "' + dir + '",',
      "  frame: sprite.frameCount(\"" + state.anim + "\", \"" + dir + "\") > 1",
      "    ? Math.floor(t * sprite.fps(\"" + state.anim + "\")) % sprite.frameCount(\"" + state.anim + "\", \"" + dir + "\")",
      "    : 0,",
      "});",
      "",
      "// animations available: " + anims,
      "// frame size: " + (c.fw + "x" + c.fh) + " · animations: " + core.animationsFor(c).join(", "),
      "// credit: " + (c.packs || []).map((p) => (catalog.packs[p] || {}).name).filter(Boolean).join(" + "),
      "// licence: " + [...new Set((c.packs || []).map((p) => (catalog.packs[p] || {}).license).filter(Boolean))].join(" / "),
    ].join("\n");
  }

  function openExportModal() {
    const c = creature();
    const v = core.variantOf(c, state.variant);
    const modal = openModal(
      "Export \u2014 " + c.name + (v.name && v.name !== c.name ? " (" + v.name + ")" : ""),
      `
      <div class="field">
        <label>Pixel scale</label>
        <div class="row2">
          <div class="seg" id="expScaleSeg">
            <button data-s="1">1x</button><button data-s="2" class="on">2x</button>
            <button data-s="3">3x</button><button data-s="4">4x</button>
          </div>
          <label class="chk"><input type="checkbox" id="expShadow" checked ${c.shadow ? "" : "disabled"} /> shadow rows</label>
          <span class="meta" id="expStatusEl">building&hellip;</span>
        </div>
      </div>
      <div class="prog" id="expProgEl"><i></i></div>
      <div class="field">
        <label>Game sheet \u2014 every animation, uniform cells, one block of 4 direction rows each</label>
        <div class="row2">
          <button class="btn btn-sm" id="expSheetBtn" disabled>Download PNG</button>
          <button class="btn btn-sm" id="expManifestBtn" disabled>Download manifest JSON</button>
          <button class="btn btn-sm btn-ghost" id="expCopyManifestBtn" disabled>Copy manifest</button>
        </div>
      </div>
      <div class="field">
        <label>Manifest preview (<span id="expManifestNameEl"></span>)</label>
        <pre class="codebox" id="expManifestEl">building&hellip;</pre>
      </div>
      <div class="field">
        <label>Single animation sheet</label>
        <div class="row2">
          <button class="btn btn-sm" id="expAnimBtn">Download ${esc(state.anim)} sheet</button>
          <span class="meta">rows: up, left, down, right</span>
        </div>
      </div>
      <div class="field">
        <label>Use it in your game</label>
        <pre class="codebox" id="expCodeEl">${esc(spriteSnippet())}</pre>
        <div class="row2" style="margin-top:8px">
          <button class="btn btn-sm btn-ghost" id="expCopyCodeBtn">Copy code</button>
          <button class="btn btn-sm btn-ghost" id="expCopyCodeCtnBtn">Share code: ${esc(codeOf())}</button>
        </div>
      </div>`,
      `<button class="btn btn-primary" id="expCloseBtn">Done</button>`,
      true,
    );
    const $m = (id) => modal.querySelector("#" + id);
    $m("expCloseBtn").addEventListener("click", closeModal);
    $m("expCopyCodeBtn").addEventListener("click", async () => {
      toast((await copyText(spriteSnippet())) ? "Sprite code copied" : "Could not copy", false);
    });
    $m("expCopyCodeCtnBtn").addEventListener("click", async () => {
      toast((await copyText(codeOf())) ? ("Copied " + codeOf()) : "Could not copy");
    });
    let scale = 2;
    let withShadow = !!c.shadow;
    const rebuild = async () => {
      const token = (exportCache && exportCache.token) || 0;
      const my = token + 1;
      exportCache = { token: my };
      $m("expStatusEl").textContent = "building\u2026";
      $m("expProgEl").querySelector("i").style.width = "35%";
      ["expSheetBtn", "expManifestBtn", "expCopyManifestBtn"].forEach((id) => ($m(id).disabled = true));
      try {
        const out = await buildExport(scale, withShadow);
        if (!exportCache || exportCache.token !== my) return;
        exportCache = Object.assign(out, { token: my });
        $m("expProgEl").querySelector("i").style.width = "100%";
        const m = out.manifest;
        $m("expStatusEl").textContent = m.cols + "\u00d7" + m.rows + " cells \u00b7 " + out.res.canvas.width + "\u00d7" + out.res.canvas.height + " px" +
          (m.scaleLimit ? " \u00b7 scale reduced to " + m.scaleLimit.applied + "x (canvas limit)" : "");
        $m("expManifestNameEl").textContent = m.image;
        $m("expManifestEl").textContent = JSON.stringify(m, null, 1);
        ["expSheetBtn", "expManifestBtn", "expCopyManifestBtn"].forEach((id) => ($m(id).disabled = false));
      } catch (e) {
        console.error(e);
        $m("expStatusEl").textContent = "Failed: " + e.message;
        $m("expProgEl").querySelector("i").style.width = "0%";
      }
    };
    $m("expScaleSeg").querySelectorAll("[data-s]").forEach((b) =>
      b.addEventListener("click", () => {
        scale = Number(b.dataset.s);
        $m("expScaleSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
        rebuild();
      }),
    );
    $m("expShadow").addEventListener("change", (e) => { withShadow = e.target.checked; rebuild(); });
    $m("expSheetBtn").addEventListener("click", async () => {
      if (!exportCache || !exportCache.res) return;
      const blob = await canvasToBlob(exportCache.res.canvas);
      downloadBlob(blob, exportCache.manifest.image);
      toast("Downloaded " + exportCache.manifest.image);
    });
    $m("expManifestBtn").addEventListener("click", () => {
      if (!exportCache || !exportCache.manifest) return;
      const name = exportCache.manifest.image.replace(/\.png$/, ".json");
      downloadBlob(new Blob([JSON.stringify(exportCache.manifest, null, 2)], { type: "application/json" }), name);
      toast("Downloaded " + name);
    });
    $m("expCopyManifestBtn").addEventListener("click", async () => {
      if (!exportCache) return;
      toast((await copyText(JSON.stringify(exportCache.manifest, null, 2))) ? "Manifest copied" : "Could not copy");
    });
    $m("expAnimBtn").addEventListener("click", async () => {
      const canvas = await core.renderAnimSheet(catalog, ref(), state.anim, { scale: cappedScale(c, scale), ...catalogOptions });
      const name = c.id + "-" + (v.key && v.key !== "default" ? v.key + "-" : "") + state.anim + ".png";
      downloadBlob(await canvasToBlob(canvas), name);
      toast("Downloaded " + name);
    });
    rebuild();
  }

  function openCreditsModal() {
    const packs = Object.values(catalog.packs || {});
    openModal(
      "Credits & licences",
      `<p class="note" style="margin-top:0">Every sprite in this bestiary comes from the Liberated Pixel Cup (LPC) community. Most of these licences require attribution &mdash; the credits for the creature you are viewing are also shown in the right-hand panel so you can copy them into your game's credits screen.</p>
       <div class="credits">${packs.map((p) => `
        <div class="c">
          <b>${esc(p.name)}</b><br>
          ${(p.authors || []).map(esc).join(" \u00b7 ")}<br>
          <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>
          ${(p.extraUrls || []).map((u) => `<br><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join("")}
          <div>${String(p.license || "").split("/").map((l) => `<span class="lic">${esc(l.trim())}</span>`).join("")}</div>
        </div>`).join("")}
       </div>`,
      `<button class="btn btn-primary" id="crCloseBtn">Close</button>`,
      true,
    );
    el.modalFoot.querySelector("#crCloseBtn").addEventListener("click", closeModal);
  }

  function shareLink() {
    return "https://perchance.org/" + (typeof window.generatorName === "string" ? window.generatorName : "lpc-animal-and-monster-creator") + "#" + codeOf() + "/" + state.anim + "/" + state.dir;
  }

  function openShareModal() {
    const link = shareLink();
    const modal = openModal(
      "Share this creature",
      `<div class="field">
        <label>Link</label>
        <div class="row2"><input type="text" id="shareLinkInput" readonly value="${esc(link)}" />
        <button class="btn" id="shareCopyBtn">Copy</button></div>
      </div>
      <div class="field">
        <label>Share code</label>
        <div class="row2"><input type="text" id="shareCodeInput" readonly value="${esc(codeOf())}" />
        <button class="btn" id="shareCodeCopyBtn">Copy</button></div>
        <p class="note">Pass the code straight to the plugin: <code class="mono">creator.createSprite("${esc(codeOf())}")</code></p>
      </div>`,
      `<button class="btn btn-primary" id="shareCloseBtn">Close</button>`,
    );
    modal.querySelector("#shareCloseBtn").addEventListener("click", closeModal);
    modal.querySelector("#shareCopyBtn").addEventListener("click", async () => {
      toast((await copyText(link)) ? "Link copied" : "Could not copy");
    });
    modal.querySelector("#shareCodeCopyBtn").addEventListener("click", async () => {
      toast((await copyText(codeOf())) ? "Code copied" : "Could not copy");
    });
    const input = modal.querySelector("#shareLinkInput");
    input.focus();
    input.select();
  }

  // ------------------------------------------------------------------ hash
  function writeHash() {
    if (!useHash) return;
    try {
      history.replaceState(null, "", "#" + codeOf() + "/" + state.anim + "/" + state.dir);
    } catch {}
  }

  function readHash() {
    if (!useHash) return null;
    const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!raw) return null;
    const [code, anim, dir] = raw.split("/");
    const parsed = core.creatureFromCode(code);
    if (!parsed || !catalog.byId.has(parsed.id)) return null;
    return { id: parsed.id, variant: parsed.variant, anim, dir };
  }

  // ------------------------------------------------------------------ playground
  function pgScale(c) {
    return c.fh <= 40 ? 2 : c.fh <= 64 ? 1 : 1;
  }

  async function pgSprite(c) {
    const key = c.id + "~" + (state.variant && state.id === c.id ? state.variant : "");
    if (playground.sprites.has(key)) return playground.sprites.get(key);
    const anims = core.animationsFor(c).filter((k) => k === "walk" || k === "run" || k === "fly" || k === "idle" || k === "hop" || k === "swim" || k === "gallop");
    const sprite = await core.createSprite(catalog, { id: c.id, variant: state.id === c.id ? state.variant : null }, {
      scale: pgScale(c), anims: anims.length ? anims : [preferredAnim(c)], shadow: state.shadow, ...catalogOptions,
    });
    playground.sprites.set(key, sprite);
    return sprite;
  }

  function pgMoveAnim(sprite) {
    for (const k of ["walk", "gallop", "run", "hop", "swim", "fly", "idle"]) if (sprite.animations.includes(k)) return k;
    return sprite.animations[0];
  }

  async function pgAdd(id, variant) {
    const c = catalog.byId.get(id || state.id);
    if (!c) return;
    let sprite;
    try {
      sprite = await pgSprite(c);
    } catch (e) {
      console.error(e);
      toast("Could not load " + c.name + " frames", true);
      return;
    }
    if (destroyed) return;
    const w = el.playground.clientWidth || 600;
    const h = el.playground.clientHeight || 360;
    playground.entities.push({
      id: c.id, sprite, anim: pgMoveAnim(sprite), dir: ["down", "left", "right", "up"][Math.floor(Math.random() * 4)],
      x: 40 + Math.random() * Math.max(40, w - 80), y: 60 + Math.random() * Math.max(40, h - 100),
      tx: 0, ty: 0, t: Math.random() * 3, speed: 18 + Math.random() * 22, waiting: 0,
    });
    const e = playground.entities[playground.entities.length - 1];
    e.tx = 40 + Math.random() * Math.max(40, w - 80);
    e.ty = 60 + Math.random() * Math.max(40, h - 40);
    el.pgCount.textContent = playground.entities.length + " on the field";
  }

  function pgClear() {
    playground.entities.length = 0;
    el.pgCount.textContent = "0 on the field";
    pgDraw();
  }

  // The field starts empty so the tab is instant; the first time it is opened we
  // scatter a small mixed herd through it so the demo is alive on arrival.
  async function pgSeed() {
    if (playground.seeded) return;
    playground.seeded = true;
    const pool = catalog.creatures.filter((c) => c.id !== "slime-projectile");
    const picks = [];
    const seen = new Set();
    while (picks.length < 9 && picks.length < pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      picks.push(c);
    }
    for (const c of picks) {
      await pgAdd(c.id, c.variants[Math.floor(Math.random() * c.variants.length)].key);
      if (destroyed) return;
      await new Promise((r) => setTimeout(r, 40));
    }
  }

  function pgBuildGrass(w, h) {
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, w);
    cv.height = Math.max(1, h);
    const ctx = cv.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#4b8a3d");
    g.addColorStop(0.55, "#3f7a34");
    g.addColorStop(1, "#2f5f28");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const rnd = (n) => Math.floor(Math.random() * n);
    for (let i = 0; i < Math.floor((w * h) / 900); i++) {
      const x = rnd(w), y = rnd(h);
      ctx.fillStyle = "rgba(0,0,0," + (0.03 + Math.random() * 0.06) + ")";
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + rnd(34), 5 + rnd(16), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < Math.floor((w * h) / 420); i++) {
      const x = rnd(w), y = rnd(h);
      ctx.strokeStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() < 0.5 ? -2 : 2), y - 3 - rnd(3));
      ctx.stroke();
    }
    return cv;
  }

  function syncPlaygroundSize() {
    // clientWidth/Height can be fractional; the canvas attribute is an integer,
    // so compare rounded values or the grass would be rebuilt every frame.
    const w = Math.max(1, Math.round(el.playground.clientWidth));
    const h = Math.max(1, Math.round(el.playground.clientHeight));
    if (!w || !h) return;
    if (el.playground.width !== w || el.playground.height !== h) {
      el.playground.width = w;
      el.playground.height = h;
    }
    if (playground.grassW !== w || playground.grassH !== h) {
      playground.grass = pgBuildGrass(w, h);
      playground.grassW = w;
      playground.grassH = h;
    }
  }

  function pgUpdate(dt) {
    const w = el.playground.width;
    const h = el.playground.height;
    const scale = Number(el.pgSpeed.value) / 80;
    for (const e of playground.entities) {
      if (e.waiting > 0) { e.waiting -= dt; continue; }
      const dx = e.tx - e.x;
      const dy = e.ty - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 3) {
        e.waiting = 0.2 + Math.random() * 1.6;
        e.tx = 30 + Math.random() * Math.max(30, w - 60);
        e.ty = 50 + Math.random() * Math.max(40, h - 60);
        continue;
      }
      const step = e.speed * scale * dt;
      e.x += (dx / dist) * step;
      e.y += (dy / dist) * step;
      e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      const n = e.sprite.frameCount(e.anim, e.dir) || 1;
      e.t += dt;
      e.frame = Math.floor(e.t * e.sprite.fps(e.anim)) % n;
    }
  }

  function pgDraw() {
    syncPlaygroundSize();
    const cv = el.playground;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    if (playground.grass) ctx.drawImage(playground.grass, 0, 0);
    else { ctx.fillStyle = "#3f7a34"; ctx.fillRect(0, 0, cv.width, cv.height); }
    const order = [...playground.entities].sort((a, b) => a.y - b.y);
    for (const e of order) {
      e.sprite.drawWithShadow(ctx, Math.round(e.x), Math.round(e.y), {
        anim: e.anim, dir: e.dir, frame: e.frame || 0,
      });
    }
    if (!playground.entities.length) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Spawn a few creatures to see the exported sprite API in action", cv.width / 2, cv.height / 2);
      ctx.textAlign = "left";
    }
  }

  // ------------------------------------------------------------------ events
  el.search.addEventListener("input", () => { state.search = el.search.value; renderBrowser(); });
  el.animSelect.addEventListener("change", () => setAnim(el.animSelect.value));
  el.playBtn.addEventListener("click", () => {
    state.playing = !state.playing;
    el.playBtn.innerHTML = state.playing ? "&#10074;&#10074;" : "&#9654;";
  });
  el.dirSeg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) setDir(core.DIRECTIONS[Array.from(el.dirSeg.children).indexOf(b)]);
  });
  el.dpad.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dir]");
    if (b) setDir(b.dataset.dir);
  });
  el.frameRange.addEventListener("input", () => {
    state.playing = false;
    el.playBtn.innerHTML = "&#9654;";
    setFrame(Number(el.frameRange.value));
  });
  el.zoomRange.addEventListener("input", () => {
    state.scale = Number(el.zoomRange.value);
    buildPreview();
  });
  el.fitBtn.addEventListener("click", () => { fitZoom(); buildPreview(); });
  el.dirsToggle.addEventListener("change", () => { state.fourDir = el.dirsToggle.checked; saveSettings(); buildPreview(); });
  el.gridToggle.addEventListener("change", () => { state.grid = el.gridToggle.checked; saveSettings(); drawPreview(); });
  el.shadowToggle.addEventListener("change", () => { state.shadow = el.shadowToggle.checked; saveSettings(); buildPreview(); });
  el.bgSeg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-bg]");
    if (!b) return;
    state.bg = b.dataset.bg;
    saveSettings();
    syncControls();
  });
  el.stageTabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    state.tab = b.dataset.tab;
    saveSettings();
    syncControls();
    if (state.tab === "preview") buildPreview();
    if (state.tab === "sheet") renderSheetView();
    if (state.tab === "playground") { syncPlaygroundSize(); pgDraw(); pgSeed(); }
  });
  el.randomBtn.addEventListener("click", () => {
    const c = catalog.creatures[Math.floor(Math.random() * catalog.creatures.length)];
    state.anim = "<random>";
    state.search = ""; el.search.value = "";
    state.category = "all"; state.favOnly = false; el.favBtn.classList.remove("on");
    selectCreature(c.id, c.variants[Math.floor(Math.random() * c.variants.length)].key);
    const anims = core.animationsFor(creature());
    setAnim(anims[Math.floor(Math.random() * anims.length)]);
    if (core.isDirectional(creature())) setDir(core.DIRECTIONS[Math.floor(Math.random() * 4)]);
    renderCatChips();
    renderBrowser();
    toast("Rolled the dice: " + creature().name);
  });
  el.favBtn.addEventListener("click", () => {
    state.favOnly = !state.favOnly;
    el.favBtn.classList.toggle("on", state.favOnly);
    renderCatChips();
    renderBrowser();
  });
  el.favStarBtn.addEventListener("click", () => {
    if (favourites.has(state.id)) favourites.delete(state.id);
    else favourites.add(state.id);
    saveFavourites();
    updateStarButton();
    const tile = el.browser.querySelector('.tile[data-id="' + CSS_escape(state.id) + '"] .fav');
    if (tile) tile.classList.toggle("on", favourites.has(state.id));
    if (state.favOnly) renderBrowser();
  });
  el.creditsBtn.addEventListener("click", openCreditsModal);
  el.exportBtn.addEventListener("click", openExportModal);
  el.shareBtn.addEventListener("click", openShareModal);
  el.resetBtn.addEventListener("click", () => {
    state.playing = true;
    el.playBtn.innerHTML = "&#10074;&#10074;";
    state.fourDir = false; state.grid = false; state.shadow = true; state.bg = "checker";
    state.search = ""; el.search.value = "";
    state.category = "all"; state.tag = null; state.favOnly = false;
    el.favBtn.classList.remove("on");
    saveSettings();
    selectCreature(state.id, null, { keepZoom: true, silent: true });
    renderCatChips();
    renderBrowser();
    updateInfo();
    toast("Reset view");
  });
  el.sheetDownloadBtn.addEventListener("click", async () => {
    const c = creature();
    const canvas = await core.renderAnimSheet(catalog, ref(), state.anim, { scale: state.sheetScale, ...catalogOptions });
    const name = c.id + "-" + state.anim + ".png";
    downloadBlob(await canvasToBlob(canvas), name);
    toast("Downloaded " + name);
  });
  el.pgSpawnBtn.addEventListener("click", () => pgAdd(state.id, state.variant));
  el.pgAddBtn.addEventListener("click", () => {
    const c = catalog.creatures[Math.floor(Math.random() * catalog.creatures.length)];
    pgAdd(c.id, c.variants[0].key);
  });
  el.pgClearBtn.addEventListener("click", pgClear);
  el.playground.addEventListener("click", (e) => {
    if (!playground.entities.length) return;
    const r = el.playground.getBoundingClientRect();
    playground.entities[playground.entities.length - 1].tx = e.clientX - r.left;
    playground.entities[playground.entities.length - 1].ty = e.clientY - r.top;
  });

  function onKey(e) {
    const t = e.target;
    const tag = t && t.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || (t && t.isContentEditable)) {
      if (!(tag === "INPUT" && t.type === "range")) return;
    }
    if (!el.modalBack.hidden && e.key === "Escape") { closeModal(); return; }
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (core.isDirectional(creature())) { setDir(map[e.key]); e.preventDefault(); }
      return;
    }
    if (e.key === " ") {
      state.playing = !state.playing;
      el.playBtn.innerHTML = state.playing ? "&#10074;&#10074;" : "&#9654;";
      e.preventDefault();
      return;
    }
    if (e.key === "[") step(-1);
    else if (e.key === "]") step(1);
    else if (e.key === "r" || e.key === "R") el.randomBtn.click();
  }
  function step(delta) {
    const list = filtered();
    if (!list.length) return;
    let i = list.findIndex((c) => c.id === state.id);
    if (i < 0) i = 0;
    i = (i + delta + list.length) % list.length;
    selectCreature(list[i].id, null);
  }
  document.addEventListener("keydown", onKey);

  // A resize (window, phone rotation, or the host embedding the creator in a
  // panel) re-lays out the stage, so re-render the current view once the size
  // settles rather than leaving a stale canvas behind.
  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (destroyed) return;
      syncPlaygroundSize();
      if (state.tab === "preview") buildPreview();
      else if (state.tab === "sheet") renderSheetView();
    }, 150);
  }
  addEventListener("resize", onResize);

  // ------------------------------------------------------------------ loop
  let lastTs = 0;
  function loop(ts) {
    if (destroyed) return;
    raf = requestAnimationFrame(loop);
    const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    if (state.tab === "preview") {
      const max = frameMax();
      if (state.playing && max > 0 && previewSprite) {
        acc += dt;
        const spf = 1 / (previewSprite.fps(state.anim) || 8);
        if (acc >= spf) {
          acc %= spf;
          setFrame(state.frame + 1);
        }
      }
    } else if (state.tab === "playground") {
      pgUpdate(dt);
      pgDraw();
    }
  }

  // ------------------------------------------------------------------ init
  renderCatChips();
  const fromHash = readHash();
  const initial = fromHash || storedLast || { id: catalog.creatures[0].id, variant: null, anim: null, dir: null };
  if (Array.isArray(await store.get("recent"))) recent.push(...(await store.get("recent")));
  selectCreature(initial.id, initial.variant, { silent: true });
  if (initial.anim && creature().anims[initial.anim]) setAnim(initial.anim, { silent: true });
  if (initial.dir) setDir(initial.dir);
  buildPreview();
  renderBrowser();
  syncControls();
  el.playBtn.innerHTML = "&#10074;&#10074;";
  el.pgCount.textContent = "0 on the field";
  if (state.tab === "sheet") renderSheetView();
  if (state.tab === "playground") { syncPlaygroundSize(); pgSeed(); pgDraw(); }
  raf = requestAnimationFrame(loop);

  const controller = {
    root,
    shadow,
    mountEl: container,
    catalog,
    get state() { return Object.assign({}, state); },
    getSelection() {
      const c = creature();
      const v = core.variantOf(c, state.variant);
      return {
        id: c.id, variant: v.key, name: c.name, variantName: v.name,
        code: codeOf(), category: c.category, tags: (c.tags || []).slice(),
        anim: state.anim, dir: state.dir,
        frameSize: { w: c.fw, h: c.fh },
        ground: c.ground || null,
        packs: (c.packs || []).slice(),
      };
    },
    getCreature: () => creature(),
    select: (id, variant) => selectCreature(id, variant),
    setAnim, setDir, setFrame,
    renderFrame: (o) => core.renderFrame(catalog, ref(), Object.assign({}, catalogOptions, o)),
    renderAnimSheet: (anim, o) => core.renderAnimSheet(catalog, ref(), anim || state.anim, Object.assign({}, catalogOptions, o)),
    renderFullSheet: (o) => core.renderSheet(catalog, ref(), Object.assign({}, catalogOptions, o)),
    manifest: (o) => core.sheetManifest(catalog, ref(), o || {}),
    createSprite: (o) => core.createSprite(catalog, ref(), Object.assign({}, catalogOptions, o)),
    openExport: openExportModal,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      playground.entities.length = 0;
      playground.sprites.clear();
      thumbCache.clear();
      core.clearCaches();
      try { shadow.innerHTML = ""; } catch {}
    },
  };
  return controller;
}

/**
 * Full-screen overlay version of the creator: resolves with the picked
 * creature (see controller.getSelection()) or null when cancelled.
 */
export async function open(opts = {}) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:#0b0e13;overflow:auto;";
  document.body.appendChild(host);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const controller = await mount(host, Object.assign({}, opts, { height: false }));
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      controller.destroy();
      host.remove();
      resolve(value);
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish(null);
    };
    document.addEventListener("keydown", onKey, true);
    const actions = controller.root.querySelector(".top-actions");
    if (actions) {
      const cancel = document.createElement("button");
      cancel.className = "btn btn-ghost";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => finish(null));
      const use = document.createElement("button");
      use.className = "btn btn-primary";
      use.textContent = "Use this creature";
      use.addEventListener("click", () => finish(controller.getSelection()));
      actions.appendChild(cancel);
      actions.appendChild(use);
    }
  });
}
