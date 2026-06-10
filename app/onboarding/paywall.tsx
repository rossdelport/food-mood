import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MoodDot from '../../components/MoodDot';
import DriftingSpectrum from '../../components/onboarding/DriftingSpectrum';
import { CheckIcon } from '../../components/NavIcons';
import { MOODS } from '../../constants/data';
import { purchasePlan, restorePurchases, type Plan } from '../../store/subscription';
import { showToast } from '../../store/toast';
import { hSelect, hSuccess } from '../../services/haptics';
import { colors, fonts, radius as radii } from '../../constants/theme';

const ACCENT = '#232A33';
const HERO_COLORS: [string, string, ...string[]] = [
  MOODS.energetic.color, MOODS.focused.color, MOODS.calm.color, MOODS.contemplative.color, MOODS.sluggish.color, MOODS.energetic.color,
];

const ORBS: { mood?: string; size: number; left: string; top: string; dur: number; delay: number; amp: number; opacity?: number; hero?: boolean }[] = [
  { hero: true, size: 116, left: '50%', top: '44%', dur: 6.6, delay: 0, amp: 12 },
  { mood: 'energetic', size: 58, left: '19%', top: '15%', dur: 5.2, delay: 0.4, amp: 9 },
  { mood: 'sluggish', size: 62, left: '76%', top: '18%', dur: 5.9, delay: 0.9, amp: 10 },
  { mood: 'contemplative', size: 50, left: '83%', top: '58%', dur: 4.9, delay: 0.2, amp: 8 },
  { mood: 'focused', size: 46, left: '12%', top: '62%', dur: 6.3, delay: 1.1, amp: 9, opacity: 0.85 },
  { mood: 'calm', size: 40, left: '45%', top: '83%', dur: 5.0, delay: 0.6, amp: 7 },
  { mood: 'calm', size: 22, left: '66%', top: '8%', dur: 4.4, delay: 1.4, amp: 6, opacity: 0.7 },
  { mood: 'energetic', size: 18, left: '31%', top: '42%', dur: 4.0, delay: 0.8, amp: 6, opacity: 0.7 },
];

const BENEFITS = [
  'AI insights',
  'Meal recommendations based on mood',
  'Full mood and macro insights',
  'Your entire history, always',
  'Custom moods and goals',
];

function FloatOrb({ spec }: { spec: (typeof ORBS)[number] }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: 1, duration: spec.dur * 1000, delay: spec.delay * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: spec.dur * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [spec.dur, spec.delay, y]);
  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [-spec.amp, spec.amp] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: spec.left as `${number}%`, top: spec.top as `${number}%`, marginLeft: -spec.size / 2, marginTop: -spec.size / 2, opacity: spec.opacity ?? 1, transform: [{ translateY }] }}
    >
      {spec.hero ? (
        <View style={[styles.hero, { width: spec.size, height: spec.size, borderRadius: spec.size / 2 }]}>
          <LinearGradient colors={HERO_COLORS} start={{ x: 0.12, y: 0.1 }} end={{ x: 0.9, y: 0.95 }} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']} start={{ x: 0.4, y: 0 }} end={{ x: 0.5, y: 0.55 }} style={StyleSheet.absoluteFill} />
        </View>
      ) : (
        <MoodDot moodId={spec.mood!} color={MOODS[spec.mood!]?.color} size={spec.size} ring={false} />
      )}
    </Animated.View>
  );
}

function PlanCard({ plan, active, onPick }: { plan: Plan; active: boolean; onPick: () => void }) {
  const yearly = plan === 'yearly';
  return (
    <Pressable style={[styles.card, active && styles.cardActive]} onPress={onPick}>
      <View style={[styles.radio, active && styles.radioOn]}>{active && <CheckIcon color={colors.bg} size={11} />}</View>
      <Text style={styles.cardTitle}>{yearly ? 'Yearly' : 'Lifetime'}</Text>
      {yearly ? <Text style={styles.saveBadge}>SAVE 58%</Text> : <View style={{ height: 19, marginTop: 8 }} />}
      <Text style={styles.price}>
        {yearly ? '$29.99' : '$59.99'}
        <Text style={styles.priceUnit}>{yearly ? ' /year' : ' once'}</Text>
      </Text>
      <Text style={styles.priceSub}>{yearly ? '7-day free trial, then $2.50/mo' : 'One-time payment'}</Text>
    </Pressable>
  );
}

