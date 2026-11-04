export const ONE_DAY_MS = 864e5;
export const ONE_HOUR_MS = 36e5;
export const ONE_MIN_MS = 6e4;

export const KANBAN_STAGES = ['new', 'picking', 'packed', 'shipped', 'delivered'] as const;
export const ACTIVE_ORDER_STAGES = ['new', 'picking', 'packed'] as const;

export const ORDER_STATUS_META = {
  new: { name: 'New', tone: 'sky', icon: 'inbox' },
  picking: { name: 'Packing', tone: 'ocean', icon: 'scan' },
  packed: { name: 'Packed', tone: 'ochre', icon: 'box' },
  shipped: { name: 'Shipped', tone: 'teal', icon: 'truck' },
  delivered: { name: 'Delivered', tone: 'sage', icon: 'check' },
  cancelled: { name: 'Cancelled', tone: 'faint', icon: 'close' },
} as const;

export const CHANNEL_NAMES: Record<string, string> = {
  wholesale: 'Wholesale',
  online: 'Online store',
  studio: 'Studio shop',
};

export const PO_STATUS_NAMES: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Part received',
  received: 'Received',
  cancelled: 'Cancelled',
};

export const PO_STATUS_TONES: Record<string, string> = {
  draft: 'faint',
  sent: 'sky',
  partial: 'ochre',
  received: 'sage',
  cancelled: 'faint',
};

export const BATCH_STATUS_TONES: Record<string, string> = {
  quarantine: 'ocean',
  released: 'sage',
  hold: 'rose',
  expired: 'faint',
};

export const RETURN_STATUS_NAMES: Record<string, string> = {
  requested: 'Requested',
  received: 'Received',
  restocked: 'Restocked',
  refunded: 'Refunded',
  rejected: 'Rejected',
};

export const RETURN_STATUS_TONES: Record<string, string> = {
  requested: 'sky',
  received: 'ochre',
  restocked: 'sage',
  refunded: 'teal',
  rejected: 'faint',
};

export const TRANSFER_STATUS_NAMES: Record<string, string> = {
  planned: 'Planned',
  'in-transit': 'In transit',
  received: 'Received',
};

export const TRANSFER_STATUS_TONES: Record<string, string> = {
  planned: 'sky',
  'in-transit': 'ochre',
  received: 'sage',
};

export const CATEGORY_NAMES = ['Cleanse', 'Treat', 'Moisturise', 'Protect', 'Body'] as const;

export const CATEGORY_TONES: Record<string, string> = {
  Cleanse: 'sky',
  Treat: 'ocean',
  Moisturise: 'teal',
  Protect: 'ochre',
  Body: 'rose',
};

export const ROLE_NAMES: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
  viewer: 'Viewer',
};

export const ROLE_PERMISSIONS = [
  {
    key: 'view',
    label: 'View stock, orders and reports',
    roles: ['owner', 'admin', 'manager', 'staff', 'viewer'],
  },
  {
    key: 'pick',
    label: 'Pick, pack and ship orders',
    roles: ['owner', 'admin', 'manager', 'staff'],
  },
  {
    key: 'adjust',
    label: 'Adjust stock and run counts',
    roles: ['owner', 'admin', 'manager', 'staff'],
  },
  { key: 'batch', label: 'Release batches from QA', roles: ['owner', 'admin', 'manager'] },
  { key: 'po', label: 'Create and send purchase orders', roles: ['owner', 'admin', 'manager'] },
  { key: 'price', label: 'Change prices and costs', roles: ['owner', 'admin'] },
  { key: 'team', label: 'Invite people and change roles', roles: ['owner', 'admin'] },
  { key: 'billing', label: 'Billing and plan', roles: ['owner'] },
] as const;

export const CUSTOMER_TAG_NAMES: Record<string, string> = {
  vip: 'VIP',
  new: 'New',
  net30: 'Net 30',
  subscriber: 'Subscriber',
};

export const STOCK_MOVE_REASON_NAMES: Record<string, string> = {
  production: 'Batch released',
  sale: 'Shipped',
  transfer: 'Transfer',
  adjustment: 'Stock adjustment',
  return: 'Customer return',
};

export const RETURN_REASONS = [
  'Damaged in transit',
  'Pump not dispensing',
  'Wrong item sent',
  'Changed mind',
  'Reaction / sensitivity',
  'Leaking seal',
];

export const CARRIERS = ['USPS Priority', 'UPS Ground', 'FedEx Express', 'Courier'];
