# tabs-plugin — complete asset & source bundle

A categorized dump of **everything** that makes up this project. Verified against the
workspace: this generator consists of exactly two source files, zero imports, zero
external scripts, and zero binary assets.

## Manifest

### 1. Internal code (the project itself)
| File | Bytes | Description |
|---|---|---|
| `internal-code/main.pjs` | 7454 | Perchance-js code panel. Contains the `$output(tabList)` tab renderer, `djb2_xor` hash, `rgbToHsl`, `getCSSString` (all CSS for the widget), the inline tabs engine, and the example `tabList`. |
| `internal-code/index.html` | 3929 | HTML panel. Documentation page, live demo (`[$output(tabList)]`), and the page `<style>`. |

### 2. External code (libraries/modules/tools)
| File | Description |
|---|---|
| `external-code/vanilla-tabs-plugin-v1.0.0.min.js` | "Vanilla JavaScript Tabs v1.0.0" — vendored **inline** inside `main.pjs` as `window.Tabs`. Extracted here for review. |
| `external-code/ATTRIBUTION.md` | Origin + license + status of the third-party code. |

> No network-loaded dependencies. The only third-party code is that vendored block.

### 3. Third-party assets
None. No images, audio, video, fonts, models, shaders, sprites, animations, or
data files are used or generated.

### 4. Project resources
None on disk. All UI is generated at runtime:
- CSS for the widget: `getCSSString()` in `main.pjs`
- Tab DOM: returned HTML string from `$output(tabList)`
- Demo content: the `tabList` list at the bottom of `main.pjs`

### 5. Build / config files
None. No bundler, package.json, lockfile, CI, or toolchain. The Perchance engine
interprets `main.pjs` + `index.html` directly in the browser.

## Files in this bundle
```
tabs-plugin/
├── README.md                      <- this manifest
├── internal-code/
│   ├── main.pjs
│   └── index.html
├── external-code/
│   ├── ATTRIBUTION.md
│   └── vanilla-tabs-plugin-v1.0.0.min.js
├── assets/README.md               <- intentionally empty (documents why)
└── build-config/README.md         <- intentionally empty (documents why)
```

## How it runs
```
[app] -> perchance engine
          ├─ main.pjs  (defines $output(tabList), getCSSString, Tabs, tabList)
          └─ index.html (calls [$output(tabList)]; page <style>)
        -> injects <style> + returns tab HTML
        -> empty <img onerror> fires -> new Tabs({elem, open})
        -> click handlers switch tabs
```
