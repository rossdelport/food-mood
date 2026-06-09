// journal.jsx — flexible mood-reflection journal (list · editor · reader · search)
// Relies on globals: TODAY, WEEK, MOODS. Exports: JournalTab, SEED_JOURNAL.

const { useState: jUseState, useRef: jUseRef } = React;

function nowTime() {
  try { return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  catch (e) { return '3:30 PM'; }
}
function moodOf(moods, id) {
  if (!id) return null;
  return moods.find(m => m.id === id) || (window.MOODS && MOODS[id]) || null;
}

// seed reflections — timestamps placed across real-time buckets so the
// relative-time grouping (This Week / Last Week / older months) is visible.
const DAY = 86400000;
const SEED_JOURNAL = (() => {
  const now = new Date();
  const sow = (() => { const x = new Date(now); const off = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - off); return x.getTime(); })();
  const prevMonth = (() => { const x = new Date(now); x.setMonth(x.getMonth() - 1, 14); x.setHours(19, 5, 0, 0); return x.getTime(); })();
  const twoMonths = (() => { const x = new Date(now); x.setMonth(x.getMonth() - 2, 12); x.setHours(8, 40, 0, 0); return x.getTime(); })();
  const fmtDate = ts => new Date(ts).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const fmtTime = ts => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const mk = (id, ts, moodId, link, text) => ({ id, ts, updatedAt: ts, moodId, link, text, date: fmtDate(ts), time: fmtTime(ts) });
  return [
    mk('j-seed1', now.getTime() - 0.12 * DAY, 'energetic', { label: 'Today’s meals' },
      'Lighter breakfast today and I felt it all morning. Clear, quick, awake. The oats and berries might be the move on days I want momentum.'),
    mk('j-seed2', sow + 0.45 * DAY, 'calm', null,
      'Started the week slow and unhurried. Noticing that the calm days are usually the ones where I cook for myself instead of grabbing something.'),
    mk('j-seed3', sow - 4 * DAY + 0.355 * DAY, 'focused', null,
      'Trying to pay less attention to numbers and more to how a meal actually leaves me feeling. The colour helps more than the grams, honestly.'),
    mk('j-seed4', prevMonth, 'contemplative', null,
      'Felt heavy and bloated all evening after a big, late lunch. Noting it so I remember to keep the midday meal lighter next time.'),
    mk('j-seed5', twoMonths, 'sluggish', null,
      'A heavy, sluggish stretch. Writing it down so future me remembers what that felt like, and that it passed.'),
  ];
})();

// dominant mood id across a set of entries (ignores untagged)
function domMoodOf(items) {
  const c = {};
  items.forEach(e => { if (e.moodId) c[e.moodId] = (c[e.moodId] || 0) + 1; });
  const k = Object.keys(c);
  return k.length ? k.sort((a, b) => c[b] - c[a])[0] : null;
}

// group entries into relative-time sections (newest first within each)
function groupEntries(entries) {
  const now = new Date();
  const startOfWeek = (d) => { const x = new Date(d); const off = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - off); return x.getTime(); };
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = thisWeekStart - 7 * DAY;
  const mStart = (() => { const x = new Date(now); x.setDate(1); x.setHours(0, 0, 0, 0); return x.getTime(); })();
  const thisMonth = now.toLocaleDateString('en-US', { month: 'long' });
  const buckets = new Map(); const order = [];
  entries.forEach(e => {
    const ts = e.updatedAt || e.ts;
    let key, label;
    if (ts >= thisWeekStart) { key = 'thisweek'; label = 'This Week'; }
    else if (ts >= lastWeekStart) { key = 'lastweek'; label = 'Last Week'; }
    else if (ts >= mStart) { key = 'earlier'; label = 'Earlier in ' + thisMonth; }
    else { const d = new Date(ts); let m = d.toLocaleDateString('en-US', { month: 'long' }); if (d.getFullYear() !== now.getFullYear()) m += ' ' + d.getFullYear(); key = 'm-' + m; label = m; }
    if (!buckets.has(key)) { buckets.set(key, { label, items: [] }); order.push(key); }
    buckets.get(key).items.push(e);
  });
  return order.map(k => { const g = buckets.get(k); return { label: g.label, items: g.items, moodId: domMoodOf(g.items) }; });
}

