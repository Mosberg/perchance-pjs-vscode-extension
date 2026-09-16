# numerals-to-ordinals-plugin — complete source package

Generator: https://perchance.org/numerals-to-ordinals-plugin
Runtime: Perchance (perchance.org) — engine + Perchance JS (pjs)

## Categories in this package

| Category | Folder | Count |
|---|---|---|
| Internal code (this generator's own source) | internal-code/ | 2 |
| External code (npm/CDN/module libs) | external-code/ | 0 |
| Third-party assets | third-party-assets/ | 0 |
| Project resources (images/audio/models/shaders/animations/JSON) | project-resources/ | 0 |
| Build / config files | build-config/ | 0 |
| Workspace configuration (agent/harness instructions) | workspace-config/ | 1 |

Empty categories are recorded here rather than as empty folders: this project has
no external dependencies, no binary assets, and no build pipeline. The entire
implementation is the two text files below.

## Full code

### internal-code/main.pjs
```js
$output(n) => 
  if(n == "") return "";
	n = Number(n);
	if(isNaN(n)) return "(error: you passed a non-number to the numerals-to-ordinals plugin)";
  if(n == 0) return "zeroth";
	let s = n+"";
	s1 = s.slice(-1);
	s2 = s.slice(-2);
	if(s2 === "11") return n+"th";
	if(s2 === "12") return n+"th";
	if(s2 === "13") return n+"th";
	if(s1 === "1") return n+"st";
	if(s1 === "2") return n+"nd";
	if(s1 === "3") return n+"rd";
  return n+"th";
```

### internal-code/index.html
```html
<h1>Numerals to Ordinals Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:750px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p>Put this in your Perchance code panel:</p>
	<p><code>numToOrd = \{import:numerals-to-ordinals-plugin\}</code></p>
	<br>
	<p>Now you can add the correct st/nd/rd/th suffix to a number automatically:</p>
	<p><code>\[numToOrd(18)\]</code></p>
	<p>That would generate <code>18th</code>.</p>
	<br>
	<p>You can of course use it with variables and other plugins:</p>
	<p><code>\[numToOrd(num)\]</code></p>
	<p><code>\[numToOrd( dice("2d6") )\]</code></p>
	<p><code>\[numToOrd( character.hitpoints )\]</code></p>
	<br>
	<p>Test out this plugin by typing in a number:</p>
	<p><code>\[numToOrd(<input id="userval" oninput="update()" style="width:50px; text-align:center;" value="786"/>)\]</code></p>
	<p style="opacity:0.7; font-style:italic;">[$output(userval.value)]</p>
	<br>
	<p><b>Notes:</b></p>
	<ul>
		<li><a href="/numerals-to-ordinals-plugin-example#edit">Here's a simple example</a> of how to use it.</li>
		<li>Want the numbers spelled out as words? Check out <a href="/numerals-to-ordinal-words-plugin">numerals-to-ordinal-words-plugin</a></li>
		<li>Also check out <a href="/numerals-to-words-plugin">numerals-to-words-plugin</a></li>
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
		padding:0.1em;
	}
	ul li { margin-top:0.4em; }
</style>
```

## Notes on integration

- `main.pjs` defines the single top-level pjs function `$output(n) =>`, which the
  Perchance engine exports as the importable value of this generator. Consumers get it via
  `numToOrd = {import:numerals-to-ordinals-plugin}`.
- `index.html` is the generator's documentation/demo page. It is the CONTENTS of <body>
  only (no <html>/<head>/<body> tags); Perchance supplies the wrapper.
- No `{import:...}` lines exist in main.pjs, so `external-code/` is legitimately empty.

## Known reliances (not bundled, provided by the platform)

- Perchance engine (pjs evaluation, scope proxy, rendering) — hosted at perchance.org.
- Browser DOM + `document`/`window` — only used by the demo input element.
- No images, audio, fonts, shaders, models, or data files are referenced.
