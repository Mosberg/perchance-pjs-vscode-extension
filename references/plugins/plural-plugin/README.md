# plural-plugin - complete project export

Unabridged, full-source export of the Perchance generator **plural-plugin**
(<https://perchance.org/plural-plugin>), plus every dependency it uses.

This generator is itself a Perchance *plugin*: it exports a callable `plural` function via
`$output`, so consumer generators write `plural = {import:plural-plugin}` and then
`[plural(someList)]`.

---

## 1. Internal code (first-party) - `01-internal-code/`

Exactly two source files. Both included in full.

### 1a. `main.pjs` - all logic, including the vendored dependency

```javascript
// This uses: https://github.com/plurals/pluralize
// It has the same params as that pluralize function:
//     word: string The word to pluralize
//     count: number How many of the word exist
//     inclusive: boolean Whether to prefix with the number (e.g. 3 ducks)
// Difference is that if "count" is "ADD_RULES" then word is assumed to be a custom rules list like:
// pluralRules
//   zib :: zibz
//   *gex :: *gexii
//   furniture :: furniture 
// Future one-way rules would look like this (the first part can be regex):
//   zib -> zibz
  
$output(word, count, inclusive) =>
  if(!window.__pluralize74926502652238492645) window.__pluralize74926502652238492645 = getPluralizeFunction();
  let pluralize = window.__pluralize74926502652238492645;
  if(count === "ADD_RULES") { // we only add rules *once* (further ADD_RULES calls do nothing), which means the "reload" button needs to be clicked to refresh the rules
    if(window.__pluralizeRulesAlreadyAdded652238492645) return "";
    
    let ruleLines = word.selectAll.map(r => r.toString());
    let rules = [];
    for(let line of ruleLines) {
      let parts = line.trim().split(/\s+::\s+/);
      if(parts.length !== 2) return `(Plural rule error on this line: ${line})`;
      if(parts[0].startsWith("*") + parts[1].startsWith("*") === 1) return `(Plural rule error on this line: ${line} - only one side contains an asterisk?)`;
      rules.push(parts)
    }
    //debugger;
    for(let rule of rules) {
      let from, to;
      from = rule[0];
      to = rule[1];
      if(from.startsWith("*")) { // (note: we've already checked that they either both start with asterisk, or neither)
        from = new RegExp(from.slice(1) + '$', 'i');
        to = to.slice(1);
      }
      
      pluralize.addPluralRule(from, to);
      
      from = rule[1];
      to = rule[0];
      if(from.startsWith("*")) {
        from = new RegExp(from.slice(1) + '$', 'i');
        to = to.slice(1);
      }
      pluralize.addSingularRule(from, to);
    }
    
    window.__pluralizeRulesAlreadyAdded652238492645 = true;
    return "";
  }
  
  return pluralize(word.toString(), count, inclusive);


getPluralizeFunction() => 
  let fakeWindow = {};
  (function(window) {
    // From: https://github.com/plurals/pluralize (version 8.0.0)
    !function(e,a){"function"==typeof require&&"object"==typeof exports&&"object"==typeof module?module.exports=a():"function"==typeof define&&define.amd?define(function(){return a()}):e.pluralize=a()}(this,function(){var e=[],a=[],i={},r={},s={};function o(e){return"string"==typeof e?new RegExp("^"+e+"$","i"):e}function t(e,a){return e===a?a:e===e.toLowerCase()?a.toLowerCase():e===e.toUpperCase()?a.toUpperCase():e[0]===e[0].toUpperCase()?a.charAt(0).toUpperCase()+a.substr(1).toLowerCase():a.toLowerCase()}function n(e,a){return e.replace(a[0],function(i,r){var s,o,n=(s=a[1],o=arguments,s.replace(/\$(\d{1,2})/g,function(e,a){return o[a]||""}));return t(""===i?e[r-1]:i,n)})}function u(e,a,r){if(!e.length||i.hasOwnProperty(e))return a;for(var s=r.length;s--;){var o=r[s];if(o[0].test(a))return n(a,o)}return a}function l(e,a,i){return function(r){var s=r.toLowerCase();return a.hasOwnProperty(s)?t(r,s):e.hasOwnProperty(s)?t(r,e[s]):u(s,r,i)}}function c(e,a,i,r){return function(r){var s=r.toLowerCase();return!!a.hasOwnProperty(s)||!e.hasOwnProperty(s)&&u(s,s,i)===s}}function h(e,a,i){return(i?a+" ":"")+(1===a?h.singular(e):h.plural(e))}return h.plural=l(s,r,e),h.isPlural=c(s,r,e),h.singular=l(r,s,a),h.isSingular=c(r,s,a),h.addPluralRule=function(a,i){e.push([o(a),i])},h.addSingularRule=function(e,i){a.push([o(e),i])},h.addUncountableRule=function(e){"string"!=typeof e?(h.addPluralRule(e,"$0"),h.addSingularRule(e,"$0")):i[e.toLowerCase()]=!0},h.addIrregularRule=function(e,a){a=a.toLowerCase(),e=e.toLowerCase(),s[e]=a,r[a]=e},[["I","we"],["me","us"],["he","they"],["she","they"],["them","them"],["myself","ourselves"],["yourself","yourselves"],["itself","themselves"],["herself","themselves"],["himself","themselves"],["themself","themselves"],["is","are"],["was","were"],["has","have"],["this","these"],["that","those"],["echo","echoes"],["dingo","dingoes"],["volcano","volcanoes"],["tornado","tornadoes"],["torpedo","torpedoes"],["genus","genera"],["viscus","viscera"],["stigma","stigmata"],["stoma","stomata"],["dogma","dogmata"],["lemma","lemmata"],["schema","schemata"],["anathema","anathemata"],["ox","oxen"],["axe","axes"],["die","dice"],["yes","yeses"],["foot","feet"],["eave","eaves"],["goose","geese"],["tooth","teeth"],["quiz","quizzes"],["human","humans"],["proof","proofs"],["carve","carves"],["valve","valves"],["looey","looies"],["thief","thieves"],["groove","grooves"],["pickaxe","pickaxes"],["passerby","passersby"]].forEach(function(e){return h.addIrregularRule(e[0],e[1])}),[[/s?$/i,"s"],[/[^\u0000-\u007F]$/i,"$0"],[/([^aeiou]ese)$/i,"$1"],[/(ax|test)is$/i,"$1es"],[/(alias|[^aou]us|t[lm]as|gas|ris)$/i,"$1es"],[/(e[mn]u)s?$/i,"$1s"],[/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i,"$1"],[/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,"$1i"],[/(alumn|alg|vertebr)(?:a|ae)$/i,"$1ae"],[/(seraph|cherub)(?:im)?$/i,"$1im"],[/(her|at|gr)o$/i,"$1oes"],[/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i,"$1a"],[/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i,"$1a"],[/sis$/i,"ses"],[/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i,"$1$2ves"],[/([^aeiouy]|qu)y$/i,"$1ies"],[/([^ch][ieo][ln])ey$/i,"$1ies"],[/(x|ch|ss|sh|zz)$/i,"$1es"],[/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i,"$1ices"],[/\b((?:tit)?m|l)(?:ice|ouse)$/i,"$1ice"],[/(pe)(?:rson|ople)$/i,"$1ople"],[/(child)(?:ren)?$/i,"$1ren"],[/eaux$/i,"$0"],[/m[ae]n$/i,"men"],["thou","you"]].forEach(function(e){return h.addPluralRule(e[0],e[1])}),[[/s$/i,""],[/(ss)$/i,"$1"],[/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i,"$1fe"],[/(ar|(?:wo|[ae])l|[eo][ao])ves$/i,"$1f"],[/ies$/i,"y"],[/(dg|ss|ois|lk|ok|wn|mb|th|ch|ec|oal|is|ck|ix|sser|ts|wb)ies$/i,"$1ie"],[/\b(l|(?:neck|cross|hog|aun)?t|coll|faer|food|gen|goon|group|hipp|junk|vegg|(?:pork)?p|charl|calor|cut)ies$/i,"$1ie"],[/\b(mon|smil)ies$/i,"$1ey"],[/\b((?:tit)?m|l)ice$/i,"$1ouse"],[/(seraph|cherub)im$/i,"$1"],[/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i,"$1"],[/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i,"$1sis"],[/(movie|twelve|abuse|e[mn]u)s$/i,"$1"],[/(test)(?:is|es)$/i,"$1is"],[/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,"$1us"],[/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i,"$1um"],[/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i,"$1on"],[/(alumn|alg|vertebr)ae$/i,"$1a"],[/(cod|mur|sil|vert|ind)ices$/i,"$1ex"],[/(matr|append)ices$/i,"$1ix"],[/(pe)(rson|ople)$/i,"$1rson"],[/(child)ren$/i,"$1"],[/(eau)x?$/i,"$1"],[/men$/i,"man"]].forEach(function(e){return h.addSingularRule(e[0],e[1])}),["adulthood","advice","agenda","aid","aircraft","alcohol","ammo","analytics","anime","athletics","audio","bison","blood","bream","buffalo","butter","carp","cash","chassis","chess","clothing","cod","commerce","cooperation","corps","debris","diabetes","digestion","elk","energy","equipment","excretion","expertise","firmware","flounder","fun","furniture","gallows","garbage","graffiti","hardware","headquarters","health","herpes","highjinks","homework","housework","information","jeans","justice","kudos","labour","literature","machinery","mackerel","mail","media","mews","moose","music","mud","manga","news","only","personnel","pike","plankton","pliers","police","pollution","premises","rain","research","rice","salmon","scissors","series","sewage","shambles","shrimp","software","staff","swine","tennis","traffic","transportation","trout","tuna","wealth","welfare","whiting","wildebeest","wildlife","you",/pok[eé]mon$/i,/[^aeiou]ese$/i,/deer$/i,/fish$/i,/measles$/i,/o[iu]s$/i,/pox$/i,/sheep$/i].forEach(h.addUncountableRule),h});
  }).bind(fakeWindow)(fakeWindow);
  return fakeWindow.pluralize;
```

### 1b. `index.html` - body markup, styles, and the documentation UI

```html
<h1>Plural Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:650px;background:white;border-radius:2px;padding:1em; box-sizing:border-box; text-align:left;">
	<p style="margin-top:0;">If you want to define plurals for words that <code>pluralForm</code> doesn't cover, then this is the plugin for you. To use this plugin, instead of writing this:</p>
<pre>
output
  There are a few \[animal.pluralForm\] over there.
</pre> 
  <p>you write this:</p>
<pre>
plural = \{import:plural-plugin\}

output
  There are a few \[plural(animal)\] over there.
</pre>
  <p>To add your own pluralization rules, add a list like this to your Perchance lists editor:</p>
<pre>
pluralRules
  bobbin :: bobbinses      <span style="opacity:0.5">// bobbinses is plural of bobbin</span>
  zib :: zibz              <span style="opacity:0.5">// zibz is plural of zib</span>
  *gex :: *gexii           <span style="opacity:0.5">// plural of words ending in gex is *gexii</span>
  furniture :: furniture   <span style="opacity:0.5">// don't add an s to the end (it's an "uncountable" noun)</span>
</pre>
  <p>And then paste this at the top of your HTML editor (the bottom-right panel):</p>
<pre>
\[plural(pluralRules, "ADD_RULES")\]
</pre>
  <p><b style="color:red;">Important note:</b> When you add or remove rules, you need to click the reload button to refresh your generator and have the changes go into effect.</p>
  <p>You can get the singular form like so:</p>
<pre>
output
  There are a few \[plural(animal, 1)\] over there.
</pre>
  <p>And if you put any number after it, and then <code>true</code> after that, like this:</p>
<pre>
output
  There are \[plural(animal, 7, true)\] over there.
</pre>
  <p>Then it will output something like this:</p>
<pre>
There are 7 piglets over there.
</pre>
  <p>In other words, it adds the number before the word, and then pluralizes the word based on the number. This is handy for cases like this where you don't know whether the word should be pluralized or not because the number is randomly generated:</p>
<pre>
num = {1-10}

output
  \[n = num.selectOne, ""\] There are \[plural(animal, n, true)\] over there.
</pre>
	<p><b>Notes:</b></p>
	<ul>
		<li><a href="https://perchance.org/plural-plugin-example#edit" target="_blank">Here's</a> an example of how to use this plugin.</li>
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

## 2. External code (third-party) - `02-external-code/`

### `pluralize` v8.0.0 - MIT - https://github.com/plurals/pluralize

The only external dependency. It is **vendored (inlined)**, not imported: the minified
browser build lives inside `getPluralizeFunction()` in `main.pjs`, with the UMD factory
bound to a throw-away `fakeWindow` instead of the real `window`.

| File | What it is | Bytes |
|------|------------|-------|
| `pluralize.js` | byte-exact upstream v8.0.0 build, unminified (`https://unpkg.com/pluralize@8.0.0/pluralize.js`) | 12618 |
| `pluralize.min.js` | the minified build exactly as vendored in `main.pjs`, extracted byte-for-byte | 5878 |
| `LICENSE` | MIT, Copyright (c) 2013 Blake Embrey | 1103 |
| `README.md` | provenance, used call surface, re-vendoring recipe | |

Public surface actually used (everything else in the library is minifier ballast):
`pluralize(word, count, inclusive)`, `pluralize.addPluralRule`,
`pluralize.addSingularRule`, `pluralize.addUncountableRule`.

**No `{import:...}` plugins, no npm packages, no CDN `<script src>`, no external CSS or
web fonts anywhere in this project.**

---

## 3. Third-party assets - `03-third-party-assets/`

**None.** No images, audio, video, 3D models, textures, sprites, fonts, or icons are
referenced or generated. The only external URIs in either file are hyperlinks in the docs UI.

---

## 4. Project resources - `04-project-resources/`

**None.** No shaders, animations, JSON data, prefabs, templates, level data, or binary UI
resources. The generator is pure logic plus text.

The one runtime data structure is the *consumer-supplied* `pluralRules` list (not part of
this project); its `from :: to` / `*from :: *to` grammar is documented in `index.html` and
parsed by `$output` when called with `count === "ADD_RULES"`.

---

## 5. Build / config files - `05-build-config/`

**None.** The Perchance platform is the runtime and the build: `main.pjs` is interpreted by
the engine at load, `index.html` is served as-is in the generator iframe, and saving in the
editor is the whole deployment step. See `05-build-config/README.md`.

---

## Runtime contract

```
plural = {import:plural-plugin}   // consumer generator's main.pjs

[plural(animal)]                -> "pigs"
[plural(animal, 1)]             -> "pig"
[plural(animal, 7, true)]       -> "7 piglets"
[plural(pluralRules, "ADD_RULES")]   // register custom rules, once, per page load
```

Semantics implemented in `main.pjs`:

- The pluralize instance is memoized on `window.__pluralize74926502652238492645`.
- `ADD_RULES` is idempotent per page load (`window.__pluralizeRulesAlreadyAdded652238492645`);
  editing rules therefore requires a reload - which is exactly the red warning in the UI.
- Rules are `from :: to`. A leading `*` on **either** side turns that side into a
  suffix-anchored, case-insensitive `RegExp` (`new RegExp(from.slice(1) + '$', 'i')`).
  Exactly one side starred, or a malformed line, returns an error string as the output.
- Every accepted rule is registered both ways (plural `from->to` **and** singular
  `to->from`), so `plural(word, 1)` honours custom rules too.

---

## License summary

| Component | License | Copyright |
|-----------|---------|-----------|
| `main.pjs`, `index.html` (this generator) | generator owner's own | the generator owner |
| pluralize v8.0.0 | MIT | (c) 2013 Blake Embrey |

The MIT notice is preserved at `02-external-code/pluralize/LICENSE` and is also cited in the
vendor comment inside `main.pjs` (`// From: https://github.com/plurals/pluralize (version 8.0.0)`).
