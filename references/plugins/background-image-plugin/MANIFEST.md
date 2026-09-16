# MANIFEST — background-image-plugin-complete-package

Byte-exact inventory. All sizes are exact file sizes in bytes.

## 01-internal-code/ (project source — ships with the generator)
| File | Bytes | Role |
|---|---|---|
| `main.pjs` | 1.331 | Perchance list code. Defines `$output (url, opacity, blur) => ...`, the plugin's exported callable. Handles both a URL string and a structured `bgData` list. |
| `index.html` | 8.380 | HTML panel. Plugin documentation/landing page, styled with a local `<style>` block, and ends with a live demo call `[$output("https://i.imgur.com/64c6NnI.jpg", 0.7)]`. |

## 02-external-code/ (third-party code, libraries, modules, tools)
**None.** The generator declares no `{import:...}` plugins, loads no `<script src>`,
imports no ES/CommonJS modules, and bundles no libraries. See `DEPENDENCIES.md`.

## 03-third-party-assets/ (externally hosted assets the project references)
All 14 files are fetched from the public host `i.imgur.com`. They are example
backgrounds listed in `index.html`, plus two instructional diagram images linked from the docs.
Only `64c6NnI.jpg` is actually *loaded at runtime* (by the demo call); the rest are documentation
samples. Total: 6.465.786 bytes.

| File | Bytes | Original source URL |
|---|---|---|
| `64c6NnI.jpg` | 278.247 B | https://i.imgur.com/64c6NnI.jpg |
| `Hvb6HTy.jpg` | 327.660 B | https://i.imgur.com/Hvb6HTy.jpg |
| `ecKzF9F.jpg` | 984.008 B | https://i.imgur.com/ecKzF9F.jpg |
| `785rHFl.jpg` | 453.170 B | https://i.imgur.com/785rHFl.jpg |
| `0CWEecq.jpg` | 548.558 B | https://i.imgur.com/0CWEecq.jpg |
| `E4a7yi0.jpg` | 909.458 B | https://i.imgur.com/E4a7yi0.jpg |
| `9hrHir1.jpg` | 769.099 B | https://i.imgur.com/9hrHir1.jpg |
| `EyLiFMs.jpg` | 534.308 B | https://i.imgur.com/EyLiFMs.jpg |
| `M3wXrLE.jpg` | 113.600 B | https://i.imgur.com/M3wXrLE.jpg |
| `YRUgc7j.jpg` | 325.959 B | https://i.imgur.com/YRUgc7j.jpg |
| `P4FoRy2.jpg` | 321.539 B | https://i.imgur.com/P4FoRy2.jpg |
| `mSarpKO.jpg` | 801.135 B | https://i.imgur.com/mSarpKO.jpg |
| `mLQFlON.png` | 51.999 B | https://i.imgur.com/mLQFlON.png |
| `vbTwTuS.png` | 47.046 B | https://i.imgur.com/vbTwTuS.png |

## 04-project-resources/ (project's own assets)
**None.** No images, audio, video, 3D models, animations, shaders, fonts, JSON data, prefabs,
templates, or UI resource files are defined by or shipped with the project. The visual layer is
generated entirely from inline CSS written by `main.pjs`.

## 05-build-config/ (build pipeline, config, tooling)
**None.** No package.json, tsconfig, bundler config, CI config, Dockerfile, or lockfile.
Perchance generators are interpreted directly by the platform engine at page load.

## Dependency graph
```
background-image-plugin
└── (no dependencies)
```
