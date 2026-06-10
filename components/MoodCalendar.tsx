import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { startOfMonth, addMonths, getDaysInMonth, startOfDay, format } from 'date-fns';
import { useMoodDays, useMealDays } from '../store/moodDays';
import { getMoodById } from '../store/moods';
import { colors, fonts, radius as radii } from '../constants/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = { onDay?: (dateKey: string) => void };

// Monthly mood calendar from real logged moods. Past/today days with a logged
// mood are filled; future and un-logged days are plain.
export default function MoodCalendar({ onDay }: Props) {
  const moodDays = useMoodDays();
  const mealDays = useMealDays();
  const [off, setOff] = useState(0);
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const base = addMonths(startOfMonth(today), off);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysIn = getDaysInMonth(base);
  const lead = (base.getDay() + 6) % 7; // Monday-first

  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>MOOD CALENDAR</Text>
      <View style={styles.nav}>
        <Arrow dir="left" onPress={() => setOff(off - 1)} />
        <Text style={styles.monthLabel}>{format(base, 'MMMM yyyy')}</Text>
        <Arrow dir="right" onPress={() => setOff(off + 1)} />
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.cell}>
            <Text style={styles.weekday}>{w}</Text>
          </View>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <View key={`b${i}`} style={styles.cell} />;
          const date = new Date(year, month, d);
          const key = format(date, 'yyyy-MM-dd');
          const isFuture = startOfDay(date) > startOfDay(today);
          const moodId = !isFuture ? moodDays[key] : undefined;
          const mood = moodId ? getMoodById(moodId) : null;
          const hasMeal = !isFuture && !!mealDays[key];
          const isToday = key === todayKey;
          const r = Math.max(7, radii.base);
          return (
            <Pressable key={d} style={styles.cell} disabled={isFuture} onPress={() => !isFuture && onDay?.(key)}>
              <View
                style={[
                  styles.tile,
                  { borderRadius: r },
                  mood ? { backgroundColor: mood.color } : styles.tileEmpty,
                  isToday && styles.tileToday,
                ]}
              >
                {mood && (
                  <LinearGradient colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.55 }} style={[StyleSheet.absoluteFill, { borderRadius: r }]} />
                )}
                <Text
                  style={[
                    styles.dayNum,
                    isToday && styles.dayNumToday,
                    { color: mood ? (mood.darkText ? mood.ink : '#fff') : isFuture ? colors.ink3 : colors.ink1 },
                  ]}
                >
                  {d}
                </Text>
                {hasMeal && !mood && <View style={styles.pendingMark} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Arrow({ dir, onPress }: { dir: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.arrow} hitSlop={8}>
      <Svg width={8} height={14} viewBox="0 0 9 16" fill="none" style={{ transform: [{ rotate: dir === 'left' ? '0deg' : '180deg' }] }}>
        <Path d="M7.5 1L1 8l6.5 7" stroke={colors.ink2} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3, marginBottom: 14, paddingLeft: 2 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  monthLabel: { fontFamily: fonts.regular, fontSize: 17, color: colors.ink1, letterSpacing: -0.2 },
  arrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, padding: 3, alignItems: 'center', justifyContent: 'center' },
  weekday: { fontFamily: fonts.medium, fontSize: 10, color: colors.ink3, paddingBottom: 2 },
  tile: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tileEmpty: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  tileToday: { borderWidth: 2, borderColor: colors.ink1 },
  dayNum: { fontFamily: fonts.regular, fontSize: 13 },
  dayNumToday: { fontFamily: fonts.semibold },
  pendingMark: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.ink3 },
});
