import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import OrbRefresh from '../../components/OrbRefresh';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toggle from '../../components/Toggle';
import { EditIcon, ChevronRightIcon, CameraIcon } from '../../components/NavIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useProfile, updateProfile, updateTarget, updateNotif, resetProfile } from '../../store/profile';
import { signOutAuth, useUserEmail } from '../../store/auth';
import { deleteAccount } from '../../services/account';
import { refreshMeals } from '../../store/meals';
import { refreshMoodDays } from '../../store/moodDays';
import { showToast, type ToastIcon } from '../../store/toast';
import { hSelect } from '../../services/haptics';
import { colors, fonts, radius as radii, macroColors } from '../../constants/theme';
import type { Targets } from '../../store/profile';

const DELETE_RED = '#9B5158';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useProfile();
  const [editName, setEditName] = useState(false);
  const [editTag, setEditTag] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const flash = (m: string, icon: ToastIcon = 'check') => showToast(m, icon);

  const onDeleteAccount = async () => {
    setConfirmDel(false);
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await deleteAccount();
      await AsyncStorage.clear();
    } catch {
      // best-effort; continue resetting local state
    }
    resetProfile();
    await refreshMeals();
    await refreshMoodDays();
    await signOutAuth(); // gates back to onboarding
  };

  const email = useUserEmail();
  const initial = (profile.name || '?').trim().charAt(0).toUpperCase() || '?';

  const onLogout = async () => {
    await signOutAuth();
    await Promise.all([refreshMeals(), refreshMoodDays()]);
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) updateProfile({ avatar: result.assets[0].uri });
  };

  const clampTarget = (key: keyof Targets, text: string, max: number) => {
    const v = text === '' ? 0 : Math.max(0, Math.min(max, parseInt(text, 10) || 0));
    updateTarget(key, v);
  };

  return (
    <View style={styles.screen}>
      <OrbRefresh onRefresh={() => {}} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 34, paddingBottom: insets.bottom + 76 }}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.intro}>Your photo, name, daily goals, and how Food Mood checks in with you.</Text>

        {/* user card */}
        <View style={styles.userCard}>
          <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <CameraIcon color={colors.accentText} size={15} />
            </View>
          </Pressable>

          {editName ? (
            <TextInput
              autoFocus
              value={profile.name}
              onChangeText={(name) => updateProfile({ name })}
              onBlur={() => setEditName(false)}
              maxLength={24}
              style={styles.nameInput}
            />
          ) : (
            <Pressable style={styles.nameRow} onPress={() => setEditName(true)}>
              <Text style={styles.name}>{profile.name || 'Your name'}</Text>
              <EditIcon color={colors.ink3} size={14} />
            </Pressable>
          )}

          {editTag ? (
            <TextInput
              autoFocus
              value={profile.tagline}
              onChangeText={(tagline) => updateProfile({ tagline })}
              onBlur={() => setEditTag(false)}
              maxLength={40}
              style={styles.tagInput}
            />
          ) : (
            <Pressable onPress={() => setEditTag(true)}>
              <Text style={[styles.tagline, !profile.tagline && styles.taglinePlaceholder]}>{profile.tagline || 'Add a tagline'}</Text>
            </Pressable>
          )}
          {email && <Text style={styles.email}>{email}</Text>}
        </View>

        {/* macro goals */}
        <SectionCard title="Daily macro goals">
          {([['Protein', 'protein', 500], ['Carbs', 'carbs', 500], ['Fat', 'fat', 500]] as [string, keyof Targets, number][]).map(([label, key, max], i) => (
            <View key={key} style={[styles.fieldRow, i > 0 && styles.fieldDivider]}>
              <View style={[styles.goalDot, { backgroundColor: macroColors[key as 'protein' | 'carbs' | 'fat'] }]} />
              <Text style={styles.fieldLabel}>{label} <Text style={styles.unit}>(g)</Text></Text>
              <TextInput
                value={String(profile.targets[key])}
                onChangeText={(t) => clampTarget(key, t, max)}
                keyboardType="number-pad"
                style={styles.numInput}
              />
            </View>
          ))}
          {profile.showCalories && (
            <View style={[styles.fieldRow, styles.fieldDivider]}>
              <View style={[styles.goalDot, { backgroundColor: colors.ink2 }]} />
              <Text style={styles.fieldLabel}>Calories <Text style={styles.unit}>(cal)</Text></Text>
              <TextInput
                value={String(profile.targets.calories)}
                onChangeText={(t) => clampTarget('calories', t, 9999)}
                keyboardType="number-pad"
                style={[styles.numInput, { width: 84 }]}
              />
            </View>
          )}
          <Text style={styles.help}>These are your daily targets. The app shows how you track against them.</Text>
        </SectionCard>

        {/* tracking */}
        <SectionCard title="Tracking">
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>Show calories on meals</Text>
            <Toggle on={profile.showCalories} onChange={(v) => { updateProfile({ showCalories: v }); flash(v ? 'Calories on' : 'Calories off'); }} />
          </View>
          <Text style={styles.help}>Track calories alongside your macros. Off by default, since this app is about how food makes you feel, not just numbers.</Text>
          <View style={[styles.fieldRow, styles.fieldDivider]}>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>Haptics</Text>
            <Toggle on={profile.haptics} onChange={(v) => { updateProfile({ haptics: v }); if (v) hSelect(); flash(v ? 'Haptics on' : 'Haptics off'); }} />
          </View>
          <Text style={styles.help}>Gentle taps when you pick a mood, log a meal, and more.</Text>
        </SectionCard>

        {/* reminder */}
        <SectionCard title="Mood check-in reminder">
          <View style={styles.reminderHead}>
            <Text style={styles.reminderCaption}>Send it this long after a meal</Text>
            <Text style={styles.reminderValue}>{profile.notif.mins} min</Text>
          </View>
          <Slider
            minimumValue={30}
            maximumValue={120}
            step={15}
            value={profile.notif.mins}
            onValueChange={(v) => updateNotif({ mins: v })}
            onSlidingComplete={(v) => flash(`Reminder set to ${v} minutes`, 'bell')}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.line}
            thumbTintColor={colors.accent}
          />
          <View style={styles.reminderScale}>
            <Text style={styles.scaleText}>30 min</Text>
            <Text style={styles.scaleText}>2 hr</Text>
          </View>
          <Text style={styles.help}>You'll get one notification per meal to reflect on your mood.</Text>
        </SectionCard>

        {/* about */}
        <SectionCard title="About">
          {['Privacy Policy', 'Terms of Service', 'Contact & Support'].map((l, i) => (
            <Pressable key={l} style={[styles.aboutRow, i > 0 && styles.fieldDivider]} onPress={() => flash('Opens in your browser', 'info')}>
              <Text style={styles.fieldLabel}>{l}</Text>
              <ChevronRightIcon color={colors.ink3} />
            </Pressable>
          ))}
          <Pressable style={[styles.aboutRow, styles.fieldDivider]} onPress={() => router.push('/onboarding/welcome')}>
            <Text style={styles.fieldLabel}>Replay onboarding</Text>
            <ChevronRightIcon color={colors.ink3} />
          </Pressable>
          <View style={[styles.fieldRow, styles.fieldDivider]}>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>Turn off notifications</Text>
            <Toggle on={!profile.notif.on} onChange={(v) => { updateNotif({ on: !v }); if (v) Notifications.cancelAllScheduledNotificationsAsync().catch(() => {}); flash(v ? 'Notifications off' : 'Notifications on', 'bell'); }} />
          </View>
          <Text style={[styles.help, { marginTop: 14 }]}>Food Mood · Version 1.0.0</Text>
        </SectionCard>

        {/* account */}
        <SectionCard title="Account">
          <Pressable style={styles.outlineBtn} onPress={onLogout}>
            <Text style={styles.outlineBtnText}>Log Out</Text>
          </Pressable>
          <Pressable style={[styles.outlineBtn, styles.dangerBtn]} onPress={() => setConfirmDel(true)}>
            <Text style={[styles.outlineBtnText, { color: DELETE_RED }]}>Delete Account</Text>
          </Pressable>
        </SectionCard>
      </OrbRefresh>

      {/* delete confirmation */}
      <Modal visible={confirmDel} transparent animationType="fade" onRequestClose={() => setConfirmDel(false)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete account?</Text>
            <Text style={styles.confirmBody}>This cannot be undone. All your meals, moods, and reflections will be removed.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setConfirmDel(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={onDeleteAccount}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerTitle: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  intro: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: colors.ink2, marginTop: 10 },
  userCard: { alignItems: 'center', marginTop: 34 },
  avatarWrap: { width: 96, height: 96 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: { backgroundColor: '#A8B8A0', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  avatarInitial: { fontFamily: fonts.light, fontSize: 38, color: '#33402C' },
  avatarBadge: { position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, borderWidth: 2.5, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16 },
  name: { fontFamily: fonts.regular, fontSize: 23, letterSpacing: -0.3, color: colors.ink1 },
  nameInput: { marginTop: 16, textAlign: 'center', fontFamily: fonts.regular, fontSize: 23, color: colors.ink1, borderBottomWidth: 1, borderBottomColor: colors.line, width: 200, paddingVertical: 2 },
  tagline: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink3, marginTop: 6 },
  email: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3, marginTop: 8, opacity: 0.8 },
  taglinePlaceholder: { fontFamily: fonts.serifItalic },
  tagInput: { marginTop: 7, textAlign: 'center', fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink2, borderBottomWidth: 1, borderBottomColor: colors.line, width: 220, paddingVertical: 2 },
  sectionTitle: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.2, color: colors.ink3, marginBottom: 6, marginLeft: 2 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  fieldDivider: { borderTopWidth: 1, borderTopColor: colors.line },
  goalDot: { width: 9, height: 9, borderRadius: 4.5 },
  fieldLabel: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.ink1 },
  unit: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3 },
  numInput: { marginLeft: 'auto', width: 72, textAlign: 'right', borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink1, fontVariant: ['tabular-nums'] },
  help: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink3, lineHeight: 18, marginTop: 10, marginHorizontal: 2 },
  reminderHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  reminderCaption: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3 },
  reminderValue: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink1, fontVariant: ['tabular-nums'] },
  reminderScale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  scaleText: { fontFamily: fonts.regular, fontSize: 11, color: colors.ink3 },
  outlineBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  dangerBtn: { borderColor: 'rgba(155,81,88,0.4)' },
  outlineBtnText: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.ink1 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
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
