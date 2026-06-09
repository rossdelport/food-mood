// screens.jsx — Home, Mood Picker, Macro Breakdown
// Relies on globals from data.jsx (MOODS, MOOD_ORDER, MEALS, TODAY, dayTotals, dominantMood)

const { useState } = React;

// ── shared helpers ───────────────────────────────────────────
function macroGrams(m) { return m.protein + m.carbs + m.fat; }
function kcalOf(m) { return Math.round(m.protein * 4 + m.carbs * 4 + m.fat * 9); }

// A filled mood circle — the emotional anchor.
function MoodDot({ moodId, size = 48, ring = true }) {
  const mood = MOODS[moodId];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: mood.color,
      boxShadow: ring
        ? 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 6px 12px rgba(255,255,255,0.35), 0 2px 8px rgba(0,0,0,0.08)'
        : 'none',
    }} />
  );
}

// Horizontal stacked macro bar (proportional).
function MacroBar({ macros, colors, height = 14, radius = 6 }) {
  const total = macroGrams(macros) || 1;
  const segs = [
    { key: 'protein', v: macros.protein, c: colors.protein },
    { key: 'carbs', v: macros.carbs, c: colors.carbs },
    { key: 'fat', v: macros.fat, c: colors.fat },
  ];
  return (
    <div style={{
      display: 'flex', width: '100%', height, borderRadius: radius,
      overflow: 'hidden', background: 'rgba(0,0,0,0.04)',
    }}>
      {segs.map((s, i) => (
        <div key={s.key} style={{
          width: `${(s.v / total) * 100}%`, background: s.c,
          borderRight: i < 2 ? '1.5px solid var(--bg)' : 'none',
          transition: 'width 700ms cubic-bezier(.22,.61,.36,1)',
        }} />
      ))}
    </div>
  );
}

