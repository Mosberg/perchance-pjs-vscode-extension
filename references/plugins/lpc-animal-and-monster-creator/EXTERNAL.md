# External (hosted) artefacts

These are the only things that live outside the generator's own source. Everything
else is inside this zip.

| what | url |
| --- | --- |
| plugin bundle (built from `src/plugin.js`) | https://user.uploads.dev/file/fcde6dcee16cffac6ae21cc517fb4a51.js |
| catalog JSON (built from `src/sheets/**`) | https://user.uploads.dev/file/27e36c970aba9ca460ae230c015c201e.json |
| \$meta listing/share image | https://user.uploads.dev/file/97022216b3a909d7540e29551cf953ec.jpg |

## Plugin bundle

An ES module another generator imports. It re-exports `src/plugin.js` bundled with
core+app+styles and the catalog URL baked in as `DEFAULT_CATALOG_URL`. A copy of the
exact deployed file is in `external/bundle.js` in this zip.

Use it from a generator's `main.pjs`:

```pjs
lpcAnimals = {import:lpc-animal-and-monster-creator}
```

then in JS (importing the generator yields the facade object directly — NOT a function):

```js
const creator = root.lpcAnimals;
const sprite  = await creator.createSprite("bear~polar", { scale: 2 });
sprite.drawWithShadow(ctx, x, y, { anim: "walk", dir: "down", frame: 3 });
```

Or skip the facade and load the bundle yourself:

```js
const mod = await import("https://user.uploads.dev/file/fcde6dcee16cffac6ae21cc517fb4a51.js");
const sprite = await mod.createSprite("bear~polar");   // catalog url is baked in
```

## Catalog

Same content as `src/lpc-creatures/catalog.json` (39 creatures / 59 variants /
118 animations / 1392 frames). `sheets` maps each sheet's rel-path to its hosted PNG
below. Rebuild + re-upload with `src/tools/build-catalog.mjs` (see `src/BUILD.md`).

## Sheet PNGs (96)

### animals (29)

