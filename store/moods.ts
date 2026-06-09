// Editable mood palette store. Seeded with the 5 defaults; CRUD from the Moods tab.
import { useSyncExternalStore } from 'react';
import { MOODS, MOOD_ORDER } from '../constants/data';
import type { Mood } from '../types';

export const MOOD_SWATCHES = [
  '#8B4F5C', '#C9A876', '#F4E4C1', '#A8B8A0', '#7A8FA3', '#B0846A',
  '#9A7AA0', '#6E8B8B', '#C98B7A', '#7D9070', '#A98DA6', '#6F7E94',
];

function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const ch = (i: number) => parseInt(n.slice(i, i + 2), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(ch(0)) + 0.7152 * lin(ch(2)) + 0.0722 * lin(ch(4));
}

export function makeMood(label: string, sub: string, color: string, id?: string): Mood {
  const darkText = luminance(color) > 0.45;
  return {
    id: id || `mood-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    label: (label || '').trim() || 'Untitled',
    sub: (sub || '').trim(),
    color,
    darkText,
    ink: darkText ? '#3A332C' : '#ffffff',
  };
}

let moods: Mood[] = MOOD_ORDER.map((id) => ({ ...MOODS[id] }));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useMoods(): Mood[] {
  return useSyncExternalStore(subscribe, () => moods);
}

export function addMood(label: string, sub: string, color: string) {
  moods = [...moods, makeMood(label, sub, color)];
  emit();
}

export function updateMood(id: string, label: string, sub: string, color: string) {
  moods = moods.map((m) => (m.id === id ? makeMood(label, sub, color, id) : m));
  emit();
}

export function removeMood(id: string) {
  if (moods.length <= 1) return; // keep at least one
  moods = moods.filter((m) => m.id !== id);
  emit();
}
