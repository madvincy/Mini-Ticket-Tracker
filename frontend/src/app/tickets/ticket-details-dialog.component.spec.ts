/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketDetailsDialogComponent } from './ticket-details-dialog.component';

describe('TicketDetailsDialogComponent', () => {
  let fixture: ComponentFixture<TicketDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailsDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailsDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('ticket', {
      id: 42,
      title: 'Router outage',
      description: 'Office network unavailable',
      status: 'in_progress',
      priority: 'high',
      created_at: '2026-10-14T09:00:00.000Z',
      history: [
        { id: 1, event_type: 'created', from_status: null, to_status: 'open', changed_at: '2026-10-14T09:00:00.000Z' },
        { id: 2, event_type: 'status_changed', from_status: 'open', to_status: 'in_progress', changed_at: '2026-10-14T09:30:00.000Z' }
      ]
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    if (dialog.open) dialog.close();
  });

  it('shows ticket details and chronological status changes in a modal', () => {
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const timeline = fixture.nativeElement.querySelector('.timeline');
    expect(dialog.open).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Router outage');
    expect(timeline.textContent).toContain('Ticket created');
    expect(timeline.textContent).toContain('Open → In progress');
    expect(timeline.querySelectorAll('li').length).toBe(2);
  });
});