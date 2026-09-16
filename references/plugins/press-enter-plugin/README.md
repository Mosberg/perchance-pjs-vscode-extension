# press-enter-plugin — Complete Asset Package

Everything used by, referenced by, or required to run this generator, organised by category.
There are **no binary/media assets and no third-party dependencies** — this project is pure code.
If a category is empty it is stated explicitly below rather than omitted.

## Package identity

| Field | Value |
|---|---|
| Generator name | `press-enter-plugin` |
| Public page (user-facing) | https://perchance.org/press-enter-plugin |
| Public ID (runtime subdomain) | `49af6bb22bcbb186d491a35dad8682e7` |
| Runtime iframe origin | https://49af6bb22bcbb186d491a35dad8682e7.perchance.org/press-enter-plugin |
| Purpose | A Perchance plugin: press the Enter/Return key to trigger randomization (`window.update()`). |
| Licence / ownership | Authored by the generator owner. The reference copy of `tap-anywhere-plugin` under `external-code/` is third-party and included for reference only. |

## 1. Internal code (first-party, ships with the generator)

These two files *are* the generator. Perchance has no compilation step: the server renders
`main.pjs` (lists/pjs panel) and `index.html` (HTML panel) together on every page load.

| File | Bytes | SHA-256 |
|---|---|---|
| `internal-code/main.pjs` | 234 | `5cf6d69de03d828e7adb6f367279b97d7d9e60d3f8681aa5273b25e5a8660a70` |
| `internal-code/index.html` | 824 | `1b28e6fea96c44b0b63d2d81b344b2e37ff19b25b3a15ec1aea643391c4b29ce` |

### internal-code/main.pjs (complete)

```pjs
$output 
	<script>if(window.alreadyAddedEnterTriggerListener \=\=\= undefined) \{ window.addEventListener('keydown', function(e)\{ if(e.which \=\=\= 13) window.update(); \}); window.alreadyAddedEnterTriggerListener \= true;\}</script>```

### internal-code/index.html (complete)

```html
<h1>Press-Enter Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:690px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p>Put this anywhere in your HTML panel (bottom-right panel):</p>
	<p><code>\{import:press-enter-plugin\}</code></p>
	<br>
	<p>Now you can press the enter/return key to trigger randomization.</p>
	<br>
	<p><b>Notes:</b></p>
	<ul>
		<li>Make sure you still have a button for mobile/tablet users to press.</li>
		<li>You also might like to check out the <a href="https://perchance.org/tap-anywhere-plugin">tap-anywhere-plugin</a>.</li>
		<li>More plugins at <a href="/plugins">perchance.org/plugins</a></li>
	</ul>
</div>
<br><br><br>

<style>
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding:0.1em 0.2em
	}
	ul li { margin-top:0.4em; }
</style>```

## 2. External code (dependencies, libraries, modules, tools)

**None.** `main.pjs` declares zero `{import:...}` statements. The generator ships no third-party
scripts, libraries, frameworks, CDNs, npm packages, fonts, or toolchain. It is fully self-contained.

### Referenced-but-not-bundled (documentation hyperlinks only)

| Resource | URL | Status |
|---|---|---|
| tap-anywhere-plugin | https://perchance.org/tap-anywhere-plugin | Referenced in the plugin's "Notes" only — **not** a dependency. Source copied to `external-code/tap-anywhere-plugin/` for reference. |
| Perchance plugin directory | https://perchance.org/plugins | Referenced in the plugin's "Notes" only. |
| Perchance engine / platform | https://perchance.org | Required host runtime (proprietary, platform-provided, not redistributable). |

## 3. Project resources (media, data, shaders, prefabs, UI resources)

**None.** See `assets/ASSETS.md`. There are no images, sprites, textures, audio, video, 3D models,
shaders, animations, particle definitions, JSON data files, prefabs, templates, or prebuilt UI
resources. The only presentational resource in the entire project is an inline `<style>` block
inside `index.html` (page background + `code`/`li` styling for the plugin's documentation page).

## 4. Build / config files

**None.** See `build-config/BUILD.md`. Perchance generators are rendered directly from
`main.pjs` + `index.html`; there is no bundler, transpiler, package manager, lockfile, or CI config.

## 5. Runtime contract (how it works)

- `main.pjs` defines a top-level `$output` list whose only item is a `<script>` element.
- Importing the plugin injects that script into the host generator's page.
- The script runs once (guarded by `window.alreadyAddedEnterTriggerListener`) and registers a
  `keydown` listener on `window`.
- On key code 13 (Enter/Return) it calls `window.update()`, which is the host generator's
  randomization/refresh function.
- Requires the host generator to expose a global `window.update()`; a visible button should still
  be provided for mobile/tablet users.

## 6. Package layout

```
press-enter-plugin/
├── README.md                     <- this manifest
├── MANIFEST.json                 <- machine-readable file list + hashes
├── internal-code/                <- category 1: first-party code
│   ├── main.pjs
│   └── index.html
├── external-code/                <- category 2: external/referenced code (none required)
│   └── tap-anywhere-plugin/
│       ├── main.pjs
│       ├── index.html
│       └── SOURCE.txt
├── assets/                       <- category 3: media/data resources (none)
│   └── ASSETS.md
└── build-config/                 <- category 4: build & config (none)
    └── BUILD.md
```
