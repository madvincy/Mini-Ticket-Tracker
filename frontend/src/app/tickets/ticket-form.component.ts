import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButtonComponent } from '../shared/button/app-button.component';
import { TicketPriority } from '../core/ticket.model';

export interface TicketDraft {
  title: string;
  description: string;
  priority: TicketPriority;
}

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppButtonComponent],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.css'
})
export class TicketFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  @Input() saving = false;
  @Output() readonly submitted = new EventEmitter<TicketDraft>();

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(5000)],
    priority: ['medium' as TicketPriority]
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    const value = this.form.getRawValue();
    this.submitted.emit({ ...value, title: value.title.trim() });
  }

  reset(): void {
    this.form.reset({ title: '', description: '', priority: 'medium' });
  }
}