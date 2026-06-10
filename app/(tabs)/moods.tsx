import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MoodDot from '../../components/MoodDot';
import OrbRefresh from '../../components/OrbRefresh';
import { EditIcon, PlusIcon, CameraIcon } from '../../components/NavIcons';
import { useMoods, addMood, updateMood, removeMood, MOOD_SWATCHES } from '../../store/moods';
import { colors, fonts, radius as radii } from '../../constants/theme';

const DELETE_RED = '#9B5158';

type Editing = { mode: 'new' | 'edit'; id?: string; label: string; sub: string; color: string };

export default function MoodsScreen() {
  const insets = useSafeAreaInsets();
  const moods = useMoods();
  const [editing, setEditing] = useState<Editing | null>(null);

  const startNew = () => setEditing({ mode: 'new', label: '', sub: '', color: MOOD_SWATCHES[3] });
  const startEdit = (id: string, label: string, sub: string, color: string) =>
    setEditing({ mode: 'edit', id, label, sub, color });

  const save = () => {
    if (!editing) return;
    if (editing.mode === 'new') addMood(editing.label, editing.sub, editing.color);
    else updateMood(editing.id!, editing.label, editing.sub, editing.color);
    setEditing(null);
  };

  return (
    <View style={styles.screen}>
      <OrbRefresh onRefresh={() => {}} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 34, paddingBottom: insets.bottom + 120 }}>
        <Text style={styles.title}>Moods</Text>
        <Text style={styles.intro}>
          Your moods are the feelings you choose from after a meal. Make them yours. Rename, recolour, add new ones, or remove what doesn't fit.
        </Text>

        {/* how it appears — mock notification */}
        <View style={styles.notif}>
          <View style={styles.notifIcon}>
            <CameraIcon color={colors.accentText} size={18} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.notifTop}>
              <Text style={styles.notifApp}>Food Mood</Text>
              <Text style={styles.notifNow}>now</Text>
            </View>
            <Text style={styles.notifBody}>How did that meal leave you feeling?</Text>
          </View>
        </View>
        <Text style={styles.notifCaption}>After each meal we'll nudge you to capture a mood. These are the options you'll see.</Text>

        <View style={styles.listHeader}>
          <Text style={styles.listLabel}>YOUR MOODS</Text>
          <Text style={styles.listCount}>{moods.length}</Text>
        </View>

        <View style={{ gap: 9 }}>
          {moods.map((m) => (
            <Pressable key={m.id} style={styles.row} onPress={() => startEdit(m.id, m.label, m.sub, m.color)}>
              <MoodDot moodId={m.id} color={m.color} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowLabel}>{m.label}</Text>
                {!!m.sub && <Text numberOfLines={1} style={styles.rowSub}>{m.sub}</Text>}
              </View>
              <EditIcon color={colors.ink3} size={17} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.addBtn} onPress={startNew}>
          <PlusIcon color={colors.ink2} />
          <Text style={styles.addText}>Add a mood</Text>
        </Pressable>
      </OrbRefresh>

      {/* editor sheet */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={() => setEditing(null)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => Keyboard.dismiss()}>
            {editing && (
              <>
                <View style={styles.grip} />
                <View style={styles.sheetHead}>
                  <MoodDot moodId="_" color={editing.color} size={64} />
                  <View>
                    <Text style={styles.sheetEyebrow}>{editing.mode === 'new' ? 'NEW MOOD' : 'EDIT MOOD'}</Text>
                    <Text style={styles.sheetName}>{editing.label.trim() || 'Untitled'}</Text>
                  </View>
                </View>

                <Text style={styles.fieldLabel}>NAME</Text>
                <TextInput
                  value={editing.label}
                  onChangeText={(label) => setEditing((e) => e && { ...e, label })}
                  placeholder="e.g. Energetic"
                  placeholderTextColor={colors.ink3}
                  maxLength={22}
                  style={styles.input}
                />

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>DESCRIPTION</Text>
                <TextInput
                  value={editing.sub}
                  onChangeText={(sub) => setEditing((e) => e && { ...e, sub })}
                  placeholder="e.g. excited, flowing"
                  placeholderTextColor={colors.ink3}
                  maxLength={40}
                  style={styles.input}
                />

                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>COLOUR</Text>
                <View style={styles.swatches}>
                  {MOOD_SWATCHES.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setEditing((e) => e && { ...e, color: c })}
                      style={[styles.swatch, { backgroundColor: c }, editing.color === c && styles.swatchOn]}
                    />
                  ))}
                </View>

                <View style={styles.sheetActions}>
                  {editing.mode === 'edit' && (
                    <Pressable onPress={() => { removeMood(editing.id!); setEditing(null); }} disabled={moods.length <= 1}>
                      <Text style={[styles.deleteLink, moods.length <= 1 && { color: colors.ink3 }]}>Delete</Text>
                    </Pressable>
                  )}
                  <View style={{ flex: 1 }} />
                  <Pressable style={styles.cancelBtn} onPress={() => setEditing(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.saveBtn} onPress={save}>
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  intro: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: colors.ink2, marginTop: 10 },
  notif: { flexDirection: 'row', gap: 11, alignItems: 'center', backgroundColor: colors.chip, borderRadius: radii.base + 8, padding: 12, marginTop: 18 },
  notifIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  notifApp: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink1 },
  notifNow: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.ink3 },
  notifBody: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink2, marginTop: 1 },
  notifCaption: { fontFamily: fonts.serifItalic, fontSize: 13, color: colors.ink3, marginTop: 8, marginHorizontal: 2 },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 26, marginBottom: 12, marginHorizontal: 2 },
  listLabel: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.4, color: colors.ink3 },
  listCount: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radii.card, paddingVertical: 12, paddingHorizontal: 14 },
  rowLabel: { fontFamily: fonts.medium, fontSize: 15, letterSpacing: -0.2, color: colors.ink1 },
  rowSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, borderWidth: 1, borderColor: colors.ink3, borderStyle: 'dashed', borderRadius: radii.card, paddingVertical: 13 },
  addText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink2 },
  // sheet
  kav: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.34)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 14 },
  grip: { width: 40, height: 5, borderRadius: 99, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 16 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  sheetEyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.ink3 },
  sheetName: { fontFamily: fonts.regular, fontSize: 20, color: colors.ink1, marginTop: 3 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.6, color: colors.ink3, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 15, color: colors.ink1 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 4 },
  swatch: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.ink1 },
  sheetActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  deleteLink: { fontFamily: fonts.medium, fontSize: 14, color: DELETE_RED, paddingVertical: 6, paddingHorizontal: 4 },
  cancelBtn: { backgroundColor: colors.chip, borderRadius: radii.card, paddingVertical: 12, paddingHorizontal: 20 },
  cancelText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink2 },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radii.card, paddingVertical: 12, paddingHorizontal: 24 },
  saveText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.accentText },
});
