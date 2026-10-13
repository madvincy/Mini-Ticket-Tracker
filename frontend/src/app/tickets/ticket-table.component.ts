import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ticket, TicketStatus } from '../core/ticket.model';
import { AppButtonComponent } from '../shared/button/app-button.component';

@Component({
  selector: 'app-ticket-table',
  standalone: true,
  imports: [CommonModule, AppButtonComponent],
  templateUrl: './ticket-table.component.html',
  styleUrl: './ticket-table.component.css'
})
export class TicketTableComponent {
  @Input() tickets: Ticket[] = [];
  @Input() loading = false;
  @Input() filter: TicketStatus | '' = '';
  @Input() page = 1;
  @Input() total = 0;
  @Input() totalPages = 0;
  @Output() readonly filterChange = new EventEmitter<TicketStatus | ''>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly statusChange = new EventEmitter<{ id: number; status: TicketStatus }>();

  readonly statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];

  statusLabel(status: TicketStatus): string {
    return status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1);
  }

  setFilter(value: string): void {
    this.filterChange.emit(value as TicketStatus | '');
  }

  setStatus(ticket: Ticket, value: string): void {
    this.statusChange.emit({ id: ticket.id, status: value as TicketStatus });
  }

  get firstItem(): number {
    return this.tickets.length ? (this.page - 1) * 10 + 1 : 0;
  }

  get lastItem(): number {
    return (this.page - 1) * 10 + this.tickets.length;
  }
}