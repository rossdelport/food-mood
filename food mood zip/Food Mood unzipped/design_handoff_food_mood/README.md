# Handoff: Food Mood — Mood + Macro Tracking App (iOS, Expo)

## Overview
**Food Mood** is a premium, soulful food-tracking app that connects **how you feel** to **what you eat**. Mood is the hero; macros (protein / carbs / fat) are the quiet story underneath. Calories are opt-in. No streaks, badges, or guilt.

This bundle is a complete design reference for the iOS app. Your task: **recreate these designs natively in React Native (Expo / TypeScript) so they run in Expo Go.**

---

## ⚠️ About the Design Files (read first)
The files in this bundle are **design references built in HTML + inline React (Babel JSX)** — prototypes that show the intended look, layout, copy, and behavior. **They are NOT production code to copy directly.** They use browser DOM (`<div>`, CSS variables, web fonts, `localStorage`) and a web-only device-frame/tweaks scaffold that has no place in a real app.

**What to do:** Re-implement each screen in a real Expo app using React Native primitives (`View`, `Text`, `Pressable`, `Image`, `ScrollView`, `FlatList`, `Modal`) and the project's chosen styling approach. Treat the HTML/JSX as the **source of truth for tokens, layout, copy, and interactions** — read the exact values out of the source files and translate them faithfully.

**Suggested stack (matches the original brief):**
- **Expo (managed workflow)** + **TypeScript**
- **expo-router** or **React Navigation** (native-stack) for the 3-tab + modal flow
- **NativeWind** (Tailwind for RN) *or* `StyleSheet` — either is fine; tokens below map cleanly to both
- `expo-font` for the Google fonts (Outfit + Newsreader)
- `expo-image` for meal photos
- `expo-image-picker` for "Capture Meal" (camera/library)
- `@react-native-async-storage/async-storage` for persistence (replaces web `localStorage`)

---

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interactions are all specified. Recreate the UI pixel-faithfully using the exact tokens below. Where the HTML uses a CSS effect that doesn't exist in RN (e.g. `inset` box-shadows for the glossy mood orbs), approximate per the notes in each component.

---

## Screenshots (visual reference) — `/screenshots`
Pixel-faithful captures of every screen at 390×844. Match these exactly. App screens first, then the onboarding flow in order:

| # | File | Screen |
|---|---|---|
| 01 | `01-home.png` | Home — feed + 7-day spectrum + meal cards (calendar is the module at the bottom of this scroll) |
| 02 | `02-mood-picker.png` | Mood Picker (post-capture) |
| 03 | `03-macro-breakdown-meal.png` | Macro Breakdown — single meal |
| 04 | `04-macro-breakdown-day.png` | Macro Breakdown — daily ("Today's macros") |
| 05 | `05-day-view.png` | Day View (tapped from the spectrum) |
| 06 | `06-moods-tab.png` | Moods tab (CRUD palette) |
| 07 | `07-journal-list.png` | Journal — grouped entry list |
| 08 | `08-journal-new-entry.png` | Journal — new entry (mood orbs + note) |
| 09 | `09-profile.png` | Profile / settings |
| 10–17 | `10-onboarding-1-welcome.png` … `17-onboarding-8-all-set.png` | Onboarding flow, screens 1–8 |

> Note: the Monthly Mood Calendar is the bottom module of the Home scroll (you can see its "MOOD CALENDAR" heading at the foot of `01-home.png`); it's specified in full under Home below.

---

## How to run in Expo Go (developer quickstart)
```bash
# 1. scaffold
npx create-expo-app food-mood -t expo-template-blank-typescript
cd food-mood

# 2. core deps
npx expo install expo-font expo-image expo-image-picker @react-native-async-storage/async-storage
npm i @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
# (optional) npm i nativewind && npx tailwindcss init

# 3. fonts: download Outfit + Newsreader (Google Fonts) into assets/fonts/, load with useFonts()

# 4. run — scan the QR with Expo Go on the test device
npx expo start
```

---

## Design Tokens

