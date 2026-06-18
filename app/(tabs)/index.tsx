import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import MoodDot from '../../components/MoodDot';
import MealCard from '../../components/MealCard';
import WeekSpectrum from '../../components/WeekSpectrum';
import MoodCalendar from '../../components/MoodCalendar';
import OrbRefresh from '../../components/OrbRefresh';
import EmptyOrbs from '../../components/EmptyOrbs';
import { PlusIcon } from '../../components/NavIcons';
import { colors, fonts, radius as radii, buttonShadow } from '../../constants/theme';
import { dayTotals, dominantMood, kcalOf } from '../../constants/data';
import { useMeals, useMealsLoading, refreshMeals } from '../../store/meals';
import { refreshMoodDays } from '../../store/moodDays';
import { useProfile } from '../../store/profile';
import { getMoodById } from '../../store/moods';

const caloriesOf = (m: { macros: { protein: number; carbs: number; fat: number }; calories?: number }) =>
  m.calories ?? kcalOf(m.macros);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const meals = useMeals();
  const mealsLoading = useMealsLoading();
  const profile = useProfile();
  const showCal = profile.showCalories;
  const targets = profile.targets;

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const goToDay = (dateKey: string) => router.push({ pathname: '/day', params: { date: dateKey } });

  const refresh = useCallback(async () => {
    await Promise.all([refreshMeals(), refreshMoodDays()]);
  }, []);

  // Keep the feed + spectrum + calendar fresh after capture / mood logging.
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const totals = dayTotals(meals);
  const moodMeals = meals.filter((m) => m.mood);
  const dom = moodMeals.length ? dominantMood(moodMeals) : null;
  const domLabel = dom ? getMoodById(dom)?.label ?? '' : '';

  // [label, current, goal, unit]
  const totalsRow: [string, number, number, string][] = [
    ...(showCal ? ([['Cal', meals.reduce((a, m) => a + caloriesOf(m), 0), targets.calories, '']] as [string, number, number, string][]) : []),
    ['Protein', totals.protein, targets.protein, 'g'],
    ['Carbs', totals.carbs, targets.carbs, 'g'],
    ['Fat', totals.fat, targets.fat, 'g'],
  ];

  return (
    <View style={styles.screen}>
      <OrbRefresh onRefresh={refresh} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerTop}>
            <Text style={styles.eyebrow}>TODAY</Text>
            {dom && (
              <Pressable style={styles.moodPill} onPress={() => goToDay(todayKey)}>
                <MoodDot moodId={dom} size={18} ring={false} />
                <Text style={styles.moodPillText}>Mostly {domLabel.toLowerCase()}</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

          <WeekSpectrum onDay={goToDay} />

          {meals.length > 0 && (
            <View style={styles.totals}>
              {totalsRow.map(([label, value, goal, unit]) => (
                <View key={label} style={styles.totalItem}>
                  <Text style={styles.totalValue}>
                    {value}<Text style={styles.totalGoal}> / {goal}{unit}</Text>
                  </Text>
                  <Text style={styles.totalLabel}>{label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* log a meal */}
        <View style={styles.logWrap}>
          <Pressable style={styles.logBtn} onPress={() => router.push('/camera')}>
            <PlusIcon color={colors.accentText} size={17} />
            <Text style={styles.logText}>Log a meal</Text>
          </Pressable>
        </View>

        {/* feed */}
        <View style={styles.feed}>
          {meals.length === 0 ? (
            mealsLoading ? (
              <View style={styles.feedLoading}><ActivityIndicator color={colors.ink3} /></View>
            ) : (
              <View style={styles.emptyWrap}>
                <EmptyOrbs />
                <Text style={styles.empty}>No meals logged yet today. Snap your first one to start your mood journey.</Text>
              </View>
            )
          ) : (
            <View style={{ gap: 10 }}>
              {meals.map((m) => (
                <MealCard
                  key={m.id}
                  meal={m}
                  showCal={showCal}
                  onPress={() =>
                    m.mood
                      ? router.push({ pathname: '/breakdown', params: { mealId: m.id } })
                      : router.push({ pathname: '/mood-picker', params: { mealId: m.id, title: m.title } })
                  }
                />
              ))}
            </View>
          )}
          <MoodCalendar onDay={goToDay} />
        </View>
      </OrbRefresh>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  moodPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.chip, borderRadius: 999, paddingVertical: 6, paddingLeft: 8, paddingRight: 12 },
  moodPillText: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.ink2 },
  date: { fontFamily: fonts.light, fontSize: 30, lineHeight: 33, letterSpacing: -0.4, color: colors.ink1, marginTop: 12 },
  totals: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 18 },
  totalItem: { alignItems: 'flex-end' },
  totalValue: { fontFamily: fonts.regular, fontSize: 18, letterSpacing: -0.2, color: colors.ink1, fontVariant: ['tabular-nums'] },
  totalGoal: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3, fontVariant: ['tabular-nums'] },
  totalLabel: { fontFamily: fonts.regular, fontSize: 10, letterSpacing: 1, color: colors.ink3, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.line, marginHorizontal: 24 },
  logWrap: { paddingHorizontal: 16, paddingTop: 16 },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 16, ...buttonShadow },
  logText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
  feed: { paddingHorizontal: 16, paddingTop: 14 },
  emptyWrap: { paddingTop: 60, paddingBottom: 30, alignItems: 'center' },
  empty: { fontFamily: fonts.serifItalic, fontSize: 14, lineHeight: 21, color: colors.ink3, textAlign: 'center', paddingHorizontal: 24 },
  feedLoading: { paddingVertical: 40, alignItems: 'center' },
});
