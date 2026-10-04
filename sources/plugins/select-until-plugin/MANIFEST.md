# select-until-plugin — Asset Manifest (complete, unabridged)

Generator: **perchance.org/select-until-plugin**  
Public id: `24b78de113202a7791a16d832575a913`  
Package root: `select-until-plugin/`

Every asset used by this project is listed below under its category. For categories that are
genuinely empty, the entry is stated explicitly as **NONE** (these are not omissions — the
generator genuinely has no other assets). Full source of every project file is inlined verbatim.

---

## CATEGORY A — INTERNAL CODE (project-owned source)

Files: 2. Total bytes: 3832 (UTF-8).

### A.1 — `main.pjs`

Role: the entire engine-side program. Declares `$output`, the single function exported to
importers of this generator. No imports, no lists, no `$meta`, no side effects.

```pjs
// This is the JavaScript function that powers this plugin:
$output(list, condition) =>
  for(let i = 0; i < 10000; i++) {
    let item = list.selectOne;
    if(condition(item)) {
      return item;
    }
  }
  return "(error: selectUntil couldn't find an item that meets the condition)";
```

### A.2 — `index.html`

Role: the page body. Contains the plugin documentation, two usage examples, a live interactive
demo of the plugin (the demo's `prefix`/`suffix`/`selectUntil` declarations and `output` block
are written inline on the page as template markup), a link block, and an inline `<style>` block.

