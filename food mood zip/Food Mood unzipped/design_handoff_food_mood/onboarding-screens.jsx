// onboarding-screens.jsx - static onboarding screen designs for the canvas.
// Uses window.MOODS / MOOD_ORDER from data.jsx. Each screen is 390×844.

const O_ACCENT = '#232A33';
const { useState } = React;
const moodList = () => (window.MOOD_ORDER || []).map((id) => window.MOODS[id]);

// mood gradient motif — matches the logo order (energetic → sluggish)
function moodGradient() {
  const order = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];
  const cols = order.map((id) => (window.MOODS[id] || {}).color);
  const stops = cols.map((c, i) => `${c} ${((i + 0.5) / cols.length * 100).toFixed(1)}%`).join(', ');
  return `linear-gradient(90deg, ${stops})`;
}

// seamless looping version: palette laid down twice (+ first colour again) so
// the two halves are identical — pairs with background-size:200% for a
// no-seam continuous drift (see .mood-flow in the page CSS).
function moodGradientLoop() {
  const order = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];
  const cols = order.map((id) => (window.MOODS[id] || {}).color);
  const seq = [...cols, ...cols, cols[0]];
  const n = seq.length;
  const stops = seq.map((c, i) => `${c} ${(i / (n - 1) * 100).toFixed(2)}%`).join(', ');
  return `linear-gradient(90deg, ${stops})`;
}

function OStatusBar() {
  return (
    <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)', fontFamily: '-apple-system, system-ui' }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="var(--ink-1)" /><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="var(--ink-1)" /><rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="var(--ink-1)" /><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="var(--ink-1)" /></svg>
        <svg width="24" height="12" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="var(--ink-1)" strokeOpacity="0.4" fill="none" /><rect x="2" y="2" width="19" height="9" rx="2" fill="var(--ink-1)" /><path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="var(--ink-1)" fillOpacity="0.4" /></svg>
      </div>
    </div>);

}

function ODots({ idx, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) =>
      <span key={i} style={{ height: 6, width: i === idx ? 18 : 6, borderRadius: 999, background: i === idx ? 'var(--ink-1)' : 'var(--line)', transition: 'all 200ms' }} />
      )}
    </div>);

}

function OBack() {
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="8" height="14" viewBox="0 0 9 16" fill="none"><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>);

}

function OBtn({ children, ghost }) {
  return (
    <div style={{
      width: '100%', textAlign: 'center', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 500, letterSpacing: 0.2,
      background: ghost ? 'transparent' : O_ACCENT, color: ghost ? 'var(--ink-2)' : '#F3EFE9',
      boxShadow: ghost ? 'none' : '0 10px 24px rgba(31,39,51,0.20)'
    }}>{children}</div>);

}

// shared shell
function Shell({ idx, total, children, back = true, skip = false }) {
  return (
    <div style={{ width: 390, height: 844, position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden', fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <OStatusBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 0', minHeight: 40 }}>
        {back ? <OBack /> : <span style={{ width: 36 }} />}
        {total ? <ODots idx={idx} total={total} /> : <span />}
        {skip ? <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 500 }}>Skip</span> : <span style={{ width: 36 }} />}
      </div>
      {children}
      {/* home indicator */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.22)' }} />
    </div>);

}

// brand mark: small cluster of mood dots
function OLogo({ size = 13 }) {
  const order = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];
  return (
    <div style={{ display: 'flex' }}>
      {order.map((id, i) =>
      <span key={id} style={{ width: size, height: size, borderRadius: '50%', background: (window.MOODS[id] || {}).color, marginLeft: i ? -size * 0.34 : 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)', border: '1.5px solid var(--bg)' }} />
      )}
    </div>);

}