export default function Paywall() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>('yearly');
  const [bi, setBi] = useState(0);
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setBi((i) => (i + 1) % BENEFITS.length);
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });
    }, 2600);
    return () => clearInterval(t);
  }, [fade]);

  const next = () => router.push('/onboarding/ready');

  const subscribe = async () => {
    if (busy) return;
    setBusy(true);
    const err = await purchasePlan(plan);
    setBusy(false);
    if (err) { showToast(err, 'info'); return; }
    hSuccess();
    next();
  };

  const onRestore = async () => {
    const ok = await restorePurchases();
    if (ok) { hSuccess(); next(); }
    else showToast('Nothing to restore', 'info');
  };

  const trial = plan === 'yearly';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      {/* top bar: Skip (testing) · PLUS pill · Restore */}
      <View style={styles.topBar}>
        <Pressable hitSlop={10} onPress={next}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
        <View style={styles.pill}>
          <DriftingSpectrum width={26} height={6} />
          <Text style={styles.pillText}>PLUS</Text>
        </View>
        <Pressable hitSlop={10} onPress={onRestore}>
          <Text style={styles.restore}>Restore</Text>
        </Pressable>
      </View>

      <Text style={styles.h1}>Unlock the full picture</Text>

      {/* floating orb field */}
      <View style={styles.field}>
        <LinearGradient
          colors={['rgba(122,143,163,0.20)', 'rgba(168,184,160,0.10)', 'rgba(244,228,193,0)']}
          style={styles.fieldGlow}
        />
        {ORBS.map((s, i) => <FloatOrb key={i} spec={s} />)}
      </View>

      {/* rotating benefit + dots */}
      <View style={styles.benefitWrap}>
        <Animated.Text style={[styles.benefit, { opacity: fade }]}>{BENEFITS[bi]}</Animated.Text>
        <View style={styles.dots}>
          {BENEFITS.map((_, i) => <View key={i} style={[styles.dot, i === bi && styles.dotOn]} />)}
        </View>
      </View>

      {/* pricing */}
      <View style={styles.plans}>
        <PlanCard plan="yearly" active={plan === 'yearly'} onPick={() => { hSelect(); setPlan('yearly'); }} />
        <PlanCard plan="lifetime" active={plan === 'lifetime'} onPick={() => { hSelect(); setPlan('lifetime'); }} />
      </View>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} onPress={subscribe} disabled={busy}>
          <Text style={styles.ctaText}>{busy ? 'Please wait…' : trial ? 'Start 7-day free trial' : 'Subscribe'}</Text>
        </Pressable>
        <Text style={styles.reassure}>
          {trial ? '7 days free, then $29.99/year. Cancel anytime.' : '$59.99 billed once. Yours forever.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, minHeight: 38 },
  skip: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink3 },
  restore: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink3 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6, paddingLeft: 11, paddingRight: 15, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  pillText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 2.5, color: colors.ink2 },
  h1: { fontFamily: fonts.serif, fontSize: 33, lineHeight: 38, letterSpacing: -0.5, color: colors.ink1, textAlign: 'center', marginTop: 12, paddingHorizontal: 36 },
  field: { flex: 1, minHeight: 200, position: 'relative', marginVertical: 4 },
  fieldGlow: { position: 'absolute', left: '8%', right: '8%', top: '4%', bottom: '4%', borderRadius: 999 },
  hero: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#3C3024', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 8 },
  benefitWrap: { alignItems: 'center', paddingHorizontal: 24 },
  benefit: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink2, height: 22 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 11 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: colors.line },
  dotOn: { width: 16, backgroundColor: colors.ink1 },
  plans: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 18 },
  card: { flex: 1, borderRadius: 16, padding: 15, borderWidth: 1.5, borderColor: colors.line },
  cardActive: { borderColor: ACCENT, backgroundColor: colors.card, shadowColor: '#3C3024', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 3 },
  radio: { position: 'absolute', top: 13, right: 13, width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: ACCENT, backgroundColor: ACCENT },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink1 },
  saveBadge: { alignSelf: 'flex-start', marginTop: 8, fontFamily: fonts.semibold, fontSize: 9.5, letterSpacing: 0.6, color: '#33402C', backgroundColor: MOODS.calm.color, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 999, overflow: 'hidden' },
  price: { fontFamily: fonts.semibold, fontSize: 21, letterSpacing: -0.3, color: colors.ink1, marginTop: 9 },
  priceUnit: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink3 },
  priceSub: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.ink3, marginTop: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 16 },
  cta: { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 17, alignItems: 'center', shadowColor: ACCENT, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 6 },
  ctaText: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: 0.2, color: '#F3EFE9' },
  reassure: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.ink3, textAlign: 'center', marginTop: 11, paddingHorizontal: 6 },
});
