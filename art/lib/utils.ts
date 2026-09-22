import type { ArtboardBounds } from "./scene.js";

/** Measures bounds, centers (midpoint to 0,0), and scales coordinates in-place to fit within artboard bounds. */
export function fitToBounds(
  positions: Float32Array,
  count: number,
  bounds: ArtboardBounds,
  marginMultiplier = 0.85,
): void {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const scale =
    Math.min(bounds.width / spanX, bounds.height / spanY) * marginMultiplier;

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (positions[i * 3] - midX) * scale;
    positions[i * 3 + 1] = (positions[i * 3 + 1] - midY) * scale;
  }
}

/** Deterministic 32-bit PRNG (mulberry32). Returns numbers in [0, 1). */
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Creates a helper to sample uniformly in [min, max] from a PRNG. */
export function createRandomRange(prng: () => number) {
  return (min: number, max: number) => min + prng() * (max - min);
}

/** Seed from the ?seed= query parameter, or undefined when absent. */
export function getSeedFromUrl(): number | undefined {
  const fromUrl = new URLSearchParams(window.location.search).get("seed");
  if (fromUrl === null) return undefined;
  const parsed = Number.parseInt(fromUrl, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
