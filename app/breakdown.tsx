import { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import BackButton from '../components/BackButton';
import MoodDot from '../components/MoodDot';
import MacroBar from '../components/MacroBar';
import { EditIcon, TrashIcon } from '../components/NavIcons';
import { macroGrams, kcalOf } from '../constants/data';
import { getMealById, updateMeal, deleteMeal } from '../services/meals';
import { refreshMeals } from '../store/meals';
import { refreshMoodDays } from '../store/moodDays';
import { useProfile } from '../store/profile';
import { getMoodById } from '../store/moods';
import { colors, fonts, radius as radii, buttonShadow, macroColors } from '../constants/theme';
import type { Meal } from '../types';

const DELETE_RED = '#9B5158';
type Draft = { title: string; protein: number; carbs: number; fat: number; calories: number };

export default function BreakdownScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showCal = useProfile().showCalories;
  const { mealId } = useLocalSearchParams<{ mealId?: string }>();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (mealId ? getMealById(mealId) : Promise.resolve(null))
        .then((m) => { if (active) setMeal(m); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [mealId]),
  );

  const startEdit = () => {
    if (!meal) return;
    setDraft({ title: meal.title, ...meal.macros, calories: meal.calories ?? kcalOf(meal.macros) });
    setEditing(true);
  };
  const num = (t: string) => Math.max(0, parseInt(t.replace(/[^0-9]/g, ''), 10) || 0);
  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const save = async () => {
    if (!meal || !draft || saving) return;
    setSaving(true);
    try {
      await updateMeal(meal.id, draft);
      setMeal({ ...meal, title: draft.title, macros: { protein: draft.protein, carbs: draft.carbs, fat: draft.fat }, calories: draft.calories });
      await refreshMeals();
      setEditing(false);
    } catch {
      // keep editing
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!meal) return;
    setConfirmDel(false);
    try {
      await deleteMeal(meal.id);
      await refreshMeals();
      await refreshMoodDays();
    } catch {
      // ignore
    }
    router.dismissAll();
  };

  const mood = meal?.mood ? getMoodById(meal.mood) : null;
  const macros = editing && draft ? { protein: draft.protein, carbs: draft.carbs, fat: draft.fat } : meal?.macros ?? { protein: 0, carbs: 0, fat: 0 };
  const total = macroGrams(macros);
  const calories = editing && draft ? draft.calories : meal ? meal.calories ?? kcalOf(macros) : 0;
  const insight = mood
    ? `${mood.label} meals like this tend to sit lighter on carbs.`
    : 'Log how this meal made you feel to start seeing patterns.';

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => (editing ? setEditing(false) : router.back())} />
        {meal && !loading && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {editing ? (
              <Pressable style={styles.saveChip} onPress={save} disabled={saving}>
                <Text style={styles.saveChipText}>{saving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.iconBtn} onPress={startEdit}><EditIcon color={colors.ink2} /></Pressable>
                <Pressable style={styles.iconBtn} onPress={() => setConfirmDel(true)}><TrashIcon color={DELETE_RED} /></Pressable>
              </>
            )}
          </View>
        )}
      </View>

      {loading || !meal ? (
        <View style={styles.center}>
          {loading ? <ActivityIndicator color={colors.ink3} /> : <Text style={styles.empty}>Meal not found.</Text>}
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 140 }}>
            <Text style={styles.eyebrow}>{meal.time.toUpperCase()}</Text>
            {editing && draft ? (
              <TextInput value={draft.title} onChangeText={(title) => patch({ title })} style={styles.titleInput} placeholder="Meal name" placeholderTextColor={colors.ink3} />
            ) : (
              <Text style={styles.title}>{meal.title}</Text>
            )}

            <View style={styles.moodRow}>
              <View style={styles.moodOrbWrap}>
                {mood ? <MoodDot moodId={mood.id} size={56} /> : <View style={styles.noMoodDot} />}
                {meal.img ? <Image source={{ uri: meal.img }} style={styles.moodPhoto} contentFit="cover" transition={200} /> : null}
              </View>
              <View>
                <Text style={styles.moodCaption}>{mood ? 'Logged feeling' : 'No mood yet'}</Text>
                <Text style={styles.moodLabel}>{mood ? mood.label : 'Pending check-in'}</Text>
              </View>
            </View>

            <View style={{ marginTop: 30 }}>
              <MacroBar macros={macros} height={20} radius={radii.base} colors={macroColors} animate={!editing} />
              <View style={styles.barFooter}>
                <Text style={styles.barFooterText}>{total} g total</Text>
                {showCal && <Text style={styles.barFooterText}>{calories} cal</Text>}
              </View>
            </View>

            <View style={{ marginTop: 26 }}>
              {([
                ['Protein', 'protein', macroColors.protein],
                ['Carbs', 'carbs', macroColors.carbs],
                ['Fat', 'fat', macroColors.fat],
              ] as [string, keyof Draft, string][]).map(([label, key, c], i) => {
                const v = editing && draft ? (draft[key] as number) : meal.macros[key as 'protein' | 'carbs' | 'fat'];
                return (
                  <View key={label} style={[styles.numRow, i > 0 && styles.numRowDivider]}>
                    <View style={[styles.numDot, { backgroundColor: c }]} />
                    <Text style={styles.numLabel}>{label}</Text>
                    {!editing && <Text style={styles.numPct}>{total ? Math.round((v / total) * 100) : 0}%</Text>}
                    {editing && draft ? (
                      <TextInput value={String(v)} onChangeText={(t) => patch({ [key]: num(t) } as Partial<Draft>)} keyboardType="number-pad" style={styles.numInput} />
                    ) : (
                      <Text style={styles.numValue}>{v}<Text style={styles.numUnit}> g</Text></Text>
                    )}
                  </View>
                );
              })}
              {editing && draft && showCal && (
                <View style={[styles.numRow, styles.numRowDivider]}>
                  <View style={[styles.numDot, { backgroundColor: colors.ink2 }]} />
                  <Text style={styles.numLabel}>Calories</Text>
                  <TextInput value={String(draft.calories)} onChangeText={(t) => patch({ calories: num(t) })} keyboardType="number-pad" style={styles.numInput} />
                </View>
              )}
            </View>

            {!editing && (
              <View style={styles.insight}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            )}
          </ScrollView>

          {!editing && (
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
              <Pressable style={styles.doneBtn} onPress={() => router.dismissAll()}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      <Modal visible={confirmDel} transparent animationType="fade" onRequestClose={() => setConfirmDel(false)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete this meal?</Text>
            <Text style={styles.confirmBody}>This removes the photo and its macros. This can't be undone.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setConfirmDel(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable style={styles.deleteBtn} onPress={onDelete}><Text style={styles.deleteText}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  saveChip: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18, justifyContent: 'center' },
  saveChipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.accentText },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink3 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  title: { fontFamily: fonts.light, fontSize: 27, letterSpacing: -0.4, color: colors.ink1, marginTop: 8 },
  titleInput: { fontFamily: fonts.regular, fontSize: 24, color: colors.ink1, marginTop: 8, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 4 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 22 },
  moodOrbWrap: { flexDirection: 'row', alignItems: 'center' },
  noMoodDot: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed' },
  moodPhoto: { width: 56, height: 56, borderRadius: 28, marginLeft: -14, borderWidth: 2, borderColor: colors.bg },
  moodCaption: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3 },
  moodLabel: { fontFamily: fonts.regular, fontSize: 18, color: colors.ink1, marginTop: 2 },
  barFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  barFooterText: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  numRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  numRowDivider: { borderTopWidth: 1, borderTopColor: colors.line },
  numDot: { width: 9, height: 9, borderRadius: 4.5 },
  numLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink1 },
  numPct: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  numValue: { fontFamily: fonts.regular, fontSize: 17, color: colors.ink1, minWidth: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
  numUnit: { fontFamily: fonts.regular, fontSize: 12, color: colors.ink3 },
  numInput: { fontFamily: fonts.regular, fontSize: 16, color: colors.ink1, minWidth: 64, textAlign: 'right', borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  insight: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: colors.chip, borderRadius: radii.button },
  insightText: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24, color: colors.ink2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.bg },
  doneBtn: { backgroundColor: colors.accent, borderRadius: radii.button, paddingVertical: 17, alignItems: 'center', ...buttonShadow },
  doneText: { fontFamily: fonts.medium, fontSize: 15.5, letterSpacing: 0.2, color: colors.accentText },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  confirmCard: { width: '100%', backgroundColor: colors.bg, borderRadius: 18, padding: 22 },
  confirmTitle: { fontFamily: fonts.medium, fontSize: 17, color: colors.ink1 },
  confirmBody: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3, lineHeight: 20, marginTop: 8, marginBottom: 18 },
  confirmActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { backgroundColor: colors.chip, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20 },
  cancelText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink2 },
  deleteBtn: { backgroundColor: DELETE_RED, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 22 },
  deleteText: { fontFamily: fonts.medium, fontSize: 14.5, color: '#fff' },
});
