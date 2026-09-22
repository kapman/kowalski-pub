/**
 * Entry point. Mounts one scene per page load: the one named by the
 * ?scene= query parameter, or a random one if absent. import.meta.glob is
 * statically analyzed by Vite, so every scene is bundled and loadable at
 * runtime without a rebuild.
 */
const SCENES = import.meta.glob("./scenes/*.ts") as Record<
  string,
  () => Promise<unknown>
>;

const requested = new URLSearchParams(window.location.search).get("scene");
const keys = Object.keys(SCENES);

const load = requested ? SCENES[`./scenes/${requested}.ts`] : SCENES[randomKey(keys)];

if (!load) {
  const available = keys
    .map((k) => k.replace("./scenes/", "").replace(/\.ts$/, ""))
    .join(", ");
  throw new Error(`Unknown scene "${requested}". Available: ${available}`);
}

await load();

function randomKey(scenes: string[]): string {
  return scenes[Math.floor(Math.random() * scenes.length)];
}