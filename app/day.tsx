import { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import BackButton from '../components/BackButton';
import MoodDot from '../components/MoodDot';
import MealCard from '../components/MealCard';
import { dayTotals, dominantMood, kcalOf, hexA } from '../constants/data';
import { listMealsForDate } from '../services/meals';
import { useProfile } from '../store/profile';
import { getMoodById } from '../store/moods';
import { colors, fonts } from '../constants/theme';
import type { Meal } from '../types';

export default function DayViewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const showCal = useProfile().showCalories;

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const dateKey = params.date || todayKey;
  const isToday = dateKey === todayKey;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      listMealsForDate(dateKey)
        .then((m) => { if (active) setMeals(m); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [dateKey]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { setMeals(await listMealsForDate(dateKey)); } catch { /* ignore */ }
    setRefreshing(false);
  }, [dateKey]);

  const moodMeals = meals.filter((m) => m.mood);
  const dom = moodMeals.length ? dominantMood(moodMeals) : null;
  const mood = dom ? getMoodById(dom) : null;
  const tintColor = mood?.color ?? colors.chip;
  const totals = dayTotals(meals);
  const totalCal = meals.reduce((a, m) => a + (m.calories ?? kcalOf(m.macros)), 0);
  const latestFirst = meals.slice().reverse();

  const summary: [string, number, string][] = [
    ...(showCal ? ([['', totalCal, ' cal']] as [string, number, string][]) : []),
    ['Protein', totals.protein, 'g'],
    ['Carbs', totals.carbs, 'g'],
    ['Fat', totals.fat, 'g'],
  ];

  return (
    <View style={styles.screen}>
      <LinearGradient colors={[hexA(tintColor, 0.16), colors.bg]} locations={[0, 0.42]} style={StyleSheet.absoluteFill} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink3} />}
      >
        <Text style={styles.eyebrow}>{isToday ? 'TODAY' : 'DAY VIEW'}</Text>
        <Text style={styles.title}>{format(parseISO(dateKey), 'EEEE, MMMM d')}</Text>

        <View style={styles.moodRow}>
          {mood ? <MoodDot moodId={mood.id} size={62} /> : <View style={styles.noMoodDot} />}
          <View>
            <Text style={styles.moodCaption}>Your mood {isToday ? 'today' : 'this day'}</Text>
            <Text style={styles.moodLabel}>{mood ? mood.label : 'Not logged yet'}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          {summary.map(([label, value, unit], i) => (
            <View key={label + unit} style={styles.summaryItem}>
              {i > 0 && <View style={styles.summaryDot} />}
              <Text style={styles.summaryText}>
                {label ? `${label} ` : ''}
                <Text style={styles.summaryValue}>{value}{unit}</Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {loading ? (
          <ActivityIndicator color={colors.ink3} style={{ marginTop: 30 }} />
        ) : meals.length === 0 ? (
          <Text style={styles.empty}>No meals logged this day.</Text>
        ) : (
          <>
            <Text style={styles.mealsCount}>{meals.length} {meals.length === 1 ? 'MEAL' : 'MEALS'}</Text>
            <View style={{ gap: 12 }}>
              {latestFirst.map((m) => (
                <MealCard
                  key={m.id}
                  meal={m}
                  photo={64}
                  showCal={showCal}
                  onPress={() =>
                    m.mood
                      ? router.push({ pathname: '/breakdown', params: { mealId: m.id } })
                      : router.push({ pathname: '/mood-picker', params: { mealId: m.id } })
                  }
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  title: { fontFamily: fonts.light, fontSize: 27, letterSpacing: -0.4, color: colors.ink1, marginTop: 8 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 20 },
  noMoodDot: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed' },
  moodCaption: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  moodLabel: { fontFamily: fonts.regular, fontSize: 20, color: colors.ink1, marginTop: 2 },
  summary: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  summaryDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.ink3, opacity: 0.5, marginHorizontal: 10 },
  summaryText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  summaryValue: { fontFamily: fonts.medium, color: colors.ink2 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 20 },
  mealsCount: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3, marginBottom: 12 },
  empty: { fontFamily: fonts.serifItalic, fontSize: 14, color: colors.ink3, textAlign: 'center', marginTop: 24 },
});
