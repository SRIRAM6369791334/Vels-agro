import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

const H = gsap;
const Za = Flip;
const Qa = matchMedia("(prefers-reduced-motion: reduce)");
const $a = () => Qa.matches;
const eo = matchMedia("(hover: hover) and (pointer: fine)");
const W = (e) => (Qa.matches ? 0 : e);
let to = 1;
const no = (e) => e / to;

function ro(e) {
  ((to = e), H.globalTimeline.timeScale(e));
}
function G(e, t = document) {
  let n = t.querySelector(e);
  if (!n) throw Error(`Missing ${e}`);
  return n;
}
var io = (e, t = document) => t.querySelector(e),
  K = (e, t = document) => [...t.querySelectorAll(e)],
  q = (e) =>
    String(e).replace(
      /[&<>"']/g,
      (e) => ({ "&": `&amp;`, "<": `&lt;`, ">": `&gt;`, '"': `&quot;`, "'": `&#39;` })[e],
    );
function ao(e) {
  let t =
    e.dataset.text ??
    e.innerHTML
      .replace(
        /<br\s*\/?>/gi,
        `
`,
      )
      .replace(/<[^>]+>/g, ``);
  if (e.dataset.split === t) return K(`.ch`, e);
  let n = t.replace(/&amp;/g, `&`).trim();
  return (
    e.setAttribute(`aria-label`, n.replace(/\n/g, ` `)),
    (e.innerHTML = n
      .split(
        `
`,
      )
      .map((e) =>
        e
          .trim()
          .split(` `)
          .map(
            (e) =>
              `<span class="word" aria-hidden="true">${[...e].map((e) => `<span class="ch">${q(e)}</span>`).join(``)}</span>`,
          )
          .join(` `),
      )
      .join(`<br>`)),
    (e.dataset.split = t),
    K(`.ch`, e)
  );
}
function oo(e, t = 0) {
  if (!e) return H.timeline();
  let n = ao(e);
  return H.fromTo(
    n,
    { yPercent: 115, rotation: 6 },
    {
      yPercent: 0,
      rotation: 0,
      duration: W(0.85),
      ease: `power4.out`,
      stagger: W(0.022),
      delay: W(t),
      clearProps: `transform`,
    },
  );
}
function so(e, { y: t = 34, stagger: n = 0.07, delay: r = 0 } = {}) {
  return e.length
    ? H.fromTo(
        e,
        { opacity: 0, y: t, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: W(0.9),
          ease: `power3.out`,
          stagger: W(n),
          delay: W(r),
          clearProps: `transform,opacity`,
        },
      )
    : H.timeline();
}
function co(e, { x: t = 0, y: n = 12, stagger: r = 0.045, delay: i = 0 } = {}) {
  return e.length
    ? H.fromTo(
        e,
        { opacity: 0, x: t, y: n },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: W(0.55),
          ease: `power3.out`,
          stagger: W(r),
          delay: W(i),
          clearProps: `transform,opacity`,
        },
      )
    : H.timeline();
}
function lo(e, { delay: t = 0, stagger: n = 0.06 } = {}) {
  return e.length
    ? H.fromTo(
        e,
        { opacity: 0, y: 40, rotation: (e) => (e % 2 ? 3 : -3), scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: W(0.8),
          ease: `back.out(1.4)`,
          stagger: W(n),
          delay: W(t),
          clearProps: `transform,opacity`,
        },
      )
    : H.timeline();
}
function uo(e, { from: t = 0.6, delay: n = 0, stagger: r = 0.05 } = {}) {
  !e ||
    Qa.matches ||
    H.fromTo(
      e,
      { scale: t, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: `back.out(3)`,
        delay: n,
        stagger: r,
        overwrite: `auto`,
        clearProps: `transform,opacity`,
      },
    );
}
function fo(e) {
  e &&
    (e.classList.remove(`is-flash`),
    e.offsetWidth,
    e.classList.add(`is-flash`),
    !Qa.matches &&
      H.fromTo(
        e,
        { y: -4, scale: 1.06 },
        {
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: `back.out(2.4)`,
          overwrite: `auto`,
          clearProps: `transform`,
        },
      ));
}
function po(e, t) {
  if (!e || Qa.matches) return;
  let n = e.getBoundingClientRect(),
    r = Object.assign(document.createElement(`span`), { className: `float-up`, textContent: t });
  (r.setAttribute(`aria-hidden`, `true`),
    Object.assign(r.style, { left: `${n.left + n.width / 2}px`, top: `${n.top}px` }),
    document.body.append(r),
    H.fromTo(
      r,
      { opacity: 0, y: 6, xPercent: -50, scale: 0.9 },
      {
        keyframes: [
          { opacity: 1, y: -12, scale: 1, duration: 0.35, ease: `back.out(2)` },
          { opacity: 0, y: -40, duration: 0.8, ease: `power2.in`, delay: 0.6 },
        ],
        onComplete: () => r.remove(),
      },
    ));
}
var mo = new WeakMap();
function ho(e, t, n, { duration: r = 1.2, delay: i = 0, from: a } = {}) {
  if (!e) return;
  let o = mo.get(e);
  if (
    (o || mo.set(e, (o = { v: a ?? 0 })),
    a !== void 0 && (o.v = a),
    H.killTweensOf(o),
    Qa.matches || !r || o.v === t)
  ) {
    ((o.v = t), (e.textContent = n(t)));
    return;
  }
  let s = o;
  ((e.textContent = n(s.v)),
    H.to(s, {
      v: t,
      duration: r,
      delay: i,
      ease: `power3.out`,
      onUpdate: () => {
        e.textContent = n(s.v);
      },
      onComplete: () => {
        e.textContent = n(t);
      },
    }));
}
function go(e) {
  if (Qa.matches) return;
  let t = e.querySelector(`svg`) ?? e;
  H.fromTo(t, { scale: 0.72 }, { scale: 1, duration: 0.55, ease: `back.out(3)`, overwrite: !0 });
}
function _o(e = document) {
  eo.matches &&
    K(`.magnetic`, e).forEach((e) => {
      if (e.__mag) return;
      e.__mag = !0;
      let t = H.quickTo(e, `x`, { duration: 0.5, ease: `power3.out` }),
        n = H.quickTo(e, `y`, { duration: 0.5, ease: `power3.out` });
      (e.addEventListener(`pointermove`, (r) => {
        if (Qa.matches) return;
        let i = e.getBoundingClientRect();
        (t((r.clientX - i.left - i.width / 2) * 0.24), n((r.clientY - i.top - i.height / 2) * 0.3));
      }),
        e.addEventListener(`pointerleave`, () => {
          (t(0), n(0));
        }));
    });
}
var vo = { v: !1 };
function yo(e = document, t = -4) {
  eo.matches &&
    K(`[data-lift]`, e).forEach((e) => {
      e.__lift ||
        ((e.__lift = !0),
        e.addEventListener(`pointerenter`, () => {
          !Qa.matches &&
            vo.v &&
            H.to(e, { y: t, duration: 0.45, ease: `power3.out`, overwrite: `auto` });
        }),
        e.addEventListener(`pointerleave`, () => {
          vo.v &&
            H.to(e, {
              y: 0,
              duration: 0.5,
              ease: `power3.out`,
              overwrite: `auto`,
              clearProps: `transform`,
            });
        }));
    });
}
var bo = new Set();
H.ticker.add(() => {
  if (!bo.size) return;
  let e = [...bo];
  (bo.clear(), e.forEach((e) => e()));
});
var xo = (e) => {
    bo.add(e);
  },
  J = 864e5,
  Y = 36e5,
  So = 6e4,
  Co = /[?&]record\b/.test(location.search),
  wo = new Date(2026, 9, 19, 10, 40, 0).getTime();
{
  let e = Date.now.bind(Date),
    t = wo - e();
  Date.now = () => e() + t;
}
var To = (e) => new Date(e).setHours(0, 0, 0, 0),
  Eo = () => To(Date.now()),
  Do = (e) => {
    let t = new Date(e);
    return new Date(t.getFullYear(), t.getMonth(), 1).getTime();
  },
  Oo = {
    new: { name: `New`, tone: `sky`, icon: `inbox` },
    picking: { name: `Picking`, tone: `ocean`, icon: `scan` },
    packed: { name: `Packed`, tone: `ochre`, icon: `box` },
    shipped: { name: `Shipped`, tone: `teal`, icon: `truck` },
    delivered: { name: `Delivered`, tone: `sage`, icon: `check` },
    cancelled: { name: `Cancelled`, tone: `faint`, icon: `close` },
  },
  ko = [`new`, `picking`, `packed`, `shipped`, `delivered`],
  Ao = [`new`, `picking`, `packed`],
  jo = { wholesale: `Wholesale`, online: `Online store`, studio: `Studio shop` },
  Mo = {
    draft: `Draft`,
    sent: `Sent`,
    partial: `Part received`,
    received: `Received`,
    cancelled: `Cancelled`,
  },
  No = { draft: `faint`, sent: `sky`, partial: `ochre`, received: `sage`, cancelled: `faint` },
  Po = { quarantine: `In QA`, released: `Released`, hold: `On hold`, expired: `Expired` },
  Fo = { quarantine: `ocean`, released: `sage`, hold: `rose`, expired: `faint` },
  Io = {
    requested: `Requested`,
    received: `Received`,
    restocked: `Restocked`,
    refunded: `Refunded`,
    rejected: `Rejected`,
  },
  Lo = {
    requested: `sky`,
    received: `ochre`,
    restocked: `sage`,
    refunded: `teal`,
    rejected: `faint`,
  },
  Ro = { planned: `Planned`, "in-transit": `In transit`, received: `Received` },
  zo = { planned: `sky`, "in-transit": `ochre`, received: `sage` },
  Bo = { scheduled: `Scheduled`, counting: `Counting`, done: `Done` },
  Vo = { owner: `Owner`, admin: `Admin`, manager: `Manager`, staff: `Staff`, viewer: `Viewer` },
  Ho = { vip: `VIP`, new: `New`, net30: `Net 30`, subscriber: `Subscriber` },
  Uo = [`Cleanse`, `Treat`, `Moisturise`, `Protect`, `Body`],
  Wo = { Cleanse: `sky`, Treat: `ocean`, Moisturise: `teal`, Protect: `ochre`, Body: `rose` },
  Go = {
    production: `Batch released`,
    sale: `Shipped`,
    transfer: `Transfer`,
    return: `Return restocked`,
    adjust: `Adjustment`,
    count: `Count variance`,
    receipt: `PO received`,
  },
  Ko = [
    `Damaged in transit`,
    `Pump not dispensing`,
    `Wrong item sent`,
    `Changed mind`,
    `Reaction / sensitivity`,
    `Leaking seal`,
  ],
  qo = [
    {
      key: `view`,
      label: `View stock, orders and reports`,
      roles: [`owner`, `admin`, `manager`, `staff`, `viewer`],
    },
    {
      key: `pick`,
      label: `Pick, pack and ship orders`,
      roles: [`owner`, `admin`, `manager`, `staff`],
    },
    {
      key: `adjust`,
      label: `Adjust stock and run counts`,
      roles: [`owner`, `admin`, `manager`, `staff`],
    },
    { key: `batch`, label: `Release batches from QA`, roles: [`owner`, `admin`, `manager`] },
    { key: `po`, label: `Create and send purchase orders`, roles: [`owner`, `admin`, `manager`] },
    { key: `price`, label: `Change prices and costs`, roles: [`owner`, `admin`] },
    { key: `team`, label: `Invite people and change roles`, roles: [`owner`, `admin`] },
    { key: `billing`, label: `Billing and plan`, roles: [`owner`] },
  ];
