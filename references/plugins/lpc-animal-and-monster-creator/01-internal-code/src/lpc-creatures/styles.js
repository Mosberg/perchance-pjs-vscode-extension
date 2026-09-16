// LPC Animals & Monsters — styles. One CSS string so the plugin bundle stays a
// single file and the UI can live inside a shadow root without leaking styles.
// Palette deliberately matches the sibling LPC Character Creator.

export const CSS = `
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
  --green: #6ddc8b;
  --red: #ff7a7a;
  --border: #26303d;
  --border-2: #33404f;
  --radius: 12px;
  --shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.lpc-app, .lpc-app * { box-sizing: border-box; }
/* the hidden attribute must always win, even over the display rules below */
.lpc-app [hidden] { display: none !important; }

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

/* ---------- top bar ---------- */
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
.btn-icon { padding: 6px 9px; }
.btn.on { border-color: var(--accent); color: var(--accent-2); background: rgba(240,180,41,.12); }

/* ---------- layout ---------- */
.layout {
  display: grid;
  grid-template-columns: 344px minmax(320px, 1fr) 322px;
  gap: 14px; padding: 14px; align-items: stretch;
  max-width: 1720px; margin: 0 auto 0;
  flex: 1 1 auto; min-height: 0; width: 100%;
}
@media (max-width: 1240px) {
  .lpc-app { height: auto; }
  .layout { grid-template-columns: 330px minmax(0, 1fr); flex: none; }
  .col-detail { grid-column: 1 / -1; }
  .col-browser .panel-body { max-height: min(560px, 62vh); overflow: auto; }
  .col-detail .panel-body { overflow: visible; }
  .stage { flex: none; min-height: 420px; }
}
@media (max-width: 900px) {
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
}

.panel {
  background: linear-gradient(180deg, var(--panel), var(--bg-2));
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); display: flex; flex-direction: column; min-width: 0; min-height: 0;
}
.panel-head {
  padding: 11px 13px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 9px; flex-wrap: wrap; flex: none;
  background: linear-gradient(180deg, rgba(34,44,59,0.55), rgba(21,27,36,0.2));
}
.panel-head h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); font-weight: 700; }
.panel-body { padding: 12px; }
.col-browser .panel-body, .col-detail .panel-body { overflow: auto; position: relative; flex: 1 1 auto; min-height: 0; }
@media (max-width: 900px) {
  .col-browser .panel-body, .col-detail .panel-body { overflow: visible; max-height: none; }
}
.spacer { flex: 1 1 auto; }

/* ---------- stage ---------- */
.col-stage { overflow: hidden; }
.stage-tabs { display: flex; gap: 4px; margin-left: auto; }
.stage-tabs button {
  appearance: none; border: 1px solid transparent; background: transparent; color: var(--muted);
  padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.stage-tabs button:hover { color: var(--text); background: var(--panel-2); }
.stage-tabs button.on { background: var(--panel-3); border-color: var(--border-2); color: var(--accent-2); }

.stage-wrap { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
.stage {
  position: relative; display: grid; place-items: center;
  padding: 18px; min-height: 260px; flex: 1 1 auto; min-width: 0;
  overflow: auto;
}
.stage-bg-checker {
  background:
    linear-gradient(45deg, #0d1117 25%, transparent 25%, transparent 75%, #0d1117 75%),
    linear-gradient(45deg, #0d1117 25%, #111823 25%, #111823 75%, #0d1117 75%);
  background-size: 22px 22px; background-position: 0 0, 11px 11px;
}
.stage-bg-dark { background: #0a0d12; }
.stage-bg-grass {
  background:
    radial-gradient(120% 90% at 50% 0%, #4f8b3f 0%, #3a6d30 45%, #2a5225 100%);
}
.stage-bg-light { background: #dfe5ee; }
#previewCanvas { image-rendering: pixelated; max-width: 100%; height: auto; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.55)); }
#sheetCanvas, #playgroundCanvas { image-rendering: pixelated; max-width: 100%; }
#sheetCanvas { filter: drop-shadow(0 10px 16px rgba(0,0,0,0.5)); }
.playground-ctn { position: absolute; inset: 0; }
#playgroundCanvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.stage-badge {
  position: absolute; left: 12px; top: 12px; font-size: 11px; color: var(--muted); white-space: nowrap;
  background: rgba(11,14,19,0.72); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px;
  z-index: 2;
}
.stage-hint {
  font-size: 11.5px; color: var(--muted); padding: 9px 12px; border-top: 1px solid var(--border);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap; flex: none;
}
.stage-controls { padding: 12px; border-top: 1px solid var(--border); display: grid; gap: 10px; flex: none; }
.ctrl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ctrl-row .label { font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); font-weight: 700; }
.ctrl-row .grow { flex: 1 1 90px; min-width: 80px; }

select, input[type="text"], input[type="search"], input[type="number"] {
  background: var(--panel-2); border: 1px solid var(--border-2); color: var(--text);
  border-radius: 9px; padding: 7px 10px; outline: none; width: 100%;
}
select:focus, input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(240,180,41,0.14); }
input[type="range"] { width: 118px; accent-color: var(--accent); }
input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; }
label.chk { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; color: var(--muted); }
label.chk:hover { color: var(--text); }

.seg { display: inline-flex; background: var(--panel-2); border: 1px solid var(--border-2); border-radius: 9px; overflow: hidden; }
.seg button {
  appearance: none; border: 0; background: transparent; color: var(--muted);
  padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.seg button + button { border-left: 1px solid var(--border); }
.seg button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); }

/* D-pad for direction */
.dpad { display: grid; grid-template-columns: repeat(3, 30px); grid-template-rows: repeat(3, 26px); gap: 3px; }
.dpad button {
  appearance: none; border: 1px solid var(--border-2); background: var(--panel-2); color: var(--muted);
  border-radius: 7px; cursor: pointer; font-size: 12px; padding: 0; line-height: 1;
}
.dpad button:hover { color: var(--text); background: var(--panel-3); }
.dpad button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); border-color: #b9840d; }
.dpad .up { grid-area: 1 / 2; }
.dpad .left { grid-area: 2 / 1; }
.dpad .down { grid-area: 3 / 2; }
.dpad .right { grid-area: 2 / 3; }
.dpad .mid {
  grid-area: 2 / 2; display: grid; place-items: center; font-size: 9px; color: var(--muted-2);
  border: 1px dashed var(--border); border-radius: 7px;
}

/* ---------- browser ---------- */
.cat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 9px; }
.chip {
  border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
  padding: 4px 9px; border-radius: 999px; font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
}
.chip:hover { border-color: var(--accent); color: var(--accent-2); }
.chip.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); border-color: #b9840d; font-weight: 700; }
.chip .n { font-size: 10px; opacity: .75; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 7px; }
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
.tile .fav {
  position: absolute; top: 3px; right: 3px; width: 19px; height: 19px; border-radius: 6px;
  border: 1px solid var(--border-2); background: rgba(11,14,19,.75); color: var(--muted-2);
  font-size: 11px; line-height: 1; padding: 0; cursor: pointer; display: grid; place-items: center;
}
.tile .fav:hover { color: var(--accent-2); border-color: var(--accent); }
.tile .fav.on { color: var(--accent-ink); background: var(--accent); border-color: #b9840d; }
.tile .badge {
  position: absolute; top: 4px; left: 4px; font-size: 8.5px; padding: 1px 5px; border-radius: 999px;
  background: rgba(11,14,19,.72); border: 1px solid var(--border-2); color: var(--muted); font-weight: 700;
  text-transform: uppercase; letter-spacing: .4px;
}
.shimmer { position: absolute; inset: 0; background: linear-gradient(100deg, #131a23 30%, #1b2530 50%, #131a23 70%); background-size: 200% 100%; animation: sh 1.1s linear infinite; }
@keyframes sh { from { background-position: 200% 0; } to { background-position: -60% 0; } }
.empty { color: var(--muted-2); font-size: 12.5px; padding: 14px 4px; text-align: center; }

/* ---------- detail ---------- */
.section + .section { border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; }
.section h3 { margin: 0 0 9px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px; color: var(--muted); font-weight: 700; }
.swatches { display: flex; flex-wrap: wrap; gap: 5px; }
.sw {
  width: 26px; height: 26px; border-radius: 6px; padding: 0; cursor: pointer;
  border: 1px solid rgba(255,255,255,.14); background: #0e1319; position: relative; overflow: hidden;
}
.sw canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.sw:hover { transform: translateY(-1px); }
.sw.on { box-shadow: 0 0 0 2px var(--accent), 0 0 0 3px rgba(0,0,0,.5); }
.var-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.var {
  display: flex; align-items: center; gap: 7px; padding: 5px 9px 5px 6px; cursor: pointer;
  border: 1px solid var(--border-2); background: var(--panel-2); border-radius: 9px; color: var(--text); font-size: 12px;
}
.var:hover { border-color: var(--accent); }
.var.on { border-color: var(--accent); background: rgba(240,180,41,.12); color: var(--accent-2); }
.var .sw { width: 24px; height: 24px; border-radius: 5px; }

.anim-list { display: flex; flex-direction: column; gap: 5px; }
.anim-row {
  display: flex; align-items: center; gap: 9px; padding: 5px 7px; border-radius: 8px; cursor: pointer;
  border: 1px solid transparent;
}
.anim-row:hover { background: var(--panel-2); }
.anim-row.on { background: linear-gradient(90deg, rgba(240,180,41,.18), rgba(240,180,41,.04)); border-color: rgba(240,180,41,.35); color: var(--accent-2); }
.anim-row .sw { width: 34px; height: 34px; flex: none; }
.anim-row .nm { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 600; text-transform: capitalize; }
.anim-row .meta { font-size: 10.5px; color: var(--muted-2); font-variant-numeric: tabular-nums; }

.info { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 12px; }
.info dt { color: var(--muted); }
.info dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
.tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.tag { border: 1px solid var(--border-2); border-radius: 999px; padding: 1px 7px; font-size: 10.5px; color: var(--muted); cursor: pointer; }
.tag:hover { color: var(--accent-2); border-color: var(--accent); }
.tag.on { background: var(--accent); color: var(--accent-ink); border-color: #b9840d; font-weight: 700; }

.credits { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
.credits .c { padding: 7px 0; border-top: 1px dashed var(--border); }
.credits .c:first-child { border-top: 0; }
.credits b { color: var(--text); font-weight: 600; }
.credits a { color: var(--blue); text-decoration: none; word-break: break-word; }
.credits a:hover { text-decoration: underline; }
.lic { display: inline-block; border: 1px solid var(--border-2); border-radius: 999px; padding: 0 6px; margin: 2px 3px 0 0; font-size: 10px; color: var(--muted); }

/* ---------- misc ---------- */
.toast {
  position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%) translateY(14px);
  background: #1d2635; border: 1px solid var(--border-2); color: var(--text);
  padding: 10px 16px; border-radius: 10px; box-shadow: var(--shadow);
  opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; z-index: 100;
  font-size: 13px; max-width: 80vw;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.err { border-color: #7a3a3a; background: #2a1a1c; }

.modal-back {
  position: fixed; inset: 0; background: rgba(5,8,12,.72); backdrop-filter: blur(3px);
  display: grid; place-items: center; z-index: 90; padding: 18px;
}
.modal-back[hidden] { display: none; }
.modal {
  background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--border-2);
  border-radius: 14px; box-shadow: var(--shadow); width: min(620px, 100%); max-height: 86vh; overflow: auto;
}
.modal.wide { width: min(820px, 100%); }
.modal-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 10px; position: sticky; top: 0; background: #141a23; z-index: 2; }
.modal-head h3 { margin: 0; font-size: 15px; }
.modal-body { padding: 16px; }
.modal-foot { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; position: sticky; bottom: 0; background: #12171f; }
.prog { height: 8px; background: var(--panel-3); border-radius: 99px; overflow: hidden; margin: 10px 0; }
.prog > i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .15s ease; }
.field + .field { margin-top: 12px; }
.field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); margin-bottom: 5px; font-weight: 700; }
.field .row2 { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.x { border: 0; background: transparent; color: var(--muted-2); cursor: pointer; font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 6px; }
.x:hover { color: #ff8a8a; background: rgba(255,90,90,.12); }
code.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; background: #0e1319; border: 1px solid var(--border); border-radius: 6px; padding: 2px 5px; word-break: break-all; }
.codebox {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; line-height: 1.5;
  background: #0b1017; border: 1px solid var(--border); border-radius: 9px; padding: 11px 12px;
  white-space: pre; overflow: auto; max-height: 300px; color: #cfe0f5; text-align: left; margin: 0;
}
.note { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
.kv { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-top: 1px dashed var(--border); font-size: 12px; }
.kv:first-child { border-top: 0; }
.kv b { font-weight: 600; }
`;
export default CSS;
