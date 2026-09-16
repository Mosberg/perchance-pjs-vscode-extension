# MANIFEST — every file in this package

## Project source files (ship with the generator)

| Path | Category | Bytes | Lines | SHA-256 |
|------|----------|-------|-------|---------|
| `main.pjs` | internal code | 2857 | 46 | `3becd031accfdc0de27b6eff56a047f8f11b8cf83edbce36df8b888f78860ebb` |
| `index.html` | internal code | 3631 | 60 | `6b5431db2de0b7e1e4a8c65567ad0671bec2b6bedec224a4ef58fd311c17fcaf` |

These two files are the complete set of files that make up the generator at
`https://perchance.org/super-fetch-plugin`. Nothing else ships.

## Files in this package (documentation only, generated for this export)

| Path | Purpose |
|------|---------|
| `README.md` | Project overview + category index |
| `MANIFEST.md` | This file — complete listing + hashes |
| `01-internal-code/main.pjs` | Byte-exact copy of the plugin implementation |
| `01-internal-code/index.html` | Byte-exact copy of the plugin documentation page |
| `02-external-code/README.md` | External dependency notes (no vendored third-party code) |
| `03-third-party-assets/README.md` | Third-party asset notes (none) |
| `04-project-resources/README.md` | Project resource notes (none) |
| `05-build-config/README.md` | Build/config notes (none) |

## Verification

To confirm a copy of `01-internal-code/main.pjs` is identical to the original:

```sh
sha256sum 01-internal-code/main.pjs    # must equal 3becd031accfdc0de27b6eff56a047f8f11b8cf83edbce36df8b888f78860ebb
sha256sum 01-internal-code/index.html  # must equal 6b5431db2de0b7e1e4a8c65567ad0671bec2b6bedec224a4ef58fd311c17fcaf
```
