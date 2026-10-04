export const UI_CSS = `
  :host {
    --bg: #0d1117;
    --bg2: #141b24;
    --bg3: #1b2530;
    --line: #26313d;
    --line2: #33404f;
    --fg: #dbe4ee;
    --fg2: #8ea0b4;
    --fg3: #63758a;
    --accent: #4ea3ff;
    --accent2: #2b7fd4;
    --gold: #ffca45;
    --danger: #ff6b6b;
    --ok: #4ade9a;
  }
  :host {
    display: block;
    position: relative;
    height: 100%;
    min-height: 520px;
    text-align: left;
    background: var(--bg);
    color: var(--fg);
    font: 13px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
  }
  :host(.forge-fullscreen) {
    position: fixed;
    inset: 0;
    height: 100vh;
    min-height: 0;
    z-index: 2147483000;
  }
  *, *::before, *::after { box-sizing: border-box; }
  button, input, select, textarea { font: inherit; color: var(--fg); }
  button {
    background: var(--bg3);
    border: 1px solid var(--line2);
    border-radius: 7px;
    padding: 5px 10px;
    cursor: pointer;
    white-space: nowrap;
    transition: background .12s, border-color .12s, transform .06s;
  }
  button:hover { background: #24303d; border-color: #46586b; }
  button:active { transform: translateY(1px); }
  button.primary { background: var(--accent2); border-color: var(--accent); color: #fff; font-weight: 600; }
  button.primary:hover { background: #3489dd; }
  button.toggle.on { background: #23405c; border-color: #3d6f9e; color: #cfe6ff; }
  button:disabled { opacity: .42; cursor: default; }
  select, input[type=number], input[type=text], textarea {
    background: var(--bg2); border: 1px solid var(--line2); border-radius: 7px; padding: 4px 7px;
  }
  textarea { resize: vertical; width: 100%; min-height: 48px; }
  input[type=range] { width: 100%; accent-color: var(--accent); }

  #app {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 248px 1fr 284px;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: "top top top" "left stage right" "bottom bottom bottom";
  }
  #topbar {
    grid-area: top;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px; background: var(--bg2); border-bottom: 1px solid var(--line);
    overflow-x: auto;
  }
  .brand { font-weight: 700; letter-spacing: .3px; margin-right: 8px; white-space: nowrap; }
  .brand b { color: var(--accent); }
  .spacer { flex: 1 1 auto; }
  .sep { width: 1px; align-self: stretch; background: var(--line); margin: 2px 4px; }

  .panel { background: var(--bg2); overflow-y: auto; overflow-x: hidden; }
  #left { grid-area: left; border-right: 1px solid var(--line); }
  #right { grid-area: right; border-left: 1px solid var(--line); }
  .panel section { padding: 10px; border-bottom: 1px solid var(--line); }
  .panel h3 {
    margin: 0 0 7px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px;
    color: var(--fg2); font-weight: 700;
  }
  .toolRail { display: flex; flex-wrap: wrap; gap: 4px; }
  .toolRail button { padding: 5px 7px; flex: 1 1 auto; }
  .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
  .tabs button { flex: 1; min-width: 0; padding: 5px 4px; font-size: 11.5px; }
  .tabs button.on { background: #23405c; border-color: #3d6f9e; color: #cfe6ff; }

  .swatchGrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
  .swatch {
    position: relative; aspect-ratio: 1; border: 1px solid var(--line2); border-radius: 5px;
    background-size: 100% 100%; image-rendering: pixelated; cursor: pointer; padding: 0;
  }
  .swatch.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(255,202,69,.35); }

  .catRow { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 8px; }
  .catRow button { padding: 3px 6px; font-size: 11px; }
  .propGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .propCell {
    position: relative; aspect-ratio: 1; background: #0a0e13; border: 1px solid var(--line2);
    border-radius: 5px; cursor: pointer; overflow: hidden; padding: 0;
  }
  .propCell.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(255,202,69,.35); }
  .propCell canvas { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; display: block; }
  .catNote { color: var(--fg3); font-size: 11px; margin-bottom: 6px; }
  .propSearch {
    width: 100%; box-sizing: border-box; margin-bottom: 7px; padding: 5px 8px;
    background: #0a0e13; border: 1px solid var(--line2); border-radius: 6px; color: var(--fg1, #e8ecf3); font-size: 12px;
  }
  .propSearch:focus { outline: none; border-color: var(--accent); }
  .propCount { color: var(--fg3); font-size: 10.5px; margin-top: 7px; text-align: right; }

  .prefabList { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .prefabCard {
    position: relative; background: #0a0e13; border: 1px solid var(--line2); border-radius: 7px;
    cursor: pointer; padding: 5px 5px 3px; text-align: center; overflow: hidden;
  }
  .prefabCard.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(255,202,69,.35); }
  .prefabCard canvas { display: block; width: 100%; height: 60px; object-fit: contain; image-rendering: pixelated; }
  .prefabCard span { display: block; font-size: 10.5px; color: var(--fg2); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .labelList { display: flex; flex-direction: column; gap: 4px; max-height: 320px; overflow-y: auto; }
  .labelRow { display: flex; align-items: center; gap: 4px; }
  .labelRow input {
    flex: 1 1 auto; min-width: 0; background: #0a0e13; border: 1px solid var(--line2);
    border-radius: 6px; padding: 4px 7px; font-size: 12px;
  }
  .labelRow input:focus { outline: none; border-color: var(--accent); }
  .labelRow button { padding: 5px 9px; font-size: 12px; line-height: 1; flex: 0 0 auto; min-width: 30px; }
  .labelRow .dot { flex: 0 0 8px; height: 8px; border-radius: 50%; background: #7fd0ff; box-shadow: 0 0 0 1px #0a0e13; }
  .labelRow.on input { border-color: var(--gold); color: #ffe9a8; }
  .labelRow.on .dot { background: var(--gold); }

  #stage { grid-area: stage; position: relative; overflow: hidden; background: #080b0f; }
  #view { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; }
  #view.panning { cursor: grabbing; }
  #view.picking { cursor: copy; }
  #view.erasing { cursor: cell; }
  #view.cloning { cursor: copy; }
  #view.labelling { cursor: text; }
  #hint {
    position: absolute; left: 10px; bottom: 10px; pointer-events: none;
    background: rgba(10,14,19,.88); border: 1px solid var(--line2); border-radius: 7px;
    padding: 5px 9px; color: #b9c9da; font-size: 11.5px; max-width: 78%;
  }
  #busy {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(8,11,15,.62); backdrop-filter: blur(1px); z-index: 5;
  }
  #busy[hidden] { display: none; }
  #busy .box { background: var(--bg2); border: 1px solid var(--line2); border-radius: 12px; padding: 16px 22px; text-align: center; }
  .spinner {
    width: 26px; height: 26px; margin: 0 auto 9px;
    border: 3px solid #2c3b4b; border-top-color: var(--accent); border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  #statusbar {
    grid-area: bottom; display: flex; align-items: center; gap: 12px;
    padding: 5px 10px; background: var(--bg2); border-top: 1px solid var(--line);
    color: var(--fg2); font-size: 11px; font-variant-numeric: tabular-nums; flex-wrap: wrap;
  }
  #statusbar b { color: var(--fg); font-weight: 600; }
  #miniOverlay {
    position: absolute; right: 10px; bottom: 10px; width: 186px; z-index: 3;
    background: rgba(10,14,19,.9); border: 1px solid var(--line2); border-radius: 9px;
    padding: 7px; box-shadow: 0 6px 20px rgba(0,0,0,.45); backdrop-filter: blur(2px);
  }
  #minimap { display: block; width: 100%; image-rendering: pixelated; border: 1px solid var(--line2); border-radius: 6px; background: #0a0e13; cursor: crosshair; }
  #miniWrap { position: relative; }
  #miniBox { position: absolute; pointer-events: none; border: 1px solid rgba(255, 202, 69, 0.9); box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(0, 0, 0, 0.35); border-radius: 3px; }
  #miniOverlay .aside { text-align: center; margin-top: 5px; line-height: 1.4; }
  @media (max-width: 900px) { #miniOverlay { width: 124px; right: 8px; bottom: 8px; } #miniOverlay .aside { font-size: 9.5px; line-height: 1.3; } }

  .row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .row > label { flex: 0 0 74px; color: var(--fg2); font-size: 11px; }
  .row > .val { flex: 0 0 34px; text-align: right; color: var(--fg2); font-size: 11px; font-variant-numeric: tabular-nums; }
  .slider { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }
  .slider > span { flex: 0 0 78px; color: var(--fg2); font-size: 10.5px; }
  .slider > i { flex: 0 0 26px; text-align: right; color: var(--fg3); font-size: 10.5px; font-style: normal; font-variant-numeric: tabular-nums; }

  .toast {
    position: fixed; left: 50%; bottom: 46px; transform: translateX(-50%);
    background: #1d2a38; border: 1px solid var(--line2); border-radius: 9px;
    padding: 8px 14px; z-index: 40; box-shadow: 0 8px 26px rgba(0,0,0,.5); max-width: 80vw;
  }
  .toast.err { border-color: #7a3b3b; background: #33191b; color: #ffd9d9; }

  .mini-spin {
    display: inline-block; width: 11px; height: 11px; margin-right: 6px;
    border: 2px solid #2c3b4b; border-top-color: var(--accent); border-radius: 50%;
    animation: spin .7s linear infinite; vertical-align: -1px;
  }
  #aiOut { white-space: pre-wrap; word-break: break-word; }
  #loadList .dlgRow { justify-content: space-between; border-bottom: 1px solid var(--line); padding: 7px 0; }
  #loadList .dlgRow:last-child { border-bottom: 0; }

  dialog {
    background: var(--bg2); color: var(--fg); border: 1px solid var(--line2); border-radius: 12px;
    padding: 16px; max-width: 460px; width: 92vw;
  }
  dialog::backdrop { background: rgba(5,8,11,.66); }
  dialog h3 { margin-top: 0; }
  .dlgRow { display: flex; gap: 6px; margin-top: 10px; justify-content: flex-end; }
  .aside { color: var(--fg3); font-size: 11px; }
  .helpGrid { display: grid; grid-template-columns: auto 1fr; gap: 5px 12px; align-items: center; font-size: 12px; }
  .helpGrid b { grid-column: 1 / -1; color: var(--gold); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin-top: 8px; }
  .helpGrid b:first-child { margin-top: 0; }
  .helpGrid .keys { display: flex; gap: 3px; }
  .helpGrid span { color: var(--fg2); }
  kbd {
    background: #0a0e13; border: 1px solid var(--line2); border-bottom-width: 2px; border-radius: 4px;
    padding: 1px 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #cfe6ff;
    white-space: nowrap;
  }

  #scrim { position: absolute; inset: 0; z-index: 29; display: none; background: rgba(4,7,10,.5); }

  @media (max-width: 900px) {
    #app {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
      grid-template-areas: "top" "stage" "bottom";
    }
    #topbar {
      flex-wrap: wrap; overflow-x: visible; row-gap: 5px; padding: 6px 8px;
      max-height: 34vh; overflow-y: auto;
    }
    .brand { order: -3; }
    #dpad { order: -2; }
    #topbar .sep { display: none; }
    #topbar button, #topbar select { padding: 4px 8px; font-size: 12px; }
    #left, #right {
      position: absolute; top: 0; bottom: 0; width: min(84vw, 296px); z-index: 30;
      transition: transform .2s; box-shadow: 0 0 30px rgba(0,0,0,.6);
    }
    #left { left: 0; transform: translateX(-102%); }
    #right { right: 0; transform: translateX(102%); }
    #left.open, #right.open { transform: none; }
    #dpad { display: flex !important; }
    #left.open ~ #scrim, #right.open ~ #scrim { display: block; }
    .labelRow input { padding: 7px 8px; font-size: 13px; }
    .labelRow button { min-width: 38px; min-height: 36px; font-size: 14px; }
  }
`;

