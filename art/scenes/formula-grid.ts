import { range } from "d3-array";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
} from "three";
import { parabolicWave } from "../lib/formulas.js";
import { createRandomRange, fitToBounds, mulberry32, getSeedFromUrl } from "../lib/utils.js";
import { createScene } from "../lib/scene.js";

const CONFIG = {
  seed: getSeedFromUrl() ?? Date.now(),
  step: 0.01,
  marginMultiplier: 0.9,
  pointColor: "rgb(220, 220, 220)",
  pointSize: 1.2,
  pointOpacity: 0.1,
  backgroundColor: "rgb(20, 20, 25)",
};

const random = mulberry32(CONFIG.seed);
const randomRange = createRandomRange(random);

const formulaParams = {
  xParabolaWeight: randomRange(-3.0, 3.0),
  yCubicWeight: randomRange(-1.5, 1.5),
};

const { scene, camera, renderer, bounds } = createScene({
  background: CONFIG.backgroundColor,
  margin: 40,
});

const values = range(-Math.PI, Math.PI + CONFIG.step / 2, CONFIG.step);
const count = values.length * values.length;
const positions = new Float32Array(count * 3);

let idx = 0;
for (const x of values) {
  for (const y of values) {
    const { x: xNew, y: yNew } = parabolicWave(x, y, formulaParams);

    positions[idx * 3] = xNew;
    positions[idx * 3 + 1] = yNew;
    positions[idx * 3 + 2] = 0;
    idx++;
  }
}

fitToBounds(positions, count, bounds, CONFIG.marginMultiplier);

const geometry = new BufferGeometry();
geometry.setAttribute("position", new BufferAttribute(positions, 3));

const material = new PointsMaterial({
  color: new Color(CONFIG.pointColor),
  size: CONFIG.pointSize,
  transparent: true,
  opacity: CONFIG.pointOpacity,
  sizeAttenuation: false,
});

scene.add(new Points(geometry, material));
renderer.render(scene, camera);
