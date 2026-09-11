export type TicketStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'RESOLVED';

export type TicketPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type SlaStatus =
  | 'WITHIN_SLA'
  | 'AT_RISK'
  | 'BREACHED'
  | 'RESOLVED'
  | 'NO_SLA';

export interface Account {
  id: string;
  name: string;
  domain: string;
  tier: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  notes: string | null;
  accountId: string;
  account?: {
    id: string;
    name: string;
    domain: string;
    tier: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaDueAt: string | null;
  slaStatus: SlaStatus;
  triageReason: string | null;
  contactId: string;
  accountId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  account?: Account;
  assignee?: CrmUser | null;
}

/**
 * Display row for the tickets table: API enums are formatted for
 * badges ("In Progress") and relation names are flattened.
 */
export interface TicketRow
  extends Omit<Ticket, 'status' | 'priority'> {
  status: string;
  priority: string;
  contact_name: string;
  account_name: string;
  assignee_name: string;
  created_at: string;
}

export interface Message {
  id: string;
  body: string;
  isInternalNote: boolean;
  ticketId: string;
  authorId: string | null;
  senderType: 'AGENT' | 'CUSTOMER';
  createdAt: string;
  author?: CrmUser | null;
}

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

/** Mirrors GET /api/v1/dashboard (snake_case, as returned). */
export interface DashboardStats {
  total_tickets: number;
  new_tickets: number;
  in_progress: number;
  waiting: number;
  resolved: number;
  sla_at_risk: number;
  sla_due_soon: number;
  sla_on_track: number;
  by_priority: {
    priority: string;
    count: number;
  }[];
  volume_over_time: {
    date: string;
    count: number;
  }[];
}
