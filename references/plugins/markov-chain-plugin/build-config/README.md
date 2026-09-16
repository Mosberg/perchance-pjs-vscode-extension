Build / configuration files
===========================

This project has none, and that is not an omission — it genuinely does not use
any. Verified by inspecting every shipped file:

  * No package.json, no lockfile, no node_modules.
  * No bundler/transpiler config (webpack, rollup, vite, esbuild, babel, tsc...).
  * No tsconfig, no .babelrc, no .editorconfig, no CI config.
  * No Perchance plugin imports: `{import:...}` appears nowhere in main.pjs, and
    the only occurrence in index.html is *sample text the page prints* telling
    the user to write `markov = {import:markov-chain-plugin}` in their own
    generator. It is copy, not a dependency.
  * No `$meta` block in main.pjs (the generator ships no custom metadata and
    relies on the platform default).

"Build" for this project means: paste the two files (main.pjs + index.html)
into a Perchance generator. The only preprocessing in the original author's
workflow is the page's own "click here to generate" button, which produces the
`m1() => return \`...\`;` snippet the user copies — that is documented in
internal-code/decomposed/index.inline-script.js.
