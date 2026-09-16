# MANIFEST

Generator:      https://perchance.org/navbar-plugin
Public URL:     https://perchance.org/navbar-plugin
Iframe origin:  https://33c81aa57996651621bbc6e3d0f90e38.perchance.org/navbar-plugin
Export date:    2026-09-16

## Complete inventory

### 01-internal-code/            (first-party source, verbatim)
  main.pjs                      11169 bytes - plugin logic: getPluginCss(), generateHtml(), $output(menu), default menu list
  index.html                    3898 bytes - the plugin's documentation/landing page

### 02-external-code/            (third-party code embedded in or referenced by the project)
  luxbar-base.css                       6568 bytes
  luxbar-responsive-media-query.css     532 bytes
  custom-theme-style-template.css.template452 bytes
  OPEN-SANS-FONT.txt            reference for the Google Fonts stylesheet

### 03-third-party-assets/
  luxbar-upstream/              29 files, 2425294 bytes - complete upstream luxbar repo (github.com/balzss/luxbar)
                                includes LICENSE (MIT), README.md, docs/, scss/ sources, build/luxbar.css,
                                build/luxbar.min.css (the file vendored into main.pjs), demo-app/, tests/

### 04-project-resources/
  default-menu-config.json      the default `menu` configuration shipped in main.pjs, as JSON
  menu.import.pjs               standalone reusable menu generator template
  options-reference.txt         full option surface of navbar(options)

### 05-build-config/
  README.txt                    (no build pipeline exists - explanation inside)

## Notes
- No src/ tree, no imports/ (the generator uses no {import:...} statements), no binary assets,
  no images, no audio, no models, no shaders, no generated files.
- The only third-party code path is the luxbar CSS, which is EMBEDDED VERBATIM as a string in
  main.pjs and is a lightly edited variant of build/luxbar.min.css (see 03-third-party-assets).
- Rebuild: nothing to rebuild. Edit main.pjs / index.html and the Perchance engine re-renders.
