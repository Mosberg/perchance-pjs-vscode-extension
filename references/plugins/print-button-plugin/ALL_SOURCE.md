# print-button-plugin — Complete Source & Asset Dump

Generator: https://perchance.org/print-button-plugin
Generated: 2026-09-16T18:32:05.135Z

Every file that comprises this project is reproduced in full below.
Categories with no content are listed so the inventory is provably complete.

---

## CATEGORY 1 — INTERNAL CODE (authored, ships with the generator)

### internal-code/main.pjs  (219 bytes)

```pjs
$output 
  <button onclick\="window.print()">Print</button><style> * \{ -webkit-print-color-adjust: exact !important; color-adjust: exact !important; \} @media print \{ .hideDuringPrint \{ display: none; \} \}</style>
	
```

### internal-code/index.html  (2785 bytes)

```html
<h1>Print Button Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:750px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p style="text-align:justify; margin-top:0;">If you'd like to allow people to print the page that they've generated using your generator, simply put this in your HTML panel:</p>

<pre class="custom">
\{import:print-button-plugin\}
</pre>
	
	<p>And you'll get a button like this (try clicking it):</p>
	
	<p>[$output]</p>
	
	<p>If you'd like to customize the text or style of the button, you'll need to know a bit of CSS and HTML, which <a href="https://www.khanacademy.org/computing/computer-programming/html-css" target="_blank">you can learn by clicking here</a>. Once you've learned the basics, you can put this in your HTML panel:</p>
	
<pre class="custom">
&lt;button onclick="window.print()" style="background:lightcoral"&gt;print the page&lt;/button&gt;
&lt;style&gt; * \{ -webkit-print-color-adjust: exact !important; color-adjust: exact !important; \} &lt;/style&gt;
</pre>
	
	<p>The second line just tells the web browser to print background colors and images as well. You can leave it out if you just want it to print in black and white. The above code produces a button that looks like this:</p>
	
	<button onclick="window.print()" style="background:lightcoral">Print!</button>
	
	<p>You can edit the <code>style</code> attribute to create the look that you want.</p>
	
	<p>If you don't want it to print background images and background colors, then you should use just the following code (no need to import this plugin):</p>

<pre class="custom">
&lt;button onclick="window.print()"&gt;Print&lt;/button&gt;
</pre>
  
  <p>If you don't want certain elements to show up in the printed version of your generator, you can add the <code>hideDuringPrint</code> class to your element:</p>
<pre class="custom">
&lt;div&gt;This is shown during print&lt;/div&gt;
&lt;div class="hideDuringPrint"&gt;This is hidden during print&lt;/div&gt;
</pre>
  
  <p>If you want to add other custom CSS rules for use during printing only (e.g. changing colored text to black), paste this in your HTML editor:</p>
  
<pre class="custom">
&lt;style&gt;
@media print \{ 
  (put your custom printing rules here)
\}
&lt;/style&gt;
</pre>
	
	<br><br>
	<p><b>Notes:</b></p>
	<ul class="dot-list">
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

---

## CATEGORY 2 — EXTERNAL CODE (libraries / modules / tools this project depends on)

None authored by the project. The generator declares zero `{import:...}` statements.

Platform-level code loaded at runtime (not part of the generator, provided by Perchance):

| Name | URL |
| --- | --- |
| perchance-engine | https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js |
| cloudflare-insights-beacon | https://static.cloudflareinsights.com/beacon.min.js |

---

## CATEGORY 3 — THIRD-PARTY ASSETS

None. No textures, sprites, audio, models, fonts, or icons.

---

## CATEGORY 4 — PROJECT RESOURCES (data, shaders, animations, prefabs, templates, UI resources)

None. No JSON data files, shaders, animation clips, or prefabs.

---

## CATEGORY 5 — BUILD / CONFIG FILES

None. There is no build pipeline: no package.json, no bundler config, no lockfile,
no transpiler, no CI. The generator is authored directly in the Perchance editor and
the platform renders main.pjs + index.html at request time.

---

## MANIFEST

See MANIFEST.json for the machine-readable inventory.
