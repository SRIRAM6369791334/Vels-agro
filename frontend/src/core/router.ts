import { gsap, motionDuration } from './motion';
import { FeaturePage } from '../types/common';
import { domQuery, queryOne, domQueryAll, escapeHtml } from '../utils/dom';
import { closeCurrentPopover } from '../ui/popover';

export interface RouteMeta {
  label: string;
  icon: string;
  subs: [string, string][];
}

export const ROUTES_CONFIG: Record<string, RouteMeta> = {
  dashboard: {
    label: 'Dashboard',
    icon: 'grid',
    subs: [
      ['overview', 'Overview'],
      ['activity', 'Activity'],
      ['alerts', 'Alerts'],
    ],
  },
  categories: {
    label: 'Categories',
    icon: 'grid',
    subs: [
      ['list', 'Main Categories'],
      ['sub', 'Sub-categories'],
      ['brands', 'Brand Compatibility'],
    ],
  },
  products: {
    label: 'Products',
    icon: 'box',
    subs: [
      ['catalog', 'Catalog'],
      ['batches', 'Batches'],
    ],
  },
  orders: {
    label: 'Orders',
    icon: 'orders',
    subs: [
      ['all', 'All orders'],
      ['board', 'Board'],
      ['returns', 'Returns'],
      ['payments', 'Payments'],
      ['shipments', 'Shipments'],
    ],
  },
  purchasing: {
    label: 'Purchasing',
    icon: 'cart',
    subs: [
      ['orders', 'Purchase orders'],
      ['suppliers', 'Suppliers'],
      ['materials', 'Materials'],
    ],
  },
  warehouses: {
    label: 'Warehouses',
    icon: 'warehouse',
    subs: [
      ['locations', 'Locations'],
      ['transfers', 'Transfers'],
      ['counts', 'Counts'],
    ],
  },
  dealers: {
    label: 'Dealers',
    icon: 'store',
    subs: [
      ['locations', 'Dealer Locations'],
      ['transfers', 'Dealer Transfers'],
      ['counts', 'Dealer Counts'],
    ],
  },
  promotions: {
    label: 'Promotions',
    icon: 'tag',
    subs: [
      ['coupons', 'Coupon Codes'],
      ['discounts', 'Product & Category Offers'],
      ['dealers', 'Dealer Special Schemes'],
      ['banners', 'Banners & Featured'],
    ],
  },
  reviews: {
    label: 'Reviews',
    icon: 'star',
    subs: [
      ['all', 'All Reviews'],
      ['products', 'Product Ratings'],
      ['feedback', 'Customer Feedback'],
    ],
  },
  analytics: {
    label: 'Analytics',
    icon: 'chart',
    subs: [
      ['overview', 'Overview'],
      ['sales', 'Sales'],
      ['stock', 'Stock health'],
    ],
  },
  customers: {
    label: 'Customers',
    icon: 'users',
    subs: [
      ['farmers', 'Customers'],
      ['stockists', 'Stockists'],
      ['shoppers', 'Shoppers'],
    ],
  },
  settings: {
    label: 'Settings',
    icon: 'gear',
    subs: [
      ['account', 'Account'],
      ['company', 'Company'],
      ['team', 'Team & roles'],
      ['notifications', 'Notifications'],
    ],
  },
  help: {
    label: 'Help',
    icon: 'help',
    subs: [
      ['center', 'Help center'],
      ['tickets', 'My tickets'],
    ],
  },
  login: {
    label: 'Login',
    icon: 'help',
    subs: [['', 'Sign in']],
  },
};

const KNOWN_ROUTE_NAMES = Object.keys(ROUTES_CONFIG);
const EXTRA_DRAWER_ROUTES = ['purchasing', 'analytics', 'customers', 'settings', 'help'];

let registeredLoaders: Record<string, () => Promise<{ page: any }>> = {};

export function registerRouteLoaders(loaders: Record<string, () => Promise<{ page: any }>>): void {
  registeredLoaders = loaders;
}

export const ROUTE_LOADERS: Record<string, () => Promise<{ page: any }>> = new Proxy(registeredLoaders, {
  get(_target, prop: string) {
    return registeredLoaders[prop];
  },
  set(_target, prop: string, value) {
    registeredLoaders[prop] = value;
    return true;
  },
});

