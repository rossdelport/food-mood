import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CloseIcon } from '../components/NavIcons';
import { startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { getEntry, saveEntry } from '../store/journal';
import { useMoods } from '../store/moods';
import { fmtDate, nowTime } from '../constants/journalData';
import { colors, fonts, radius as radii } from '../constants/theme';
import type { JournalEntry, JournalLink } from '../types';

export default function JournalEntryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const moods = useMoods();

  const [draft, setDraft] = useState<JournalEntry>(() => {
    const existing = id ? getEntry(id) : undefined;
    if (existing) return { ...existing };
    const ts = Date.now();
    return { id: `j${ts.toString(36)}`, ts, updatedAt: ts, moodId: null, link: null, text: '', date: fmtDate(ts), time: nowTime() };
  });
  const [linking, setLinking] = useState(false);

  const canSave = draft.text.trim().length > 0 && !!draft.moodId;
  // Current week, Monday → Sunday, with today shown as "Today".
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const linkOptions: JournalLink[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return { label: `${isSameDay(d, new Date()) ? 'Today' : format(d, 'EEEE')} meals` };
  });
  const status = canSave ? 'Saved' : draft.text.trim() && !draft.moodId ? 'Pick a feeling' : '';

  const close = () => {
    if (canSave) saveEntry(draft);
    router.back();
  };
  const save = () => {
    if (!canSave) return;
    saveEntry(draft);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={close}>
          <CloseIcon color={colors.ink2} size={15} />
        </Pressable>
        <Text style={styles.status}>{status}</Text>
        <Pressable style={[styles.saveBtn, !canSave && styles.saveBtnOff]} onPress={save} disabled={!canSave}>
          <Text style={[styles.saveText, !canSave && styles.saveTextOff]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 40 }}>
        <Text style={styles.dateEyebrow}>{draft.date.toUpperCase()}</Text>

        <Text style={styles.prompt}>How were you feeling?</Text>
        <View style={styles.moodGrid}>
          {moods.map((m) => {
            const mid = m.id;
            const on = draft.moodId === mid;
            const dim = draft.moodId != null && !on;
            return (
              <Pressable
                key={mid}
                style={[styles.moodItem, { opacity: dim ? 0.5 : 1 }]}
                onPress={() => setDraft((d) => ({ ...d, moodId: on ? null : mid }))}
              >
                <View style={[styles.moodOrb, { backgroundColor: m.color }, on && styles.moodOrbOn]} />
                <Text style={[styles.moodName, on && styles.moodNameOn]} numberOfLines={1}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* link */}
        <View style={{ marginTop: 18, flexDirection: 'row' }}>
          {draft.link ? (
            <View style={styles.linkActive}>
              <Text style={styles.linkActiveText}>↳ {draft.link.label}</Text>
              <Pressable style={styles.linkRemove} onPress={() => setDraft((d) => ({ ...d, link: null }))}>
                <Text style={styles.linkRemoveText}>×</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.linkAdd} onPress={() => setLinking(true)}>
              <Text style={styles.linkAddText}>↳ Link to a meal or day</Text>
            </Pressable>
          )}
        </View>

        {/* writing space */}
        <TextInput
          value={draft.text}
          onChangeText={(text) => setDraft((d) => ({ ...d, text }))}
          autoFocus
          multiline
          placeholder="What did you notice today?"
          placeholderTextColor={colors.ink3}
          style={styles.textArea}
        />
      </ScrollView>

      {/* link picker sheet */}
      <Modal visible={linking} transparent animationType="fade" onRequestClose={() => setLinking(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setLinking(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetGrip} />
            <Text style={styles.sheetTitle}>LINK A DAY</Text>
            <View style={{ gap: 6 }}>
              {linkOptions.map((o) => (
                <Pressable key={o.label} style={styles.linkOption} onPress={() => { setDraft((d) => ({ ...d, link: o })); setLinking(false); }}>
                  <Text style={styles.linkOptionText}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  status: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  saveBtn: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18 },
  saveBtnOff: { backgroundColor: colors.chip },
  saveText: { fontFamily: fonts.medium, fontSize: 14, color: colors.accentText },
  saveTextOff: { color: colors.ink3 },
  dateEyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.ink3 },
  prompt: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3, marginTop: 16 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, rowGap: 16 },
  moodItem: { width: '20%', alignItems: 'center', gap: 7 },
  moodOrb: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  moodOrbOn: { borderColor: colors.ink1, transform: [{ scale: 1.08 }] },
  moodName: { fontFamily: fonts.regular, fontSize: 9.5, textAlign: 'center', color: colors.ink3, letterSpacing: 0.1 },
  moodNameOn: { fontFamily: fonts.semibold, color: colors.ink1 },
  linkActive: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.chip, borderRadius: 999, paddingVertical: 7, paddingLeft: 13, paddingRight: 7 },
  linkActiveText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink2 },
  linkRemove: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  linkRemoveText: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink2, lineHeight: 16 },
  linkAdd: { borderWidth: 1, borderColor: colors.ink3, borderStyle: 'dashed', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  linkAddText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink2 },
  textArea: { marginTop: 22, minHeight: 280, fontFamily: fonts.serif, fontSize: 18, lineHeight: 29, letterSpacing: 0.1, color: colors.ink1, textAlignVertical: 'top' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.34)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 18, paddingTop: 14 },
  sheetGrip: { width: 40, height: 5, borderRadius: 99, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.ink3, marginHorizontal: 6, marginBottom: 10 },
  linkOption: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radii.card, paddingVertical: 13, paddingHorizontal: 15 },
  linkOptionText: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink1 },
});