function Jo(e) {
  return () => {
    ((e |= 0), (e = (e + 1831565813) | 0));
    let t = Math.imul(e ^ (e >>> 15), 1 | e);
    return (
      (t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t),
      ((t ^ (t >>> 14)) >>> 0) / 4294967296
    );
  };
}
var Yo = 0,
  Xo = (e) => `${e}${Date.now().toString(36)}${(Yo++).toString(36)}`,
  Zo = (e) => Math.round(e * 100) / 100,
  Qo = `m-okafor`,
  $o = [
    {
      id: `m-okafor`,
      name: `Vels Okafor`,
      title: `Operations lead`,
      team: `Operations`,
      role: `admin`,
      email: `Vels@marlowfern.co`,
      phone: `(828) 555-0142`,
      locId: `dc`,
      tone: `pine`,
      status: `active`,
    },
    {
      id: `m-ferreira`,
      name: `Tomás Ferreira`,
      title: `Warehouse lead`,
      team: `Warehouse`,
      role: `manager`,
      email: `tomas@marlowfern.co`,
      phone: `(828) 555-0187`,
      locId: `dc`,
      tone: `ochre`,
      status: `active`,
    },
    {
      id: `m-zhao`,
      name: `Mei Lin Zhao`,
      title: `Formulation chemist`,
      team: `Lab`,
      role: `manager`,
      email: `meilin@marlowfern.co`,
      phone: `(828) 555-0119`,
      locId: `lab`,
      tone: `teal`,
      status: `active`,
    },
    {
      id: `m-sato`,
      name: `Hana Sato`,
      title: `QA & batch release`,
      team: `Lab`,
      role: `manager`,
      email: `hana@marlowfern.co`,
      phone: `(828) 555-0163`,
      locId: `lab`,
      tone: `ocean`,
      status: `active`,
    },
    {
      id: `m-menon`,
      name: `Rahul Menon`,
      title: `Purchasing`,
      team: `Operations`,
      role: `staff`,
      email: `rahul@marlowfern.co`,
      phone: `(828) 555-0131`,
      locId: `dc`,
      tone: `sky`,
      status: `active`,
    },
    {
      id: `m-marchetti`,
      name: `Sofia Marchetti`,
      title: `Wholesale accounts`,
      team: `Sales`,
      role: `staff`,
      email: `sofia@marlowfern.co`,
      phone: `(828) 555-0175`,
      locId: `shop`,
      tone: `rose`,
      status: `active`,
    },
    {
      id: `m-asante`,
      name: `Kwame Asante`,
      title: `Picker & packer`,
      team: `Warehouse`,
      role: `staff`,
      email: `kwame@marlowfern.co`,
      phone: `(828) 555-0108`,
      locId: `dc`,
      tone: `sage`,
      status: `active`,
    },
    {
      id: `m-demir`,
      name: `Elif Demir`,
      title: `Finance`,
      team: `Finance`,
      role: `viewer`,
      email: `elif@marlowfern.co`,
      phone: `(828) 555-0126`,
      locId: `dc`,
      tone: `slate`,
      status: `away`,
    },
    {
      id: `m-whitfield`,
      name: `Jonah Whitfield`,
      title: `Studio shop manager`,
      team: `Sales`,
      role: `staff`,
      email: `jonah@marlowfern.co`,
      phone: `(828) 555-0150`,
      locId: `shop`,
      tone: `ochre`,
      status: `active`,
    },
    {
      id: `m-raman`,
      name: `Priya Raman`,
      title: `Customer care`,
      team: `Support`,
      role: `staff`,
      email: `priya@marlowfern.co`,
      phone: `(828) 555-0194`,
      locId: `shop`,
      tone: `teal`,
      status: `active`,
    },
  ],
  es = [
    {
      id: `dc`,
      name: `Riverside DC`,
      kind: `dc`,
      city: `Asheville, NC`,
      address: `18 Riverside Dr, Unit C`,
      capacity: 9e3,
      managerId: `m-ferreira`,
      hours: `Mon–Fri · 7:00–16:00`,
      zones: [
        { id: `A`, name: `Aisle A · Finished goods`, kind: `ambient`, bins: 24 },
        { id: `B`, name: `Aisle B · Finished goods`, kind: `ambient`, bins: 24 },
        { id: `C`, name: `Cool room`, kind: `cool`, bins: 12 },
        { id: `Q`, name: `Quarantine`, kind: `quarantine`, bins: 6 },
        { id: `D`, name: `Dispatch`, kind: `dispatch`, bins: 8 },
      ],
    },
    {
      id: `lab`,
      name: `Weaverville Lab`,
      kind: `lab`,
      city: `Weaverville, NC`,
      address: `402 Monticello Rd`,
      capacity: 2400,
      managerId: `m-zhao`,
      hours: `Mon–Fri · 8:00–17:00`,
      zones: [
        { id: `R`, name: `Raw materials`, kind: `ambient`, bins: 20 },
        { id: `P`, name: `Packaging`, kind: `ambient`, bins: 16 },
        { id: `C`, name: `Cold store`, kind: `cool`, bins: 8 },
        { id: `Q`, name: `QA hold`, kind: `quarantine`, bins: 6 },
      ],
    },
    {
      id: `shop`,
      name: `Studio Shop`,
      kind: `shop`,
      city: `Asheville, NC`,
      address: `61 Lexington Ave`,
      capacity: 600,
      managerId: `m-whitfield`,
      hours: `Tue–Sun · 10:00–18:00`,
      zones: [
        { id: `F`, name: `Shop floor`, kind: `ambient`, bins: 10 },
        { id: `S`, name: `Back room`, kind: `ambient`, bins: 8 },
      ],
    },
  ],
  ts = [
    {
      id: `s-nkuru`,
      name: `Nkuru Shea Collective`,
      country: `Ghana`,
      city: `Tamale`,
      contact: `Abena Mensah`,
      email: `orders@nkurushea.gh`,
      phone: `+233 37 202 1180`,
      leadDays: 21,
      onTime: 0.91,
      rating: 4.8,
      supplies: `Shea butter, cocoa butter`,
      tone: `ochre`,
    },
    {
      id: `s-tidewater`,
      name: `Tidewater Botanicals`,
      country: `USA`,
      city: `Wilmington, NC`,
      contact: `Grace Holloway`,
      email: `grace@tidewaterbotanicals.com`,
      phone: `(910) 555-0177`,
      leadDays: 6,
      onTime: 0.96,
      rating: 4.7,
      supplies: `Oils, infusions, glycerin`,
      tone: `teal`,
    },
    {
      id: `s-vallee`,
      name: `Vallée Actives`,
      country: `France`,
      city: `Grasse`,
      contact: `Luc Bernier`,
      email: `export@vallee-actives.fr`,
      phone: `+33 4 93 55 21 08`,
      leadDays: 14,
      onTime: 0.88,
      rating: 4.5,
      supplies: `Niacinamide, squalane, actives`,
      tone: `ocean`,
    },
    {
      id: `s-pacific`,
      name: `Pacific Glassworks`,
      country: `USA`,
      city: `Tacoma, WA`,
      contact: `Daniel Okoye`,
      email: `sales@pacificglassworks.com`,
      phone: `(253) 555-0139`,
      leadDays: 10,
      onTime: 0.84,
      rating: 4.2,
      supplies: `Glass droppers, jars, bottles`,
      tone: `sky`,
    },
    {
      id: `s-kessler`,
      name: `Kessler Packaging`,
      country: `USA`,
      city: `Charlotte, NC`,
      contact: `Marta Kessler`,
      email: `marta@kesslerpack.com`,
      phone: `(704) 555-0162`,
      leadDays: 5,
      onTime: 0.97,
      rating: 4.9,
      supplies: `Airless pumps, tubes, cartons`,
      tone: `pine`,
    },
    {
      id: `s-blueridge`,
      name: `Blue Ridge Labelworks`,
      country: `USA`,
      city: `Hendersonville, NC`,
      contact: `Owen Price`,
      email: `owen@blueridgelabel.com`,
      phone: `(828) 555-0110`,
      leadDays: 4,
      onTime: 0.99,
      rating: 4.9,
      supplies: `Labels, sleeves, tamper seals`,
      tone: `sage`,
    },
    {
      id: `s-sunvale`,
      name: `Sunvale Minerals`,
      country: `USA`,
      city: `Denver, CO`,
      contact: `Ruth Alvarado`,
      email: `ruth@sunvaleminerals.com`,
      phone: `(303) 555-0185`,
      leadDays: 8,
      onTime: 0.9,
      rating: 4.4,
      supplies: `Zinc oxide, clays`,
      tone: `slate`,
    },
  ],
  ns = [
    {
      id: `r-shea`,
      code: `RM-101`,
      name: `Unrefined shea butter`,
      kind: `Ingredient`,
      unit: `kg`,
      reorderAt: 20,
      reorderQty: 60,
      cost: 14.2,
      supplierId: `s-nkuru`,
      locId: `lab`,
    },
    {
      id: `r-calendula`,
      code: `RM-104`,
      name: `Calendula oil infusion`,
      kind: `Ingredient`,
      unit: `L`,
      reorderAt: 10,
      reorderQty: 30,
      cost: 38.5,
      supplierId: `s-tidewater`,
      locId: `lab`,
    },
    {
      id: `r-camellia`,
      code: `RM-108`,
      name: `Camellia seed oil`,
      kind: `Ingredient`,
      unit: `L`,
      reorderAt: 16,
      reorderQty: 40,
      cost: 29.8,
      supplierId: `s-tidewater`,
      locId: `lab`,
    },
    {
      id: `r-glycerin`,
      code: `RM-112`,
      name: `Vegetable glycerin`,
      kind: `Ingredient`,
      unit: `L`,
      reorderAt: 12,
      reorderQty: 40,
      cost: 6.4,
      supplierId: `s-tidewater`,
      locId: `lab`,
    },
    {
      id: `r-niacin`,
      code: `RM-120`,
      name: `Niacinamide (B3) powder`,
      kind: `Ingredient`,
      unit: `kg`,
      reorderAt: 4,
      reorderQty: 10,
      cost: 62,
      supplierId: `s-vallee`,
      locId: `lab`,
    },
    {
      id: `r-squalane`,
      code: `RM-123`,
      name: `Olive squalane`,
      kind: `Ingredient`,
      unit: `L`,
      reorderAt: 8,
      reorderQty: 20,
      cost: 48,
      supplierId: `s-vallee`,
      locId: `lab`,
    },
    {
      id: `r-zinc`,
      code: `RM-131`,
      name: `Non-nano zinc oxide`,
      kind: `Ingredient`,
      unit: `kg`,
      reorderAt: 6,
      reorderQty: 15,
      cost: 31,
      supplierId: `s-sunvale`,
      locId: `lab`,
    },
    {
      id: `p-dropper`,
      code: `PK-201`,
      name: `Amber dropper bottle, 30 ml`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 600,
      reorderQty: 2e3,
      cost: 0.62,
      supplierId: `s-pacific`,
      locId: `lab`,
    },
    {
      id: `p-dropper15`,
      code: `PK-202`,
      name: `Amber dropper bottle, 15 ml`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 400,
      reorderQty: 1500,
      cost: 0.48,
      supplierId: `s-pacific`,
      locId: `lab`,
    },
    {
      id: `p-jar`,
      code: `PK-210`,
      name: `Amber glass jar + yellow lid`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 500,
      reorderQty: 1500,
      cost: 0.71,
      supplierId: `s-pacific`,
      locId: `lab`,
    },
    {
      id: `p-pump`,
      code: `PK-215`,
      name: `Amber bottle + pump, 100–200 ml`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 500,
      reorderQty: 1500,
      cost: 0.94,
      supplierId: `s-pacific`,
      locId: `lab`,
    },
    {
      id: `p-airless`,
      code: `PK-220`,
      name: `Airless pump bottle, 50 ml`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 400,
      reorderQty: 1200,
      cost: 1.12,
      supplierId: `s-kessler`,
      locId: `lab`,
    },
    {
      id: `p-tube`,
      code: `PK-224`,
      name: `Pump tube, 50–75 ml`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 400,
      reorderQty: 1200,
      cost: 0.86,
      supplierId: `s-kessler`,
      locId: `lab`,
    },
    {
      id: `p-alu`,
      code: `PK-230`,
      name: `Brushed aluminium bottle, 250 ml`,
      kind: `Packaging`,
      unit: `pcs`,
      reorderAt: 300,
      reorderQty: 1e3,
      cost: 1.38,
      supplierId: `s-kessler`,
      locId: `lab`,
    },
    {
      id: `p-label`,
      code: `PK-240`,
      name: `Printed labels (roll of 1,000)`,
      kind: `Packaging`,
      unit: `rolls`,
      reorderAt: 6,
      reorderQty: 20,
      cost: 42,
      supplierId: `s-blueridge`,
      locId: `lab`,
    },
    {
      id: `x-carton`,
      code: `SH-301`,
      name: `Recycled mailer cartons`,
      kind: `Shipping`,
      unit: `pcs`,
      reorderAt: 300,
      reorderQty: 1e3,
      cost: 0.38,
      supplierId: `s-kessler`,
      locId: `dc`,
    },
  ],
  rs = [
    {
      id: `crb15`,
      sku: `MF-CRB-15`,
      name: `Calendula Rescue Balm`,
      line: `Rescue`,
      size: `15 ml`,
      category: `Moisturise`,
      photo: `balm`,
      price: 14,
      wholesale: 7,
      cost: 2.9,
      reorderAt: 120,
      reorderQty: 400,
      bin: `A-04`,
      shelfMonths: 24,
      active: !0,
      barcode: `0860009120151`,
      bom: [
        { materialId: `r-shea`, per: 0.009 },
        { materialId: `r-calendula`, per: 0.004 },
        { materialId: `p-jar`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `A pocket tin of the rescue balm for lips, cuticles and dry patches.`,
    },
    {
      id: `crb50`,
      sku: `MF-CRB-50`,
      name: `Calendula Rescue Balm`,
      line: `Rescue`,
      size: `50 ml`,
      category: `Moisturise`,
      photo: `balm`,
      price: 32,
      wholesale: 16,
      cost: 5.4,
      reorderAt: 140,
      reorderQty: 400,
      bin: `A-05`,
      shelfMonths: 24,
      active: !0,
      barcode: `0860009120502`,
      bom: [
        { materialId: `r-shea`, per: 0.03 },
        { materialId: `r-calendula`, per: 0.012 },
        { materialId: `p-jar`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `Shea and calendula whipped into a rich balm. The lab’s first product and still its best seller.`,
    },
    {
      id: `clo30`,
      sku: `MF-CLO-30`,
      name: `Camellia Cleansing Oil`,
      line: `Camellia`,
      size: `30 ml`,
      category: `Cleanse`,
      photo: `oil`,
      price: 9,
      wholesale: 4.5,
      cost: 1.8,
      reorderAt: 100,
      reorderQty: 300,
      bin: `A-10`,
      shelfMonths: 18,
      active: !0,
      barcode: `0860009121301`,
      bom: [
        { materialId: `r-camellia`, per: 0.026 },
        { materialId: `p-pump`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `The travel size of the cleansing oil.`,
    },
    {
      id: `clo100`,
      sku: `MF-CLO-100`,
      name: `Camellia Cleansing Oil`,
      line: `Camellia`,
      size: `100 ml`,
      category: `Cleanse`,
      photo: `oil`,
      price: 24,
      wholesale: 12,
      cost: 4.1,
      reorderAt: 160,
      reorderQty: 500,
      bin: `A-11`,
      shelfMonths: 18,
      active: !0,
      barcode: `0860009121004`,
      bom: [
        { materialId: `r-camellia`, per: 0.085 },
        { materialId: `p-pump`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `Melts make-up and SPF, rinses milky. Camellia and sunflower oils.`,
    },
    {
      id: `clo200`,
      sku: `MF-CLO-200`,
      name: `Camellia Cleansing Oil`,
      line: `Camellia`,
      size: `200 ml`,
      category: `Cleanse`,
      photo: `oil`,
      price: 38,
      wholesale: 19,
      cost: 6.6,
      reorderAt: 90,
      reorderQty: 300,
      bin: `A-12`,
      shelfMonths: 18,
      active: !0,
      barcode: `0860009122001`,
      bom: [
        { materialId: `r-camellia`, per: 0.17 },
        { materialId: `p-pump`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `The bathroom-shelf size, with a locking pump.`,
    },
    {
      id: `nia15`,
      sku: `MF-NIA-15`,
      name: `Niacinamide 10% Serum`,
      line: `Clarity`,
      size: `15 ml`,
      category: `Treat`,
      photo: `serum`,
      price: 19,
      wholesale: 9.5,
      cost: 2.7,
      reorderAt: 110,
      reorderQty: 400,
      bin: `B-02`,
      shelfMonths: 12,
      active: !0,
      barcode: `0860009123152`,
      bom: [
        { materialId: `r-niacin`, per: 0.0015 },
        { materialId: `r-glycerin`, per: 0.002 },
        { materialId: `p-dropper15`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `The trial size of the clarity serum.`,
    },
    {
      id: `nia30`,
      sku: `MF-NIA-30`,
      name: `Niacinamide 10% Serum`,
      line: `Clarity`,
      size: `30 ml`,
      category: `Treat`,
      photo: `serum`,
      price: 29,
      wholesale: 14.5,
      cost: 3.9,
      reorderAt: 180,
      reorderQty: 500,
      bin: `B-03`,
      shelfMonths: 12,
      active: !0,
      barcode: `0860009123305`,
      bom: [
        { materialId: `r-niacin`, per: 0.003 },
        { materialId: `r-glycerin`, per: 0.004 },
        { materialId: `p-dropper`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `Niacinamide and zinc PCA to calm redness and even tone. Water-light.`,
    },
    {
      id: `bfs50`,
      sku: `MF-BFS-50`,
      name: `Barrier Fluid SPF 30`,
      line: `Barrier`,
      size: `50 ml`,
      category: `Protect`,
      photo: `fluid`,
      price: 34,
      wholesale: 17,
      cost: 6.2,
      reorderAt: 150,
      reorderQty: 500,
      bin: `B-08`,
      shelfMonths: 12,
      active: !0,
      barcode: `0860009124500`,
      bom: [
        { materialId: `r-zinc`, per: 0.009 },
        { materialId: `r-squalane`, per: 0.006 },
        { materialId: `p-airless`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `A mineral daily fluid with non-nano zinc. No white cast on deeper skin tones.`,
    },
    {
      id: `hgc50`,
      sku: `MF-HGC-50`,
      name: `Hydra Gel Cream`,
      line: `Hydra`,
      size: `50 ml`,
      category: `Moisturise`,
      photo: `gel`,
      price: 36,
      wholesale: 18,
      cost: 5.9,
      reorderAt: 140,
      reorderQty: 400,
      bin: `C-02`,
      shelfMonths: 15,
      active: !0,
      barcode: `0860009125507`,
      bom: [
        { materialId: `r-glycerin`, per: 0.01 },
        { materialId: `r-squalane`, per: 0.004 },
        { materialId: `p-tube`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `A bouncy gel cream with glycerin and squalane. Kept in the cool room.`,
    },
    {
      id: `hgc75`,
      sku: `MF-HGC-75`,
      name: `Hydra Gel Cream`,
      line: `Hydra`,
      size: `75 ml`,
      category: `Moisturise`,
      photo: `gel`,
      price: 46,
      wholesale: 23,
      cost: 7.8,
      reorderAt: 80,
      reorderQty: 250,
      bin: `C-03`,
      shelfMonths: 15,
      active: !0,
      barcode: `0860009125750`,
      bom: [
        { materialId: `r-glycerin`, per: 0.015 },
        { materialId: `r-squalane`, per: 0.006 },
        { materialId: `p-tube`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `The value size of the gel cream.`,
    },
    {
      id: `hbd250`,
      sku: `MF-HBD-250`,
      name: `Hand & Body Duo`,
      line: `Ritual`,
      size: `2 × 250 ml`,
      category: `Body`,
      photo: `duo`,
      price: 42,
      wholesale: 21,
      cost: 8.4,
      reorderAt: 100,
      reorderQty: 300,
      bin: `B-14`,
      shelfMonths: 24,
      active: !0,
      barcode: `0860009126252`,
      bom: [
        { materialId: `r-glycerin`, per: 0.03 },
        { materialId: `r-shea`, per: 0.02 },
        { materialId: `p-alu`, per: 2 },
        { materialId: `p-label`, per: 0.002 },
      ],
      blurb: `Neroli hand wash and body lotion in brushed aluminium. A gift-shop favourite.`,
    },
    {
      id: `hbd-wash`,
      sku: `MF-NHW-250`,
      name: `Neroli Hand Wash`,
      line: `Ritual`,
      size: `250 ml`,
      category: `Body`,
      photo: `duo`,
      price: 22,
      wholesale: 11,
      cost: 3.6,
      reorderAt: 120,
      reorderQty: 400,
      bin: `B-15`,
      shelfMonths: 24,
      active: !0,
      barcode: `0860009126504`,
      bom: [
        { materialId: `r-glycerin`, per: 0.02 },
        { materialId: `p-alu`, per: 1 },
        { materialId: `p-label`, per: 0.001 },
      ],
      blurb: `The wash on its own, for refills and stockists who sell singles.`,
    },
  ],
  is = {
    crb15: [612, 40, 38],
    crb50: [128, 24, 26],
    clo30: [388, 0, 44],
    clo100: [702, 36, 31],
    clo200: [214, 0, 12],
    nia15: [96, 18, 9],
    nia30: [540, 60, 22],
    bfs50: [0, 0, 6],
    hgc50: [431, 0, 18],
    hgc75: [176, 0, 8],
    hbd250: [263, 0, 21],
    "hbd-wash": [355, 0, 27],
  },
  as = {
    "r-shea": 46,
    "r-calendula": 7.5,
    "r-camellia": 58,
    "r-glycerin": 84,
    "r-niacin": 6.2,
    "r-squalane": 11,
    "r-zinc": 3.4,
    "p-dropper": 1840,
    "p-dropper15": 360,
    "p-jar": 1120,
    "p-pump": 2210,
    "p-airless": 180,
    "p-tube": 960,
    "p-alu": 1450,
    "p-label": 14,
    "x-carton": 2600,
  },
  os = [
    [`Juniper & Moss Apothecary`, `Clara Lindqvist`, `Portland`, `OR`, [`vip`, `net30`]],
    [`The Fern Room`, `Marcus Bell`, `Austin`, `TX`, [`net30`]],
    [`Saltwater Pharmacy`, `Aisha Rahman`, `Charleston`, `SC`, [`vip`]],
    [`Hollis Spa & Bath`, `Renée Dubois`, `Savannah`, `GA`, [`net30`]],
    [`Northbound General Store`, `Erik Haugen`, `Duluth`, `MN`, []],
    [`Copper Kettle Gifts`, `Nadia Petrov`, `Asheville`, `NC`, [`vip`, `net30`]],
    [`Mesa Wellness Co.`, `Luis Ortega`, `Santa Fe`, `NM`, [`new`]],
    [`Greenline Market`, `Yuki Tanaka`, `Seattle`, `WA`, [`net30`]],
    [`Sable & Sage Beauty`, `Deja Washington`, `Atlanta`, `GA`, []],
    [`Little River Pharmacy`, `Owen Gallagher`, `Burlington`, `VT`, [`new`]],
  ],
  ss = [
    [`Amara Nwosu`, `Raleigh`, `NC`, [`subscriber`]],
    [`Lena Fischer`, `Chicago`, `IL`, []],
    [`Diego Castillo`, `Phoenix`, `AZ`, [`subscriber`]],
    [`Sun-Hee Park`, `Boston`, `MA`, [`vip`]],
    [`Fatima Al-Sayed`, `Dearborn`, `MI`, []],
    [`Noah Bergström`, `Minneapolis`, `MN`, [`new`]],
    [`Chloé Martin`, `New Orleans`, `LA`, [`subscriber`]],
    [`Ravi Iyer`, `San Jose`, `CA`, []],
    [`Grace Adeyemi`, `Houston`, `TX`, [`vip`, `subscriber`]],
    [`Tess O’Malley`, `Pittsburgh`, `PA`, []],
    [`Mateo Rossi`, `Denver`, `CO`, [`new`]],
    [`Hannah Kowalski`, `Milwaukee`, `WI`, []],
    [`Isabela Costa`, `Miami`, `FL`, [`subscriber`]],
    [`Kenji Watanabe`, `Los Angeles`, `CA`, []],
    [`Zoe Laurent`, `Asheville`, `NC`, [`vip`]],
    [`Omar Haddad`, `Nashville`, `TN`, []],
    [`Ingrid Sørensen`, `Madison`, `WI`, [`new`]],
    [`Theo Brooks`, `Richmond`, `VA`, []],
  ],
  cs = (e) =>
    e
      .toLowerCase()
      .normalize(`NFD`)
      .replace(/[̀-ͯ]/g, ``)
      .replace(/[^a-z0-9]+/g, `-`)
      .replace(/^-|-$/g, ``);
function ls() {
  let e = Jo(1786),
    t = (t) => t[Math.floor(e() * t.length)],
    n = (t, n) => t + e() * (n - t),
    r = (e, t) => Math.floor(n(e, t + 1)),
    i = wo,
    a = To(i),
    o = (e, t = 8, r = 17) => a + e * J + n(t, r) * Y,
    s = $o.map((e, t) => ({ ...e, since: a - (420 + t * 97) * J })),
    c = rs.map((e) => {
      let t = is[e.id];
      return { ...e, stock: { dc: t[0], lab: t[1], shop: t[2] } };
    }),
    l = ns.map((e) => ({ ...e, onHand: as[e.id] ?? 0 })),
    u = ts.map((e, t) => ({ ...e, since: a - (300 + t * 140) * J, favorite: t < 2 })),
    d = [
      ...os.map(([e, t, n, i, o], s) => ({
        id: `c-${cs(e)}`,
        name: e,
        kind: `stockist`,
        contact: t,
        email: `${cs(t).split(`-`)[0]}@${cs(e).split(`-`).slice(0, 2).join(``)}.com`,
        phone: `(${r(201, 989)}) 555-0${r(100, 199)}`,
        city: n,
        region: i,
        since: a - (90 + s * 61) * J,
        tags: o,
        note: s === 0 ? `Reorders the balm every 4–5 weeks. Prefers UPS.` : ``,
      })),
      ...ss.map(([e, t, n, i], o) => ({
        id: `c-${cs(e)}`,
        name: e,
        kind: `shopper`,
        contact: e,
        email: `${cs(e).replace(`-`, `.`)}@mail.com`,
        phone: `(${r(201, 989)}) 555-0${r(100, 199)}`,
        city: t,
        region: n,
        since: a - (20 + o * 23) * J,
        tags: i,
        note: ``,
      })),
    ],
    f = d.filter((e) => e.kind === `stockist`),
    p = d.filter((e) => e.kind === `shopper`),
    m = [],
    h = 2318,
    g = [`m-asante`, `m-ferreira`, `m-marchetti`, `m-whitfield`];
  for (let n = -110; n <= 0; n++) {
    let s = new Date(a + n * J).getDay(),
      l =
        n === 0
          ? 4
          : s === 0
            ? r(0, 1)
            : s === 6
              ? r(1, 2)
              : r(1, 3) + +(n > -30) + (n > -4 ? 2 : 0);
    for (let a = 0; a < l; a++) {
      let a = e(),
        s = a < 0.3 ? `wholesale` : a < 0.88 ? `online` : `studio`,
        l = t(s === `wholesale` ? f : p),
        u = [],
        d = s === `wholesale` ? r(2, 4) : r(1, 2),
        _ = [...c].sort(() => e() - 0.5);
      for (let e = 0; e < d; e++) {
        let t = _[e];
        u.push({
          productId: t.id,
          qty: s === `wholesale` ? r(2, 8) * 6 : r(1, 2),
          price: s === `wholesale` ? t.wholesale : t.price,
        });
      }
      let v = n === 0 ? o(0, 6.5, 10.4) : o(n, 7, 20),
        y = (i - v) / J,
        b = s === `wholesale`,
        x =
          y > 6
            ? `delivered`
            : y > 3
              ? e() < 0.55
                ? `delivered`
                : `shipped`
              : y > 1.2
                ? b
                  ? t([`picking`, `packed`, `shipped`])
                  : e() < 0.72
                    ? `shipped`
                    : `packed`
                : t(b ? [`new`, `picking`] : [`new`, `new`, `picking`, `packed`]);
      if (v > i) continue;
      (e() < 0.025 && y > 2 && (x = `cancelled`),
        s === `studio` && x !== `cancelled` && (x = `delivered`));
      let S = ko.indexOf(x),
        C = [
          {
            at: v,
            to: `new`,
            by: s === `online` ? `web` : s === `studio` ? `m-whitfield` : `m-marchetti`,
          },
        ];
      (ko
        .slice(1, Math.max(1, S + 1))
        .forEach((n, r) =>
          C.push({
            at: Math.min(
              i - 5 * So,
              v + (r + 1) * (n === `delivered` ? 2.6 : 0.4) * J * (0.6 + e() * 0.5),
            ),
            to: n,
            by: n === `shipped` || n === `delivered` ? `m-asante` : t(g),
          }),
        ),
        x === `cancelled` && C.push({ at: v + 0.3 * J, to: `cancelled`, by: `m-marchetti` }),
        m.push({
          id: `so-${h}`,
          number: `SO-${h}`,
          customerId: l.id,
          channel: s,
          status: x,
          createdAt: v,
          shipBy: To(v) + (s === `wholesale` ? 3 : 1) * J + 16 * Y,
          locId: s === `studio` ? `shop` : `dc`,
          lines: u,
          carrier:
            s === `studio`
              ? `Collected in shop`
              : t(
                  s === `wholesale`
                    ? [`UPS Ground`, `FedEx Home`]
                    : [`USPS Priority`, `UPS Ground`],
                ),
          tracking:
            S >= 3 && s !== `studio`
              ? `1Z${Math.floor(e() * 1e9)
                  .toString(36)
                  .toUpperCase()}${r(10, 99)}`
              : void 0,
          paid: s !== `wholesale` || y > 30 || e() < 0.6,
          history: C,
        }),
        h++);
    }
  }
  let _ = (e) => c.find((t) => t.id === e),
    v = [],
    y = 0;
  (c.forEach((e, n) => {
    let i = r(2, 3);
    for (let a = 0; a < i; a++) {
      let i = o(-(a * 70 + r(15, 60) + (n % 3) * 7)),
        s = r(3, 6) * 100,
        c = i + e.shelfMonths * 30.4 * J;
      v.push({
        id: `b-${e.id}-${a}`,
        lot: `L${new Date(i).getFullYear() % 100}${String(new Date(i).getMonth() + 1).padStart(2, `0`)}-${String(140 + y++).padStart(3, `0`)}`,
        productId: e.id,
        madeAt: i,
        expiresAt: c,
        qty: s,
        left: 0,
        locId: `dc`,
        status: `released`,
        chemistId: t([`m-zhao`, `m-sato`]),
      });
    }
  }),
    [
      [`b-clo100-0`, 11],
      [`b-crb15-0`, 8],
      [`b-hbd-wash-0`, 15],
    ].forEach(([e, t]) => {
      let n = v.find((t) => t.id === e);
      n &&
        ((n.madeAt = a - t * J + 10 * Y),
        (n.expiresAt = n.madeAt + _(n.productId).shelfMonths * 30.4 * J));
    }),
    c.forEach((e) => {
      let t = (e.stock.dc ?? 0) + (e.stock.lab ?? 0) + (e.stock.shop ?? 0);
      v.filter((t) => t.productId === e.id)
        .sort((e, t) => t.madeAt - e.madeAt)
        .forEach((e) => {
          let n = Math.min(e.qty, t);
          ((e.left = n), (t -= n));
        });
      let n = v.filter((t) => t.productId === e.id).sort((e, t) => t.madeAt - e.madeAt)[0];
      n && t > 0 && ((n.qty += t), (n.left += t));
    }));
  let b = v.find((e) => e.id === `b-nia15-1`);
  b && ((b.madeAt = a - 340 * J), (b.expiresAt = a + 26 * J), (b.left = Math.max(b.left, 64)));
  let x = v.find((e) => e.id === `b-crb50-2`) ?? v.find((e) => e.id === `b-crb50-1`);
  x && ((x.madeAt = a - 712 * J), (x.expiresAt = a + 9 * J), (x.left = Math.max(x.left, 18)));
  let S = v.find((e) => e.id === `b-hgc50-1`);
  (S &&
    ((S.expiresAt = a + 58 * J),
    (S.madeAt = S.expiresAt - 15 * 30.4 * J),
    (S.left = Math.max(S.left, 40))),
    v.push({
      id: `b-bfs50-qa`,
      lot: `L2610-171`,
      productId: `bfs50`,
      madeAt: a - 2 * J + 10 * Y,
      expiresAt: a - 2 * J + 365 * J,
      qty: 480,
      left: 480,
      locId: `dc`,
      status: `quarantine`,
      chemistId: `m-zhao`,
      note: `SPF in-vitro check booked for Tuesday.`,
    }),
    v.push({
      id: `b-nia30-qa`,
      lot: `L2610-172`,
      productId: `nia30`,
      madeAt: a - 1 * J + 14 * Y,
      expiresAt: a - J + 365 * J,
      qty: 360,
      left: 360,
      locId: `dc`,
      status: `quarantine`,
      chemistId: `m-sato`,
    }),
    v.forEach((e) => {
      let t = new Date(e.madeAt);
      e.lot = `L${t.getFullYear() % 100}${String(t.getMonth() + 1).padStart(2, `0`)}-${e.lot.split(`-`)[1]}`;
    }));
  let C = v.find((e) => e.id === `b-clo200-0`);
  C &&
    ((C.status = `hold`),
    (C.note = `Pump batch from Pacific Glassworks sticking — 1 in 40 fails. Holding until replacement pumps arrive.`));
  let w = [],
    T = 1186,
    E = (e, t, n, i, a = ``) => {
      let s = u.find((t) => t.id === e),
        c = o(i);
      w.push({
        id: `po-${T}`,
        number: `PO-${T++}`,
        supplierId: e,
        status: n,
        createdAt: c,
        sentAt: n === `draft` ? void 0 : c + 2 * Y,
        eta: To(c) + s.leadDays * J,
        receivedAt: n === `received` ? To(c) + (s.leadDays + r(-1, 2)) * J + 11 * Y : void 0,
        lines: t.map(([e, t]) => ({
          materialId: e,
          qty: t,
          received: n === `received` ? t : n === `partial` ? Math.round(t * 0.5) : 0,
          cost: l.find((t) => t.id === e).cost,
        })),
        note: a,
      });
    };
  (E(`s-nkuru`, [[`r-shea`, 60]], `received`, -64),
    E(
      `s-pacific`,
      [
        [`p-dropper`, 2e3],
        [`p-jar`, 1500],
      ],
      `received`,
      -48,
    ),
    E(
      `s-tidewater`,
      [
        [`r-camellia`, 40],
        [`r-glycerin`, 40],
      ],
      `received`,
      -33,
    ),
    E(
      `s-kessler`,
      [
        [`p-tube`, 1200],
        [`x-carton`, 1e3],
      ],
      `received`,
      -21,
    ),
    E(`s-blueridge`, [[`p-label`, 20]], `received`, -12),
    E(
      `s-vallee`,
      [
        [`r-niacin`, 10],
        [`r-squalane`, 20],
      ],
      `partial`,
      -11,
      `Squalane split shipment — second half on the next boat.`,
    ),
    E(
      `s-pacific`,
      [
        [`p-pump`, 1500],
        [`p-dropper15`, 1500],
      ],
      `sent`,
      -6,
      `Replacement pumps for the held cleansing-oil batch.`,
    ),
    E(`s-kessler`, [[`p-airless`, 1200]], `sent`, -3, `Rush: sunscreen is out at the DC.`),
    E(`s-sunvale`, [[`r-zinc`, 15]], `draft`, -1));
  let D = m.filter((e) => e.status === `delivered`),
    O = [0, 1, 2, 3, 4, 5].map((e) => {
      let t = D[D.length - 4 - e * 7],
        n = t.lines[0],
        r = [`requested`, `requested`, `received`, `restocked`, `refunded`, `rejected`][e];
      return {
        id: `rma-${4410 + e}`,
        number: `RMA-${4410 + e}`,
        orderId: t.id,
        productId: n.productId,
        qty: t.channel === `wholesale` ? 6 : 1,
        reason: Ko[e % Ko.length],
        status: r,
        createdAt: i - (e * 2.6 + 0.3) * J,
        refund: (t.channel === `wholesale` ? 6 : 1) * n.price,
      };
    }),
    k = [
      {
        id: `tr-318`,
        number: `TR-318`,
        from: `dc`,
        to: `shop`,
        lines: [
          { productId: `crb50`, qty: 24 },
          { productId: `nia30`, qty: 18 },
          { productId: `hbd250`, qty: 12 },
        ],
        status: `in-transit`,
        createdAt: o(0, 8, 9),
        eta: a + 15 * Y,
        byId: `m-ferreira`,
      },
      {
        id: `tr-319`,
        number: `TR-319`,
        from: `dc`,
        to: `shop`,
        lines: [{ productId: `bfs50`, qty: 24 }],
        status: `planned`,
        createdAt: o(0, 9, 10),
        eta: a + 2 * J + 11 * Y,
        byId: `m-whitfield`,
      },
      {
        id: `tr-317`,
        number: `TR-317`,
        from: `lab`,
        to: `dc`,
        lines: [
          { productId: `nia15`, qty: 60 },
          { productId: `crb15`, qty: 80 },
        ],
        status: `received`,
        createdAt: o(-4),
        eta: a - 3 * J,
        receivedAt: o(-3),
        byId: `m-zhao`,
      },
      {
        id: `tr-316`,
        number: `TR-316`,
        from: `dc`,
        to: `shop`,
        lines: [
          { productId: `clo100`, qty: 24 },
          { productId: `hgc50`, qty: 12 },
        ],
        status: `received`,
        createdAt: o(-9),
        eta: a - 8 * J,
        receivedAt: o(-8),
        byId: `m-ferreira`,
      },
      {
        id: `tr-315`,
        number: `TR-315`,
        from: `lab`,
        to: `dc`,
        lines: [{ productId: `clo30`, qty: 200 }],
        status: `received`,
        createdAt: o(-16),
        eta: a - 15 * J,
        receivedAt: o(-15),
        byId: `m-zhao`,
      },
    ],
    A = (t, n, i) =>
      t.map((t) => {
        let a = c.find((e) => e.id === t).stock[n] ?? 0;
        return { productId: t, expected: a, counted: i ? a + (e() < 0.35 ? r(-3, 2) : 0) : null };
      }),
    j = [
      {
        id: `ct-91`,
        number: `CC-091`,
        locId: `dc`,
        zone: `A`,
        status: `scheduled`,
        at: a + 1 * J + 7.5 * Y,
        byId: `m-asante`,
        lines: A([`crb15`, `crb50`, `clo30`, `clo100`, `clo200`], `dc`, !1),
      },
      {
        id: `ct-90`,
        number: `CC-090`,
        locId: `shop`,
        zone: `F`,
        status: `counting`,
        at: a + 9 * Y,
        byId: `m-whitfield`,
        lines: A([`crb50`, `nia30`, `hgc50`, `hbd250`, `hbd-wash`, `clo100`], `shop`, !1),
      },
      {
        id: `ct-89`,
        number: `CC-089`,
        locId: `dc`,
        zone: `C`,
        status: `done`,
        at: o(-7),
        byId: `m-asante`,
        lines: A([`hgc50`, `hgc75`], `dc`, !0),
      },
      {
        id: `ct-88`,
        number: `CC-088`,
        locId: `dc`,
        zone: `B`,
        status: `done`,
        at: o(-14),
        byId: `m-ferreira`,
        lines: A([`nia15`, `nia30`, `bfs50`, `hbd250`, `hbd-wash`], `dc`, !0),
      },
    ];
  j[1].lines.slice(0, 3).forEach((e) => {
    e.counted = e.expected - (e.productId === `nia30` ? 2 : 0);
  });
  let M = [],
    N = (e) => c.find((t) => t.id === e);
  (m
    .filter(
      (e) => (e.status === `shipped` || e.status === `delivered`) && e.createdAt > i - 42 * 864e5,
    )
    .forEach((e) => {
      let t = e.history.find((e) => e.to === `shipped` || e.to === `delivered`)?.at ?? e.createdAt;
      e.lines.forEach((n) =>
        M.push({
          id: Xo(`mv`),
          at: t,
          itemId: n.productId,
          locId: e.locId,
          qty: -n.qty,
          kind: `sale`,
          ref: e.number,
          byId: `m-asante`,
          value: -Zo(n.qty * N(n.productId).cost),
        }),
      );
    }),
    v
      .filter((e) => e.status !== `quarantine` && e.madeAt > i - 42 * 864e5)
      .forEach((e) =>
        M.push({
          id: Xo(`mv`),
          at: e.madeAt + 2 * J,
          itemId: e.productId,
          locId: e.locId,
          qty: e.qty,
          kind: `production`,
          ref: e.lot,
          byId: `m-sato`,
          value: Zo(e.qty * N(e.productId).cost),
        }),
      ),
    k
      .filter((e) => e.status === `received`)
      .forEach((e) =>
        e.lines.forEach((t) => {
          (M.push({
            id: Xo(`mv`),
            at: e.receivedAt,
            itemId: t.productId,
            locId: e.from,
            qty: -t.qty,
            kind: `transfer`,
            ref: e.number,
            byId: e.byId,
            value: 0,
          }),
            M.push({
              id: Xo(`mv`),
              at: e.receivedAt,
              itemId: t.productId,
              locId: e.to,
              qty: t.qty,
              kind: `transfer`,
              ref: e.number,
              byId: e.byId,
              value: 0,
            }));
        }),
      ),
    j
      .filter((e) => e.status === `done`)
      .forEach((e) =>
        e.lines.forEach((t) => {
          let n = (t.counted ?? t.expected) - t.expected;
          n &&
            M.push({
              id: Xo(`mv`),
              at: e.at + Y,
              itemId: t.productId,
              locId: e.locId,
              qty: n,
              kind: `count`,
              ref: e.number,
              byId: e.byId,
              value: Zo(n * N(t.productId).cost),
            });
        }),
      ),
    w
      .filter((e) => e.status === `received` || e.status === `partial`)
      .forEach((e) =>
        e.lines.forEach((t) => {
          t.received &&
            M.push({
              id: Xo(`mv`),
              at: e.receivedAt ?? Math.min(i - 26 * 36e5, e.eta),
              itemId: t.materialId,
              locId: `lab`,
              qty: t.received,
              kind: `receipt`,
              ref: e.number,
              byId: `m-menon`,
              value: Zo(t.received * t.cost),
            });
        }),
      ),
    O.filter((e) => e.status === `restocked`).forEach((e) =>
      M.push({
        id: Xo(`mv`),
        at: e.createdAt + 4 * Y,
        itemId: e.productId,
        locId: `dc`,
        qty: e.qty,
        kind: `return`,
        ref: e.number,
        byId: `m-raman`,
        value: Zo(e.qty * N(e.productId).cost),
      }),
    ),
    M.push({
      id: Xo(`mv`),
      at: o(-2, 10, 12),
      itemId: `clo100`,
      locId: `dc`,
      qty: -3,
      kind: `adjust`,
      ref: `Broken in aisle`,
      byId: `m-asante`,
      value: -Zo(3 * N(`clo100`).cost),
    }),
    M.sort((e, t) => t.at - e.at));
  let P =
      c.reduce(
        (e, t) => e + ((t.stock.dc ?? 0) + (t.stock.lab ?? 0) + (t.stock.shop ?? 0)) * t.cost,
        0,
      ) + l.reduce((e, t) => e + t.onHand * t.cost, 0),
    F = [],
    ee = new Date(i).getMonth();
  for (let e = 0; e <= ee; e++) {
    let t = new Date(new Date(i).getFullYear(), e, 1).getTime(),
      r = 1 + 0.22 * Math.sin((e - 2) / 1.9) + (e >= 9 ? 0.18 : 0),
      a = Math.round(n(8800, 12400) * r),
      o = Math.round(a * n(0.9, 1.04));
    F.push({
      label: new Date(t).toLocaleDateString(`en-US`, { month: `short` }),
      start: t,
      stockIn: a,
      stockOut: o,
      value: 0,
    });
  }
  let I = Do(i),
    L = (e, t) =>
      M.filter((n) => n.at >= I && e(n.kind) && Math.sign(n.value) === t).reduce(
        (e, t) => e + Math.abs(t.value),
        0,
      ),
    te = F[F.length - 1];
  ((te.stockIn = Math.round(L((e) => e !== `sale`, 1))),
    (te.stockOut = Math.round(L(() => !0, -1))));
  let R = P;
  for (let e = F.length - 1; e >= 0; e--)
    ((F[e].value = Math.round(R)), (R = R - F[e].stockIn + F[e].stockOut));
  let z = [],
    ne = a - ((new Date(a).getDay() + 6) % 7) * J;
  for (let e = 11; e >= 0; e--) {
    let t = ne - e * 7 * J,
      r = t + 7 * J,
      i = M.filter((e) => e.at >= t && e.at < r && e.value > 0).reduce((e, t) => e + t.value, 0),
      a = M.filter((e) => e.at >= t && e.at < r && e.value < 0).reduce((e, t) => e - t.value, 0);
    z.push({
      label: new Date(t).toLocaleDateString(`en-US`, { month: `short`, day: `numeric` }),
      start: t,
      stockIn: Math.round(i || n(3200, 5200)),
      stockOut: Math.round(a || n(3e3, 4800)),
      value: 0,
    });
  }
  R = P;
  for (let e = z.length - 1; e >= 0; e--)
    ((z[e].value = Math.round(R)), (R = R - z[e].stockIn + z[e].stockOut));
  let re = [],
    ie = (e, t, n, r, i, a) =>
      re.push({ id: Xo(`a`), at: e, who: t, kind: n, title: r, text: i, href: a });
  (ie(
    i - 18 * So,
    `m-asante`,
    `ship`,
    `Shipment dispatched`,
    `${m.filter((e) => e.status === `shipped`).slice(-1)[0]?.number ?? `SO`} left the DC with UPS`,
    `/orders/all`,
  ),
    ie(
      i - 52 * So,
      `m-zhao`,
      `batch`,
      `Batch made`,
      `L2610-172 · 360 × Niacinamide 30 ml into QA`,
      `/products/batches`,
    ),
    ie(
      i - 95 * So,
      `m-ferreira`,
      `transfer`,
      `Transfer dispatched`,
      `TR-318 · 54 units to the Studio Shop`,
      `/warehouses/transfers`,
    ),
    ie(
      i - 3.2 * Y,
      `m-raman`,
      `return`,
      `Return requested`,
      `${O[0].number} · ${O[0].reason.toLowerCase()}`,
      `/orders/returns`,
    ),
    ie(
      i - 5.5 * Y,
      `m-menon`,
      `po`,
      `Purchase order sent`,
      `PO-1193 · 1,200 airless pumps from Kessler Packaging`,
      `/purchasing/orders`,
    ),
    ie(
      i - 20 * Y,
      `m-asante`,
      `stock`,
      `Stock adjusted`,
      `−3 Camellia Cleansing Oil 100 ml · broken in aisle`,
      `/products/item/clo100`,
    ),
    ie(
      i - 26 * Y,
      `m-zhao`,
      `batch`,
      `Batch made`,
      `L2610-171 · 480 × Barrier Fluid SPF 30 into QA`,
      `/products/batches`,
    ),
    ie(
      i - 30 * Y,
      `m-marchetti`,
      `order`,
      `Wholesale order received`,
      `Juniper & Moss Apothecary · 4 lines`,
      `/orders/all`,
    ),
    ie(
      i - 2.1 * J,
      `m-sato`,
      `batch`,
      `Batch on hold`,
      `Camellia Cleansing Oil 200 ml · sticking pumps`,
      `/products/batches`,
    ),
    ie(
      i - 3 * J,
      `m-zhao`,
      `transfer`,
      `Transfer received`,
      `TR-317 · 140 units into Riverside DC`,
      `/warehouses/transfers`,
    ),
    ie(
      i - 7 * J,
      `m-asante`,
      `count`,
      `Cycle count closed`,
      `CC-089 · cool room · 2 lines`,
      `/warehouses/counts`,
    ),
    ie(
      i - 9 * J,
      `m-okafor`,
      `team`,
      `Teammate invited`,
      `Priya Raman joined as Customer care`,
      `/settings/team`,
    ),
    re.sort((e, t) => t.at - e.at));
  let ae = [
      {
        id: Xo(`n`),
        at: i - 40 * So,
        text: `Barrier Fluid SPF 30 is out of stock at Riverside DC`,
        href: `/products/item/bfs50`,
        read: !1,
        kind: `stock`,
      },
      {
        id: Xo(`n`),
        at: i - 2 * Y,
        text: `Lot of Calendula Rescue Balm 50 ml expires in 9 days`,
        href: `/products/batches`,
        read: !1,
        kind: `expiry`,
      },
      {
        id: Xo(`n`),
        at: i - 4 * Y,
        text: `Juniper & Moss Apothecary placed a wholesale order`,
        href: `/orders/board`,
        read: !1,
        kind: `order`,
      },
      {
        id: Xo(`n`),
        at: i - 27 * Y,
        text: `Vallée Actives shipped half of PO-1191`,
        href: `/purchasing/orders`,
        read: !0,
        kind: `po`,
      },
      {
        id: Xo(`n`),
        at: i - 2.2 * J,
        text: `Non-nano zinc oxide is below its reorder level`,
        href: `/purchasing/materials`,
        read: !0,
        kind: `stock`,
      },
    ],
    oe = [
      {
        id: `t-1`,
        number: `HLP-208`,
        subject: `Barcode labels print off-centre on the Zebra`,
        body: `Labels from the batch page are shifted 3 mm to the right.`,
        topic: `Printing & labels`,
        status: `answered`,
        at: i - 5 * J,
        reply: `Set the label size to 50 × 25 mm in Settings › Company › Printing; the default is 2 × 1 in.`,
      },
      {
        id: `t-2`,
        number: `HLP-201`,
        subject: `Can a count be split across two people?`,
        body: `We want Kwame on aisle A and Tomás on aisle B at the same time.`,
        topic: `Counts`,
        status: `closed`,
        at: i - 19 * J,
        reply: `Yes — create one count per zone; each gets its own counter.`,
      },
    ],
    se = m
      .filter((e) => e.createdAt >= I && e.status !== `cancelled`)
      .reduce((e, t) => e + t.lines.reduce((e, t) => e + t.qty * t.price, 0), 0),
    ce = {
      me: {
        id: Qo,
        name: `Vels Okafor`,
        email: `Vels@marlowfern.co`,
        title: `Operations lead`,
        phone: `(828) 555-0142`,
      },
      company: {
        name: `Marlow & Fern`,
        legal: `Marlow & Fern Skincare LLC`,
        address: `402 Monticello Rd, Weaverville, NC 28787`,
        phone: `(828) 555-0100`,
        email: `hello@marlowfern.co`,
        taxId: `88-4120795`,
        currency: `INR`,
        timezone: `America/New_York`,
        fiscalStart: `January`,
      },
      billing: {
        plan: `Growth`,
        seats: 12,
        cycle: `yearly`,
        card: { brand: `Visa`, last4: `4821`, exp: `08/28`, name: `Marlow & Fern Skincare` },
        invoices: [0, 1, 2, 3, 4, 5].map((e) => ({
          id: `VS-2026-${String(10 - e).padStart(3, `0`)}`,
          at: Do(i) - e * 30.4 * J + 2 * J,
          amount: 149,
          status: `paid`,
        })),
      },
      notify: {
        lowStock: !0,
        expiry: !0,
        orders: !0,
        poUpdates: !0,
        returns: !1,
        digest: !0,
        email: !0,
        push: !1,
      },
      prefs: { expiryWarnDays: 90, lowStockMode: `fixed`, defaultLoc: `dc`, weekStart: `mon` },
      goal: Math.ceil(se / 0.713 / 500) * 500,
    };
  return {
    version: 1,
    team: s,
    locations: es.map((e) => ({ ...e, zones: e.zones.map((e) => ({ ...e })) })),
    products: c,
    batches: v,
    materials: l,
    suppliers: u,
    pos: w,
    customers: d,
    orders: m.sort((e, t) => t.createdAt - e.createdAt),
    returns: O,
    transfers: k,
    counts: j,
    moves: M,
    activity: re,
    notices: ae,
    tickets: oe,
    months: F,
    weeks: z,
    settings: ce,
  };
}
var us = `Vels:data:v2`;
function ds() {
  if (Co) return ls();
  try {
    let e = JSON.parse(localStorage.getItem(us) ?? `null`);
    if (e && e.version === 1) {
      if (e.settings?.company?.currency === `USD`) e.settings.company.currency = `INR`;
      return e;
    }
  } catch {}
  return ls();
}
var X = ds(),
  fs = [
    `team`,
    `locations`,
    `products`,
    `batches`,
    `materials`,
    `suppliers`,
    `pos`,
    `customers`,
    `orders`,
    `returns`,
    `transfers`,
    `counts`,
    `moves`,
    `activity`,
    `notices`,
    `tickets`,
    `history`,
    `settings`,
  ],
  ps = new Map();
function ms(e, t) {
  return (ps.has(e) || ps.set(e, new Set()), ps.get(e).add(t), () => ps.get(e).delete(t));
}
var hs = 0;
function Z(...e) {
  Co ||
    (clearTimeout(hs),
    (hs = window.setTimeout(() => {
      try {
        localStorage.setItem(us, JSON.stringify(X));
      } catch {}
    }, 250)));
  let t = new Set();
  (e.forEach((e) => ps.get(e)?.forEach((e) => t.add(e))),
    ps.get(`*`)?.forEach((e) => t.add(e)),
    t.forEach((e) => e()));
}
function gs() {
  try {
    localStorage.removeItem(us);
  } catch {}
  ((X = ls()), Z(...fs));
}
function _s(e, t, n, r, i = Qo) {
  (X.activity.unshift({ id: Xo(`a`), at: Date.now(), who: i, kind: e, title: t, text: n, href: r }),
    (X.activity.length = Math.min(X.activity.length, 120)));
}
function vs(e, t, n) {
  (X.notices.unshift({ id: Xo(`n`), at: Date.now(), text: t, href: n, read: !1, kind: e }),
    (X.notices.length = Math.min(X.notices.length, 30)));
}
var ys = (e) => X.team.find((t) => t.id === e),
  bs = (e) => X.locations.find((t) => t.id === e),
  Q = (e) => X.products.find((t) => t.id === e),
  xs = (e) => X.materials.find((t) => t.id === e),
  Ss = (e) => X.suppliers.find((t) => t.id === e),
  Cs = (e) => X.customers.find((t) => t.id === e),
  ws = (e) => X.orders.find((t) => t.id === e),
  Ts = (e) => X.batches.find((t) => t.id === e),
  Es = (e) => X.pos.find((t) => t.id === e),
  Ds = (e) => (e === `web` ? `Online store` : (ys(e)?.name ?? Cs(e)?.name ?? ``)),
  Os = (e) => `/Vels/photos/Vels/${e.photo}.jpg`,
  ks = (e) => `${e.name} ${e.size}`,
  As = (e, t) => (t ? (e.stock[t] ?? 0) : Object.values(e.stock).reduce((e, t) => e + t, 0));
function js(e, t) {
  return X.orders
    .filter((e) => Ao.includes(e.status) && (!t || e.locId === t))
    .reduce(
      (t, n) => t + n.lines.filter((t) => t.productId === e).reduce((e, t) => e + t.qty, 0),
      0,
    );
}
var Ms = (e, t) => As(e, t) - js(e.id, t),
  Ns = (e) => e.active && Ms(e, `dc`) <= e.reorderAt,
  Ps = (e) => e.active && Ms(e, `dc`) <= 0,
  Fs = () => X.products.filter(Ns),
  Is = () => X.products.filter(Ps),
  Ls = (e) => e.onHand <= e.reorderAt,
  Rs = () => X.materials.filter(Ls),
  zs = (e) =>
    X.pos
      .filter((e) => e.status === `sent` || e.status === `partial`)
      .reduce(
        (t, n) =>
          t +
          n.lines.filter((t) => t.materialId === e).reduce((e, t) => e + (t.qty - t.received), 0),
        0,
      ),
  Bs = () => X.products.reduce((e, t) => e + As(t), 0),
  Vs = () => X.products.reduce((e, t) => e + As(t) * t.cost, 0),
  Hs = () => X.materials.reduce((e, t) => e + t.onHand * t.cost, 0),
  Us = () => Vs() + Hs(),
  Ws = () => X.products.reduce((e, t) => e + As(t) * t.price, 0),
  Gs = (e) => e.lines.reduce((e, t) => e + t.qty * t.price, 0),
  Ks = (e) => e.lines.reduce((e, t) => e + t.qty, 0),
  qs = (e) => e.lines.reduce((e, t) => e + t.qty * t.cost, 0),
  Js = (e) => e.status !== `cancelled`;
function Ys(e, t) {
  return X.orders.filter((n) => n.createdAt >= e && n.createdAt < t && Js(n));
}
function Xs(e, t) {
  return Ys(e, t).reduce((e, t) => e + Gs(t), 0);
}
var Zs = () => Xs(Do(Date.now()), Date.now() + J),
  Qs = (e) => Math.ceil((e.expiresAt - Date.now()) / J),
  $s = () =>
    X.batches
      .filter(
        (e) => e.left > 0 && e.status === `released` && Qs(e) <= X.settings.prefs.expiryWarnDays,
      )
      .sort((e, t) => e.expiresAt - t.expiresAt),
  ec = () => X.orders.filter((e) => Ao.includes(e.status)),
  tc = () => X.notices.filter((e) => !e.read).length;
function nc(e, t) {
  let n = Date.now() - t * J;
  return X.orders
    .filter((e) => e.createdAt >= n && Js(e))
    .reduce(
      (t, n) => t + n.lines.filter((t) => t.productId === e).reduce((e, t) => e + t.qty, 0),
      0,
    );
}
var rc = (e) => {
  let t = nc(e.id, 30) / 30;
  return t ? Math.floor(Ms(e) / t) : 1 / 0;
};
function ic(e, t) {
  let n = Eo();
  return Array.from({ length: t }, (r, i) => {
    let a = n - (t - 1 - i) * J,
      o = a + J;
    return X.orders
      .filter((e) => e.createdAt >= a && e.createdAt < o && Js(e))
      .reduce(
        (t, n) => t + n.lines.filter((t) => t.productId === e).reduce((e, t) => e + t.qty, 0),
        0,
      );
  });
}
function ac(e = 3, t = 30) {
  let n = Date.now() - t * J,
    r = new Map();
  return (
    X.orders
      .filter((e) => e.createdAt >= n && Js(e))
      .forEach((e) =>
        e.lines.forEach((e) => {
          let t = r.get(e.productId) ?? { units: 0, revenue: 0, orders: 0 };
          ((t.units += e.qty),
            (t.revenue += e.qty * e.price),
            (t.orders += 1),
            r.set(e.productId, t));
        }),
      ),
    [...r.entries()]
      .map(([e, t]) => ({ product: Q(e), ...t }))
      .filter((e) => e.product)
      .sort((e, t) => t.revenue - e.revenue)
      .slice(0, e)
  );
}
var oc = (e) => X.products.reduce((t, n) => t + (n.stock[e] ?? 0), 0),
  sc = new Intl.NumberFormat(`en-US`),
  cc = (e) => sc.format(Math.round(e)),
  lc = (e, t = 1) => new Intl.NumberFormat(`en-US`, { maximumFractionDigits: t }).format(e),
  uc = (e, t = 0) => `${(e * 100).toFixed(t)}%`,
  dc = new Intl.NumberFormat(`en-IN`, { style: `currency`, currency: `INR` }),
  fc = new Intl.NumberFormat(`en-IN`, {
    style: `currency`,
    currency: `INR`,
    maximumFractionDigits: 0,
  }),
  pc = (e) => dc.format(e),
  mc = (e) => fc.format(Math.round(e)),
  hc = (e) =>
    Math.abs(e) >= 1e3 ? `₹${(e / 1e3).toFixed(Math.abs(e) >= 1e4 ? 0 : 1)}k` : `₹${Math.round(e)}`,
  gc = { int: cc, pct: (e) => uc(e), pct1: (e) => uc(e, 1), money: mc, money2: pc, moneyK: hc },
  _c = (e, t = !1) =>
    new Date(e).toLocaleDateString(`en-US`, {
      month: `short`,
      day: `numeric`,
      ...(t ? { year: `numeric` } : {}),
    }),
  vc = (e) => new Date(e).toLocaleTimeString(`en-US`, { hour: `2-digit`, minute: `2-digit` }),
  yc = (e) =>
    new Date(e).toLocaleDateString(`en-US`, { weekday: `short`, month: `short`, day: `numeric` }),
  bc = (e) => `${_c(e, !0)} at ${vc(e)}`;
function xc(e) {
  let t = Date.now() - e,
    n = Math.abs(t),
    r = t < 0,
    i = Math.round(n / 6e4),
    a = Math.round(n / 36e5),
    o = Math.round(n / J);
  if (n < 6e4) return `just now`;
  let s = i < 60 ? `${i} min` : a < 24 ? `${a} h` : o < 7 ? `${o} d` : ``;
  return s ? (r ? `in ${s}` : `${s} ago`) : _c(e);
}
function Sc(e) {
  let t = new Date(Date.now()).setHours(0, 0, 0, 0),
    n = Math.floor((new Date(e).setHours(0, 0, 0, 0) - t) / J);
  return n === 0 ? `Today` : n === 1 ? `Tomorrow` : n === -1 ? `Yesterday` : yc(e);
}
var Cc = (e, t, n = `${t}s`) => `${cc(e)} ${e === 1 ? t : n}`,
  wc = {
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
    layers: `<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>`,
    sidebar: `<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/>`,
    box: `<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9M7.7 5.2l8.6 4.6"/>`,
    boxes: `<rect x="3.5" y="12" width="8" height="8" rx="1.5"/><rect x="12.5" y="12" width="8" height="8" rx="1.5"/><rect x="8" y="4" width="8" height="8" rx="1.5"/>`,
    stack: `<path d="M12 3.5 20 7.8 12 12 4 7.8Z"/><path d="m4 12 8 4.3 8-4.3M4 16.2l8 4.3 8-4.3"/>`,
    orders: `<path d="M6 3.5h9l3 3v14H6z"/><path d="M15 3.5v3h3"/><circle cx="11.5" cy="13" r="2.6"/><path d="m13.5 15 2 2"/>`,
    cart: `<path d="M3.5 4.5h2.2l2 10.5h10l2-7.5H7"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>`,
    warehouse: `<path d="M3.5 20V9l8.5-5 8.5 5v11"/><path d="M7 20v-7h10v7M7 16.5h10"/>`,
    truck: `<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>`,
    swap: `<path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5M20 16H7M10.5 12.5 7 16l3.5 3.5"/>`,
    clipboard: `<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 4.5V3.8a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v.7M8.5 10h7M8.5 13.5h7M8.5 17h4"/>`,
    clipCheck: `<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 4.5V3.8a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v.7M9 13l2 2 4-4"/>`,
    scan: `<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 8.5v7M11 8.5v7M13.5 8.5v7M16 8.5v7"/>`,
    barcode: `<path d="M4 6v12M7 6v12M10.5 6v12M13 6v12M16.5 6v12M20 6v12"/>`,
    flask: `<path d="M9.5 3.5h5M10.5 3.5v5.2L5 18.3A1.5 1.5 0 0 0 6.3 20.5h11.4a1.5 1.5 0 0 0 1.3-2.2L13.5 8.7V3.5"/><path d="M7.5 14.5h9"/>`,
    drop: `<path d="M12 3.5s-6 6.4-6 10.7a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5Z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>`,
    return: `<path d="M9.5 6.5 4 12l5.5 5.5"/><path d="M4.5 12h9a6 6 0 0 1 6 6v.5"/>`,
    hourglass: `<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 5-8 8.5"/>`,
    pause: `<path d="M8.5 5.5v13M15.5 5.5v13"/>`,
    play: `<path d="M8 5.5v13l10-6.5z"/>`,
    sparkle: `<path d="M12 3.5c.6 4.2 2.4 6 6.5 6.5-4.1.6-5.9 2.3-6.5 6.5-.6-4.2-2.4-5.9-6.5-6.5 4.1-.5 5.9-2.3 6.5-6.5Z"/><path d="M18.5 15.5c.3 1.8 1 2.6 2.5 3-1.5.3-2.2 1.1-2.5 3-.3-1.9-1-2.7-2.5-3 1.5-.4 2.2-1.2 2.5-3Z"/>`,
    bolt: `<path d="M13 3 5 13.5h6L10.5 21 19 10h-6z"/>`,
    globe: `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5Z"/>`,
    building: `<path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 15 5v15.5M15 9.5h3a1.5 1.5 0 0 1 1.5 1.5v9.5M3 20.5h18M8.5 7.5h3M8.5 11h3M8.5 14.5h3"/>`,
    key: `<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16.5 6.5l2.5 2.5M14 9l2 2"/>`,
  },
  Tc = (e, t = ``) =>
    `<svg class="ico ${t}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${wc[e] ?? ``}</svg>`,
  Ec = (e, t, n = ``, r = ``) =>
    `<button type="button" class="ibtn ${r}" aria-label="${q(t)}" title="${q(t)}" ${n}>${Tc(e)}</button>`,
  Dc = (e) =>
    e
      .replace(/[&]/g, ` `)
      .split(/\s+/)
      .filter(Boolean)
      .map((e) => e[0])
      .join(``)
      .slice(0, 2)
      .toUpperCase();
function Oc(e, t = `sm`, n = ``) {
  let r = ys(e),
    i = r ? null : Cs(e),
    a = r?.name ?? i?.name ?? (e === `web` ? `Online store` : ``);
  return a
    ? `<span class="av av--${t} ${r ? `av--${r.tone}` : `av--t${[...e].reduce((e, t) => e + t.charCodeAt(0), 0) % 6}`} ${n}" title="${q(a)}" aria-hidden="true">${e === `web` ? Tc(`globe`) : q(Dc(a))}</span>`
    : ``;
}
var kc = (e, t = `sm`) =>
    `<span class="av-stack" role="img" aria-label="${q(e.map((e) => ys(e)?.name ?? Cs(e)?.name ?? ``).join(`, `))}">${e.map((e) => Oc(e, t)).join(``)}</span>`,
  Ac = (e, t, n = ``) =>
    `<span class="spill" style="--c:var(--${t})">${n ? Tc(n) : `<i></i>`}${q(e)}</span>`,
  jc = (e) => Ac(Oo[e].name, Oo[e].tone),
  Mc = (e, t = `md`) =>
    `<span class="thumb thumb--${t}"><img src="${Os(e)}" width="620" height="734" alt="" loading="lazy" decoding="async" /></span>`,
  Nc = (e, t, n = `md`) => `<span class="tile tile--${n}" style="--c:var(--${t})">${Tc(e)}</span>`;
function Pc(e, t, n = `search`, r = ``) {
  return `<div class="empty">${Tc(n)}<p class="empty__title">${q(e)}</p><p class="empty__text">${q(t)}</p>${r}</div>`;
}
function Fc(e, t) {
  if (!t) return q(e);
  let n = e.toLowerCase().indexOf(t.toLowerCase());
  return n < 0
    ? q(e)
    : `${q(e.slice(0, n))}<mark>${q(e.slice(n, n + t.length))}</mark>${q(e.slice(n + t.length))}`;
}
function Ic(e, t = !1) {
  if (!isFinite(e)) return ``;
  let n = e >= 0;
  return `<span class="delta delta--${(t ? !n : n) ? `good` : `bad`}">${Tc(n ? `trend` : `trendDown`)}${Math.abs(e * 100).toFixed(1)}%</span>`;
}
function Lc(e) {
  return `<header class="head">
    <div class="head__lead">
      ${e.back ? `<a class="ibtn ibtn--lg magnetic head__back" href="${e.back}" aria-label="Back">${Tc(`back`)}</a>` : ``}
      <div class="head__text">${e.eyebrow ? `<p class="head__eyebrow">${e.eyebrow}</p>` : ``}<h1 class="head__title" tabindex="-1">${e.title}</h1></div>
    </div>
    ${e.actions ? `<div class="head__actions">${e.actions}</div>` : ``}
    ${e.stats?.length ? `<dl class="head__stats">${e.stats.map(Rc).join(``)}</dl>` : ``}
  </header>`;
}
var Rc = (e) => `<div class="stat"${e.key ? ` data-stat="${e.key}"` : ``}>
    <dt class="stat__label"><span class="stat__ico" style="--c:var(--${e.ico ?? `pine`})">${Tc(e.icon)}</span>${q(e.label)}</dt>
    <dd class="stat__value"><b data-count="${e.value}" data-fmt="${e.fmt ?? `int`}">${(gc[e.fmt ?? `int`] ?? cc)(e.value)}</b>${e.suffix ? `<span class="stat__suffix">${q(e.suffix)}</span>` : ``}${e.badge ? `<span class="badge badge--${e.tone ?? `plain`}">${q(e.badge)}</span>` : ``}</dd>
  </div>`;
function zc(e, { from0: t = !0, delay: n = 0 } = {}) {
  K(`[data-count]`, e).forEach((e, r) => {
    let i = gc[e.dataset.fmt ?? `int`] ?? cc;
    ho(e, Number(e.dataset.count), i, { from: t ? 0 : void 0, duration: 1.4, delay: n + r * 0.06 });
  });
}
function Bc(e, t) {
  e &&
    ((e.dataset.count = String(t)), ho(e, t, gc[e.dataset.fmt ?? `int`] ?? cc, { duration: 0.9 }));
}
function Vc(e, t = 0) {
  let n = H.timeline({ delay: W(t) });
  n.add(oo(io(`.head__title`, e)), 0);
  let r = io(`.head__back`, e);
  return (
    r &&
      n.fromTo(
        r,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: W(0.6), ease: `power3.out`, clearProps: `transform,opacity` },
        0,
      ),
    n.add(co(K(`.head__eyebrow`, e), { y: 8 }), 0),
    n.add(co(K(`.head .stat, .head__actions > *`, e), { y: 14, stagger: 0.07 }), 0.12),
    n.add(() => {
      let t = io(`.head`, e);
      t && zc(t);
    }, 0.15),
    n
  );
}
function Hc(e, t, n, r = !0, i = 999) {
  if (!n || !n.offsetWidth) {
    H.set(e, { opacity: 0 });
    return;
  }
  let a = t.scrollWidth,
    o = t.scrollHeight,
    s = {
      l: n.offsetLeft,
      r: a - (n.offsetLeft + n.offsetWidth),
      t: n.offsetTop,
      b: o - (n.offsetTop + n.offsetHeight),
    },
    c = (e) => `inset(${e.t}px ${e.r}px ${e.b}px ${e.l}px round ${i}px)`,
    l = e,
    u = l.__e;
  if (((l.__e = s), !r || $a() || !u || Number(H.getProperty(e, `opacity`)) === 0)) {
    (H.killTweensOf(l.__st ?? {}), (l.__st = { ...s }), H.set(e, { clipPath: c(s), opacity: 1 }));
    return;
  }
  let d = l.__st ?? { ...u };
  ((l.__st = d), H.killTweensOf(d));
  let f = Math.abs(s.t - u.t) > Math.abs(s.l - u.l),
    p = f ? s.t > u.t : s.l > u.l,
    [m, h] = f ? (p ? [`b`, `t`] : [`t`, `b`]) : p ? [`r`, `l`] : [`l`, `r`],
    g = f ? [`l`, `r`] : [`t`, `b`],
    _ = () => H.set(e, { clipPath: c(d) });
  (H.to(d, { [m]: s[m], duration: 0.36, ease: `power3.out`, onUpdate: _ }),
    H.to(d, { [h]: s[h], duration: 0.55, ease: `power3.inOut`, onUpdate: _ }),
    H.to(d, {
      [g[0]]: s[g[0]],
      [g[1]]: s[g[1]],
      duration: 0.45,
      ease: `power3.inOut`,
      onUpdate: _,
    }));
}
function Uc(e, t, n, r = ``) {
  return `<div class="seg ${r}" role="group" aria-label="${q(e)}"><span class="seg__pill" aria-hidden="true"></span>${t.map(([e, t]) => `<button type="button" class="seg__btn" data-value="${q(e)}" aria-pressed="${e === n}">${q(t)}</button>`).join(``)}</div>`;
}
function Wc(e, t) {
  let n = G(`.seg__pill`, e),
    r = K(`.seg__btn`, e),
    i = () => r.find((e) => e.getAttribute(`aria-pressed`) === `true`) ?? r[0],
    a = (t = !0) => Hc(n, e, i(), t);
  function o(e, { silent: n = !1 } = {}) {
    let o = r.find((t) => t.dataset.value === e);
    !o ||
      o === i() ||
      (r.forEach((e) => e.setAttribute(`aria-pressed`, String(e === o))), a(), n || t(e));
  }
  return (
    r.forEach((e) =>
      e.addEventListener(`click`, () => {
        (go(e), o(e.dataset.value ?? ``));
      }),
    ),
    new ResizeObserver(() => a(!1)).observe(e),
    requestAnimationFrame(() => a(!1)),
    {
      place: a,
      select: o,
      get value() {
        return i().dataset.value ?? ``;
      },
    }
  );
}
var Gc = null;
function Kc(e = !1) {
  Gc?.close(e);
}
function qc(e, t, { cls: n = ``, align: r = `end`, label: i = ``, onClose: a } = {}) {
  if (Gc?.anchor === e) return (Kc(), null);
  Kc();
  let o = document.createElement(`div`);
  ((o.className = `pop ${n}`),
    i && (o.setAttribute(`role`, `dialog`), o.setAttribute(`aria-label`, i)),
    typeof t == `string` ? (o.innerHTML = t) : o.append(t),
    G(`.pop-layer`).append(o),
    e.setAttribute(`aria-expanded`, `true`));
  let s = () => {
    let t = e.getBoundingClientRect(),
      n = o.offsetWidth,
      i = o.offsetHeight,
      a = innerWidth,
      s = innerHeight,
      c = r === `start` ? t.left : r === `center` ? t.left + t.width / 2 - n / 2 : t.right - n;
    c = Math.max(12, Math.min(a - n - 12, c));
    let l = t.bottom + 8 + i < s - 12 || t.top < i + 8 + 12,
      u = l ? t.bottom + 8 : t.top - 8 - i;
    ((o.style.left = `${c}px`),
      (o.style.top = `${Math.max(12, u)}px`),
      (o.style.transformOrigin = `${t.left + t.width / 2 - c}px ${l ? 0 : i}px`));
  };
  (s(),
    H.fromTo(
      o,
      { opacity: 0, scale: 0.94, y: -4 },
      { opacity: 1, scale: 1, y: 0, duration: W(0.32), ease: `back.out(1.8)` },
    ));
  let c = (t) => {
      !o.contains(t.target) && !e.contains(t.target) && d();
    },
    l = (e) => {
      e.key === `Escape` && (e.stopPropagation(), d(!0));
    },
    u = (e) => {
      (e.target instanceof Node && o.contains(e.target)) || d();
    };
  function d(t = !1) {
    !Gc ||
      Gc.el !== o ||
      ((Gc = null),
      e.setAttribute(`aria-expanded`, `false`),
      document.removeEventListener(`pointerdown`, c, !0),
      document.removeEventListener(`keydown`, l, !0),
      removeEventListener(`resize`, u),
      removeEventListener(`scroll`, u, !0),
      H.to(o, {
        opacity: 0,
        scale: 0.96,
        duration: W(0.16),
        ease: `power2.in`,
        onComplete: () => o.remove(),
      }),
      t && e.focus(),
      a?.());
  }
  return (
    setTimeout(() => {
      (document.addEventListener(`pointerdown`, c, !0),
        document.addEventListener(`keydown`, l, !0),
        addEventListener(`resize`, u),
        addEventListener(`scroll`, u, !0));
    }),
    (Gc = { el: o, anchor: e, close: d }),
    { el: o, close: d, place: s }
  );
}
function Jc(e, t, n = {}) {
  let r = document.createElement(`div`);
  (r.setAttribute(`role`, `menu`),
    (r.innerHTML = t
      .map((e, t) =>
        e === `-`
          ? `<hr role="separator">`
          : `<button type="button" role="${e.checked === void 0 ? `menuitem` : `menuitemradio`}" ${e.checked === void 0 ? `` : `aria-checked="${e.checked}"`} class="menu__item${e.danger ? ` is-danger` : ``}" data-i="${t}">${e.icon ? Tc(e.icon) : ``}<span>${q(e.label)}</span>${e.checked ? Tc(`check`, `menu__check`) : ``}</button>`,
      )
      .join(``)));
  let i = qc(e, r, { cls: `pop--menu`, align: n.align ?? `end` });
  if (!i) return;
  let a = K(`.menu__item`, r);
  (co(a, { y: 6, stagger: 0.025 }),
    matchMedia(`(pointer: fine)`).matches && a[0]?.focus(),
    r.addEventListener(`click`, (e) => {
      let n = e.target.closest(`.menu__item`);
      if (!n) return;
      let r = t[Number(n.dataset.i)];
      (i.close(!0), r.onSelect());
    }),
    r.addEventListener(`keydown`, (e) => {
      let t = a.indexOf(document.activeElement);
      (e.key === `ArrowDown` || e.key === `ArrowUp`) &&
        (e.preventDefault(),
        a[(t + (e.key === `ArrowDown` ? 1 : -1) + a.length) % a.length]?.focus());
    }));
}
var Yc = matchMedia(`(max-width: 760px)`);
function Xc(e, t) {
  (e.showModal(),
    H.fromTo(e, t, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: W(0.45),
      ease: `back.out(1.5)`,
      clearProps: `transform`,
    }));
}
function Zc(e, t, n) {
  !e.open ||
    e.dataset.closing ||
    ((e.dataset.closing = `1`),
    il(),
    H.to(e, {
      ...t,
      opacity: 0,
      duration: W(0.22),
      ease: `power2.in`,
      onComplete: () => {
        (delete e.dataset.closing, e.close(), H.set(e, { clearProps: `all` }), n?.());
      },
    }));
}
function Qc(e) {
  e.dataset.wired ||
    ((e.dataset.wired = `1`),
    e.addEventListener(`cancel`, (t) => {
      (t.preventDefault(), e.__close?.());
    }),
    e.addEventListener(`click`, (t) => {
      t.target === e && e.__close?.();
    }));
}
function $c(e) {
  let t = G(`#modal`),
    n = Yc.matches,
    r = () => Zc(t, n ? { y: 60 } : { y: 12, scale: 0.98 });
  (Qc(t),
    (t.__close = r),
    (t.innerHTML = `<form class="mform" method="dialog" novalidate>
    <header class="mform__head"><div><h2 class="mform__title">${q(e.title)}</h2>${e.sub ? `<p class="mform__sub">${q(e.sub)}</p>` : ``}</div>${Ec(`close`, `Close`, `data-close`)}</header>
    <div class="mform__grid">${e.fields
      .map((e) => {
        let t = `f-${e.name}`,
          n = e.value === void 0 ? `` : q(e.value),
          r = `id="${t}" name="${e.name}" ${e.required ? `required` : ``} ${e.placeholder ? `placeholder="${q(e.placeholder)}"` : ``}`,
          i =
            e.type === `select`
              ? `<select ${r}>${(e.options ?? []).map(([t, n]) => `<option value="${q(t)}"${String(e.value) === t ? ` selected` : ``}>${q(n)}</option>`).join(``)}</select>`
              : e.type === `textarea`
                ? `<textarea ${r} rows="4">${n}</textarea>`
                : `<input ${r} type="${e.type ?? `text`}" value="${n}" ${e.min === void 0 ? `` : `min="${e.min}"`} ${e.max === void 0 ? `` : `max="${e.max}"`} ${e.step === void 0 ? `` : `step="${e.step}"`} autocomplete="off" />`;
        return `<label class="field${e.wide ? ` field--wide` : ``}" for="${t}"><span class="field__label">${q(e.label)}</span>${i}${e.hint ? `<span class="field__hint">${q(e.hint)}</span>` : ``}</label>`;
      })
      .join(``)}${e.extra ?? ``}</div>
    <p class="mform__err" role="alert"></p>
    <footer class="mform__foot"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button type="submit" class="btn ${e.danger ? `btn--danger` : `btn--primary`}">${q(e.submit)}</button></footer>
  </form>`));
  let i = G(`form`, t);
  (K(`[data-close]`, t).forEach((e) => e.addEventListener(`click`, r)),
    i.addEventListener(`submit`, (t) => {
      t.preventDefault();
      let n = K(`[required]`, i).find((e) => !e.value.trim());
      if (n) {
        ((G(`.mform__err`, i).textContent =
          `${n.closest(`.field`)?.querySelector(`.field__label`)?.textContent ?? `This field`} is required.`),
          n.focus(),
          el(G(`.mform__err`, i)));
        return;
      }
      let a = Object.fromEntries(
          [...new FormData(i).entries()].map(([e, t]) => [e, String(t).trim()]),
        ),
        o = e.onSubmit(a);
      if (o) {
        ((G(`.mform__err`, i).textContent = o), el(G(`.mform__err`, i)));
        return;
      }
      r();
    }),
    e.onMount?.(i),
    t.showModal());
  let a = n ? { opacity: 0, y: 80 } : { opacity: 0, y: 18, scale: 0.97 };
  if (!n && e.from && e.from.isConnected) {
    let n = e.from.getBoundingClientRect(),
      r = t.getBoundingClientRect();
    a = {
      opacity: 0,
      scale: 0.6,
      x: n.left + n.width / 2 - (r.left + r.width / 2),
      y: n.top + n.height / 2 - (r.top + r.height / 2),
    };
  }
  (H.fromTo(t, a, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: W(0.5),
    ease: `back.out(1.4)`,
    clearProps: `transform`,
  }),
    matchMedia(`(pointer: fine)`).matches &&
      requestAnimationFrame(() => io(`input, select, textarea`, i)?.focus()));
}
function el(e) {
  $a() ||
    H.fromTo(
      e,
      { x: -6 },
      { x: 0, duration: 0.5, ease: `elastic.out(1, 0.3)`, clearProps: `transform` },
    );
}
function tl(e, t, n = `Confirm`, r = !0) {
  return new Promise((i) => {
    let a = !1;
    ($c({
      title: e,
      sub: t,
      fields: [],
      submit: n,
      danger: r,
      onSubmit: () => {
        a = !0;
      },
    }),
      G(`#modal`).addEventListener(`close`, () => i(a), { once: !0 }));
  });
}
function nl(e, { label: t = `Details`, onMount: n, onClose: r, wide: i = !1 } = {}) {
  let a = G(`#drawer`),
    o = Yc.matches,
    s = () => Zc(a, o ? { y: 60 } : { x: 40 }, r);
  return (
    Qc(a),
    (a.__close = s),
    a.classList.toggle(`is-wide`, i),
    a.setAttribute(`aria-label`, t),
    (a.innerHTML = `<div class="drawer__inner">${Ec(`close`, `Close`, `data-close`, `drawer__close`)}${e}</div>`),
    K(`[data-close]`, a).forEach((e) => e.addEventListener(`click`, s)),
    a.open || Xc(a, o ? { opacity: 0, y: 90 } : { opacity: 0, x: 60 }),
    n?.(G(`.drawer__inner`, a)),
    co(K(`.drawer__inner > *:not(.drawer__close)`, a), { y: 14, stagger: 0.05, delay: 0.08 }),
    { el: G(`.drawer__inner`, a), close: s }
  );
}
var rl = () => G(`#drawer`).__close?.();
function il() {
  let e = G(`.toast`),
    t =
      [`#modal`, `#finder`, `#drawer`]
        .map((e) => io(e))
        .find((e) => e?.open && !e.dataset.closing) ?? document.body;
  e.parentElement !== t && t.append(e);
}
var al = null;
function $(e, { undo: t, ico: n = `check` } = {}) {
  let r = G(`.toast`),
    i = G(`.toast__undo`, r);
  ((G(`.toast__ico`, r).innerHTML = Tc(n)),
    (G(`.toast__msg`, r).textContent = e),
    (al = t ?? null),
    (i.hidden = !t),
    il(),
    H.killTweensOf(r),
    H.timeline()
      .fromTo(
        r,
        { opacity: 0, y: 18, scale: 0.96, visibility: `visible` },
        { opacity: 1, y: 0, scale: 1, duration: W(0.45), ease: `back.out(1.8)` },
      )
      .to(
        r,
        {
          opacity: 0,
          y: 10,
          duration: W(0.3),
          ease: `power2.in`,
          onComplete: () => {
            ((al = null), (i.hidden = !0), H.set(r, { visibility: `hidden` }));
          },
        },
        t ? `+=5` : `+=2.6`,
      ));
}
function ol() {
  let e = G(`.toast`);
  G(`.toast__undo`, e).addEventListener(`click`, () => {
    let t = al;
    ((al = null),
      H.killTweensOf(e),
      H.to(e, {
        opacity: 0,
        y: 10,
        duration: W(0.25),
        onComplete: () => {
          H.set(e, { visibility: `hidden` });
        },
      }),
      t?.());
  });
}
var sl = null;
function cl(e, t) {
  if ((sl && sl !== e && ll(), e.classList.contains(`is-focus`))) {
    ll();
    return;
  }
  let n = [...e.children],
    r = document.createElement(`div`);
  r.className = `card-ph`;
  let i = getComputedStyle(e);
  (Object.assign(r.style, {
    gridArea: i.gridArea,
    gridColumn: i.gridColumn,
    gridRow: i.gridRow,
    height: `${e.offsetHeight}px`,
  }),
    e.before(r));
  let a = Za.getState(e);
  (e.classList.add(`is-focus`),
    document.documentElement.classList.add(`has-focus`),
    (sl = e),
    t?.setAttribute(`aria-label`, `Collapse`),
    H.set(n, { opacity: 0 }),
    H.to(G(`.scrim`), { autoAlpha: 1, duration: W(0.35) }),
    Za.from(a, {
      duration: W(0.6),
      ease: `power3.inOut`,
      scale: !0,
      onComplete: () => e.dispatchEvent(new CustomEvent(`card:resize`)),
    }),
    H.to(n, {
      opacity: 1,
      duration: W(0.35),
      delay: W(0.4),
      stagger: W(0.04),
      clearProps: `opacity`,
    }),
    e.dispatchEvent(new CustomEvent(`card:resize`)),
    (t ?? e).focus?.());
}
function ll() {
  let e = sl;
  if (!e) return;
  sl = null;
  let t = e.previousElementSibling,
    n = [...e.children];
  (H.to(G(`.scrim`), { autoAlpha: 0, duration: W(0.3) }),
    H.to(n, {
      opacity: 0,
      duration: W(0.14),
      onComplete: () => {
        let r = Za.getState(e);
        (e.classList.remove(`is-focus`),
          document.documentElement.classList.remove(`has-focus`),
          t?.classList.contains(`card-ph`) && t.remove(),
          io(`[data-expand]`, e)?.setAttribute(`aria-label`, `Expand`),
          e.dispatchEvent(new CustomEvent(`card:resize`)),
          Za.from(r, {
            duration: W(0.5),
            ease: `power3.inOut`,
            scale: !0,
            onComplete: () => H.set(e, { clearProps: `transform` }),
          }),
          H.to(n, { opacity: 1, duration: W(0.3), delay: W(0.3), clearProps: `opacity` }));
      },
    }));
}
var ul = () => sl;
function dl(e) {
  e.addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-expand]`);
    if (!n || !e.contains(n)) return;
    go(n);
    let r = n.closest(`.card`);
    r && cl(r, n);
  });
}
function fl(e, t) {
  let n = new Map();
  (K(`[data-key]`, e).forEach((e) => n.set(e.dataset.key, e.getBoundingClientRect())),
    t(),
    K(`[data-key]`, e).forEach((e, t) => {
      let r = n.get(e.dataset.key);
      if (!r) {
        H.fromTo(
          e,
          { opacity: 0, y: 12, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: W(0.45),
            delay: W(Math.min(t, 12) * 0.02),
            ease: `power3.out`,
            clearProps: `transform,opacity`,
          },
        );
        return;
      }
      let i = e.getBoundingClientRect(),
        a = r.left - i.left,
        o = r.top - i.top;
      (a || o) &&
        H.fromTo(
          e,
          { x: a, y: o },
          { x: 0, y: 0, duration: W(0.55), ease: `power3.inOut`, clearProps: `transform` },
        );
    }));
}
function pl(e, t) {
  H.to(e, { opacity: 0, scale: 0.94, y: -6, duration: W(0.25), ease: `power2.in`, onComplete: t });
}
async function ml(e, t = `Copied`) {
  try {
    (await navigator.clipboard.writeText(e), $(`${t} to clipboard`, { ico: `copy` }));
  } catch {
    $(`Couldn’t reach the clipboard — select and copy instead`, { ico: `copy` });
  }
}
function hl(e, t, n = `text/plain`) {
  let r = URL.createObjectURL(new Blob([t], { type: n })),
    i = Object.assign(document.createElement(`a`), { href: r, download: e });
  (document.body.append(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3));
}
function gl(e) {
  return e.map((e) =>
    e
      .map((e) => {
        let t = String(e);
        return /[",\n]/.test(t) ? `"${t.replace(/"/g, `""`)}"` : t;
      })
      .join(`,`),
  ).join(`
`);
}
var _l = (e, t, n, r = 0) =>
  `<span class="stepper">${Ec(`minus`, `Less ${n}`, `data-step="-1" data-for="${e}"`, `ibtn--sm`)}<input class="stepper__in num" name="${e}" type="number" inputmode="numeric" min="${r}" value="${t}" aria-label="${q(n)}" />${Ec(`plus`, `More ${n}`, `data-step="1" data-for="${e}"`, `ibtn--sm`)}</span>`;
function vl(e, t) {
  (e.addEventListener(`click`, (e) => {
    let n = e.target.closest(`[data-step]`);
    if (!n) return;
    let r = n.parentElement?.querySelector(`input`);
    r &&
      (go(n),
      (r.value = String(
        Math.max(Number(r.min || 0), (Number(r.value) || 0) + Number(n.dataset.step)),
      )),
      t?.(r));
  }),
    e.addEventListener(`input`, (e) => {
      let n = e.target;
      n.matches(`.stepper__in`) && t?.(n);
    }));
}
var yl = matchMedia(`(prefers-color-scheme: dark)`),
  bl = {},
  xl = () => {
    if (Co) return bl.theme ?? `light`;
    try {
      return JSON.parse(localStorage.getItem(`Vels:theme`) ?? `"light"`) || `light`;
    } catch {
      return `light`;
    }
  },
  Sl = (e = xl()) => (e === `system` ? (yl.matches ? `dark` : `light`) : e),
  Cl = new Set(),
  wl = (e) => Cl.add(e);
function Tl(e, t) {
  let n = () => {
    if (((bl.theme = e), !Co))
      try {
        localStorage.setItem(`Vels:theme`, JSON.stringify(e));
      } catch {}
    Ul();
  };
  if (Sl(e) === document.documentElement.dataset.theme) {
    n();
    return;
  }
  El(t, n);
}
function El(e, t) {
  let n = document;
  if (!e || !n.startViewTransition || $a()) {
    t();
    return;
  }
  let r = e.getBoundingClientRect(),
    i = r.left + r.width / 2,
    a = r.top + r.height / 2,
    o = Math.hypot(Math.max(i, innerWidth - i), Math.max(a, innerHeight - a));
  n.startViewTransition(t)
    .ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${i}px ${a}px)`, `circle(${o}px at ${i}px ${a}px)`] },
        {
          duration: 620,
          easing: `cubic-bezier(.65,0,.35,1)`,
          pseudoElement: `::view-transition-new(root)`,
        },
      );
    })
    .catch(() => {});
}
var Dl = [
    { id: `copper`, name: `Copper`, light: `#b9531f`, dark: `#ffa77a` },
    { id: `pine`, name: `Pine`, light: `#1f8a5c`, dark: `#6fd6a1` },
    { id: `cobalt`, name: `Cobalt`, light: `#3b5bdb`, dark: `#9bb1ff` },
    { id: `ocean`, name: `Ocean`, light: `#1f7f99`, dark: `#7fd0e6` },
    { id: `graphite`, name: `Graphite`, light: `#50505c`, dark: `#c9c9d3` },
  ],
  Ol = (e) => (e && (e.startsWith(`#`) || Dl.some((t) => t.id === e)) ? e : `copper`),
  kl = () => {
    if (Co) return Ol(bl.accent);
    try {
      return Ol(localStorage.getItem(`Vels:accent`));
    } catch {
      return `copper`;
    }
  },
  Al = (e) => {
    if (((bl.accent = e), !Co))
      try {
        localStorage.setItem(`Vels:accent`, e);
      } catch {}
  },
  jl = (e) => {
    let t = parseInt(e.replace(`#`, ``), 16);
    return [(t >> 16) & 255, (t >> 8) & 255, t & 255];
  },
  Ml = (e, t, n) =>
    [e, t, n]
      .map((e) => {
        let t = e / 255;
        return t <= 0.03928 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4;
      })
      .reduce((e, t, n) => e + t * [0.2126, 0.7152, 0.0722][n], 0),
  Nl = (e, t) => (Math.max(e, t) + 0.05) / (Math.min(e, t) + 0.05);
function Pl(e, t, n) {
  let r = (t) => (t + e / 30) % 12,
    i = t * Math.min(n, 1 - n),
    a = (e) => n - i * Math.max(-1, Math.min(r(e) - 3, Math.min(9 - r(e), 1)));
  return [a(0), a(8), a(4)].map((e) => Math.round(e * 255));
}
function Fl(e) {
  let [t, n, r] = jl(e).map((e) => e / 255),
    i = Math.max(t, n, r),
    a = Math.min(t, n, r),
    o = (i + a) / 2,
    s = i - a,
    c = s === 0 ? 0 : s / (1 - Math.abs(2 * o - 1));
  return {
    h:
      ((s === 0
        ? 0
        : i === t
          ? 60 * (((n - r) / s) % 6)
          : i === n
            ? 60 * ((r - t) / s + 2)
            : 60 * ((t - n) / s + 4)) +
        360) %
      360,
    s: c,
    l: o,
  };
}
var Il = ([e, t, n]) => `rgb(${e} ${t} ${n})`;
function Ll(e, t) {
  let { h: n, s: r } = Fl(e),
    i = Math.min(0.85, Math.max(0.12, r)),
    a = Ml(...jl(t === `dark` ? `#171d1a` : `#fcfdfc`)),
    o = t === `dark` ? 0.7 : 0.42;
  for (let e = 0; e < 40 && Nl(Ml(...Pl(n, i, o)), a) < 5.5; e++) o += t === `dark` ? 0.01 : -0.01;
  let s = Pl(n, i, o),
    c = t === `dark` ? s : Pl(n, i, Math.min(0.55, o + 0.08)),
    l = t === `dark` ? Pl(n, Math.min(0.7, i), 0.1) : Pl(n, Math.min(0.5, i), 0.98);
  return { "--primary": Il(s), "--pine": Il(c), "--on-primary": Il(l) };
}
function Rl() {
  let e = kl(),
    t = document.documentElement;
  ([`--primary`, `--pine`, `--on-primary`].forEach((e) => t.style.removeProperty(e)),
    e.startsWith(`#`)
      ? ((t.dataset.accent = `custom`),
        Object.entries(Ll(e, Sl())).forEach(([e, n]) => t.style.setProperty(e, n)))
      : e === `copper`
        ? delete t.dataset.accent
        : (t.dataset.accent = e));
}
function zl(e, t) {
  e !== kl() &&
    El(t, () => {
      (Al(e), Rl(), Cl.forEach((e) => e()));
    });
}
function Bl() {
  let e = kl(),
    t = e.startsWith(`#`);
  return `<div class="accents" role="radiogroup" aria-label="Accent colour">${Dl.map((t) => `<button type="button" class="accent-sw" role="radio" aria-checked="${e === t.id}" data-accent="${t.id}" style="--sw:${Sl() === `dark` ? t.dark : t.light}" aria-label="${t.name}" title="${t.name}">${Tc(`check`)}</button>`).join(``)}
    <label class="accent-sw accent-sw--custom" role="radio" aria-checked="${t}" title="Custom colour" ${t ? `style="--sw:${e}"` : ``}>${Tc(`check`)}<input type="color" value="${t ? e : `#2f9bea`}" aria-label="Custom accent colour" /></label></div>`;
}
function Vl() {
  let e = kl();
  return e.startsWith(`#`)
    ? `Custom ${e.toUpperCase()}`
    : (Dl.find((t) => t.id === e)?.name ?? `Pine`);
}
function Hl(e, t) {
  let n = () => {
    let n = kl();
    (e.querySelectorAll(`.accent-sw`).forEach((e) => {
      let t = e.dataset.accent ? e.dataset.accent === n : n.startsWith(`#`);
      (e.setAttribute(`aria-checked`, String(t)),
        !e.dataset.accent && n.startsWith(`#`) && e.style.setProperty(`--sw`, n),
        e.dataset.accent &&
          e.style.setProperty(
            `--sw`,
            (Sl() === `dark`
              ? Dl.find((t) => t.id === e.dataset.accent)?.dark
              : Dl.find((t) => t.id === e.dataset.accent)?.light) ?? ``,
          ));
    }),
      t?.());
  };
  e.addEventListener(`click`, (e) => {
    let t = e.target.closest(`.accent-sw[data-accent]`);
    t &&
      (go(t),
      zl(t.dataset.accent, t),
      n(),
      $a() ||
        H.fromTo(
          t,
          { scale: 0.8 },
          { scale: 1, duration: 0.5, ease: `back.out(3)`, clearProps: `transform` },
        ));
  });
  let r = e.querySelector(`.accent-sw--custom input`);
  (r?.addEventListener(`input`, () => {
    (Al(r.value), Rl(), n());
  }),
    r?.addEventListener(`change`, () => {
      (Cl.forEach((e) => e()), n());
    }),
    wl(n));
}
function Ul() {
  let e = Sl();
  ((document.documentElement.dataset.theme = e),
    Rl(),
    io(`meta[name="theme-color"]`)?.setAttribute(`content`, e === `dark` ? `#0f1412` : `#eef0ec`),
    Cl.forEach((e) => e()));
}
yl.addEventListener(`change`, () => {
  xl() === `system` && Ul();
});
function Wl(e) {
  let t = e.map((e) => [
    e,
    structuredClone(e === `history` ? { months: X.months, weeks: X.weeks } : X[e]),
  ]);
  return () => {
    (t.forEach(([e, t]) => {
      if (e === `history`) {
        let e = t;
        ((X.months = e.months), (X.weeks = e.weeks));
      } else X[e] = t;
    }),
      Z(...e));
  };
}
function Gl(e, t, n, r, i, a) {
  let o = Math.round(n * a * 100) / 100;
  (X.moves.unshift({
    id: Xo(`mv`),
    at: Date.now(),
    itemId: e,
    locId: t,
    qty: n,
    kind: r,
    ref: i,
    byId: Qo,
    value: o,
  }),
    X.moves.length > 600 && (X.moves.length = 600),
    r !== `transfer` && Kl(o));
}
function Kl(e) {
  [X.months[X.months.length - 1], X.weeks[X.weeks.length - 1]].forEach((t) => {
    t &&
      (e > 0 ? (t.stockIn = Math.round(t.stockIn + e)) : (t.stockOut = Math.round(t.stockOut - e)),
      (t.value = Math.round(Us())));
  });
}
function ql(e, t, n, r = `Manual adjustment`) {
  let i = Q(e);
  if (!i || !n) return 0;
  let a = i.stock[t] ?? 0,
    o = Math.max(0, a + n),
    s = o - a;
  if (!s) return 0;
  let c = Wl([`products`, `moves`, `activity`, `history`]);
  return (
    (i.stock[t] = o),
    Gl(i.id, t, s, `adjust`, r, i.cost),
    _s(
      `stock`,
      `Stock adjusted`,
      `${s > 0 ? `+` : `−`}${Math.abs(s)} ${ks(i)} · ${bs(t)?.name ?? ``}`,
      `/products/item/${i.id}`,
    ),
    Z(`products`, `moves`, `activity`, `history`),
    $(`${s > 0 ? `Added` : `Removed`} ${Math.abs(s)} × ${ks(i)}`, { ico: `box`, undo: c }),
    s
  );
}
function Jl(e, t) {
  let n = Q(e);
  n &&
    $c({
      title: `Adjust stock`,
      sub: `${ks(n)} · counted, broken, sampled or found`,
      from: t,
      submit: `Save adjustment`,
      fields: [
        {
          name: `loc`,
          label: `Location`,
          type: `select`,
          value: `dc`,
          options: X.locations.map((e) => [e.id, `${e.name} (${As(n, e.id)} on hand)`]),
        },
        {
          name: `delta`,
          label: `Change (units)`,
          type: `number`,
          value: -1,
          required: !0,
          hint: `Negative takes stock out`,
        },
        {
          name: `reason`,
          label: `Reason`,
          type: `select`,
          wide: !0,
          value: `Damaged`,
          options: [
            `Damaged`,
            `Samples for events`,
            `Found in stock`,
            `Count correction`,
            `Gifted to press`,
          ].map((e) => [e, e]),
        },
      ],
      onSubmit: (e) => {
        let t = Math.round(Number(e.delta));
        if (!t) return `Enter a change other than zero.`;
        if ((n.stock[e.loc] ?? 0) + t < 0) return `Only ${n.stock[e.loc] ?? 0} on hand there.`;
        ql(n.id, e.loc, t, e.reason);
      },
    });
}
var Yl = 0,
  Xl = () => ((Yl = Math.max(Yl, ...X.orders.map((e) => Number(e.number.slice(3)) || 0)) + 1), Yl);
function Zl(e, t, n = !1) {
  let r = ws(e);
  if (!r || r.status === `cancelled` || r.status === `delivered`) return;
  let i = t ?? ko[ko.indexOf(r.status) + 1];
  if (!i || i === r.status) return;
  let a = ko.indexOf(r.status),
    o = ko.indexOf(i),
    s = Wl([`orders`, `products`, `batches`, `moves`, `activity`, `history`]);
  if (a < 3 && o >= 3) {
    let e = r.lines.find((e) => (Q(e.productId)?.stock[r.locId] ?? 0) < e.qty);
    if (e) {
      let t = Q(e.productId);
      return `Only ${t.stock[r.locId] ?? 0} × ${ks(t)} at ${bs(r.locId)?.name}. Transfer stock in or release a batch first.`;
    }
    (r.lines.forEach((e) => {
      let t = Q(e.productId);
      ((t.stock[r.locId] = (t.stock[r.locId] ?? 0) - e.qty),
        Ql(t.id, e.qty),
        Gl(t.id, r.locId, -e.qty, `sale`, r.number, t.cost));
    }),
      (r.tracking =
        r.channel === `studio`
          ? void 0
          : `1Z${Math.random().toString(36).slice(2, 10).toUpperCase()}`));
  } else
    a >= 3 &&
      o < 3 &&
      (r.lines.forEach((e) => {
        let t = Q(e.productId);
        ((t.stock[r.locId] = (t.stock[r.locId] ?? 0) + e.qty),
          Gl(t.id, r.locId, e.qty, `return`, r.number, t.cost));
      }),
      (r.tracking = void 0));
  ((r.status = i), r.history.push({ at: Date.now(), to: i, by: Qo }));
  let c = Cs(r.customerId);
  (_s(
    i === `shipped` ? `ship` : `order`,
    i === `shipped`
      ? `Shipment dispatched`
      : `Order ${i === `delivered` ? `delivered` : `moved to ${i}`}`,
    `${r.number} · ${c?.name ?? ``}`,
    `/orders/all/${r.id}`,
  ),
    Z(`orders`, `products`, `batches`, `moves`, `activity`, `history`),
    n ||
      $(`${r.number} → ${i[0].toUpperCase()}${i.slice(1)}`, {
        ico: i === `shipped` ? `truck` : `check`,
        undo: s,
      }));
}
function Ql(e, t) {
  let n = t;
  X.batches
    .filter((t) => t.productId === e && t.status === `released` && t.left > 0)
    .sort((e, t) => e.expiresAt - t.expiresAt)
    .forEach((e) => {
      let t = Math.min(e.left, n);
      ((e.left -= t), (n -= t));
    });
}
function $l(e) {
  let t = ws(e);
  if (!t || ko.indexOf(t.status) >= 3 || t.status === `cancelled`) return;
  let n = Wl([`orders`, `activity`]);
  ((t.status = `cancelled`),
    t.history.push({ at: Date.now(), to: `cancelled`, by: Qo }),
    _s(
      `order`,
      `Order cancelled`,
      `${t.number} · ${Cs(t.customerId)?.name ?? ``}`,
      `/orders/all/${t.id}`,
    ),
    Z(`orders`, `activity`),
    $(`${t.number} cancelled — its stock is free again`, { ico: `close`, undo: n }));
}
function eu(e) {
  let t = ws(e);
  !t ||
    t.paid ||
    ((t.paid = !0),
    _s(`order`, `Payment received`, `${t.number} · ${pc(Gs(t))}`, `/orders/all/${t.id}`),
    Z(`orders`, `activity`),
    $(`${t.number} marked paid`, { ico: `dollar` }));
}
function tu(e = {}, t, n) {
  let r = [
    [``, `—`],
    ...X.products.filter((e) => e.active).map((e) => [e.id, `${ks(e)} · ${Ms(e, `dc`)} free`]),
  ];
  $c({
    title: `New sales order`,
    sub: `Wholesale, online or a studio sale. Stock is reserved as soon as it is saved.`,
    from: t,
    submit: `Create order`,
    fields: [
      {
        name: `customer`,
        label: `Customer`,
        type: `select`,
        wide: !0,
        required: !0,
        value: e.customerId ?? ``,
        options: [
          [``, `Choose a customer…`],
          ...X.customers.map((e) => [
            e.id,
            `${e.name}${e.kind === `stockist` ? ` · stockist` : ``}`,
          ]),
        ],
      },
      {
        name: `channel`,
        label: `Channel`,
        type: `select`,
        value: e.customerId && Cs(e.customerId)?.kind === `stockist` ? `wholesale` : `online`,
        options: Object.keys(jo).map((e) => [e, jo[e]]),
      },
      {
        name: `loc`,
        label: `Ship from`,
        type: `select`,
        value: `dc`,
        options: X.locations.filter((e) => e.kind !== `lab`).map((e) => [e.id, e.name]),
      },
      {
        name: `p1`,
        label: `Product`,
        type: `select`,
        required: !0,
        value: e.productId ?? ``,
        options: r,
      },
      { name: `q1`, label: `Quantity`, type: `number`, value: 1, min: 1 },
      { name: `p2`, label: `Second product (optional)`, type: `select`, value: ``, options: r },
      { name: `q2`, label: `Quantity`, type: `number`, value: 1, min: 1 },
    ],
    onSubmit: (e) => {
      let t = Cs(e.customer ?? ``);
      if (!t) return `Choose a customer.`;
      let r = e.channel,
        i = [
          [e.p1, e.q1],
          [e.p2, e.q2],
        ]
          .filter(([e, t]) => e && Number(t) > 0)
          .map(([e, t]) => {
            let n = Q(e);
            return {
              productId: n.id,
              qty: Math.round(Number(t)),
              price: r === `wholesale` ? n.wholesale : n.price,
            };
          });
      if (!i.length) return `Add at least one product.`;
      if (i.length === 2 && i[0].productId === i[1].productId)
        return `The same product is on two lines — combine them.`;
      let a = Xl(),
        o = {
          id: `so-${a}`,
          number: `SO-${a}`,
          customerId: t.id,
          channel: r,
          status: `new`,
          createdAt: Date.now(),
          shipBy: Eo() + (r === `wholesale` ? 3 : 1) * J + 16 * Y,
          locId: r === `studio` ? `shop` : e.loc,
          lines: i,
          carrier:
            r === `studio`
              ? `Collected in shop`
              : r === `wholesale`
                ? `UPS Ground`
                : `USPS Priority`,
          paid: r !== `wholesale`,
          history: [{ at: Date.now(), to: `new`, by: Qo }],
        };
      (X.orders.unshift(o),
        _s(
          `order`,
          `Order created`,
          `${o.number} · ${t.name} · ${pc(Gs(o))}`,
          `/orders/all/${o.id}`,
        ),
        Z(`orders`, `activity`),
        $(`${o.number} created for ${t.name}`, {
          ico: `orders`,
          undo: () => {
            ((X.orders = X.orders.filter((e) => e.id !== o.id)), Z(`orders`));
          },
        }),
        n?.(o));
    },
  });
}
function nu(e, t) {
  let n = X.returns.find((t) => t.id === e);
  if (!n) return;
  let r = Wl([`returns`, `products`, `moves`, `activity`, `history`]),
    i = Q(n.productId);
  (t === `restocked` &&
    i &&
    ((i.stock.dc = (i.stock.dc ?? 0) + n.qty), Gl(i.id, `dc`, n.qty, `return`, n.number, i.cost)),
    (n.status = t),
    _s(
      `return`,
      `Return ${t}`,
      `${n.number} · ${n.qty} × ${i ? ks(i) : ``}${t === `refunded` ? ` · ${pc(n.refund)} back` : ``}`,
      `/orders/returns`,
    ),
    Z(`returns`, `products`, `moves`, `activity`, `history`),
    $(`${n.number} ${t}`, {
      ico: t === `refunded` ? `dollar` : t === `restocked` ? `box` : `return`,
      undo: r,
    }));
}
var ru = 0,
  iu = () => ((ru = Math.max(ru, ...X.pos.map((e) => Number(e.number.slice(3)) || 0)) + 1), ru);
function au(e = {}, t) {
  let n = e.materialId ? xs(e.materialId) : void 0;
  $c({
    title: `New purchase order`,
    sub: `Saved as a draft. Send it when it’s right.`,
    from: t,
    submit: `Save draft`,
    fields: [
      {
        name: `material`,
        label: `Material`,
        type: `select`,
        wide: !0,
        required: !0,
        value: n?.id ?? ``,
        options: [
          [``, `Choose a material…`],
          ...X.materials
            .filter((t) => !e.supplierId || t.supplierId === e.supplierId)
            .map((e) => [e.id, `${e.name} · ${cc(e.onHand)} ${e.unit} on hand`]),
        ],
      },
      { name: `qty`, label: `Quantity`, type: `number`, value: n?.reorderQty ?? 1, min: 1 },
      { name: `note`, label: `Note to supplier`, placeholder: `Optional` },
    ],
    onSubmit: (e) => {
      let t = xs(e.material ?? ``);
      if (!t) return `Choose a material.`;
      let n = Number(e.qty);
      if (!(n > 0)) return `Quantity must be more than zero.`;
      let r = Ss(t.supplierId),
        i = iu(),
        a = {
          id: `po-${i}`,
          number: `PO-${i}`,
          supplierId: r.id,
          status: `draft`,
          createdAt: Date.now(),
          eta: Eo() + r.leadDays * J,
          lines: [{ materialId: t.id, qty: n, received: 0, cost: t.cost }],
          note: e.note ?? ``,
        };
      (X.pos.unshift(a),
        _s(
          `po`,
          `Purchase order drafted`,
          `${a.number} · ${cc(n)} ${t.unit} ${t.name}`,
          `/purchasing/orders`,
        ),
        Z(`pos`, `activity`),
        $(`${a.number} drafted for ${r.name}`, { ico: `receipt` }));
    },
  });
}
function ou(e) {
  let t = Es(e);
  if (!t || t.status !== `draft`) return;
  let n = Ss(t.supplierId);
  ((t.status = `sent`),
    (t.sentAt = Date.now()),
    (t.eta = Eo() + n.leadDays * J),
    _s(
      `po`,
      `Purchase order sent`,
      `${t.number} · ${n.name} · ${mc(t.lines.reduce((e, t) => e + t.qty * t.cost, 0))}`,
      `/purchasing/orders`,
    ),
    Z(`pos`, `activity`),
    $(`${t.number} sent to ${n.contact}`, { ico: `send` }));
}
function su(e, t = !1) {
  let n = Es(e);
  if (!n || (n.status !== `sent` && n.status !== `partial`)) return;
  let r = Wl([`pos`, `materials`, `moves`, `activity`, `history`, `notices`]),
    i = 0;
  (n.lines.forEach((e) => {
    let r = e.qty - e.received,
      a = t ? Math.ceil(r / 2) : r;
    ((e.received += a), (i += a));
    let o = xs(e.materialId);
    o &&
      a &&
      ((o.onHand = Math.round((o.onHand + a) * 100) / 100),
      Gl(o.id, o.locId, a, `receipt`, n.number, e.cost));
  }),
    (n.status = n.lines.every((e) => e.received >= e.qty) ? `received` : `partial`),
    n.status === `received` && (n.receivedAt = Date.now()),
    _s(
      `po`,
      n.status === `received` ? `Purchase order received` : `Part delivery received`,
      `${n.number} · ${Ss(n.supplierId)?.name ?? ``}`,
      `/purchasing/orders`,
    ),
    vs(
      `po`,
      `${n.number} ${n.status === `received` ? `received in full` : `part received`}`,
      `/purchasing/orders`,
    ),
    Z(`pos`, `materials`, `moves`, `activity`, `history`, `notices`),
    $(
      `${n.number} ${n.status === `received` ? `received` : `part received`} — ${cc(i)} units on the shelf`,
      { ico: `truck`, undo: r },
    ));
}
function cu(e) {
  let t = Es(e);
  if (!t || t.status === `received` || t.status === `cancelled`) return;
  let n = Wl([`pos`, `activity`]);
  ((t.status = `cancelled`),
    _s(`po`, `Purchase order cancelled`, t.number, `/purchasing/orders`),
    Z(`pos`, `activity`),
    $(`${t.number} cancelled`, { ico: `close`, undo: n }));
}
function lu() {
  let e = new Set(
      X.pos.filter((e) => e.status === `draft`).flatMap((e) => e.lines.map((e) => e.materialId)),
    ),
    t = X.materials.filter((t) => Ls(t) && zs(t.id) === 0 && !e.has(t.id)),
    n = new Map();
  t.forEach((e) => n.set(e.supplierId, [...(n.get(e.supplierId) ?? []), e]));
  let r = [];
  return (
    n.forEach((e, t) => {
      let n = Ss(t),
        i = iu(),
        a = {
          id: `po-${i}`,
          number: `PO-${i}`,
          supplierId: t,
          status: `draft`,
          createdAt: Date.now(),
          eta: Eo() + n.leadDays * J,
          lines: e.map((e) => ({ materialId: e.id, qty: e.reorderQty, received: 0, cost: e.cost })),
          note: `Drafted from low stock.`,
        };
      (X.pos.unshift(a), r.push(a));
    }),
    r.length &&
      (_s(
        `po`,
        `Reorder drafted`,
        `${Cc(r.length, `purchase order`)} from low stock`,
        `/purchasing/orders`,
      ),
      Z(`pos`, `activity`)),
    r
  );
}
var uu = 0,
  du = () => {
    uu = Math.max(uu, ...X.batches.map((e) => Number(e.lot.split(`-`)[1]) || 0)) + 1;
    let e = new Date(Date.now());
    return `L${e.getFullYear() % 100}${String(e.getMonth() + 1).padStart(2, `0`)}-${String(uu).padStart(3, `0`)}`;
  };
function fu(e, t) {
  return (Q(e)?.bom ?? []).map((e) => {
    let n = xs(e.materialId),
      r = Math.round(e.per * t * 1e3) / 1e3;
    return { m: n, need: r, ok: n.onHand >= r };
  });
}
function pu(e, t) {
  let n = Q(e);
  if (!n) return `Pick a product.`;
  if (!(t > 0)) return `Enter how many units to make.`;
  let r = fu(n.id, t),
    i = r.find((e) => !e.ok);
  if (i) return `Not enough ${i.m.name}: need ${i.need} ${i.m.unit}, have ${i.m.onHand}.`;
  r.forEach((e) => {
    ((e.m.onHand = Math.round((e.m.onHand - e.need) * 1e3) / 1e3),
      X.moves.unshift({
        id: Xo(`mv`),
        at: Date.now(),
        itemId: e.m.id,
        locId: `lab`,
        qty: -e.need,
        kind: `production`,
        ref: `Batch run`,
        byId: Qo,
        value: 0,
      }));
  });
  let a = {
    id: Xo(`b`),
    lot: du(),
    productId: n.id,
    madeAt: Date.now(),
    expiresAt: Date.now() + n.shelfMonths * 30.4 * J,
    qty: t,
    left: t,
    locId: `dc`,
    status: `quarantine`,
    chemistId: `m-zhao`,
  };
  return (
    X.batches.unshift(a),
    _s(`batch`, `Batch made`, `${a.lot} · ${t} × ${ks(n)} into QA`, `/products/batches`),
    Z(`batches`, `materials`, `moves`, `activity`),
    a
  );
}
function mu(e, t, n) {
  let r = e ? Q(e) : void 0;
  $c({
    title: `Make a batch`,
    sub: `Materials come off the lab shelves now; the units join stock when QA releases the lot.`,
    from: t,
    submit: `Start batch`,
    fields: [
      {
        name: `product`,
        label: `Product`,
        type: `select`,
        wide: !0,
        required: !0,
        value: r?.id ?? ``,
        options: [[``, `Choose a product…`], ...X.products.map((e) => [e.id, ks(e)])],
      },
      {
        name: `qty`,
        label: `Units`,
        type: `number`,
        value: r?.reorderQty ?? 300,
        min: 1,
        step: 10,
      },
    ],
    extra: `<div class="field field--wide bom-prev" data-bom></div>`,
    onMount: (e) => {
      let t = () => {
        let t = e.elements.namedItem(`product`).value,
          n = Number(e.elements.namedItem(`qty`).value),
          r = e.querySelector(`[data-bom]`);
        r.innerHTML =
          t && n > 0
            ? `<span class="field__label">Uses</span><ul class="bom">${fu(t, n)
                .map(
                  (e) =>
                    `<li class="${e.ok ? `` : `is-short`}"><span>${q(e.m.name)}</span><b class="num">${e.need} ${e.m.unit}</b><small>${e.ok ? `${cc(e.m.onHand)} on hand` : `not enough`}</small></li>`,
                )
                .join(``)}</ul>`
            : ``;
      };
      (e.addEventListener(`input`, t), e.addEventListener(`change`, t), t());
    },
    onSubmit: (e) => {
      let t = pu(e.product ?? ``, Math.round(Number(e.qty)));
      if (typeof t == `string`) return t;
      ($(`${t.lot} started — ${t.qty} units waiting on QA`, { ico: `flask` }), n?.(t));
    },
  });
}
function hu(e) {
  let t = Ts(e);
  if (!t || t.status === `released` || t.status === `expired`) return;
  let n = Q(t.productId),
    r = Wl([`batches`, `products`, `moves`, `activity`, `history`, `notices`]);
  ((t.status = `released`),
    (t.note = void 0),
    (n.stock[t.locId] = (n.stock[t.locId] ?? 0) + t.left),
    Gl(n.id, t.locId, t.left, `production`, t.lot, n.cost),
    _s(
      `batch`,
      `Batch released`,
      `${t.lot} · ${t.left} × ${ks(n)} into ${bs(t.locId)?.name ?? ``}`,
      `/products/batches`,
      `m-sato`,
    ),
    vs(`stock`, `${ks(n)} is back in stock — ${t.left} units released`, `/products/item/${n.id}`),
    Z(`batches`, `products`, `moves`, `activity`, `history`, `notices`),
    $(`${t.lot} released — +${t.left} ${ks(n)}`, { ico: `shield`, undo: r }));
}
function gu(e, t) {
  let n = Ts(e);
  if (!n || n.status === `expired`) return;
  let r = Q(n.productId),
    i = Wl([`batches`, `products`, `activity`]);
  (n.status === `released` && (r.stock[n.locId] = Math.max(0, (r.stock[n.locId] ?? 0) - n.left)),
    (n.status = `hold`),
    (n.note = t),
    _s(`batch`, `Batch on hold`, `${n.lot} · ${ks(r)} · ${t}`, `/products/batches`),
    Z(`batches`, `products`, `activity`),
    $(`${n.lot} on hold — its units are off sale`, { ico: `pause`, undo: i }));
}
var _u = 0,
  vu = () => (
    (_u = Math.max(_u, ...X.transfers.map((e) => Number(e.number.slice(3)) || 0)) + 1),
    _u
  );
function yu(e = {}, t) {
  let n = [[``, `—`], ...X.products.map((e) => [e.id, ks(e)])];
  $c({
    title: `Move stock`,
    sub: `Plan it now; the units leave when it’s dispatched and land when it’s received.`,
    from: t,
    submit: `Plan transfer`,
    fields: [
      {
        name: `from`,
        label: `From`,
        type: `select`,
        value: e.from ?? `dc`,
        options: X.locations.map((e) => [e.id, e.name]),
      },
      {
        name: `to`,
        label: `To`,
        type: `select`,
        value: e.to ?? `shop`,
        options: X.locations.map((e) => [e.id, e.name]),
      },
      {
        name: `p1`,
        label: `Product`,
        type: `select`,
        required: !0,
        value: e.productId ?? ``,
        options: n,
      },
      { name: `q1`, label: `Units`, type: `number`, value: 12, min: 1 },
      { name: `p2`, label: `Second product (optional)`, type: `select`, value: ``, options: n },
      { name: `q2`, label: `Units`, type: `number`, value: 12, min: 1 },
    ],
    onSubmit: (e) => {
      if (e.from === e.to) return `Pick two different locations.`;
      let t = [
        [e.p1, e.q1],
        [e.p2, e.q2],
      ]
        .filter(([e, t]) => e && Number(t) > 0)
        .map(([e, t]) => ({ productId: e, qty: Math.round(Number(t)) }));
      if (!t.length) return `Add a product.`;
      let n = t.find((t) => (Q(t.productId)?.stock[e.from] ?? 0) < t.qty);
      if (n) {
        let t = Q(n.productId);
        return `${bs(e.from)?.name} has only ${t.stock[e.from] ?? 0} × ${ks(t)}.`;
      }
      let r = vu(),
        i = {
          id: `tr-${r}`,
          number: `TR-${r}`,
          from: e.from,
          to: e.to,
          lines: t,
          status: `planned`,
          createdAt: Date.now(),
          eta: Eo() + J + 11 * Y,
          byId: Qo,
        };
      (X.transfers.unshift(i),
        _s(
          `transfer`,
          `Transfer planned`,
          `${i.number} · ${t.reduce((e, t) => e + t.qty, 0)} units to ${bs(i.to)?.name}`,
          `/warehouses/transfers`,
        ),
        Z(`transfers`, `activity`),
        $(`${i.number} planned`, { ico: `swap` }));
    },
  });
}
function bu(e) {
  let t = X.transfers.find((t) => t.id === e);
  if (!t || t.status === `received`) return;
  let n = Wl([`transfers`, `products`, `moves`, `activity`]);
  if (t.status === `planned`) {
    let e = t.lines.find((e) => (Q(e.productId)?.stock[t.from] ?? 0) < e.qty);
    if (e) return `Not enough ${ks(Q(e.productId))} at ${bs(t.from)?.name}.`;
    (t.lines.forEach((e) => {
      let n = Q(e.productId);
      ((n.stock[t.from] = (n.stock[t.from] ?? 0) - e.qty),
        Gl(n.id, t.from, -e.qty, `transfer`, t.number, n.cost));
    }),
      (t.status = `in-transit`),
      _s(
        `transfer`,
        `Transfer dispatched`,
        `${t.number} · to ${bs(t.to)?.name}`,
        `/warehouses/transfers`,
      ));
  } else
    (t.lines.forEach((e) => {
      let n = Q(e.productId);
      ((n.stock[t.to] = (n.stock[t.to] ?? 0) + e.qty),
        Gl(n.id, t.to, e.qty, `transfer`, t.number, n.cost));
    }),
      (t.status = `received`),
      (t.receivedAt = Date.now()),
      _s(
        `transfer`,
        `Transfer received`,
        `${t.number} · into ${bs(t.to)?.name}`,
        `/warehouses/transfers`,
      ));
  (Z(`transfers`, `products`, `moves`, `activity`),
    $(`${t.number} ${t.status === `received` ? `received` : `on its way`}`, {
      ico: `swap`,
      undo: n,
    }));
}
var xu = 0,
  Su = () => ((xu = Math.max(xu, ...X.counts.map((e) => Number(e.number.slice(3)) || 0)) + 1), xu);
function Cu(e) {
  $c({
    title: `Schedule a count`,
    sub: `Every product with stock in that place goes on the count sheet.`,
    from: e,
    submit: `Schedule`,
    fields: [
      {
        name: `loc`,
        label: `Location`,
        type: `select`,
        value: `dc`,
        options: X.locations.map((e) => [e.id, e.name]),
      },
      {
        name: `by`,
        label: `Counter`,
        type: `select`,
        value: `m-asante`,
        options: X.team.filter((e) => e.status !== `invited`).map((e) => [e.id, e.name]),
      },
      {
        name: `when`,
        label: `Day`,
        type: `date`,
        value: new Date(Eo() + J).toISOString().slice(0, 10),
        wide: !0,
      },
    ],
    onSubmit: (e) => {
      let t = X.products.filter((t) => (t.stock[e.loc] ?? 0) > 0);
      if (!t.length) return `Nothing is stocked there.`;
      let n = Su(),
        [r, i, a] = (e.when ?? ``).split(`-`).map(Number),
        o = {
          id: `ct-${n}`,
          number: `CC-${String(n).padStart(3, `0`)}`,
          locId: e.loc,
          zone: bs(e.loc)?.zones[0]?.id ?? `A`,
          status: `scheduled`,
          at: r ? new Date(r, i - 1, a, 8).getTime() : Eo() + J + 8 * Y,
          byId: e.by,
          lines: t.map((t) => ({ productId: t.id, expected: t.stock[e.loc] ?? 0, counted: null })),
        };
      (X.counts.unshift(o),
        _s(
          `count`,
          `Count scheduled`,
          `${o.number} · ${bs(o.locId)?.name} · ${Cc(o.lines.length, `line`)}`,
          `/warehouses/counts`,
        ),
        Z(`counts`, `activity`),
        $(`${o.number} scheduled for ${_c(o.at)}`, { ico: `clipCheck` }));
    },
  });
}
function wu(e) {
  let t = X.counts.find((t) => t.id === e);
  !t ||
    t.status !== `scheduled` ||
    ((t.status = `counting`),
    t.lines.forEach((e) => {
      e.expected = Q(e.productId)?.stock[t.locId] ?? 0;
    }),
    Z(`counts`));
}
function Tu(e, t, n) {
  let r = X.counts.find((t) => t.id === e),
    i = r?.lines.find((e) => e.productId === t);
  !r || !i || ((i.counted = n === null ? null : Math.max(0, Math.round(n))), Z(`counts`));
}
function Eu(e) {
  let t = X.counts.find((t) => t.id === e);
  if (!t || t.status !== `counting`) return;
  if (t.lines.some((e) => e.counted === null)) return `Count every line first.`;
  let n = Wl([`counts`, `products`, `moves`, `activity`, `history`]),
    r = 0;
  (t.lines.forEach((e) => {
    let n = Q(e.productId),
      i = (e.counted ?? e.expected) - e.expected;
    i &&
      ((r += Math.abs(i)),
      (n.stock[t.locId] = Math.max(0, (n.stock[t.locId] ?? 0) + i)),
      Gl(n.id, t.locId, i, `count`, t.number, n.cost));
  }),
    (t.status = `done`),
    (t.at = Date.now()),
    _s(
      `count`,
      `Cycle count closed`,
      `${t.number} · ${r ? `${r} units corrected` : `no variance`}`,
      `/warehouses/counts`,
    ),
    Z(`counts`, `products`, `moves`, `activity`, `history`),
    $(
      r
        ? `${t.number} closed — stock corrected by ${r} units`
        : `${t.number} closed — every shelf matched`,
      { ico: `clipCheck`, undo: n },
    ));
}
function Du(e, t) {
  $c({
    title: `New customer`,
    sub: `A stockist that buys wholesale, or a shopper.`,
    from: e,
    submit: `Add customer`,
    fields: [
      {
        name: `kind`,
        label: `Type`,
        type: `select`,
        value: `stockist`,
        options: [
          [`stockist`, `Stockist (wholesale)`],
          [`shopper`, `Shopper`],
        ],
      },
      {
        name: `name`,
        label: `Business or full name`,
        required: !0,
        placeholder: `Wren & Willow Apothecary`,
      },
      { name: `contact`, label: `Contact person`, placeholder: `For stockists` },
      { name: `email`, label: `Email`, type: `email`, required: !0 },
      { name: `phone`, label: `Phone`, type: `tel` },
      { name: `city`, label: `City`, required: !0 },
      { name: `region`, label: `State`, placeholder: `NC` },
    ],
    onSubmit: (e) => {
      if (!/^\S+@\S+\.\S+$/.test(e.email ?? ``)) return `That email doesn’t look right.`;
      if (X.customers.some((t) => t.email.toLowerCase() === e.email.toLowerCase()))
        return `A customer with that email already exists.`;
      let n = {
        id: Xo(`c-`),
        name: e.name,
        kind: e.kind === `shopper` ? `shopper` : `stockist`,
        contact: e.contact || e.name,
        email: e.email,
        phone: e.phone ?? ``,
        city: e.city,
        region: (e.region ?? ``).toUpperCase(),
        since: Date.now(),
        tags: [`new`],
        note: ``,
      };
      (X.customers.unshift(n),
        _s(
          `note`,
          `Customer added`,
          n.name,
          `/customers/${n.kind === `stockist` ? `stockists` : `shoppers`}/${n.id}`,
        ),
        Z(`customers`, `activity`),
        $(`${n.name} added`, { ico: `userPlus` }),
        t?.(n));
    },
  });
}
function Ou(e) {
  $c({
    title: `Invite a teammate`,
    sub: `They get an email with a link to set a password.`,
    from: e,
    submit: `Send invite`,
    fields: [
      { name: `name`, label: `Full name`, required: !0 },
      {
        name: `email`,
        label: `Work email`,
        type: `email`,
        required: !0,
        placeholder: `name@marlowfern.co`,
      },
      { name: `title`, label: `Job title`, placeholder: `Picker & packer` },
      {
        name: `role`,
        label: `Role`,
        type: `select`,
        value: `staff`,
        options: [`admin`, `manager`, `staff`, `viewer`].map((e) => [
          e,
          e[0].toUpperCase() + e.slice(1),
        ]),
      },
      {
        name: `loc`,
        label: `Works at`,
        type: `select`,
        wide: !0,
        value: `dc`,
        options: X.locations.map((e) => [e.id, e.name]),
      },
    ],
    onSubmit: (e) => {
      if (!/^\S+@\S+\.\S+$/.test(e.email ?? ``)) return `That email doesn’t look right.`;
      if (X.team.some((t) => t.email.toLowerCase() === e.email.toLowerCase()))
        return `Someone with that email is already on the team.`;
      if (X.team.filter((e) => e.status !== `invited`).length >= X.settings.billing.seats)
        return `All ${X.settings.billing.seats} seats are taken — add seats in Billing.`;
      let t = [`pine`, `ochre`, `teal`, `sky`, `rose`, `sage`, `ocean`],
        n = {
          id: Xo(`m-`),
          name: e.name,
          title: e.title || `Teammate`,
          team: `Operations`,
          role: e.role,
          email: e.email,
          phone: ``,
          locId: e.loc,
          tone: t[X.team.length % t.length],
          status: `invited`,
          since: Date.now(),
        };
      (X.team.push(n),
        _s(`team`, `Teammate invited`, `${n.name} as ${e.role}`, `/settings/team`),
        Z(`team`, `activity`),
        $(`Invite sent to ${n.email}`, { ico: `send` }));
    },
  });
}
function ku(e, t) {
  let n = ys(e);
  !n ||
    n.role === t ||
    (n.role !== `owner` &&
      ((n.role = t),
      _s(`team`, `Role changed`, `${n.name} is now ${t}`, `/settings/team`),
      Z(`team`, `activity`),
      $(`${n.name} is now ${t[0].toUpperCase()}${t.slice(1)}`, { ico: `shield` })));
}
async function Au(e) {
  let t = ys(e);
  if (
    !t ||
    t.id === `m-okafor` ||
    !(await tl(
      `Remove ${t.name}?`,
      `They lose access straight away. Their history stays.`,
      `Remove`,
    ))
  )
    return;
  let n = Wl([`team`, `activity`]);
  ((X.team = X.team.filter((t) => t.id !== e)),
    _s(`team`, `Teammate removed`, t.name, `/settings/team`),
    Z(`team`, `activity`),
    $(`${t.name} removed`, { ico: `user`, undo: n }));
}
function ju(e) {
  ((X.settings.goal = Math.max(1e3, Math.round(e))), Z(`settings`));
}
function Mu(e, t, n) {
  let r = 209 + X.tickets.length;
  return (
    X.tickets.unshift({
      id: Xo(`t`),
      number: `HLP-${r}`,
      subject: e,
      body: t,
      topic: n,
      status: `open`,
      at: Date.now(),
    }),
    Z(`tickets`),
    `HLP-${r}`
  );
}
var Nu = () => new Date(Date.now()).toISOString().slice(0, 10);
function Pu() {
  (hl(
    `Vels-stock-${Nu()}.csv`,
    gl([
      [
        `SKU`,
        `Product`,
        `Size`,
        `Category`,
        ...X.locations.map((e) => e.name),
        `Reserved`,
        `Available`,
        `Reorder at`,
        `Unit cost`,
        `Price`,
        `Low`,
      ],
      ...X.products.map((e) => [
        e.sku,
        e.name,
        e.size,
        e.category,
        ...X.locations.map((t) => e.stock[t.id] ?? 0),
        As(e) - Ms(e),
        Ms(e),
        e.reorderAt,
        e.cost,
        e.price,
        Ns(e) ? `yes` : ``,
      ]),
    ]),
    `text/csv`,
  ),
    $(`Stock exported as CSV`, { ico: `download` }));
}
function Fu() {
  (hl(
    `Vels-orders-${Nu()}.csv`,
    gl([
      [`Order`, `Date`, `Customer`, `Channel`, `Status`, `Units`, `Total`, `Paid`],
      ...X.orders.map((e) => [
        e.number,
        new Date(e.createdAt).toISOString().slice(0, 10),
        Cs(e.customerId)?.name ?? ``,
        jo[e.channel],
        e.status,
        e.lines.reduce((e, t) => e + t.qty, 0),
        Gs(e).toFixed(2),
        e.paid ? `yes` : `no`,
      ]),
    ]),
    `text/csv`,
  ),
    $(`Orders exported as CSV`, { ico: `download` }));
}
function Iu() {
  (hl(
    `Vels-movements-${Nu()}.csv`,
    gl([
      [`When`, `Item`, `Location`, `Qty`, `Kind`, `Reference`, `Value`],
      ...X.moves.map((e) => [
        new Date(e.at).toISOString(),
        Q(e.itemId)?.sku ?? xs(e.itemId)?.code ?? e.itemId,
        bs(e.locId)?.name ?? ``,
        e.qty,
        e.kind,
        e.ref,
        e.value,
      ]),
    ]),
    `text/csv`,
  ),
    $(`Stock movements exported as CSV`, { ico: `download` }));
}
var Lu = `modulepreload`,
  Ru = function (e) {
    return `/Vels/` + e;
  },
  zu = {},
  Bu = function (e, t, n) {
    let r = Promise.resolve();
    if (t && t.length > 0) {
      let e = document.getElementsByTagName(`link`),
        i = document.querySelector(`meta[property=csp-nonce]`),
        a = i?.nonce || i?.getAttribute(`nonce`);
      function o(e) {
        return Promise.all(
          e.map((e) =>
            Promise.resolve(e).then(
              (e) => ({ status: `fulfilled`, value: e }),
              (e) => ({ status: `rejected`, reason: e }),
            ),
          ),
        );
      }
      r = o(
        t.map((t) => {
          if (((t = Ru(t, n)), t in zu)) return;
          zu[t] = !0;
          let r = t.endsWith(`.css`),
            i = r ? `[rel="stylesheet"]` : ``;
          if (n)
            for (let n = e.length - 1; n >= 0; n--) {
              let i = e[n];
              if (i.href === t && (!r || i.rel === `stylesheet`)) return;
            }
          else if (document.querySelector(`link[href="${t}"]${i}`)) return;
          let o = document.createElement(`link`);
          if (
            ((o.rel = r ? `stylesheet` : Lu),
            r || (o.as = `script`),
            (o.crossOrigin = ``),
            (o.href = t),
            a && o.setAttribute(`nonce`, a),
            document.head.appendChild(o),
            r)
          )
            return new Promise((e, n) => {
              (o.addEventListener(`load`, e),
                o.addEventListener(`error`, () => n(Error(`Unable to preload CSS for ${t}`))));
            });
        }),
      );
    }
    function i(e) {
      let t = new Event(`vite:preloadError`, { cancelable: !0 });
      if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented)) throw e;
    }
    return r.then((t) => {
      for (let e of t || []) e.status === `rejected` && i(e.reason);
      return e().catch(i);
    });
  },
  Vu = {
    dashboard: {
      label: `Dashboard`,
      icon: `grid`,
      subs: [
        [`overview`, `Overview`],
        [`activity`, `Activity`],
        [`alerts`, `Alerts`],
      ],
    },
    products: {
      label: `Products`,
      icon: `box`,
      subs: [
        [`catalog`, `Catalog`],
        [`batches`, `Batches`],
      ],
    },
    orders: {
      label: `Orders`,
      icon: `orders`,
      subs: [
        [`all`, `All orders`],
        [`board`, `Board`],
        [`returns`, `Returns`],
      ],
    },
    purchasing: {
      label: `Purchasing`,
      icon: `cart`,
      subs: [
        [`orders`, `Purchase orders`],
        [`suppliers`, `Suppliers`],
        [`materials`, `Materials`],
      ],
    },
    warehouses: {
      label: `Warehouses`,
      icon: `warehouse`,
      subs: [
        [`locations`, `Locations`],
        [`transfers`, `Transfers`],
        [`counts`, `Counts`],
      ],
    },
    analytics: {
      label: `Analytics`,
      icon: `chart`,
      subs: [
        [`overview`, `Overview`],
        [`sales`, `Sales`],
        [`stock`, `Stock health`],
      ],
    },
    customers: {
      label: `Customers`,
      icon: `users`,
      subs: [
        [`stockists`, `Stockists`],
        [`shoppers`, `Shoppers`],
      ],
    },
    settings: {
      label: `Settings`,
      icon: `gear`,
      subs: [
        [`account`, `Account`],
        [`company`, `Company`],
        [`team`, `Team & roles`],
        [`billing`, `Billing`],
        [`notifications`, `Notifications`],
      ],
    },
    help: {
      label: `Help`,
      icon: `help`,
      subs: [
        [`center`, `Help center`],
        [`tickets`, `My tickets`],
      ],
    },
    login: {
      label: `Login`,
      icon: `help`,
      subs: [
        [``, `Sign in`],
      ],
    },
  },
  Hu = Object.keys(Vu),
  Uu = [`purchasing`, `analytics`, `customers`, `settings`, `help`],
  Wu = {
    dashboard: () => import(`./features/dashboard/dashboard.ts`),
    products: () => import(`./features/products/products.ts`),
    orders: () => import(`./features/orders/orders.ts`),
    purchasing: () => import(`./features/purchasing/purchasing.ts`),
    warehouses: () => import(`./features/warehouses/warehouses.ts`),
    analytics: () => import(`./features/analytics/analytics.ts`),
    customers: () => import(`./features/customers/customers.ts`),
    settings: () => import(`./features/settings/settings.ts`),
    help: () => import(`./features/help/help.ts`),
    login: () => import(`./features/login/login.ts`),
  };
function Gu(e) {
  let [t, ...n] = e.replace(/^#?\/?/, ``).split(`/`).filter(Boolean).map(decodeURIComponent);
  if (t === `login`) return { name: `login`, params: [] };
  if (!Hu.includes(t)) return { name: `dashboard`, params: [`overview`] };
  let r = Vu[t],
    i = r.subs.some(([e]) => e === n[0]) || (t === `products` && n[0] === `item`);
  return { name: t, params: i ? n : [r.subs[0][0], ...n.slice(n[0] && !i ? 1 : 0)] };
}
var Ku = document.documentElement,
  qu = G(`.nav__track`),
  Ju = G(`.nav__pill`, qu);
Ju.innerHTML = K(`.nav__item`, qu)
  .map((e) => {
    let t = e.cloneNode(!0);
    return (
      [`href`, `id`, `aria-label`, `aria-haspopup`, `aria-expanded`].forEach((e) =>
        t.removeAttribute(e),
      ),
      t.querySelectorAll(`[data-count]`).forEach((e) => {
        (e.setAttribute(`data-pill-count`, e.getAttribute(`data-count`) ?? ``),
          e.removeAttribute(`data-count`));
      }),
      t.outerHTML.replace(/^<(a|button)\b/, `<span`).replace(/<\/(a|button)>$/, `</span>`)
    );
  })
  .join(``);
var Yu = matchMedia(`(max-width: 760px)`),
  Xu = () =>
    io(`.nav__track > .nav__item[aria-current="page"]`, qu) ??
    (Yu.matches && Uu.includes(Gu(location.pathname).name) ? G(`.nav__more`, qu) : null),
  Zu = (e) => {
    let t = Xu();
    Hc(
      Ju,
      qu,
      t && t.offsetWidth ? t : null,
      e,
      (t && parseFloat(getComputedStyle(t).borderTopLeftRadius)) || 14,
    );
  };
function Qu(e, t = !0) {
  (K(`a[data-route]`).forEach((t) =>
    t.dataset.route === e
      ? t.setAttribute(`aria-current`, `page`)
      : t.removeAttribute(`aria-current`),
  ),
    Zu(t));
}
(new ResizeObserver(() => Zu(!1)).observe(qu), document.fonts?.ready.then(() => Zu(!1)));
var $u = Object.assign(document.createElement(`span`), { className: `rail-tip` });
($u.setAttribute(`aria-hidden`, `true`),
  document.body.append($u),
  K(`.rail .nav__item`).forEach((e) => {
    (e.addEventListener(`pointerenter`, () => {
      if (Ku.classList.contains(`side-open`) || Yu.matches || !matchMedia(`(hover: hover)`).matches)
        return;
      let t = e.getBoundingClientRect();
      (($u.textContent = e.querySelector(`span`)?.textContent ?? ``),
        H.killTweensOf($u),
        H.fromTo(
          $u,
          { autoAlpha: 0, x: t.right + 4, y: t.top + t.height / 2, yPercent: -50 },
          { autoAlpha: 1, x: t.right + 12, duration: W(0.25), ease: `power3.out` },
        ));
    }),
      e.addEventListener(`pointerleave`, () => H.to($u, { autoAlpha: 0, duration: W(0.12) })));
  }));
{
  let e = 0,
    t = !1,
    n = (e) => {
      e !== t &&
        ((t = e),
        H.to(`.top`, {
          yPercent: e ? -135 : 0,
          duration: W(e ? 0.3 : 0.4),
          ease: e ? `power2.in` : `power3.out`,
          overwrite: `auto`,
        }));
    };
  (addEventListener(
    `scroll`,
    () => {
      let t = scrollY,
        r = t - e;
      if (((e = t), !Yu.matches || t < 90 || document.querySelector(`dialog[open]`))) {
        n(!1);
        return;
      }
      r > 8 ? n(!0) : r < -8 && n(!1);
    },
    { passive: !0 },
  ),
    Yu.addEventListener(`change`, () => n(!1)));
}
var ed = G(`#tabs`),
  td = null;
function nd(e, t, n) {
  if (e === `login`) {
    if (ed) ed.innerHTML = ``;
    return;
  }
  let r = Vu[e],
    i = e === `products` && t === `item` ? `catalog` : t;
  (td !== e &&
    ((td = e),
    (ed.innerHTML = `<span class="tabs__pill" aria-hidden="true"></span>${r.subs.map(([t, n], i) => `<a class="tab" href="/${e}/${t}" data-sub="${t}">${i === 0 ? `<span class="tab__sec">${q(r.label)}</span>` : ``}<span>${q(n)}</span></a>`).join(``)}`),
    n && co(K(`.tab`, ed), { y: -8, stagger: 0.05 })),
    K(`.tab`, ed).forEach((e) =>
      e.dataset.sub === i
        ? e.setAttribute(`aria-current`, `page`)
        : e.removeAttribute(`aria-current`),
    ));
  let a = io(`.tab[aria-current="page"]`, ed);
  if (
    (Hc(G(`.tabs__pill`, ed), ed, a, n),
    ed.classList.toggle(`is-scroll`, ed.scrollWidth > ed.clientWidth + 1),
    a && ed.scrollWidth > ed.clientWidth)
  ) {
    let e = a.offsetLeft - (ed.clientWidth - a.offsetWidth) / 2;
    ed.scrollTo({ left: Math.max(0, e), behavior: $a() || !n ? `auto` : `smooth` });
  }
}
new ResizeObserver(() => {
  let e = io(`.tab[aria-current="page"]`, ed),
    t = io(`.tabs__pill`, ed);
  t && Hc(t, ed, e, !1);
}).observe(ed);
var rd = new Map(),
  id = null,
  ad,
  od = 0;
async function sd(e = !1) {
  if (location.hash && location.hash.startsWith('#/')) {
    let clean = location.hash.slice(1);
    history.replaceState(null, '', clean);
  }
  let t = location.pathname;
  let isSignedOut = !1;
  try {
    isSignedOut = localStorage.getItem(`Vels:signedout`) === `1`;
  } catch {}
  if (isSignedOut && !t.startsWith(`/login`)) {
    history.replaceState(null, ``, `/login`);
    t = `/login`;
  } else if (!isSignedOut && (t === `/login` || t === `/login/`)) {
    history.replaceState(null, ``, `/dashboard/overview`);
    t = `/dashboard/overview`;
  }
  let { name: n, params: r } = Gu(t),
    i = n === `login` ? `/login` : `/${n}/${r.map(encodeURIComponent).join(`/`)}`;
  t !== i && history.replaceState(null, ``, i);
  let a = ++od;
  (Kc(), ul() && ll());
  let o = G(`[data-view="${n}"]`);
  if (id?.name === n) {
    let e = id,
      t = ad !== r[0];
    ((ad = r[0]),
      nd(n, r[0] ?? ``, !0),
      cd(e.page, r),
      t && !$a()
        ? H.to(o, {
            opacity: 0,
            y: -6,
            duration: 0.14,
            ease: `power2.in`,
            overwrite: !0,
            onComplete: () => {
              if (a !== od) {
                H.set(o, { clearProps: `opacity,transform` });
                return;
              }
              (H.set(o, { y: 0 }),
                e.page.enter({ params: r, first: !1, same: !0 }),
                H.to(o, {
                  opacity: 1,
                  duration: 0.24,
                  ease: `power2.out`,
                  clearProps: `opacity,transform`,
                }));
            },
          })
        : e.page.enter({ params: r, first: !1, same: !0 }));
    return;
  }
  let s = rd.get(n);
  if (!s) {
    try {
      s = (await Wu[n]()).page;
    } catch (e) {
      (console.error(e),
        $(`${Vu[n].label} couldn’t load. Check your connection and try again.`, { ico: `alert` }));
      return;
    }
    if (a !== od) return;
    (s.mount(o), rd.set(n, s));
  }
  if (a !== od) return;
  let c = o.dataset.entered !== `1`,
    l = id;
  ((id = { name: n, page: s }),
    (ad = r[0]),
    l?.page.leave?.(),
    Qu(n, !e),
    nd(n, r[0] ?? ``, !e),
    cd(s, r),
    (Ku.dataset.route = n));
  let u = () => {
      (K(`.view`).forEach((e) => {
        e.hidden = e !== o;
      }),
        e ||
          H.fromTo(
            o,
            { opacity: 0 },
            { opacity: 1, duration: W(0.26), ease: `power2.out`, clearProps: `opacity` },
          ),
        window.scrollTo({ top: 0 }),
        s.enter({ params: r, first: c, same: !1 }),
        (o.dataset.entered = `1`),
        e || io(`.head__title`, o)?.focus({ preventScroll: !0 }));
    },
    d = l ? G(`[data-view="${l.name}"]`) : null;
  d && d !== o && !$a()
    ? H.to(d, {
        opacity: 0,
        y: -8,
        duration: 0.18,
        ease: `power2.in`,
        onComplete: () => {
          (H.set(d, { clearProps: `opacity,transform` }), a === od && u());
        },
      })
    : u();
}
function cd(e, t) {
  let n = typeof e.title == `function` ? e.title(t) : e.title;
  document.title = `${n} · Vels Agro`;
}
function navigateTo(url) {
  let path = (url || '').replace(/^#/, '');
  if (!path.startsWith('/')) path = '/' + path;
  if (location.pathname !== path) {
    history.pushState(null, '', path);
  }
  sd();
}
window.navigateTo = navigateTo;
(window as any).setTheme = Tl;
window.addEventListener(`popstate`, () => sd());
window.addEventListener(`hashchange`, () => {
  if (location.hash && location.hash.startsWith('#/')) {
    navigateTo(location.hash.slice(1));
  }
});
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  let a = e.target.closest('a');
  if (!a) return;
  let href = a.getAttribute('href');
  if (!href) return;
  if (href.startsWith('#') && !href.startsWith('#/')) return;
  if (a.target === '_blank' || a.hasAttribute('download') || a.getAttribute('rel') === 'external') return;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return;
  e.preventDefault();
  navigateTo(href);
});
var ld = G(`#finder`),
  ud = G(`#finder-q`),
  dd = G(`#finder-list`),
  fd = [],
  pd = 0;
function md(e) {
  let t = e.trim().toLowerCase(),
    n = (...e) => e.join(` `).toLowerCase().includes(t),
    r = [];
  return (
    Hu.flatMap((e) =>
      Vu[e].subs.map(([t, n]) => ({ r: e, sub: t, l: n, full: `${Vu[e].label} › ${n}` })),
    )
      .filter((e) => !t || n(e.full))
      .slice(0, t ? 6 : 4)
      .forEach((e) =>
        r.push({
          group: `Pages`,
          label: e.full,
          meta: `Go to page`,
          href: `/${e.r}/${e.sub}`,
          lead: `<span class="lead">${Tc(Vu[e.r].icon)}</span>`,
        }),
      ),
    X.products
      .filter((e) => !t || n(e.name, e.size, e.sku, e.barcode, e.line))
      .slice(0, t ? 6 : 3)
      .forEach((e) =>
        r.push({
          group: `Products`,
          label: ks(e),
          meta: `${e.sku} · ${Object.values(e.stock).reduce((e, t) => e + t, 0)} on hand`,
          href: `/products/item/${e.id}`,
          lead: `<span class="lead lead--img">${Mc(e, `sm`)}</span>`,
        }),
      ),
    t &&
      (X.orders
        .filter((e) => n(e.number, Cs(e.customerId)?.name ?? ``, e.tracking ?? ``))
        .slice(0, 5)
        .forEach((e) =>
          r.push({
            group: `Orders`,
            label: `${e.number} · ${Cs(e.customerId)?.name ?? ``}`,
            meta: `${Oo[e.status].name} · ${jo[e.channel]} · ${pc(Gs(e))}`,
            href: `/orders/all/${e.id}`,
            lead: `<span class="lead">${Tc(`orders`)}</span>`,
          }),
        ),
      X.batches
        .filter((e) => n(e.lot))
        .slice(0, 4)
        .forEach((e) => {
          let t = Q(e.productId);
          r.push({
            group: `Batches`,
            label: `${e.lot} · ${t ? ks(t) : ``}`,
            meta: `${e.left} left`,
            href: `/products/batches/${e.id}`,
            lead: `<span class="lead">${Tc(`flask`)}</span>`,
          });
        }),
      X.customers
        .filter((e) => n(e.name, e.contact, e.email, e.city))
        .slice(0, 5)
        .forEach((e) =>
          r.push({
            group: `Customers`,
            label: e.name,
            meta: `${e.kind === `stockist` ? `Stockist` : `Shopper`} · ${e.city}, ${e.region}`,
            href: `/customers/${e.kind === `stockist` ? `stockists` : `shoppers`}/${e.id}`,
            lead: Oc(e.id, `md`),
          }),
        ),
      X.suppliers
        .filter((e) => n(e.name, e.contact, e.supplies))
        .slice(0, 3)
        .forEach((e) =>
          r.push({
            group: `Suppliers`,
            label: e.name,
            meta: e.supplies,
            href: `/purchasing/suppliers/${e.id}`,
            lead: `<span class="lead">${Tc(`truck`)}</span>`,
          }),
        ),
      X.materials
        .filter((e) => n(e.name, e.code))
        .slice(0, 3)
        .forEach((e) =>
          r.push({
            group: `Materials`,
            label: e.name,
            meta: `${e.code} · ${e.onHand} ${e.unit} · ${Ss(e.supplierId)?.name ?? ``}`,
            href: `/purchasing/materials/${e.id}`,
            lead: `<span class="lead">${Tc(`drop`)}</span>`,
          }),
        ),
      X.pos
        .filter((e) => n(e.number, Ss(e.supplierId)?.name ?? ``))
        .slice(0, 3)
        .forEach((e) =>
          r.push({
            group: `Purchase orders`,
            label: `${e.number} · ${Ss(e.supplierId)?.name ?? ``}`,
            meta: e.lines.map((e) => xs(e.materialId)?.name).join(`, `),
            href: `/purchasing/orders/${e.id}`,
            lead: `<span class="lead">${Tc(`receipt`)}</span>`,
          }),
        )),
    r
  );
}
function hd() {
  let e = ud.value;
  ((fd = md(e)), (pd = Math.min(pd, Math.max(0, fd.length - 1))));
  let t = ``;
  ((dd.innerHTML = fd.length
    ? fd
        .map((n, r) => {
          let i =
            n.group === t ? `` : `<li class="finder__group" role="presentation">${n.group}</li>`;
          return (
            (t = n.group),
            `${i}<li class="finder__opt" role="option" id="fo-${r}" aria-selected="${r === pd}" data-i="${r}">${n.lead}<span><b>${Fc(n.label, e)}</b><small>${q(n.meta)}</small></span><span class="go">${Tc(`chevR`)}</span></li>`
          );
        })
        .join(``)
    : `<li class="empty" role="presentation">${Tc(`search`)}<p class="empty__title">Nothing matches “${q(e)}”</p><p class="empty__text">Try a product, a SKU, a lot number, an order, a customer or a supplier.</p></li>`),
    ud.setAttribute(`aria-activedescendant`, fd.length ? `fo-${pd}` : ``));
}
function gd() {
  ld.open ||
    (Kc(),
    (ud.value = ``),
    (pd = 0),
    hd(),
    ld.showModal(),
    H.fromTo(
      ld,
      { opacity: 0, y: -14, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: W(0.38),
        ease: `back.out(1.6)`,
        clearProps: `transform`,
      },
    ),
    co(K(`.finder__opt`, dd), { y: 8, stagger: 0.025 }),
    ud.focus());
}
function _d() {
  ((ld.dataset.closing = `1`),
    H.to(ld, {
      opacity: 0,
      y: -8,
      duration: W(0.2),
      ease: `power2.in`,
      onComplete: () => {
        (delete ld.dataset.closing, ld.close(), H.set(ld, { clearProps: `all` }));
      },
    }));
}
function vd(e) {
  let t = fd[e];
  t && (_d(), navigateTo(t.href));
}
(ud.addEventListener(`input`, () => {
  ((pd = 0), hd());
}),
  ud.addEventListener(`keydown`, (e) => {
    e.key === `ArrowDown` || e.key === `ArrowUp`
      ? (e.preventDefault(),
        (pd = (pd + (e.key === `ArrowDown` ? 1 : -1) + fd.length) % Math.max(1, fd.length)),
        hd(),
        io(`#fo-${pd}`, dd)?.scrollIntoView({ block: `nearest` }))
      : e.key === `Enter` && (e.preventDefault(), vd(pd));
  }),
  dd.addEventListener(`click`, (e) => {
    let t = e.target.closest(`.finder__opt`);
    t && vd(Number(t.dataset.i));
  }),
  dd.addEventListener(`pointermove`, (e) => {
    let t = e.target.closest(`.finder__opt`);
    t &&
      Number(t.dataset.i) !== pd &&
      ((pd = Number(t.dataset.i)),
      K(`.finder__opt`, dd).forEach((e) => e.setAttribute(`aria-selected`, String(e === t))),
      ud.setAttribute(`aria-activedescendant`, t.id));
  }),
  ld.addEventListener(`cancel`, (e) => {
    (e.preventDefault(), _d());
  }),
  ld.addEventListener(`click`, (e) => {
    e.target === ld && _d();
  }),
  G(`#btn-find`).addEventListener(`click`, (e) => {
    (go(e.currentTarget), gd());
  }));
var yd = {
    stock: [`box`, `rose`],
    expiry: [`calX`, `ochre`],
    order: [`orders`, `sky`],
    po: [`truck`, `teal`],
    return: [`return`, `ocean`],
  },
  bd = -1;
function xd() {
  let e = tc(),
    t = G(`#bell-badge`);
  ((t.hidden = e === 0),
    (t.textContent = e ? String(e) : ``),
    bd >= 0 && e > bd && uo(t, { from: 0.2 }),
    (bd = e),
    G(`#btn-bell`).setAttribute(`aria-label`, e ? `Notifications, ${e} unread` : `Notifications`));
  let n = { products: Fs().length, orders: ec().length },
    r = { products: `low on stock`, orders: `orders to ship` };
  Object.entries(n).forEach(([e, t]) => {
    (K(`[data-count="${e}"], [data-pill-count="${e}"]`).forEach((e) => {
      e.textContent = t ? String(t) : ``;
    }),
      G(`.nav__track > a[data-route="${e}"]`).setAttribute(
        `aria-label`,
        t ? `${Vu[e].label}, ${t} ${r[e]}` : Vu[e].label,
      ));
  });
}
([`notices`, `products`, `orders`].forEach((e) => ms(e, xd)),
  G(`#btn-bell`).addEventListener(`click`, (e) => {
    let t = e.currentTarget;
    go(t);
    let n = qc(
      t,
      `<div class="pop__head"><span class="pop__title">Notifications</span><button type="button" class="btn btn--xs btn--ghost" data-all ${tc() ? `` : `disabled`}>Mark all read</button></div>
    <div class="pop__list">${
      X.notices
        .map((e) => {
          let [t, n] = yd[e.kind] ?? [`bell`, `pine`];
          return `<a class="pop__row${e.read ? `` : ` is-unread`}" href="${e.href}" data-id="${e.id}">${Nc(t, n, `sm`)}<span><b>${q(e.text)}</b><small>${xc(e.at)}</small></span></a>`;
        })
        .join(``) || `<p class="empty">You’re all caught up.</p>`
    }</div>
    <a class="pop__foot" href="/dashboard/alerts">See every alert ${Tc(`chevR`)}</a>`,
      { label: `Notifications`, cls: `pop--wide` },
    );
    n &&
      (co(K(`.pop__row`, n.el), { y: 8, stagger: 0.04 }),
      n.el.addEventListener(`click`, (e) => {
        let t = e.target;
        if (t.closest(`[data-all]`)) {
          (X.notices.forEach((e) => (e.read = !0)),
            Z(`notices`),
            K(`.pop__row`, n.el).forEach((e) => e.classList.remove(`is-unread`)),
            (t.closest(`[data-all]`).disabled = !0));
          return;
        }
        let r = t.closest(`.pop__row`);
        if (r) {
          let e = X.notices.find((e) => e.id === r.dataset.id);
          (e && ((e.read = !0), Z(`notices`)), n.close());
        }
        t.closest(`.pop__foot`) && n.close();
      }));
  }));
function Sd(e) {
  Jc(e, [
    {
      label: `Sales order`,
      icon: `orders`,
      onSelect: () => {
        let t = Gu(location.pathname);
        tu(
          t.name === `customers` && t.params[1]
            ? { customerId: t.params[1] }
            : t.name === `products` && t.params[0] === `item`
              ? { productId: t.params[1] }
              : {},
          e,
          (e) => {
            navigateTo(`/orders/all/${e.id}`);
          },
        );
      },
    },
    { label: `Purchase order`, icon: `cart`, onSelect: () => au({}, e) },
    {
      label: `Make a batch`,
      icon: `flask`,
      onSelect: () =>
        mu(void 0, e, () => {
          navigateTo(`/products/batches`);
        }),
    },
    { label: `Move stock`, icon: `swap`, onSelect: () => yu({}, e) },
    { label: `Schedule a count`, icon: `clipCheck`, onSelect: () => Cu(e) },
    `-`,
    { label: `Customer`, icon: `userPlus`, onSelect: () => Du(e) },
    { label: `Invite a teammate`, icon: `users`, onSelect: () => Ou(e) },
    `-`,
    {
      label: `Reorder low materials`,
      icon: `truck`,
      onSelect: () => {
        let e = lu();
        ($(
          e.length
            ? `Drafted ${e.length} purchase order${e.length === 1 ? `` : `s`}`
            : `Everything low is already on order`,
          { ico: `truck` },
        ),
          e.length && navigateTo('/purchasing/orders'));
      },
    },
  ]);
}
(G(`#btn-new`).addEventListener(`click`, (e) => {
  let t = e.currentTarget;
  (go(t), Sd(t));
}),
  G(`.nav__more`).addEventListener(`click`, (e) => {
    let t = e.currentTarget;
    (go(t),
      Jc(
        t,
        Uu.map((e) => ({
          label: Vu[e].label,
          icon: Vu[e].icon,
          checked: Gu(location.pathname).name === e ? !0 : void 0,
          onSelect: () => {
            navigateTo(`/${e}/${Vu[e].subs[0][0]}`);
          },
        })),
        { align: `end` },
      ));
  }));
var Cd = G(`.theme-sw`);
function wd(e = !0) {
  let t = Sl() === `dark`;
  K(`.theme-sw__btn`, Cd).forEach((e) =>
    e.setAttribute(`aria-pressed`, String((e.dataset.themeTo === `dark`) === t)),
  );
  let n = G(`.theme-sw__btn[aria-pressed="true"]`, Cd);
  Hc(G(`.theme-sw__knob`, Cd), Cd, n, e);
}
(wl(() => wd()),
  K(`.theme-sw__btn`, Cd).forEach((e) =>
    e.addEventListener(`click`, () => {
      (go(e),
        Tl(e.dataset.themeTo, e),
        $a() ||
          H.fromTo(
            G(`svg`, e),
            { rotation: -90 },
            { rotation: 0, duration: 0.6, ease: `back.out(2)` },
          ));
    }),
  ),
  new ResizeObserver(() => wd(!1)).observe(Cd));
var Td = G(`#btn-side`);
function Ed() {
  let e = Ku.classList.contains(`side-open`);
  (Td.setAttribute(`aria-pressed`, String(e)),
    Td.setAttribute(`aria-label`, e ? `Collapse sidebar` : `Expand sidebar`),
    (Td.title = `${e ? `Collapse` : `Expand`} sidebar ( [ )`));
}
function Dd() {
  if (Yu.matches) return;
  let e = () => {
      Ku.classList.toggle(`side-open`);
      try {
        localStorage.setItem(`Vels:side`, Ku.classList.contains(`side-open`) ? `1` : `0`);
      } catch {}
      (Ed(), Zu(!1), wd(!1), H.set($u, { autoAlpha: 0 }));
    },
    t = document;
  if (!t.startViewTransition || $a()) {
    e();
    return;
  }
  (Ku.classList.add(`vt-side`),
    t.startViewTransition(e).finished.finally(() => Ku.classList.remove(`vt-side`)));
}
Td.addEventListener(`click`, () => {
  (go(Td), Dd());
});
function Od() {
  let e = new Date(Date.now()).getHours();
  return e < 12 ? `Good morning` : e < 18 ? `Good afternoon` : `Good evening`;
}
function kd() {
  let e = X.settings.me;
  G(`#btn-me`).innerHTML =
    `${Oc(Qo, `md`)}<span class="me__txt"><small>${Od()}</small><b>${q(e.name)}</b></span>${Tc(`down`, `me__chev`)}`;
}
(ms(`settings`, kd),
  ms(`team`, kd),
  G(`#btn-me`).addEventListener(`click`, (e) => {
    let t = xl(),
      n = e.currentTarget;
    Jc(
      n,
      [
        {
          label: `Account settings`,
          icon: `user`,
          onSelect: () => {
            navigateTo(`/settings/account`);
          },
        },
        { label: `Keyboard shortcuts`, icon: `command`, onSelect: jd },
        { label: `Export stock (CSV)`, icon: `download`, onSelect: Pu },
        { label: `Export orders (CSV)`, icon: `download`, onSelect: Fu },
        { label: `Export movements (CSV)`, icon: `download`, onSelect: Iu },
        `-`,
        { label: `Light`, icon: `sun`, checked: t === `light`, onSelect: () => Tl(`light`, n) },
        { label: `Dark`, icon: `moon`, checked: t === `dark`, onSelect: () => Tl(`dark`, n) },
        {
          label: `Match system`,
          icon: `mobile`,
          checked: t === `system`,
          onSelect: () => Tl(`system`, n),
        },
        { label: `Accent colour…`, icon: `sparkle`, onSelect: () => Ad(n) },
        `-`,
        {
          label: `Reset demo data`,
          icon: `refresh`,
          danger: !0,
          onSelect: async () => {
            (await tl(
              `Reset demo data?`,
              `Every change you made here goes back to the starting data.`,
              `Reset`,
            )) && (gs(), $(`Demo data reset`), location.reload());
          },
        },
        { label: `Sign out`, icon: `logout`, onSelect: Nd },
      ],
      { align: `end` },
    );
  }));
function Ad(e) {
  let t = qc(
    e,
    `<div class="accent-pop"><p class="accent-pop__t">Accent colour</p><p class="accent-pop__s">Pick a colour for buttons, links and highlights.</p>${Bl()}<p class="accent-pop__name">Now: <b data-an>${q(Vl())}</b> · <a href="/settings/account" data-more>More in Settings</a></p></div>`,
    { label: `Accent colour`, align: `end` },
  );
  t &&
    (Hl(t.el, () => {
      let e = t.el.querySelector(`[data-an]`);
      e && (e.textContent = Vl());
    }),
    co(K(`.accent-sw`, t.el), { y: 8, stagger: 0.03 }),
    t.el.querySelector(`[data-more]`)?.addEventListener(`click`, () => t.close()));
}
function jd() {
  nl(
    `<h2>Keyboard shortcuts</h2><dl class="keys">${[
      [`⌘ K  or  /`, `Search`],
      [`N`, `New sales order`],
      [`C`, `Create…`],
      [`G then D / P / O / U / W / A / C / S`, `Go to a section`],
      [`[`, `Expand or collapse the sidebar`],
      [`Esc`, `Close`],
      [`?`, `This list`],
    ]
      .map(
        ([e, t]) =>
          `<div><dt>${q(t)}</dt><dd>${e
            .split(`  `)
            .map((e) => `<kbd>${q(e)}</kbd>`)
            .join(` `)}</dd></div>`,
      )
      .join(``)}</dl>`,
    { label: `Keyboard shortcuts` },
  );
}
async function Nd() {
  if (
    await tl(`Sign out of Vels Agro?`, `You will be redirected to the admin login page.`, `Sign out`, !1)
  ) {
    try {
      localStorage.setItem(`Vels:signedout`, `1`);
      localStorage.removeItem(`Vels:active_user`);
    } catch {}
    Kc();
    navigateTo(`/login`);
  }
}
G(`#btn-out`).addEventListener(`click`, (e) => {
  (go(e.currentTarget), Nd());
});
var Fd = 0,
  Id = {
    d: `dashboard`,
    p: `products`,
    o: `orders`,
    u: `purchasing`,
    w: `warehouses`,
    a: `analytics`,
    c: `customers`,
    s: `settings`,
    h: `help`,
  };
(document.addEventListener(`keydown`, (e) => {
  if (Ku.classList.contains(`signed-out`)) return;
  let t = e.target.closest(`input, textarea, select, [contenteditable="true"]`);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === `k`) {
    (e.preventDefault(), ld.open ? _d() : gd());
    return;
  }
  if (t || e.metaKey || e.ctrlKey || e.altKey || document.querySelector(`dialog[open]`)) return;
  if (e.key === `Escape` && ul()) {
    ll();
    return;
  }
  let n = e.key.toLowerCase();
  if (Fd && Date.now() - Fd < 1200 && Id[n]) {
    ((navigateTo(`/${Id[n]}/${Vu[Id[n]].subs[0][0]}`)), (Fd = 0));
    return;
  }
  ((Fd = 0),
    n === `g`
      ? (Fd = Date.now())
      : e.key === `/`
        ? (e.preventDefault(), gd())
        : n === `n`
          ? (e.preventDefault(), tu({}, G(`#btn-new`)))
          : n === `c`
            ? (e.preventDefault(), Sd(G(`#btn-new`)))
            : e.key === `[`
              ? (e.preventDefault(), Dd())
              : e.key === `?` && jd());
}),
  G(`.scrim`).addEventListener(`click`, () => ll()));
function Ld() {
  Co ||
    setTimeout(() => {
      let e =
          X.customers.find((e) => e.id === `c-zoe-laurent`) ??
          X.customers.find((e) => e.kind === `shopper`),
        t = X.products.find((e) => e.id === `crb50`),
        n = X.products.find((e) => e.id === `nia30`);
      if (!e || !t || !n || document.hidden) return;
      let r = Math.max(...X.orders.map((e) => Number(e.number.slice(3)) || 0)) + 1,
        i = {
          id: `so-${r}`,
          number: `SO-${r}`,
          customerId: e.id,
          channel: `online`,
          status: `new`,
          createdAt: Date.now(),
          shipBy: Eo() + J + 16 * Y,
          locId: `dc`,
          lines: [
            { productId: t.id, qty: 1, price: t.price },
            { productId: n.id, qty: 1, price: n.price },
          ],
          carrier: `USPS Priority`,
          paid: !0,
          history: [{ at: Date.now(), to: `new`, by: `web` }],
        };
      (X.orders.unshift(i),
        _s(
          `order`,
          `Online order`,
          `${i.number} · ${e.name} · ${pc(Gs(i))}`,
          `/orders/all/${i.id}`,
          `web`,
        ),
        vs(`order`, `New online order from ${e.name} — ${pc(Gs(i))}`, `/orders/all/${i.id}`),
        Z(`orders`, `activity`, `notices`),
        $(`New online order — ${e.name}, ${pc(Gs(i))}`, { ico: `cart` }));
    }, no(32e3));
}
function Rd(e = !1) {
  Ku.classList.add(`is-ready`);
  let t = Yu.matches;
  (H.timeline()
    .fromTo(
      `.top`,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: W(0.8), ease: `power3.out`, clearProps: `transform,opacity` },
      0,
    )
    .fromTo(
      `.rail`,
      t ? { y: 90, opacity: 0 } : { x: -40, opacity: 0 },
      {
        x: 0,
        y: 0,
        opacity: 1,
        duration: W(0.9),
        ease: `power3.out`,
        clearProps: `transform,opacity`,
      },
      0.05,
    )
    .add(
      co(
        K(`.top .brand, .top__tools > *`).filter((e) => e.offsetParent),
        { y: -10, stagger: 0.05 },
      ),
      0.1,
    )
    .add(
      co(
        K(`.theme-sw, .nav__track > .nav__item, .rail__foot > *`).filter((e) => e.offsetParent),
        t ? { y: 10, stagger: 0.04 } : { x: -10, y: 0, stagger: 0.04 },
      ),
      0.18,
    )
    .add(() => {
      (e && ((td = null), (id = null)), sd(!0));
    }, 0.12)
    .add(() => {
      vo.v = !0;
    }, 1.6),
    e || Ld());
}
(Ul(),
  wd(!1),
  Ed(),
  ol(),
  kd(),
  xd(),
  _o(),
  (() => {
  let isSignedOut = !1;
  try {
    isSignedOut = localStorage.getItem(`Vels:signedout`) === `1`;
  } catch {}
  if (isSignedOut) {
    history.replaceState(null, ``, `/login`);
  } else if (!location.pathname || location.pathname === `/` || location.hash === `#` || location.hash === `#/`) {
    history.replaceState(null, ``, `/dashboard/overview`);
  }
  if (location.hash && location.hash.startsWith(`#/`)) {
    history.replaceState(null, ``, location.hash.slice(1));
  }
})());
var zd = !1;
function Bd() {
  if (!zd) {
    zd = !0;
    Rd();
  }
}
Co
  ? (window.Vels = {
      enter: Bd,
      drive(e) {
        let t = H.ticker.time,
          n = e();
        (H.ticker.remove(H.updateRoot), H.ticker.add(() => H.updateRoot(t + e() - n)));
      },
      set speed(e) {
        ro(e);
      },
      get speed() {
        return H.globalTimeline.timeScale();
      },
      get route() {
        return id?.name ?? ``;
      },
      get hash() {
        return location.pathname;
      },
    })
  : (document.fonts?.ready ?? Promise.resolve()).then(Bd);




// --- Semantic Aliases & Exports ---
const formatTime = vc;
const escapeHtml = q;
const notifyStoreSubscribers = Z;
const receiveTransfer = bu;
const findPoById = Es;
const BATCH_STATUS_TONES = Fo;
const formatRelativeDay = Sc;
const store = X;
const ACTIVE_ORDER_STAGES = Ao;
const updateReturnStatus = nu;
const findOrderById = ws;
const getSavedTheme = xl;
const updateMemberRole = ku;
const getAlertItems = Is;
const bindAccentPicker = Hl;
const setSalesGoal = ju;
const filterOrdersByDateRange = Ys;
const showToast = $;
const closeDrawer = rl;
const getActiveOrdersForLocation = js;
const ONE_DAY_MS = J;
const renderEmptyState = Pc;
const getTotalStockUnits = Bs;
const RETURN_STATUS_TONES = Lo;
const renderTrendBadge = Ic;
const findSupplierById = Ss;
const PO_STATUS_NAMES = Mo;
const closeCurrentPopover = Kc;
const resetDemoData = gs;
const KANBAN_STAGES = ko;
const bindQuickActions = dl;
const queryOne = io;
const CUSTOMER_TAG_NAMES = Ho;
const animatePageTransition = Vc;
const domQuery = G;
const ROLE_NAMES = Vo;
const confirmDialog = tl;
const getTotalRetailValue = Ws;
const ONE_HOUR_MS = Y;
const renderAccentPickerHtml = Bl;
const findProductById = Q;
const CATEGORY_TONES = Wo;
const renderAvatarStack = kc;
const formatProductFullName = ks;
const CHANNEL_NAMES = jo;
const cancelCount = wu;
const getActiveOrders = ec;
const bindTabControls = vl;
const renderAvatar = Oc;
const getTotalStockCostValue = Vs;
const PO_STATUS_TONES = Bo;
const renderNotificationItem = bc;
const motionDuration = W;
const findBatchById = Ts;
const renderStockStatusBadge = ml;
const formatCurrencyCompact = Xs;
const TRANSFER_STATUS_TONES = Qo;
const getDraftPoSupplierIds = lu;
const findCustomerByEmail = zs;
const ONE_MIN_MS = _l;
const updateCountLine = Tu;
const findBatchByLotNumber = Ks;
const renderTag = Nc;
const downloadFile = hl;
const startOfToday = Eo;
const TRANSFER_STATUS_NAMES = No;
const formatNumber = lc;
const getLastMonthValue = Us;
const CATEGORY_NAMES = qo;
const openDrawer = nl;
const getPendingOrdersCount = ac;
const RETURN_STATUS_NAMES = Io;
const formatDate = _c;
const getAvailableLocations = ho;
const RETURN_REASONS = zo;
const bindModalDismiss = fl;
const getAvailableSuppliers = fo;
const CARRIERS = Ro;
const formatDateWithDay = yc;
const animateWobble = lo;
const getMaterialStock = Ms;
const openNewPoModal = au;
const getMaterialInventoryValue = Zs;
const formatRelativeTime = xc;
const cancelOrder = $l;
const getExpiringBatches = $s;
const openMoveStockModal = _o;
const formatInt = cc;
const releaseBatch = hu;
const findLocationById = ms;
const setSavedTheme = Tl;
const exportOrdersCsv = Fu;
const getOrdersByCustomer = Js;
const animateTitle = oo;
const formatMoney = pc;
const updateBatchStatus = gu;
const getLowStockMaterials = Rs;
const openNewTransferModal = go;
const openModal = wl;
const renderProgressBar = rc;
const animateRows = co;
const openQuickCreateModal = $c;
const openInviteTeammateModal = Ou;
const getLowStockProducts = Fs;
const formatPercent = uc;
const openNewOrderModal = tu;
const findMemberById = ys;
const renderFilterBar = Bc;
const openNewCustomerModal = Du;
const getCustomerOrdersCount = Hs;
const renderPagination = qc;
const openMakeBatchModal = mu;
const daysUntilExpiry = Qs;
const animateCards = so;
const renderRating = Dc;
const getCurrentAccentName = Vl;
const getPoTotalCost = qs;
const formatShortDate = Uo;
const createHelpTicket = Mu;
const getPendingReturnsCount = Ds;
const formatFileSize = Po;
const exportStockCsv = Pu;
const exportDataBackup = bs;
const formatDateInput = xo;
const formatMoneyRound = mc;
const openScheduleCountModal = Cu;
const findMaterialById = xs;
const pluralize = Cc;
const adjustStock = ql;
const generateDateSeries = ic;
const animateMagneticElement = po;
const renderIconButton = Ec;
const receivePo = cu;
const isProductLowStock = Ns;
const animatePop = uo;
const highlightSearchMatch = Fc;
const markOrderPaid = eu;
const isMaterialLowStock = Ls;
const renderPill = Ac;
const animateElementOut = pl;
const domQueryAll = K;
const ORDER_STATUS_META = Oo;
const advanceOrderStatus = Zl;
const startOfDay = To;
const initLiftAnimations = yo;
const renderIcon = Tc;
const exportMovementsCsv = Iu;
const getOutOfStockProducts = Ps;
const bindMagnetic = $a;
const createCustomElement = Jc;
const openStockAdjustModal = Jl;
const findCustomerById = Cs;
const isHoverCapable = eo;
const renderPageHeader = Lc;
const completeCount = Eu;
const getLocationStockUnits = oc;
const ANIMATION_FLAGS = vo;
const formatMoneyK = hc;
const openNewBatchModal = yu;
const startOfMonth = Do;
const renderSegmentedControl = Uc;
const cancelPo = ou;
const getOrderTotal = Gs;
const renderProductThumb = Mc;
const removeTeammate = Au;
const getProductStock = As;
const renderOrderStatusBadge = jc;
const sendPo = su;
const addNotification = vs;
const initSegmentedControl = Wc;
const formatCsvRow = gl;
const getRecentOrders = nc;
const STOCK_MOVE_REASON_NAMES = Go;
export {
  // Clean semantic named exports
  formatTime,
  escapeHtml,
  notifyStoreSubscribers,
  receiveTransfer,
  findPoById,
  BATCH_STATUS_TONES,
  formatRelativeDay,
  store,
  ACTIVE_ORDER_STAGES,
  updateReturnStatus,
  findOrderById,
  getSavedTheme,
  updateMemberRole,
  getAlertItems,
  bindAccentPicker,
  setSalesGoal,
  filterOrdersByDateRange,
  showToast,
  closeDrawer,
  getActiveOrdersForLocation,
  ONE_DAY_MS,
  renderEmptyState,
  getTotalStockUnits,
  RETURN_STATUS_TONES,
  renderTrendBadge,
  findSupplierById,
  PO_STATUS_NAMES,
  closeCurrentPopover,
  resetDemoData,
  KANBAN_STAGES,
  bindQuickActions,
  queryOne,
  CUSTOMER_TAG_NAMES,
  animatePageTransition,
  domQuery,
  ROLE_NAMES,
  confirmDialog,
  getTotalRetailValue,
  ONE_HOUR_MS,
  renderAccentPickerHtml,
  findProductById,
  CATEGORY_TONES,
  renderAvatarStack,
  formatProductFullName,
  CHANNEL_NAMES,
  cancelCount,
  getActiveOrders,
  bindTabControls,
  renderAvatar,
  getTotalStockCostValue,
  PO_STATUS_TONES,
  renderNotificationItem,
  motionDuration,
  findBatchById,
  renderStockStatusBadge,
  formatCurrencyCompact,
  TRANSFER_STATUS_TONES,
  getDraftPoSupplierIds,
  findCustomerByEmail,
  ONE_MIN_MS,
  updateCountLine,
  findBatchByLotNumber,
  renderTag,
  downloadFile,
  startOfToday,
  TRANSFER_STATUS_NAMES,
  formatNumber,
  getLastMonthValue,
  CATEGORY_NAMES,
  openDrawer,
  getPendingOrdersCount,
  RETURN_STATUS_NAMES,
  formatDate,
  getAvailableLocations,
  RETURN_REASONS,
  bindModalDismiss,
  getAvailableSuppliers,
  CARRIERS,
  formatDateWithDay,
  animateWobble,
  getMaterialStock,
  openNewPoModal,
  getMaterialInventoryValue,
  formatRelativeTime,
  cancelOrder,
  getExpiringBatches,
  openMoveStockModal,
  formatInt,
  releaseBatch,
  findLocationById,
  setSavedTheme,
  exportOrdersCsv,
  getOrdersByCustomer,
  animateTitle,
  formatMoney,
  updateBatchStatus,
  getLowStockMaterials,
  openNewTransferModal,
  openModal,
  renderProgressBar,
  animateRows,
  openQuickCreateModal,
  openInviteTeammateModal,
  getLowStockProducts,
  Flip,
  formatPercent,
  openNewOrderModal,
  findMemberById,
  renderFilterBar,
  openNewCustomerModal,
  getCustomerOrdersCount,
  renderPagination,
  openMakeBatchModal,
  daysUntilExpiry,
  animateCards,
  renderRating,
  getCurrentAccentName,
  getPoTotalCost,
  formatShortDate,
  createHelpTicket,
  getPendingReturnsCount,
  formatFileSize,
  exportStockCsv,
  exportDataBackup,
  formatDateInput,
  formatMoneyRound,
  openScheduleCountModal,
  findMaterialById,
  pluralize,
  adjustStock,
  generateDateSeries,
  animateMagneticElement,
  renderIconButton,
  receivePo,
  isProductLowStock,
  animatePop,
  highlightSearchMatch,
  markOrderPaid,
  isMaterialLowStock,
  gsap,
  renderPill,
  animateElementOut,
  domQueryAll,
  ORDER_STATUS_META,
  advanceOrderStatus,
  startOfDay,
  initLiftAnimations,
  renderIcon,
  exportMovementsCsv,
  getOutOfStockProducts,
  bindMagnetic,
  createCustomElement,
  openStockAdjustModal,
  findCustomerById,
  isHoverCapable,
  renderPageHeader,
  completeCount,
  getLocationStockUnits,
  ANIMATION_FLAGS,
  formatMoneyK,
  openNewBatchModal,
  startOfMonth,
  renderSegmentedControl,
  cancelPo,
  getOrderTotal,
  renderProductThumb,
  removeTeammate,
  getProductStock,
  renderOrderStatusBadge,
  sendPo,
  addNotification,
  initSegmentedControl,
  formatCsvRow,
  getRecentOrders,
  STOCK_MOVE_REASON_NAMES,

  // Legacy aliases for full backward compatibility
  formatTime as $,
  escapeHtml as $n,
  notifyStoreSubscribers as $t,
  receiveTransfer as A,
  findPoById as An,
  BATCH_STATUS_TONES as At,
  formatRelativeDay as B,
  store as Bn,
  ACTIVE_ORDER_STAGES as Bt,
  updateReturnStatus as C,
  findOrderById as Cn,
  getSavedTheme as Ct,
  updateMemberRole as D,
  getAlertItems as Dn,
  bindAccentPicker as Dt,
  setSalesGoal as E,
  filterOrdersByDateRange as En,
  showToast as Et,
  closeDrawer as F,
  getActiveOrdersForLocation as Fn,
  ONE_DAY_MS as Ft,
  renderEmptyState as G,
  getTotalStockUnits as Gn,
  RETURN_STATUS_TONES as Gt,
  renderTrendBadge as H,
  findSupplierById as Hn,
  PO_STATUS_NAMES as Ht,
  closeCurrentPopover as I,
  resetDemoData as In,
  KANBAN_STAGES as It,
  bindQuickActions as J,
  queryOne as Jn,
  CUSTOMER_TAG_NAMES as Jt,
  animatePageTransition as K,
  domQuery as Kn,
  ROLE_NAMES as Kt,
  confirmDialog as L,
  getTotalRetailValue as Ln,
  ONE_HOUR_MS as Lt,
  renderAccentPickerHtml as M,
  findProductById as Mn,
  CATEGORY_TONES as Mt,
  renderAvatarStack as N,
  formatProductFullName as Nn,
  CHANNEL_NAMES as Nt,
  cancelCount as O,
  getActiveOrders as On,
  bindTabControls as Ot,
  renderAvatar as P,
  getTotalStockCostValue as Pn,
  PO_STATUS_TONES as Pt,
  renderNotificationItem as Q,
  motionDuration as Qn,
  findBatchById as Qt,
  renderStockStatusBadge as R,
  formatCurrencyCompact as Rn,
  TRANSFER_STATUS_TONES as Rt,
  getDraftPoSupplierIds as S,
  findCustomerByEmail as Sn,
  ONE_MIN_MS as St,
  updateCountLine as T,
  findBatchByLotNumber as Tn,
  renderTag as Tt,
  downloadFile as U,
  startOfToday as Un,
  TRANSFER_STATUS_NAMES as Ut,
  formatNumber as V,
  getLastMonthValue as Vn,
  CATEGORY_NAMES as Vt,
  openDrawer as W,
  getPendingOrdersCount as Wn,
  RETURN_STATUS_NAMES as Wt,
  formatDate as X,
  getAvailableLocations as Xn,
  RETURN_REASONS as Xt,
  bindModalDismiss as Y,
  getAvailableSuppliers as Yn,
  CARRIERS as Yt,
  formatDateWithDay as Z,
  animateWobble as Zn,
  getMaterialStock as Zt,
  openNewPoModal as _,
  getMaterialInventoryValue as _n,
  formatRelativeTime as _t,
  cancelOrder as a,
  getExpiringBatches as an,
  openMoveStockModal as ar,
  formatInt as at,
  releaseBatch as b,
  findLocationById as bn,
  setSavedTheme as bt,
  exportOrdersCsv as c,
  getOrdersByCustomer as cn,
  animateTitle as cr,
  formatMoney as ct,
  updateBatchStatus as d,
  getLowStockMaterials as dn,
  openNewTransferModal as dr,
  openModal as dt,
  renderProgressBar as en,
  animateRows as er,
  openQuickCreateModal as et,
  openInviteTeammateModal as f,
  getLowStockProducts as fn,
  Flip as fr,
  formatPercent as ft,
  openNewOrderModal as g,
  findMemberById as gn,
  renderFilterBar as gt,
  openNewCustomerModal as h,
  getCustomerOrdersCount as hn,
  renderPagination as ht,
  openMakeBatchModal as i,
  daysUntilExpiry as in,
  animateCards as ir,
  renderRating as it,
  getCurrentAccentName as j,
  getPoTotalCost as jn,
  formatShortDate as jt,
  createHelpTicket as k,
  getPendingReturnsCount as kn,
  formatFileSize as kt,
  exportStockCsv as l,
  exportDataBackup as ln,
  formatDateInput as lr,
  formatMoneyRound as lt,
  openScheduleCountModal as m,
  findMaterialById as mn,
  pluralize as mt,
  adjustStock as n,
  generateDateSeries as nn,
  animateMagneticElement as nr,
  renderIconButton as nt,
  receivePo as o,
  isProductLowStock as on,
  animatePop as or,
  highlightSearchMatch as ot,
  markOrderPaid as p,
  isMaterialLowStock as pn,
  gsap as pr,
  renderPill as pt,
  animateElementOut as q,
  domQueryAll as qn,
  ORDER_STATUS_META as qt,
  advanceOrderStatus as r,
  startOfDay as rn,
  initLiftAnimations as rr,
  renderIcon as rt,
  exportMovementsCsv as s,
  getOutOfStockProducts as sn,
  bindMagnetic as sr,
  createCustomElement as st,
  openStockAdjustModal as t,
  findCustomerById as tn,
  isHoverCapable as tr,
  renderPageHeader as tt,
  completeCount as u,
  getLocationStockUnits as un,
  ANIMATION_FLAGS as ur,
  formatMoneyK as ut,
  openNewBatchModal as v,
  startOfMonth as vn,
  renderSegmentedControl as vt,
  cancelPo as w,
  getOrderTotal as wn,
  renderProductThumb as wt,
  removeTeammate as x,
  getProductStock as xn,
  renderOrderStatusBadge as xt,
  sendPo as y,
  addNotification as yn,
  initSegmentedControl as yt,
  formatCsvRow as z,
  getRecentOrders as zn,
  STOCK_MOVE_REASON_NAMES as zt
};
