import { View, StyleSheet } from 'react-native';
import { MOODS, MOOD_ORDER } from '../constants/data';

// Soft, muted row of mood orbs — a calm motif for empty states.
export default function EmptyOrbs() {
  return (
    <View style={styles.row}>
      {MOOD_ORDER.map((id) => (
        <View key={id} style={[styles.orb, { backgroundColor: MOODS[id].color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 9, alignSelf: 'center', opacity: 0.45, marginBottom: 18 },
  orb: { width: 14, height: 14, borderRadius: 7 },
});