// ── 1 · Welcome ──────────────────────────────────────────────
function OnbWelcome() {
  return (
    <Shell idx={0} total={0} back={false}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 36px' }}>
        <OLogo size={20} />
        <div style={{ marginTop: 12, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>Food Mood</div>
        <h1 style={{ margin: '28px 0 0', fontFamily: "'Newsreader', Georgia, serif", fontSize: 38, lineHeight: 1.15, fontWeight: 400, color: 'var(--ink-1)', letterSpacing: -0.5 }}>How does food make you feel?</h1>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-3)', maxWidth: 280 }}>A gentle way to notice the link between what you eat and how you feel.</p>
        <div className="mood-flow" style={{ marginTop: 36, width: 240, height: 12, borderRadius: 999, backgroundImage: moodGradientLoop(), boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.08)' }} />
      </div>
      <div style={{ padding: '0 28px 40px' }}>
        <OBtn>Get started</OBtn>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--ink-2)' }}>I already have an account</div>
      </div>
    </Shell>);

}

// ── 2 · The idea ─────────────────────────────────────────────
function OnbIdea() {
  const lines = [['Mood', 'first.', 'calm'], ['Macros', 'second.', 'focused'], ['Calories', 'optional.', 'energetic']];
  return (
    <Shell idx={0} total={6}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
        {lines.map(([a, b, mood], i) =>
        <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: i ? 20 : 0 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: (window.MOODS[mood] || {}).color, flexShrink: 0 }} />
            <div style={{ fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.5 }}>{a} <span style={{ color: 'var(--ink-3)' }}>{b}</span></div>
          </div>
        )}
        <p style={{ margin: '40px 0 0', fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 300 }}>
          Most trackers reduce food to numbers. Food Mood starts with a feeling. The macros are just the story underneath.
        </p>
      </div>
      <div style={{ padding: '0 28px 40px' }}><OBtn>Continue</OBtn></div>
    </Shell>);

}

