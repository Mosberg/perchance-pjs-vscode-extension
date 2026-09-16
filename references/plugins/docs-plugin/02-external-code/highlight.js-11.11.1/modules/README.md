# highlight.js 11.11.1 - modules loaded at runtime

main.pjs lazily loads highlight.js from esm.sh with these exact URLs:

| purpose | runtime URL |
| --- | --- |
| core | https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022 |
| javascript | https://esm.sh/highlight.js@11.11.1/lib/languages/javascript?target=es2022 |
| json | https://esm.sh/highlight.js@11.11.1/lib/languages/json?target=es2022 |
| xml (html/svg) | https://esm.sh/highlight.js@11.11.1/lib/languages/xml?target=es2022 |

esm-shims/ holds the exact shim bytes those URLs return, e.g.:

```js
/* esm.sh - highlight.js@11.11.1/lib/core */
export * from "/highlight.js@11.11.1/es2022/lib/core.mjs";
export { default } from "/highlight.js@11.11.1/es2022/lib/core.mjs";
```

modules/ holds the bytes of the modules the shims re-export (core.mjs, languages/*.mjs), fetched from the same
origin, so the code that actually executes at runtime is fully captured here.

Language aliases registered at runtime: json5 -> javascript. Source-language map: js/javascript -> javascript,
json/jsonc -> json, json5 -> javascript, html/xml/svg -> xml. Only grammars used by a page are fetched
(loadHighlighter in main.pjs).