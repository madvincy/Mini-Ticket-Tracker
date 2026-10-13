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

export interface TicketPage {
  data: Ticket[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export type TicketStats = Record<TicketStatus, number>;