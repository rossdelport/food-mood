// Tiny global toast store. Call showToast(message, icon) from anywhere; the
// ToastHost mounted at the root renders it top-center.
import { useSyncExternalStore } from 'react';

export type ToastIcon = 'refresh' | 'check' | 'edit' | 'bell' | 'trash' | 'info';
export type Toast = { id: number; message: string; icon: ToastIcon };

let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function showToast(message: string, icon: ToastIcon = 'check') {
  current = { id: Date.now(), message, icon };
  emit();
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { current = null; emit(); }, 2000);
}

export function useToast(): Toast | null {
  return useSyncExternalStore(subscribe, () => current);
}
