import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MOODS, WEEK } from '../constants/data';
import { colors, fonts, radius as radii } from '../constants/theme';
import type { WeekDay } from '../types';

type Props = {
  onDay?: (day: WeekDay) => void;
};

// 7-day mood spectrum — a flowing journey, not discrete blocks. Pure color at
// each day's centre, blended smoothly across the bar.
export default function WeekSpectrum({ onDay }: Props) {
  const gradColors = WEEK.map((d) => MOODS[d.moodId].color) as [string, string, ...string[]];
  const locations = WEEK.map((_, i) => (i + 0.5) / WEEK.length) as [number, number, ...number[]];
  const todayIdx = WEEK.findIndex((d) => d.today);
  const todayLeft = `${((todayIdx + 0.5) / WEEK.length) * 100}%` as const;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THIS WEEK</Text>
        <Text style={styles.journey}>Mood journey</Text>
      </View>

      <View style={[styles.barWrap, { borderRadius: radii.base + 2 }]}>
        <LinearGradient
          colors={gradColors}
          locations={locations}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        {/* soft top sheen for depth */}
        <LinearGradient
          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={StyleSheet.absoluteFill}
        />
        {/* today marker */}
        <View style={[styles.todayLine, { left: todayLeft }]} />
        <View style={[styles.todayDot, { left: todayLeft }]} />
        {/* tappable day regions */}
        <View style={styles.regions}>
          {WEEK.map((d) => (
            <Pressable key={d.label} style={styles.region} onPress={() => onDay?.(d)} />
          ))}
        </View>
      </View>

      <View style={styles.labels}>
        {WEEK.map((d) => (
          <Pressable key={d.label} style={styles.labelBtn} onPress={() => onDay?.(d)}>
            <Text style={[styles.label, d.today && styles.labelToday]}>{d.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 9 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  journey: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.ink3 },
  barWrap: {
    position: 'relative',
    height: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  todayLine: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: 2,
    marginLeft: -1,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  todayDot: {
    position: 'absolute',
    top: -3,
    width: 6,
    height: 6,
    marginLeft: -3,
    borderRadius: 3,
    backgroundColor: colors.ink1,
  },
  regions: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  region: { flex: 1 },
  labels: { flexDirection: 'row', marginTop: 7 },
  labelBtn: { flex: 1, alignItems: 'center' },
  label: { fontFamily: fonts.light, fontSize: 11, letterSpacing: 0.2, color: colors.ink3 },
  labelToday: { fontFamily: fonts.semibold, color: colors.ink1 },
});
