import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getMoodById } from '../store/moods';

type Props = {
  moodId: string;
  size?: number;
  /** Glossy sheen + drop shadow. Off => flat fill (used for tiny inline dots). */
  ring?: boolean;
  color?: string; // override (e.g. live editor preview)
};

// A filled mood circle — the emotional anchor. The "glossy" look is approximated
// with a subtle dark inner border, a soft drop shadow, and a white top highlight.
export default function MoodDot({ moodId, size = 48, ring = true, color }: Props) {
  const fill = color ?? getMoodById(moodId)?.color ?? '#CCC';
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
        },
        ring && styles.ring,
        ring && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        },
      ]}
    >
      {ring && (
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.55 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
});
