# create-instances-plugin — Complete Source Package

Generator name: `create-instances-plugin` (perchance.org/create-instances-plugin)
Public page URL: https://perchance.org/create-instances-plugin

This package contains every file used by the project: the generator's own
code, its imported dependency (vendored source copy), and this manifest.

## Layout

```
create-instances-plugin/
├── README.md                         (this file)
├── MANIFEST.md                       (file-by-file index + notes)
├── internal-code/                    # code authored for THIS generator
│   ├── main.pjs                      # perchance-js source (lists/functions/imports)
│   └── index.html                    # <body> content of the generator page
├── external-code/                    # code from other generators/plugins
│   └── create-instance-plugin/
│       └── main.pjs                  # vendored copy of the imported plugin's source
├── third-party-assets/               # (none — this project uses no third-party assets)
│   └── README.md
├── project-resources/                # (none — no images/audio/data files)
│   └── README.md
└── build-config/                     # (none — no build step, no package.json, no toolchain)
    └── README.md
```

## What this generator does

A thin wrapper plugin that extends `create-instance-plugin`. It exposes a
single function:

    createInstances(list, num, mode)  ->  Array of `num` cloned instances

Each element is produced by `createInstance(list, mode)` from the imported
`create-instance-plugin`, so it behaves exactly like `createInstance` but
returns an array of N independent clones (e.g. `cs[0]`, `cs[1]`, ...).

## Dependencies

- `create-instance-plugin` — imported via `{import:create-instance-plugin}`
  in `main.pjs`. Its full source is vendored under
  `external-code/create-instance-plugin/main.pjs`.
- No npm packages, no CDN scripts, no external libraries.
