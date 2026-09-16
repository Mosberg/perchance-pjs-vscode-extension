# Third-party assets

**This project uses none.**

`lockable-list-plugin` has **zero** `{import:...}` statements (see `01-internal-code/main.pjs`
— the only top-level definitions are the `$output` function, the `animal` list, the `adjective`
list, and comments). It therefore has:

- no third-party JS libraries or CDN modules
- no npm/package-manager dependencies
- no stylesheets, fonts, icon packs, or sprite sheets
- no `src/` file tree

The only non-project code it touches is Perchance's own engine (the platform provides
`$output`, list selection, `evaluateItem`, and the `{import:...}` mechanism).

Note `06-known-dependencies.md` for the platform behaviour the code relies on.
