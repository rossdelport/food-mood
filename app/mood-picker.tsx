import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '../components/BackButton';
import { CheckIcon } from '../components/NavIcons';
import { MOODS, MOOD_ORDER, hexA } from '../constants/data';
import { colors, fonts, radius as radii, buttonShadow } from '../constants/theme';

// Post-capture: pick how a meal left you feeling.
export default function MoodPickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { img } = useLocalSearchParams<{ img?: string }>();
  const [sel, setSel] = useState<string | null>(null);

  const tint = sel ? MOODS[sel].color : null;

  // Continue button slide-up.
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: sel ? 1 : 0,
      duration: sel ? 420 : 220,
      useNativeDriver: true,
    }).start();
  }, [sel, slide]);

  const moods = MOOD_ORDER.map((id) => MOODS[id]);

  return (
    <View style={styles.screen}>
      {tint && (
        <LinearGradient
          colors={[hexA(tint, 0.16), colors.bg]}
          locations={[0, 0.46]}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
      </View>

      <View style={styles.heading}>
        <Text style={styles.eyebrow}>NEW ENTRY</Text>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.sub}>Choose the colour that fits this meal.</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 150 }}
      >
        <View style={{ gap: 8 }}>
          {moods.map((mood) => {
            const active = sel === mood.id;
            const dim = sel != null && !active;
            const size = active ? 78 : 70;
            return (
              <Pressable
                key={mood.id}
                onPress={() => setSel(mood.id)}
                style={[styles.row, active && styles.rowActive, { opacity: dim ? 0.42 : 1 }]}
              >
                <View style={[styles.orb, { width: size, height: size, borderRadius: size / 2, backgroundColor: mood.color }]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.55 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
                  />
                  {active && <CheckIcon color={mood.darkText ? mood.ink : '#fff'} />}
                </View>
                <View>
                  <Text style={[styles.moodLabel, active && { fontFamily: fonts.medium }]}>{mood.label}</Text>
                  <Text style={styles.moodSub}>{mood.sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.continueWrap,
          { paddingBottom: insets.bottom + 16 },
          { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [140, 0] }) }] },
        ]}
        pointerEvents={sel ? 'auto' : 'none'}
      >
        <LinearGradient colors={['transparent', colors.bg]} locations={[0, 0.5]} style={StyleSheet.absoluteFill} />
        <Pressable
          style={styles.continueBtn}
          onPress={() => sel && router.push({ pathname: '/breakdown', params: { mode: 'new', mood: sel, img: img ?? '' } })}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20, paddingBottom: 0 },
  heading: { paddingHorizontal: 28, paddingTop: 22, paddingBottom: 8 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  title: { fontFamily: fonts.light, fontSize: 28, letterSpacing: -0.4, color: colors.ink1, marginTop: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3, marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: radii.base + 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowActive: {
    backgroundColor: colors.card,
    borderColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  moodLabel: { fontFamily: fonts.regular, fontSize: 19, letterSpacing: -0.2, color: colors.ink1 },
  moodSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3, marginTop: 2 },
  continueWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 24 },
  continueBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    paddingVertical: 17,
    alignItems: 'center',
    ...buttonShadow,
  },
  continueText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
});
