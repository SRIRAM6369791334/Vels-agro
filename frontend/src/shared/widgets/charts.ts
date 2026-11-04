import { renderLineChart } from './charts/line-chart';
import { renderColumnBarChart } from './charts/column-bar-chart';
import { renderDonutRingMeter } from './charts/donut-ring-meter';
import { renderRadialGaugeMeter } from './charts/radial-gauge-meter';
import { renderSparklineSvg } from './charts/sparkline';
import { renderGroupedBarChart } from './charts/grouped-bar-chart';
import { renderFanMeter } from './charts/fan-meter';

export * from './charts/types';
export * from './charts/math';

export {
  // Semantic modern API exports
  renderLineChart,
  renderColumnBarChart,
  renderDonutRingMeter,
  renderRadialGaugeMeter,
  renderSparklineSvg,
  renderGroupedBarChart,
  renderFanMeter,

  // Backward compatibility named exports
  renderLineChart as createLineChart,
  renderColumnBarChart as createDonutChart,
  renderDonutRingMeter as createRingMeter,
  renderRadialGaugeMeter as createHorizontalBarChart,
  renderSparklineSvg as createSparkline,
  renderGroupedBarChart as createBarChart,
  renderFanMeter as createFanMeter,

  // Single-letter legacy exports
  renderRadialGaugeMeter as a,
  renderFanMeter as i,
  renderColumnBarChart as n,
  renderGroupedBarChart as o,
  renderDonutRingMeter as r,
  renderSparklineSvg as s,
  renderLineChart as t,
};
