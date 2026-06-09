import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import MoodDot from './MoodDot';
import { colors, fonts, macroColors as defaultMacroColors, radius as radii } from '../constants/theme';
import { kcalOf } from '../constants/data';
import type { Meal } from '../types';

type Props = {
  meal: Meal;
  onPress?: (meal: Meal) => void;
  onPressPhoto?: (meal: Meal) => void;
  photo?: number;
  showCal?: boolean;
  macroColors?: { protein: string; carbs: string; fat: string };
};

// Reusable meal row — mood dot · overlapping photo · title/time · macro readout.
export default function MealCard({
  meal,
  onPress,
  onPressPhoto,
  photo = 39,
  showCal = false,
  macroColors = defaultMacroColors,
}: Props) {
  return (
    <Pressable
      onPress={() => onPress?.(meal)}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }]}
    >
      <MoodDot moodId={meal.mood} size={41} />
      <Pressable
        onPress={onPressPhoto ? () => onPressPhoto(meal) : undefined}
        style={[styles.photoWrap, { width: photo, height: photo }]}
      >
        <Image source={{ uri: meal.img }} style={styles.photo} contentFit="cover" transition={200} />
      </Pressable>

      <View style={styles.middle}>
        <Text numberOfLines={1} style={styles.title}>{meal.title}</Text>
        <Text style={styles.time}>
          {meal.time}{showCal ? ` · ${kcalOf(meal.macros)} cal` : ''}
        </Text>
      </View>

      <View style={styles.macros}>
        <MacroRow label="Protein" value={meal.macros.protein} color={macroColors.protein} />
        <MacroRow label="Carbs" value={meal.macros.carbs} color={macroColors.carbs} />
        <MacroRow label="Fat" value={meal.macros.fat} color={macroColors.fat} />
      </View>
    </Pressable>
  );
}

function MacroRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}<Text style={styles.macroUnit}>g</Text></Text>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  photoWrap: {
    flexShrink: 0,
    borderRadius: radii.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.chip,
    marginLeft: 12, // separation from the mood dot
  },
  photo: { width: '100%', height: '100%' },
  middle: { flex: 1, minWidth: 0, marginLeft: 13 },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14.5,
    letterSpacing: -0.2,
    color: colors.ink1,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.ink3,
    marginTop: 3,
  },
  macros: { alignItems: 'flex-end', gap: 3 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macroLabel: { fontFamily: fonts.regular, fontSize: 13.2, color: colors.ink3 },
  macroValue: {
    fontFamily: fonts.medium,
    fontSize: 14.4,
    color: colors.ink2,
    minWidth: 34,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  macroUnit: { fontFamily: fonts.regular, color: colors.ink3 },
  macroDot: { width: 5, height: 5, borderRadius: 2.5 },
});