| `animals/bear-black-shadow.png` | https://user.uploads.dev/file/8ccd65443c1fc792286d21e6a72cfc1c.png |
| `animals/bear-black.png` | https://user.uploads.dev/file/6a712de2dfcb0d7f3e24f4e56edf5f54.png |
| `animals/bear-grizzly-shadow.png` | https://user.uploads.dev/file/f0e32909e4ab5f2967566e930d28fe0a.png |
| `animals/bear-grizzly.png` | https://user.uploads.dev/file/a9552bbbd38d2d791a5a26c9492dab88.png |
| `animals/bear-polar-shadow.png` | https://user.uploads.dev/file/57335772147c79f06d9b0d08b8c781c2.png |
| `animals/bear-polar.png` | https://user.uploads.dev/file/326a992a3b140d8797e6a4a4599e61f1.png |
| `animals/deer-dark-buck-shadow.png` | https://user.uploads.dev/file/7ed571d7f160f613893afdbfa44c54b6.png |
| `animals/deer-dark-buck.png` | https://user.uploads.dev/file/ac7365642d0840107e70185b43a8b81b.png |
| `animals/deer-dark-doe-shadow.png` | https://user.uploads.dev/file/7ed571d7f160f613893afdbfa44c54b6.png |
| `animals/deer-dark-doe.png` | https://user.uploads.dev/file/19a4490a75ae76b226eeb34cb8a3cbdc.png |
| `animals/deer-light-buck-shadow.png` | https://user.uploads.dev/file/7ed571d7f160f613893afdbfa44c54b6.png |
| `animals/deer-light-buck.png` | https://user.uploads.dev/file/e931b7c0c36fbac174db4eeff048470e.png |
| `animals/deer-light-doe-shadow.png` | https://user.uploads.dev/file/7ed571d7f160f613893afdbfa44c54b6.png |
| `animals/deer-light-doe.png` | https://user.uploads.dev/file/65818d7efd236ed0383b8099bf3f2a21.png |
| `animals/dog-shiba-shadow.png` | https://user.uploads.dev/file/c09ecff5cd1e8bb8e73468077c54b597.png |
| `animals/dog-shiba.png` | https://user.uploads.dev/file/b9bd1aea745f6c8a85e36b74cd71cd6f.png |
| `animals/fox-arctic-shadow.png` | https://user.uploads.dev/file/fb33a7b97a9702d417c0bda82970dbde.png |
| `animals/fox-arctic.png` | https://user.uploads.dev/file/f5b09918cd667cb82d2ed2c346642a5c.png |
| `animals/fox-woods-shadow.png` | https://user.uploads.dev/file/6b9fb5b035e35fed3720e5744d81222a.png |
| `animals/fox-woods.png` | https://user.uploads.dev/file/58ced45b270782aab18671d2d4a81644.png |
| `animals/giant-rat-shadow.png` | https://user.uploads.dev/file/f7b16816a27792723dc31e4ea0756ee0.png |
| `animals/giant-rat.png` | https://user.uploads.dev/file/364389f4af5b60a233b234eead734d41.png |
| `animals/lion.png` | https://user.uploads.dev/file/c2ce9d098152469bce9095fc4aa88753.png |
| `animals/lioness.png` | https://user.uploads.dev/file/6164a42ae0ef4138b07b6f797d924a30.png |
| `animals/mushroom-walker-amanita-shadow.png` | https://user.uploads.dev/file/8d7cac0197ad57477c391b8be17bb37d.png |
| `animals/mushroom-walker-amanita.png` | https://user.uploads.dev/file/571494b3ddda67659b2d3898a7921bcf.png |
| `animals/mushroom-walker-shadow.png` | https://user.uploads.dev/file/8d7cac0197ad57477c391b8be17bb37d.png |
| `animals/mushroom-walker.png` | https://user.uploads.dev/file/2a4fe0ccabac935a21a787faa9496d31.png |
| `animals/shark.png` | https://user.uploads.dev/file/f7864175e57d9d94caccad86a024d77a.png |

### birds (1)

| `birds/raven-seagull.png` | https://user.uploads.dev/file/2149d3cb3f7a160db975cc7b94b0cd64.png |

### critters (12)

| `critters/beetle-black.png` | https://user.uploads.dev/file/3572cbf83d0c5ff2fe33a4b4bc5bf8e8.png |
| `critters/beetle-fire.png` | https://user.uploads.dev/file/446ff97bf273f67ad804e24756c24bf4.png |
| `critters/beetle-ice.png` | https://user.uploads.dev/file/f8d69547cd40897bf26ee5378a3ad670.png |
| `critters/beetle-poison.png` | https://user.uploads.dev/file/d6f4815cd59104f9f39914e9c1fea9b1.png |
| `critters/cat-black.png` | https://user.uploads.dev/file/ea7479af04e60fd0e98839807b1992a0.png |
| `critters/cat-brown.png` | https://user.uploads.dev/file/8903efb7730d4a075e91b1d051365bb1.png |
| `critters/cat-orange.png` | https://user.uploads.dev/file/02b91cb549e34d2385cfd30af0172e5b.png |
| `critters/cat-white.png` | https://user.uploads.dev/file/2c070051c983bd1591d01bfa11d3c144.png |
| `critters/pig-boar.png` | https://user.uploads.dev/file/54c266281e3240f0ac2b4fdf614179a5.png |
| `critters/pig.png` | https://user.uploads.dev/file/e401a792dee7ce85ac0e4e276a4da0f5.png |
| `critters/piglet.png` | https://user.uploads.dev/file/7cc2d9a466a33ea53f749bf77e71e918.png |
| `critters/rabbit.png` | https://user.uploads.dev/file/964dfc5dec759216c6580211ffa5d55f.png |

### farm (13)

