import { View, StyleSheet } from 'react-native';
import { MOODS, MOOD_ORDER } from '../../constants/data';
import { colors } from '../../constants/theme';

// Brand mark: a small cluster of overlapping mood dots.
export default function OnbLogo({ size = 20 }: { size?: number }) {
  return (
    <View style={styles.row}>
      {MOOD_ORDER.map((id, i) => (
        <View
          key={id}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: MOODS[id].color,
            marginLeft: i ? -size * 0.34 : 0,
            borderWidth: 1.5,
            borderColor: colors.bg,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row' } });
