# Third-party assets

## Summary

This project ships **no image, audio, model, shader, animation, font, or JSON asset files**.
The repository (and the built `.zip`) contains only text: one `.pjs` file and one `.html` file.
There is nothing binary to download.

## Assets consumed at runtime (not redistributed)

Every picture the generator displays is fetched **live** from Unsplash by the end user's
browser at page-render time. Nothing is bundled, cached, mirrored, or re-hosted by this
project, so there is no asset file to include in the package.

| Asset class | Provider | Delivery | Licence |
|---|---|---|---|
| Photographs | Unsplash / Unsplash contributors | `https://source.unsplash.com/...` redirect at runtime | Unsplash Licence - free for commercial and non-commercial use, no attribution required (attribution appreciated) |

### Why the assets are not in this archive

1. They are chosen at runtime from a live, effectively unbounded corpus - there is no fixed
   asset list to export.
2. They are third-party works. Redistributing copies in a bundle would serve no purpose and
   would divorce the files from the licence/attribution context Unsplash provides.
3. The project never stores them: `main.pjs` emits markup whose `src` *is* the remote URL.

### Provenance / licence snapshot

`unsplash-license.snapshot.html` is a saved copy of https://unsplash.com/license as it read
when this package was built. It is included as licence provenance, **not** as a shipped asset.

```
1119