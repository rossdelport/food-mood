import { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { MOODS, MOOD_ORDER } from '../constants/data';

const COLORS = MOOD_ORDER.map((id) => MOODS[id].color);
const N = COLORS.length;
const SIZE = 18;
const GAP = 14;
const SLOT = SIZE + GAP;
const DIP = 14; // how far the wrapping orb dips down/behind
const MOVE = 620; // travel duration
const PAUSE = 1000; // rest between steps

// Animated mood-orb motif for empty states: the rightmost orb dips down and
// slides behind the others to the front of the line while the rest shift right;
// rests a beat, then repeats — an endless gentle carousel.
export default function EmptyOrbs() {
  const tx = useRef(COLORS.map((_, i) => new Animated.Value(i * SLOT))).current;
  const ty = useRef(COLORS.map(() => new Animated.Value(0))).current;
  const sc = useRef(COLORS.map(() => new Animated.Value(1))).current;
  const slot = useRef(COLORS.map((_, i) => i)).current; // orb index → current slot
  const [behind, setBehind] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      if (!alive) return;
      const wrap = slot.findIndex((s) => s === N - 1); // orb at the rightmost slot
      setBehind(wrap);
      const anims = COLORS.map((_, j) => {
        if (j === wrap) {
          slot[j] = 0;
          return Animated.parallel([
            Animated.timing(tx[j], { toValue: 0, duration: MOVE, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(ty[j], { toValue: DIP, duration: MOVE / 2, useNativeDriver: true }),
              Animated.timing(ty[j], { toValue: 0, duration: MOVE / 2, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(sc[j], { toValue: 0.6, duration: MOVE / 2, useNativeDriver: true }),
              Animated.timing(sc[j], { toValue: 1, duration: MOVE / 2, useNativeDriver: true }),
            ]),
          ]);
        }
        slot[j] += 1;
        return Animated.timing(tx[j], { toValue: slot[j] * SLOT, duration: MOVE, useNativeDriver: true });
      });
      Animated.parallel(anims).start(() => {
        if (!alive) return;
        setBehind(null);
        timer = setTimeout(step, PAUSE);
      });
    };

    timer = setTimeout(step, PAUSE);
    return () => { alive = false; clearTimeout(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.wrap}>
      {COLORS.map((c, i) => (
        <Animated.View
          key={i}
          style={[
            styles.orb,
            { backgroundColor: c, zIndex: behind === i ? 0 : 1, transform: [{ translateX: tx[i] }, { translateY: ty[i] }, { scale: sc[i] }] },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: N * SIZE + (N - 1) * GAP, height: SIZE + DIP * 2, alignSelf: 'center', opacity: 0.7, marginBottom: 22 },
  orb: { position: 'absolute', top: DIP, left: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
});
