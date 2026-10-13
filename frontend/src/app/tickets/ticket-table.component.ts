import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SortDirection, Ticket, TicketSortField, TicketStatus } from '../core/ticket.model';
import { AppButtonComponent } from '../shared/button/app-button.component';

@Component({
  selector: 'app-ticket-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppButtonComponent],
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
  @Input() search = '';
  @Input() from = '';
  @Input() to = '';
  @Input() sortBy: TicketSortField = 'created_at';
  @Input() sortOrder: SortDirection = 'desc';
  @Output() readonly filterChange = new EventEmitter<TicketStatus | ''>();
  @Output() readonly searchChange = new EventEmitter<string>();
  @Output() readonly clearFilters = new EventEmitter<void>();
  @Output() readonly dateRangeChange = new EventEmitter<{ from: string; to: string }>();
  @Output() readonly sortChange = new EventEmitter<{ sortBy: TicketSortField; sortOrder: SortDirection }>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly statusChange = new EventEmitter<{ id: number; status: TicketStatus }>();
  @Output() readonly ticketOpen = new EventEmitter<number>();

  readonly statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((search) => {
      const normalized = search.trim();
      if (search !== normalized) this.searchControl.setValue(normalized, { emitEvent: false });
      this.searchChange.emit(normalized);
    });
  }

  statusLabel(status: TicketStatus): string {
    return status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1);
  }

  setFilter(value: string): void {
    this.filterChange.emit(value as TicketStatus | '');
  }

  setStatus(ticket: Ticket, value: string): void {
    this.statusChange.emit({ id: ticket.id, status: value as TicketStatus });
  }

  setDateRange(from: string, to: string): void {
    this.dateRangeChange.emit({ from, to });
  }

  clearAllFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.clearFilters.emit();
  }

  toggleSort(sortBy: TicketSortField): void {
    const sortOrder: SortDirection = this.sortBy === sortBy && this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ sortBy, sortOrder });
  }

  get firstItem(): number {
    return this.tickets.length ? (this.page - 1) * 10 + 1 : 0;
  }

  get lastItem(): number {
    return (this.page - 1) * 10 + this.tickets.length;
  }
}