# fullscreen-button-plugin - Complete Project Export

Perchance generator: https://perchance.org/fullscreen-button-plugin
Exported: 2026-09-16T18:33:05.102Z

## What this project is

A Perchance **plugin** generator. It exposes a single function:

```
$output(text, exitText, style)
```

Other generators import it with `fullscreenButton = {import:fullscreen-button-plugin}` and
call `[fullscreenButton()]` anywhere in their HTML to render a button that toggles
browser fullscreen mode for the page.

## Package contents (organized by category)

```
01-internal-code/        The generator's own source (this IS the whole project)
   main.pjs              Perchance DSL: the $output(...) plugin function
   index.html            Documentation page + live demo buttons
02-external-code/        (empty - no imports, no CDN libs, no npm packages)
03-third-party-assets/   (empty - no images/audio/models/shaders)
04-project-resources/    (empty - no JSON data/prefabs/templates/UI files)
05-build-and-config/     (empty - no build pipeline or config; Perchance compiles it)
MANIFEST.json            Machine-readable inventory with roles and byte sizes
README.md                This file
```

## Complete source

### 01-internal-code/main.pjs

```javascript
$output(text, exitText, style) => 
  if(!window.addedFullscreenEventListenerForPlugin39492749374) {
    window.addEventListener("fullscreenchange", function(event) {
      if(document.fullscreenElement) {
        for(let btn of [...document.querySelectorAll(".fullscreenButtonPluginButton938479832938")]) {
          btn.innerHTML = btn.dataset.exitText;
        }
      } else {
        for(let btn of [...document.querySelectorAll(".fullscreenButtonPluginButton938479832938")]) {
          btn.innerHTML = btn.dataset.text;
        }
      }
    });
    window.addedFullscreenEventListenerForPlugin39492749374 = true;
  }
  if(!document.documentElement.requestFullscreen) document.documentElement.requestFullscreen = document.documentElement.webkitRequestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.msRequestFullscreen;
  if(!document.exitFullscreen) document.exitFullscreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  if(!document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen = function() {
      alert("The browser/device you're using doesn't support fullscreen mode.");
    };
  }
  if(!document.exitFullscreen) {
    document.exitFullscreen = function() {
      alert("The browser/device you're using doesn't support fullscreen mode.");
    };
  }
  return `<button class="fullscreenButtonPluginButton938479832938" data-text="${text || "Fullscreen"}" data-exit-text="${exitText || "Exit Fullscreen"}" onclick="(!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) ? (document.documentElement.requestFullscreen(), this.innerHTML=this.dataset.exitText) : (document.exitFullscreen(), this.innerHTML=this.dataset.text)" style="line-height:1.2rem; ${style || ""}">${text || "Fullscreen"}</button>`;
```

### 01-internal-code/index.html

```html
<h1>Fullscreen Button Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:800px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p style="text-align:justify; margin-top:0;">This plugin lets you insert a button onto your generator's page that, when clicked, puts your generator's page in fullscreen mode. Simply put this in your perchance code panel:</p>

<pre class="custom">
fullscreenButton = \{import:fullscreen-button-plugin\}
</pre>
	
	<p>And then put this in your HTML panel (bottom-right):</p>
<pre class="custom">
\[fullscreenButton()\]
</pre>
	
	<p>And you'll get a button like this:</p>
	<p>[$output()]</p>
	
	<p>When the user is in fullscreen mode, the button text changes to "Exit fullscreen". If you'd like to customize the text, you can put this in your HTML panel instead:</p>
	
<pre class="custom">
\[fullscreenButton("⛶ fullscreen", "exit fullscreen")\]
</pre>
	
	<p>And you'll get this (try clicking it):</p>
	
  <p>[$output("🖵 fullscreen", "exit fullscreen")]</p>
	
	<p>You can change that text to whatever you like. You can also edit the styling of the button using a third and final input:</p>
	
<pre class="custom">
\[fullscreenButton("⛶ fullscreen", "exit fullscreen", "background:red; color:white; border:none;")\]
</pre>

	<p>And that'd give you a button like this:</p>
	
	<p>[$output("⛶ fullscreen", "exit fullscreen", "background:red; color:white; border:none;")]</p>
	
	<p>The <code>background:red; color:white; ...</code> stuff is <a href="https://en.wikipedia.org/wiki/Cascading_Style_Sheets">CSS</a>.</p>
	
	<br><br>
	<p><b>Notes:</b></p>
	<ul class="dot-list">
		<li>Check out <a href="https://perchance.org/fullscreen-button-plugin-examples#edit" target="_blank">this example</a> which has multiple different styles that you can take a look at.</li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
	</ul>
</div>
<br><br><br>

<style>
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding: 0 0.2em;
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

## Dependencies

None. The generator uses no `{import:...}` lines, no external scripts, no stylesheets,
no fonts, and no hosted assets. The only external reference is a documentation
hyperlink to Wikipedia (not loaded as a resource).

## Provenance / how the files fit together

1. Perchance evaluates `main.pjs` first, registering the `$output` function as a global.
2. It then renders `index.html` as the body of an iframe
   (`https://${generatorPublicId}.perchance.org/${generatorName}`).
3. Square-bracket blocks `[$output(...)]` in index.html call the function at render time,
   emitting a `<button>`; clicking it calls `document.documentElement.requestFullscreen()`.
4. A single global `fullscreenchange` listener (guarded by a flag) swaps every
   button's label between `data-text` and `data-exit-text`.
