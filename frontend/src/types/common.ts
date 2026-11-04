export interface FeaturePage {
  title: (params: string[]) => string;
  mount: (container: HTMLElement) => void;
  enter: (context: { params: string[]; first?: boolean; same?: boolean }) => void;
  leave?: () => void;
}

export interface MenuItem {
  label: string;
  icon?: string;
  danger?: boolean;
  checked?: boolean;
  onSelect?: () => void;
}

export interface PromptDialogConfig {
  title: string;
  text?: string;
  value?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
}

export interface SearchResult {
  group: string;
  label: string;
  meta: string;
  href: string;
  lead: string;
}

export interface NotificationItem {
  id: string;
  at: number;
  text: string;
  href: string;
  read: boolean;
  kind: 'order' | 'batch' | 'stock' | 'po' | 'return' | 'expiry';
}
