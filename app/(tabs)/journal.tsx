import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import EntryCard from '../../components/journal/EntryCard';
import OrbRefresh from '../../components/OrbRefresh';
import { SearchIcon, PlusIcon } from '../../components/NavIcons';
import { ChevronLeftIcon } from '../../components/NavIcons';
import { useJournalEntries } from '../../store/journal';
import { useMoods, getMoodById } from '../../store/moods';
import { groupEntries } from '../../constants/journalData';
import { colors, fonts, radius as radii, buttonShadow } from '../../constants/theme';

const DAY = 86400000;

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalEntries();
  const [searching, setSearching] = useState(false);

  const sorted = entries.slice().sort((a, b) => (b.updatedAt || b.ts) - (a.updatedAt || a.ts));

  if (searching) {
    return <JournalSearch onBack={() => setSearching(false)} entries={sorted} />;
  }

  const groups = groupEntries(sorted);

  return (
    <View style={styles.screen}>
      <OrbRefresh onRefresh={() => {}} contentContainerStyle={{ paddingTop: insets.top + 34, paddingBottom: 110 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>Reflect on your patterns</Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => setSearching(true)}>
            <SearchIcon color={colors.ink2} />
          </Pressable>
        </View>

        <View style={styles.list}>
          {sorted.length === 0 ? (
            <Text style={styles.empty}>A quiet page. Tap "New Entry" to begin a reflection.</Text>
          ) : (
            groups.map((g) => {
              const gm = g.moodId ? getMoodById(g.moodId) : null;
              return (
                <View key={g.label}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupLabel}>{g.label.toUpperCase()}</Text>
                    {gm && <View style={[styles.groupDot, { backgroundColor: gm.color }]} />}
                  </View>
                  <View style={{ gap: 9 }}>
                    {g.items.map((e) => (
                      <EntryCard key={e.id} entry={e} weekdayOnly onPress={() => router.push({ pathname: '/journal-read', params: { id: e.id } })} />
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </OrbRefresh>

      <View style={[styles.newWrap, { bottom: 46 }]}>
        <Pressable style={styles.newBtn} onPress={() => router.push('/journal-entry')}>
          <PlusIcon color={colors.accentText} />
          <Text style={styles.newText}>New Entry</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Search / filter ──────────────────────────────────────────
function JournalSearch({ onBack, entries }: { onBack: () => void; entries: ReturnType<typeof useJournalEntries> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const moods = useMoods();
  const [q, setQ] = useState('');
  const [range, setRange] = useState<'all' | '7' | 'month'>('all');
  const [picked, setPicked] = useState<string[]>([]);

  const now = Date.now();
  const monthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); })();
  const results = entries.filter((e) => {
    if (q && !e.text.toLowerCase().includes(q.toLowerCase())) return false;
    if (picked.length && (!e.moodId || !picked.includes(e.moodId))) return false;
    const ts = e.updatedAt || e.ts;
    if (range === '7' && ts < now - 7 * DAY) return false;
    if (range === 'month' && ts < monthStart) return false;
    return true;
  });
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const dirty = q || range !== 'all' || picked.length > 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.searchTop, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.iconBtn} onPress={onBack}>
          <ChevronLeftIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.searchBox}>
          <SearchIcon color={colors.ink3} size={15} />
          <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Search reflections" placeholderTextColor={colors.ink3} style={styles.searchInput} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
        <View style={styles.rangeRow}>
          {(['all', '7', 'month'] as const).map((k) => {
            const label = k === 'all' ? 'All time' : k === '7' ? 'Last 7 days' : 'This month';
            const on = range === k;
            return (
              <Pressable key={k} onPress={() => setRange(k)} style={[styles.rangeChip, on && styles.rangeChipOn]}>
                <Text style={[styles.rangeText, on && styles.rangeTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.moodChips}>
          {moods.map((m) => {
            const on = picked.includes(m.id);
            return (
              <Pressable
                key={m.id}
                onPress={() => toggle(m.id)}
                style={[styles.moodChip, { backgroundColor: m.color }, on && styles.moodChipOn, { opacity: on || !picked.length ? 1 : 0.4 }]}
              />
            );
          })}
        </View>
        <Text style={styles.resultCount}>{results.length} RESULT{results.length === 1 ? '' : 'S'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120, gap: 10 }}>
        {results.map((e) => (
          <EntryCard key={e.id} entry={e} onPress={() => router.push({ pathname: '/journal-read', params: { id: e.id } })} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 12 },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  title: { fontFamily: fonts.light, fontSize: 32, letterSpacing: -0.5, color: colors.ink1 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink3, marginTop: 6 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.serifItalic, fontSize: 14.5, color: colors.ink3, textAlign: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 16, paddingBottom: 10, paddingHorizontal: 6 },
  groupLabel: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.2, color: colors.ink3 },
  groupDot: { width: 9, height: 9, borderRadius: 4.5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  newWrap: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16 },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 16, ...buttonShadow },
  newText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
  // search
  searchTop: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink1, padding: 0 },
  rangeRow: { flexDirection: 'row', gap: 7, marginTop: 6 },
  rangeChip: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13 },
  rangeChipOn: { backgroundColor: colors.ink1, borderColor: 'transparent' },
  rangeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink2 },
  rangeTextOn: { color: colors.bg },
  moodChips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 14 },
  moodChip: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  moodChipOn: { borderColor: colors.ink1 },
  resultCount: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.ink3, marginTop: 16, marginBottom: 6 },
});
