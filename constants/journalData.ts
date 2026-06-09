// Journal seed data + relative-time grouping + formatting helpers.
import { format, startOfWeek, startOfMonth } from 'date-fns';
import type { JournalEntry } from '../types';

const DAY = 86400000;

export const fmtDate = (ts: number) => format(ts, 'EEEE, MMMM d');
export const fmtTime = (ts: number) => format(ts, 'h:mm a');
export const nowTime = () => fmtTime(Date.now());

const mk = (
  id: string,
  ts: number,
  moodId: string,
  link: { label: string } | null,
  text: string,
): JournalEntry => ({ id, ts, updatedAt: ts, moodId, link, text, date: fmtDate(ts), time: fmtTime(ts) });

// Seed reflections placed across real-time buckets so the grouping is visible.
export function makeSeedJournal(): JournalEntry[] {
  const now = new Date();
  const sow = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const prevMonth = (() => { const x = new Date(now); x.setMonth(x.getMonth() - 1, 14); x.setHours(19, 5, 0, 0); return x.getTime(); })();
  const twoMonths = (() => { const x = new Date(now); x.setMonth(x.getMonth() - 2, 12); x.setHours(8, 40, 0, 0); return x.getTime(); })();
  return [
    mk('j-seed1', now.getTime() - 0.12 * DAY, 'energetic', { label: "Today's meals" },
      'Lighter breakfast today and I felt it all morning. Clear, quick, awake. The oats and berries might be the move on days I want momentum.'),
    mk('j-seed2', sow + 0.45 * DAY, 'calm', null,
      'Started the week slow and unhurried. Noticing that the calm days are usually the ones where I cook for myself instead of grabbing something.'),
    mk('j-seed3', sow - 4 * DAY + 0.355 * DAY, 'focused', null,
      'Trying to pay less attention to numbers and more to how a meal actually leaves me feeling. The colour helps more than the grams, honestly.'),
    mk('j-seed4', prevMonth, 'contemplative', null,
      'Felt heavy and bloated all evening after a big, late lunch. Noting it so I remember to keep the midday meal lighter next time.'),
    mk('j-seed5', twoMonths, 'sluggish', null,
      'A heavy, sluggish stretch. Writing it down so future me remembers what that felt like, and that it passed.'),
  ];
}

// dominant mood id across a set of entries (ignores untagged)
function domMoodOf(items: JournalEntry[]): string | null {
  const c: Record<string, number> = {};
  items.forEach((e) => { if (e.moodId) c[e.moodId] = (c[e.moodId] || 0) + 1; });
  const k = Object.keys(c);
  return k.length ? k.sort((a, b) => c[b] - c[a])[0] : null;
}

export type JournalGroup = { label: string; items: JournalEntry[]; moodId: string | null };

// Group entries into relative-time sections (newest first within each).
export function groupEntries(entries: JournalEntry[]): JournalGroup[] {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const lastWeekStart = thisWeekStart - 7 * DAY;
  const mStart = startOfMonth(now).getTime();
  const thisMonth = format(now, 'MMMM');

  const buckets = new Map<string, JournalGroup>();
  const order: string[] = [];

  entries.forEach((e) => {
    const ts = e.updatedAt || e.ts;
    let key: string;
    let label: string;
    if (ts >= thisWeekStart) { key = 'thisweek'; label = 'This Week'; }
    else if (ts >= lastWeekStart) { key = 'lastweek'; label = 'Last Week'; }
    else if (ts >= mStart) { key = 'earlier'; label = `Earlier in ${thisMonth}`; }
    else {
      const d = new Date(ts);
      let m = format(d, 'MMMM');
      if (d.getFullYear() !== now.getFullYear()) m += ` ${d.getFullYear()}`;
      key = `m-${m}`;
      label = m;
    }
    if (!buckets.has(key)) { buckets.set(key, { label, items: [], moodId: null }); order.push(key); }
    buckets.get(key)!.items.push(e);
  });

  return order.map((k) => {
    const g = buckets.get(k)!;
    return { ...g, moodId: domMoodOf(g.items) };
  });
}
