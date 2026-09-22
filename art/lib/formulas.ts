export interface ParabolicWaveParams {
  xParabolaWeight: number;
  yCubicWeight: number;
}

/**
 * Coordinate transformation from cutterkom/generativeart (seed 5451 style):
 * x' = xParabolaWeight * x^2 - sin(y^2)
 * y' = yCubicWeight * y^3 - cos(x^2)
 */
export function parabolicWave(
  x: number,
  y: number,
  params: ParabolicWaveParams,
): { x: number; y: number } {
  const xNew = params.xParabolaWeight * x * x - Math.sin(y * y);
  const yNew = params.yCubicWeight * y * y * y - Math.cos(x * x);
  return { x: xNew, y: yNew };
}
