import {
  Scene,
  Color,
  OrthographicCamera,
  WebGLRenderer,
  Vector2,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

// Matches the Inky Impression 7.3" panel resolution.
export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 480;

const DEFAULT_MARGIN = 40;
const DEFAULT_BACKGROUND = "rgb(34, 30, 27)";
const DEFAULT_FRAME_COLOR = "rgb(200, 200, 200)";
const DEFAULT_FRAME_WIDTH = 5;
const DEFAULT_FRAME_INSET = 0;

export interface ArtboardBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface SceneSetup {
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;
  bounds: ArtboardBounds;
}

export interface CreateSceneOptions {
  background?: string;
  margin?: number;
}

/**
 * Boilerplate shared by every art scene: sets up the scene/camera/renderer at
 * the panel resolution. Scenes should build their content inside the
 * returned `bounds`, not the raw WIDTH/HEIGHT, so nothing touches the outer
 * edge of the display. Call `createFrame(bounds)` and add it to the scene
 * if a scene wants a visible border — it's opt-in, not automatic.
 */
export function createScene(options: CreateSceneOptions = {}): SceneSetup {
  const margin = options.margin ?? DEFAULT_MARGIN;

  const scene = new Scene();
  scene.background = new Color(options.background ?? DEFAULT_BACKGROUND);

  const camera = new OrthographicCamera(
    SCREEN_WIDTH / -2,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2,
    SCREEN_HEIGHT / -2,
  );
  camera.position.z = 100;

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  const bounds: ArtboardBounds = {
    left: SCREEN_WIDTH / -2 + margin,
    right: SCREEN_WIDTH / 2 - margin,
    top: SCREEN_HEIGHT / 2 - margin,
    bottom: SCREEN_HEIGHT / -2 + margin,
    width: SCREEN_WIDTH - margin * 2,
    height: SCREEN_HEIGHT - margin * 2,
  };

  return { scene, camera, renderer, bounds };
}

export interface FrameOptions {
  color?: string;
  linewidth?: number;
  /** Shrinks the frame rectangle inward from `bounds` by this many units on each side. */
  inset?: number;
}

/** Draws a rectangular border around (an inset of) `bounds`. Scenes opt in by calling this and adding the result to their scene. */
export function createFrame(
  bounds: ArtboardBounds,
  options: FrameOptions = {},
): Line2 {
  const inset = options.inset ?? DEFAULT_FRAME_INSET;
  const left = bounds.left + inset;
  const right = bounds.right - inset;
  const top = bounds.top - inset;
  const bottom = bounds.bottom + inset;

  const geometry = new LineGeometry();
  geometry.setPositions([
    left,
    top,
    0,
    right,
    top,
    0,
    right,
    bottom,
    0,
    left,
    bottom,
    0,
    left,
    top,
    0,
  ]);

  const material = new LineMaterial({
    color: options.color ?? DEFAULT_FRAME_COLOR,
    linewidth: options.linewidth ?? DEFAULT_FRAME_WIDTH,
    resolution: new Vector2(SCREEN_WIDTH, SCREEN_HEIGHT),
  });

  return new Line2(geometry, material);
}
