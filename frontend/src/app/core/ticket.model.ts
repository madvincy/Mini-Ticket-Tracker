export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
}

export interface TicketStatusEvent {
  id: number;
  event_type: 'created' | 'status_changed' | 'baseline';
  from_status: TicketStatus | null;
  to_status: TicketStatus;
  changed_at: string;
}

export interface TicketDetails extends Ticket {
  history: TicketStatusEvent[];
}

export type TicketSortField = 'created_at' | 'title' | 'priority' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface TicketQuery {
  status?: TicketStatus;
  page: number;
  limit: number;
  search?: string;
  from?: string;
  to?: string;
  sortBy: TicketSortField;
  sortOrder: SortDirection;
}

export interface TicketPage {
  data: Ticket[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export type TicketStats = Record<TicketStatus, number>;