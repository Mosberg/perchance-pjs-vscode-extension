/*
 * build-package.mjs — packaging pipeline for the "Zen Zombie Garden" Perchance generator.
 *
 * What it does (this is the pipeline that produced zen-zombie-garden-complete-package.zip):
 *   1. mirrors the internal tree (main.pjs, index.html, src/) into the package
 *   2. fetches every remote asset the source references, byte-exact, into 04-project-resources/
 *   3. vendors the plugin sources and the pinned three.js build
 *   4. verifies every downloaded file by magic bytes (audio frame / ID3, JPEG SOI, PNG signature)
 *   5. writes MANIFEST.json (path, bytes, sha256 for every file)
 *   6. zips the package
 *
 * Run:  npm i @zip.js/zip.js
 *       node build-package.mjs            # from the dir containing main.pjs + index.html + src/
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ZipWriter, BlobReader, BlobWriter, Uint8ArrayReader } from "@zip.js/zip.js";

const SRC = process.cwd();
const OUT = path.join(SRC, "dist", "zen-zombie-garden-complete-package");
const ZIP = path.join(SRC, "dist", "zen-zombie-garden-complete-package.zip");

const UPLOAD = "https://user.uploads.dev/file/";

// Every remote asset referenced by main.pjs / index.html, with its role.
// [ upload hash, ext, destination inside the package, role ]
const ASSETS = [
  ["1bf2f1520bbb9c327b78d28937f4cf03", "mp3", "audio/music/maps/moonlit-zen-garden.mp3", "Map music - Moonlit Zen Garden"],
  ["2382042655d29a6ed95eb611ff5fc815", "mp3", "audio/music/maps/crimson-shrine.mp3", "Map music - Crimson Shrine"],
  ["74f4f1440a840e20b2ff6632a156e56c", "mp3", "audio/music/maps/bamboo-forest.mp3", "Map music - Bamboo Forest (+ Custom Map default)"],
  ["e21e4ac1b9cbc015f4a48d65633a51f0", "mp3", "audio/music/maps/undertale-the-ruins.mp3", "Map music - Undertale: The Ruins"],
  ["8465437b16102a86fb06375874d2d542", "mp3", "audio/music/calling-cards/red-static.mp3", "Calling card music - RED STATIC"],
  ["695a9bdb485e70b1f6e1a1e90803ce32", "mp3", "audio/music/calling-cards/zen-zombie.mp3", "Calling card music - Zen Zombie"],
  ["55ef4103b4f5745a7fd18a6c40292604", "mp3", "audio/music/calling-cards/sakura-serenade.mp3", "Calling card music - Sakura Serenade"],
  ["d20b891664e05df303db25edebc02a57", "mp3", "audio/music/calling-cards/solar-halo.mp3", "Calling card music - Solar Halo / Apex Legend"],
  ["5bcf2fa82eb9708ffc70075ab205f9f3", "mp3", "audio/music/calling-cards/star-glitch.mp3", "Calling card music - Star Glitch"],
  ["69919b4985f4de0825f8c515c09b184d", "mp3", "audio/music/calling-cards/chaos-glitch.mp3", "Calling card music - Chaos Glitch"],
  ["e8da7c5f8498ee529f7828231ff13a78", "mp3", "audio/music/calling-cards/fatal-error.mp3", "Calling card music - FATAL ERROR"],
  ["893e91a66a8004a627092627465aac8d", "mp3", "audio/music/calling-cards/blackout.mp3", "Calling card music - Blackout"],
  ["6af3ec063c817d4c91e8e88777f6616a", "mp3", "audio/music/calling-cards/blue-moon.mp3", "Calling card music - Blue Moon"],
  ["b97f9a9ad64b417bb09e272931c0f371", "mp3", "audio/music/calling-cards/smoke-card.mp3", "Calling card music - Smoke Card"],
  ["929821f1ff569172ecfd863c130a1096", "mp3", "audio/music/calling-cards/crimson-howl.mp3", "Calling card music - Crimson Howl"],
  ["fe3e139f99741392b6d0807f8263d6bb", "mp3", "audio/sfx/weapons/handgun-click.mp3", "Weapon SFX - handgunClick"],
  ["98b2d62af687ed0b7ac94eab7c6c7c58", "mp3", "audio/sfx/weapons/handgun-release.mp3", "Weapon SFX - handgunRelease"],
  ["f21a07cd85a206ca7ebf8490d2053206", "mp3", "audio/sfx/weapons/handgun-movement.mp3", "Weapon SFX - handgunMovement"],
  ["96ad741d02809a13cc505a7163803498", "mp3", "audio/sfx/weapons/shotgun-pump.mp3", "Weapon SFX - shotgunPump"],
  ["fe42bf0de1bb4426c6d6f60f47bc90c4", "mp3", "audio/sfx/weapons/shotgun-hard-pump.mp3", "Weapon SFX - shotgunHardPump"],
  ["7aae7d2a86a0ff2487390719fcc9cf10", "mp3", "audio/sfx/weapons/shotgun-long-pump.mp3", "Weapon SFX - shotgunLongPump"],
  ["278ba4a5e8ca35f3377979d2e9903706", "mp3", "audio/sfx/weapons/revolver-spin.mp3", "Weapon SFX - revolverSpin"],
  ["88d49389ea1f3b350b3bfd074b119496", "mp3", "audio/sfx/weapons/laser-shot.mp3", "Weapon SFX - laserShot"],
  ["79ae549fb8f22ea0f2c2cddab1e39f4e", "mp3", "audio/sfx/weapons/laser-cannon.mp3", "Weapon SFX - laserCannon"],
  ["04c43cd6037c6ce20fe8b28c7b266700", "jpg", "images/social-preview.jpg", "Social/listing image ($meta.image)"],
  ["6ff8770574338af58f54c39f13a10d30", "jpg", "images/card-cosmic-spiral.jpg", "Calling card art - Cosmic Spiral"],
  ["9d7b83972537e2a8f473b555b107c8b5", "jpg", "images/card-flowery.jpg", "Calling card art - Flowery"],
  ["d12323b6c4adf467795083190fd885ac", "jpg", "images/card-thunder-strike.jpg", "Calling card art - Thunder Strike"],
  ["d4d89b98dee3ea6271f79854276b430c", "jpg", "images/card-thunder-strike-banner.jpg", "Calling card banner - Thunder Strike"],
  ["793f7bd9eeb730ed28283a1966064275", "png", "images/weapon-real-knife.png", "Weapon art - Real Knife"],
  ["f18455f4e1c2438573ddb64e84dbc811", "png", "images/weapon-cid-slime-sword.png", "Weapon art - Cid's Slime Sword"],
];

const PLUGINS = ["ai-text-plugin", "comments-plugin", "server-plugin", "text-to-image-plugin"];
const THREE = ["https://unpkg.com/three@0.160.0/build/three.module.js", "three-0.160.0/three.module.js"];
const INTERNAL = [
  ["main.pjs", "01-internal-code/main.pjs"],
  ["index.html", "01-internal-code/index.html"],
  ["src/README.md", "01-internal-code/src/README.md"],
  ["src/Midnight_Ascent.mp3", "01-internal-code/src/Midnight_Ascent.mp3"],
];

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

function magic(buf, ext) {
  if (ext === "jpg") return buf[0] === 0xff && buf[1] === 0xd8 ? "jpeg" : "BAD";
  if (ext === "png") return buf[0] === 0x89 && buf[1] === 0x50 ? "png" : "BAD";
  if (ext === "mp3") {
    if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return "mp3";
    if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return "mp3";
    return "BAD";
  }
  return "unknown";
}

async function get(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const r = await fetch(url);
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    await new Promise((res) => setTimeout(res, 800 * (i + 1))); // upload host intermittently 404s under burst load
  }
  throw new Error("failed after retries: " + url);
}

const files = []; // { path (package-relative), bytes, sha256 }

function put(rel, buf) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  files.push({ path: rel, bytes: buf.length, sha256: sha256(buf) });
}

// 1. internal tree -----------------------------------------------------------
for (const [from, to] of INTERNAL) put(to, fs.readFileSync(path.join(SRC, from)));

// 2. vendored plugin sources -------------------------------------------------
for (const p of PLUGINS) put(`02-external-code/imports/${p}/main.pjs`, fs.readFileSync(path.join(SRC, "imports", p, "main.pjs")));

// 3. third-party library -----------------------------------------------------
put(`03-third-party-assets/${THREE[1]}`, await get(THREE[0]));

// 4. remote project media ----------------------------------------------------
for (const [hash, ext, rel, role] of ASSETS) {
  const buf = await get(UPLOAD + hash + "." + ext);
  if (magic(buf, ext) === "BAD") throw new Error("bad magic bytes: " + rel);
  console.log("ok", role, buf.length);
  put("04-project-resources/" + rel, buf);
}

// 5. manifest ----------------------------------------------------------------
files.sort((a, b) => a.path.localeCompare(b.path));
fs.writeFileSync(
  path.join(OUT, "MANIFEST.json"),
  JSON.stringify({ package: "zen-zombie-garden", generated: new Date().toISOString(), files }, null, 2)
);

// 6. zip ---------------------------------------------------------------------
const zip = new ZipWriter(new BlobWriter("application/zip"));
for (const f of files.map((f) => f.path).concat("MANIFEST.json")) {
  zip.add(f, new BlobReader(new Blob([fs.readFileSync(path.join(OUT, f))])));
}
fs.writeFileSync(ZIP, Buffer.from(await (await zip.close()).arrayBuffer()));
console.log("wrote", ZIP, fs.statSync(ZIP).size, "bytes,", files.length, "files");
