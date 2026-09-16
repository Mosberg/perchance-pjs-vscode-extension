# CATALOG — every file, every category, full source

Generator: `random-integer-plugin` · https://perchance.org/random-integer-plugin
Generated: 2026-09-16T17:25:11.058Z

Inventory (checksums: see `MANIFEST.json` for the full 64-char SHA-256 of each)

| Path | Bytes | SHA-256 (prefix) |
| --- | --- | --- |
| `internal-code/main.pjs` | 301 | `3867cf580bd0d261…` |
| `internal-code/index.html` | 3268 | `aac1a8d0ee1df5ae…` |
| `external-code/perchance-engine-491bf81418aa4b69.js` | 115369 | `491bf81418aa4b69…` |
| `third-party-assets/NOTE.md` | — | — |
| `project-resources/NOTE.md` | — | — |
| `build-config/NOTE.md` | — | — |
| `CATALOG.md` | — | — |
| `README.md` | — | — |
| `MANIFEST.json` | — | — |

---

# 1. INTERNAL CODE

Code written for this project. Two files, both full source below.

| Path | Bytes | SHA-256 (prefix) |
| --- | --- | --- |
| `internal-code/main.pjs` | 301 | `3867cf580bd0d261…` |
| `internal-code/index.html` | 3268 | `aac1a8d0ee1df5ae…` |

## `internal-code/main.pjs`

The entire Perchance DSL source of the plugin. `$output(from, to)` is what importers receive when they
write `randomInteger = {import:random-integer-plugin}`; `small` and `big` exist only to power the
documentation examples on the landing page.

```javascript
// not that `from` could be larger than `to` - and that's fine - the math works out.
$output(from, to) =>
	let start = from;
	let range = to-from; 
  return Math.round(start) + Math.round( Math.random()*range );

// these are just used for the examples in the HTML panel
small = {10-20}
big = {50-100}
```

## `internal-code/index.html`

The generator's body HTML — a documentation/landing page. Note the escaping: `\{` and `\[` render literal
braces/brackets inside the `<pre>` code samples, while the un-escaped `[s = small.selectOne]` inside
`#example1`/`#example2` are live templates re-evaluated by the engine's built-in `update()` helper.

```html
<h1>Random Integer Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:800px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p style="text-align:justify; margin-top:0;">This plugin allows you to generate a random integer (a whole number - i.e. not a decimal number) between two numbers that you provide. The built-in <code>\{1-10\}</code> type syntax is fine for most cases, but what if you wanted to choose a random number between two randomly chosen numbers? That's where this plugin would come in handy. To use this plugin, you'll first need to import it by putting this code in your Perchance code panel:</p>
	 
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
randomInteger = \{import:random-integer-plugin\}
</pre>
	
  <p>And here's a simple example of how to use it:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
output
	Between the numbers \[s = small.selectOne\] and \[b = big.selectOne\], there is the number \[randomInteger(s, b)\].
	
small = \{10-20\}
big = \{50-100\}
</pre>

	<p>and that would output this:</p>
	
	<p id="example1" style="padding:1rem; background:#efefef;">Between the numbers [s = small.selectOne] and [b = big.selectOne], there is the number [$output(s, b)].</p>
	<button onclick="update(example1)">randomize</button>
	
	<p>Note that the random number generated is "inclusive" of the two numbers you give it, so if you wrote <code>\[randomInteger(1,3)\]</code> you'd get either 1, 2 or 3. Also note that you can do all the normal stuff with this plugin, like assigning the resulting number to a variable like this:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
output
	The winning number is \[n = randomInteger(10, 20)\], which is \[50-n\] less than 50.
</pre>
	
	<p id="example2" style="padding:1rem; background:#efefef;">The winning number is [n = $output(10, 20)], which is [50-n] less than 50.</p>
	<button onclick="update(example2)">randomize</button>
	
	<p>And remember that you can name your plugin variable whatever you like, so if writing <code>randomInteger</code> a lot becomes tiresome, you can import it like this:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
rand = \{import:random-integer-plugin\}
</pre>
	
	<p>And now you can just write <code>\[rand(from, to)\]</code>.</p>
	
	<p><b>Notes:</b></p>
	<ul class="dot-list">
		<li><a href="https://perchance.org/random-integer-plugin-example#edit">Here's an example</a> of a generator that uses this plugin.</li>
		<li>The first number doesn't need to be smaller than the other, and you can input negative numbers too. It will always just randomly select a whole number between the two numbers you give it.</li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
	</ul>
</div>
<br><br><br>

<style>
	p { text-align:left; }
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding: 0 0.2em;
		white-space:nowrap;
	}
	ul.dot-list li {
	  margin-top:0.5em;	
	} 
	pre.custom {
		text-align:left;
		background: #333;
    color: white;
    padding: 1em;
    border-radius: 2px;
		tab-size: 2;
		-moz-tab-size: 2;
		-o-tab-size: 2;
		-webkit-tab-size: 2;
	}
</style>
```

