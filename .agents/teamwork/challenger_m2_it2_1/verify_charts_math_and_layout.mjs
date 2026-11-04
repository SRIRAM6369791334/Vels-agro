import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const frontendDir = 'E:/dashborad clone/frontend';
const mathUrl = pathToFileURL(path.resolve(frontendDir, 'dist/assets/math-oUHj7Rlf.js')).href;
const sparklineUrl = pathToFileURL(path.resolve(frontendDir, 'dist/assets/sparkline-CIIZ9k9A.js')).href;

const { c: calculateNiceScale, b: buildCatmullRomPath, a: calculatePolarPoint, S: SVG_NS } = await import(mathUrl);
const { r: renderSparklineSvg } = await import(sparklineUrl);

console.log('=================================================================');
console.log('STANDALONE EMPIRICAL VERIFICATION: Visualization Engine Math & SVG');
console.log('=================================================================');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

// 1. Catmull-Rom Cubic Bezier Path Generation
runTest('Catmull-Rom: Empty points array returns empty string', () => {
  assert.equal(buildCatmullRomPath([]), '');
});

runTest('Catmull-Rom: Single point returns empty string', () => {
  assert.equal(buildCatmullRomPath([[10, 20]]), '');
});

runTest('Catmull-Rom: Two points generates valid cubic Bezier path without NaN', () => {
  const pathD = buildCatmullRomPath([[0, 100], [50, 200]]);
  assert.match(pathD, /^M0,100 C/);
  assert.doesNotMatch(pathD, /NaN/);
  assert.doesNotMatch(pathD, /undefined/);
  assert.doesNotMatch(pathD, /null/);
  assert.doesNotMatch(pathD, /Infinity/);
});

runTest('Catmull-Rom: Monotonic clamping on horizontal line', () => {
  const points = [[0, 50], [25, 50], [50, 50], [75, 50], [100, 50]];
  const pathD = buildCatmullRomPath(points);
  assert.doesNotMatch(pathD, /NaN/);
  const segments = [...pathD.matchAll(/C([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^\s]+)/g)];
  assert.equal(segments.length, 4);
  for (const match of segments) {
    assert.equal(Number(match[2]), 50); // cp1.y
    assert.equal(Number(match[4]), 50); // cp2.y
    assert.equal(Number(match[6]), 50); // end.y
  }
});

runTest('Catmull-Rom: Collinear diagonal points generate smooth progression without NaN', () => {
  const points = [[0, 0], [20, 20], [40, 40], [60, 60], [80, 80]];
  const pathD = buildCatmullRomPath(points);
  assert.doesNotMatch(pathD, /NaN/);
  assert.doesNotMatch(pathD, /undefined/);
});

runTest('Catmull-Rom: Negative coordinates handled smoothly without NaN', () => {
  const points = [[-100, -200], [-50, -50], [0, 0], [50, 100]];
  const pathD = buildCatmullRomPath(points);
  assert.doesNotMatch(pathD, /NaN/);
  assert.doesNotMatch(pathD, /undefined/);
});

runTest('Catmull-Rom: Extreme values (10^9 to 10^12) handled without overflow', () => {
  const points = [[0, 1e9], [100, 5e11], [200, 2e10], [300, 1e12]];
  const pathD = buildCatmullRomPath(points);
  assert.doesNotMatch(pathD, /NaN/);
  assert.doesNotMatch(pathD, /Infinity/);
});

runTest('Catmull-Rom: Monotonic clamping flat plateau does not overshoot', () => {
  const points = [[0, 100], [50, 50], [100, 50], [150, 0]];
  const pathD = buildCatmullRomPath(points);
  const segments = pathD.split(' C');
  const midSegment = segments[2];
  const match = midSegment.match(/^([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^ ]+)/);
  assert.ok(match);
  assert.equal(Number(match[2]), 50);
  assert.equal(Number(match[4]), 50);
});

