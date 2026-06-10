// paywall-unlock-plus.jsx — Food Mood "Unlock Plus" paywall screen (390×844).
// Self-contained: embeds the mood palette, helpers, and animation CSS so it
// runs standalone. If a global window.MOODS exists (from data.jsx) it is used;
// otherwise the local fallback below applies.
//
// Usage:
//   <script type="text/babel" src="paywall-unlock-plus.jsx"></script>
//   then render <OnbPaywall /> anywhere (it is also exported to window).

const { useState } = React;

// ── Mood palette (fallback if window.MOODS is absent) ────────
const PW_MOODS = window.MOODS || {
  energetic:     { id: 'energetic',     label: 'Energetic', color: '#F4E4C1' },
  focused:       { id: 'focused',       label: 'Focused',   color: '#C9A876' },
  calm:          { id: 'calm',          label: 'Calm',      color: '#A8B8A0' },
  contemplative: { id: 'contemplative', label: 'Bloated',   color: '#7A8FA3' },
  sluggish:      { id: 'sluggish',      label: 'Sluggish',  color: '#8B4F5C' },
};
const PW_ORDER = ['energetic', 'focused', 'calm', 'contemplative', 'sluggish'];
const O_ACCENT = '#232A33';

// ── Inject the design tokens + animation CSS once ────────────
(function injectPaywallCSS() {
  if (document.getElementById('paywall-css')) return;
  const css = `
  :root{
    --bg:#FAF8F4; --card:#FFFFFF; --chip:#F0ECE3; --line:rgba(60,48,36,0.10);
    --ink-1:#2A2622; --ink-2:#6C645A; --ink-3:#9C9288;
  }
  .pw-root, .pw-root *{ box-sizing:border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap');
  /* mood-gradient bar drift (PLUS pill) */
  .mood-flow{ background-size:200% 100%; animation:moodDrift 18s linear infinite; }
  @keyframes moodDrift{ from{ background-position:100% 50%; } to{ background-position:0% 50%; } }
  /* orbs drift gently up & down in place */
  .orb-float{ animation:floatY var(--dur,5s) ease-in-out infinite alternate; animation-delay:var(--delay,0s); will-change:transform; }
  @keyframes floatY{ from{ transform:translateY(calc(var(--amp,9px) * -1)); } to{ transform:translateY(var(--amp,9px)); } }
  @media (prefers-reduced-motion: reduce){ .mood-flow{ animation:none; background-position:0% 50%; } .orb-float{ animation:none; } }`;
  const s = document.createElement('style');
  s.id = 'paywall-css';
  s.textContent = css;
  document.head.appendChild(s);
})();

// ── Helpers ──────────────────────────────────────────────────
function moodGradientLoop() {
  const cols = PW_ORDER.map((id) => (PW_MOODS[id] || {}).color);
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

function OBtn({ children, ghost }) {
  return (
    <div style={{
      width: '100%', textAlign: 'center', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 500, letterSpacing: 0.2,
      background: ghost ? 'transparent' : O_ACCENT, color: ghost ? 'var(--ink-2)' : '#F3EFE9',
      boxShadow: ghost ? 'none' : '0 10px 24px rgba(31,39,51,0.20)' }}>{children}</div>);
}

// ── Floating mood orbs ───────────────────────────────────────
function paywallOrbs() {
  return [
    { mood: '__grad',        size: 108, left: '50%', top: '43%', dur: 6.6, delay: 0,   amp: 12, hero: true },
    { mood: 'energetic',     size: 58,  left: '19%', top: '15%', dur: 5.2, delay: 0.4, amp: 9 },
    { mood: 'sluggish',      size: 62,  left: '76%', top: '19%', dur: 5.9, delay: 0.9, amp: 10 },
    { mood: 'contemplative', size: 50,  left: '82%', top: '57%', dur: 4.9, delay: 0.2, amp: 8 },
    { mood: 'focused',       size: 46,  left: '13%', top: '61%', dur: 6.3, delay: 1.1, amp: 9,  blur: 1.4, opacity: 0.85 },
    { mood: 'calm',          size: 40,  left: '45%', top: '81%', dur: 5.0, delay: 0.6, amp: 7 },
    { mood: 'calm',          size: 22,  left: '66%', top: '8%',  dur: 4.4, delay: 1.4, amp: 6,  blur: 1.6, opacity: 0.7 },
    { mood: 'energetic',     size: 18,  left: '31%', top: '44%', dur: 4.0, delay: 0.8, amp: 6,  blur: 1.8, opacity: 0.7 },
  ];
}

function OOrb({ spec }) {
  const visual = spec.hero ?
  {
    background: `conic-gradient(from 210deg, ${PW_ORDER.map((id) => (PW_MOODS[id] || {}).color).join(', ')}, ${(PW_MOODS.energetic || {}).color})`,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05), inset 0 10px 22px rgba(255,255,255,0.40), 0 16px 32px rgba(60,48,36,0.18)'
  } :
  {
    background: (PW_MOODS[spec.mood] || {}).color,
    boxShadow: 'inset 0 -6px 14px rgba(0,0,0,0.10), inset 0 8px 16px rgba(255,255,255,0.45), 0 10px 22px rgba(60,48,36,0.12)'
  };
  return (
    <div style={{ position: 'absolute', left: spec.left, top: spec.top, transform: 'translate(-50%,-50%)', filter: spec.blur ? `blur(${spec.blur}px)` : 'none', opacity: spec.opacity || 1 }}>
      <div className="orb-float" style={{ '--dur': spec.dur + 's', '--delay': spec.delay + 's', '--amp': spec.amp + 'px' }}>
        <div style={{ width: spec.size, height: spec.size, borderRadius: '50%', position: 'relative', ...visual }}>
          {spec.hero &&
          <div style={{ position: 'absolute', top: '13%', left: '15%', width: '40%', height: '34%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)' }} />}
        </div>
      </div>
    </div>);
}

