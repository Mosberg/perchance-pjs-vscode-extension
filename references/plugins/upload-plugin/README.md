# upload-plugin — complete source package

Generator: https://perchance.org/upload-plugin
Public id: abb1218e3e7efc2a16ba9600d3b64f1e
Files: 2 (main.pjs 10271 bytes, index.html 10026 bytes)

## What this project is
A Perchance *plugin* generator. It exposes a single callable, `upload(data, opts)`,
which lets any generator programmatically upload strings/Blobs to Perchance's file
storage server and get back a URL. It also exposes `upload.editable` for stable-URL
editable text files, and (via `getUploadOutput()`) a "lazy promise" whose `toString()`
renders an inline `uploading... <a>` element when used in templates.

## Categories

### internal-code/
- main.pjs    - all plugin logic: upload(), getUploadOutput(), ensureUploadPluginIframe(),
                getEditableObj(). No imports, no `$meta` block.
- index.html  - the plugin's documentation page (static HTML + inline styles), plus the
                red "don't fork this" banner that is hidden when window.generatorName === "upload-plugin".

### external-code/
- See external-code/EXTERNAL-DEPENDENCIES.md. There is NO vendored third-party JS:
  the plugin has zero imports (no {import:...} lines) and loads no scripts, fonts or
  libraries. Everything cross-origin is a Perchance-run HTTP service.
- CRITICAL: the actual upload/permission logic lives in undocumented Perchance SERVER
  code at https://upload.perchance.org (and https://editable.uploads.dev). It is not
  public source and cannot be included here. main.pjs is only the client half of the
  protocol; the message protocol is documented from the client side in the md file.

### third-party-assets/
- None. No images, audio, models, shaders, animations or fonts.

### project-resources/
- None. No JSON data, prefabs or templates.

### build-and-config/
- None. There is no build step: main.pjs and index.html ARE the shipped artifacts,
  edited directly in the Perchance editor. No package.json, no bundler, no toolchain.
  (A local agent harness file, AGENTS.md, exists in the dev workspace but is not part
  of the generator and is deliberately excluded.)

## Runtime requirements
- Browser only (DOM + postMessage + FileReader). No Node.
- window.generatorPublicId must match /^[0-9a-f]{32}$/ for upload.editable.set to work
  (i.e. the generator must be saved); otherwise it returns error
  "editable_requires_saved_generator".
- An invisible 1x1 iframe to https://upload.perchance.org/embed#{"email":false,"sessionToken":false}
  is created on first use and re-created if it does not report ready within 20s.
