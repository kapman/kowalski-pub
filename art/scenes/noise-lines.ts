import { ticks } from "d3-array";
import { Color, Vector2, Vector3, MathUtils } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import {
  createScene,
  // createFrame,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "../lib/scene.js";
import { mulberry32, getSeedFromUrl } from "../lib/utils.js";

const MAX_NOISE_AMP = 40;
// const MIN_LINE_WIDTH = 0.5;
// const MAX_LINE_WIDTH = 5;
const MAX_POINTS = 75;
const DISTORTION_START = 0.2;
const DISTORTION_END = 0.9;
const FREQUENCY = 0.1;
const BACKGROUND_COLOR = "rgb(20, 20, 25)";

const { scene, camera, renderer, bounds } = createScene({
  background: BACKGROUND_COLOR,
  margin: 75,
});

const lineYs = ticks(bounds.bottom, bounds.top, 15);
lineYs.forEach(createLine);

renderer.render(scene, camera);

function createLine(startY: number) {
  const material = new LineMaterial({
    color: new Color("rgb(100, 200, 0)"),
    linewidth: 2,
    resolution: new Vector2(SCREEN_WIDTH, SCREEN_HEIGHT),
  });

  const geometry = new LineGeometry();
  const xCoordinates = ticks(bounds.left, bounds.right, MAX_POINTS);

  geometry.setPositions(createVertices(startY, xCoordinates));

  const line = new Line2(geometry, material);
  scene.add(line);
}

function createVertices(startY: number, xCoordinates: number[]): number[] {
  const simplex = new SimplexNoise({ random: mulberry32(getSeedFromUrl() ?? Date.now()) });
  const vertices = [];
  const verticalNoiseFactor =
    (bounds.top - startY) / (bounds.top - bounds.bottom);

  for (let i = 0; i < xCoordinates.length; i++) {
    const xProgress = i / (xCoordinates.length - 1);
    const horizontalNoiseFactor = MathUtils.clamp(
      (xProgress - DISTORTION_START) / (DISTORTION_END - DISTORTION_START),
      0,
      1,
    );
    const maxDisplacement =
      MAX_NOISE_AMP * verticalNoiseFactor * horizontalNoiseFactor;
    const displacement =
      simplex.noise(i * FREQUENCY, startY) * maxDisplacement;

    vertices.push(xCoordinates[i], startY + displacement, 0);
  }

  return vertices;
}
