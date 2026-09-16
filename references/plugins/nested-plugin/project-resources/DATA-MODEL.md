# Node schema (project resource)

Each Perchance list item in the world tree is a node. The renderer treats these
names as significant:

- **node name** — the list item's raw name (underscores are displayed as spaces for
  leaves). Used as the archetype id passed to `generateItem`.
- **children** — any indented sub-list. `node.selectAll.length === 0` means the node
  is a leaf ("dimmed" in the UI).
- **`n = {min-max}`** — the overall child budget for that node. Read via
  `Number(node.n)`; when invalid/absent the renderer falls back to 5–10 random items.
- **per-child quantity** — a trailing `{min-max}` on a *child* line (e.g.
  `mountain_range {1-3}`) is the number of copies of that child to instantiate.
  Specified-quantity children are placed first, then the remaining budget is filled by
  randomly selecting children that have no individual quantity.
- **`name = {...}`** — optional display-name alternatives for a node.
- **`description`** — a pjs string; shown in the header's `title` tooltip, and for
  leaves-with-description also rendered inside the unfolded body. May contain HTML
  (the example embeds an <img>).

Selection semantics (`selectOne`, odds `^n`, `{a|b|c}` alternation, `{min-max}`
ranges) are Perchance engine features, not plugin features.
