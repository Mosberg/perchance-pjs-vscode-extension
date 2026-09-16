# random-image-plugin - complete source & asset package

A verbatim, categorised export of every file, dependency, and asset referenced by the
Perchance generator `random-image-plugin`.

- **Generator name:** `random-image-plugin`
- **Public page:** https://perchance.org/random-image-plugin
- **Runtime origin:** `https://c79864f5da09bc756b7888f09b19a997.perchance.org/random-image-plugin`
- **Source size:** 2 files, 4769 bytes total, 0 binary assets
- **`{import:...}` dependencies:** none
- **Package root:** `random-image-plugin-complete/`

## Contents

```
random-image-plugin-complete/
  MANIFEST.md                                  <- this file: full inventory + full source
  internal-code/
    main.pjs                                   <- generator logic (VERBATIM)
    index.html                                 <- page body / UI (VERBATIM)
    platform-registry-snapshot.json            <- deployed copy as served by the Perchance API
  external-code/
    README.md                                  <- the one external dependency, exhaustively documented
    source-unsplash-com.response.html          <- raw 503 response captured from that dependency
  third-party-assets/
    README.md                                  <- why no binary assets exist in this project
    unsplash-license.snapshot.html             <- licence provenance snapshot
  project-resources/
    README.md                                  <- UI copy, styles, lists, templates, links
  build-config/
    README.md                                  <- no build step; the implicit pipeline + repro notes
  tools/
    export-package.js                          <- script that generated this archive

  SHA256SUMS.txt                               <- checksums for every file in this package
```

---

# 1. Internal code

## 1.1 `internal-code/main.pjs`

Byte-for-byte the generator's code panel. Declares the `$output` function (which is what
importers receive), an optional `myAnimalList` demo list, and nothing else.

```pjs
$output(topic, width, height, contain) =>
  if(!topic) return "(error in random-image-plugin: no topic/keyword provided)";
	if(!width) width = 600;
	if(!height) height = 400;
	let cacheBusterSpaces = " ".repeat(Math.round(Math.random()*20));
  if(contain === "contain") {
    let src = `https://source.unsplash.com/featured/?${topic}${cacheBusterSpaces}&__cacheBuster=${Date.now()}`;
    let string = new String(`<div style="display:inline-block; width:${width}px; height:${height}px; background-image:url('${src}'); background-position:center; background-size:${contain}; background-repeat:no-repeat;"></div>`);
    string.src = src; // to allow people to get the source of the image (see dot-point notes)
    return string;
  } else {
    let src = `https://source.unsplash.com/${width}x${height}/?${topic}${cacheBusterSpaces}&__cacheBuster=${Date.now()}`;
    let string = new String(`<img style="width:${width}px; height:${height}px;" src="${src}">`);
    string.src = src; // to allow people to get the source of the image (see dot-point notes)
    return string;
  }
  
myAnimalList
  frog
  mouse
  rabbit
  deer
```

## 1.2 `internal-code/index.html`

Byte-for-byte the generator's HTML panel - the contents of `<body>` only. Contains the
documentation page, four live demo calls into `$output`, and a `<style>` block.

```html
<h1>🖼 Random Image Plugin 📷</h1>

<div style="text-align:left; margin:0 auto;width:100%;max-width:800px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p style="text-align:justify; margin-top:0;">This plugin allows you to add a random image based on a keyword/topic that you provide. It uses Unsplash.com's API which is a bit "hit and miss", so it won't be perfect. Just paste this in your Perchance code panel:</p>
	 
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
image = \{import:random-image-plugin\}
</pre>
	
  <p>and then write this in your HTML (bottom-right) panel:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
\[image("cat")\]
</pre>

	<p>and it'll output a random cat image, like this:</p>
	
	<p>[$output("cat")]</p> 
	
	<p>Note that sometimes it will output an irrelevant image because unfortunately some Unsplash users add irrelevant tags to their images. You can resize/crop the output to a certain width and height like this:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
\[image("cat", 200, 100)\]
</pre>
	
	<p>[$output("cat", 200, 100)]</p> 
	
	<p>That outputs an image that's 200 pixels wide, and 100 pixels high.</p>
  
	<p>You can input a list and it will randomly select an item from that list:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
\[image(myAnimalList)\] 
</pre>
	
	<p>[$output(myAnimalList)]</p> 
  
	<p>By default the image is cropped to the height and width that you specify, but you can opt to "contain" the full image within the width and height you specify like this:</p>
	
