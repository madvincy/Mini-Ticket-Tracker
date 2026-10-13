import { Component, Input } from '@angular/core';
import { TicketStats } from '../core/ticket.model';

@Component({
  selector: 'app-ticket-stats',
  standalone: true,
  template: `
    <section class="stats-row" aria-label="Ticket totals">
      <div class="stat"><span class="stat-label"><i class="stat-dot open-dot"></i>Open</span><strong>{{ stats.open }}</strong></div>
      <div class="stat"><span class="stat-label"><i class="stat-dot progress-dot"></i>In progress</span><strong>{{ stats.in_progress }}</strong></div>
      <div class="stat"><span class="stat-label"><i class="stat-dot closed-dot"></i>Closed</span><strong>{{ stats.closed }}</strong></div>
      <div class="stats-note"><span class="pulse"></span> Status overview</div>
    </section>
  `,
  styleUrl: './ticket-stats.component.css'
})
export class TicketStatsComponent {
  @Input() stats: TicketStats = { open: 0, in_progress: 0, closed: 0 };
}