runTest('Catmull-Rom: Fuzz stress test with 1,000 randomized sequences', () => {
  for (let run = 0; run < 1000; run++) {
    const len = Math.floor(Math.random() * 25) + 2;
    const pts = Array.from({ length: len }, (_, i) => [
      i * 15,
      (Math.random() - 0.5) * 50000,
    ]);
    const res = buildCatmullRomPath(pts);
    assert.ok(res.startsWith(`M${pts[0][0]},${pts[0][1]}`));
    assert.doesNotMatch(res, /NaN/);
    assert.doesNotMatch(res, /undefined/);
    assert.doesNotMatch(res, /Infinity/);
  }
});

// 2. Nice Scale Tick Scaling
runTest('NiceScale: Zero and negative inputs return safe 1', () => {
  assert.equal(calculateNiceScale(0), 1);
  assert.equal(calculateNiceScale(-1), 1);
  assert.equal(calculateNiceScale(-1e6), 1);
});

runTest('NiceScale: Fractional and decimal values scale properly', () => {
  assert.equal(calculateNiceScale(0.75), 1);
  assert.equal(calculateNiceScale(1.05), 2);
  assert.equal(calculateNiceScale(2.3), 2.5);
  assert.equal(calculateNiceScale(4.9), 5);
  assert.equal(calculateNiceScale(9.99), 10);
});

runTest('NiceScale: Powers of 10 from 10^0 to 10^9 invariant', () => {
  for (let k = 0; k <= 9; k++) {
    const val = 10 ** k;
    assert.equal(calculateNiceScale(val), val);
  }
});

runTest('NiceScale: Monotonicity invariant over 10,000 steps', () => {
  let prevScale = calculateNiceScale(1);
  for (let v = 1; v <= 10000; v += 13.7) {
    const currentScale = calculateNiceScale(v);
    assert.ok(currentScale >= prevScale, `Monotonicity violation at v=${v}`);
    assert.ok(currentScale >= v, `Ceiling invariant violation at v=${v}`);
    prevScale = currentScale;
  }
});

// 3. Polar Coordinates
runTest('PolarCoordinates: Cardinal compass points (0, 90, 180, -90 deg)', () => {
  const [x0, y0] = calculatePolarPoint(0, 100, [100, 100]);
  assert.equal(Math.round(x0), 100);
  assert.equal(Math.round(y0), 0);

  const [x90, y90] = calculatePolarPoint(90, 100, [100, 100]);
  assert.equal(Math.round(x90), 200);
  assert.equal(Math.round(y90), 100);

  const [x180, y180] = calculatePolarPoint(180, 100, [100, 100]);
  assert.equal(Math.round(x180), 100);
  assert.equal(Math.round(y180), 200);

  const [xn90, yn90] = calculatePolarPoint(-90, 100, [100, 100]);
  assert.equal(Math.round(xn90), 0);
  assert.equal(Math.round(yn90), 100);
});

// 4. Sparkline SVG Generator
runTest('Sparkline: Empty array returns valid SVG without NaN', () => {
  const svg = renderSparklineSvg([]);
  assert.match(svg, /^<svg class="spark"/);
  assert.doesNotMatch(svg, /NaN/);
  assert.doesNotMatch(svg, /undefined/);
  assert.doesNotMatch(svg, /Infinity/);
});

runTest('Sparkline: Single data point returns valid SVG without NaN', () => {
  const svg = renderSparklineSvg([42]);
  assert.match(svg, /^<svg class="spark"/);
  assert.doesNotMatch(svg, /NaN/);
});

runTest('Sparkline: All-zero values return valid collinear SVG path', () => {
  const svg = renderSparklineSvg([0, 0, 0, 0]);
  assert.match(svg, /^<svg class="spark"/);
  assert.doesNotMatch(svg, /NaN/);
});

runTest('Sparkline: Negative and extreme values return valid SVG', () => {
  const svg = renderSparklineSvg([-10, 0, 50, 1e9]);
  assert.match(svg, /^<svg class="spark"/);
  assert.doesNotMatch(svg, /NaN/);
  assert.doesNotMatch(svg, /Infinity/);
});

console.log('=================================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed (100% Success).`);
console.log('=================================================================');
