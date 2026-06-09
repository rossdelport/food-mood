// Lightweight in-memory journal store (useSyncExternalStore).
// Becomes the basis for AsyncStorage-backed persistence in a later milestone.
import { useSyncExternalStore } from 'react';
import { makeSeedJournal } from '../constants/journalData';
import type { JournalEntry } from '../types';

let entries: JournalEntry[] = makeSeedJournal();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useJournalEntries(): JournalEntry[] {
  return useSyncExternalStore(subscribe, () => entries);
}

export function getEntry(id: string): JournalEntry | undefined {
  return entries.find((e) => e.id === id);
}

// Upsert; an entry only exists if it has both text and a mood.
export function saveEntry(entry: JournalEntry) {
  const rest = entries.filter((e) => e.id !== entry.id);
  if (!entry.text.trim() || !entry.moodId) {
    entries = rest;
  } else {
    entries = [{ ...entry, updatedAt: Date.now() }, ...rest];
  }
  emit();
}

export function deleteEntry(id: string) {
  entries = entries.filter((e) => e.id !== id);
  emit();
}
