import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { CAL_TODAY, MONTH_NAMES, MOODS, monthDayMood } from '../constants/data';
import { colors, fonts, radius as radii } from '../constants/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Monthly mood calendar — past days filled with that day's dominant mood color,
// today ringed, future/un-logged days plain white.
export default function MoodCalendar() {
  const [off, setOff] = useState(0);
  const base = new Date(CAL_TODAY.y, CAL_TODAY.m + off, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first

  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  const isToday = (d: number) => year === CAL_TODAY.y && month === CAL_TODAY.m && d === CAL_TODAY.d;

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>MOOD CALENDAR</Text>
      <View style={styles.nav}>
        <Arrow dir="left" onPress={() => setOff(off - 1)} />
        <Text style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</Text>
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
          const moodId = monthDayMood(year, month, d);
          const mood = moodId ? MOODS[moodId] : null;
          const today = isToday(d);
          return (
            <View key={d} style={styles.cell}>
              <View
                style={[
                  styles.tile,
                  { borderRadius: Math.max(7, radii.base) },
                  mood ? { backgroundColor: mood.color } : styles.tileEmpty,
                  today && styles.tileToday,
                ]}
              >
                {mood && (
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.55 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: Math.max(7, radii.base) }]}
                  />
                )}
                <Text
                  style={[
                    styles.dayNum,
                    today && styles.dayNumToday,
                    { color: mood ? (mood.darkText ? mood.ink : '#fff') : colors.ink1 },
                  ]}
                >
                  {d}
                </Text>
              </View>
            </View>
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
  tile: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileEmpty: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  tileToday: { borderWidth: 2, borderColor: colors.ink1 },
  dayNum: { fontFamily: fonts.regular, fontSize: 12 },
  dayNumToday: { fontFamily: fonts.semibold },
});
