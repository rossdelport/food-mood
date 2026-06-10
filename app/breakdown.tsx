import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '../components/BackButton';
import MoodDot from '../components/MoodDot';
import MacroBar from '../components/MacroBar';
import { WEEK, TODAY, macroGrams, kcalOf, dayTotals, dominantMood, mealsForDay } from '../constants/data';
import { useMeals } from '../store/meals';
import { useProfile } from '../store/profile';
import { getMoodById } from '../store/moods';
import { colors, fonts, radius as radii, buttonShadow, macroColors } from '../constants/theme';
import type { Macros, Meal } from '../types';

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

const caloriesOf = (m: { macros: Macros; calories?: number }) => m.calories ?? kcalOf(m.macros);

export default function BreakdownScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const todayMeals = useMeals();
  const showCal = useProfile().showCalories;
  const params = useLocalSearchParams<{ mode?: string; mealId?: string }>();
  const isDay = params.mode === 'day';

  const meal = !isDay ? findMeal(params.mealId, todayMeals) : undefined;
  const macros: Macros = isDay ? dayTotals(todayMeals) : meal?.macros ?? { protein: 0, carbs: 0, fat: 0 };
  const calories = isDay ? todayMeals.reduce((a, m) => a + caloriesOf(m), 0) : meal ? caloriesOf(meal) : 0;

  const moodMeals = todayMeals.filter((m) => m.mood);
  const moodId = isDay ? (moodMeals.length ? dominantMood(moodMeals) : null) : meal?.mood ?? null;
  const mood = moodId ? getMoodById(moodId) : null;

  const eyebrow = isDay ? TODAY : meal?.time ?? '';
  const title = isDay ? "Today's macros" : meal?.title ?? 'Meal';
  const total = macroGrams(macros);
  const insight = isDay
    ? 'Your higher-protein days lean toward your energetic moods.'
    : mood
      ? `${mood.label} meals like this tend to sit lighter on carbs.`
      : 'Log how this meal made you feel to start seeing patterns.';

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 140 }}>
        <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>

        {/* mood + overlapping photo (single-meal views) */}
        <View style={styles.moodRow}>
          <View style={styles.moodOrbWrap}>
            {mood ? <MoodDot moodId={mood.id} size={56} /> : <View style={styles.noMoodDot} />}
            {!isDay && meal?.img ? (
              <Image source={{ uri: meal.img }} style={styles.moodPhoto} contentFit="cover" transition={200} />
            ) : null}
          </View>
          <View>
            <Text style={styles.moodCaption}>{isDay ? 'Your mood today' : mood ? 'Logged feeling' : 'No mood yet'}</Text>
            <Text style={styles.moodLabel}>{mood ? mood.label : 'Pending check-in'}</Text>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <MacroBar macros={macros} height={20} radius={radii.base} colors={macroColors} />
          <View style={styles.barFooter}>
            <Text style={styles.barFooterText}>{total} g total</Text>
            {showCal && <Text style={styles.barFooterText}>{calories} cal</Text>}
          </View>
        </View>

        <View style={{ marginTop: 26 }}>
          {([
            ['Protein', macros.protein, macroColors.protein],
            ['Carbs', macros.carbs, macroColors.carbs],
            ['Fat', macros.fat, macroColors.fat],
          ] as [string, number, string][]).map(([label, v, c], i) => (
            <View key={label} style={[styles.numRow, i > 0 && styles.numRowDivider]}>
              <View style={[styles.numDot, { backgroundColor: c }]} />
              <Text style={styles.numLabel}>{label}</Text>
              <Text style={styles.numPct}>{total ? Math.round((v / total) * 100) : 0}%</Text>
              <Text style={styles.numValue}>{v}<Text style={styles.numUnit}> g</Text></Text>
            </View>
          ))}
        </View>

        <View style={styles.insight}>
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.doneBtn} onPress={() => router.dismissAll()}>
          <Text style={styles.doneText}>Done</Text>
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
  noMoodDot: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed' },
  moodPhoto: { width: 56, height: 56, borderRadius: 28, marginLeft: -14, borderWidth: 2, borderColor: colors.bg },
  moodCaption: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  moodLabel: { fontFamily: fonts.regular, fontSize: 18, color: colors.ink1, marginTop: 2 },
  barFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  barFooterText: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  numRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  numRowDivider: { borderTopWidth: 1, borderTopColor: colors.line },
  numDot: { width: 9, height: 9, borderRadius: 4.5 },
  numLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink1 },
  numPct: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  numValue: { fontFamily: fonts.regular, fontSize: 17, color: colors.ink1, minWidth: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
  numUnit: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  insight: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: colors.chip, borderRadius: radii.button },
  insightText: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24, color: colors.ink2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.bg },
  doneBtn: { backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 17, alignItems: 'center', ...buttonShadow },
  doneText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
});
