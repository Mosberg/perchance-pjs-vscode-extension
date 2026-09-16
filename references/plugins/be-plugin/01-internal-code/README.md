# Internal code

Everything the shipped generator actually runs.

- `main.pjs` — the whole plugin:
  - `$output(tense) =>` — exported entry point (default `tense = "present"`).
    Generates a unique element id, returns an object with `lowerCase`,
    `upperCase`, `titleCase`, `sentenceCase` HTML strings plus `toString()`
    (so plain `[be()]` yields the lower-case span).
  - `updateNodeText(node)` — walks `previousSibling` nodes, strips
    punctuation, takes the last surviving word to the left, calls `toBe`,
    and writes the result into the span honouring `dataset.case`.
  - `toBe(leftSideWord, tense) =>` — the verb table:
    present: he/she -> is, they/we -> are, I -> am, fallback is;
    past: he/she/I -> was, they/we -> were, fallback was.
  - A 1 ms `setTimeout` runs after the span enters the DOM, then a
    `MutationObserver` on the span's parent (`childList`, `subtree`,
    `characterData`) re-runs `updateNodeText`, ignoring mutations the
    function itself caused, and disconnects once the span is detached.
- `index.html` — documentation page (usage examples, notes, styling).
  No script tags, no logic.

No other files are required for the generator to function.