### Brand fonts
- **Outfit** (sans) — all UI text. Weights used: 200, 300, 400, 500, 600. (Hero numbers/dates use 300; labels 500.)
- **Newsreader** (serif) — *italic only*, used for the observational "insight" lines and editorial quotes. Weights 400/500 italic.
- Load both via `expo-font` / `@expo-google-fonts/outfit` + `@expo-google-fonts/newsreader`.

### Color — Light theme (default)
| Token | Hex / value | Use |
|---|---|---|
| `--bg` | `#FAF8F4` | screen background (warm off-white) |
| `--card` | `#FFFFFF` | cards, sheets |
| `--chip` | `#F0ECE3` | chips, pills, icon wells |
| `--line` | `rgba(60,48,36,0.10)` | hairline borders/dividers |
| `--ink-1` | `#2A2622` | primary text |
| `--ink-2` | `#6C645A` | secondary text |
| `--ink-3` | `#9C9288` | muted text / captions |
| `--accent` | `#232A33` | primary buttons (charcoal navy) |

### Color — Dark theme
| Token | Hex / value |
|---|---|
| `--bg` | `#191715` |
| `--card` | `#232120` |
| `--chip` | `#2B2825` |
| `--line` | `rgba(255,255,255,0.09)` |
| `--ink-1` | `#F1ECE4` |
| `--ink-2` | `#B6AEA3` |
| `--ink-3` | `#837B71` |
| `--accent` | (unchanged) `#232A33` |

### Mood palette (THE emotional anchor — use sparingly + intentionally)
| id (keep for data) | **Display label** | Sub-label | Color | Text-on-color |
|---|---|---|---|---|
| `energetic` | Energetic | excited, flowing | `#F4E4C1` | dark `#5A4A2A` |
| `focused` | Focused | content, stable | `#C9A876` | dark `#4A3A1E` |
| `calm` | Calm | grounded, peaceful | `#A8B8A0` | dark `#33402C` |
| `contemplative` | **Bloated** | heavy, full | `#7A8FA3` | white `#fff` |
| `sluggish` | Sluggish | low energy, anxious | `#8B4F5C` | white `#fff` |

> **IMPORTANT:** the dusty-blue mood's internal id stays `contemplative` (all meal/week/journal data references it) but it must **always display as "Bloated."** Order everywhere: `energetic → focused → calm → contemplative → sluggish`.

### Macro bar colors (default palette "tonal taupe")
`protein #3E3833` · `carbs #9A8C7A` · `fat #D6CCBE`
(Two alternates exist as a tweak: "earth" `#8B6F47/#C9A876/#A8B8A0`, "cool clay" `#5C6B78/#9DB0A6/#D9CDB6`. Ship the tonal-taupe default; the alternates are optional theming.)

### Shape & spacing
- **Corner radius:** subtle. Base radius **6px**; cards use `radius+4`, buttons `radius+6`, sheets larger. (In the prototype radius is a live tweak 0–16px; ship 6px.)
- **Buttons:** full-width primary, `~17px` vertical padding, label 15.5px/500, color `--accent`, text `#F3EFE9`, soft shadow `0 10px 24px rgba(31,39,51,0.22)`.
- **Mood dot / orb:** circle filled with mood color. The "glossy" look = an inner top highlight + soft drop shadow. In RN approximate with a subtle `borderColor rgba(0,0,0,0.06)` + a small white radial (or just the flat color + `shadowOpacity ~0.12`). Sizes: 18 (chip), 46–56 (cards), 70–92 (picker/insight).
- **Generous whitespace.** Screen padding 24px horizontal in headers, 16px around card lists.
- **Hit targets ≥ 44px.**

### Type scale (key sizes, px)
- Section eyebrow: 11, letter-spacing 2.4, UPPERCASE, `--ink-3`, weight 500
- Screen title (date / "Today's macros"): 27–30, weight 300, letter-spacing -0.4
- Card title: 14.5, weight 500
- Body/secondary: 12.5–13.5, `--ink-2/3`
- Macro numbers: 17–18 tabular-nums, weight 400
- Insight line: Newsreader italic 16, line-height 1.5

---

## Screens / Views