---

# 2. EXTERNAL CODE (libraries, engines, dependencies)

| Path | Bytes | SHA-256 (prefix) |
| --- | --- | --- |
| `external-code/perchance-engine-491bf81418aa4b69.js` | 115369 | `491bf81418aa4b69…` |

## `external-code/perchance-engine-491bf81418aa4b69.js`

Source URL: https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
Byte-exact copy, downloaded through a CORS-free fetch. Minified platform bundle (115369 bytes), so it is shipped as-is rather than printed inline. It is the component that compiles `main.pjs` into JS, implements the list/selection API (`selectOne`, `evaluateItem`, `$output`, …) and evaluates the `[...]` templates in the HTML. It is also the source of the global `update(el)` helper used by the example buttons — measured live:

```javascript
// window.update, as provided by the engine (not by this project):
function (selectorOrEl) {
  try {
    PERCH.lastPerchanceErrorTime && Date.now() - PERCH.lastPerchanceErrorTime > 1e3*5 &&
      (!document.querySelector("#perchance-error-container") ||
       document.querySelector("#perchance-error-container").offsetHeight === 0) &&
      PERCH.clearPerchanceErrors();
  } catch (e) { console.error(e); }
  PERCH.updateTemplatedNodes(selectorOrEl);
}
```

Other URLs the page fetches at runtime (platform infrastructure, not project assets):

| URL | Kind | Purpose |
| --- | --- | --- |
| `https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js` | script | Perchance template engine (platform). |
| `https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495` | script | Cloudflare Web Analytics beacon injected by the hosting platform (not project code). |
| `https://perchance.org/api/clearCacheIfGeneratorOrImportsHaveBeenUpdated` | xhr | Platform cache-control endpoint; importedGeneratorNames= (empty) because the generator imports nothing. |
| `https://perchance.org/api/securityData` | xhr | Platform API. |

