import { Pressable, View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { hSelect } from '../services/haptics';

// Small iOS-style switch.
export default function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => { hSelect(); onChange(!on); }}
      style={[styles.track, { backgroundColor: on ? colors.accent : colors.line, justifyContent: on ? 'flex-end' : 'flex-start' }]}
    >
      <View style={styles.knob} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 48, height: 29, borderRadius: 999, padding: 3, flexDirection: 'row' },
  knob: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
});
