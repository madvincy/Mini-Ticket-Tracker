import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Ticket, TicketPage, TicketStats, TicketStatus } from './core/ticket.model';
import { TicketsApiService } from './core/tickets-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly api = inject(TicketsApiService);
  private readonly formBuilder = inject(FormBuilder);
  readonly tickets = signal<Ticket[]>([]);
  readonly stats = signal<TicketStats>({ open: 0, in_progress: 0, closed: 0 });
  readonly pageMeta = signal<TicketPage['meta']>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  readonly filter = signal<TicketStatus | ''>('');
  readonly page = signal(1);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(5000)],
    priority: ['medium' as 'low' | 'medium' | 'high']
  });

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

  createTicket(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.api.create({ ...this.form.getRawValue(), title: this.form.controls.title.value.trim() })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.form.reset({ title: '', description: '', priority: 'medium' });
          this.page.set(1);
          this.reload();
        },
        error: (error: unknown) => this.error.set(this.api.errorMessage(error))
      });
  }

  changeStatus(ticket: Ticket, status: TicketStatus): void {
    const previous = ticket.status;
    this.tickets.update((items) => items.map((item) => item.id === ticket.id ? { ...item, status } : item));
    this.api.update(ticket.id, { status }).subscribe({
      next: () => this.reload(),
      error: (error: unknown) => {
        this.tickets.update((items) => items.map((item) => item.id === ticket.id ? { ...item, status: previous } : item));
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

  statusLabel(status: TicketStatus): string {
    return status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1);
  }
}
