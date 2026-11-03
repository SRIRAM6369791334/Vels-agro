/**
 * Typed SVG Icons Catalog & Renderers
 */

export const ICONS: Record<string, string> = {
  logo: `<path d="M8 3.5h8M9 3.5v3.2c0 .7-.3 1.3-.8 1.8A6.6 6.6 0 0 0 6 13.3v4.2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-4.2a6.6 6.6 0 0 0-2.2-4.8c-.5-.5-.8-1.1-.8-1.8V3.5"/><path d="M6.2 13.5c2-1 3.9-1 5.8 0s3.8 1 5.8 0"/>`,
  back: `<path d="M19 12H5M11 6l-6 6 6 6"/>`,
  arrow: `<path d="M7 17 17 7M8.5 7H17v8.5"/>`,
  more: `<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>`,
  moreV: `<circle cx="12" cy="5.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="18.5" r="1.3"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7.5"/>`,
  search: `<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>`,
  chevL: `<path d="m14.5 6-6 6 6 6"/>`,
  chevR: `<path d="m9.5 6 6 6-6 6"/>`,
  down: `<path d="m6 9.5 6 6 6-6"/>`,
  up: `<path d="m6 14.5 6-6 6 6"/>`,
  refresh: `<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>`,
  grid: `<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>`,
  list: `<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>`,
  board: `<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M9.2 4v16M14.8 4v16"/>`,
  chart: `<path d="M4.5 19.5h15"/><path d="M7.5 16v-4.5M12 16V7.5M16.5 16v-6.5"/>`,
  trend: `<path d="M3.5 17 9 11.5l3.5 3.5 8-8"/><path d="M15 7h5.5v5.5"/>`,
  trendDown: `<path d="M3.5 7 9 12.5l3.5-3.5 8 8"/><path d="M15 17h5.5v-5.5"/>`,
  pie: `<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z"/><path d="M15 3.8A8.5 8.5 0 0 1 20.2 9H15z"/>`,
  user: `<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6"/>`,
  userPlus: `<circle cx="10" cy="8.5" r="3.8"/><path d="M3 20c.8-3.8 3.4-6 7-6 1.7 0 3.2.5 4.3 1.4M18 13v6M15 16h6"/>`,
  users: `<circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.8c1.8.6 3 2.2 3.5 4.7"/>`,
  store: `<path d="M4 9.5 5.5 4.5h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5v8h13v-8M10 19.5v-4.5h4v4.5"/>`,
  calendar: `<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`,
  calX: `<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4"/>`,
  clock: `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  timer: `<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2 1.5M10 3.5h4M18.5 6.5l1.2-1.2"/>`,
  mail: `<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>`,
  phone: `<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>`,
  edit: `<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>`,
  copy: `<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>`,
  upload: `<path d="M12 15.5V4M7 8.5l5-5 5 5M5 14.5v3.5A2 2 0 0 0 7 20h10a2 2 0 0 0 2-2v-3.5"/>`,
  download: `<path d="M12 4v11.5M7 10.5l5 5 5-5M5 20h14"/>`,
  star: `<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>`,
  send: `<path d="M20.5 3.5 3.5 10.6l6.6 2.8 2.8 6.6z"/><path d="m10.1 13.4 4.2-4.2"/>`,
  bell: `<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>`,
  inbox: `<path d="M4 13.5 6.3 6a2 2 0 0 1 1.9-1.5h7.6A2 2 0 0 1 17.7 6l2.3 7.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 13.5h4.5l1.5 2.5h4l1.5-2.5H20"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 2.8l2 2.1 2.9-.4.7 2.8 2.6 1.4-1 2.8 1 2.8-2.6 1.4-.7 2.8-2.9-.4-2 2.1-2-2.1-2.9.4-.7-2.8-2.6-1.4 1-2.8-1-2.8 2.6-1.4.7-2.8 2.9.4Z"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>`,
  moon: `<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>`,
  trash: `<path d="M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5h6V7"/>`,
  filter: `<path d="M4 6h16M7 12h10M10 18h4"/>`,
  command: `<path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h-6m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9z"/>`,
  note: `<path d="M5 4.5h14v10l-5 5H5z"/><path d="M14 19.5v-5h5M8.5 9h7M8.5 12.5h4"/>`,
  mobile: `<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>`,
  help: `<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/>`,
  logout: `<path d="M14 4.5h3.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8.5 6.5 12l3.5 3.5M6.5 12H15"/>`,
  login: `<path d="M14 4.5h3.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M11 8.5l3.5 3.5-3.5 3.5M14.5 12H5"/>`,
  lock: `<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
  shield: `<path d="M12 3.5 4.5 6v5.5c0 4.6 3.2 7.8 7.5 9 4.3-1.2 7.5-4.4 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>`,
  alert: `<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17.2h.01"/>`,
  info: `<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>`,
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>`,
  map: `<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>`,
  tag: `<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.5 1.5 0 0 1 0 2.1l-6.7 6.7a1.5 1.5 0 0 1-2.1 0Z"/><circle cx="8" cy="8" r="1.4"/>`,
  card: `<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>`,
  dollar: `<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.2c-.4-1-1.4-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2 0 2.9 5.4 1.5 5.4 4.6 0 1.2-1.2 2.1-2.8 2.1-1.3 0-2.4-.7-2.8-1.8M12 6.3v1.3M12 16.3v1.4"/>`,
  receipt: `<path d="M6 3.5h12v17l-2.2-1.4-1.9 1.4-1.9-1.4-1.9 1.4-1.9-1.4L6 20.5z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>`,
  print: `<path d="M7 8V3.5h10V8M7 16.5H5a1.5 1.5 0 0 1-1.5-1.5v-5.5A1.5 1.5 0 0 1 5 8h14a1.5 1.5 0 0 1 1.5 1.5V15a1.5 1.5 0 0 1-1.5 1.5h-2"/><path d="M7 13.5h10v7H7z"/>`,
  chat: `<path d="M4.5 18.5V7a2.5 2.5 0 0 1 2.5-2.5h10A2.5 2.5 0 0 1 19.5 7v7a2.5 2.5 0 0 1-2.5 2.5H8.5z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/>`,
  book: `<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h12v14h-12a2 2 0 0 0-2 2z"/><path d="M4.5 19.5a2 2 0 0 0 2 2h12v-4M8.5 7.5h6"/>`,
  box: `<path d="M12 3.5 4 8l8 4.5 8-4.5z"/><path d="M4 8v8l8 4.5V12.5z"/><path d="M20 8v8l-8 4.5V12.5z"/>`,
  boxes: `<path d="M7.5 4.5 3 7l4.5 2.5L12 7z"/><path d="M3 7v5l4.5 2.5V9.5z"/><path d="M12 7v5l-4.5 2.5V9.5z"/><path d="m16.5 9.5-4.5 2.5 4.5 2.5 4.5-2.5z"/><path d="M12 12v5l4.5 2.5v-5z"/><path d="M21 12v5l-4.5 2.5v-5z"/>`,
  layers: `<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16 8.5 4.5 8.5-4.5"/>`,
  flask: `<path d="M9 3.5h6M10 3.5v4.5l-5 8.5a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8.5V3.5"/>`,
  truck: `<rect x="3" y="6" width="11" height="9" rx="1.5"/><path d="M14 8.5h4.2l2.3 3.5V15H14z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
  swap: `<path d="m7 7 10 0M14 4l3 3-3 3M17 17 7 17M10 20l-3-3 3-3"/>`,
  orders: `<path d="M9 4.5h6M7 7.5h10M5 10.5h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>`,
  cart: `<circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3.5 4.5h2.5l2 10.5h10.5l2-8H6"/>`,
  home: `<path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 20z"/>`,
  sparkles: `<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/><path d="M18.5 4.5 17 7l-2.5-1.5L17 4z"/>`,
  scan: `<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3M16 20h3a1 1 0 0 0 1-1v-3M4 12h16"/>`,
};

export function renderIcon(name: string, cls = ''): string {
  const content = ICONS[name] || '';
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${content}</svg>`;
}

export function renderIconButton(
  icon: string,
  title: string,
  attrs = '',
  cls = ''
): string {
  return `<button type="button" class="ibtn ${cls}" aria-label="${title}" title="${title}" ${attrs}>${renderIcon(icon)}</button>`;
}

export function renderPill(label: string, tone = 'pine', icon?: string): string {
  return `<span class="pill pill--${tone}">${icon ? renderIcon(icon) : ''}<span>${label}</span></span>`;
}
