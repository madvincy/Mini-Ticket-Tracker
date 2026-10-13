import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { TicketDetails, TicketStatus } from '../core/ticket.model';
import { AppButtonComponent } from '../shared/button/app-button.component';

@Component({
  selector: 'app-ticket-details-dialog',
  standalone: true,
  imports: [CommonModule, AppButtonComponent],
  templateUrl: './ticket-details-dialog.component.html',
  styleUrl: './ticket-details-dialog.component.css'
})
export class TicketDetailsDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() loading = false;
  @Input() error = '';
  @Input() ticket: TicketDetails | null = null;
  @Output() readonly closed = new EventEmitter<void>();
  @ViewChild('dialog') private dialogRef?: ElementRef<HTMLDialogElement>;

  ngOnChanges(): void {
    this.syncDialog();
  }

  ngAfterViewInit(): void {
    this.syncDialog();
  }

  close(): void {
    this.dialogRef?.nativeElement.close();
    this.closed.emit();
  }

  onNativeClose(): void {
    if (this.open) this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  statusLabel(status: TicketStatus): string {
    return status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1);
  }

  private syncDialog(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;
    if (this.open && !dialog.open) dialog.showModal();
    if (!this.open && dialog.open) dialog.close();
  }
}