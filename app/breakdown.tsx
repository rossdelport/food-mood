import { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import BackButton from '../components/BackButton';
import MoodDot from '../components/MoodDot';
import MacroBar from '../components/MacroBar';
import { macroGrams, kcalOf } from '../constants/data';
import { getMealById } from '../services/meals';
import { useProfile } from '../store/profile';
import { getMoodById } from '../store/moods';
import { colors, fonts, radius as radii, buttonShadow, macroColors } from '../constants/theme';
import type { Meal } from '../types';

export default function BreakdownScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showCal = useProfile().showCalories;
  const { mealId } = useLocalSearchParams<{ mealId?: string }>();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (mealId ? getMealById(mealId) : Promise.resolve(null))
        .then((m) => { if (active) setMeal(m); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [mealId]),
  );

  const mood = meal?.mood ? getMoodById(meal.mood) : null;
  const macros = meal?.macros ?? { protein: 0, carbs: 0, fat: 0 };
  const total = macroGrams(macros);
  const calories = meal ? meal.calories ?? kcalOf(macros) : 0;
  const insight = mood
    ? `${mood.label} meals like this tend to sit lighter on carbs.`
    : 'Log how this meal made you feel to start seeing patterns.';

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      {loading || !meal ? (
        <View style={styles.center}>
          {loading ? <ActivityIndicator color={colors.ink3} /> : <Text style={styles.empty}>Meal not found.</Text>}
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 140 }}>
            <Text style={styles.eyebrow}>{meal.time.toUpperCase()}</Text>
            <Text style={styles.title}>{meal.title}</Text>

            <View style={styles.moodRow}>
              <View style={styles.moodOrbWrap}>
                {mood ? <MoodDot moodId={mood.id} size={56} /> : <View style={styles.noMoodDot} />}
                {meal.img ? <Image source={{ uri: meal.img }} style={styles.moodPhoto} contentFit="cover" transition={200} /> : null}
              </View>
              <View>
                <Text style={styles.moodCaption}>{mood ? 'Logged feeling' : 'No mood yet'}</Text>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink3 },
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
