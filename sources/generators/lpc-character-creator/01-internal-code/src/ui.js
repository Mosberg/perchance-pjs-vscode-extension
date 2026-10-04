// ============================================================================
// LPC Character Creator - UI shell (markup + CSS)
// ============================================================================
// The app's DOM and styles live here so the whole experience can be injected
// into a shadow root, both on this generator's own page (index.html is a thin
// host) and inside any other generator that imports this one as a plugin.
//
// The markup is the app shell: topbar, three-column layout, toast, modal.
// src/creator.js mounts it and wires the behaviour.

export const LPC_CSS = `/* LPC Character Creator styles. Scoped for injection into a shadow root: the
   selectors below use .lpc-app / :host rather than body. Kept as one string so
   the plugin bundle stays a single file (see src/README.md). */
:host { display: block; height: 100%; }

  :host {
    --bg: #0b0e13;
    --bg-2: #10151d;
    --panel: #151b24;
    --panel-2: #1b2330;
    --panel-3: #222c3b;
    --text: #e8ecf3;
    --muted: #93a0b4;
    --muted-2: #6b7789;
    --accent: #f0b429;
    --accent-2: #ffd05c;
    --accent-ink: #2a1e05;
    --blue: #5aa9ff;
    --border: #26303d;
    --border-2: #33404f;
    --radius: 12px;
    --shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  }

  .lpc-app, .lpc-app * { box-sizing: border-box; }

  .lpc-app {
    margin: 0;
    background:
      radial-gradient(1100px 600px at 70% -10%, #1b2534 0%, transparent 60%),
      radial-gradient(800px 500px at 0% 100%, #1a1f2b 0%, transparent 55%),
      var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    text-align: left;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  button, input, select { font: inherit; color: inherit; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2c3644; border-radius: 6px; border: 2px solid transparent; background-clip: content-box; }
  ::-webkit-scrollbar-thumb:hover { background: #3b4859; background-clip: content-box; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 14px max(14px, calc((100% - 1720px) / 2 + 14px));
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(27, 35, 48, 0.9), rgba(16, 21, 29, 0.85));
    backdrop-filter: blur(6px);
    position: sticky; top: 0; z-index: 40;
    flex-wrap: wrap;
    flex: none;
  }
  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .brand > div { min-width: 0; }
  .brand-mark {
    width: 38px; height: 38px; border-radius: 10px; flex: none;
    display: grid; place-items: center; font-weight: 800; font-size: 13px; letter-spacing: 0.5px;
    color: var(--accent-ink);
    background: linear-gradient(150deg, var(--accent-2), var(--accent) 60%, #c98a10);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 3px 10px rgba(240,180,41,0.25);
  }
  .brand h1 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .brand p { margin: 2px 0 0; font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .top-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .btn {
    appearance: none; cursor: pointer;
    border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
    padding: 8px 13px; border-radius: 9px; font-size: 13px; font-weight: 500;
    transition: background .12s ease, border-color .12s ease, transform .05s ease;
    display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .btn:hover { background: var(--panel-3); border-color: #43526a; }
  .btn:active { transform: translateY(1px); }
  .btn[disabled] { opacity: .5; pointer-events: none; }
  .btn-primary {
    background: linear-gradient(180deg, var(--accent-2), var(--accent));
    border-color: #b9840d; color: var(--accent-ink); font-weight: 700;
  }
  .btn-primary:hover { background: linear-gradient(180deg, #ffe08a, var(--accent-2)); border-color: var(--accent); }
  .btn-ghost { background: transparent; }
  .btn-sm { padding: 5px 9px; font-size: 12px; border-radius: 8px; }

  .layout {
    display: grid;
    grid-template-columns: 336px minmax(320px, 1fr) 316px;
    gap: 14px; padding: 14px; align-items: stretch;
    max-width: 1720px; margin: 0 auto 0;
    flex: 1 1 auto; min-height: 0; width: 100%;
  }
  @media (max-width: 1240px) {
    :host, .lpc-app { display: block; height: auto; }
    .layout { grid-template-columns: 340px minmax(0, 1fr); flex: none; min-height: 0; }
    .col-detail { grid-column: 1 / -1; }
    .col-browser .panel-body { max-height: min(560px, 62vh); overflow: auto; }
    .col-detail .panel-body { overflow: visible; }
    .stage { flex: none; min-height: 420px; }
  }
  @media (max-width: 900px) {
    :host, .lpc-app { display: block; height: auto; }
    .layout { grid-template-columns: minmax(0, 1fr); padding: 10px; gap: 10px; }
    .col-detail { grid-column: auto; }
    .col-browser .panel-body { max-height: none; overflow: visible; }
    .stage { flex: none; min-height: 340px; }
    .topbar { padding: 10px 12px; }
  }
  @media (max-width: 620px) {
    .topbar { gap: 10px; }
    .brand p { display: none; }
    .top-actions { width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
    .top-actions .btn { justify-content: center; padding: 8px 6px; }
    .top-actions .btn:nth-child(5) { grid-column: span 2; }
  }

  .panel {
    background: linear-gradient(180deg, var(--panel), var(--bg-2));
    border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: var(--shadow); display: flex; flex-direction: column; min-width: 0; min-height: 0;
  }
  .panel-head {
    padding: 11px 13px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
    background: linear-gradient(180deg, rgba(34,44,59,0.55), rgba(21,27,36,0.2));
  }
  .panel-head h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); font-weight: 700; }
  .panel-body { padding: 12px; }
  .col-browser .panel-body,
  .col-detail .panel-body { overflow: auto; position: relative; flex: 1 1 auto; min-height: 0; }
  @media (max-width: 900px) {
    .col-browser .panel-body,
    .col-detail .panel-body { overflow: visible; max-height: none; }
  }

  /* ---- stage ---- */
  .col-stage { overflow: hidden; }
  .stage {
    position: relative; display: grid; place-items: center;
    padding: 18px; min-height: 260px; flex: 1 1 auto; min-width: 0;
    background:
      linear-gradient(45deg, #0d1117 25%, transparent 25%, transparent 75%, #0d1117 75%),
      linear-gradient(45deg, #0d1117 25%, #111823 25%, #111823 75%, #0d1117 75%);
    background-size: 22px 22px; background-position: 0 0, 11px 11px;
    overflow: hidden;
  }
  #previewCanvas { image-rendering: pixelated; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.55)); }
  .stage-badge {
    position: absolute; left: 12px; top: 12px; font-size: 11px; color: var(--muted); white-space: nowrap;
    background: rgba(11,14,19,0.7); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px;
  }
  .stage-controls { padding: 12px; border-top: 1px solid var(--border); display: grid; gap: 10px; flex: none; }
  .ctrl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ctrl-row .label { font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); font-weight: 700; }

  select, input[type="text"], input[type="search"] {
    background: var(--panel-2); border: 1px solid var(--border-2); color: var(--text);
    border-radius: 9px; padding: 7px 10px; outline: none; width: 100%;
  }
  select:focus, input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(240,180,41,0.14); }
  input[type="range"] { width: 106px; accent-color: var(--accent); }
  input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; }

  .seg { display: inline-flex; background: var(--panel-2); border: 1px solid var(--border-2); border-radius: 9px; overflow: hidden; }
  .seg button {
    appearance: none; border: 0; background: transparent; color: var(--muted);
    padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 600;
  }
  .seg button + button { border-left: 1px solid var(--border); }
  .seg button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); }

  /* ---- tree ---- */
  .tree { font-size: 13px; }
  .tree-node > .tree-row {
    display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 7px;
    cursor: pointer; user-select: none;
  }
  .tree-node > .tree-row:hover { background: var(--panel-2); }
  .tree-row.active { background: linear-gradient(90deg, rgba(240,180,41,.18), rgba(240,180,41,.05)); color: var(--accent-2); }
  .tree-caret { width: 14px; text-align: center; color: var(--muted-2); font-size: 10px; flex: none; }
  .tree-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tree-count { font-size: 10.5px; color: var(--muted-2); }
  .tree-children { margin-left: 11px; border-left: 1px solid var(--border); padding-left: 5px; }
  .tree-children[hidden] { display: none; }

  /* ---- item grid ---- */
  .crumb { font-size: 11.5px; color: var(--muted); padding: 2px 2px 8px; }
  .crumb b { color: var(--text); }
  .cat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .chip {
    border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
    padding: 4px 9px; border-radius: 999px; font-size: 12px; cursor: pointer;
  }
  .chip:hover { border-color: var(--accent); color: var(--accent-2); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(66px, 1fr)); gap: 7px; }
  .grid.big { grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); }
  .tile {
    position: relative; border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
    background: #0e1319; cursor: pointer; padding: 0; aspect-ratio: 1 / 1;
    transition: border-color .12s ease, transform .06s ease;
  }
  .tile:hover { border-color: var(--border-2); transform: translateY(-1px); }
  .tile.on { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(240,180,41,.25) inset; }
  .tile canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
  .tile .cap {
    position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 4px 4px;
    font-size: 9.5px; line-height: 1.15; text-align: center; color: #dbe2ec;
    background: linear-gradient(180deg, transparent, rgba(6,9,13,.88) 55%);
    text-shadow: 0 1px 2px #000; pointer-events: none;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .tile .badge {
    position: absolute; top: 4px; right: 4px; font-size: 9px; padding: 1px 5px; border-radius: 999px;
    background: rgba(240,180,41,.9); color: var(--accent-ink); font-weight: 700;
  }
  .tile.dim { opacity: .35; }
  .shimmer { position: absolute; inset: 0; background: linear-gradient(100deg, #131a23 30%, #1b2530 50%, #131a23 70%); background-size: 200% 100%; animation: sh 1.1s linear infinite; }
  @keyframes sh { from { background-position: 200% 0; } to { background-position: -60% 0; } }

  .empty { color: var(--muted-2); font-size: 12.5px; padding: 14px 4px; }

  /* ---- detail ---- */
  .section + .section { border-top: 1px solid var(--border); }
  .section h3 { margin: 0 0 9px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px; color: var(--muted); font-weight: 700; }
  .eq-item { display: flex; align-items: center; gap: 9px; padding: 5px 0; }
  .eq-item .sw {
    width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--border-2); flex: none;
    background: #0e1319; image-rendering: pixelated;
  }
  .eq-item .nm { flex: 1; min-width: 0; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .eq-item .sub { font-size: 10.5px; color: var(--muted-2); }
  .eq-item .anim-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .anim-tag {
    border: 1px solid var(--border-2); background: var(--panel-2); color: var(--accent-2);
    font-size: 9.5px; padding: 1px 6px; border-radius: 999px; cursor: pointer; line-height: 1.6;
  }
  .anim-tag:hover { border-color: var(--accent); background: var(--panel-3); }
  .x { border: 0; background: transparent; color: var(--muted-2); cursor: pointer; font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 6px; }
  .x:hover { color: #ff8a8a; background: rgba(255,90,90,.12); }

  .slot-block { margin-bottom: 13px; }
  .slot-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px; }
  .slot-name { font-size: 12px; font-weight: 600; }
  .swatches { display: flex; flex-wrap: wrap; gap: 5px; }
  .sw {
    width: 24px; height: 24px; border-radius: 6px; padding: 0; cursor: pointer;
    border: 1px solid rgba(255,255,255,.14); position: relative;
  }
  .sw:hover { transform: translateY(-1px); }
  .sw.on { box-shadow: 0 0 0 2px var(--accent), 0 0 0 3px rgba(0,0,0,.5); }
  .sw-plain { background: repeating-linear-gradient(45deg, #2a3444 0 4px, #1d2a38 4px 8px); }
  .sw.ver { border-radius: 50%; }
  .swatch-group { margin-top: 7px; }
  .swatch-group .vg { font-size: 10px; color: var(--muted-2); margin-bottom: 4px; letter-spacing: .4px; }

  .credits { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
  .credits .c { padding: 7px 0; border-top: 1px dashed var(--border); }
  .credits .c:first-child { border-top: 0; }
  .credits b { color: var(--text); font-weight: 600; }
  .credits a { color: var(--blue); text-decoration: none; }
  .credits a:hover { text-decoration: underline; }
  .lic { display: inline-block; border: 1px solid var(--border-2); border-radius: 999px; padding: 0 6px; margin: 2px 3px 0 0; font-size: 10px; color: var(--muted); }

  /* ---- misc ---- */
  .toast {
    position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%) translateY(14px);
    background: #1d2635; border: 1px solid var(--border-2); color: var(--text);
    padding: 10px 16px; border-radius: 10px; box-shadow: var(--shadow);
    opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; z-index: 100;
    font-size: 13px; max-width: 80vw;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  .modal-back {
    position: fixed; inset: 0; background: rgba(5,8,12,.72); backdrop-filter: blur(3px);
    display: grid; place-items: center; z-index: 90; padding: 18px;
  }
  .modal-back[hidden] { display: none; }
  .modal {
    background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--border-2);
    border-radius: 14px; box-shadow: var(--shadow); width: min(560px, 100%); max-height: 84vh; overflow: auto;
  }
  .modal-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .modal-head h3 { margin: 0; font-size: 15px; }
  .modal-body { padding: 16px; }
  .modal-foot { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
  .prog { height: 8px; background: var(--panel-3); border-radius: 99px; overflow: hidden; margin-top: 12px; }
  .prog > i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .15s ease; }
  .field + .field { margin-top: 12px; }
  .field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); margin-bottom: 5px; font-weight: 700; }
  .save-row { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-top: 1px solid var(--border); }
  .save-row .nm { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .save-row .meta { font-size: 10.5px; color: var(--muted-2); }
  code.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; background: #0e1319; border: 1px solid var(--border); border-radius: 6px; padding: 2px 5px; word-break: break-all; }
`;

