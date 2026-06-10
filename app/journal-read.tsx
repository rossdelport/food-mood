import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '../components/BackButton';
import { EditIcon, TrashIcon } from '../components/NavIcons';
import { useJournalEntries, deleteEntry } from '../store/journal';
import { getMoodById } from '../store/moods';
import { colors, fonts, radius as radii } from '../constants/theme';

const DELETE_RED = '#9B5158';

export default function JournalReadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entries = useJournalEntries();
  const entry = entries.find((e) => e.id === id);
  const [confirm, setConfirm] = useState(false);

  // If the entry was deleted (or never existed), close.
  if (!entry) {
    return <View style={styles.screen} />;
  }

  const mood = entry.moodId ? getMoodById(entry.moodId) : null;

  const onDelete = () => {
    deleteEntry(entry.id);
    setConfirm(false);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={styles.iconBtn} onPress={() => router.push({ pathname: '/journal-entry', params: { id: entry.id } })}>
            <EditIcon color={colors.ink2} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setConfirm(true)}>
            <TrashIcon color={DELETE_RED} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 14, paddingBottom: insets.bottom + 50 }}>
        <Text style={styles.meta}>{entry.date.toUpperCase()} · {entry.time}</Text>
        <View style={styles.moodRow}>
          {mood && <View style={[styles.moodDot, { backgroundColor: mood.color }]} />}
          {mood && <Text style={styles.moodLabel}>{mood.label}</Text>}
          {entry.link && (
            <View style={[styles.linkPill, mood && { marginLeft: 'auto' }]}>
              <Text style={styles.linkText}>↳ {entry.link.label}</Text>
            </View>
          )}
        </View>
        <Text style={styles.body}>{entry.text}</Text>
      </ScrollView>

      <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => setConfirm(false)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete this reflection?</Text>
            <Text style={styles.confirmBody}>This can't be undone.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setConfirm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={onDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  meta: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.ink3 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  moodDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  moodLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink2 },
  linkPill: { backgroundColor: colors.chip, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 11 },
  linkText: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  body: { fontFamily: fonts.serif, fontSize: 18.5, lineHeight: 31, color: colors.ink1, marginTop: 24 },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  confirmCard: { width: '100%', backgroundColor: colors.bg, borderRadius: 18, padding: 22 },
  confirmTitle: { fontFamily: fonts.medium, fontSize: 17, color: colors.ink1 },
  confirmBody: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink3, lineHeight: 20, marginTop: 8, marginBottom: 18 },
  confirmActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { backgroundColor: colors.chip, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20 },
  cancelText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink2 },
  deleteBtn: { backgroundColor: DELETE_RED, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 22 },
  deleteText: { fontFamily: fonts.medium, fontSize: 14.5, color: '#fff' },
});
