import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '../components/BackButton';
import MacroBar from '../components/MacroBar';
import CelebrationModal from '../components/CelebrationModal';
import { EditIcon, FlipIcon, CloseIcon } from '../components/NavIcons';
import { detectMacros } from '../services/vision';
import { createMeal } from '../services/meals';
import { scheduleMealReminder } from '../services/notifications';
import { refreshMeals } from '../store/meals';
import { refreshMoodDays } from '../store/moodDays';
import { useProfile } from '../store/profile';
import { loadJSON, saveJSON } from '../store/persist';
import { showToast } from '../store/toast';
import { hSuccess, hWarning } from '../services/haptics';
import { macroGrams } from '../constants/data';
import { colors, fonts, radius as radii, buttonShadow, macroColors } from '../constants/theme';
import type { DetectedMeal } from '../types';

const REJECT_COLOR = '#9B5158';
const FIRST_MEAL_KEY = 'foodmood:firstMealCelebrated';

export default function MealCaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { img, date } = useLocalSearchParams<{ img?: string; date?: string }>();
  const profile = useProfile();
  const isToday = !date || date === format(new Date(), 'yyyy-MM-dd');

  const [detected, setDetected] = useState<DetectedMeal | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // First-meal celebration: minutes until the reminder, or null if none was set.
  const [celebrateMins, setCelebrateMins] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const analyze = useCallback(async () => {
    if (!img) return;
    setAnalyzing(true);
    setError(null);
    try {
      const d = await detectMacros(img);
      setDetected(d);
      if (/not\s+(food|a meal)/i.test(d.title)) hWarning();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read this meal');
    } finally {
      setAnalyzing(false);
    }
  }, [img]);

  useEffect(() => { analyze(); }, [analyze]);

  const patch = (p: Partial<DetectedMeal>) => setDetected((d) => (d ? { ...d, ...p } : d));
  const num = (t: string) => Math.max(0, parseInt(t.replace(/[^0-9]/g, ''), 10) || 0);

  // The vision model returns this title when the photo isn't food or drink.
  const rejected = detected != null && /not\s+(food|a meal)/i.test(detected.title);
  const goToCamera = () => router.replace(date ? { pathname: '/camera', params: { date } } : { pathname: '/camera' });

  // Leave the capture flow once a meal is logged.
  const leaveAfterLog = () => {
    if (date) {
      router.back(); // back-dated: return to the day view that launched the log
    } else {
      router.dismissAll(); // close the capture modals…
      router.navigate('/'); // …and land on Home so the new meal is front and centre
    }
    showToast('Meal logged', 'check');
  };

  const confirm = async () => {
    if (!detected || !img || saving) return;
    setSaving(true);
    try {
      // Back-date to the chosen day (keep the current time-of-day) when logging in the past.
      let capturedAt: Date | undefined;
      if (date && !isToday) {
        const now = new Date();
        capturedAt = parseISO(date);
        capturedAt.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
      const { id } = await createMeal({ uri: img, detected, reminderMins: profile.notif.mins, capturedAt });
      // Reminders only make sense for meals logged today.
      const reminderId = isToday && profile.notif.on ? await scheduleMealReminder(id, profile.notif.mins, detected.title) : 'off';
      const reminderSet = reminderId !== null && reminderId !== 'off';
      await Promise.all([refreshMeals(), refreshMoodDays()]);
      hSuccess();

      // Celebrate the very first meal a user logs (once per device).
      const celebrated = await loadJSON<boolean>(FIRST_MEAL_KEY);
      if (!celebrated) {
        saveJSON(FIRST_MEAL_KEY, true);
        setCelebrateMins(reminderSet ? profile.notif.mins : null);
        setCelebrating(true); // CelebrationModal's CTA navigates away
        return;
      }

      leaveAfterLog();
      if (isToday && profile.notif.on && !reminderSet) {
        Alert.alert('Reminder not set', 'Allow notifications to get a gentle mood check-in after your meals.');
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Could not save the meal. Check your connection and try again.');
      setSaving(false);
    }
  };

  const total = detected ? macroGrams(detected) : 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
        {!analyzing && detected && !rejected && (
          <Pressable style={styles.editBtn} onPress={() => setEditing((e) => !e)}>
            <EditIcon color={colors.ink2} size={16} />
            <Text style={styles.editText}>{editing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}>
        {!!img && <Image source={{ uri: img }} style={styles.photo} contentFit="cover" />}

        {analyzing ? (
          <View style={styles.analyzing}>
            <ActivityIndicator color={colors.ink2} />
            <Text style={styles.analyzingText}>Reading your meal…</Text>
          </View>
        ) : error ? (
          <View style={styles.analyzing}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={analyze}>
              <FlipIcon color={colors.ink2} size={16} />
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : rejected ? (
          <View style={styles.rejected}>
            <View style={styles.rejectedIcon}>
              <CloseIcon color={REJECT_COLOR} size={22} />
            </View>
            <Text style={styles.rejectedTitle}>Can't log this</Text>
            <Text style={styles.rejectedBody}>We can only log food or drink. Please re-try with a meal or a beverage.</Text>
          </View>
        ) : detected ? (
          <>
            {editing ? (
              <TextInput value={detected.title} onChangeText={(title) => patch({ title })} style={styles.titleInput} placeholder="Meal name" placeholderTextColor={colors.ink3} />
            ) : (
              <Text style={styles.title}>{detected.title}</Text>
            )}

            <View style={{ marginTop: 18 }}>
              <MacroBar macros={detected} height={20} radius={radii.base} colors={macroColors} />
              <View style={styles.barFooter}>
                <Text style={styles.barFooterText}>{total} g total</Text>
                {profile.showCalories && <Text style={styles.barFooterText}>{detected.calories} cal</Text>}
              </View>
            </View>

            <View style={{ marginTop: 22 }}>
              <MacroEditRow label="Protein" color={macroColors.protein} value={detected.protein} editing={editing} onChange={(v) => patch({ protein: v })} num={num} total={total} />
              <MacroEditRow label="Carbs" color={macroColors.carbs} value={detected.carbs} editing={editing} onChange={(v) => patch({ carbs: v })} num={num} total={total} />
              <MacroEditRow label="Fat" color={macroColors.fat} value={detected.fat} editing={editing} onChange={(v) => patch({ fat: v })} num={num} total={total} />
              {profile.showCalories && (
                <MacroEditRow label="Calories" color={colors.ink2} value={detected.calories} editing={editing} onChange={(v) => patch({ calories: v })} num={num} unit="cal" />
              )}
            </View>

            {!editing && (
              <Pressable style={styles.reanalyze} onPress={analyze}>
                <FlipIcon color={colors.ink3} size={15} />
                <Text style={styles.reanalyzeText}>Re-analyze photo</Text>
              </Pressable>
            )}

            <Text style={styles.reminderNote}>
              {isToday
                ? `We'll check in ${profile.notif.mins} min after eating to capture how this meal made you feel.`
                : "You can set how this meal made you feel from the day's view."}
            </Text>
          </>
        ) : null}
      </ScrollView>

      {detected && !analyzing && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {rejected ? (
            <Pressable style={styles.logBtn} onPress={goToCamera}>
              <FlipIcon color={colors.accentText} size={17} />
              <Text style={styles.logText}>Re-try</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.logBtn, saving && { opacity: 0.6 }]} onPress={confirm} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.logText}>Log meal</Text>}
            </Pressable>
          )}
        </View>
      )}

      <CelebrationModal
        visible={celebrating}
        minutes={celebrateMins}
        onDone={() => { setCelebrating(false); leaveAfterLog(); }}
      />
    </View>
  );
}

