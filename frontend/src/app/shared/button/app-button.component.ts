import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel || null"
      [attr.title]="title || null"
      [class]="'button button--' + variant"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './app-button.component.css'
})
export class AppButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'quiet' | 'icon' = 'quiet';
  @Input() disabled = false;
  @Input() ariaLabel = '';
  @Input() title = '';
}