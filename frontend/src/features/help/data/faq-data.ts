import type { FaqArticle, TopicMeta, TicketStatus } from '../../../types/help';

export interface TopicDefinition extends TopicMeta {
  tone: string;
  text: string;
}

export const FAQ_TOPICS: Record<string, TopicDefinition> = {
  batches: {
    id: 'batches',
    name: 'Batches & QA',
    icon: 'flask',
    tone: 'ocean',
    text: 'Making lots, release, holds, expiry',
  },
  stock: {
    id: 'stock',
    name: 'Stock & counts',
    icon: 'boxes',
    tone: 'pine',
    text: 'Transfers, counts, reorder points',
  },
  orders: {
    id: 'orders',
    name: 'Orders & returns',
    icon: 'orders',
    tone: 'sky',
    text: 'Wholesale, online, the board, returns',
  },
  buying: {
    id: 'buying',
    name: 'Purchasing',
    icon: 'cart',
    tone: 'ochre',
    text: 'Suppliers, POs, receiving',
  },
  team: {
    id: 'team',
    name: 'Team & data',
    icon: 'users',
    tone: 'teal',
    text: 'Roles, exports, settings',
  },
  keys: {
    id: 'keys',
    name: 'Shortcuts',
    icon: 'command',
    tone: 'slate',
    text: 'Get around without the mouse',
  },
};

export interface ExtendedFaqArticle extends FaqArticle {
  link?: [string, string];
  keys?: [[string, string] | [string], string][];
}

