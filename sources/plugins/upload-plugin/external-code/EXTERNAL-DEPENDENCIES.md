# External dependencies (all first-party Perchance HTTP services)

This plugin contains NO bundled third-party code. The only external things it touches
are Perchance-operated servers. Their source is not published, so only the client-side
protocol contract (extracted from main.pjs) is reproduced here.

## 1. https://upload.perchance.org/embed
Purpose: the invisible 1x1 iframe that actually performs uploads on behalf of the page,
because the upload endpoint is not CORS-enabled for generators.
Setup: iframe.src = "https://upload.perchance.org/embed#" + JSON.stringify({email:false, sessionToken:false})
       iframe.style.cssText = "width:1px; height:1px; border:none; top:-100px; left:-100px; position:fixed;"
Handshake (client -> embed, via postMessage(..., "https://upload.perchance.org")):
  {type:"init"}                                            // repeated every 500ms until ready
  {type:"anonUploadRequest", requestId, dataUrl, expires, generatorName}
  {type:"editableSetRequest", requestId, generatorName, name, data, editKey}
Handshake (embed -> client, filtered by event.source === iframe.contentWindow
and event.origin === "https://upload.perchance.org"):
  {type:"uploadEmbedIsReady"}                              // sets window.__uploadPluginEmbedIsReady
  {type:"anonUploadResponse", requestId, result:{url, error, message, size, deletionUrl}}
  {type:"editableSetResponse", requestId, result:{success, status, url, size, editKey,
                                                  editCount, created, unchanged, superseded}}

## 2. https://user.uploads.dev/file/<id>
Where uploaded files live. main.pjs wraps the returned url in a String object and
overrides .replace() so that the legacy prefix "https://user-uploads.perchance.org"
is transparently rewritten to "https://user.uploads.dev" (backwards compatibility for
code that derives the file id with url.replace(prefix, "")).

Also used as a dummy deletion target when a real deletionUrl is absent:
https://user.uploads.dev/file/fcf0aa53193434e1de2a3a2b878bb893.txt

## 3. https://editable.uploads.dev/file/<generatorName>/<name>
Raw public text URL for editable files. GET returns the text (404 -> null).
Append "?v=<editCount>" to bypass the ~10s read cache after your own write.

## 4. https://upload.perchance.org/api/fileInfo?url=<url>  (or ?id=<id>)
Optional moderation API used by callers (documented in index.html, not called by
main.pjs itself): returns JSON with a "tags" array that may include "nsfw".

## 5. The Perchance engine / DSL
main.pjs is written in perchance-js: `name(args) =>` function declarations and
`$output = [...]`. `$output = [getUploadOutput()]` is what makes `{import:upload-plugin}`
resolve to the decorated `upload` function rather than the plugin's `root`.

## Quotas / limits enforced or documented
- Anonymous upload quota unless an expiry is given; `expires` <= 24h grants up to 400x
  the size and daily-quota allowance; `expires` of 1 year grants 20x.
- Editable files: 1..5 MiB, names matching /^[a-z0-9-]{1,200}$/, one commit per name per
  10s, editKey returned only on creation.
- Errors returned in `error`: "over_daily_allowance", "file_too_big", "invalid_filetype",
  "editable_requires_saved_generator", "invalid_editable_name", "invalid_data_type",
  "invalid_options", "invalid_edit_key".
- Files deletable within 3 days via the returned deletionUrl.
