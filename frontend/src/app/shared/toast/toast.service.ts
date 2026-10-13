import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<ToastMessage | null>(null);
  private timeout?: ReturnType<typeof setTimeout>;
  private nextId = 0;

  show(message: string): void {
    if (this.timeout) clearTimeout(this.timeout);
    const id = ++this.nextId;
    this.current.set({ id, message });
    this.timeout = setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id?: number): void {
    if (id !== undefined && this.current()?.id !== id) return;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = undefined;
    this.current.set(null);
  }
}