function MacroEditRow({ label, color, value, editing, onChange, num, total, unit = 'g' }: {
  label: string; color: string; value: number; editing: boolean;
  onChange: (v: number) => void; num: (t: string) => number; total?: number; unit?: string;
}) {
  return (
    <View style={styles.numRow}>
      <View style={[styles.numDot, { backgroundColor: color }]} />
      <Text style={styles.numLabel}>{label}</Text>
      {total != null && <Text style={styles.numPct}>{total ? Math.round((value / total) * 100) : 0}%</Text>}
      {editing ? (
        <TextInput value={String(value)} onChangeText={(t) => onChange(num(t))} keyboardType="number-pad" style={styles.numInput} />
      ) : (
        <Text style={styles.numValue}>{value}<Text style={styles.numUnit}> {unit}</Text></Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.chip, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  editText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink2 },
  photo: { width: '100%', height: 260, borderRadius: 18, backgroundColor: colors.chip },
  analyzing: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 40 },
  analyzingText: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink3 },
  errorText: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink2, textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.chip, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 18 },
  retryText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink2 },
  title: { fontFamily: fonts.light, fontSize: 27, letterSpacing: -0.4, color: colors.ink1, marginTop: 20 },
  titleInput: { fontFamily: fonts.regular, fontSize: 24, color: colors.ink1, marginTop: 20, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 4 },
  barFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  barFooterText: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  numRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: 1, borderTopColor: colors.line },
  numDot: { width: 9, height: 9, borderRadius: 4.5 },
  numLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink1 },
  numPct: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  numValue: { fontFamily: fonts.regular, fontSize: 17, color: colors.ink1, minWidth: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
  numUnit: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  numInput: { fontFamily: fonts.regular, fontSize: 16, color: colors.ink1, minWidth: 60, textAlign: 'right', borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  reanalyze: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 7, marginTop: 22, paddingVertical: 8, paddingHorizontal: 14 },
  reanalyzeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink3 },
  reminderNote: { fontFamily: fonts.serifItalic, fontSize: 14, lineHeight: 21, color: colors.ink3, textAlign: 'center', marginTop: 20, paddingHorizontal: 10 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.bg },
  logBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 17, ...buttonShadow },
  logText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
  rejected: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16, gap: 11 },
  rejectedIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(155,81,88,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  rejectedTitle: { fontFamily: fonts.light, fontSize: 23, letterSpacing: -0.3, color: colors.ink1 },
  rejectedBody: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink3, textAlign: 'center', maxWidth: 300 },
});
