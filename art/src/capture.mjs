import puppeteer from "puppeteer";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist", "index.html");
const WIDTH = 800;
const HEIGHT = 480;

if (!existsSync(DIST)) {
  console.error("dist/index.html not found — run 'npm run build' first");
  process.exit(1);
}

const outArg = process.argv.indexOf("--out");
const outDir = outArg !== -1 ? resolve(process.argv[outArg + 1]) : resolve(__dirname, "..", "images");
mkdirSync(outDir, { recursive: true });

const sceneArg = process.argv.indexOf("--scene");
const scene = sceneArg !== -1 ? process.argv[sceneArg + 1] : undefined;
if (!scene) {
  console.error("Usage: node src/capture.mjs --scene <name> [--out dir]");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outPath = resolve(outDir, `${timestamp}.png`);

const browser = await puppeteer.launch({
  headless: true,
  timeout: 120_000,
  dumpio: true,
  args: [
    `--window-size=${WIDTH},${HEIGHT}`,
    "--allow-file-access-from-files",
    "--no-sandbox",
    "--use-gl=swiftshader",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT });
page.on("console", (msg) => console.error("[PAGE]", msg.text()));
page.on("pageerror", (err) => console.error("[PAGE_ERROR]", err.message));

await page.goto(`file://${DIST}?scene=${encodeURIComponent(scene)}`, {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
await new Promise((r) => setTimeout(r, 500));

const canvas = await page.$("canvas");
if (!canvas) {
  await page.screenshot({ path: resolve(outDir, "debug.png") });
  console.error("No canvas found on page; debug screenshot saved");
  process.exit(1);
}
const box = await canvas.boundingBox();

await page.screenshot({
  path: outPath,
  clip: { x: box.x, y: box.y, width: box.width, height: box.height },
});

console.log(outPath);

await browser.close();
