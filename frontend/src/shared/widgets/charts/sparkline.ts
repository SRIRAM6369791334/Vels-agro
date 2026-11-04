import { buildCatmullRomPath } from './math';

/**
 * Micro Sparkline SVG string generator
 */
export function renderSparklineSvg(
  values: number[],
  tone = 'pine',
  width = 84,
  height = 26
): string {
  const maxVal = Math.max(1, ...values);
  const minVal = Math.min(...values);
  const denominator = Math.max(1, maxVal - minVal);
  const countDenominator = Math.max(1, values.length - 1);

  const points: [number, number][] = values.map((val, idx) => [
    (idx / countDenominator) * width,
    height - 3 - ((val - minVal) / denominator) * (height - 6),
  ]);

  const pathD = buildCatmullRomPath(points);

  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><path class="chart__line chart__line--${tone}" d="${pathD}"/></svg>`;
}