| `farm/chicken-eat.png` | https://user.uploads.dev/file/02c5c8d4587d0621a4ade84b8ef352f0.png |
| `farm/chicken-shadow.png` | https://user.uploads.dev/file/fc337092c96e7ed6158682679f4e3e6e.png |
| `farm/chicken-walk.png` | https://user.uploads.dev/file/6bb83c86de8d6e8ffd079bb31119e25c.png |
| `farm/cow-eat.png` | https://user.uploads.dev/file/5c46f08d5fef395f2b0bf39d4ab2a0c0.png |
| `farm/cow-shadow.png` | https://user.uploads.dev/file/6a675938c4135655992c848abe09ff04.png |
| `farm/cow-walk.png` | https://user.uploads.dev/file/01a1c59d3fb06f5b0e07571736bdcfb7.png |
| `farm/llama-eat.png` | https://user.uploads.dev/file/934d21eb134e41e3ab90d3c0a28a60ed.png |
| `farm/llama-shadow.png` | https://user.uploads.dev/file/e984c698a6e5cf6a8356244946fb307f.png |
| `farm/llama-walk.png` | https://user.uploads.dev/file/0edb8c75ab46312b5cf5f141a43fdc6f.png |
| `farm/pig-eat.png` | https://user.uploads.dev/file/8152b678d4b9d1a6fade4afad0b109ef.png |
| `farm/pig-walk.png` | https://user.uploads.dev/file/0febdb33bf13d1384962c38b0b867e80.png |
| `farm/sheep-eat.png` | https://user.uploads.dev/file/4904e4f9ac61faa0c6406cb1f9cc6a72.png |
| `farm/sheep-walk.png` | https://user.uploads.dev/file/7a41f53cd54186dc49c9996c9b710b06.png |

### horse (10)

| `horse/horse-black-gallop.png` | https://user.uploads.dev/file/8efc085dd4737b8b0f7e3f81e7c6c1fc.png |
| `horse/horse-black-walk.png` | https://user.uploads.dev/file/afcdfa018c7d01a372d5983ebf37fcf9.png |
| `horse/horse-brown-gallop.png` | https://user.uploads.dev/file/aa4be7ed48625dade305791210d8c74d.png |
| `horse/horse-brown-walk.png` | https://user.uploads.dev/file/b933de7c9ca7c51e59e824ff7e1b4bc9.png |
| `horse/horse-gold-gallop.png` | https://user.uploads.dev/file/41e78fac251218131f8ee88061447044.png |
| `horse/horse-gold-walk.png` | https://user.uploads.dev/file/74d6e4cf2582cd2d7f0ef21a1512a8f2.png |
| `horse/horse-gray-gallop.png` | https://user.uploads.dev/file/8b36bab26985b404a605f046f43c83c4.png |
| `horse/horse-gray-walk.png` | https://user.uploads.dev/file/5952d9285b2d2ff0ea5d3ff5fc4565b6.png |
| `horse/horse-white-gallop.png` | https://user.uploads.dev/file/f1372630c76efd28bf6904c1ab2869d3.png |
| `horse/horse-white-walk.png` | https://user.uploads.dev/file/f5101f6b9af52999fd55c93032615b2e.png |

### monsters (22)