<pre class="custom" style="margin:0; height:100%; box-sizing:border-box;">
\[image(myAnimalList, 600, 400, "contain")\] 
</pre>
  
	<p>[$output(myAnimalList, 600, 400, "contain")]</p>
	
	<br><br>
	<p><b>Notes:</b></p>
	<ul class="dot-list">
		<li><a href="https://perchance.org/random-image-plugin-example#edit">Here's a simple example</a> of a generator that uses this plugin.</li>
		<li>This plugin uses the <a href="https://source.unsplash.com/" target="_blank">Unsplash Source API</a>.</li>
		<li><b>Important note:</b> The Unsplash API may return the wrong images sometimes because on unsplash people tag their images with tags that sometimes don't match the exact topic. E.g. it may be a cat photo but their cat's name is "lizard", and so you get a cat photo displayed when you actually searched "lizard".</li>
		<li>The default dimensions are 600x400.</li>
		<li><code>\[image("cat")\]</code> generates an actual image (i.e. the HTML <code>&lt;img&gt;</code> tag), but if you just want to generate the URL of the image, then you can instead write <code>\[image("cat").src\]</code>.</li>
		<li>Unsplash has hundreds of thousands of images, but there are still many topics that don't have any images, so if you request an image for "charmander" (for example), you'll get a "not found" placeholder image.</li>
		<li>Since all images are from Unsplash, they're <a href="https://unsplash.com/license" target="_blank">completely free</a> to use for any purpose (e.g. even if you are selling your generator, or something).</li>
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

## 1.3 `internal-code/platform-registry-snapshot.json`

Response from
`https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=random-image-plugin`.
Confirms `\"imports\": []` and lets you diff the editor contents against the deployed copy.

```json
{"success":true,"generators":{"random-image-plugin":{"name":"random-image-plugin","imports":[],"code":"$output(topic, width, height, contain) =>\n  if(!topic) return \"(error in random-image-plugin: no topic/keyword provided)\";\n\tif(!width) width = 600;\n\tif(!height) height = 400;\n\tlet cacheBusterSpaces = \" \".repeat(Math.round(Math.random()*20));\n  if(contain === \"contain\") {\n    let src = `https://source.unsplash.com/featured/?${topic}${cacheBusterSpaces}&__cacheBuster=${Date.now()}`;\n    let string = new String(`<div style=\"display:inline-block; width:${width}px; height:${height}px; background-image:url('${src}'); background-position:center; background-size:${contain}; background-repeat:no-repeat;\"></div>`);\n    string.src = src; // to allow people to get the source of the image (see dot-point notes)\n    return string;\n  } else {\n    let src = `https://source.unsplash.com/${width}x${height}/?${topic}${cacheBusterSpaces}&__cacheBuster=${Date.now()}`;\n    let string = new String(`<img style=\"width:${width}px; height:${height}px;\" src=\"${src}\">`);\n    string.src = src; // to allow people to get the source of the image (see dot-point notes)\n    return string;\n  }\n  \nmyAnimalList\n  frog\n  mouse\n  rabbit\n  deer","lastEditTime":1614186801777}},"unfound":[]}
```

---

# 2. External code

No third-party *code* is used. See `external-code/README.md`. The single external dependency
is the Unsplash Source image service, which is currently returning **HTTP 503** (retired).

---

# 3. Third-party assets

No binary assets are shipped or referenced by path. All imagery is pulled live from Unsplash
at render time via URL. See `third-party-assets/README.md`.

---

# 4. Project resources

UI markup, copy, styling, the `myAnimalList` data list, the pjs templates, and the outbound
links - all catalogued in `project-resources/README.md`.

---

# 5. Build / config files

None exist (no package.json, bundler, tsconfig, CI, or secrets). See `build-config/README.md`
for the implicit pipeline and the deployment coordinates.

---

# 6. API surface of the plugin

```js
// signature
$output(topic, width = 600, height = 400, contain)

// defaults
topic   - required; a keyword string OR a pjs list (a list is auto-selected from)
width   - 600
height  - 400
contain - undefined => fill/crop (uses <img>); \"contain\" => letterbox (uses a background-image <div>)

// returns a String object whose .src property is the resolved remote URL
image(\"cat\")                   // -> <img style=\"width:600px; height:400px;\" src=\"https://source.unsplash.com/600x400/?cat ...\">
image(\"cat\", 200, 100)         // -> <img style=\"width:200px; height:100px;\" ...>
image(myAnimalList)             // -> a random item from the list is used as the topic
image(\"cat\", 600, 400, \"contain\") // -> <div style=\"...background-size:contain;...\"></div>
image(\"cat\").src               // -> just the URL string
```

## Error / edge behaviour in the source

| Condition | Behaviour |
|---|---|
| `topic` falsy | returns the string `(error in random-image-plugin: no topic/keyword provided)` |
| `width` falsy | defaults to 600 |
| `height` falsy | defaults to 400 |
| `contain` exactly `\"contain\"` | letterbox branch (`background-image`, `background-size:contain`) |
| any other `contain` value | crop branch (`<img>` with clamped width/height styles) |
| every call | appends 0-20 spaces plus `__cacheBuster=<epoch ms>` to defeat caching |
