// profile.jsx — account, macro targets, notification timing, about
// Relies on globals: MOODS (not required). Exports: ProfileScreen, DEFAULT_PROFILE.

const DEFAULT_PROFILE = {
  name: 'Maya',
  tagline: 'Tracking mood + macros',
  targets: { protein: 120, carbs: 200, fat: 65, calories: 2000 },
  notif: { on: true, mins: 60 },
  showCalories: false,
};

// small switch
function PSwitch({ on, onChange, accent }) {
  return (
    <button onClick={() => onChange(!on)} aria-label="toggle" style={{
      width: 48, height: 29, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 3, flexShrink: 0,
      background: on ? accent : 'var(--line)', transition: 'background 220ms ease',
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <span style={{ width: 23, height: 23, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'all 220ms ease' }} />
    </button>
  );
}

function PField({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '13px 0' }}>
      <span style={{ fontSize: 14.5, color: 'var(--ink-1)' }}>{label}</span>
      {children}
    </div>
  );
}

function ProfileScreen({ t, profile, setProfile, accent, nav }) {
  const [editName, setEditName] = React.useState(false);
  const [editTag, setEditTag] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const flash = (m) => { setToast(m); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 1900); };
  const up = (patch) => setProfile(p => ({ ...p, ...patch }));
  const upTarget = (k, v) => setProfile(p => ({ ...p, targets: { ...p.targets, [k]: v } }));
  const upNotif = (patch) => setProfile(p => ({ ...p, notif: { ...p.notif, ...patch } }));

  const initial = (profile.name || '?').trim().charAt(0).toUpperCase() || '?';
  const minsPct = ((profile.notif.mins - 30) / 90) * 100;

  return (
    <div data-screen-label="Profile" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '60px 22px 120px' }}>
        {/* user card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#A8B8A0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 8px 16px rgba(255,255,255,0.35)' }}>
              <span style={{ fontSize: 38, fontWeight: 300, color: '#33402C' }}>{initial}</span>
            </div>
            <image-slot id="profile-avatar" shape="circle" placeholder="" style={{ position: 'absolute', inset: 0, width: '96px', height: '96px' }}></image-slot>
            <div style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: '50%', background: accent, border: '2.5px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="3.2" stroke="#F3EFE9" strokeWidth="1.7"/><path d="M5 8.5A1.5 1.5 0 016.5 7h1.4l.9-1.4a1 1 0 01.84-.46h4.7a1 1 0 01.84.46l.9 1.4h1.4A1.5 1.5 0 0119 8.5v8A1.5 1.5 0 0117.5 18h-11A1.5 1.5 0 015 16.5v-8z" stroke="#F3EFE9" strokeWidth="1.4"/></svg>
            </div>
          </div>

          {editName ? (
            <input autoFocus value={profile.name} onChange={e => up({ name: e.target.value })} onBlur={() => setEditName(false)} onKeyDown={e => e.key === 'Enter' && setEditName(false)} maxLength={24}
              style={{ marginTop: 16, textAlign: 'center', border: 'none', borderBottom: '1px solid var(--line)', background: 'transparent', outline: 'none', fontSize: 23, fontWeight: 400, color: 'var(--ink-1)', fontFamily: 'inherit', width: 200 }} />
          ) : (
            <button onClick={() => setEditName(true)} style={{ marginTop: 16, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 23, fontWeight: 400, color: 'var(--ink-1)', letterSpacing: -0.3 }}>{profile.name || 'Your name'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14.5 5.5l4 4M4 20l1-4L16 5a1.5 1.5 0 012 0l1 1a1.5 1.5 0 010 2L8 19l-4 1z" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinejoin="round"/></svg>
            </button>
          )}

          {editTag ? (
            <input autoFocus value={profile.tagline} onChange={e => up({ tagline: e.target.value })} onBlur={() => setEditTag(false)} onKeyDown={e => e.key === 'Enter' && setEditTag(false)} maxLength={40}
              style={{ marginTop: 7, textAlign: 'center', border: 'none', borderBottom: '1px solid var(--line)', background: 'transparent', outline: 'none', fontSize: 13.5, color: 'var(--ink-2)', fontFamily: 'inherit', width: 220 }} />
          ) : (
            <button onClick={() => setEditTag(true)} style={{ marginTop: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13.5, color: profile.tagline ? 'var(--ink-3)' : 'var(--ink-3)', fontStyle: profile.tagline ? 'normal' : 'italic' }}>
              {profile.tagline || 'Add a tagline'}
            </button>
          )}
        </div>

        {/* macro goals */}
        <Section title="Daily macro goals">
          {[['Protein', 'protein'], ['Carbs', 'carbs'], ['Fat', 'fat']].map(([label, key], i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <span style={{ fontSize: 14.5, color: 'var(--ink-1)' }}>{label} <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>(g)</span></span>
              <input type="number" inputMode="numeric" value={profile.targets[key]} min={0} max={500}
                onChange={e => upTarget(key, e.target.value === '' ? '' : Math.max(0, Math.min(500, parseInt(e.target.value) || 0)))}
                style={{ width: 72, textAlign: 'right', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', fontSize: 15.5, color: 'var(--ink-1)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }} />
            </div>
          ))}
          {profile.showCalories && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid var(--line)' }}>
              <span style={{ fontSize: 14.5, color: 'var(--ink-1)' }}>Calories <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>(cal)</span></span>
              <input type="number" inputMode="numeric" value={profile.targets.calories ?? 2000} min={0} max={9999}
                onChange={e => upTarget('calories', e.target.value === '' ? '' : Math.max(0, Math.min(9999, parseInt(e.target.value) || 0)))}
                style={{ width: 84, textAlign: 'right', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', fontSize: 15.5, color: 'var(--ink-1)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }} />
            </div>
          )}
          <p style={fpHelp}>These are your daily targets. The app shows how you track against them.</p>
        </Section>

        {/* tracking */}
        <Section title="Tracking">
          <PField label="Show calories on meals">
            <PSwitch on={!!profile.showCalories} accent={accent} onChange={(v) => { up({ showCalories: v }); flash(v ? 'Calories on' : 'Calories off'); }} />
          </PField>
          <p style={fpHelp}>Track calories alongside your macros. Off by default, since this app is about how food makes you feel, not just numbers.</p>
        </Section>

        {/* notifications */}
        <Section title="Mood check-in reminder">
          <div style={{ opacity: profile.notif.on ? 1 : 0.4, pointerEvents: profile.notif.on ? 'auto' : 'none', transition: 'opacity 220ms ease', paddingTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '6px 0 12px' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Send it this long after a meal</span>
              <span style={{ fontSize: 16, color: 'var(--ink-1)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{profile.notif.mins} min</span>
            </div>
            <input type="range" className="fm-range" min={30} max={120} step={15} value={profile.notif.mins}
              onChange={e => { const v = parseInt(e.target.value); upNotif({ mins: v }); flash(`Reminder set to ${v} minutes`); }}
              style={{ background: `linear-gradient(90deg, ${accent} ${minsPct}%, var(--line) ${minsPct}%)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
              <span>30 min</span><span>2 hr</span>
            </div>
          </div>
          <p style={fpHelp}>You’ll get one notification per meal to reflect on your mood.</p>
        </Section>

        {/* account */}
        <Section title="Account">
          <button onClick={() => flash('Logged out (demo)')} style={{ ...fpBtn, color: 'var(--ink-1)', border: '1px solid var(--line)' }}>Log Out</button>
          <button onClick={() => setConfirmDel(true)} style={{ ...fpBtn, marginTop: 10, color: '#9B5158', border: '1px solid rgba(155,81,88,0.4)' }}>Delete Account</button>
        </Section>

        {/* about */}
        <Section title="About">
          {[['Privacy Policy'], ['Terms of Service'], ['Contact & Support']].map(([l], i) => (
            <button key={l} onClick={() => flash('Opens in your browser')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 0', borderTop: i ? '1px solid var(--line)' : 'none', textAlign: 'left' }}>
              <span style={{ fontSize: 14.5, color: 'var(--ink-1)' }}>{l}</span>
              <svg width="7" height="12" viewBox="0 0 8 14" style={{ flexShrink: 0 }}><path d="M1 1l6 6-6 6" stroke="var(--ink-3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14.5, color: 'var(--ink-1)' }}>Turn off notifications</span>
            <PSwitch on={!profile.notif.on} accent={accent} onChange={(v) => { upNotif({ on: !v }); flash(v ? 'Notifications off' : 'Notifications on'); }} />
          </div>
          <p style={{ ...fpHelp, marginTop: 14 }}>Food Mood · Version 1.0.0</p>
        </Section>
      </div>

      {/* delete confirmation */}
      {confirmDel && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <div style={{ width: '100%', background: 'var(--bg)', borderRadius: 18, padding: '22px 22px 16px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 17, color: 'var(--ink-1)', fontWeight: 500 }}>Delete account?</div>
            <p style={{ margin: '8px 0 18px', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>This cannot be undone. All your meals, moods, and reflections will be removed.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDel(false)} style={{ border: 'none', background: 'var(--chip)', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 500, padding: '11px 20px', borderRadius: 10 }}>Cancel</button>
              <button onClick={() => { setConfirmDel(false); flash('Account deleted (demo)'); }} style={{ border: 'none', background: '#9B5158', cursor: 'pointer', color: '#fff', fontSize: 14.5, fontWeight: 500, padding: '11px 22px', borderRadius: 10 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="profile" accent={accent}
        onHome={nav.onHome} onMoods={nav.onMoods} onCapture={nav.onCapture} onJournal={nav.onJournal} onProfile={() => {}} onDisabled={() => {}} />

      {toast && <div style={{ position: 'absolute', left: '50%', bottom: 104, transform: 'translateX(-50%)', zIndex: 70, background: 'var(--ink-1)', color: 'var(--bg)', fontSize: 12.5, padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 22px rgba(0,0,0,0.18)' }}>{toast}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>{title}</div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '4px 16px 14px' }}>{children}</div>
    </div>
  );
}

const fpHelp = { margin: '10px 2px 2px', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.5 };
const fpBtn = { width: '100%', cursor: 'pointer', background: 'transparent', borderRadius: 11, padding: '13px 0', fontSize: 14.5, fontWeight: 500, marginTop: 10 };

Object.assign(window, { ProfileScreen, DEFAULT_PROFILE });