The app is a **3-tab native app** with a raised center "Capture" button and two stacked modal flows. Bottom tab bar order: **Home · Moods · Capture(center) · Journal · Profile**.

### 1. Home (`screens.jsx` → `HomeScreen`)
- **Purpose:** daily journal feed + glance at mood distribution & macro totals.
- **Layout (top→bottom):**
  - Header (pad 64/24/16): "TODAY" eyebrow + a right-aligned **mood pill** ("Mostly energetic" with a small dot) that opens the **Day View**. Big date ("Tuesday, June 9") at 30/300.
  - Right-aligned day macro totals: Protein / Carbs / Fat in grams (text only, minimal).
  - **7-day Mood Spectrum** bar ("This week … Mood journey"): a single horizontal rounded bar that **blends** between each day's mood color (Mon→Sun), with M T W Th F Sa Su labels beneath and a marker on "today." It is a *continuous gradient*, not 7 discrete blocks. (Data: `WEEK` in `data.jsx`.)
  - Hairline divider.
  - **Meal feed** (scroll): one card per meal — `MealCard`. Left: **mood color dot** (46px). Overlapping it by ~25%: a small square **meal photo** (same ~46px, rounded). Center: meal title (ellipsized) + time. Right: stacked macro mini-readout (Protein/Carbs/Fat g, muted, with tiny macro-color dots). Tapping the photo opens an enlarged image; tapping the card opens **Macro Breakdown**.
  - **Monthly Mood Calendar** at the bottom of the feed (scroll down to reveal): month label with ‹ › to page months; Monday-first 7-col grid; each past day is a rounded tile filled with that day's dominant mood color (same glossy sheen as orbs); **today** has a ring; **future/un-logged days are plain white with a small black number.**
- **Bottom tab bar** is fixed (see Navigation). On Home it's visible; the raised center button is **Capture**.
- Meal photos come from Pexels CDN in the prototype (URLs in `data.jsx` `PHOTO`); in the app use the user's captured images, with these as seed/mock data.

### 2. Mood Picker (modal) (`screens.jsx` → `MoodPicker`)
- **Purpose:** pick how a meal left you feeling, right after Capture.
- **Layout:** back chevron (circle button). "NEW ENTRY" eyebrow, "How are you feeling?" (28/300), subline "Choose the colour that fits this meal."
- 5 mood rows in fixed order, each = large orb (70px; selected grows to 78 + check mark) + label + sublabel. Selecting one: scales/should feel tactile, others **dim to ~0.42**, selected row gets a card bg + shadow, and the **whole screen subtly tints** with that mood's color (top gradient wash).
- A **journal note** input is part of the post-capture breakdown (see below).
- Sticky **Continue** button slides up once a mood is chosen → goes to Macro Breakdown for the new entry.

### 3. Macro Breakdown (`screens.jsx` → `Breakdown`)
- **Purpose:** show macros for a meal (or the day). Visual + numeric. Works in two modes: per-meal (tapped from feed) and **daily** (mode `isDay`).
- **Layout:** back chevron; eyebrow (time or date); title (meal title or "Today's macros").
- **Mood indicator:** 56px orb + ("Logged feeling" / "Your mood today") + mood label.
- **Stacked macro bar:** single horizontal proportional bar, 3 segments (protein/carbs/fat) using macro colors, separated by thin bg-colored gaps; below it: total grams + kcal. Animate the segment widths on mount (~700ms ease).
- **Numeric breakdown:** 3 rows (dot + name + % + grams), divided by hairlines.
- **Insight:** Newsreader-italic observational line in a `--chip` card (e.g. "Your higher-protein days lean toward your energetic moods."). Observational, never prescriptive.
- **Journal note (post-capture only):** a text input "Add a note about this meal…" so the user can attach a reflection to the entry.
- Sticky primary button: "Done" (daily) / "Back to journal" (meal).

### 4. Day View (`screens.jsx` — opened from Home mood pill / spectrum day)
- **Purpose:** high-level story of a single day. Header: date + large dominant-mood orb + "Your mood today"; optional day macro summary row; meal cards (mood dot + photo + macro summary + time), latest first; tap a card → Macro Breakdown. No charts, no insights here.

