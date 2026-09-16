# sum-odds-plugin - Complete Asset Package

Complete, verbatim source for every asset that this generator uses. Nothing is summarised;
every file is reproduced in full below and in the accompanying files.

- Public page: https://perchance.org/sum-odds-plugin
- Runtime origin: https://80d486a920a32274cf9e82eb15e26ecf.perchance.org/sum-odds-plugin
- Platform: perchance.org (perchance-js / pjs)
- Packaged: 2026-09-16T17:35:12.182Z

---

## Table of contents

| Category | Contents | Files |
| --- | --- | --- |
| 1. Internal code (authored here) | generator logic + page markup | `internal-code/main.pjs`, `internal-code/index.html` |
| 2. External code (third-party) | platform-injected runtime engine | `external-code/perchance-engine.md` |
| 3. Third-party assets | none | `third-party-assets/README.md` |
| 4. Project resources | none | `project-resources/README.md` |
| 5. Build / config files | none (perchance has no build step) | `build-config/README.md` |
| 6. Manifest | machine-readable file map | `MANIFEST.json` |

> **Scope note:** this is a text-only Perchance plugin generator. It has **no** images,
> audio, video, fonts, 3D models, animations, shaders, prefabs, sprite sheets or JSON data
> files. There are also **no** `{import:...}` dependencies to vendor. The only external
> code is Perchance's own engine script, which is injected by the platform at runtime and
> is not shipped with this generator (see category 2). Those directories exist in this
> package and contain an explanatory README rather than being silently omitted.

---

## 1. Internal code

### 1.1 `main.pjs` (85 bytes)

The entire generator logic. It defines a single `$output` function, which means importing
`sum-odds-plugin` from another generator yields this function as the imported value
(so callers write `sumOdds = {import:sum-odds-plugin}`). `getChildNames` returns the
names of a list node's children; `getOdds` returns each child's odds weight; `reduce`
sums them. Net effect: the sum of every item's odds in the given list, i.e. the weight
that list should be given in a parent list to behave as though its items were pasted
inline into that parent.

```javascript

$output(list) =>
  return list.getChildNames.reduce((s,n) => s+list[n].getOdds, 0);
```

### 1.2 `index.html` (2987 bytes)

The generator's body markup: a documentation page explaining the plugin's purpose, two
code samples (the naive `^[list.getLength]` approach versus the `^[sumOdds(list)]`
approach), and a scoped <style> block. Reproduced byte-for-byte, including the escaped
`\[ ... \]` sequences that stop Perchance from evaluating the example code blocks, the
`\{import:...\}` escape, and the tab characters inside the <pre> blocks.

```html
<h1>sumOdds Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:750px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p style="margin-top:0;">This plugin allows you to easily sum up all the odds of all the items in a particular list. It uses the <code>item.getOdds</code> property behind the scenes. To use it, paste this in your generator's code editor:</p>

<pre class="custom">
sumOdds = \{import:sum-odds-plugin\}
</pre>

<p>Sometimes you want to "merge" two lists, but preserve their odds as if you've just copy and pasted all the items into one big list. In that case, you can do something like this:</p>
	
<pre class="custom">
animal
	\[mammal\]^4
	\[bird\]^3

mammal
	koala
	mouse
	rabbit
	dog

bird
  chicken
  parrot
	crow
</pre>
	
	<p>But then you have to keep updating the <code>^4</code> and <code>^3</code> every time you add/remove items from the mammal or bird lists. So you could improve it by doing this:</p>
	
<pre class="custom">
animal
	\[mammal\]^\[mammal.getLength\]
	\[bird\]^\[bird.getLength\]

mammal
	koala
	mouse
	rabbit
	dog

bird
  chicken
  parrot
	crow
</pre>
	
	<p>But that's still not super ideal because what if (for some reason) you wanted to make the "crow" item 20 times more likely, like this?</p>
	
<pre class="custom">
...

bird
  chicken
  parrot
	crow^20
</pre>
	
	<p>The <code>^\[bird.getLength\]</code> approach doesn't work now because the length of the bird list is still 3, and so <code>^\[bird.getLength\]</code> resolves to <code>^3</code> when we really want it to resolve to <code>^22</code> (the sum of all the odds in the <code>bird</code> list). Hence this plugin:</p>
	
<pre class="custom">
animal
	\[mammal\]^\[sumOdds(mammal)\]
	\[bird\]^\[sumOdds(bird)\]

mammal
	koala
	mouse
	rabbit
	dog

bird
  chicken
  parrot
	crow^20
</pre>
	
	<p>So now when we write <code>\[animal\]</code> the <code>bird</code> "sub-list" will be chosen with a probability that makes it so crow actually has a 20x chance of occurring - like it would if we actually merged the two lists by cutting and pasting all the items of the mammal and bird lists into the animal list.</p>
	<p>Enjoy!</p>
	
	<br>
	<p><b>Notes:</b></p>
	<ul class="dot-list">
		<li><a href="https://perchance.org/sum-odds-plugin-example#edit">Here's an example generator</a> that uses this plugin.</li>
		<li>Check out <a href="https://www.reddit.com/r/perchance/comments/bpg131/how_do_i_use_sublists_without_altering_the_odds/">this forum thread</a> for the origin story of this plugin.</li>
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
		padding: 0.05em 0.2em;
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

## 2. External code (third-party)

Loaded by the Perchance platform, not by this generator's source:

```
https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
```

That script (the Perchance engine, hash `491bf81418aa4b69`) is what parses `main.pjs`,
evaluates square-bracket blocks, supplies the list-tree API used here
(`getChildNames`, `getOdds`, `reduce`), and ships `$output` to importers. It is
minified, versioned by the platform, and cannot and should not be bundled into this
generator - it is deliberately excluded from the ZIP.

See `external-code/perchance-engine.md` for details.

---

## 3. Third-party assets

None. There are no image, audio, video, font, model, shader, animation, prefab, template,
UI-resource or JSON data files anywhere in this project. No remote assets are hotlinked.

---

## 4. Project resources

None beyond the two source files in category 1 (no data files, no localisation strings,
no design documents).

---

## 5. Build / configuration files

None. Perchance has no build pipeline, package manager, lockfile or CI configuration -
`main.pjs` and `index.html` are compiled by the platform on each request. Deployment is:
paste `main.pjs` into the generator's code editor and `index.html` into its HTML editor,
then save.

---

## 6. Licence / provenance

Source is the generator's own code, retrieved verbatim from the live Perchance workspace.
The platform engine in category 2 is Perchance's property and is redistributed by
perchance.org itself, not by this package.
