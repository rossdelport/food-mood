import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { startOfWeek, addDays, format } from 'date-fns';
import { useMoodDays } from '../store/moodDays';
import { getMoodById } from '../store/moods';
import { colors, fonts, radius as radii } from '../constants/theme';

type Props = {
  onDay?: (dateKey: string) => void;
};

const LABELS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

// 7-day mood spectrum for the current week, blended from real logged moods.
// Days with no logged mood read as a soft neutral.
export default function WeekSpectrum({ onDay }: Props) {
  const moodDays = useMoodDays();
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const days = LABELS.map((label, i) => {
    const date = addDays(weekStart, i);
    const key = format(date, 'yyyy-MM-dd');
    return { label, key, moodId: moodDays[key] as string | undefined, isToday: key === todayKey };
  });

  const gradColors = days.map((d) => (d.moodId ? getMoodById(d.moodId)?.color ?? colors.chip : colors.chip)) as [string, string, ...string[]];
  const locations = days.map((_, i) => (i + 0.5) / 7) as [number, number, ...number[]];
  const todayIdx = days.findIndex((d) => d.isToday);
  const todayLeft = `${((todayIdx + 0.5) / 7) * 100}%` as const;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THIS WEEK</Text>
        <Text style={styles.journey}>Mood journey</Text>
      </View>

      <View style={[styles.barWrap, { borderRadius: radii.base + 2 }]}>
        <LinearGradient colors={gradColors} locations={locations} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.4 }} style={StyleSheet.absoluteFill} />
        <View style={[styles.todayLine, { left: todayLeft }]} />
        <View style={[styles.todayDot, { left: todayLeft }]} />
        <View style={styles.regions}>
          {days.map((d) => (
            <Pressable key={d.key} style={styles.region} onPress={() => onDay?.(d.key)} />
          ))}
        </View>
      </View>

      <View style={styles.labels}>
        {days.map((d) => (
          <Pressable key={d.key} style={styles.labelBtn} onPress={() => onDay?.(d.key)}>
            <Text style={[styles.label, d.isToday && styles.labelToday]}>{d.label}</Text>
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
  todayLine: { position: 'absolute', top: 6, bottom: 6, width: 2, marginLeft: -1, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' },
  todayDot: { position: 'absolute', top: -3, width: 6, height: 6, marginLeft: -3, borderRadius: 3, backgroundColor: colors.ink1 },
  regions: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  region: { flex: 1 },
  labels: { flexDirection: 'row', marginTop: 7 },
  labelBtn: { flex: 1, alignItems: 'center' },
  label: { fontFamily: fonts.light, fontSize: 11, letterSpacing: 0.2, color: colors.ink3 },
  labelToday: { fontFamily: fonts.semibold, color: colors.ink1 },
});
