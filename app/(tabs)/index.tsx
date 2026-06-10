import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MoodDot from '../../components/MoodDot';
import MealCard from '../../components/MealCard';
import WeekSpectrum from '../../components/WeekSpectrum';
import MoodCalendar from '../../components/MoodCalendar';
import { colors, fonts } from '../../constants/theme';
import { TODAY, WEEK, dayTotals, dominantMood, kcalOf } from '../../constants/data';
import { useMeals } from '../../store/meals';
import { useProfile } from '../../store/profile';
import { getMoodById } from '../../store/moods';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const meals = useMeals();
  const showCal = useProfile().showCalories;

  const totals = dayTotals(meals);
  const dom = meals.length ? dominantMood(meals) : 'calm';
  const domLabel = getMoodById(dom)?.label ?? '';
  const todayLabel = WEEK.find((d) => d.today)?.label ?? 'T';

  const totalsRow: [string, number, string][] = [
    ...(showCal ? ([['Cal', meals.reduce((a, m) => a + kcalOf(m.macros), 0), '']] as [string, number, string][]) : []),
    ['Protein', totals.protein, 'g'],
    ['Carbs', totals.carbs, 'g'],
    ['Fat', totals.fat, 'g'],
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerTop}>
            <Text style={styles.eyebrow}>TODAY</Text>
            <Pressable style={styles.moodPill} onPress={() => router.push({ pathname: '/day', params: { day: todayLabel } })}>
              <MoodDot moodId={dom} size={18} ring={false} />
              <Text style={styles.moodPillText}>Mostly {domLabel.toLowerCase()}</Text>
            </Pressable>
          </View>

          <Text style={styles.date}>{TODAY}</Text>

          <WeekSpectrum onDay={(d) => router.push({ pathname: '/day', params: { day: d.label } })} />

          {/* macro totals — minimal, right-aligned */}
          <View style={styles.totals}>
            {totalsRow.map(([label, value, unit]) => (
              <View key={label} style={styles.totalItem}>
                <Text style={styles.totalValue}>
                  {value}<Text style={styles.totalUnit}>{unit}</Text>
                </Text>
                <Text style={styles.totalLabel}>{label.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* meal feed */}
        <View style={styles.feed}>
          <View style={{ gap: 10 }}>
            {meals.map((m) => (
              <MealCard
                key={m.id}
                meal={m}
                showCal={showCal}
                onPress={() => router.push({ pathname: '/breakdown', params: { mode: 'meal', mealId: m.id } })}
              />
            ))}
          </View>
          <MoodCalendar />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.chip,
    borderRadius: 999,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 12,
  },
  moodPillText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink2 },
  date: { fontFamily: fonts.light, fontSize: 30, lineHeight: 33, letterSpacing: -0.4, color: colors.ink1, marginTop: 12 },
  totals: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 18 },
  totalItem: { alignItems: 'flex-end' },
  totalValue: { fontFamily: fonts.regular, fontSize: 18, letterSpacing: -0.2, color: colors.ink1, fontVariant: ['tabular-nums'] },
  totalUnit: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  totalLabel: { fontFamily: fonts.regular, fontSize: 10, letterSpacing: 1, color: colors.ink3, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.line, marginHorizontal: 24 },
  feed: { paddingHorizontal: 16, paddingTop: 14 },
});
