// data.jsx — design tokens + mock data for Food Mood

// ── Mood palette ─────────────────────────────────────────────
// Each mood: id, label, sublabel, color, and whether it needs dark text on it.
const MOODS = {
  energetic: {
    id: 'energetic', label: 'Energetic', sub: 'excited, flowing',
    color: '#F4E4C1', ink: '#5A4A2A', darkText: true,
  },
  focused: {
    id: 'focused', label: 'Focused', sub: 'content, stable',
    color: '#C9A876', ink: '#4A3A1E', darkText: true,
  },
  calm: {
    id: 'calm', label: 'Calm', sub: 'grounded, peaceful',
    color: '#A8B8A0', ink: '#33402C', darkText: true,
  },
  contemplative: {
    id: 'contemplative', label: 'Bloated', sub: 'heavy, full',
    color: '#7A8FA3', ink: '#fff', darkText: false,
  },
  sluggish: {
    id: 'sluggish', label: 'Sluggish', sub: 'low energy, anxious',
    color: '#8B4F5C', ink: '#fff', darkText: false,
  },
};

// Order for the mood picker (energetic → bloated)
const MOOD_ORDER = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];

// Pexels CDN — clean, watermark-free, food-matched stock photos.
const PX = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=240&h=240&fit=crop&dpr=2`;
const PHOTO = {
  oats: PX(5604832),   // oatmeal + berries
  bowl: PX(33103094),  // wholesome grain bowl
  matcha: PX(32695045),// iced matcha latte
  salmon: PX(7627415), // salmon dinner plate
};

// ── Mock meals (today) ───────────────────────────────────────
const MEALS = [
  {
    id: 'm1', title: 'Oats, berries & honey', time: '8:10 AM',
    mood: 'energetic', slot: 'meal-oats', img: PHOTO.oats,
    macros: { protein: 18, carbs: 52, fat: 9 },
  },
  {
    id: 'm2', title: 'Roasted grain bowl', time: '12:40 PM',
    mood: 'focused', slot: 'meal-bowl', img: PHOTO.bowl,
    macros: { protein: 32, carbs: 48, fat: 16 },
  },
  {
    id: 'm3', title: 'Matcha & almonds', time: '3:30 PM',
    mood: 'calm', slot: 'meal-matcha', img: PHOTO.matcha,
    macros: { protein: 8, carbs: 14, fat: 18 },
  },
  {
    id: 'm4', title: 'Salmon & bitter greens', time: '7:15 PM',
    mood: 'contemplative', slot: 'meal-salmon', img: PHOTO.salmon,
    macros: { protein: 38, carbs: 22, fat: 20 },
  },
];

const TODAY = 'Tuesday, June 9';

// ── This week's mood journey (Mon → Sun) ─────────────────────
// Each day carries its dominant mood; the spectrum bar blends between them.
const WEEK = [
  { label: 'M',  day: 'Monday',    date: 'Monday, June 8',    moodId: 'sluggish' },
  { label: 'T',  day: 'Tuesday',   date: 'Tuesday, June 9',   moodId: 'energetic', today: true },
  { label: 'W',  day: 'Wednesday', date: 'Wednesday, June 10', moodId: 'focused' },
  { label: 'Th', day: 'Thursday',  date: 'Thursday, June 11', moodId: 'calm' },
  { label: 'F',  day: 'Friday',    date: 'Friday, June 12',   moodId: 'energetic' },
  { label: 'Sa', day: 'Saturday',  date: 'Saturday, June 13', moodId: 'calm' },
  { label: 'Su', day: 'Sunday',    date: 'Sunday, June 14',   moodId: 'contemplative' },
];

// Meal templates the per-day builder draws from.
const POOL = [
  { key: 'oats',   title: 'Oats, berries & honey', time: '8:10 AM',  img: PHOTO.oats,   macros: { protein: 18, carbs: 52, fat: 9 } },
  { key: 'bowl',   title: 'Roasted grain bowl',    time: '12:40 PM', img: PHOTO.bowl,   macros: { protein: 32, carbs: 48, fat: 16 } },
  { key: 'matcha', title: 'Matcha & almonds',      time: '3:30 PM',  img: PHOTO.matcha, macros: { protein: 8,  carbs: 14, fat: 18 } },
  { key: 'salmon', title: 'Salmon & bitter greens', time: '7:15 PM', img: PHOTO.salmon, macros: { protein: 38, carbs: 22, fat: 20 } },
];

// Meals logged on a given week-day. Today returns the hand-authored set;
// other days are built so the day's dominant mood matches the spectrum.
function mealsForDay(dayKey) {
  const wd = WEEK.find(d => d.label === dayKey) || WEEK[1];
  if (wd.today) return MEALS;
  const idx = WEEK.indexOf(wd);
  const lunch = POOL[idx % 2 === 0 ? 1 : 2];       // alternate bowl / matcha
  const second = MOOD_ORDER[(MOOD_ORDER.indexOf(wd.moodId) + 2) % MOOD_ORDER.length];
  // breakfast + lunch carry the day's mood; dinner a contrasting one → dominant = day mood
  return [
    { id: `${wd.label}-b`, title: POOL[0].title, time: POOL[0].time, img: POOL[0].img, macros: POOL[0].macros, mood: wd.moodId },
    { id: `${wd.label}-l`, title: lunch.title,   time: lunch.time,   img: lunch.img,   macros: lunch.macros,   mood: wd.moodId },
    { id: `${wd.label}-d`, title: POOL[3].title, time: POOL[3].time, img: POOL[3].img, macros: POOL[3].macros, mood: second },
  ];
}

function dayTotals(meals) {
  return meals.reduce((a, m) => ({
    protein: a.protein + m.macros.protein,
    carbs: a.carbs + m.macros.carbs,
    fat: a.fat + m.macros.fat,
  }), { protein: 0, carbs: 0, fat: 0 });
}

// dominant mood = most frequent (ties → first logged)
function dominantMood(meals) {
  const count = {};
  meals.forEach(m => { count[m.mood] = (count[m.mood] || 0) + 1; });
  return meals.map(m => m.mood).sort((a, b) => count[b] - count[a])[0];
}

Object.assign(window, { MOODS, MOOD_ORDER, MEALS, TODAY, WEEK, POOL, mealsForDay, dayTotals, dominantMood });
