// Design tokens for Food Mood — translated faithfully from the design handoff
// (README "Design Tokens" + Food Mood.html token block). Ship light theme by default.

export const colors = {
  bg: '#FAF8F4', // warm off-white screen background
  card: '#FFFFFF',
  chip: '#F0ECE3',
  line: 'rgba(60,48,36,0.10)',
  ink1: '#2A2622', // primary text
  ink2: '#6C645A', // secondary text
  ink3: '#9C9288', // muted text / captions
  accent: '#232A33', // charcoal navy primary buttons
  accentText: '#F3EFE9',
};

export const darkColors = {
  bg: '#191715',
  card: '#232120',
  chip: '#2B2825',
  line: 'rgba(255,255,255,0.09)',
  ink1: '#F1ECE4',
  ink2: '#B6AEA3',
  ink3: '#837B71',
  accent: '#232A33',
  accentText: '#F3EFE9',
};

// Macro bar colors — default palette "tonal taupe".
export const macroColors = {
  protein: '#3E3833',
  carbs: '#9A8C7A',
  fat: '#D6CCBE',
};

// Corner radii. Base radius is 6; specific surfaces add to it.
export const radius = {
  base: 6,
  card: 10, // base + 4
  button: 12, // base + 6
  sheet: 26,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Brand fonts. Each weight maps to a separate loaded font family (RN has no
// numeric font-weight for custom fonts). Outfit = UI sans, Newsreader = serif italic.
export const fonts = {
  extralight: 'Outfit_200ExtraLight',
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  serifItalic: 'Newsreader_400Regular_Italic',
  serifItalicMedium: 'Newsreader_500Medium_Italic',
  serif: 'Georgia', // upright serif for long-form journal writing (iOS system)
};

// Key type sizes from the handoff type scale.
export const type = {
  eyebrow: { fontSize: 11, letterSpacing: 2.4 }, // UPPERCASE, ink3, medium
  title: { fontSize: 30, letterSpacing: -0.4 }, // hero date, weight light
  titleSm: { fontSize: 27, letterSpacing: -0.4 },
  cardTitle: { fontSize: 14.5, letterSpacing: -0.2 }, // weight medium
  body: { fontSize: 13.5 },
  macroNum: { fontSize: 18 },
  insight: { fontSize: 16, lineHeight: 24 }, // Newsreader italic
};

// Soft shadow used on primary buttons.
export const buttonShadow = {
  shadowColor: '#1F2733',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.22,
  shadowRadius: 24,
  elevation: 6,
};