export function parseRoute(input: string): { name: string; params: string[] } {
  const clean = (input || '').replace(/^#?\/?/, '');
  const [section, ...rest] = clean.split('/').filter(Boolean).map(decodeURIComponent);

  if (section === 'login') {
    return { name: 'login', params: [] };
  }

  if (section === 'payments') {
    return { name: 'orders', params: ['payments', ...rest] };
  }

  if (section === 'shipments') {
    return { name: 'orders', params: ['shipments', ...rest] };
  }

  if (section === 'offers') {
    return { name: 'promotions', params: ['coupons', ...rest] };
  }

  if (section === 'farmers') {
    return { name: 'customers', params: ['farmers', ...rest] };
  }

  if (section === 'ratings') {
    return { name: 'reviews', params: ['products', ...rest] };
  }

  if (!section || !KNOWN_ROUTE_NAMES.includes(section)) {
    return { name: 'dashboard', params: ['overview'] };
  }

  const meta = ROUTES_CONFIG[section];
  const hasMatchingSub =
    meta.subs.some(([s]) => s === rest[0]) || (section === 'products' && rest[0] === 'item');
  const defaultSub = meta.subs[0][0];

  const params = hasMatchingSub
    ? rest
    : [defaultSub, ...rest.slice(rest[0] && !hasMatchingSub ? 1 : 0)];

  return { name: section, params };
}

export function syncDocumentTitle(page: any, params: string[]): void {
  let pageTitle = typeof page.title === 'function' ? page.title(params) : page.title;
  if (pageTitle === 'Cycle counts') pageTitle = 'Counts';
  document.title = `${pageTitle} \u00B7 Vels`;
}

export function navigateTo(url: string): void {
  let path = (url || '').replace(/^#/, '');
  if (!path.startsWith('/')) path = '/' + path;

  if (location.pathname !== path) {
    history.pushState(null, '', path);
    executeRouteTransition();
  } else {
    executeRouteTransition();
  }
}

// Global window registration for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).navigateTo = navigateTo;
}

const mountedPages = new Set<string>();
let activeRouteState: { name: string; params: string[]; page: FeaturePage } | null = null;
let lastSubtabParam: string | undefined;
let routeTransitionEpoch = 0;
let currentTabsSection: string | null = null;

export function renderSubtabs(routeName: string, activeSub: string, animate = false): void {
  const tabsTrack = queryOne<HTMLElement>('#tabs');
  if (!tabsTrack) return;

  if (routeName === 'login') {
    tabsTrack.innerHTML = '';
    currentTabsSection = null;
    return;
  }

  const meta = ROUTES_CONFIG[routeName];
  if (!meta) return;

  const normalizedSub = routeName === 'products' && activeSub === 'item' ? 'catalog' : activeSub;

  if (currentTabsSection !== routeName || !queryOne('.tabs__pill', tabsTrack)) {
    currentTabsSection = routeName;
    tabsTrack.innerHTML = `<span class="tabs__pill" aria-hidden="true"></span>${meta.subs
      .map(
        ([sub, label], idx) =>
          `<a class="tab" href="/${routeName}/${sub}" data-sub="${sub}">${
            idx === 0 ? `<span class="tab__sec">${escapeHtml(meta.label)}</span>` : ''
          }<span>${escapeHtml(label)}</span></a>`
      )
      .join('')}`;
  }

  domQueryAll('.tab', tabsTrack).forEach((tab) => {
    if (tab.dataset.sub === normalizedSub) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });

  const activeTab = queryOne<HTMLElement>('.tab[aria-current="page"]', tabsTrack);
  const pill = queryOne<HTMLElement>('.tabs__pill', tabsTrack);
  if (pill && activeTab) {
    gsap.to(pill, {
      x: activeTab.offsetLeft,
      width: activeTab.offsetWidth,
      duration: motionDuration(animate ? 0.3 : 0),
      ease: 'power3.out',
    });
  }
}

export function syncSidebarNavigation(routeName: string): void {
  const track = queryOne<HTMLElement>('.nav__track');
  if (!track) return;

  domQueryAll('.nav__item[data-route]', track).forEach((item) => {
    if (item.getAttribute('data-route') === routeName) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });

  const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;
  const activeItem =
    queryOne<HTMLElement>('.nav__track > .nav__item[aria-current="page"]', track) ??
    (isSmallScreen && EXTRA_DRAWER_ROUTES.includes(routeName)
      ? queryOne<HTMLElement>('.nav__more', track)
      : null);

  const pill = queryOne<HTMLElement>('.nav__pill', track);
  if (pill && activeItem) {
    gsap.to(pill, {
      y: activeItem.offsetTop,
      height: activeItem.offsetHeight,
      duration: motionDuration(0.3),
      ease: 'power3.out',
    });
  }
}

export async function executeRouteTransition(skipAnimation = false): Promise<void> {
  // Read current URL from location.pathname first (standard HTML5 history router)
  let raw = location.pathname;
  if (location.hash && location.hash.startsWith('#/')) {
    raw = location.hash.replace(/^#/, '');
    history.replaceState(null, '', raw);
  }
  if (!raw || raw === '/' || raw === '') {
    raw = '/dashboard/overview';
  }

  let isAuthenticated = false;
  try {
    const token = localStorage.getItem('Vels:token');
    isAuthenticated = Boolean(token && token.length > 20);
  } catch {}

  if (!isAuthenticated && !raw.startsWith('/login')) {
    raw = '/login';
  } else if (isAuthenticated && (raw === '/login' || raw === '/login/')) {
    raw = '/dashboard/overview';
  }

  const { name, params } = parseRoute(raw);
  const canonicalPath = name === 'login' ? '/login' : `/${name}/${params.map(encodeURIComponent).join('/')}`;

  if (location.pathname !== canonicalPath || location.hash) {
    history.replaceState(null, '', canonicalPath);
  }

  const currentEpoch = ++routeTransitionEpoch;
  closeCurrentPopover(true);
  const modalEl = document.querySelector<HTMLDialogElement>('#modal');
  if (modalEl?.open) modalEl.close();
  const drawerEl = document.querySelector<HTMLDialogElement>('#drawer');
  if (drawerEl?.open) drawerEl.close();

  // Set html data-route attribute
  document.documentElement.setAttribute('data-route', name);

  // Load feature module
  const loader = ROUTE_LOADERS[name];
  if (!loader) return;
  const mod = await loader();
  const page = mod.page;

  if (currentEpoch !== routeTransitionEpoch) return;

  const viewContainer = domQuery<HTMLElement>(`[data-view="${name}"]`);
  const isMounted = mountedPages.has(name);

  // Hide all other views
  domQueryAll<HTMLElement>('.view').forEach((v) => {
    if (v !== viewContainer) {
      v.hidden = true;
    }
  });

  if (!isMounted) {
    mountedPages.add(name);
    page.mount(viewContainer);
  }

  const previousRoute = activeRouteState;
  const isSameRoute = previousRoute?.name === name;
  const isSubtabChange = lastSubtabParam !== params[0];
  lastSubtabParam = params[0];

  renderSubtabs(name, params[0] ?? '', true);
  syncSidebarNavigation(name);
  syncDocumentTitle(page, params);

  if (previousRoute && !isSameRoute) {
    previousRoute.page.leave?.();
  }

  const mainEl = domQuery<HTMLElement>('#main');
  if (mainEl && viewContainer) {
    mainEl.prepend(viewContainer);
  }

  viewContainer.hidden = false;

  const onEnter = () => {
    window.scrollTo({ top: 0, left: 0 });
    page.enter({ params, first: !isMounted, same: isSameRoute });
    viewContainer.dataset.entered = '1';
    if (!skipAnimation) {
      const headTitle = viewContainer.querySelector<HTMLElement>('.head__title');
      headTitle?.focus({ preventScroll: true });
    }
  };

  if (!isSameRoute && !skipAnimation && motionDuration(0.26) > 0) {
    gsap.fromTo(
      viewContainer,
      { opacity: 0 },
      { opacity: 1, duration: motionDuration(0.26), ease: 'power2.out', clearProps: 'opacity' }
    );
    onEnter();
  } else {
    onEnter();
  }

  activeRouteState = { name, params, page };
}

export function initRouter(): void {
  window.addEventListener('hashchange', () => {
    executeRouteTransition();
  });

  window.addEventListener('popstate', () => {
    executeRouteTransition();
  });

  // Intercept all internal relative anchor link clicks
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') && !href.startsWith('#/')) return;
    if (a.target === '_blank' || a.hasAttribute('download') || a.getAttribute('rel') === 'external') return;
    if (/^(https?:|mailto:|tel:)/i.test(href)) return;

    e.preventDefault();
    navigateTo(href);
  });
}
