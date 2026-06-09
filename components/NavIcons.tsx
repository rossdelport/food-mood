import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

type IconProps = { color: string; size?: number };

const stroke = (color: string) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ color, size = 23 }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11.3 12 5l8 6.3" {...s} />
      <Path d="M6.2 10.3V19h11.6v-8.7" {...s} />
    </Svg>
  );
}

export function MoodsIcon({ color, size = 23 }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9.2} cy={9.6} r={3.1} {...s} />
      <Circle cx={14.8} cy={9.6} r={3.1} {...s} />
      <Circle cx={12} cy={14.6} r={3.1} {...s} />
    </Svg>
  );
}

export function JournalIcon({ color, size = 23 }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={4.5} width={14} height={15} rx={2} {...s} />
      <Path d="M9 4.5v15" {...s} />
      <Path d="M12 9.5h4M12 13h4" {...s} />
    </Svg>
  );
}

export function ProfileIcon({ color, size = 23 }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.4} r={3.3} {...s} />
      <Path d="M5.8 19a6.2 6.2 0 0 1 12.4 0" {...s} />
    </Svg>
  );
}

export function LibraryIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={1.7} />
      <Circle cx={8.5} cy={8.5} r={1.6} stroke={color} strokeWidth={1.7} />
      <Path d="M21 15l-4.5-4.5L6 21" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FlipIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9a9 9 0 0 1 15-3.5L21 8" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 4v4h-4" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 15a9 9 0 0 1-15 3.5L3 16" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 20v-4h4" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

export function CameraIcon({ color = '#F3EFE9', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={3.6} stroke={color} strokeWidth={1.8} />
      <Path
        d="M4 8.5A1.5 1.5 0 015.5 7h1.7l1-1.6a1 1 0 01.85-.47h5.9a1 1 0 01.85.47l1 1.6h1.7A1.5 1.5 0 0120 8.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5v-9z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={(size * 9) / 16} height={size} viewBox="0 0 9 16" fill="none">
      <Path d="M7.5 1L1 8l6.5 7" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ color, size = 12 }: IconProps) {
  return (
    <Svg width={(size * 8) / 14} height={size} viewBox="0 0 8 14" fill="none">
      <Path d="M1 1l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l4.2 4.3L19 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.7} />
      <Path d="M16 16l4 4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

export function EditIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.5 5.5l4 4M4 20l1-4L16 5a1.5 1.5 0 012 0l1 1a1.5 1.5 0 010 2L8 19l-4 1z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const navIcons = {
  index: HomeIcon,
  moods: MoodsIcon,
  journal: JournalIcon,
  profile: ProfileIcon,
};