| `monsters/bat-attack.png` | https://user.uploads.dev/file/21bc92d9b8ab59eaa6058bd9af905ffa.png |
| `monsters/bat.png` | https://user.uploads.dev/file/b95273c5ac5c48e312c5610f9f0d09c3.png |
| `monsters/bee-attack.png` | https://user.uploads.dev/file/4aaa429f84b7abd205b5abcd930adc8b.png |
| `monsters/bee.png` | https://user.uploads.dev/file/e55d8075f251f56b1603acc5572937a8.png |
| `monsters/big_worm-attack.png` | https://user.uploads.dev/file/be70ee284d35928504b9338dcd5f8330.png |
| `monsters/big_worm.png` | https://user.uploads.dev/file/a6f67d0fa23dd8c536fb52cfba3b3682.png |
| `monsters/eyeball-attack.png` | https://user.uploads.dev/file/2f8c35275020ff3261b1cef59ff4ea72.png |
| `monsters/eyeball.png` | https://user.uploads.dev/file/351593e5b18020b4ce9fb1dcc56246c6.png |
| `monsters/ghost-attack.png` | https://user.uploads.dev/file/7fb268e17d3c76707399818240330c41.png |
| `monsters/ghost.png` | https://user.uploads.dev/file/557d1c2efdfd4365ad0d3dd349cef4f9.png |
| `monsters/man_eater_flower-attack.png` | https://user.uploads.dev/file/18bde2acdc9fd80683b37dd5c1d135ae.png |
| `monsters/man_eater_flower.png` | https://user.uploads.dev/file/6cf82ba7ba261caf94c7776c9a5e58a0.png |
| `monsters/pumpkin-monster.png` | https://user.uploads.dev/file/61e530c19eed96c67014de268b99911e.png |
| `monsters/pumpking-attack.png` | https://user.uploads.dev/file/e484d0cb7c48d3dc76347eb4af731267.png |
| `monsters/pumpking.png` | https://user.uploads.dev/file/769e52ab94895cec28415114f7dfe389.png |
| `monsters/slime-attack.png` | https://user.uploads.dev/file/7ff738561d048f48d39e9363809b8e3a.png |
| `monsters/slime-projectile.png` | https://user.uploads.dev/file/cbe2ab90bd5b8884a226d19ca321fd70.png |
| `monsters/slime.png` | https://user.uploads.dev/file/05d4bd305849826638be4249cdf5ca43.png |
| `monsters/small_worm-attack.png` | https://user.uploads.dev/file/5776180fc90d355dc56742f3b0bab9c7.png |
| `monsters/small_worm.png` | https://user.uploads.dev/file/5e41bf5e5142343251e4c102b1721715.png |
| `monsters/snake-attack.png` | https://user.uploads.dev/file/177c9f170b60643c604521406f9028c2.png |
| `monsters/snake.png` | https://user.uploads.dev/file/6c910a38cf14bf11f81130b208aecb93.png |

### mythical (6)

| `mythical/arachne.png` | https://user.uploads.dev/file/77001fcb9221b957701e96da04cdae43.png |
| `mythical/minotaur-blue.png` | https://user.uploads.dev/file/3f347a7dc914728b0335412aaf8fe42d.png |
| `mythical/minotaur-red.png` | https://user.uploads.dev/file/de7d26272aef0dc3e6ebc59e768f6257.png |
| `mythical/serpent.png` | https://user.uploads.dev/file/ee68b700bf79288bd2a40808339378b5.png |
| `mythical/werewolf-alt.png` | https://user.uploads.dev/file/8874db986714b83f312b11bb0ba8c3b9.png |
| `mythical/werewolf.png` | https://user.uploads.dev/file/d4519da4037e8c65fb640965497a76ea.png |

### wild-boar (3)

| `wild-boar/boar-attack.png` | https://user.uploads.dev/file/7c7a9c28c2f36a7bc760a65ec3b77d51.png |
| `wild-boar/boar-die.png` | https://user.uploads.dev/file/517da576ec666df0453e560e4ca4ecd6.png |
| `wild-boar/boar-walk.png` | https://user.uploads.dev/file/05e5922d09a059b81d975fe5ec31f90d.png |

## Other external dependencies

- `kv-plugin` — `{import:kv-plugin}` in `main.pjs`, used only for per-user
  favourites/recent picks. The UI works without it (localStorage fallback).
- `esbuild-wasm@0.21.5` (from esm.sh) — build-time only, used by
  `src/tools/build-bundle.mjs`. Not shipped to users.
- The sprite art itself comes from 17 OpenGameArt packs; per-pack authors, licences
  and source URLs are in `src/lpc-creatures/catalog.json` under `packs`.

## Additional hosted copies (from this handout)

| what | url |
| --- | --- |
| plugin bundle, unminified (same code as the deployed bundle) | https://user.uploads.dev/file/20192e559be62f7f6fe19be7a10ca924.js |
| source-file download URLs (one per file) | see `HOSTED-FILES.md` |
