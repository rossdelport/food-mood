import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '../components/BackButton';
import MoodDot from '../components/MoodDot';
import MacroBar from '../components/MacroBar';
import { WEEK, MOODS, TODAY, macroGrams, kcalOf, dayTotals, dominantMood, mealsForDay } from '../constants/data';
import { detectMacros } from '../services/vision';
import { useMeals, addMeal } from '../store/meals';
import { useProfile } from '../store/profile';
import { getMoodById } from '../store/moods';
import { saveEntry } from '../store/journal';
import { fmtDate, nowTime } from '../constants/journalData';
import { colors, fonts, radius as radii, buttonShadow, macroColors } from '../constants/theme';
import type { Macros, Meal } from '../types';

// Find a meal by id across today's logged meals and the mock per-day builder.
function findMeal(id: string | undefined, today: Meal[]): Meal | undefined {
  if (!id) return undefined;
  const inToday = today.find((m) => m.id === id);
  if (inToday) return inToday;
  for (const d of WEEK) {
    const m = mealsForDay(d.label).find((x) => x.id === id);
    if (m) return m;
  }
  return undefined;
}

export default function BreakdownScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const todayMeals = useMeals();
  const showCal = useProfile().showCalories;
  const params = useLocalSearchParams<{ mode?: string; mealId?: string; mood?: string; img?: string }>();
  const mode = params.mode ?? 'meal';
  const isDay = mode === 'day';
  const isNew = mode === 'new';

  const meal = !isDay && !isNew ? findMeal(params.mealId, todayMeals) : undefined;
  const img = isNew ? params.img || undefined : meal?.img;

  // macros: tapped meal -> known; day -> totals; new capture -> detected (async).
  const [detected, setDetected] = useState<Macros | null>(null);
  useEffect(() => {
    if (isNew && img) detectMacros(img).then(setDetected);
  }, [isNew, img]);

  const macros: Macros | null = isDay
    ? dayTotals(todayMeals)
    : isNew
      ? detected
      : meal?.macros ?? null;

  const moodId = params.mood || (isDay ? dominantMood(todayMeals) : meal?.mood) || 'calm';
  const mood = getMoodById(moodId) ?? MOODS.calm;

  const [note, setNote] = useState('');

  const eyebrow = isDay ? TODAY : isNew ? 'Just now' : meal?.time ?? '';
  const title = isDay ? "Today's macros" : isNew ? 'Your meal' : meal?.title ?? '';
  const insight = isDay
    ? 'Your higher-protein days lean toward your energetic moods.'
    : `${mood.label} meals like this tend to sit lighter on carbs.`;

  const finish = () => {
    if (isNew) {
      // Save the captured meal to today's feed, and the note to the journal.
      if (detected) {
        const time = nowTime();
        addMeal({ id: `meal-${Date.now().toString(36)}`, title: 'Logged meal', time, mood: moodId, img: img ?? '', macros: detected });
      }
      if (note.trim()) {
        const ts = Date.now();
        saveEntry({ id: `j${ts.toString(36)}`, ts, updatedAt: ts, moodId, link: null, text: note, date: fmtDate(ts), time: nowTime() });
      }
      router.dismissAll();
    } else {
      router.back();
    }
  };
  const canFinish = !isNew || !!detected;
  const buttonLabel = isNew ? (note.trim() ? 'Save & Done' : 'Done') : isDay ? 'Done' : 'Back to journal';

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 140 }}
      >
        <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>

        {/* mood indicator (+ overlapping photo on single-meal views) */}
        <View style={styles.moodRow}>
          <View style={styles.moodOrbWrap}>
            <MoodDot moodId={moodId} size={56} />
            {!isDay && img && (
              <Image source={{ uri: img }} style={styles.moodPhoto} contentFit="cover" transition={200} />
            )}
          </View>
          <View>
            <Text style={styles.moodCaption}>{isDay ? 'Your mood today' : 'Logged feeling'}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </View>
        </View>

        {/* stacked bar */}
        <View style={{ marginTop: 30 }}>
          {macros ? (
            <>
              <MacroBar macros={macros} height={20} radius={radii.base} colors={macroColors} />
              <View style={styles.barFooter}>
                <Text style={styles.barFooterText}>{macroGrams(macros)} g total</Text>
                {showCal && <Text style={styles.barFooterText}>{kcalOf(macros)} cal</Text>}
              </View>
            </>
          ) : (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.ink3} />
              <Text style={styles.loadingText}>Reading macros…</Text>
            </View>
          )}
        </View>

        {/* numeric breakdown */}
        {macros && (
          <View style={{ marginTop: 26 }}>
            {([
              ['Protein', macros.protein, macroColors.protein],
              ['Carbs', macros.carbs, macroColors.carbs],
              ['Fat', macros.fat, macroColors.fat],
            ] as [string, number, string][]).map(([label, v, c], i) => (
              <View key={label} style={[styles.numRow, i > 0 && styles.numRowDivider]}>
                <View style={[styles.numDot, { backgroundColor: c }]} />
                <Text style={styles.numLabel}>{label}</Text>
                <Text style={styles.numPct}>{Math.round((v / macroGrams(macros)) * 100)}%</Text>
                <Text style={styles.numValue}>{v}<Text style={styles.numUnit}> g</Text></Text>
              </View>
            ))}
          </View>
        )}

        {/* insight */}
        <View style={styles.insight}>
          <Text style={styles.insightText}>{insight}</Text>
        </View>

        {/* journal note — only when logging a freshly captured meal */}
        {isNew && (
          <View style={{ marginTop: 22 }}>
            <Text style={styles.noteEyebrow}>ADD A NOTE <Text style={styles.noteOptional}>· optional</Text></Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What did this meal leave you feeling?"
              placeholderTextColor={colors.ink3}
              multiline
              style={styles.noteInput}
            />
            <Text style={styles.noteHint}>Saved to your journal with this mood.</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={[styles.doneBtn, !canFinish && { opacity: 0.5 }]} onPress={finish} disabled={!canFinish}>
          <Text style={styles.doneText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  title: { fontFamily: fonts.light, fontSize: 27, letterSpacing: -0.4, color: colors.ink1, marginTop: 8 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 22 },
  moodOrbWrap: { flexDirection: 'row', alignItems: 'center' },
  moodPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: -14,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  moodCaption: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  moodLabel: { fontFamily: fonts.regular, fontSize: 18, color: colors.ink1, marginTop: 2 },
  barFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  barFooterText: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  loadingText: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  numRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  numRowDivider: { borderTopWidth: 1, borderTopColor: colors.line },
  numDot: { width: 9, height: 9, borderRadius: 4.5 },
  numLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink1 },
  numPct: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  numValue: { fontFamily: fonts.regular, fontSize: 17, color: colors.ink1, minWidth: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
  numUnit: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  insight: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: colors.chip, borderRadius: radii.button },
  insightText: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24, color: colors.ink2 },
  noteEyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.ink3, marginBottom: 8 },
  noteOptional: { fontFamily: fonts.regular, letterSpacing: 0 },
  noteInput: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radii.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink1,
    textAlignVertical: 'top',
  },
  noteHint: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.ink3, marginTop: 8, marginHorizontal: 2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.bg },
  doneBtn: { backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 17, alignItems: 'center', ...buttonShadow },
  doneText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
});
