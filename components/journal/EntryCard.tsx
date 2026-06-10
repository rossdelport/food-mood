import { View, Text, Pressable, StyleSheet } from 'react-native';
import { getMoodById } from '../../store/moods';
import { colors, fonts, radius as radii } from '../../constants/theme';
import type { JournalEntry } from '../../types';

type Props = {
  entry: JournalEntry;
  onPress: () => void;
  /** List view shows weekday only (group header carries the month). */
  weekdayOnly?: boolean;
};

export default function EntryCard({ entry, onPress, weekdayOnly }: Props) {
  const mood = entry.moodId ? getMoodById(entry.moodId) : null;
  const weekday = (entry.date || '').split(',')[0];
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {mood && <View style={[styles.dot, { backgroundColor: mood.color }]} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        {weekdayOnly ? (
          <Text style={styles.weekday}>
            {weekday}
            <Text style={styles.time}> · {entry.time}</Text>
          </Text>
        ) : (
          <View style={styles.dateRow}>
            <Text style={styles.date}>{entry.date}</Text>
            <Text style={styles.time}>{entry.time}</Text>
          </View>
        )}
        <Text numberOfLines={2} style={styles.preview}>{entry.text}</Text>
        {entry.link && (
          <View style={styles.linkPill}>
            <Text style={styles.linkText}>↳ {entry.link.label}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dot: { width: 22, height: 22, borderRadius: 11, marginTop: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  weekday: { fontFamily: fonts.medium, fontSize: 13.5, letterSpacing: -0.2, color: colors.ink1 },
  date: { fontFamily: fonts.medium, fontSize: 14, letterSpacing: -0.2, color: colors.ink1 },
  time: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  preview: { fontFamily: fonts.light, fontSize: 13, lineHeight: 19.5, color: colors.ink2, marginTop: 5 },
  linkPill: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.chip, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  linkText: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
});