**The generator declares no `{import:...}` dependencies.** (`importedGeneratorNames=` is empty in the
platform's cache-control request.) So there is no `imports/` tree and nothing to vendor.

---

# 3. THIRD-PARTY ASSETS

**None.** Full note as shipped:

```markdown
# third-party assets

None.

This project references, loads and generates **no** third-party assets. There are no images, icons,
sound effects, music, video, fonts, 3D models, sprites, spritesheets, shaders, particle textures,
animation clips, or GIFs anywhere in `main.pjs` or `index.html`.

The font, colours and layout of the documentation page come from the platform's default stylesheet plus
the inline `<style>` block at the bottom of `internal-code/index.html` (system font stack, no webfont file).
```

---

# 4. PROJECT RESOURCES

**None.** Full note as shipped:

```markdown
# project resources

None.

All content is inline: the `small`/`big` demo lists and the `$output` function live in
`internal-code/main.pjs`; the documentation copy, examples and CSS live in `internal-code/index.html`.

There are no JSON data files, prefabs, templates, localisation strings, config files, save files or UI
resource bundles in this project.
```

---

# 5. BUILD / CONFIG FILES

**None.** Full note as shipped:

```markdown
# build / configuration files

None.

Perchance generators are hosted by the platform and rendered from `main.pjs` + `index.html` directly, so
this project has no build pipeline and no configuration files: no `package.json`, lockfile, bundler
(webpack/rollup/vite/esbuild), transpiler, TypeScript config, ESLint/Prettier config, `.env`, Dockerfile,
or CI workflow.

The only 'configuration' is the authored source itself. The generator declares no `$meta` block, so even
listing metadata is left to the platform defaults.
```

---

# 6. PACKAGE DOCS

## `README.md`

```markdown
# random-integer-plugin — complete source & asset package

Public generator: https://perchance.org/random-integer-plugin
Editable copy:   https://perchance.org/random-integer-plugin#edit
Packaged:        2026-09-16T17:25:03.685Z

## What this project is
A Perchance **plugin** generator. Its purpose is to export one function, `$output(from, to)`,
which returns a random whole number between `from` and `to` (inclusive, order-independent, negatives OK).
Because of the `$output` definition, importing this generator
(`randomInteger = {import:random-integer-plugin}`) yields that function rather than the root list.

The same generator also renders a documentation landing page with two live, re-rollable examples.

## Package contents, by category

### 1. internal code (written for this project)
| File | Bytes | Purpose |
| --- | --- | --- |
| `internal-code/main.pjs` | 301 | Perchance DSL: the plugin's `$output` function + demo lists `small`/`big`. |
| `internal-code/index.html` | 3268 | Generator body HTML: docs page, examples, styles. |

### 2. external code (libraries / engines this project depends on)
| File | Bytes | Purpose |
| --- | --- | --- |
| `external-code/perchance-engine-491bf81418aa4b69.js` | 115369 | The Perchance engine. Loads and evaluates `main.pjs` + `index.html`, implements the list/selection API, and provides the built-in `update(el)` helper the example buttons call. |

Source URL: https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
The hash in the filename is the platform's content hash — re-fetch that URL if you need a newer engine build.

### 3. third-party assets
**None.** No images, audio, video, fonts, 3D models, sprites, shaders, or animation files are used,
referenced, or generated by this project. See `third-party-assets/NOTE.md`.

### 4. project resources (data files, prefabs, templates, UI resources)
**None.** All strings, list content and styling live inline in `main.pjs` and `index.html`.
See `project-resources/NOTE.md`.

### 5. build / configuration files
**None.** Perchance generators are hosted and rendered directly by the platform: there is no bundler,
compiler, transpiler, package manager, lockfile, or CI configuration. See `build-config/NOTE.md`.

## Runtime dependency map (what the browser fetches)
| URL | Kind | Purpose |
| --- | --- | --- |
| `https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js` | script | Perchance template engine (platform). |
| `https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495` | script | Cloudflare Web Analytics beacon injected by the hosting platform (not project code). |
| `https://perchance.org/api/clearCacheIfGeneratorOrImportsHaveBeenUpdated` | xhr | Platform cache-control endpoint; importedGeneratorNames= (empty) because the generator imports nothing. |
| `https://perchance.org/api/securityData` | xhr | Platform API. |

Imports declared by the generator: **none** (`importedGeneratorNames=` is empty).

## How to use the plugin
In any other generator's code panel:
```
randomInteger = {import:random-integer-plugin}
```
then inside a list item or HTML text node:
```
output
  The winning number is [n = randomInteger(10, 20)], which is [50-n] less than 50.
```

## How the two files combine
1. The engine parses `main.pjs`; the `$output(from, to) =>` block compiles into a JS function, and `small`/`big`
   become list nodes. A top-level `$output` changes what importers receive.
2. The engine then renders `index.html`. Inside text nodes, square-bracket templates such as
   `[s = small.selectOne]` and `[$output(s, b)]` are evaluated. `\{` and `\[` escape braces/brackets so the
   documentation code blocks display literal Perchance syntax.
3. `<button onclick="update(example1)">` re-evaluates the templated nodes in place — `update` is provided by the
   engine (it calls `PERCH.lastPerchanceErrorTime` / `PERCH.updateTemplatedNodes`), not by this project.

## Rebuilding / restoring this project
There is nothing to compile. To restore it elsewhere:
1. Create a Perchance generator and set `generatorName` to `random-integer-plugin` (or any name you own).
2. Paste `internal-code/main.pjs` into the code panel and `internal-code/index.html` into the HTML panel.
3. Save. No imports to add, no assets to upload, no build command to run.

## Verifying the package
Each file's SHA-256 is recorded in `MANIFEST.json`:
```sh
sha256sum -c <(jq -r '.files[] | select(.sha256) | "\(.sha256)  \(.path)"' MANIFEST.json)
```
Expected, measured in the live preview on 2026-09-16:
- `main.pjs`  -> 3867cf580bd0d261e35c47e5aa696318587b5c7ebd4638c03e02749ee2f5a094
- `index.html` -> aac1a8d0ee1df5aeed1c0aceca58d5e0ac87298100d04459e0b297bef4ecb287
- engine     -> 491bf81418aa4b691be009ce503200880cba472d287541db1950c4b02cc221ad
```

## `MANIFEST.json`

```json
{
  "package": "random-integer-plugin",
  "generatorName": "random-integer-plugin",
  "publicUrl": "https://perchance.org/random-integer-plugin",
  "editorUrl": "https://perchance.org/random-integer-plugin#edit",
  "generatedAt": "2026-09-16T17:25:03.672Z",
  "runtime": "Perchance (perchance.org) — hosted generator, no local build step",
  "categories": {
    "internal-code": [
      "main.pjs",
      "index.html"
    ],
    "external-code": [
      "perchance-engine-491bf81418aa4b69.js"
    ],
    "third-party-assets": [],
    "project-resources": [],
    "build-config": []
  },
  "files": [
    {
      "path": "internal-code/main.pjs",
      "category": "internal-code",
      "bytes": 301,
      "sha256": "3867cf580bd0d261e35c47e5aa696318587b5c7ebd4638c03e02749ee2f5a094",
      "role": "Perchance DSL source: defines the plugin's $output(from,to) function and the demo lists (small, big).",
      "source": "authored in this generator"
    },
    {
      "path": "internal-code/index.html",
      "category": "internal-code",
      "bytes": 3268,
      "sha256": "aac1a8d0ee1df5aeed1c0aceca58d5e0ac87298100d04459e0b297bef4ecb287",
      "role": "Generator body HTML: documentation/landing content for the plugin, two live examples, and page styles.",
      "source": "authored in this generator"
    },
    {
      "path": "external-code/perchance-engine-491bf81418aa4b69.js",
      "category": "external-code",
      "bytes": 115369,
      "sha256": "491bf81418aa4b691be009ce503200880cba472d287541db1950c4b02cc221ad",
      "role": "The Perchance template engine that parses main.pjs + index.html, implements the list API, and provides the built-in update() helper used by the example buttons.",
      "source": "https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js"
    },
    {
      "path": "third-party-assets/NOTE.md",
      "category": "third-party-assets",
      "bytes": null,
      "sha256": null,
      "role": "Documents that the project uses no third-party assets.",
      "source": "n/a"
    },
    {
      "path": "project-resources/NOTE.md",
      "category": "project-resources",
      "bytes": null,
      "sha256": null,
      "role": "Documents that the project ships no binary/data resources.",
      "source": "n/a"
    },
    {
      "path": "build-config/NOTE.md",
      "category": "build-config",
      "bytes": null,
      "sha256": null,
      "role": "Documents that there is no build/config pipeline.",
      "source": "n/a"
    },
    {
      "path": "CATALOG.md",
      "category": "docs",
      "bytes": null,
      "sha256": null,
      "role": "Full source of every file, organized by category.",
      "source": "generated"
    },
    {
      "path": "README.md",
      "category": "docs",
      "bytes": null,
      "sha256": null,
      "role": "Package overview, dependency map, rebuild + verify instructions.",
      "source": "generated"
    },
    {
      "path": "MANIFEST.json",
      "category": "docs",
      "bytes": null,
      "sha256": null,
      "role": "Machine-readable inventory with byte sizes and SHA-256 checksums.",
      "source": "generated"
    }
  ],
  "runtimeNetworkDependencies": [
    {
      "url": "https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js",
      "kind": "script",
      "note": "Perchance template engine (platform)."
    },
    {
      "url": "https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495",
      "kind": "script",
      "note": "Cloudflare Web Analytics beacon injected by the hosting platform (not project code)."
    },
    {
      "url": "https://perchance.org/api/clearCacheIfGeneratorOrImportsHaveBeenUpdated",
      "kind": "xhr",
      "note": "Platform cache-control endpoint; importedGeneratorNames= (empty) because the generator imports nothing."
    },
    {
      "url": "https://perchance.org/api/securityData",
      "kind": "xhr",
      "note": "Platform API."
    }
  ],
  "notes": [
    "The generator declares zero {import:...} dependencies, so there is no imports/ tree and nothing to vendor.",
    "No images, audio, video, fonts, models, shaders, JSON data, or prefabs are referenced or generated anywhere in the project.",
    "Perchance generators are hosted and rendered server/edge-side; there is no bundler, compiler, package.json, or CI configuration in this project."
  ]
}
```
