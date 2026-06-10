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

export function RefreshIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 12a8 8 0 1 1-2.3-5.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 4v4h-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BellIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.7 21a2 2 0 0 1-3.4 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function InfoIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />
      <Path d="M12 11v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 8h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ── Filled variants (active tab) ─────────────────────────────
export function HomeFilledIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M11.3 3.35a1 1 0 0 1 1.4 0l8.3 7.45c.21.19.32.45.32.73V20a1 1 0 0 1-1 1h-4.82v-5.1a1 1 0 0 0-1-1h-2.4a1 1 0 0 0-1 1V21H4a1 1 0 0 1-1-1v-8.47c0-.28.11-.54.32-.73l8-7.45z"
        fill={color}
      />
    </Svg>
  );
}

export function MoodsFilledIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9.2} cy={9.6} r={3.2} fill={color} />
      <Circle cx={14.8} cy={9.6} r={3.2} fill={color} />
      <Circle cx={12} cy={14.6} r={3.2} fill={color} />
    </Svg>
  );
}

export function JournalFilledIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 5.5A1.5 1.5 0 0 1 7.5 4H18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7.5A1.5 1.5 0 0 1 6 18.5v-13z" fill={color} />
      <Path d="M11.5 8.5h4M11.5 12h4" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M9 4v16" stroke="#FFFFFF" strokeWidth={1.3} />
    </Svg>
  );
}

export function ProfileFilledIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.2} r={3.7} fill={color} />
      <Path d="M5.6 19.8a6.4 6.4 0 0 1 12.8 0 1 1 0 0 1-1 1.1H6.6a1 1 0 0 1-1-1.1z" fill={color} />
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