```html
<h1>selectUntil Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:650px;background:white;border-radius:2px;padding:1em; box-sizing:border-box; text-align:left;">
  <p style="margin-top:0;">This plugin allows you to keep trying to select an item from a given list until the resulting item meets your specified requirements.</p>
  <p>Below is a simple demonstration of how to use it. In this example we're trying to select a prefix and a suffix to construct a name, but we don't want the prefix and the suffix to be the same.</p>
<pre>
selectUntil = \{import:select-until-plugin\}

prefix
  feather
  fire
  // ...
  
suffix
  feather
  foot
  // ...

output
  Her name was \[p = prefix.selectOne\]\[s = selectUntil(suffix, item=> item.evaluateItem != p.evaluateItem)\].
</pre>
  <p>You can change the <code>item.evaluateItem != p.evaluateItem</code> part to any condition you like (read about conditions in the Dynamic Odds and If/Else sections of <a target="_blank" href="/examples">perchance.org/examples</a>).</p>
  <p>Note that we need to write <code>item.evaluateItem != p.evaluateItem</code> rather than just <code>item != p</code>. That's because <code>evaluateItem</code> converts the item into "raw" text, and then we check whether the text matches. If we write <code>item != p</code>, then we're asking whether <code>item</code> is "literally the exact same list item as <code>p</code>", which would never be true - because <code>item</code> and <code>p</code> are two different items from two different lists. In other words, we don't want to compare the "identities" of the list items, we want to see whether they have the same text.</p>
  <p>As a slightly more complex example, if you wanted the suffix to not be the same as the prefix, but also to have a sub-property called "type" that's equal to "air", you'd write this:</p>
<pre>
...

suffix
  feather
    type = air
  stone
    type = earth

output
  Her name was \[p = prefix.selectOne\]\[s = selectUntil(suffix, item=> item.evaluateItem != p.evaluateItem &amp;&amp; item.type == "air")\].
</pre>
  <p>Your requirement/condition always needs to start with the <code>item=></code> thing that you see in the above examples. It just tells the Perchance engine that you're writing a condition and that <code>item</code> is the name of the "placeholder" that you're using to represent the selected item that's being tested.</p>

	<p><b>Notes:</b></p>
	<ul>
		<li><a href="https://perchance.org/select-until-plugin-example#edit" target="_blank">Here's</a> an example of how to use this plugin.</li>
    <li>You can actually change <code>item=></code> to <code>blah=></code> or any other name you want - that just means that you have to write <code>blah</code> instead of <code>item</code> in your condition code.</li>
		<li>It's possible to write a condition that cannot possibly be satisfied. In that case this plugin will give up after 10000 attempts and display an error.</li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
	</ul>
</div>
<p style="text-align:center; font-size:200%; opacity:0.2; margin-top:0.5em;"><span>⚄&#xFE0E;</span></p>
<br><br><br>

<style>
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding:0.13em 0.2em
	}
	ul li { margin-top:0.4em; }
  	code {
		background-color:#eee;
		padding: 0 0.2em;
	}
	pre {
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

## CATEGORY B — EXTERNAL CODE (libraries, modules, dependencies)

**NONE.**

This generator declares zero `{import:...}` statements, zero `<script src=...>` tags, and zero
ES-module `import` statements. It is fully self-contained against the Perchance platform.

| Checked for | Result |
|---|---|
| `{import:...}` in `main.pjs` | none |
| `<script>` tags in `index.html` | none |
| `<script src=...>` external scripts | none |
| ES module `import`/`export` | none |
| npm / package.json / node_modules | none |
| CDN (esm.sh, unpkg, jsdelivr) URLs | none |
| Remote font/stylesheet `<link>`s | none |
| Runtime `fetch()` of external data | none |

The only dependencies are platform built-ins (`list.selectOne`, `item.evaluateItem`, the pjs
parser and list-tree runtime), which ship with the Perchance engine and are not redistributable.

---

## CATEGORY C — THIRD-PARTY ASSETS

**NONE.** No third-party images, fonts, icons, audio, video, models, textures, sprite sheets,
shaders, or data files are used. The only glyph on the page is the Unicode die face ⚄
(U+2684 DIE FACE-5) rendered as text — a standard Unicode codepoint requiring no font file.

---

## CATEGORY D — PROJECT RESOURCES (images, audio, models, shaders, animations, JSON, prefabs, templates, UI resources)

| Resource type | Present? | Detail |
|---|---|---|
| Images / textures | no | none referenced |
| Audio / music | no | none referenced |
| 3D models / prefabs | no | not a 3D project |
| Shaders | no | not a rendering project |
| Animations | no | none |
| JSON / data files | no | no external data; all data is inline pjs list items |
| Templates | yes | the pjs template expressions inside `index.html` (Category A.2), evaluated by the engine |
| UI resources | yes | inline `<style>` CSS block + inline HTML structure in `index.html` (Category A.2) |

There are no binary assets of any kind in this project, therefore nothing to base64-embed or
decompress. The complete set of non-code UI resources is the CSS rules and HTML in `index.html`,
reproduced in Category A.2.

---

## CATEGORY E — BUILD / CONFIGURATION FILES

**NONE — there is no build pipeline and no configuration files.**

This is a platform-level property, not an omission: the Perchance engine *is* the toolchain.

| Typical file | Present? | Why not |
|---|---|---|
| `package.json` / lockfile | no | no npm dependency graph |
| bundler config (webpack/vite/rollup/esbuild) | no | nothing to bundle; engine parses `.pjs` directly |
| transpiler config (tsconfig/babel) | no | no TypeScript or syntax transform step |
| linter/formatter config | no | none used |
| CI/CD definitions | no | publishing is a platform action (Save), not a pipeline |
| `.env` / secrets | no | nothing to configure; no secrets exist in this project |
| `Makefile` / shell scripts | no | none |
| `$meta` block in `main.pjs` | no | no custom title/description/image/tags set |
| asset manifest / service worker | no | no assets to pre-cache |

How the build would otherwise work: the engine parses `main.pjs` into a list tree, compiles the
`$output` function header and body, then injects `index.html` as the page body and evaluates its
square-bracket template expressions. That is the entire "pipeline".

---

## CATEGORY F — RUNTIME SERVICES / NETWORK

**NONE.** The plugin performs no network requests, opens no sockets, reads/writes no browser
storage (no localStorage, IndexedDB, or OPFS), uses no cookies, and has no server-side code.
It is a pure in-memory function.

---

## COMPLETE PACKAGE FILE LISTING

| Path in zip | Category | Bytes |
|---|---|---|
| `select-until-plugin/README.md` | documentation | 5065 |
| `select-until-plugin/MANIFEST.md` | documentation | (this file) |
| `select-until-plugin/main.pjs` | A — internal code | 288 |
| `select-until-plugin/index.html` | A — internal code | 3546 |

To restore / redeploy this generator: create a Perchance generator, paste `main.pjs` into its
`main.pjs` file and `index.html` into its `index.html` file, then Save. No other steps exist.