export const FAQ_ARTICLES: ExtendedFaqArticle[] = [
  {
    id: 'batch-to-shelf',
    cat: 'batches',
    q: 'How does a batch get from the lab onto the shelf?',
    a: 'Make a batch from Products › Batches or from a product’s page. Vels checks the bill of materials, takes the ingredients and packaging out of the Weaverville Lab’s stock and books the lot In QA. Its units don’t count as available until someone allowed to release batches opens the lot and presses Release — then they land at Riverside DC and show up in the ledger.',
    link: ['/products/batches', 'Open batches'],
  },
  {
    id: 'hold-lot',
    cat: 'batches',
    q: 'What happens when I put a lot on hold?',
    a: 'Its remaining units come off sale straight away, so they can’t be reserved for an order, and the lot keeps the reason you gave. Release it again once the problem is fixed — for example when replacement pumps arrive for a cleansing-oil lot that was sticking.',
  },
  {
    id: 'expiry',
    cat: 'batches',
    q: 'When does Vels warn me that a lot is about to expire?',
    a: 'A lot’s expiry date is its make date plus the product’s shelf life. Once a released lot with stock left is inside the warning window — 90 days unless you change it — it raises an “Expiring soon” alert. Set the window to 30, 60, 90 or 120 days in Settings › Company › Stock preferences; the alerts, the dashboard and Stock health all follow at once.',
    link: ['/settings/company', 'Change the window'],
  },
  {
    id: 'transfer',
    cat: 'stock',
    q: 'How do I move stock between the DC, the lab and the shop?',
    a: 'Use New › Transfer, or Move stock on the dashboard. Choose where it comes from, where it goes and the lines. A transfer goes Planned → In transit → Received: the units leave the source when it ships and arrive at the destination when someone receives it, and both moves are written to the stock ledger.',
    link: ['/warehouses/transfers', 'Open transfers'],
  },
  {
    id: 'counts',
    cat: 'stock',
    q: 'How do cycle counts work?',
    a: 'Schedule a count for one zone from Warehouses › Counts. When it starts, Vels snapshots what it expects on each shelf; the counter enters what is really there, line by line, then finishes the count. Any difference is booked as a count variance in the ledger, and the Stock accuracy dial in Analytics updates. To split aisles between two people, schedule one count per zone.',
    link: ['/warehouses/counts', 'Open counts'],
  },
  {
    id: 'reorder-point',
    cat: 'stock',
    q: 'What is a reorder point, and why is a product marked low?',
    a: 'Every product has a reorder point and a run size. It is marked low when the stock you can sell at Riverside DC — what’s on hand minus what open orders have reserved — is at or under that point. Analytics › Stock health shows days of cover too: how long that stock lasts at the last 30 days’ rate.',
    link: ['/analytics/stock', 'See days of cover'],
  },
  {
    id: 'adjust',
    cat: 'stock',
    q: 'Can I correct stock without running a count?',
    a: 'Yes. On a product, choose Adjust stock, select the location, add or remove units and give a reason such as “broken in aisle” or “sent as samples”. The change is logged in the ledger with your name, and the toast offers an undo for a few seconds.',
  },
  {
    id: 'wholesale',
    cat: 'orders',
    q: 'How are wholesale orders different from online orders?',
    a: 'Wholesale orders are for stockists, priced at wholesale and packed in cases of six. They ship within three days and can be on Net 30 terms, so they stay unpaid until you mark them paid. Online orders are priced at retail and ship the next working day. Both move New → Packing → Packed → Shipped → Delivered on the board.',
    link: ['/orders/board', 'Open the board'],
  },
  {
    id: 'returns',
    cat: 'orders',
    q: 'How do I handle a return?',
    a: 'Open it from Orders › Returns. Mark it Received when the parcel arrives, then either Restock it — the units go back on the shelf at Riverside DC — or Refund it. Items that leaked, were opened or caused a reaction should be refunded, never restocked. You can also Reject a request.',
    link: ['/orders/returns', 'Open returns'],
  },
  {
    id: 'goal',
    cat: 'orders',
    q: 'How do I change the monthly sales goal?',
    a: 'On the dashboard, open the ⋯ menu on Sales overview and choose Edit monthly goal, or press Edit goal under the chart in Analytics › Reports. The goal covers every channel together, before tax.',
    link: ['/analytics/overview', 'Open reports'],
  },
  {
    id: 'reorder-materials',
    cat: 'buying',
    q: 'How do I reorder materials that are running low?',
    a: 'Dashboard › Alerts has Draft every reorder: it writes one draft purchase order per supplier for every low material, at its reorder quantity. Check the drafts and Send them. When the delivery arrives, Receive all of it or just the part that came, and the lab’s stock goes up.',
    link: ['/purchasing/orders', 'Purchase orders'],
  },
  {
    id: 'roles',
    cat: 'team',
    q: 'What can each role do?',
    a: 'Viewers can see stock, orders and reports. Staff can also process, pack, ship, adjust stock and run counts. Managers can also release batches and send purchase orders. Admins can also change prices and costs and invite people. Only the owner sees billing. Change someone’s role in Settings › Team & roles.',
    link: ['/settings/team', 'Team & roles'],
  },
  {
    id: 'export',
    cat: 'team',
    q: 'How do I export my data as CSV?',
    a: 'Settings › Company › Your data exports stock by location, every sales order and the full stock ledger. Analytics › Reports exports whatever report is on screen, row by row, and each invoice in Billing downloads on its own.',
    link: ['/settings/company', 'Your data'],
  },
  {
    id: 'heatmap',
    cat: 'orders',
    q: 'When do most orders come in?',
    a: 'Analytics › Sales has a heatmap of orders by day of the week and hour. Hover a square to see how many orders landed then and what they were worth; the busiest hour is named above it. Plan fulfillment shifts around it.',
    link: ['/analytics/sales', 'Open the heatmap'],
  },
  {
    id: 'keys',
    cat: 'keys',
    q: 'What keyboard shortcuts are there?',
    a: 'Most of Vels works from the keyboard. Press ? anywhere to see this list.',
    keys: [
      [['⌘', 'K'], 'Search everything'],
      [['g', 'd'], 'Go to the dashboard (g then p, o, u, w, a, c, s or h for the others)'],
      [['n'], 'New sales order'],
      [['c'], 'The create menu'],
      [['['], 'Collapse or expand the sidebar'],
      [['?'], 'Every shortcut'],
    ],
  },
];

export const TICKET_TOPICS: string[] = [
  'Batches & QA',
  'Stock & counts',
  'Orders & returns',
  'Purchasing',
  'Printing & labels',
  'Billing',
  'Something else',
];

export const TICKET_STATUS_CONFIG: Record<TicketStatus, [string, string]> = {
  open: ['sky', 'Open'],
  answered: ['sage', 'Answered'],
  closed: ['faint', 'Closed'],
};
