// Lightweight in-memory journal store (useSyncExternalStore).
// Becomes the basis for AsyncStorage-backed persistence in a later milestone.
import { useSyncExternalStore } from 'react';
import { makeSeedJournal } from '../constants/journalData';
import { loadJSON, saveJSON } from './persist';
import type { JournalEntry } from '../types';

const KEY = 'foodmood:journal';

let entries: JournalEntry[] = makeSeedJournal();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Load saved entries; on first run, persist the seed so future edits stick.
export async function hydrateJournal() {
  const saved = await loadJSON<JournalEntry[]>(KEY);
  if (saved) entries = saved;
  else saveJSON(KEY, entries);
  emit();
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
  saveJSON(KEY, entries);
  emit();
}

export function deleteEntry(id: string) {
  entries = entries.filter((e) => e.id !== id);
  saveJSON(KEY, entries);
  emit();
}