export const LPC_HTML = `<div class="topbar">
  <div class="brand">
    <div class="brand-mark">LPC</div>
    <div>
      <h1>Character Creator</h1>
      <p>Universal LPC Spritesheet &mdash; 657 items, live recolouring, equipped-item animations</p>
    </div>
  </div>
  <div class="top-actions">
    <button class="btn" id="randomBtn" title="Randomize the whole character">Randomize</button>
    <button class="btn" id="saveBtn">Save</button>
    <button class="btn" id="savesBtn">Library</button>
    <button class="btn" id="exportBtn">Export</button>
    <button class="btn btn-primary" id="shareBtn">Share link</button>
  </div>
</div>

<div class="layout">
  <section class="panel col-browser">
    <div class="panel-head">
      <h2>Items</h2>
      <span class="tree-count" id="itemCountEl"></span>
    </div>
    <div class="panel-body">
      <input type="search" id="searchInput" placeholder="Search items…" autocomplete="off" style="margin-bottom:10px" />
      <div class="tree" id="treeEl"></div>
      <div id="browserEl"></div>
    </div>
  </section>

  <section class="panel col-stage">
    <div class="stage">
      <canvas id="previewCanvas" width="256" height="256"></canvas>
      <div class="stage-badge" id="stageBadge">idle · down</div>
    </div>
    <div class="stage-controls">
      <div class="ctrl-row">
        <span class="label">Body</span>
        <select id="bodyTypeSelect" style="width:auto"></select>
        <span class="label" style="margin-left:6px">Anim</span>
        <select id="animSelect" style="width:auto"></select>
        <button class="btn btn-sm" id="playBtn" title="Play / pause">❚❚</button>
        <button class="btn btn-sm" id="attackBtn" hidden></button>
        <div class="seg" id="dirSeg"></div>
        <span class="label" style="margin-left:6px">Zoom</span>
        <input type="range" id="zoomRange" min="4" max="14" step="1" value="12" />
        <label class="ctrl-row" style="gap:5px"><input type="checkbox" id="dirsToggle" /> 4-dir</label>
      </div>
    </div>
  </section>

  <section class="panel col-detail">
    <div class="panel-head"><h2>Character</h2><button class="btn btn-sm btn-ghost" id="resetBtn">Reset</button></div>
    <div class="panel-body">
      <div class="section" id="equippedSection">
        <h3>Equipped</h3>
        <div id="equippedEl"></div>
      </div>
      <div class="section" id="colorsSection" style="margin-top:12px">
        <h3 id="colorsTitle">Colors</h3>
        <div id="colorsEl"></div>
      </div>
      <div class="section" id="creditsSection" style="margin-top:12px">
        <h3>Credits</h3>
        <div class="credits" id="creditsEl"></div>
      </div>
    </div>
  </section>
</div>

<div class="toast" id="toastEl"></div>

<div class="modal-back" id="modalBack" hidden>
  <div class="modal">
    <div class="modal-head"><h3 id="modalTitle">Title</h3><button class="x" id="modalClose">✕</button></div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-foot" id="modalFoot"></div>
  </div>
</div>`;
