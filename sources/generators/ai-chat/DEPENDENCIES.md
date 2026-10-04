# Dependency graph

```
ai-chat (this generator)
├─ main.pjs  (imports below)
│   ├─ {import:ai-text-plugin}
│   │   └─ runtime script: https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js
│   │   └─ API host: https://text-generation.perchance.org
│   ├─ {import:upload-plugin}
│   │   └─ runtime data: https://user.uploads.dev/file/fcf0aa53193434e1de2a3a2b878bb893.txt
│   │   └─ API hosts: https://upload.perchance.org, https://editable.uploads.dev
│   ├─ {import:tabbed-comments-plugin-v1}
│   │   ├─ {import:comments-plugin}
│   │   │   ├─ {import:my-emoji-list-url}
│   │   │   └─ API host: https://comments-plugin.perchance.org
│   │   ├─ {import:ai-text-plugin}
│   │   └─ {import:huge-emoji-list}
│   │       └─ dataset: https://user.uploads.dev/file/a39d52b89a33865b9a903fcc5786a2da.txt
│   ├─ {import:comments-plugin}  (feedback button)
│   ├─ {import:fullscreen-button-plugin}
│   ├─ {import:literal-plugin}
│   ├─ {import:bug-report-plugin}
│   │   ├─ {import:dynamic-import-plugin}
│   │   │   └─ API: https://perchance.org/api/getGeneratorsAndDependencies
│   │   ├─ lib: https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js
│   │   └─ runtime script: https://user.uploads.dev/file/f2e26ac127c029f401f2a990a4bafbe8.js
│   └─ {import:text-editor-plugin-v1}
└─ index.html
    ├─ iframe: https://null.perchance.org/blank?sendEventsToParent=true&v=21  (character gallery)
    └─ iframe: https://www.youtube-nocookie.com/embed/<id>  (optional background audio)
```

## Import lines (verbatim, from main.pjs)
ai = {import:ai-text-plugin} // the plugin that actually generates the text
upload = {import:upload-plugin} // for uploading data for share links
tabbedCommentsPlugin = {import:tabbed-comments-plugin-v1}
commentsPlugin = {import:comments-plugin} // for feedback button
fullscreenButton = {import:fullscreen-button-plugin}
literal = {import:literal-plugin} // ... 
bugReport = {import:bug-report-plugin} // ...
createTextEditor = {import:text-editor-plugin-v1} // ...
