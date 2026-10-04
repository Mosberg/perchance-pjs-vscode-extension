# Dependency & Asset Audit — External Code

Runtime imports found in main.pjs: NONE
CDN / <script src> in index.html:   NONE
npm / package.json:                 NONE (no such file exists)
CSS frameworks / webfonts:          NONE
WASM / workers / service workers:   NONE

Workspace inventory (exhaustive):
  main.pjs    1606 B    internal code
  index.html  5204 B    internal code
  AGENTS.md  51258 B    platform-supplied agent instructions, NOT shipped

Referenced-but-not-imported (hyperlinks in tutorial prose only):
  a-an-plugin                             https://perchance.org/a-an-plugin
  locker-plugin                           https://perchance.org/locker-plugin
  nestable-tap-plugin                     https://perchance.org/nestable-tap-plugin
  multiple-independent-outputs-example    https://perchance.org/multiple-independent-outputs-example
  tap-plugin-example                      https://perchance.org/tap-plugin-example
  tap-plugin-example-no-tap               https://perchance.org/tap-plugin-example-no-tap
  tap-plugin-example-a-an                 https://perchance.org/tap-plugin-example-a-an
  html-css tutorial (khanacademy)         https://www.khanacademy.org/computing/computer-programming/html-css
  reddit user credit                      https://www.reddit.com/user/motorhorst/

Conclusion: this generator is fully self-contained.
