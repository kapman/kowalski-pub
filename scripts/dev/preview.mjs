#!/usr/bin/env node
// Starts the Vite dev server for the artwork package and opens the given
// scene. Remaining arguments are forwarded to the Vite CLI.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const scenesDir = path.join(repoRoot, "art", "scenes");
const viteBin = path.join(repoRoot, "art", "node_modules", ".bin", "vite");

const args = process.argv.slice(2);
const openArgs = [];

const sceneArg = args[0] && !args[0].startsWith("-") ? args[0] : null;
if (!sceneArg) {
  console.error("Usage: npm run preview-scene <scene-path> [vite-args...]");
  process.exit(1);
}
const scenePath = /\.(ts|js)$/.test(sceneArg)
  ? path.resolve(sceneArg)
  : path.join(scenesDir, `${sceneArg}.ts`);
if (!scenePath.startsWith(scenesDir) || !existsSync(scenePath)) {
  console.error(`Scene not found: ${sceneArg} (expected a file under art/scenes/)`);
  process.exit(1);
}
const scene = path.basename(scenePath).replace(/\.(ts|js)$/, "");
args.shift();
openArgs.push("--open", `/?scene=${scene}`);

spawn(viteBin, ["art", ...openArgs, ...args], { stdio: "inherit", cwd: repoRoot });