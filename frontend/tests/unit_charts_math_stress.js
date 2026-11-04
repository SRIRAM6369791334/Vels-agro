import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  calculateNiceScale,
  buildCatmullRomPath,
  calculatePolarPoint,
  SVG_NS,
} from '../src/shared/widgets/charts/math.ts';

describe('1. Catmull-Rom Cubic Bezier Path Generation (buildCatmullRomPath)', () => {
  test('Empty array returns empty string', () => {
    const result = buildCatmullRomPath([]);
    assert.equal(result, '');
  });

  test('Single point array returns empty string', () => {
    const result = buildCatmullRomPath([[10, 20]]);
    assert.equal(result, '');
  });

  test('Two points generates valid cubic Bezier path without NaN or undefined', () => {
    const result = buildCatmullRomPath([[0, 100], [50, 200]]);
    assert.match(result, /^M0,100 C/);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
    assert.doesNotMatch(result, /null/);
    assert.doesNotMatch(result, /Infinity/);
  });

  test('Collinear horizontal points clamp correctly to horizontal line', () => {
    const points = [[0, 50], [25, 50], [50, 50], [75, 50], [100, 50]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    // In horizontal points, all Y coords in cubic beziers must be 50 due to monotonic clamping
    const coords = [...result.matchAll(/C([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^\s]+)/g)];
    assert.equal(coords.length, 4);
    for (const match of coords) {
      assert.equal(Number(match[2]), 50); // cp1.y
      assert.equal(Number(match[4]), 50); // cp2.y
      assert.equal(Number(match[6]), 50); // end.y
    }
  });

  test('Collinear vertical points generate valid bezier without NaN', () => {
    const points = [[50, 0], [50, 25], [50, 50], [50, 75], [50, 100]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
  });

  test('Collinear diagonal points generate smooth progression without NaN', () => {
    const points = [[0, 0], [20, 20], [40, 40], [60, 60], [80, 80]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
  });

  test('Extreme high values (10^7) handled gracefully without NaN or overflow', () => {
    const points = [[0, 1e7], [100, 5e7], [200, 2e7], [300, 1e8]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
    assert.doesNotMatch(result, /Infinity/);
  });

  test('Extreme small values (10^-6) handled gracefully without NaN', () => {
    const points = [[0, 1e-6], [100, 5e-6], [200, 2e-6]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
  });

  test('Negative coordinates handled smoothly without NaN', () => {
    const points = [[-100, -200], [-50, -50], [0, 0], [50, 100]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
  });

  test('Duplicate adjacent points handled gracefully without NaN', () => {
    const points = [[10, 20], [10, 20], [30, 40], [30, 40], [50, 60]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    assert.doesNotMatch(result, /undefined/);
  });

  test('Monotonic clamping: flat plateau between peaks does not overshoot', () => {
    // Peak at 100, then flat plateau at 50, then drop to 0
    const points = [[0, 100], [50, 50], [100, 50], [150, 0]];
    const result = buildCatmullRomPath(points);
    assert.doesNotMatch(result, /NaN/);
    // Between (50, 50) and (100, 50), minY=50, maxY=50, control points cp1.y and cp2.y must be exactly 50
    const segments = result.split(' C');
    // Segment 2 corresponds to [50, 50] -> [100, 50]
    const midSegment = segments[2];
    const match = midSegment.match(/^([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^ ]+)/);
    assert.ok(match, 'Segment must match cubic bezier format');
    assert.equal(Number(match[2]), 50, 'cp1.y must clamp to 50');
    assert.equal(Number(match[4]), 50, 'cp2.y must clamp to 50');
  });

  test('Stress fuzzing: 500 randomized point sequences all produce valid SVG paths', () => {
    for (let run = 0; run < 500; run++) {
      const len = Math.floor(Math.random() * 20) + 2;
      const pts = Array.from({ length: len }, (_, i) => [
        i * 20,
        (Math.random() - 0.5) * 2000,
      ]);
      const res = buildCatmullRomPath(pts);
      assert.ok(res.startsWith(`M${pts[0][0]},${pts[0][1]}`), 'Must start with M');
      assert.doesNotMatch(res, /NaN/, `Run ${run} produced NaN`);
      assert.doesNotMatch(res, /undefined/, `Run ${run} produced undefined`);
      assert.doesNotMatch(res, /Infinity/, `Run ${run} produced Infinity`);
    }
  });
});

describe('2. Nice Scale Tick Algorithm (calculateNiceScale)', () => {
  test('Zero input returns 1', () => {
    assert.equal(calculateNiceScale(0), 1);
  });

  test('Negative inputs return 1', () => {
    assert.equal(calculateNiceScale(-1), 1);
    assert.equal(calculateNiceScale(-100), 1);
    assert.equal(calculateNiceScale(-0.0001), 1);
  });

  test('Floating point decimals produce correct ceiling scales', () => {
    // 0.25 -> 0.25 or 0.5 or nice round scale
    const s025 = calculateNiceScale(0.25);
    assert.ok(s025 >= 0.25, 'Scale must be >= value');
    assert.ok(Number.isFinite(s025));

    const s0001 = calculateNiceScale(0.001);
    assert.ok(s0001 >= 0.001);

    const s077 = calculateNiceScale(0.77);
    assert.equal(s077, 1);

    const s105 = calculateNiceScale(1.05);
    assert.equal(s105, 2);

    const s23 = calculateNiceScale(2.3);
    assert.equal(s23, 2.5);

    const s49 = calculateNiceScale(4.9);
    assert.equal(s49, 5);

    const s999 = calculateNiceScale(9.99);
    assert.equal(s999, 10);
  });

  test('Powers of 10 from 10^0 to 10^7 invariant: calculateNiceScale(10^k) == 10^k', () => {
    for (let k = 0; k <= 7; k++) {
      const val = 10 ** k;
      const scale = calculateNiceScale(val);
      assert.equal(scale, val, `Nice scale of 10^${k} must be 10^${k}`);
    }
  });

  test('Values just above powers of 10 round up to 2 * 10^k', () => {
    for (let k = 0; k <= 6; k++) {
      const val = 10 ** k * 1.01;
      const expected = 10 ** k * 2;
      const scale = calculateNiceScale(val);
      assert.equal(scale, expected, `Nice scale of ${val} must be ${expected}`);
    }
  });

  test('Values between 2.01 and 2.5 round up to 2.5 * 10^k', () => {
    for (let k = 0; k <= 6; k++) {
      const val = 10 ** k * 2.1;
      const expected = 10 ** k * 2.5;
      const scale = calculateNiceScale(val);
      assert.equal(scale, expected, `Nice scale of ${val} must be ${expected}`);
    }
  });

  test('Values between 2.51 and 5.0 round up to 5 * 10^k', () => {
    for (let k = 0; k <= 6; k++) {
      const val = 10 ** k * 3.4;
      const expected = 10 ** k * 5;
      const scale = calculateNiceScale(val);
      assert.equal(scale, expected, `Nice scale of ${val} must be ${expected}`);
    }
  });

  test('Values between 5.01 and 10.0 round up to 10 * 10^k', () => {
    for (let k = 0; k <= 6; k++) {
      const val = 10 ** k * 7.8;
      const expected = 10 ** k * 10;
      const scale = calculateNiceScale(val);
      assert.equal(scale, expected, `Nice scale of ${val} must be ${expected}`);
    }
  });

  test('Monotonicity invariant: x1 < x2 => calculateNiceScale(x1) <= calculateNiceScale(x2)', () => {
    let prevScale = calculateNiceScale(1);
    for (let v = 1; v <= 5000; v += 7.3) {
      const currentScale = calculateNiceScale(v);
      assert.ok(
        currentScale >= prevScale,
        `Monotonicity failed at v=${v}: ${currentScale} < ${prevScale}`
      );
      assert.ok(currentScale >= v, `Ceiling invariant failed at v=${v}: ${currentScale} < ${v}`);
      prevScale = currentScale;
    }
  });
});

describe('3. Polar Coordinates (calculatePolarPoint)', () => {
  test('0 degrees points straight UP (12 o clock)', () => {
    const [x, y] = calculatePolarPoint(0, 100, [100, 100]);
    assert.equal(Math.round(x), 100);
    assert.equal(Math.round(y), 0);
  });

  test('90 degrees points straight RIGHT (3 o clock)', () => {
    const [x, y] = calculatePolarPoint(90, 100, [100, 100]);
    assert.equal(Math.round(x), 200);
    assert.equal(Math.round(y), 100);
  });

  test('180 degrees points straight DOWN (6 o clock)', () => {
    const [x, y] = calculatePolarPoint(180, 100, [100, 100]);
    assert.equal(Math.round(x), 100);
    assert.equal(Math.round(y), 200);
  });

  test('-90 (or 270) degrees points straight LEFT (9 o clock)', () => {
    const [x, y] = calculatePolarPoint(-90, 100, [100, 100]);
    assert.equal(Math.round(x), 0);
    assert.equal(Math.round(y), 100);
  });
});