// ── 2b · Personal ──────────────────────────────
function OnbPersonal() {
  const goals = ['Understand my patterns', 'Eat more intentionally', 'Feel better day to day', 'Ease anxiety'];
  const [sel, setSel] = useState(0);
  const fieldLabel = { fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 };
  const inputBox = { width: '100%', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 12, padding: '14px 16px', fontSize: 15.5, color: 'var(--ink-3)', boxSizing: 'border-box' };
  return (
    <Shell idx={1} total={6} skip>
      <div style={{ padding: '8px 30px 0' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>A little about you</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>This stays private. It just helps Food Mood feel like yours.</p>
      </div>
      <div style={{ flex: 1, padding: '14px 30px 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, marginBottom: 2 }}>
          <div style={{ position: 'relative', width: 84, height: 84 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--chip)', border: '1px dashed var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="3.6" stroke="var(--ink-3)" strokeWidth="1.6" /><path d="M5 8.5A1.5 1.5 0 016.5 7h1.4l.9-1.4a1 1 0 01.84-.46h4.7a1 1 0 01.84.46l.9 1.4h1.4A1.5 1.5 0 0119 8.5v8A1.5 1.5 0 0117.5 18h-11A1.5 1.5 0 015 16.5v-8z" stroke="var(--ink-3)" strokeWidth="1.5" /></svg>
            </div>
            <div style={{ position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: '50%', background: O_ACCENT, border: '2.5px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#F3EFE9" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>Add a photo</span>
        </div>
        <div>
          <div style={fieldLabel}>Name</div>
          <div style={inputBox}>Your name</div>
        </div>
        <div>
          <div style={fieldLabel}>Your goal</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {goals.map((g, i) =>
            <button key={g} onClick={() => setSel(i)} style={{ fontSize: 13, padding: '9px 14px', borderRadius: 999, border: '1px solid ' + (i === sel ? 'transparent' : 'var(--line)'), background: i === sel ? 'var(--ink-1)' : 'transparent', color: i === sel ? 'var(--bg)' : 'var(--ink-2)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{g}</button>
            )}
          </div>
        </div>
        <div>
          <div style={fieldLabel}>What brought you here?</div>
          <div style={{ ...inputBox, minHeight: 78, fontFamily: "'Newsreader', Georgia, serif", fontStyle: 'italic', fontSize: 16, lineHeight: 1.5 }}>I want to feel less anxious around food…</div>
        </div>
      </div>
      <div style={{ padding: '0 28px 36px' }}><OBtn>Continue</OBtn></div>
    </Shell>);

}

// ── 3 · Meet your moods ──────────────────────────────────────
function OnbMoods() {
  return (
    <Shell idx={2} total={6}>
      <div style={{ padding: '14px 32px 0' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>Meet your moods</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Five feelings, five colours. You’ll pick one after each meal, and you can make them your own later.</p>
      </div>
      <div style={{ flex: 1, padding: '22px 30px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, transform: 'translateY(-30px)' }}>
        {moodList().map((m) =>
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', background: m.color, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 6px 12px rgba(255,255,255,0.4)' }} />
            <div>
              <div style={{ fontSize: 18, color: 'var(--ink-1)', fontWeight: 400 }}>{m.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{m.sub}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '0 28px 40px' }}><OBtn>Continue</OBtn></div>
    </Shell>);

}

// ── 4 · How it works ─────────────────────────────────────────
function OnbHow() {
  const steps = [
  ['Capture a meal', 'Snap a photo and we’ll read the macros.', 'cam'],
  ['Pick a feeling', 'Tap the colour that fits how you feel.', 'orb'],
  ['See the pattern', 'Watch your week of mood + food unfold.', 'spec']];

  const icon = (k) => {
    if (k === 'cam') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="3.4" stroke="var(--ink-1)" strokeWidth="1.6" /><path d="M5 8.5A1.5 1.5 0 016.5 7h1.4l.9-1.4a1 1 0 01.84-.46h4.7a1 1 0 01.84.46l.9 1.4h1.4A1.5 1.5 0 0119 8.5v8A1.5 1.5 0 0117.5 18h-11A1.5 1.5 0 015 16.5v-8z" stroke="var(--ink-1)" strokeWidth="1.5" /></svg>;
    if (k === 'orb') return <span style={{ width: 20, height: 20, borderRadius: '50%', background: (window.MOODS.calm || {}).color, display: 'block' }} />;
    return <div style={{ width: 22, height: 11, borderRadius: 99, backgroundImage: moodGradient() }} />;
  };
  return (
    <Shell idx={3} total={6}>
      <div style={{ padding: '14px 32px 0' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>How it works</h1>
      </div>
      <div style={{ flex: 1, padding: '10px 30px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
        {steps.map(([t, d, k], i) =>
        <div key={t} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon(k)}</div>
              <span style={{ position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: '50%', background: O_ACCENT, color: '#F3EFE9', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 18, color: 'var(--ink-1)', fontWeight: 500 }}>{t}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.5 }}>{d}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '0 28px 40px' }}><OBtn>Continue</OBtn></div>
    </Shell>);

}

// ── 5 · Goals ────────────────────────────────────────────────
function OnbGoals() {
  const rows = [['Protein', '120'], ['Carbs', '200'], ['Fat', '65']];
  const [cal, setCal] = useState(false);
  return (
    <Shell idx={4} total={6} skip>
      <div style={{ padding: '14px 32px 0' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>Set your targets</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Optional. Your daily macro goals. Change them anytime.</p>
      </div>
      <div style={{ flex: 1, padding: '22px 30px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '4px 18px' }}>
          {rows.map(([l, v], i) =>
          <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <span style={{ fontSize: 15.5, color: 'var(--ink-1)' }}>{l} <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>(g)</span></span>
              <span style={{ width: 84, textAlign: 'right', border: '1px solid var(--line)', borderRadius: 8, padding: '9px 13px', fontSize: 16, color: 'var(--ink-1)', background: 'var(--bg)' }}>{v}</span>
            </div>
          )}
          {cal &&
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 15.5, color: 'var(--ink-1)' }}>Calories <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>(cal)</span></span>
            <span style={{ width: 84, textAlign: 'right', border: '1px solid var(--line)', borderRadius: 8, padding: '9px 13px', fontSize: 16, color: 'var(--ink-1)', background: 'var(--bg)' }}>2000</span>
          </div>
          }
        </div>
        {/* calorie toggle */}
        <div style={{ marginTop: 14, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'var(--ink-1)' }}>Count calories</span>
            <button onClick={() => setCal(!cal)} style={{ width: 46, height: 28, borderRadius: 999, background: cal ? O_ACCENT : 'var(--line)', padding: 3, display: 'flex', justifyContent: cal ? 'flex-end' : 'flex-start', flexShrink: 0, border: 'none', cursor: 'pointer', transition: 'background 200ms ease' }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} /></button>
          </div>
          <p style={{ margin: '8px 2px 0', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>Adds a calorie goal above. Off by default, since mood and macros come first.</p>
        </div>
      </div>
      <div style={{ padding: '0 28px 36px' }}><OBtn>Continue</OBtn></div>
    </Shell>);

}

// ── 6 · Reminders ────────────────────────────────────────────
function OnbReminders() {
  return (
    <Shell idx={5} total={6} skip>
      <div style={{ padding: '14px 32px 0' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.4 }}>When should we check in?</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>We’ll send one gentle nudge after a meal to capture how you feel.</p>
      </div>
      <div style={{ flex: 1, padding: '24px 30px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* dummy lock-screen notification preview */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 20, padding: '13px 15px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, backgroundImage: moodGradient(), flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-2)', fontWeight: 600 }}>Food Mood</span>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>now</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-1)', fontWeight: 600, marginTop: 3 }}>Time to check in</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 1, lineHeight: 1.4 }}>How did your last meal leave you feeling?</div>
          </div>
        </div>

        {/* reminder timing */}
        <div style={{ marginTop: 18, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '18px 20px 22px' }}>
          <span style={{ fontSize: 15.5, color: 'var(--ink-1)', fontWeight: 500 }}>Remind me after eating</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '18px 0 12px' }}>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>How long after</span>
            <span style={{ fontSize: 16, color: 'var(--ink-1)', fontWeight: 500 }}>60 min</span>
          </div>
          <div style={{ position: 'relative', height: 6, borderRadius: 999, background: `linear-gradient(90deg, ${O_ACCENT} 33%, var(--line) 33%)` }}>
            <span style={{ position: 'absolute', top: '50%', left: '33%', transform: 'translate(-50%,-50%)', width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.28)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--ink-3)' }}><span>30 min</span><span>2 hr</span></div>
        </div>
      </div>
      <div style={{ padding: '0 28px 40px' }}><OBtn>Continue</OBtn></div>
    </Shell>);

}

// ── 7 · All set ──────────────────────────────────────────────
function OnbReady() {
  return (
    <Shell idx={6} total={0} back={false}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 38px' }}>
        <div className="mood-flow" style={{ width: 250, height: 14, borderRadius: 999, backgroundImage: moodGradientLoop(), boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 14px rgba(0,0,0,0.10)' }} />
        <h1 style={{ margin: '34px 0 0', fontFamily: "'Newsreader', Georgia, serif", fontSize: 38, lineHeight: 1.15, fontWeight: 400, color: 'var(--ink-1)', letterSpacing: -0.5 }}>You’re all set.</h1>
        <p style={{ margin: '16px 0 0', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-3)', maxWidth: 280 }}>Log your first meal and start
feeling better!
</p>
      </div>
      <div style={{ padding: '0 28px 40px' }}><OBtn>Start tracking</OBtn></div>
    </Shell>);}

Object.assign(window, { OnbWelcome, OnbIdea, OnbPersonal, OnbMoods, OnbHow, OnbGoals, OnbReminders, OnbReady });