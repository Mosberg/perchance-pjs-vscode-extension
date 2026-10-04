// LPC Animals & Monsters — entry point for the creator's own page.
//
//   import { mountAnimalCreator, openAnimalCreator, createSprite, loadCatalog }
//     from "./src/lpc-creatures/index.js";
//
// `core.js` is UI-free and safe to import on its own (that is what the game
// integration uses through the plugin bundle); the editor UI lives in `app.js`
// and is only pulled in when you actually mount/open the creator.

export * from "./core.js";
export { CSS } from "./styles.js";

const DEFAULT_HEIGHT = "min(780px, 86vh)";

/** Mount the creator UI inside `container`; returns the controller. */
export async function mountAnimalCreator(container, opts = {}) {
  if (!container || typeof container.appendChild !== "function") {
    throw new Error("mountAnimalCreator(container): a DOM element is required");
  }
  if (opts.height) container.style.height = opts.height;
  else if (opts.height !== false && !container.style.height) container.style.height = DEFAULT_HEIGHT;
  const { mount } = await import("./app.js");
  return mount(container, opts);
}

/** Open the creator in a full-screen overlay; resolves with the pick (or null). */
export async function openAnimalCreator(opts = {}) {
  const { open } = await import("./app.js");
  return open(opts);
}