// Tiny stacked macro readout for cards.
function MacroMini({ macros, colors }) {
  const rows = [
    ['Protein', macros.protein, colors.protein],
    ['Carbs', macros.carbs, colors.carbs],
    ['Fat', macros.fat, colors.fat],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
      {rows.map(([label, v, c]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', letterSpacing: 0.1 }}>{label}</span>
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', minWidth: 30, textAlign: 'right' }}>{v}<span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>g</span></span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// Reusable meal row — mood dot · photo · title/time · macro readout.
function MealCard({ meal, radius, macroColors, onOpen, photo = 56, showCal }) {
  return (
    <button onClick={() => onOpen(meal)} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
      textAlign: 'left', cursor: 'pointer', border: '1px solid var(--line)',
      background: 'var(--card)', borderRadius: radius + 4, padding: '12px 14px',
      transition: 'transform 160ms ease',
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.985)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <MoodDot moodId={meal.mood} size={46} />
      <div style={{ width: photo, height: photo, flexShrink: 0, borderRadius: Math.max(4, radius), overflow: 'hidden', border: '1px solid var(--line)', background: 'repeating-linear-gradient(45deg, var(--chip) 0 5px, var(--card) 5px 10px)' }}>
        <img src={meal.img} alt={meal.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, color: 'var(--ink-1)', fontWeight: 500, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>{meal.time}{showCal ? ` · ${kcalOf(meal.macros)} cal` : ''}</div>
      </div>
      <MacroMini macros={meal.macros} colors={macroColors} />
    </button>
  );
}

// 7-day mood spectrum — a flowing journey, not discrete points.
function WeekSpectrum({ radius = 6, onDay }) {
  const colors = WEEK.map(d => MOODS[d.moodId].color);
  // pure color at each day's centre, held to the edges → smooth organic blend
  const stops = WEEK.map((d, i) => `${colors[i]} ${(((i + 0.5) / WEEK.length) * 100).toFixed(2)}%`).join(', ');
  const todayIdx = WEEK.findIndex(d => d.today);
  const todayLeft = `${((todayIdx + 0.5) / WEEK.length) * 100}%`;
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
        <span style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>This week</span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Mood journey</span>
      </div>
      {/* gradient bar */}
      <div style={{
        position: 'relative', height: 60, borderRadius: radius + 2,
        backgroundImage: `linear-gradient(90deg, ${stops})`,
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -2px 6px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.10)',
      }}>
        {/* soft sheen for depth */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: radius + 2, background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 38%)', pointerEvents: 'none' }} />
        {/* today marker */}
        <div style={{ position: 'absolute', top: 6, bottom: 6, left: todayLeft, transform: 'translateX(-50%)', width: 2, borderRadius: 2, background: 'rgba(255,255,255,0.7)', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} />
        <div style={{ position: 'absolute', top: -3, left: todayLeft, transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-1)' }} />
        {/* tappable day regions */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {WEEK.map((d, i) => (
            <button key={i} onClick={() => onDay && onDay(d)} aria-label={d.day} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              borderRight: i < WEEK.length - 1 ? '1px solid rgba(255,255,255,0.10)' : 'none',
            }} />
          ))}
        </div>
      </div>
      {/* day labels */}
      <div style={{ display: 'flex', marginTop: 7 }}>
        {WEEK.map((d, i) => (
          <button key={i} onClick={() => onDay && onDay(d)} style={{ flex: 1, textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: d.today ? 600 : 300, color: d.today ? 'var(--ink-1)' : 'var(--ink-3)', letterSpacing: 0.2 }}>{d.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Bottom tab bar ───────────────────────────────────────────
function NavIcon({ name, color }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const ic = {
    home: <g><path d="M4 11.3 12 5l8 6.3" {...s} /><path d="M6.2 10.3V19h11.6v-8.7" {...s} /></g>,
    moods: <g><circle cx="9.2" cy="9.6" r="3.1" {...s} /><circle cx="14.8" cy="9.6" r="3.1" {...s} /><circle cx="12" cy="14.6" r="3.1" {...s} /></g>,
    journal: <g><rect x="5" y="4.5" width="14" height="15" rx="2" {...s} /><path d="M9 4.5v15" {...s} /><path d="M12 9.5h4M12 13h4" {...s} /></g>,
    profile: <g><circle cx="12" cy="8.4" r="3.3" {...s} /><path d="M5.8 19a6.2 6.2 0 0 1 12.4 0" {...s} /></g>,
  };
  return <svg width="23" height="23" viewBox="0 0 24 24">{ic[name]}</svg>;
}

function BottomNav({ active, accent, onHome, onMoods, onCapture, onJournal, onProfile, onDisabled }) {
  const tab = (key, label, enabled, onClick) => {
    const isActive = active === key;
    const color = !enabled ? 'var(--ink-3)' : isActive ? 'var(--ink-1)' : 'var(--ink-2)';
    return (
      <button key={key} onClick={enabled ? onClick : () => onDisabled(label)} style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'default',
        opacity: enabled ? 1 : 0.4, padding: '4px 0',
      }}>
        <NavIcon name={key} color={color} />
        <span style={{ fontSize: 10, letterSpacing: 0.2, fontWeight: isActive ? 600 : 400, color }}>{label}</span>
      </button>
    );
  };
  return (
    <nav style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '11px 14px 26px', background: 'var(--card)',
      borderTop: '1px solid var(--line)', boxShadow: '0 -6px 22px rgba(0,0,0,0.05)',
    }}>
      {tab('home', 'Home', true, onHome)}
      {tab('moods', 'Moods', true, onMoods)}
      {/* center capture */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button onClick={onCapture} aria-label="Capture" style={{
          width: 52, height: 52, borderRadius: '50%', marginTop: -26, cursor: 'pointer',
          border: '3px solid var(--card)', background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 18px rgba(31,39,51,0.28)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="3.6" stroke="#F3EFE9" strokeWidth="1.8" /><path d="M4 8.5A1.5 1.5 0 015.5 7h1.7l1-1.6a1 1 0 01.85-.47h5.9a1 1 0 01.85.47l1 1.6h1.7A1.5 1.5 0 0120 8.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5v-9z" stroke="#F3EFE9" strokeWidth="1.5" /></svg>
        </button>
        <span style={{ fontSize: 10, letterSpacing: 0.2, color: 'var(--ink-2)', fontWeight: 500 }}>Capture</span>
      </div>
      {tab('journal', 'Journal', true, onJournal)}
      {tab('profile', 'Profile', true, onProfile)}
    </nav>
  );
}

// ── Screen 1 · Home ──────────────────────────────────────────
const CAL_TODAY = { y: 2026, m: 5, d: 9 }; // June 9, 2026
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// dominant mood for a given day (mock): null when the day is in the future
function monthDayMood(year, month, day) {
  const today = new Date(CAL_TODAY.y, CAL_TODAY.m, CAL_TODAY.d);
  const date = new Date(year, month, day);
  if (date > today) return null;
  return MOOD_ORDER[(day * 3 + month * 5 + 1) % MOOD_ORDER.length];
}

function Calendar({ t }) {
  const [off, setOff] = useState(0);
  const base = new Date(CAL_TODAY.y, CAL_TODAY.m + off, 1);
  const year = base.getFullYear(), month = base.getMonth();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const radius = Math.max(7, t.radius);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);
  const isToday = (d) => year === CAL_TODAY.y && month === CAL_TODAY.m && d === CAL_TODAY.d;
  const arrow = (dir, onClick) => (
    <button onClick={onClick} aria-label={dir < 0 ? 'Previous month' : 'Next month'} style={{ border: 'none', background: 'var(--chip)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="8" height="14" viewBox="0 0 9 16" fill="none" style={{ transform: dir < 0 ? 'none' : 'rotate(180deg)' }}><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14, paddingLeft: 2 }}>Mood calendar</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        {arrow(-1, () => setOff(off - 1))}
        <span style={{ fontSize: 17, color: 'var(--ink-1)', fontWeight: 400, letterSpacing: -0.2 }}>{MONTH_NAMES[month]} {year}</span>
        {arrow(1, () => setOff(off + 1))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, i) => (
          <div key={'w' + i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', fontWeight: 500, paddingBottom: 2 }}>{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={'b' + i} />;
          const moodId = monthDayMood(year, month, d);
          const mood = moodId ? MOODS[moodId] : null;
          const today = isToday(d);
          return (
            <div key={d} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: radius, background: mood ? mood.color : 'var(--card)', border: mood ? 'none' : '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: [today ? '0 0 0 2px var(--ink-1)' : '', mood ? 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 5px 10px rgba(255,255,255,0.4)' : ''].filter(Boolean).join(', ') || 'none' }}>
              <span style={{ fontSize: 12, fontWeight: today ? 600 : 400, color: mood ? (mood.darkText ? mood.ink : '#fff') : 'var(--ink-1)' }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeScreen({ t, showCal, onCapture, onOpenMeal, onOpenDayView, onOpenMoods, onOpenJournal, onOpenProfile }) {
  const totals = dayTotals(MEALS);
  const totalCal = MEALS.reduce((a, m) => a + kcalOf(m.macros), 0);
  const dom = dominantMood(MEALS);
  const radius = t.radius;
  const macroColors = { protein: t.macro[0], carbs: t.macro[1], fat: t.macro[2] };
  const [toast, setToast] = useState(null);
  const showToast = (label) => {
    setToast(`${label} · coming soon`);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 1900);
  };

  return (
    <div data-screen-label="Home" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* header */}
      <div style={{ padding: '64px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>Today</div>
          <button onClick={() => onOpenDayView(WEEK.find(d => d.today))} style={{
            display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
            background: 'var(--chip)', borderRadius: 999, padding: '6px 12px 6px 8px',
          }}>
            <MoodDot moodId={dom} size={18} ring={false} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>Mostly {MOODS[dom].label.toLowerCase()}</span>
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 30, lineHeight: 1.1, color: 'var(--ink-1)', fontWeight: 300, letterSpacing: -0.4 }}>{TODAY}</div>
        <WeekSpectrum radius={t.radius} onDay={onOpenDayView} />
        {/* macro totals — minimal, right-aligned */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
          {[...(showCal ? [['Cal', totalCal, '']] : []), ['Protein', totals.protein, 'g'], ['Carbs', totals.carbs, 'g'], ['Fat', totals.fat, 'g']].map(([l, v, u]) => (
            <div key={l} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, color: 'var(--ink-1)', fontWeight: 400, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>{v}<span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u}</span></div>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--line)', margin: '0 24px' }} />

      {/* feed bottom padding clears the tab bar */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 116px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MEALS.map(m => (
            <MealCard key={m.id} meal={m} radius={radius} macroColors={macroColors} onOpen={onOpenMeal} photo={56} showCal={showCal} />
          ))}
        </div>
        <Calendar t={t} />
      </div>

      {/* coming-soon toast */}
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 104, transform: 'translateX(-50%)',
          zIndex: 50, background: 'var(--ink-1)', color: 'var(--bg)',
          fontSize: 12.5, padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap',
          boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
        }}>{toast}</div>
      )}

      {/* bottom tab bar */}
      <BottomNav active="home" accent={t.accent}
        onHome={() => {}}
        onMoods={onOpenMoods}
        onCapture={onCapture}
        onJournal={onOpenJournal}
        onProfile={onOpenProfile}
        onDisabled={showToast} />
    </div>
  );
}

// ── Screen 2 · Mood Picker (post-meal logging) ───────────────
function MoodPicker({ t, moods, onBack, onContinue }) {
  const [sel, setSel] = useState(null);
  const selMood = moods.find(m => m.id === sel);
  const tint = selMood ? selMood.color : null;

  return (
    <div data-screen-label="Mood Picker" style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: tint ? `linear-gradient(180deg, ${hexA(tint, 0.16)} 0%, var(--bg) 46%)` : 'var(--bg)',
      transition: 'background 600ms ease', position: 'relative',
    }}>
      {/* top bar */}
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ padding: '22px 28px 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>New entry</div>
        <h1 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>How are you feeling?</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-3)' }}>Choose the colour that fits this meal.</p>
      </div>

      {/* palette */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px 130px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {moods.map(mood => {
            const active = sel === mood.id;
            const dim = sel && !active;
            return (
              <button key={mood.id} onClick={() => setSel(mood.id)} style={{
                display: 'flex', alignItems: 'center', gap: 18, width: '100%', textAlign: 'left',
                border: active ? '1px solid rgba(0,0,0,0.10)' : '1px solid transparent',
                background: active ? 'var(--card)' : 'transparent',
                borderRadius: t.radius + 10, padding: '10px 14px', cursor: 'pointer',
                opacity: dim ? 0.42 : 1,
                boxShadow: active ? '0 8px 22px rgba(0,0,0,0.08)' : 'none',
                transition: 'opacity 320ms ease, background 320ms ease, box-shadow 320ms ease, border-color 320ms ease',
              }}>
                <div style={{
                  width: active ? 78 : 70, height: active ? 78 : 70, borderRadius: '50%',
                  background: mood.color, flexShrink: 0, position: 'relative',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 8px 16px rgba(255,255,255,0.4), 0 4px 14px rgba(0,0,0,0.10)',
                  transition: 'all 360ms cubic-bezier(.34,1.56,.64,1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ animation: 'pop 360ms cubic-bezier(.34,1.56,.64,1)' }}><path d="M5 12.5l4.2 4.3L19 7" stroke={mood.darkText ? mood.ink : '#fff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 19, color: 'var(--ink-1)', fontWeight: active ? 500 : 400, letterSpacing: -0.2, transition: 'font-weight 200ms' }}>{mood.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{mood.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* continue */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 20px 30px',
        transform: sel ? 'translateY(0)' : 'translateY(140%)', opacity: sel ? 1 : 0,
        transition: 'transform 420ms cubic-bezier(.22,.61,.36,1), opacity 320ms ease',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <button onClick={() => sel && onContinue(sel)} style={{
          width: '100%', border: 'none', cursor: 'pointer', color: '#F3EFE9',
          background: 'var(--accent)', borderRadius: t.radius + 6, padding: '17px 0',
          fontSize: 15.5, fontWeight: 500, letterSpacing: 0.2,
          boxShadow: '0 10px 24px rgba(31,39,51,0.22)',
        }}>Continue</button>
      </div>
    </div>
  );
}

// ── Screen 3 · Macro Breakdown ───────────────────────────────
function Breakdown({ t, showCal, meal, onBack, onDone, capturedMood }) {
  const [note, setNote] = useState('');
  const [zoom, setZoom] = useState(false);
  // meal === null → daily view
  const isDay = !meal;
  const macros = isDay ? dayTotals(MEALS) : meal.macros;
  const moodId = capturedMood || (isDay ? dominantMood(MEALS) : meal.mood);
  const mood = MOODS[moodId];
  const total = macroGrams(macros);
  const macroColors = { protein: t.macro[0], carbs: t.macro[1], fat: t.macro[2] };
  const rows = [
    ['Protein', macros.protein, macroColors.protein],
    ['Carbs', macros.carbs, macroColors.carbs],
    ['Fat', macros.fat, macroColors.fat],
  ];
  const insight = isDay
    ? 'Your higher-protein days lean toward your energetic moods.'
    : `${mood.label} meals like this tend to sit lighter on carbs.`;

  return (
    <div data-screen-label="Macro Breakdown" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 130px' }}>
        <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{isDay ? TODAY : meal.time}</div>
        <h1 style={{ margin: '8px 0 0', fontSize: 27, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>{isDay ? 'Today\u2019s macros' : meal.title}</h1>

        {/* mood indicator (+ overlapping meal photo on single-meal view) */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MoodDot moodId={moodId} size={56} />
            {!isDay && meal.img && (
              <button onClick={() => setZoom(true)} aria-label="View photo" style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', marginLeft: -14, border: '2px solid var(--bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', flexShrink: 0, padding: 0, cursor: 'zoom-in', background: 'none' }}>
                <img src={meal.img} alt={meal.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{isDay ? 'Your mood today' : 'Logged feeling'}</div>
            <div style={{ fontSize: 18, color: 'var(--ink-1)', fontWeight: 400, marginTop: 2 }}>{mood.label}</div>
          </div>
        </div>

        {/* stacked bar */}
        <div style={{ marginTop: 30 }}>
          <MacroBar macros={macros} colors={macroColors} height={20} radius={t.radius} />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
            <span>{total} g total</span>
            {showCal && <span>{kcalOf(macros)} cal</span>}
          </div>
        </div>

        {/* numeric breakdown */}
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column' }}>
          {rows.map(([label, v, c], i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              <span style={{ flex: 1, fontSize: 15, color: 'var(--ink-1)' }}>{label}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{Math.round((v / total) * 100)}%</span>
              <span style={{ fontSize: 17, color: 'var(--ink-1)', fontWeight: 400, fontVariantNumeric: 'tabular-nums', minWidth: 48, textAlign: 'right' }}>{v}<span style={{ fontSize: 12, color: 'var(--ink-3)' }}> g</span></span>
            </div>
          ))}
        </div>

        {/* insight */}
        <div style={{ marginTop: 24, padding: '16px 18px', background: 'var(--chip)', borderRadius: t.radius + 6 }}>
          <p style={{ margin: 0, fontFamily: 'Newsreader, Georgia, serif', fontStyle: 'italic', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)' }}>{insight}</p>
        </div>

        {/* journal note — only when logging a freshly captured meal */}
        {capturedMood && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>Add a note <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>· optional</span></div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What did this meal leave you feeling?"
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 92, resize: 'none', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: t.radius + 6, padding: '14px 16px', fontFamily: 'Newsreader, Georgia, serif', fontSize: 16, lineHeight: 1.55, color: 'var(--ink-1)', outline: 'none' }} />
            <p style={{ margin: '8px 2px 0', fontSize: 11.5, color: 'var(--ink-3)' }}>Saved to your journal with this mood.</p>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 20px 30px', background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <button onClick={() => onDone(note)} style={{
          width: '100%', border: 'none', cursor: 'pointer', color: '#F3EFE9',
          background: 'var(--accent)', borderRadius: t.radius + 6, padding: '17px 0',
          fontSize: 15.5, fontWeight: 500, letterSpacing: 0.2,
          boxShadow: '0 10px 24px rgba(31,39,51,0.22)',
        }}>{capturedMood && note.trim() ? 'Save & Done' : 'Done'}</button>
      </div>

      {/* photo lightbox */}
      {zoom && !isDay && meal.img && (
        <div onClick={() => setZoom(false)} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(18,16,14,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 26, cursor: 'zoom-out' }}>
          <img src={meal.img} alt={meal.title} style={{ width: '100%', maxWidth: 330, borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.55)' }} />
          <div style={{ marginTop: 20, color: 'rgba(255,255,255,0.92)', fontSize: 17, fontWeight: 400 }}>{meal.title}</div>
          <div style={{ marginTop: 5, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Tap to close</div>
        </div>
      )}
    </div>
  );
}

// ── Screen 4 · Day View (tapped from the spectrum) ───────────
function DayView({ t, showCal, day, onBack, onOpenMeal }) {
  const meals = mealsForDay(day.label);
  const dom = dominantMood(meals);
  const mood = MOODS[dom];
  const totals = dayTotals(meals);
  const totalCal = meals.reduce((a, m) => a + kcalOf(m.macros), 0);
  const macroColors = { protein: t.macro[0], carbs: t.macro[1], fat: t.macro[2] };
  const latestFirst = meals.slice().reverse();

  return (
    <div data-screen-label="Day View" style={{
      height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
      background: `linear-gradient(180deg, ${hexA(mood.color, 0.16)} 0%, var(--bg) 42%)`,
    }}>
      <div style={{ padding: '58px 20px 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
        {/* header */}
        <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{day.today ? 'Today' : 'Day view'}</div>
        <h1 style={{ margin: '8px 0 0', fontSize: 27, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>{day.date}</h1>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <MoodDot moodId={dom} size={62} />
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Your mood {day.today ? 'today' : 'this day'}</div>
            <div style={{ fontSize: 20, color: 'var(--ink-1)', fontWeight: 400, marginTop: 2 }}>{mood.label}</div>
          </div>
        </div>

        {/* daily macro summary — context, not the focus */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--ink-3)' }}>
          {[...(showCal ? [['', totalCal, ' cal']] : []), ['Protein', totals.protein, 'g'], ['Carbs', totals.carbs, 'g'], ['Fat', totals.fat, 'g']].map(([l, v, u], i) => (
            <React.Fragment key={l + u}>
              {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-3)', opacity: 0.5 }} />}
              <span>{l ? l + ' ' : ''}<span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{v}{u}</span></span>
            </React.Fragment>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--line)', margin: '22px 0 18px' }} />

        {/* meals — latest first */}
        <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>{meals.length} meals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {latestFirst.map(m => (
            <MealCard key={m.id} meal={m} radius={t.radius} macroColors={macroColors} onOpen={onOpenMeal} photo={64} showCal={showCal} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mood CRUD helpers ────────────────────────────────────────
const MOOD_SWATCHES = ['#8B4F5C', '#C9A876', '#F4E4C1', '#A8B8A0', '#7A8FA3', '#B0846A', '#9A7AA0', '#6E8B8B', '#C98B7A', '#7D9070', '#A98DA6', '#6F7E94'];

function luminance(hex) {
  const n = hex.replace('#', '');
  const ch = i => parseInt(n.slice(i, i + 2), 16) / 255;
  const lin = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(ch(0)) + 0.7152 * lin(ch(2)) + 0.0722 * lin(ch(4));
}
function makeMood(label, sub, color, id) {
  const darkText = luminance(color) > 0.45;
  return {
    id: id || ('mood-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)),
    label: (label || '').trim() || 'Untitled', sub: (sub || '').trim(),
    color, darkText, ink: darkText ? '#3A332C' : '#ffffff',
  };
}

// ── Screen 5 · Moods manager (the "Moods" tab) ───────────────
function MoodsManager({ t, moods, setMoods, accent, onHome, onCapture, onJournal, onProfile }) {
  const [editing, setEditing] = useState(null); // {mode, id?, label, sub, color}
  const [toast, setToast] = useState(null);
  const showToast = (label) => { setToast(`${label} · coming soon`); clearTimeout(showToast._t); showToast._t = setTimeout(() => setToast(null), 1900); };
  const set = (patch) => setEditing(e => ({ ...e, ...patch }));
  const startNew = () => setEditing({ mode: 'new', label: '', sub: '', color: MOOD_SWATCHES[3] });
  const startEdit = (m) => setEditing({ mode: 'edit', id: m.id, label: m.label, sub: m.sub, color: m.color });
  const save = () => {
    if (editing.mode === 'new') setMoods([...moods, makeMood(editing.label, editing.sub, editing.color)]);
    else setMoods(moods.map(m => m.id === editing.id ? makeMood(editing.label, editing.sub, editing.color, editing.id) : m));
    setEditing(null);
  };
  const remove = (id) => { setMoods(moods.filter(m => m.id !== id)); setEditing(null); };

  return (
    <div data-screen-label="Moods" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '64px 22px 120px' }}>
        <div style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>Manage</div>
        <h1 style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>Moods</h1>
        <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
          Your moods are the feelings you choose from after a meal. Make them yours. Rename, recolour, add new ones, or remove what doesn’t fit.
        </p>

        {/* how it appears — mock notification */}
        <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: t.radius + 8, background: 'var(--chip)', display: 'flex', gap: 11, alignItems: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="3.4" stroke="#F3EFE9" strokeWidth="1.7"/><path d="M5 8.5A1.5 1.5 0 016.5 7h1.4l.9-1.4a1 1 0 01.84-.46h4.7a1 1 0 01.84.46l.9 1.4h1.4A1.5 1.5 0 0119 8.5v8A1.5 1.5 0 0117.5 18h-11A1.5 1.5 0 015 16.5v-8z" stroke="#F3EFE9" strokeWidth="1.4"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)' }}>Food Mood</span>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>now</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 1 }}>How did that meal leave you feeling?</div>
          </div>
        </div>
        <p style={{ margin: '8px 2px 0', fontSize: 11.5, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'Newsreader, Georgia, serif' }}>
          After each meal we’ll nudge you to capture a mood. These are the options you’ll see.
        </p>

        {/* list */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 2px 12px' }}>
          <span style={{ fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>Your moods</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{moods.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {moods.map(m => (
            <button key={m.id} onClick={() => startEdit(m)} style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer',
              border: '1px solid var(--line)', background: 'var(--card)', borderRadius: t.radius + 4, padding: '12px 14px',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 5px 10px rgba(255,255,255,0.35)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: 'var(--ink-1)', fontWeight: 500, letterSpacing: -0.2 }}>{m.label}</div>
                {m.sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.sub}</div>}
              </div>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M14.5 5.5l4 4M4 20l1-4L16 5a1.5 1.5 0 012 0l1 1a1.5 1.5 0 010 2L8 19l-4 1z" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>

        <button onClick={startNew} style={{
          marginTop: 12, width: '100%', cursor: 'pointer', borderRadius: t.radius + 4,
          border: '1px dashed var(--ink-3)', background: 'transparent', padding: '13px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 14, fontWeight: 500, color: 'var(--ink-2)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add a mood
        </button>
      </div>

      {/* editor sheet */}
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.34)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: 'var(--bg)', borderTopLeftRadius: 26, borderTopRightRadius: 26,
            padding: '14px 22px 30px', boxShadow: '0 -12px 40px rgba(0,0,0,0.22)', maxHeight: '88%', overflowY: 'auto',
          }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0, background: editing.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 7px 14px rgba(255,255,255,0.4), 0 4px 14px rgba(0,0,0,0.10)' }} />
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{editing.mode === 'new' ? 'New mood' : 'Edit mood'}</div>
                <div style={{ fontSize: 20, color: 'var(--ink-1)', fontWeight: 400, marginTop: 3 }}>{editing.label.trim() || 'Untitled'}</div>
              </div>
            </div>

            <label style={fmLabel}>Name</label>
            <input value={editing.label} onChange={e => set({ label: e.target.value })} placeholder="e.g. Energetic" maxLength={22} style={fmInput} />

            <label style={{ ...fmLabel, marginTop: 14 }}>Description</label>
            <input value={editing.sub} onChange={e => set({ sub: e.target.value })} placeholder="e.g. excited, flowing" maxLength={40} style={fmInput} />

            <label style={{ ...fmLabel, marginTop: 16 }}>Colour</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, marginTop: 4 }}>
              {MOOD_SWATCHES.map(c => (
                <button key={c} onClick={() => set({ color: c })} aria-label={c} style={{
                  width: 38, height: 38, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: editing.color === c ? '2px solid var(--ink-1)' : '2px solid transparent',
                  outline: '1px solid rgba(0,0,0,0.06)', outlineOffset: -1,
                  boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.35)',
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'center' }}>
              {editing.mode === 'edit' && (
                <button onClick={() => moods.length > 1 ? remove(editing.id) : null} disabled={moods.length <= 1} style={{
                  border: 'none', background: 'none', cursor: moods.length > 1 ? 'pointer' : 'not-allowed',
                  color: moods.length > 1 ? '#9B5158' : 'var(--ink-3)', fontSize: 14, fontWeight: 500, padding: '6px 4px',
                }}>Delete</button>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={() => setEditing(null)} style={{ border: 'none', background: 'var(--chip)', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 500, padding: '12px 20px', borderRadius: t.radius + 4 }}>Cancel</button>
              <button onClick={save} style={{ border: 'none', background: 'var(--accent)', cursor: 'pointer', color: '#F3EFE9', fontSize: 14.5, fontWeight: 500, padding: '12px 24px', borderRadius: t.radius + 4 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="moods" accent={accent}
        onHome={onHome} onMoods={() => {}} onCapture={onCapture} onJournal={onJournal} onProfile={onProfile} onDisabled={showToast} />

      {toast && (
        <div style={{ position: 'absolute', left: '50%', bottom: 104, transform: 'translateX(-50%)', zIndex: 70, background: 'var(--ink-1)', color: 'var(--bg)', fontSize: 12.5, padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 22px rgba(0,0,0,0.18)' }}>{toast}</div>
      )}
    </div>
  );
}

const fmLabel = { display: 'block', fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 };
const fmInput = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 8, padding: '12px 14px', fontSize: 15, color: 'var(--ink-1)', fontFamily: 'inherit', outline: 'none' };

// hex + alpha helper
function hexA(hex, a) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

Object.assign(window, { HomeScreen, MoodPicker, Breakdown, DayView, MoodsManager, MoodDot, MacroBar });
