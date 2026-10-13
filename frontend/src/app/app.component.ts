import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { Ticket, TicketPage, TicketStats, TicketStatus } from './core/ticket.model';
import { TicketsApiService } from './core/tickets-api.service';
import { TicketDraft, TicketFormComponent } from './tickets/ticket-form.component';
import { TicketTableComponent } from './tickets/ticket-table.component';
import { TicketStatsComponent } from './tickets/ticket-stats.component';
import { AppButtonComponent } from './shared/button/app-button.component';
import { ToastComponent } from './shared/toast/toast.component';
import { ToastService } from './shared/toast/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TicketFormComponent,
    TicketTableComponent,
    TicketStatsComponent,
    AppButtonComponent,
    ToastComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly api = inject(TicketsApiService);
  private readonly toast = inject(ToastService);
  @ViewChild(TicketFormComponent) private ticketForm?: TicketFormComponent;
  readonly tickets = signal<Ticket[]>([]);
  readonly stats = signal<TicketStats>({ open: 0, in_progress: 0, closed: 0 });
  readonly pageMeta = signal<TicketPage['meta']>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  readonly filter = signal<TicketStatus | ''>('');
  readonly page = signal(1);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      tickets: this.api.list({ status: this.filter() || undefined, page: this.page(), limit: 10 }),
      stats: this.api.stats()
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ tickets, stats }) => {
        this.tickets.set(tickets.data);
        this.pageMeta.set(tickets.meta);
        this.stats.set(stats);
      },
      error: (error: unknown) => this.error.set(this.api.errorMessage(error))
    });
  }

  createTicket(draft: TicketDraft): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.api.create(draft)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.ticketForm?.reset();
          this.page.set(1);
          this.toast.show('Request created successfully');
          this.reload();
        },
        error: (error: unknown) => this.error.set(this.api.errorMessage(error))
      });
  }

  changeStatus(id: number, status: TicketStatus): void {
    const ticket = this.tickets().find((item) => item.id === id);
    if (!ticket) return;
    const previous = ticket.status;
    this.tickets.update((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    this.api.update(id, { status }).subscribe({
      next: () => this.reload(),
      error: (error: unknown) => {
        this.tickets.update((items) => items.map((item) => item.id === id ? { ...item, status: previous } : item));
        this.error.set(this.api.errorMessage(error));
      }
    });
  }

  changeFilter(value: string): void {
    this.filter.set(value as TicketStatus | '');
    this.page.set(1);
    this.reload();
  }

  movePage(delta: number): void {
    const next = this.page() + delta;
    if (next < 1 || next > this.pageMeta().totalPages) return;
    this.page.set(next);
    this.reload();
  }

}
