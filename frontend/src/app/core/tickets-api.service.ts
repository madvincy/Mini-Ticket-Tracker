import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Ticket, TicketDetails, TicketPage, TicketPriority, TicketQuery, TicketStats, TicketStatus } from './ticket.model';

interface Envelope<T> { data: T; }
interface TicketDraft { title: string; description: string; priority: TicketPriority; }
interface TicketChanges { status?: TicketStatus; priority?: TicketPriority; }

@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tickets';

  list(query: TicketQuery): Observable<TicketPage> {
    let params = new HttpParams().set('page', query.page).set('limit', query.limit);
    if (query.status) params = params.set('status', query.status);
    if (query.search) params = params.set('search', query.search);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    params = params.set('sortBy', query.sortBy).set('sortOrder', query.sortOrder);
    return this.http.get<TicketPage>(this.baseUrl, { params });
  }

  details(id: number): Observable<TicketDetails> {
    return this.http.get<Envelope<TicketDetails>>(`${this.baseUrl}/${id}`).pipe(map((response) => response.data));
  }

  stats(): Observable<TicketStats> {
    return this.http.get<Envelope<TicketStats>>(`${this.baseUrl}/stats`).pipe(map((response) => response.data));
  }

  create(ticket: TicketDraft): Observable<Ticket> {
    return this.http.post<Envelope<Ticket>>(this.baseUrl, ticket).pipe(map((response) => response.data));
  }

  update(id: number, changes: TicketChanges): Observable<Ticket> {
    return this.http.patch<Envelope<Ticket>>(`${this.baseUrl}/${id}`, changes).pipe(map((response) => response.data));
  }

  errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.error?.message;
      return typeof message === 'string' ? message : 'The request could not be completed.';
    }
    return 'The request could not be completed.';
  }
}