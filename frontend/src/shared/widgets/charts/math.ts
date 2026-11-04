export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Calculates a clean round ceiling tick scaling (1, 2, 2.5, 5, 10 powers)
 */
export function calculateNiceScale(maxValue: number): number {
  if (maxValue <= 0) {
    return 1;
  }
  const exponent = 10 ** Math.floor(Math.log10(maxValue));
  const fraction = maxValue / exponent;
  const factor = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return factor * exponent;
}

/**
 * Generates a smooth Catmull-Rom cubic Bezier SVG path string
 * with tangent factor 0.18 and monotonic clamping to prevent overshoot.
 */
export function buildCatmullRomPath(points: [number, number][]): string {
  if (points.length < 2) {
    return '';
  }
  let path = `M${points[0][0]},${points[0][1]}`;
  const tension = 0.18;
  for (let i = 0; i < points.length - 1; i++) {
    const prev = points[i - 1] ?? points[i];
    const curr = points[i];
    const next = points[i + 1];
    const nextNext = points[i + 2] ?? next;

    const cp1: [number, number] = [
      curr[0] + (next[0] - prev[0]) * tension,
      curr[1] + (next[1] - prev[1]) * tension,
    ];
    const cp2: [number, number] = [
      next[0] - (nextNext[0] - curr[0]) * tension,
      next[1] - (nextNext[1] - curr[1]) * tension,
    ];

    const minY = Math.min(curr[1], next[1]);
    const maxY = Math.max(curr[1], next[1]);
    cp1[1] = Math.max(minY, Math.min(maxY, cp1[1]));
    cp2[1] = Math.max(minY, Math.min(maxY, cp2[1]));

    path += ` C${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${next[0]},${next[1]}`;
  }
  return path;
}

/**
 * Converts polar coordinates (angle in degrees, radius) to Cartesian [x, y]
 */
export function calculatePolarPoint(
  angleDeg: number,
  radius = 78,
  center: [number, number] = [100, 100]
): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [
    center[0] + radius * Math.sin(rad),
    center[1] - radius * Math.cos(rad),
  ];
}
