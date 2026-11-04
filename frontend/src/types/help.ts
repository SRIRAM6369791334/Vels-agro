export type TicketStatus = 'open' | 'answered' | 'closed';

export interface TopicMeta {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface FaqArticle {
  id: string;
  cat: string;
  q: string;
  a: string;
  href?: string;
  link?: string;
  key?: string;
}

export interface Ticket {
  id: string;
  number: number;
  subject: string;
  body: string;
  topic: string;
  status: TicketStatus;
  at: number;
  reply?: string;
}
