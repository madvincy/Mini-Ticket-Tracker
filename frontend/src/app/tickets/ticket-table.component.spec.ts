/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketTableComponent } from './ticket-table.component';

describe('TicketTableComponent status selection', () => {
  let fixture: ComponentFixture<TicketTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTableComponent);
    fixture.componentRef.setInput('tickets', [{
      id: 42,
      title: 'Router outage',
      description: null,
      status: 'in_progress',
      priority: 'high',
      created_at: '2026-10-14T09:00:00.000Z'
    }]);
    fixture.detectChanges();
  });

  it('selects the current status instead of defaulting to open', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('.status-select');
    expect(select.value).toBe('in_progress');
    expect(select.selectedOptions[0].textContent?.trim()).toBe('In progress');
  });
});