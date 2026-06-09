import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import OnbShell from '../../components/onboarding/OnbShell';
import OnbButton from '../../components/onboarding/OnbButton';
import { CameraIcon, PlusIcon } from '../../components/NavIcons';
import { useProfile, updateProfile } from '../../store/profile';
import { colors, fonts } from '../../constants/theme';

const GOALS = ['Understand my patterns', 'Eat more intentionally', 'Feel better day to day', 'Ease anxiety'];

export default function AboutYou() {
  const router = useRouter();
  const profile = useProfile();
  const [goals, setGoals] = useState<number[]>([]);
  const [why, setWhy] = useState('');
  const toggleGoal = (i: number) => setGoals((g) => (g.includes(i) ? g.filter((x) => x !== i) : [...g, i]));
  const [avatar, setAvatar] = useState<string | null>(null);
  const next = () => router.push('/onboarding/moods');

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) setAvatar(result.assets[0].uri);
  };

  return (
    <OnbShell idx={1} total={6} skip onSkip={next} footer={<OnbButton label="Continue" onPress={next} />}>
      <View style={styles.head}>
        <Text style={styles.h1}>A little about you</Text>
        <Text style={styles.sub}>This stays private. It just helps Food Mood feel like yours.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 30, paddingTop: 14, gap: 18 }}>
        <View style={styles.avatarBlock}>
          <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <CameraIcon color={colors.ink3} size={26} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <PlusIcon color={colors.accentText} size={13} />
            </View>
          </Pressable>
          <Text style={styles.addPhoto}>Add a photo</Text>
        </View>

        <View>
          <Text style={styles.label}>NAME</Text>
          <TextInput value={profile.name} onChangeText={(name) => updateProfile({ name })} placeholder="Your name" placeholderTextColor={colors.ink3} style={styles.input} />
        </View>

        <View>
          <Text style={styles.label}>YOUR GOAL</Text>
          <View style={styles.pills}>
            {GOALS.map((g, i) => {
              const on = goals.includes(i);
              return (
                <Pressable key={g} onPress={() => toggleGoal(i)} style={[styles.pill, on && styles.pillOn]}>
                  <Text style={[styles.pillText, on && styles.pillTextOn]}>{g}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={styles.label}>WHAT BROUGHT YOU HERE?</Text>
          <TextInput
            value={why}
            onChangeText={setWhy}
            placeholder="I want to feel less anxious around food…"
            placeholderTextColor={colors.ink3}
            multiline
            style={[styles.input, styles.whyInput]}
          />
        </View>
      </ScrollView>
    </OnbShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 30, paddingTop: 8 },
  h1: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.4, color: colors.ink1 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink3, marginTop: 8 },
  avatarBlock: { alignItems: 'center', gap: 9, marginBottom: 2 },
  avatarWrap: { width: 84, height: 84 },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  avatarEmpty: { backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.ink3, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  avatarBadge: { position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, borderWidth: 2.5, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  addPhoto: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink2 },
  label: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.8, color: colors.ink3, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink1 },
  whyInput: { minHeight: 78, fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  pillOn: { backgroundColor: colors.ink1, borderColor: 'transparent' },
  pillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink2 },
  pillTextOn: { color: colors.bg },
});
