import {
  escapeHtml,
  motionDuration,
  getAvailableLocations,
  formatDateInput,
  gsap,
  bindMagnetic,
} from "../../main.ts";
const o = `http://www.w3.org/2000/svg`;
const s = (e) => {
  if (e <= 0) {
    return 1;
  }
  let t = 10 ** Math.floor(Math.log10(e));
  let n = e / t;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * t;
};
function c(e) {
  if (e.length < 2) {
    return ``;
  }
  let t = `M${e[0][0]},${e[0][1]}`;
  for (let n = 0; n < e.length - 1; n++) {
    let r = e[n - 1] ?? e[n];
    let i = e[n];
    let a = e[n + 1];
    let o = e[n + 2] ?? a;
    let s = 0.18;
    let c = [i[0] + (a[0] - r[0]) * s, i[1] + (a[1] - r[1]) * s];
    let l = [a[0] - (o[0] - i[0]) * s, a[1] - (o[1] - i[1]) * s];
    let u = Math.min(i[1], a[1]);
    let d = Math.max(i[1], a[1]);
    c[1] = Math.max(u, Math.min(d, c[1]));
    l[1] = Math.max(u, Math.min(d, l[1]));
    t += ` C${c[0]},${c[1]} ${l[0]},${l[1]} ${a[0]},${a[1]}`;
  }
  return t;
}
export function createLineChart(n, a) {
  n.classList.add(`chart`);
  n.innerHTML = `<svg class="chart__svg" role="img" aria-label="${escapeHtml(a.label)}"><defs><linearGradient id="g-${a.label.replace(/\W/g, ``)}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" class="chart__stop0"/><stop offset="1" class="chart__stop1"/></linearGradient><clipPath id="c-${a.label.replace(/\W/g, ``)}"><rect class="chart__clip" x="0" y="0" height="100%"/></clipPath></defs>
    <g class="chart__grid"></g><g class="chart__plot" clip-path="url(#c-${a.label.replace(/\W/g, ``)})"><path class="chart__area" fill="url(#g-${a.label.replace(/\W/g, ``)})"/></g><g class="chart__x"></g>
    <line class="chart__cross" y1="0" /><g class="chart__dots"></g></svg>
    <div class="chart__tip" role="status" aria-live="polite"></div>`;
  let l = n.querySelector(`svg`);
  let u = l.querySelector(`.chart__plot`);
  let d = l.querySelector(`.chart__grid`);
  let f = l.querySelector(`.chart__x`);
  let p = l.querySelector(`.chart__area`);
  let m = l.querySelector(`.chart__clip`);
  let h = l.querySelector(`.chart__cross`);
  let g = l.querySelector(`.chart__dots`);
  let _ = n.querySelector(`.chart__tip`);
  let a_labels = a.labels;
  let a_series = a.series;
  let b = a_series.map((e) => [...e.values]);
  let x = [];
  let S = {
    p: 0,
  };
  let C = 0;
  let w = a.height ?? 220;
  let T = -1;
  let E = {
    l: 44,
    r: 12,
    t: 12,
    b: 26,
  };
  n.tabIndex = 0;
  function D() {
    while (x.length < a_series.length) {
      let e = document.createElementNS(o, `path`);
      u.append(e);
      x.push(e);
    }
    x.forEach((e, t) => {
      let n = a_series[t];
      e.style.display = n ? `` : `none`;
      if (n) {
        e.setAttribute(
          `class`,
          `chart__line chart__line--${n.tone}${n.dashed ? ` is-dashed` : ``}`
        );
      }
    });
  }
  let O = () => s(Math.max(1, ...b.flat()) * 1.08);
  let k = (e) => E.l + (a_labels.length < 2 ? 0 : (e / (a_labels.length - 1)) * (C - E.l - E.r));
  let A = (e) => E.t + (1 - e / O()) * (w - E.t - E.b);
  function j() {
    C = n.clientWidth;
    if (!C) {
      return;
    }
    w = a.height ?? Math.max(160, n.clientHeight || 220);
    l.setAttribute(`viewBox`, `0 0 ${C} ${w}`);
    l.setAttribute(`width`, String(C));
    l.setAttribute(`height`, String(w));
    let t = O();
    d.innerHTML = [0, 0.5, 1]
      .map(
        (n) =>
          `<line x1="${E.l}" x2="${C - E.r}" y1="${A(t * n)}" y2="${A(t * n)}"/><text x="${E.l - 8}" y="${A(t * n) + 4}" text-anchor="end">${escapeHtml(a.format(t * n))}</text>`
      )
      .join(``);
    let r = Math.ceil(a_labels.length / Math.max(2, Math.floor((C - E.l) / 56)));
    let i = a_labels.length - 1;
    let o = (e) =>
      e === i || (e % r === 0 && k(i) - k(e) >= 76 && !(e === r && a_labels.length > 2));
    f.innerHTML = a_labels
      .map((t, n) => {
        if (o(n)) {
          return `<text x="${k(n)}" y="${w - 6}" text-anchor="${n === i && a_labels.length > 2 ? `end` : n === 0 ? `start` : `middle`}">${escapeHtml(t)}</text>`;
        }
        return ``;
      })
      .join(``);
    D();
    b.forEach((e, t) => {
      let n = c(e.map((e, t) => [k(t), A(e)]));
      x[t]?.setAttribute(`d`, n);
      if (t === 0) {
        p.setAttribute(`d`, `${n} L${k(e.length - 1)},${w - E.b} L${k(0)},${w - E.b} Z`);
      }
    });
    p.setAttribute(`class`, `chart__area chart__area--${a_series[0]?.tone ?? `pine`}`);
    n.style.setProperty(
      `--area`,
      `var(--${a_series[0]?.tone === `muted` ? `faint` : (a_series[0]?.tone ?? `pine`)})`
    );
    m.setAttribute(`width`, String(E.l + (C - E.l) * S.p + 2));
    h.setAttribute(`y1`, String(E.t));
    h.setAttribute(`y2`, String(w - E.b));
    if (T >= 0 && T < a_labels.length) {
      h.setAttribute(`x1`, String(k(T)));
      h.setAttribute(`x2`, String(k(T)));
      h.style.opacity = `1`;
      g.innerHTML = b
        .map(
          (e, t) =>
            `<circle class="chart__dot chart__dot--${a_series[t]?.tone}" cx="${k(T)}" cy="${A(e[T] ?? 0)}" r="4.5"/>`
        )
        .join(``);
      _.innerHTML = `<b>${escapeHtml(a_labels[T] ?? ``)}</b>${a_series.map((t, n) => `<span><i class="tone--${t.tone}"></i>${escapeHtml(t.name)} <strong>${escapeHtml(a.format(b[n]?.[T] ?? 0))}</strong></span>`).join(``)}`;
      _.style.opacity = `1`;
      let t = Math.min(C - _.offsetWidth - 4, Math.max(4, k(T) - _.offsetWidth / 2));
      _.style.transform = `translate(${t}px, ${Math.max(0, A(Math.max(...b.map((e) => e[T] ?? 0))) - _.offsetHeight - 14)}px)`;
    } else {
      h.style.opacity = `0`;
      g.innerHTML = ``;
      _.style.opacity = `0`;
    }
  }
  let M = () => formatDateInput(j);
  new ResizeObserver(M).observe(n);
  n.addEventListener(`card:resize`, M);
  n.closest(`.card`)?.addEventListener(`card:resize`, () => setTimeout(M, 650));
  n.addEventListener(`pointermove`, (e) => {
    let t = l.getBoundingClientRect();
    let n = Math.round(
      ((e.clientX - t.left - E.l) / Math.max(1, C - E.l - E.r)) * (a_labels.length - 1)
    );
    T = Math.max(0, Math.min(a_labels.length - 1, n));
    M();
  });
  n.addEventListener(`pointerleave`, () => {
    T = -1;
    M();
  });
  n.addEventListener(`keydown`, (e) => {
    if (!(e.key !== `ArrowLeft` && e.key !== `ArrowRight`)) {
      e.preventDefault();
      T = Math.max(
        0,
        Math.min(
          a_labels.length - 1,
          (T < 0 ? a_labels.length - 1 : T) + (e.key === `ArrowRight` ? 1 : -1)
        )
      );
      M();
    }
  });
  n.addEventListener(`blur`, () => {
    T = -1;
    M();
  });
  return {
    play(e = 0) {
      S.p = 0;
      M();
      gsap.to(S, {
        p: 1,
        duration: motionDuration(1.4),
        delay: motionDuration(e),
        ease: `power2.inOut`,
        onUpdate: M,
        onComplete: M,
      });
    },
    update(e, n = a_labels) {
      let r = e.map((e, t) =>
        e.values.map((n, r) => {
          let i = b[t] ?? b[0] ?? [];
          let a = i.length < 2 ? 0 : (r / Math.max(1, e.values.length - 1)) * (i.length - 1);
          let o = i[Math.floor(a)] ?? 0;
          return o + ((i[Math.ceil(a)] ?? o) - o) * (a - Math.floor(a));
        })
      );
      a_series = e;
      a_labels = n;
      b = r;
      S.p = 1;
      let a = {
        t: 0,
      };
      gsap.to(a, {
        t: 1,
        duration: motionDuration(0.9),
        ease: `power3.inOut`,
        onUpdate: () => {
          b = e.map((e, t) => e.values.map((e, n) => (r[t][n] ?? 0) + (e - (r[t][n] ?? 0)) * a.t));
          M();
        },
        onComplete: () => {
          b = e.map((e) => [...e.values]);
          M();
        },
      });
    },
    redraw: M,
  };
}
export function createDonutChart(n, r) {
  n.classList.add(`bars`);
  n.setAttribute(`role`, `list`);
  n.setAttribute(`aria-label`, r.label);
  let r_values = r.values;
  let o = () => {
    let t = s(Math.max(1, ...r_values));
    n.innerHTML = r.labels
      .map(
        (
          n,
          i
        ) => `<div class="bars__col${i === (r.highlight ?? -1) ? ` is-hi` : ``}" role="listitem" aria-label="${escapeHtml(n)}: ${escapeHtml(r.format(r_values[i] ?? 0))}" title="${escapeHtml(n)}: ${escapeHtml(r.format(r_values[i] ?? 0))}">
      <div class="bars__track"><span class="bars__bar bars__bar--${r.tone ?? `pine`}" style="height:${((r_values[i] ?? 0) / t) * 100}%"></span></div><span class="bars__lab">${escapeHtml(n)}</span></div>`
      )
      .join(``);
  };
  o();
  return {
    play(e = 0) {
      gsap.fromTo(
        n.querySelectorAll(`.bars__bar`),
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          transformOrigin: `50% 100%`,
          duration: motionDuration(0.9),
          ease: `power3.out`,
          stagger: motionDuration(0.035),
          delay: motionDuration(e),
          clearProps: `transform`,
        }
      );
    },
    update(e) {
      let r = s(Math.max(1, ...r_values));
      let c = s(Math.max(1, ...e));
      let l = r_values;
      r_values = e;
      o();
      n.querySelectorAll(`.bars__bar`).forEach((n, a) => {
        let o = (l[a] ?? 0) / r / Math.max(0.0001, (e[a] ?? 0) / c);
        gsap.fromTo(
          n,
          {
            scaleY: Math.min(6, o),
          },
          {
            scaleY: 1,
            transformOrigin: `50% 100%`,
            duration: motionDuration(0.7),
            ease: `power3.inOut`,
            clearProps: `transform`,
          }
        );
      });
    },
  };
}
export function createRingMeter(n, r) {
  n.classList.add(`donut`);
  let a = 2 * Math.PI * 52;
  let r_parts = r.parts;
  let s = () => {
    let t = r_parts.reduce((acc, part) => acc + part.value, 0) || 1;
    let i = 0;
    n.innerHTML = `<svg viewBox="0 0 140 140" role="img" aria-label="${escapeHtml(r.label)}"><circle class="donut__track" cx="70" cy="70" r="52"/>${r_parts
      .map((e) => {
        let n = (e.value / t) * a;
        let r = r_parts.length > 1 ? 3 : 0;
        let s = `<circle class="donut__arc tone-stroke--${e.tone}" cx="70" cy="70" r="52" stroke-dasharray="${Math.max(0, n - r)} ${a}" stroke-dashoffset="${-i}" data-len="${Math.max(0, n - r)}"/>`;
        i += n;
        return s;
      })
      .join(
        ``
      )}</svg><div class="donut__mid"><b>${escapeHtml(r.center)}</b><span>${escapeHtml(r.sub)}</span></div>`;
  };
  s();
  let play = (e = 0) => {
    n.querySelectorAll(`.donut__arc`).forEach((n, r) => {
      let o = Number(n.dataset.len);
      gsap.fromTo(
        n,
        {
          attr: {
            "stroke-dasharray": `0 ${a}`,
          },
        },
        {
          attr: {
            "stroke-dasharray": `${o} ${a}`,
          },
          duration: motionDuration(1),
          delay: motionDuration(e + r * 0.12),
          ease: `power3.inOut`,
        }
      );
    });
  };
  return {
    play,
    update(e, t) {
      r_parts = e;
      if (t) {
        r.center = t;
      }
      s();
      play();
    },
  };
}
export function createHorizontalBarChart(r, a) {
  r.classList.add(`gauge`);
  let rotation = -120;
  let s = (e, t = 78) => [
    100 + t * Math.sin((e * Math.PI) / 180),
    100 - t * Math.cos((e * Math.PI) / 180),
  ];
  let [c, l] = s(rotation);
  let [u, d] = s(120);
  let f = `M${c.toFixed(2)},${l.toFixed(2)} A78,78 0 1 1 ${u.toFixed(2)},${d.toFixed(2)}`;
  let p = a.ticks ?? 10;
  let m = Array.from(
    {
      length: p + 1,
    },
    (e, t) => {
      let n = rotation + ((120 - rotation) * t) / p;
      let [r, i] = s(n, 63);
      let [a, c] = s(n, 78 - (t % 5 == 0 ? 24 : 20));
      return `<line x1="${r.toFixed(1)}" y1="${i.toFixed(1)}" x2="${a.toFixed(1)}" y2="${c.toFixed(1)}"${t % 5 == 0 ? ` class="is-major"` : ``}/>`;
    }
  ).join(``);
  r.innerHTML = `<svg viewBox="0 0 200 168" role="img" aria-label="${escapeHtml(a.label)}">
    <path class="gauge__track" d="${f}" pathLength="100"/>
    <path class="gauge__arc" d="${f}" pathLength="100" stroke-dasharray="0 100"/>
    <g class="gauge__ticks">${m}</g>
    <g class="gauge__needle"><path d="M96.8,100 L100,44 L103.2,100 Z"/><circle cx="100" cy="100" r="8"/><circle class="gauge__hub" cx="100" cy="100" r="3"/></g>
  </svg><div class="gauge__mid"><b class="num">${escapeHtml(a.format(0))}</b><span>${escapeHtml(a.sub)}</span></div>`;
  let h = r.querySelector(`.gauge__arc`);
  let g = r.querySelector(`.gauge__needle`);
  let _ = r.querySelector(`.gauge__mid b`);
  let v = r.querySelector(`.gauge__mid span`);
  let y = Math.max(0, Math.min(1, a.value));
  let b = (e) => {
    if (a.zones) {
      if (e < a.zones.bad) {
        return `rose`;
      }
      if (e < a.zones.warn) {
        return `ochre`;
      }
      return `sage`;
    }
    return a.tone ?? `pine`;
  };
  let x = (e) => {
    h.setAttribute(`class`, `gauge__arc tone-stroke--${b(e)}`);
    r.dataset.tone = b(e);
  };
  gsap.set(g, {
    rotation,
    svgOrigin: `100 100`,
  });
  x(y);
  let S = (e, p_1, s = 0) => {
    let c = {
      p: e,
    };
    gsap.to(c, {
      p: p_1,
      duration: motionDuration(1.1),
      delay: motionDuration(s),
      ease: `power3.inOut`,
      onUpdate: () => h.setAttribute(`stroke-dasharray`, `${(c.p * 100).toFixed(2)} 100`),
    });
    gsap.to(g, {
      rotation: rotation + (120 - rotation) * p_1,
      svgOrigin: `100 100`,
      duration: motionDuration(1.6),
      delay: motionDuration(s),
      ease: `elastic.out(1, 0.55)`,
      overwrite: true,
    });
    getAvailableLocations(_, p_1, a.format, {
      duration: 1.1,
      delay: motionDuration(s),
      from: e,
    });
  };
  return {
    play(e = 0) {
      h.setAttribute(`stroke-dasharray`, `0 100`);
      gsap.set(g, {
        rotation,
        svgOrigin: `100 100`,
      });
      S(0, y, e);
    },
    update(e, t) {
      let n = y;
      y = Math.max(0, Math.min(1, e));
      x(y);
      if (t !== undefined) {
        v.textContent = t;
      }
      S(n, y);
    },
    set(e, t) {
      y = Math.max(0, Math.min(1, e));
      x(y);
      if (t !== undefined) {
        v.textContent = t;
      }
      h.setAttribute(`stroke-dasharray`, `${(y * 100).toFixed(2)} 100`);
      gsap.set(g, {
        rotation: rotation + (120 - rotation) * y,
        svgOrigin: `100 100`,
      });
      getAvailableLocations(_, y, a.format, {
        duration: 0,
      });
    },
  };
}
export function createSparkline(e, t = `pine`, n = 84, r = 26) {
  let i = Math.max(1, ...e);
  let a = Math.min(...e);
  return `<svg class="spark" viewBox="0 0 ${n} ${r}" width="${n}" height="${r}" aria-hidden="true"><path class="chart__line chart__line--${t}" d="${c(e.map((t, o) => [(o / Math.max(1, e.length - 1)) * n, r - 3 - ((t - a) / Math.max(1, i - a)) * (r - 6)]))}"/></svg>`;
}
export function createBarChart(n, r) {
  n.classList.add(`hb`);
  n.innerHTML = `<div class="hb__y" aria-hidden="true"></div><div class="hb__plot" role="list" aria-label="${escapeHtml(r.label)}"></div><div class="hb__tip" role="status" aria-live="polite"></div>`;
  let o = n.querySelector(`.hb__y`);
  let c = n.querySelector(`.hb__plot`);
  let l = n.querySelector(`.hb__tip`);
  let r_groups = r.groups;
  let d = r.series.map(() => true);
  let f = -1;
  let pinned = r.pick ?? -1;
  n.tabIndex = 0;
  let m = () => s(Math.max(1, ...r_groups.flatMap((e) => e.values.filter((e, t) => d[t]))) * 1.05);
  let h = (e, t) => Math.max(0.012, e / t);
  function g(t) {
    o.innerHTML = [1, 0.8, 0.6, 0.4, 0.2, 0]
      .map((n) => `<span style="--f:${n}"><b>${escapeHtml(r.axis(t * n))}</b></span>`)
      .join(``);
  }
  function _() {
    let t = m();
    g(t);
    c.innerHTML = r_groups
      .map(
        (
          n,
          i
        ) => `<div class="hb__grp" role="listitem" data-i="${i}" aria-label="${escapeHtml(n.label)}: ${r.series.map((e, t) => `${e.name} ${r.format(n.values[t] ?? 0)}`).join(`, `)}">
      <div class="hb__bars">${r.series.map((e, r) => `<span class="hb__bar${d[r] ? `` : ` is-off`}" data-s="${r}" style="--c:var(--${e.tone === `muted` ? `faint` : e.tone});height:${h(n.values[r] ?? 0, t) * 100}%"><i class="hb__fill"></i><i class="hb__cap"></i></span>`).join(``)}</div>
      <span class="hb__lab">${escapeHtml(n.label)}</span></div>`
      )
      .join(``);
    v(false);
  }
  function v(o = true) {
    let s = f >= 0 ? f : pinned;
    c.querySelectorAll(`.hb__grp`).forEach((e) => {
      let n = Number(e.dataset.i) === s;
      e.classList.toggle(`is-hot`, n);
      let r = e.querySelectorAll(`.hb__fill`);
      if (o) {
        gsap.to(r, {
          opacity: +!!n,
          duration: motionDuration(n ? 0.3 : 0.2),
          ease: `power2.out`,
          stagger: n ? 0.04 : 0,
          overwrite: true,
        });
      } else {
        gsap.set(r, {
          opacity: +!!n,
        });
      }
    });
    let m = r_groups[s];
    if (!m) {
      l.style.opacity = `0`;
      return;
    }
    l.innerHTML = `<b>${escapeHtml(m.label)}</b>${r.series
      .map((t, n) => {
        if (d[n]) {
          return `<span><i class="tone--${t.tone}"></i>${escapeHtml(t.name)}<strong>${escapeHtml(r.format(m.values[n] ?? 0))}</strong></span>`;
        }
        return ``;
      })
      .join(``)}`;
    let h = c.querySelector(`.hb__grp[data-i="${s}"] .hb__bars`);
    if (!h) {
      return;
    }
    let g = n.getBoundingClientRect();
    let _ = h.getBoundingClientRect();
    let v = Math.max(
      ...[...h.querySelectorAll(`.hb__bar:not(.is-off)`)].map((e) => e.getBoundingClientRect().top),
      _.top
    );
    let x_1 = Math.min(
      g.width - l.offsetWidth - 2,
      Math.max(2, _.left - g.left + _.width / 2 - l.offsetWidth / 2)
    );
    let y_1 = Math.max(
      0,
      Math.min(
        ...[...h.querySelectorAll(`.hb__bar:not(.is-off)`)].map(
          (e) => e.getBoundingClientRect().top
        ),
        v
      ) -
        g.top -
        l.offsetHeight -
        10
    );
    let x = l.style.opacity !== `1`;
    l.style.opacity = `1`;
    if (x || !o || bindMagnetic()) {
      gsap.set(l, {
        x: x_1,
        y: y_1,
      });
    } else {
      gsap.to(l, {
        x: x_1,
        y: y_1,
        duration: 0.35,
        ease: `power3.out`,
        overwrite: true,
      });
    }
  }
  function y(e) {
    let n = m();
    g(n);
    c.querySelectorAll(`.hb__grp`).forEach((r) => {
      let a = Number(r.dataset.i);
      let o = r_groups[a];
      r.querySelectorAll(`.hb__bar`).forEach((r) => {
        let s = Number(r.dataset.s);
        let c = h(o.values[s] ?? 0, n);
        r.classList.toggle(`is-off`, !d[s]);
        let l = e.get(`${a}:${s}`) ?? c;
        r.style.height = `${c * 100}%`;
        if (!d[s]) {
          gsap.to(r, {
            scaleY: 0,
            opacity: 0,
            transformOrigin: `50% 100%`,
            duration: motionDuration(0.45),
            ease: `power3.in`,
          });
          return;
        }
        gsap.fromTo(
          r,
          {
            scaleY: Math.min(8, l / c),
            opacity: 1,
          },
          {
            scaleY: 1,
            opacity: 1,
            transformOrigin: `50% 100%`,
            duration: motionDuration(0.8),
            ease: `power3.inOut`,
            delay: motionDuration(a * 0.015),
            clearProps: `transform,opacity`,
          }
        );
      });
    });
    v(false);
  }
  let b = () => {
    let e = new Map();
    let t = m();
    r_groups.forEach((n, r) =>
      n.values.forEach((n, i) => e.set(`${r}:${i}`, d[i] ? h(n, t) : 0.0001))
    );
    return e;
  };
  let x = (clientX) => {
    let t = [...c.querySelectorAll(`.hb__grp`)];
    let n = -1;
    let r = Infinity;
    t.forEach((t) => {
      let i = t.getBoundingClientRect();
      let a = Math.abs(i.left + i.width / 2 - clientX);
      if (a < r) {
        r = a;
        n = Number(t.dataset.i);
      }
    });
    return n;
  };
  c.addEventListener(`pointermove`, (e) => {
    let t = x(e.clientX);
    if (t !== f) {
      f = t;
      v();
    }
  });
  c.addEventListener(`pointerleave`, () => {
    f = -1;
    v();
  });
  c.addEventListener(`click`, (e) => {
    let t = x(e.clientX);
    pinned = pinned === t ? -1 : t;
    f = -1;
    v();
  });
  n.addEventListener(`keydown`, (e) => {
    if (e.key !== `ArrowLeft` && e.key !== `ArrowRight`) {
      return;
    }
    e.preventDefault();
    let t = f >= 0 ? f : pinned >= 0 ? pinned : r_groups.length;
    pinned = Math.max(0, Math.min(r_groups.length - 1, t + (e.key === `ArrowRight` ? 1 : -1)));
    f = -1;
    v();
  });
  new ResizeObserver(() => v(false)).observe(n);
  _();
  return {
    play(e = 0) {
      let n = c.querySelectorAll(`.hb__bar:not(.is-off)`);
      gsap.fromTo(
        n,
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          transformOrigin: `50% 100%`,
          duration: motionDuration(1),
          ease: `power3.out`,
          stagger: {
            each: motionDuration(0.018),
            from: `start`,
          },
          delay: motionDuration(e),
          clearProps: `transform`,
        }
      );
      gsap.fromTo(
        o.querySelectorAll(`b`),
        {
          opacity: 0,
          x: -6,
        },
        {
          opacity: 1,
          x: 0,
          duration: motionDuration(0.5),
          stagger: motionDuration(0.05),
          delay: motionDuration(e),
          clearProps: `opacity,transform`,
        }
      );
      gsap.fromTo(
        c.querySelectorAll(`.hb__lab`),
        {
          opacity: 0,
          y: 6,
        },
        {
          opacity: 1,
          y: 0,
          duration: motionDuration(0.4),
          stagger: motionDuration(0.03),
          delay: motionDuration(e + 0.2),
          clearProps: `opacity,transform`,
        }
      );
      if (pinned >= 0) {
        gsap.delayedCall(motionDuration(e + 1.1), () => v());
      }
    },
    update(e, t = -1) {
      let n = e.length === r_groups.length;
      let r = b();
      r_groups = e;
      pinned = t;
      f = -1;
      if (n) {
        _();
        y(r);
      } else {
        l.style.opacity = `0`;
        _();
        this.play();
      }
    },
    toggle(e) {
      if (d.filter(Boolean).length === 1 && d[e]) {
        return false;
      }
      let t = b();
      d[e] = !d[e];
      y(t);
      return d[e];
    },
    get pinned() {
      return pinned;
    },
  };
}
export function createFanMeter(r, a) {
  r.classList.add(`fan`);
  let length = a.count ?? 84;
  let s = a.format ?? ((e) => `${(e * 100).toFixed(1)}%`);
  let c = (e) => Math.PI - (e / (length - 1)) * Math.PI;
  let l = (e, t) => {
    let n = c(e);
    let r = Math.cos(n);
    let i = Math.sin(n);
    return `<line class="${t}" x1="${(160 + 96 * r).toFixed(1)}" y1="${(156 - 96 * i).toFixed(1)}" x2="${(160 + 150 * r).toFixed(1)}" y2="${(156 - 150 * i).toFixed(1)}"/>`;
  };
  let u = `fan-g${Math.random().toString(36).slice(2, 7)}`;
  r.innerHTML = `<svg viewBox="0 0 320 164" role="img" aria-label="${escapeHtml(a.label)}"><defs><linearGradient id="${u}" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="310" y2="0"><stop offset="0" class="fan__s0"/><stop offset="1" class="fan__s1"/></linearGradient></defs>
    <g class="fan__base">${Array.from(
      {
        length,
      },
      (e, t) => l(t, ``)
    ).join(``)}</g>
    <g class="fan__lit" style="stroke:url(#${u})">${Array.from(
      {
        length,
      },
      (e, t) => l(t, `fan__l`)
    ).join(``)}</g>
    <path class="fan__ring" d="M78,156 A82,82 0 0 1 242,156"/></svg>
    <div class="fan__mid"><b class="num">${escapeHtml(s(0))}</b><span>${escapeHtml(a.sub)}</span></div>`;
  let d = [...r.querySelectorAll(`.fan__l`)];
  let f = r.querySelector(`.fan__mid b`);
  let p = r.querySelector(`.fan__mid span`);
  let m = Math.max(0, Math.min(1, a.value));
  gsap.set(d, {
    opacity: 0,
  });
  let h = (e) => Math.round(e * length);
  function g(from, r, a = 0) {
    let o = h(from);
    let c = h(r);
    if (c > o) {
      gsap.fromTo(
        d.slice(o, c),
        {
          opacity: 0,
          scale: 0.6,
          svgOrigin: `160 156`,
        },
        {
          opacity: 1,
          scale: 1,
          duration: motionDuration(0.45),
          ease: `back.out(2)`,
          stagger: motionDuration(Math.min(0.022, 1.2 / Math.max(1, c - o))),
          delay: motionDuration(a),
          overwrite: true,
        }
      );
    } else if (c < o) {
      gsap.to(d.slice(c, o).reverse(), {
        opacity: 0,
        duration: motionDuration(0.25),
        stagger: motionDuration(0.012),
        delay: motionDuration(a),
        overwrite: true,
      });
    }
    getAvailableLocations(f, r, s, {
      from,
      duration: 1.3,
      delay: motionDuration(a),
    });
  }
  return {
    play(e = 0) {
      gsap.set(d, {
        opacity: 0,
      });
      g(0, m, e);
    },
    update(e, t) {
      let n = m;
      m = Math.max(0, Math.min(1, e));
      if (t !== undefined) {
        p.textContent = t;
      }
      g(n, m);
    },
  };
}
export {
  createHorizontalBarChart as a,
  createFanMeter as i,
  createDonutChart as n,
  createBarChart as o,
  createRingMeter as r,
  createSparkline as s,
  createLineChart as t,
};