### 5. Moods (tab) (`screens.jsx` — Moods manager)
- **Purpose:** full CRUD on the mood palette. Explains each mood and lets the user **add, rename, recolor, and delete** moods. These feed the post-meal mood picker. Each row: orb + label + sublabel + edit/delete affordances; an "add mood" action with a color picker. Keep the 5 defaults seeded.

### 6. Journal (tab) (`journal.jsx`)
- **Purpose:** premium, distraction-free reflection space (a journal, not a form).
- **List view:** entries grouped under **relative-time headers** — "THIS WEEK", "LAST WEEK", "EARLIER IN JUNE", then older months ("MAY"…). Each group header may show a small dominant-mood dot for the period. Entry card: small mood dot + "Tuesday · 2:45 PM" (no redundant month) + 2-line preview + optional "↳ Tuesday meals" link pill. Full-width "+ New Entry" button (sits a little above the tab bar so the center Capture button doesn't overlap it).
- **New Entry:** close (X) + Save (enabled only once text AND a mood orb are chosen). Optional metadata: date, **mood picker — orbs shown WITH their names**, max **5 orbs per row** (wraps to a new row beyond 5), and optional "link to a meal/day". Large free-text area ("What did you notice today?"), plain text, auto-save feel. **Saving requires a selected mood orb.**
- **Entry view:** date, prominent mood dot, optional meal link pill, full text, edit (pencil) + delete (trash w/ confirm).
- Search/filter by date range + mood color is specced (optional to implement first pass).

### 7. Profile (tab) (`profile.jsx`)
- **Purpose:** account + targets + reminder + about. Sections in order:
  1. **User info card** — avatar (tap to change), editable name, optional tagline.
  2. **Daily macro goals** — inline-editable Protein / Carbs / Fat (g), auto-save feel. **If "Count calories" is ON, a Calories goal field appears here (default 2000).**
  3. **Tracking** — "Show calories on meals" toggle, **default OFF**, help text: "Track calories alongside your macros. Off by default — this app is about how food makes you feel, not just numbers." When ON, meals/summaries/breakdown also show **calories** (use the long form "calories" / short form "cal"; never "kcal"). cal = 4·protein + 4·carbs + 9·fat.
  4. **Mood check-in reminder** — *no on/off toggle here.* A **slider** "Remind me after eating" from **30 → 120 min** (steps 30/45/60/90/120), with a dummy lock-screen notification preview above it ("Time to check in / How did your last meal leave you feeling?").
  5. **Account** — Log Out; Delete Account (subtle red, confirm modal "This cannot be undone").
  6. **About** — Version 1.0.0; Privacy; Terms; Contact & Support; and a **"Turn off notifications"** toggle (this is where notifications are disabled, not in section 4).

---

## Onboarding Flow (8 screens) — `onboarding-screens.jsx` / `Onboarding Flow.html`
First-run flow shown before the main app. Build after the core tabs. **Shared chrome on every screen:** iOS status bar (9:41 + signal/battery), a top row with a circular back chevron (hidden on Welcome + All-set), a centered **progress-dot indicator** (6 dots, active dot elongated) on screens 2–7, an optional **"Skip"** link (screens About-you, Set-targets, Reminders), and the home indicator. Canvas 390×844, background `--bg`. Headlines that are emotional use **Newsreader serif**; everything else Outfit. Primary button = full-width, `--accent`, 14px radius, label "Continue" (or the per-screen label below). No em dashes anywhere.

**1. Welcome** (no dots, no back) — Centered column: the **logo** (cluster of 5 overlapping mood dots, ~20px), "FOOD MOOD" eyebrow (uppercase, letter-spacing 3, `--ink-3`). Serif H1 **"How does food make you feel?"** (38px/400). Body: "A gentle way to notice the link between what you eat and how you feel." (`--ink-3`, max 280px). A **drifting mood-spectrum bar** (240×12, rounded, the looping mood gradient, slow continuous left-drift). Bottom: primary button **"Get started"**; below it a text link "I already have an account".

**2. The idea** (dots 1/6) — Three stacked lines, each a small mood dot + large text (30px/300, second word in `--ink-3`): "Mood **first.**" (calm dot), "Macros **second.**" (focused dot), "Calories **optional.**" (energetic dot). Paragraph below: "Most trackers reduce food to numbers. Food Mood starts with a feeling. The macros are just the story underneath." Button "Continue".

**3. About you** (dots 2/6, Skip) — H1 "A little about you" (30/300). Sub "This stays private. It just helps Food Mood feel like yours." Then:
  - **Avatar uploader:** 84px circle, dashed border, camera glyph, with a small accent "+" badge bottom-right; caption "Add a photo". (Wire to `expo-image-picker`.)
  - **Name** field (uppercase label) → text input, placeholder "Your name".
  - **Your goal** field → 4 selectable **pills** (single-select; selected = filled `--ink-1` with `--bg` text, others outlined): "Understand my patterns", "Eat more intentionally", "Feel better day to day", "Ease anxiety".
  - **What brought you here?** field → multiline input, **Newsreader italic** placeholder "I want to feel less anxious around food…".
  - Button "Continue".

**4. Meet your moods** (dots 3/6) — H1 "Meet your moods". Sub "Five feelings, five colours. You'll pick one after each meal, and you can make them your own later." List of the 5 moods, each: 52px glossy orb + label (18px) + sublabel (`--ink-3`). Order energetic → focused → calm → **Bloated** → sluggish. Button "Continue".

**5. How it works** (dots 4/6) — H1 "How it works". Three steps, each a 52px rounded `--chip` icon well with a numbered accent badge (top-left) + title + caption:
  1. **Capture a meal** — "Snap a photo and we'll read the macros." (camera icon)
  2. **Pick a feeling** — "Tap the colour that fits how you feel." (calm-colored orb icon)
  3. **See the pattern** — "Watch your week of mood + food unfold." (mini spectrum icon)
  Button "Continue".

**6. Set your targets** (dots 5/6, Skip) — H1 "Set your targets". Sub "Optional. Your daily macro goals. Change them anytime." A card with inline numeric rows: **Protein 120 (g)**, **Carbs 200 (g)**, **Fat 65 (g)**. Below, a **"Count calories"** toggle card, **default OFF**, help: "Adds a calorie goal above. Off by default, since mood and macros come first." When ON, a **Calories (cal)** row appears in the card above defaulting to **2000**. Button "Continue".

**7. Reminders** (dots 6/6, Skip) — H1 "When should we check in?" Sub "We'll send one gentle nudge after a meal to capture how you feel." A **dummy lock-screen notification** preview (app icon = mood gradient, "FOOD MOOD · now", title "Time to check in", body "How did your last meal leave you feeling?"). Below, a timing card "Remind me after eating" with "How long after · 60 min" and a **slider from 30 min to 2 hr** (no on/off toggle — a reminder is always set; steps 30/45/60/90/120). Button "Continue".

**8. All set** (no dots, no back) — Centered: a drifting mood-spectrum bar (250×14). Serif H1 **"You're all set."** Body "Log your first meal and start feeling better!" Button **"Start tracking"** → enters the app (Home).

---

## Interactions & Behavior
- **Navigation:** native-stack. Tab bar (Home/Moods/Capture/Journal/Profile). Capture(center, raised, accent circle with camera glyph) → opens camera/library (`expo-image-picker`) → **Mood Picker** modal → **Macro Breakdown** (new entry, with note) → back to Home. Tap meal card → Macro Breakdown. Tap Home mood pill / a spectrum day → Day View.
- **Screen transitions:** gentle. In the prototype, entrance animates **transform only** (slide-up ~10px, 460ms) and never fades content from `opacity:0` (so nothing is ever stuck hidden). Use native stack transitions; keep motion subtle/refined.
- **Mood select:** tactile — selected orb scales up (spring), unselected dim to 0.42, screen tints to the mood color.
- **Macro bar:** segment widths animate in (~700ms, ease-out).
- **Calendar:** ‹ › page months; today ringed; future days empty/white.
- **Reduced motion:** respect it — show end states without entrance animation.
- **Persistence:** prototype uses `localStorage`; in the app use **AsyncStorage** (meals, journal entries, custom moods, profile targets, toggles, reminder timing).

## State Management
Keep it simple (Context + hooks, or Zustand). Core state:
- `theme` (light/dark — optional; prototype defaults light), `accent`, `macroPalette`, `radius` (these last are prototype "tweaks", not required user settings — ship sensible defaults).
- `moods` (the editable palette — seed with the 5 defaults; CRUD from Moods tab).
- `meals` (per day; seed with `MEALS`/`mealsForDay`), `journalEntries`, `profile` (`name`, `avatar`, `targets {protein,carbs,fat,calories}`, `showCalories:false`, `reminderMinutes:60`, `notificationsOn:true`).
- Derived: `dayTotals(meals)`, `dominantMood(meals)` (see `data.jsx` for exact logic).

## Copy / Writing style
- **No em dashes (—) in any user-facing copy.** Use periods, commas, or restructure. (Use a hyphen or rephrase.)
- Tone: calm, soulful, observational, non-judgmental. No gamification language.

## Assets
- **Fonts:** Outfit + Newsreader (Google Fonts) — bundle into `assets/fonts/`.
- **Meal photos:** the prototype pulls food shots from the **Pexels CDN** (IDs in `data.jsx`: oats 5604832, bowl 33103094, matcha 32695045, salmon 7627415). These are placeholders/seed data — in production they're the user's captured photos. Replace mock seeds with your own licensed images if shipping.
- **Icons:** simple line icons (camera, home, person, journal, 3-dot mood cluster, chevrons). Use `@expo/vector-icons` (Feather/Ionicons) to match the thin, minimal style — do not hand-draw.
- `app-home.png` (included) — reference screenshot of the finished Home screen.
- `screenshots/` — pixel-faithful 390×844 captures of all 17 screens (9 app + 8 onboarding). See the Screenshots table above.

## Files in this bundle (design references)
- `Food Mood.html` — the **main app**: theme tokens, navigation wiring, tab bar, and the Tweaks panel. **Start here.**
- `data.jsx` — **all design tokens + mock data + helper logic** (moods, meals, week spectrum, calendar, dayTotals, dominantMood). The single source of truth for values.
- `screens.jsx` — Home, Mood Picker, Macro Breakdown, Day View, Moods manager, the MealCard / MoodDot / MacroBar / Calendar building blocks.
- `journal.jsx` — Journal list (relative-time grouping), New Entry, Entry view.
- `profile.jsx` — Profile/settings (targets, tracking, reminder slider, account, about).
- `onboarding-screens.jsx` + `Onboarding Flow.html` — the onboarding flow laid out screen-by-screen (welcome with animated drifting spectrum, mood intro, "About you" personal screen, set-targets, reminders). Build after the core 3 tabs.
- `app-home.png` — finished Home screen screenshot for visual reference.

### Ignore these (web-prototype scaffolding, NOT part of the app)
- `ios-frame.jsx` — a fake iPhone bezel used only to present the web prototype. Expo Go runs on a real device; **do not port this.**
- `tweaks-panel.jsx` — an in-prototype live-controls panel (dark mode / radius / accent / macro palette). These are author tools; ship their defaults, not the panel.
- `image-slot.js` — a web drag-and-drop image placeholder; replace with `expo-image-picker`.

---

## Recommended build order
1. Tokens + fonts + theme provider (from `data.jsx` + Food Mood.html token block).
2. Shared atoms: `MoodDot`, `MacroBar`, `MealCard`.
3. Navigation shell + bottom tab bar (with raised Capture).
4. **Home** (header, spectrum, feed, calendar).
5. **Capture → Mood Picker → Macro Breakdown** flow (with note + image picker).
6. **Day View**.
7. **Journal** (list grouping → New Entry → Entry view).
8. **Moods** CRUD.
9. **Profile** (targets, tracking, reminder slider, about).
10. **Onboarding** flow.

The README is self-sufficient — pair it with the exact values in `data.jsx` and you can build the whole app from this bundle alone.