export const UI_HTML = `
<div id="app">
  <header id="topbar">
    <span class="brand">LPC <b>Map Forge</b></span>
    <button id="genBtn" class="primary" title="Generate a fresh world from the settings on the right">Generate</button>
    <button id="undoBtn" title="Undo (Ctrl+Z)">Undo</button>
    <button id="redoBtn" title="Redo (Ctrl+Shift+Z)">Redo</button>
    <span class="sep"></span>
    <button id="saveBtn" title="Save this map to your browser">Save</button>
    <button id="loadBtn" title="Load a saved map">Load</button>
    <button id="pngBtn" title="Download the full map as an image">Export</button>
    <select id="pngFormat" title="Image format" style="width:auto">
      <option value="image/png">PNG</option>
      <option value="image/webp">WebP</option>
      <option value="image/jpeg">JPEG</option>
    </select>
    <select id="pngScale" title="Image output scale" style="width:auto">
      <option value="auto">auto</option>
      <option value="1">1x</option>
      <option value="2">2x</option>
      <option value="3">3x</option>
      <option value="4">4x</option>
    </select>
    <button id="jsonBtn" title="Download the map data as JSON">JSON</button>
    <button id="tmxBtn" title="Export a Tiled (.tmx) map: terrain tile layers plus props as objects">TMX</button>
    <button id="tilesBtn" title="Export a bare tile-id grid as JSON (tiles[i] indexes the terrain list, which is included) - for engines that prefer their own map format">Tiles</button>
    <button id="importBtn" title="Load map data from a JSON file">Import</button>
    <input type="file" id="importFile" accept=".json,application/json" hidden>
    <span class="sep"></span>
    <button id="fitBtn" title="Fit the map in the view (F)">Fit</button>
    <button id="gridBtn" class="toggle on" title="Show tile grid (G)">Grid</button>
    <button id="propBtn" class="toggle on" title="Show props (P)">Props</button>
    <button id="shadowBtn" class="toggle on" title="Show prop shadows">Shadows</button>
    <select id="fieldSel" title="Overlay a raw generation field (debug/analysis view)" style="width:auto">
      <option value="">Map</option>
      <option value="elev">Elevation</option>
      <option value="water">Water</option>
      <option value="depth">Water depth</option>
      <option value="moist">Moisture</option>
      <option value="temp">Temperature</option>
      <option value="rock">Rockiness</option>
      <option value="flow">River flow</option>
      <option value="distWater">Distance to water</option>
    </select>
    <span class="spacer"></span>
    <button id="helpBtn" title="Keyboard shortcuts and tips">?</button>
    <span id="dpad" style="display:none; gap:4px">
      <button id="leftOpen">Palette</button>
      <button id="rightOpen">Settings</button>
    </span>
    <button id="closeBtn" hidden>Close</button>
  </header>

  <aside id="left" class="panel">
    <section>
      <h3>Tools</h3>
      <div class="toolRail" id="toolRail">
        <button data-tool="brush" class="on" title="Paint terrain (B)">Paint</button>
        <button data-tool="rect" title="Rectangle fill (R)">Rect</button>
        <button data-tool="fill" title="Flood fill (F)">Fill</button>
        <button data-tool="line" title="Line (L)">Line</button>
        <button data-tool="pick" title="Eyedropper (I)">Pick</button>
        <button data-tool="prop" title="Place props (T)">Prop</button>
        <button data-tool="select" title="Select / move / delete props (V)">Select</button>
        <button data-tool="erase" title="Erase props under the brush - drag to sweep (X)">Erase</button>
        <button data-tool="stamp" title="Stamp a prefab (building, farm, harbour...) - Shift-click removes (K)">Stamp</button>
        <button data-tool="clone" title="Copy a rectangle of terrain + props, then click to paste it (C)">Clone</button>
        <button data-tool="label" title="Add or move a named region label (M)">Label</button>
        <button data-tool="pan" title="Pan (H or middle drag)">Pan</button>
      </div>
      <div style="margin-top:8px">
        <div class="slider"><span>Brush size</span><input type="range" id="brushSize" min="1" max="30" value="4"><i id="brushSizeVal">4</i></div>
        <div class="slider"><span>Prop size</span><input type="range" id="propScale" min="50" max="200" value="100"><i id="propScaleVal">100%</i></div>
        <div class="row">
          <label>Shape</label>
          <button id="shapeSquare" class="toggle on">Square</button>
          <button id="shapeRound" class="toggle">Round</button>
        </div>
        <div class="row">
          <label>Randomise</label>
          <button id="scatterBtn" title="Scatter the selected prop naturally over the map">Scatter props</button>
        </div>
        <div class="row">
          <label>Clear props</label>
          <button id="clearPropsBtn" title="Remove every prop from the map">Remove all</button>
        </div>
      </div>
    </section>
    <section>
      <div class="tabs">
        <button class="tab on" data-tab="terrain">Terrain</button>
        <button class="tab" data-tab="props">Props</button>
        <button class="tab" data-tab="prefabs">Stamps</button>
        <button class="tab" data-tab="labels">Labels</button>
      </div>
      <div id="terrainPane">
        <div id="terrainPalette" class="swatchGrid"></div>
        <div class="catNote" id="terrainNote" style="margin-top:7px"></div>
      </div>
      <div id="propPane" hidden>
        <input type="search" id="propSearch" class="propSearch" placeholder="Search props (name, kind, palette)..." autocomplete="off">
        <div class="catRow" id="propCats"></div>
        <div class="propGrid" id="propPalette"></div>
        <div class="propCount" id="propCount"></div>
      </div>
      <div id="prefabPane" hidden>
        <div class="catNote" id="prefabNote" style="margin-bottom:7px">Pick a stamp, then click the map to drop it. Shift-click removes everything inside its footprint.</div>
        <div class="prefabList" id="prefabList"></div>
      </div>
      <div id="labelPane" hidden>
        <div class="catNote" style="margin-bottom:7px">Type a name, then click the map to drop a label. Drag a label to move it. Labels are baked into the exported PNG.</div>
        <div class="row">
          <input type="text" id="labelName" style="flex:1; min-width:0" placeholder="Region name" maxlength="40">
          <button id="labelAddBtn" title="Arm the Label tool so the next map click places this name">Place</button>
        </div>
        <div class="labelList" id="labelList"></div>
        <div class="propCount" id="labelCount"></div>
      </div>
    </section>
  </aside>

  <main id="stage">
    <canvas id="view"></canvas>
    <div id="hint">Left-drag to paint &middot; middle-drag or space to pan &middot; wheel to zoom</div>
    <div id="miniOverlay">
      <div id="miniWrap">
        <canvas id="minimap" title="Click or drag to move the view"></canvas>
        <div id="miniBox"></div>
      </div>
      <div class="aside" id="mapStats"></div>
    </div>
    <div id="busy" hidden><div class="box"><div class="spinner"></div><span id="busyText">Generating world</span></div></div>
  </main>

  <aside id="right" class="panel">
    <section>
      <h3>World settings</h3>
      <div class="row">
        <label>Theme</label>
        <select id="themeSel" style="flex:1"></select>
      </div>
      <div class="row">
        <label>Seed</label>
        <input type="number" id="seedInput" style="flex:1; min-width:0">
        <button id="randSeedBtn" title="Random seed">Roll</button>
      </div>
      <div class="row">
        <label>Size</label>
        <select id="sizeSel" style="flex:1"></select>
      </div>
      <div class="row">
        <label>Water</label>
        <select id="waterSel" style="flex:1">
          <option value="auto">Theme default</option>
          <option value="blue">Clear blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
        </select>
      </div>
      <div id="paramSliders" style="margin-top:8px"></div>
      <div class="row" style="margin-top:4px">
        <button id="resetParamsBtn" style="flex:1" title="Reset every slider to this theme's defaults">Reset theme</button>
        <button id="randomizeBtn" style="flex:1" title="Randomise every world setting and regenerate">Randomize all</button>
      </div>
      <div class="row">
        <button id="copySettingsBtn" style="flex:1" title="Copy the current world settings to the clipboard as JSON">Copy settings</button>
        <button id="pasteSettingsBtn" style="flex:1" title="Apply world settings from JSON on the clipboard">Paste settings</button>
      </div>
    </section>
    <section id="aiSection">
      <h3>AI world designer</h3>
      <textarea id="aiPrompt" placeholder="e.g. a rainy temperate island with tall snowy mountains, dense pine forests in the north and sandy beaches in the south"></textarea>
      <div class="row" style="margin-top:6px">
        <button id="aiGenBtn" class="primary" style="flex:1">Generate from description</button>
      </div>
      <div class="row">
        <button id="aiNameBtn" style="flex:1" title="Invent a name and a short legend for this map">Name this map</button>
      </div>
      <div id="aiOut" class="aside" style="margin-top:6px; min-height:16px"></div>
    </section>
    <section>
      <h3>Map info</h3>
      <div class="row"><label>Name</label><input type="text" id="mapName" style="flex:1" placeholder="Unnamed map"></div>
      <div id="legendBox" class="aside"></div>
    </section>
  </aside>

  <footer id="statusbar">
    <span>Tile <b id="stTile">-</b></span>
    <span>Terrain <b id="stTerrain">-</b></span>
    <span>Props <b id="stProps">0</b></span>
    <span>Zoom <b id="stZoom">100%</b></span>
    <span>Size <b id="stSize">-</b></span>
    <span id="stDirty" style="color:var(--gold)"></span>
  </footer>
  <div id="scrim"></div>
</div>

<dialog id="saveDlg">
  <h3>Save map</h3>
  <div class="row">
    <label>Name</label>
    <input type="text" id="saveName" style="flex:1">
  </div>
  <div class="aside">Saved maps live in this browser and survive reloads. Saving over an existing name replaces it.</div>
  <div class="dlgRow">
    <button id="saveCancel">Cancel</button>
    <button id="saveOk" class="primary">Save</button>
  </div>
</dialog>

<dialog id="loadDlg">
  <h3>Load map</h3>
  <div id="loadList"></div>
  <div class="dlgRow">
    <button id="loadCancel">Close</button>
  </div>
</dialog>

<dialog id="helpDlg">
  <h3>Keyboard shortcuts &amp; tips</h3>
  <div class="helpGrid">
    <b>Tools</b>
    <span class="keys"><kbd>B</kbd></span><span>Paint terrain</span>
    <span class="keys"><kbd>R</kbd></span><span>Rectangle fill</span>
    <span class="keys"><kbd>F</kbd></span><span>Flood fill</span>
    <span class="keys"><kbd>L</kbd></span><span>Line</span>
    <span class="keys"><kbd>I</kbd></span><span>Eyedropper (pick terrain)</span>
    <span class="keys"><kbd>T</kbd></span><span>Place prop</span>
    <span class="keys"><kbd>V</kbd></span><span>Select / move / delete prop</span>
    <span class="keys"><kbd>X</kbd></span><span>Erase props (drag to sweep)</span>
    <span class="keys"><kbd>K</kbd></span><span>Stamp a prefab</span>
    <span class="keys"><kbd>C</kbd></span><span>Clone a region of the map</span>
    <span class="keys"><kbd>M</kbd></span><span>Place / move a region label</span>
    <span class="keys"><kbd>H</kbd></span><span>Pan</span>
    <b>View</b>
    <span class="keys"><kbd>Space</kbd></span><span>Hold to pan</span>
    <span class="keys"><kbd>Wheel</kbd></span><span>Zoom at cursor</span>
    <span class="keys"><kbd>0</kbd></span><span>Fit map to view</span>
    <span class="keys"><kbd>G</kbd></span><span>Toggle tile grid</span>
    <span class="keys"><kbd>P</kbd></span><span>Toggle props</span>
    <b>Editing</b>
    <span class="keys"><kbd>[</kbd><kbd>]</kbd></span><span>Brush size down / up</span>
    <span class="keys"><kbd>Ctrl</kbd><kbd>Z</kbd></span><span>Undo</span>
    <span class="keys"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>Z</kbd></span><span>Redo</span>
    <span class="keys"><kbd>E</kbd></span><span>Flip the selected prop</span>
    <span class="keys"><kbd>Del</kbd></span><span>Delete the selected prop</span>
    <span class="keys"><kbd>Esc</kbd></span><span>Deselect</span>
  </div>
  <div class="aside">Tip: with the Erase tool the Brush-size slider sets the erase radius, and holding Shift scrubs a single small area. Prop search matches the sprite name, its kind and its palette. With the Prop tool, right-drag (or Shift-click) erases the prop under the cursor. The Stamp tool drops a whole prefab - house plot, farm, market, harbour, graveyard - in one click; the Prop-size slider scales it and Shift-click clears its footprint. The Clone tool copies a rectangle of terrain <em>and</em> props: drag a box to copy it, then click to paste (click repeatedly to stamp it around; the ghost follows the cursor). The Label tool drops named region markers that are drawn on the map, the minimap and the exported PNG.</div>
  <div class="dlgRow">
    <button id="helpClose" class="primary">Got it</button>
  </div>
</dialog>
`;