// ── Pricing card ─────────────────────────────────────────────
function OPlanCard({ yearly, active, onPick }) {
  return (
    <button onClick={onPick} style={{
      flex: 1, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
      borderRadius: 16, padding: '15px 15px 16px',
      border: '1.5px solid ' + (active ? O_ACCENT : 'var(--line)'),
      background: active ? 'var(--card)' : 'transparent',
      boxShadow: active ? '0 8px 20px rgba(60,48,36,0.10)' : 'none', transition: 'all 160ms ease' }}>
      <span style={{ position: 'absolute', top: 13, right: 13, width: 18, height: 18, borderRadius: '50%', border: '1.5px solid ' + (active ? O_ACCENT : 'var(--line)'), background: active ? O_ACCENT : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.6 2.6L9 1" stroke="#F3EFE9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>{yearly ? 'Yearly' : 'Lifetime'}</div>
      {yearly ?
      <span style={{ display: 'inline-block', marginTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: '#33402C', background: (PW_MOODS.calm || {}).color, padding: '3px 7px', borderRadius: 999, whiteSpace: 'nowrap' }}>SAVE 58%</span> :
      <span style={{ display: 'inline-block', marginTop: 8, height: 17 }} />}
      <div style={{ marginTop: 9, fontSize: 21, fontWeight: 600, color: 'var(--ink-1)', letterSpacing: -0.3 }}>
        {yearly ? '$29.99' : '$59.99'}<span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-3)' }}>{yearly ? ' /year' : ' once'}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.35 }}>{yearly ? '7-day free trial, then $2.50/mo' : 'One-time payment'}</div>
    </button>);
}

// ── The screen ───────────────────────────────────────────────
function OnbPaywall() {
  const [plan, setPlan] = useState('yearly');
  const [bi, setBi] = useState(0);
  const benefits = [
    'AI insights',
    'Meal recommendations based on mood',
    'Full mood and macro insights',
    'Your entire history, always',
    'Custom moods and goals',
  ];
  React.useEffect(() => {
    const t = setInterval(() => setBi((i) => (i + 1) % benefits.length), 2600);
    return () => clearInterval(t);
  }, []);
  const trial = plan === 'yearly';
  return (
    <div className="pw-root" style={{ width: 390, height: 844, position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden', fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <OStatusBar />
      {/* header: PLUS pill + Skip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 24px 0', minHeight: 38 }}>
        <span style={{ width: 40 }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '6px 15px 6px 11px', borderRadius: 999, background: 'var(--card)', border: '1px solid var(--line)', boxShadow: '0 2px 8px rgba(60,48,36,0.05)' }}>
          <span className="mood-flow" style={{ width: 26, height: 6, borderRadius: 999, backgroundImage: moodGradientLoop() }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, color: 'var(--ink-2)' }}>PLUS</span>
        </div>
        <span style={{ width: 40, textAlign: 'right', fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 500 }}>Skip</span>
      </div>

      {/* headline */}
      <div style={{ textAlign: 'center', padding: '12px 36px 0' }}>
        <h1 style={{ margin: 0, fontFamily: "'Newsreader', Georgia, serif", fontSize: 33, lineHeight: 1.12, fontWeight: 400, color: 'var(--ink-1)', letterSpacing: -0.5 }}>Unlock the full picture</h1>
      </div>

      {/* orb field + soft glow */}
      <div style={{ position: 'relative', flex: 1, minHeight: 210 }}>
        <div style={{ position: 'absolute', inset: '4% 8%', borderRadius: '50%', background: 'radial-gradient(60% 55% at 50% 46%, rgba(122,143,163,0.22), rgba(168,184,160,0.12) 48%, rgba(244,228,193,0) 72%)', filter: 'blur(6px)' }} />
        {paywallOrbs().map((s, i) => <OOrb key={i} spec={s} />)}
      </div>

      {/* rotating benefit + dots */}
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{ height: 22, fontSize: 14.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          {benefits.map((b, i) => <span key={i} style={{ display: i === bi ? 'inline' : 'none' }}>{b}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 11 }}>
          {benefits.map((_, i) => <span key={i} style={{ width: i === bi ? 16 : 6, height: 6, borderRadius: 999, background: i === bi ? 'var(--ink-1)' : 'var(--line)', transition: 'all 240ms' }} />)}
        </div>
      </div>

      {/* pricing */}
      <div style={{ display: 'flex', gap: 10, padding: '18px 24px 0', alignItems: 'stretch' }}>
        <OPlanCard yearly active={plan === 'yearly'} onPick={() => setPlan('yearly')} />
        <OPlanCard yearly={false} active={plan === 'lifetime'} onPick={() => setPlan('lifetime')} />
      </div>

      {/* CTA + reassurance */}
      <div style={{ padding: '14px 24px 0' }}><OBtn>{trial ? 'Start 7-day free trial' : 'Subscribe'}</OBtn></div>
      <div style={{ textAlign: 'center', padding: '11px 30px 0', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>
        {trial ? '7 days free, then $29.99/year. Cancel anytime.' : '$59.99 billed once. Yours forever.'}
      </div>
      <div style={{ height: 30, flexShrink: 0 }} />

      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.22)' }} />
    </div>);
}

Object.assign(window, { OnbPaywall });
