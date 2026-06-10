import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '../components/BackButton';
import MoodDot from '../components/MoodDot';
import MealCard from '../components/MealCard';
import { WEEK, mealsForDay, dayTotals, dominantMood, kcalOf, hexA } from '../constants/data';
import { useMeals } from '../store/meals';
import { useProfile } from '../store/profile';
import { getMoodById } from '../store/moods';
import { colors, fonts } from '../constants/theme';

// High-level story of a single day. No charts, no insights — just the mood and meals.
export default function DayViewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const todayMeals = useMeals();
  const showCal = useProfile().showCalories;

  const wd = WEEK.find((d) => d.label === day) ?? WEEK.find((d) => d.today) ?? WEEK[1];
  const meals = wd.today ? todayMeals : mealsForDay(wd.label);
  const dom = meals.length ? dominantMood(meals) : 'calm';
  const mood = getMoodById(dom) ?? getMoodById('calm')!;
  const totals = dayTotals(meals);
  const totalCal = meals.reduce((a, m) => a + kcalOf(m.macros), 0);
  const latestFirst = meals.slice().reverse();

  const summary: [string, number, string][] = [
    ...(showCal ? ([['', totalCal, ' cal']] as [string, number, string][]) : []),
    ['Protein', totals.protein, 'g'],
    ['Carbs', totals.carbs, 'g'],
    ['Fat', totals.fat, 'g'],
  ];

  return (
    <View style={styles.screen}>
      <LinearGradient colors={[hexA(mood.color, 0.16), colors.bg]} locations={[0, 0.42]} style={StyleSheet.absoluteFill} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Text style={styles.eyebrow}>{wd.today ? 'TODAY' : 'DAY VIEW'}</Text>
        <Text style={styles.title}>{wd.date}</Text>

        <View style={styles.moodRow}>
          <MoodDot moodId={dom} size={62} />
          <View>
            <Text style={styles.moodCaption}>Your mood {wd.today ? 'today' : 'this day'}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </View>
        </View>

        {/* daily macro summary — context, not the focus */}
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

        <Text style={styles.mealsCount}>{meals.length} MEALS</Text>
        <View style={{ gap: 12 }}>
          {latestFirst.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              photo={64}
              showCal={showCal}
              onPress={() => router.push({ pathname: '/breakdown', params: { mode: 'meal', mealId: m.id } })}
            />
          ))}
        </View>
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
  moodCaption: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  moodLabel: { fontFamily: fonts.regular, fontSize: 20, color: colors.ink1, marginTop: 2 },
  summary: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  summaryDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.ink3, opacity: 0.5, marginHorizontal: 10 },
  summaryText: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  summaryValue: { fontFamily: fonts.medium, color: colors.ink2 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 20 },
  mealsCount: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3, marginBottom: 12 },
});
