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
  status: string;
  priority: string;
  contactId: string;
  accountId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  account?: Account;
  assignee?: CrmUser | null;
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

export interface Tag {
  id: string;
  label: string;
}

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalTickets: number;
  newTickets: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  slaAtRisk: number;
  byPriority: {
    priority: string;
    count: number;
  }[];
  volumeOverTime: {
    date: string;
    count: number;
  }[];
}