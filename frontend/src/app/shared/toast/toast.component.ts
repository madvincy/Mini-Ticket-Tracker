import { Component, inject } from '@angular/core';
import { AppButtonComponent } from '../button/app-button.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AppButtonComponent],
  template: `
    @if (toasts.current(); as toast) {
      <div class="toast" role="status" aria-live="polite">
        <span class="toast-mark" aria-hidden="true">✓</span>
        <span>{{ toast.message }}</span>
        <app-button variant="quiet" ariaLabel="Dismiss notification" title="Dismiss notification" (click)="toasts.dismiss(toast.id)">×</app-button>
      </div>
    }
  `,
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  readonly toasts = inject(ToastService);
}