// ── Main tab ────────────────────────────────────────────────
function JournalTab({ t, moods, entries, setEntries, accent, nav }) {
  const [view, setView] = jUseState('list');   // list | edit | read | search
  const [current, setCurrent] = jUseState(null); // entry for read
  const [draft, setDraft] = jUseState(null);
  const [confirmDel, setConfirmDel] = jUseState(null);
  const [toast, setToast] = jUseState(null);
  const showToast = (label) => { setToast(`${label} · coming soon`); clearTimeout(showToast._t); showToast._t = setTimeout(() => setToast(null), 1800); };

  const sorted = entries.slice().sort((a, b) => (b.updatedAt || b.ts) - (a.updatedAt || a.ts));

  const openNew = () => { setDraft({ id: 'j' + Date.now().toString(36), date: TODAY, time: nowTime(), moodId: null, link: null, text: '', ts: Date.now() }); setView('edit'); };
  const openEdit = (e) => { setDraft({ ...e }); setView('edit'); };
  const openRead = (e) => { setCurrent(e); setView('read'); };

  const autosave = (nd) => {
    setEntries(prev => {
      const rest = prev.filter(e => e.id !== nd.id);
      // an entry must have both a mood and some text to exist
      if (!nd.text.trim() || !nd.moodId) return rest;
      return [{ ...nd, updatedAt: Date.now() }, ...rest];
    });
  };
  const update = (patch) => setDraft(d => { const nd = { ...d, ...patch }; autosave(nd); return nd; });
  const del = (id) => { setEntries(prev => prev.filter(e => e.id !== id)); setConfirmDel(null); setView('list'); };

  // ---- sub-views ----
  if (view === 'edit') return <JournalEditor t={t} moods={moods} draft={draft} update={update} onClose={() => setView('list')} />;
  if (view === 'read' && current) return (
    <JournalReader t={t} moods={moods} entry={current}
      onBack={() => setView('list')}
      onEdit={() => openEdit(current)}
      onDelete={() => setConfirmDel(current)} confirmDel={confirmDel}
      onConfirm={() => del(current.id)} onCancelDel={() => setConfirmDel(null)} />
  );
  if (view === 'search') return <JournalSearch t={t} moods={moods} entries={sorted} onBack={() => setView('list')} onOpen={openRead} />;

  // ---- list view ----
  return (
    <div data-screen-label="Journal" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '60px 24px 12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 300, color: 'var(--ink-1)', letterSpacing: -0.5 }}>Journal</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>Reflect on your patterns</p>
        </div>
        <button onClick={() => setView('search')} aria-label="Search" style={{ border: 'none', background: 'var(--chip)', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="var(--ink-2)" strokeWidth="1.7"/><path d="M16 16l4 4" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 150px' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5, padding: '60px 30px', fontFamily: 'Newsreader, Georgia, serif', fontStyle: 'italic' }}>
            A quiet page. Tap “New Entry” to begin a reflection.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {groupEntries(sorted).map(g => {
              const gm = moodOf(moods, g.moodId);
              return (
                <div key={g.label}>
                  <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 8, padding: '16px 6px 10px' }}>
                    <span style={{ fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{g.label}</span>
                    {gm && <span style={{ width: 9, height: 9, borderRadius: '50%', background: gm.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {g.items.map(e => <EntryCard key={e.id} entry={e} moods={moods} radius={t.radius} weekdayOnly onOpen={() => openRead(e)} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* new entry */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 108, padding: '0 16px', zIndex: 30 }}>
        <button onClick={openNew} style={{
          width: '100%', border: 'none', cursor: 'pointer', color: '#F3EFE9', background: 'var(--accent)',
          borderRadius: t.radius + 6, padding: '16px 0', fontSize: 15.5, fontWeight: 500, letterSpacing: 0.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          boxShadow: '0 10px 24px rgba(31,39,51,0.22)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#F3EFE9" strokeWidth="1.9" strokeLinecap="round"/></svg>
          New Entry
        </button>
      </div>

      <BottomNav active="journal" accent={accent}
        onHome={nav.onHome} onMoods={nav.onMoods} onCapture={nav.onCapture} onJournal={() => {}} onProfile={nav.onProfile} onDisabled={showToast} />

      {toast && <div style={{ position: 'absolute', left: '50%', bottom: 104, transform: 'translateX(-50%)', zIndex: 70, background: 'var(--ink-1)', color: 'var(--bg)', fontSize: 12.5, padding: '9px 16px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 22px rgba(0,0,0,0.18)' }}>{toast}</div>}
    </div>
  );
}

// ── Entry card ──────────────────────────────────────────────
function EntryCard({ entry, moods, radius, onOpen, weekdayOnly }) {
  const mood = moodOf(moods, entry.moodId);
  const weekday = (entry.date || '').split(',')[0];
  return (
    <button onClick={onOpen} style={{
      display: 'flex', gap: 13, width: '100%', textAlign: 'left', cursor: 'pointer',
      border: '1px solid var(--line)', background: 'var(--card)', borderRadius: radius + 4, padding: '14px 16px',
    }}>
      {mood && <div style={{ width: 22, height: 22, borderRadius: '50%', background: mood.color, flexShrink: 0, marginTop: 2, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {weekdayOnly ? (
          <div style={{ fontSize: 13.5, color: 'var(--ink-1)', fontWeight: 500, letterSpacing: -0.2 }}>{weekday}<span style={{ color: 'var(--ink-3)', fontWeight: 400 }}> · {entry.time}</span></div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--ink-1)', fontWeight: 500, letterSpacing: -0.2 }}>{entry.date}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', flexShrink: 0 }}>{entry.time}</span>
          </div>
        )}
        <p style={{ margin: '5px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.text}</p>
        {entry.link && <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: 'var(--ink-3)', background: 'var(--chip)', borderRadius: 999, padding: '3px 9px' }}>↳ {entry.link.label}</span>}
      </div>
    </button>
  );
}

// ── Editor ──────────────────────────────────────────────────
function JournalEditor({ t, moods, draft, update, onClose }) {
  const [linking, setLinking] = jUseState(false);
  const taRef = jUseRef(null);
  const canSave = draft.text.trim().length > 0 && !!draft.moodId;
  const linkOptions = WEEK.map(d => ({ label: `${d.day} meals` }));

  return (
    <div data-screen-label="Journal Editor" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* top bar */}
      <div style={{ padding: '56px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{canSave ? 'Saved' : (draft.text.trim() && !draft.moodId ? 'Pick a feeling' : '')}</span>
        <button onClick={onClose} disabled={!canSave} style={{
          border: 'none', cursor: canSave ? 'pointer' : 'default', borderRadius: 999, padding: '9px 18px',
          fontSize: 14, fontWeight: 500, background: canSave ? 'var(--accent)' : 'var(--chip)', color: canSave ? '#F3EFE9' : 'var(--ink-3)',
        }}>Save</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        {/* metadata */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{draft.date}</div>

        <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--ink-3)' }}>How were you feeling?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px 6px', marginTop: 10 }}>
          {moods.map(m => {
            const on = draft.moodId === m.id;
            const dim = draft.moodId && !on;
            return (
              <button key={m.id} onClick={() => update({ moodId: on ? null : m.id })} aria-label={m.label} style={{
                minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: dim ? 0.5 : 1,
                transition: 'opacity 220ms ease',
              }}>
                <span style={{
                  width: 40, height: 40, borderRadius: '50%', background: m.color, flexShrink: 0,
                  border: on ? '2px solid var(--ink-1)' : '2px solid transparent', outline: '1px solid rgba(0,0,0,0.06)', outlineOffset: -1,
                  transform: on ? 'scale(1.08)' : 'scale(1)', transition: 'transform 200ms cubic-bezier(.34,1.56,.64,1)',
                  boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.35)',
                }} />
                <span style={{ fontSize: 9.5, lineHeight: 1.15, textAlign: 'center', color: on ? 'var(--ink-1)' : 'var(--ink-3)', fontWeight: on ? 600 : 400, letterSpacing: 0.1 }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* link */}
        <div style={{ marginTop: 18 }}>
          {draft.link ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-2)', background: 'var(--chip)', borderRadius: 999, padding: '7px 8px 7px 13px' }}>
              ↳ {draft.link.label}
              <button onClick={() => update({ link: null })} aria-label="Remove link" style={{ border: 'none', background: 'rgba(0,0,0,0.08)', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', fontSize: 12, lineHeight: 1 }}>×</button>
            </span>
          ) : (
            <button onClick={() => setLinking(true)} style={{ border: '1px dashed var(--ink-3)', background: 'transparent', cursor: 'pointer', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6M8 12l-2 2a3 3 0 004 4l2-2M16 12l2-2a3 3 0 00-4-4l-2 2" stroke="var(--ink-2)" strokeWidth="1.6" strokeLinecap="round"/></svg>
              Link to a meal or day
            </button>
          )}
        </div>

        {/* writing space */}
        <textarea ref={taRef} value={draft.text} onChange={e => update({ text: e.target.value })} autoFocus
          placeholder="What did you notice today?"
          style={{
            marginTop: 22, flex: 1, minHeight: 280, width: '100%', boxSizing: 'border-box', resize: 'none',
            border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink-1)',
            fontFamily: 'Newsreader, Georgia, serif', fontSize: 18, lineHeight: 1.6, letterSpacing: 0.1,
          }} />
      </div>

      {/* link picker */}
      {linking && (
        <div onClick={() => setLinking(false)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.34)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--bg)', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '14px 18px 30px', maxHeight: '70%', overflowY: 'auto', boxShadow: '0 -12px 40px rgba(0,0,0,0.22)' }}>
            <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, margin: '0 6px 10px' }}>Link a day</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {linkOptions.map(o => (
                <button key={o.label} onClick={() => { update({ link: o }); setLinking(false); }} style={{ textAlign: 'left', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: t.radius + 4, padding: '13px 15px', fontSize: 14.5, color: 'var(--ink-1)', cursor: 'pointer' }}>{o.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reader ──────────────────────────────────────────────────
function JournalReader({ t, moods, entry, onBack, onEdit, onDelete, confirmDel, onConfirm, onCancelDel }) {
  const mood = moodOf(moods, entry.moodId);
  return (
    <div data-screen-label="Journal Entry" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '56px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEdit} aria-label="Edit" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14.5 5.5l4 4M4 20l1-4L16 5a1.5 1.5 0 012 0l1 1a1.5 1.5 0 010 2L8 19l-4 1z" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={onDelete} aria-label="Delete" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke="#9B5158" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 28px 50px' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{entry.date} · {entry.time}</div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          {mood && <div style={{ width: 30, height: 30, borderRadius: '50%', background: mood.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 4px 8px rgba(255,255,255,0.35)' }} />}
          {mood && <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>{mood.label}</span>}
          {entry.link && <span style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--chip)', borderRadius: 999, padding: '4px 11px', marginLeft: mood ? 'auto' : 0 }}>↳ {entry.link.label}</span>}
        </div>
        <p style={{ margin: '24px 0 0', fontFamily: 'Newsreader, Georgia, serif', fontSize: 18.5, lineHeight: 1.65, color: 'var(--ink-1)', whiteSpace: 'pre-wrap' }}>{entry.text}</p>
      </div>

      {confirmDel && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <div style={{ width: '100%', background: 'var(--bg)', borderRadius: 18, padding: '22px 22px 16px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 17, color: 'var(--ink-1)', fontWeight: 500 }}>Delete this reflection?</div>
            <p style={{ margin: '8px 0 18px', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>This can’t be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onCancelDel} style={{ border: 'none', background: 'var(--chip)', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 500, padding: '11px 20px', borderRadius: 10 }}>Cancel</button>
              <button onClick={onConfirm} style={{ border: 'none', background: '#9B5158', cursor: 'pointer', color: '#fff', fontSize: 14.5, fontWeight: 500, padding: '11px 22px', borderRadius: 10 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Search / filter ─────────────────────────────────────────
function JournalSearch({ t, moods, entries, onBack, onOpen }) {
  const [q, setQ] = jUseState('');
  const [range, setRange] = jUseState('all');     // all | 7 | month
  const [picked, setPicked] = jUseState([]);      // moodIds

  const now = Date.now();
  const monthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); })();
  const results = entries.filter(e => {
    if (q && !e.text.toLowerCase().includes(q.toLowerCase())) return false;
    if (picked.length && !picked.includes(e.moodId)) return false;
    const ts = e.updatedAt || e.ts;
    if (range === '7' && ts < now - 7 * DAY) return false;
    if (range === 'month' && ts < monthStart) return false;
    return true;
  });
  const toggle = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const clear = () => { setQ(''); setRange('all'); setPicked([]); };
  const dirty = q || range !== 'all' || picked.length;

  return (
    <div data-screen-label="Journal Search" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '56px 18px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} aria-label="Back" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M7.5 1L1 8l6.5 7" stroke="var(--ink-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 999, padding: '9px 14px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="var(--ink-3)" strokeWidth="1.7"/><path d="M16 16l4 4" stroke="var(--ink-3)" strokeWidth="1.7" strokeLinecap="round"/></svg>
          <input value={q} onChange={e => setQ(e.target.value)} autoFocus placeholder="Search reflections" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: 'var(--ink-1)', fontFamily: 'inherit' }} />
        </div>
      </div>

      <div style={{ padding: '8px 22px 4px' }}>
        {/* date range */}
        <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
          {[['all', 'All time'], ['7', 'Last 7 days'], ['month', 'This month']].map(([k, l]) => (
            <button key={k} onClick={() => setRange(k)} style={{
              border: '1px solid ' + (range === k ? 'transparent' : 'var(--line)'), cursor: 'pointer', borderRadius: 999, padding: '7px 13px', fontSize: 12,
              background: range === k ? 'var(--ink-1)' : 'transparent', color: range === k ? 'var(--bg)' : 'var(--ink-2)', fontWeight: 500,
            }}>{l}</button>
          ))}
        </div>
        {/* mood chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          {moods.map(m => {
            const on = picked.includes(m.id);
            return <button key={m.id} onClick={() => toggle(m.id)} aria-label={m.label} title={m.label} style={{
              width: 32, height: 32, borderRadius: '50%', background: m.color, cursor: 'pointer',
              border: on ? '2px solid var(--ink-1)' : '2px solid transparent', outline: '1px solid rgba(0,0,0,0.06)', outlineOffset: -1, opacity: on || !picked.length ? 1 : 0.4,
            }} />;
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 6px' }}>
          <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 }}>{results.length} result{results.length === 1 ? '' : 's'}</span>
          {dirty ? <button onClick={clear} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-2)', textDecoration: 'underline' }}>Clear filters</button> : null}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map(e => <EntryCard key={e.id} entry={e} moods={moods} radius={t.radius} onOpen={() => onOpen(e)} />)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { JournalTab, SEED_JOURNAL });
