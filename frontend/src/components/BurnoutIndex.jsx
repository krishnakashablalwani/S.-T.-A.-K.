import React, { useState, useEffect, useRef } from 'react';
import { Flame, RefreshCw, AlertCircle } from 'lucide-react';

/* ── TYPEWRITER ─────────────────────────────────────────────────── */
const useTypewriter = (text = '', speed = 14, active = false) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active || !text) return;
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return { displayed, done: displayed.length >= text.length };
};

/* ── ANIMATED COUNTER ───────────────────────────────────────────── */
const useCountUp = (target, duration = 1400, active = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target == null) return;
    setVal(0);
    const t0 = Date.now();
    const tick = () => {
      const prog  = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(eased * target));
      if (prog < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
};

/* ── BURNOUT RING GAUGE ─────────────────────────────────────────── */
const BurnoutRing = ({ score, active }) => {
  const r    = 62;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? '#FF0000' : score >= 50 ? '#FF6B00' : score >= 25 ? '#FFD700' : '#0BF46C';
  const offset = circ * (1 - (active ? score : 0) / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
        {/* Color zones (background tints) */}
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: active ? 'stroke-dashoffset 2s cubic-bezier(0.22,1,0.36,1)' : 'none', filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div className="absolute text-center select-none">
        <div className="text-4xl font-black tabular-nums" style={{ color }}>{active ? score : 0}</div>
        <div className="text-[9px] text-brand-gray font-black uppercase tracking-widest">/ 100</div>
      </div>
    </div>
  );
};

/* ── VERDICT CONFIG ─────────────────────────────────────────────── */
const VERDICT = {
  CRITICAL: { color: '#FF0000', bg: 'rgba(255,0,0,0.12)',    emoji: '🚨', label: 'CRITICAL — EXIT IMMEDIATELY' },
  WARNING:  { color: '#FF6B00', bg: 'rgba(255,107,0,0.12)',  emoji: '⚠️', label: 'WARNING — ACT WITHIN 30 DAYS' },
  WATCH:    { color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   emoji: '👀', label: 'WATCH — BUILD A BACKUP PLAN' },
  STABLE:   { color: '#0BF46C', bg: 'rgba(11,244,108,0.10)', emoji: '✅', label: 'STABLE — MAINTAIN YOUR BUFFERS' },
};

/* ── DIMENSION BAR ──────────────────────────────────────────────── */
const DimBar = ({ label, value, color, delay, active }) => (
  <div className="chart-card-animate" style={{ animationDelay: `${delay}s` }}>
    <div className="flex justify-between text-xs font-black uppercase mb-1">
      <span className="text-brand-gray">{label}</span>
      <span style={{ color }}>{value}/100</span>
    </div>
    <div className="h-3 border border-brand-gray/30" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
      <div className="h-full transition-all duration-1500"
        style={{ width: active ? `${value}%` : '0%', backgroundColor: color, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
    </div>
  </div>
);

/* ── SKELETON ───────────────────────────────────────────────────── */
const BurnoutSkeleton = () => {
  const [tick, setTick] = useState(0);
  const steps = [
    'Scanning your work patterns…',
    'Analysing physical load…',
    'Measuring motivational reserves…',
    'Calculating relational friction…',
    'Computing days until breakdown…',
  ];
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % steps.length), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-8 fade-in">
      <div className="brutal-box p-10 text-center">
        <div className="text-6xl mb-5">🔥</div>
        <div className="text-3xl font-black uppercase mb-3" style={{ color: 'var(--color-brand-danger)' }}>
          Calculating Runway
        </div>
        <div className="text-sm font-black uppercase text-brand-gray h-5">{steps[tick]}</div>
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-2 w-2 transition-all duration-300" style={{
              backgroundColor: i <= tick ? 'var(--color-brand-danger)' : 'var(--color-brand-gray)',
              transform: i === tick ? 'scale(1.6)' : 'scale(1)',
            }} />
          ))}
        </div>
      </div>
      {/* Skeleton ring */}
      <div className="brutal-box p-8 flex flex-col items-center gap-6">
        <div className="skeleton-shimmer rounded-full" style={{ width: 180, height: 180 }} />
        <div className="skeleton-shimmer h-12 w-48" />
      </div>
    </div>
  );
};

/* ── SLIDER INPUT ───────────────────────────────────────────────── */
const SliderInput = ({ label, value, min, max, step = 1, onChange, unit = '', color = 'var(--color-brand-accent)' }) => (
  <div>
    <div className="flex justify-between text-xs font-black uppercase mb-2">
      <label className="text-brand-gray">{label}</label>
      <span style={{ color }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-brand-accent"
      style={{ accentColor: color }} />
    <div className="flex justify-between text-[9px] text-brand-gray/60 font-black mt-0.5">
      <span>{min}{unit}</span><span>{max}{unit}</span>
    </div>
  </div>
);

/* ── TOGGLE BUTTONS ─────────────────────────────────────────────── */
const ToggleGroup = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-black uppercase mb-2 text-brand-gray">{label}</label>
    <div className="flex gap-0 border-2 border-brand-gray/30 overflow-hidden w-fit">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className="px-4 py-2 text-xs font-black uppercase transition-all"
          style={{
            backgroundColor: value === o.value ? o.color : 'transparent',
            color: value === o.value ? '#000' : 'var(--color-brand-gray)',
          }}>
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

/* ── MAIN ───────────────────────────────────────────────────────── */
const BurnoutIndex = () => {
  const [form, setForm] = useState({
    role:               '',
    hoursPerWeek:       45,
    commuteMinutes:     60,
    lastVacationMonths: 6,
    likesWork:          true,
    managerQuality:     'ok',
    workLifeBalance:    5,
    meaningfulness:     5,
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [active,  setActive]  = useState(false);

  const daysAnim    = useCountUp(result?.daysUntilBreakdown, 1600, active);
  const overallAnim = useCountUp(result?.overall,           1400, active);
  const narrative   = useTypewriter(result?.narrative, 16, active);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.role.trim()) { setError('Please enter your job role.'); return; }
    setLoading(true);
    setActive(false);
    setError('');
    const minDelay = new Promise((r) => setTimeout(r, 2000));
    try {
      const [data] = await Promise.all([
        fetch('http://localhost:5000/api/burnout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        }).then((r) => { if (!r.ok) throw new Error('Backend error'); return r.json(); }),
        minDelay,
      ]);
      setResult(data);
      setTimeout(() => setActive(true), 80);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setActive(false); setError(''); };
  const v = result ? (VERDICT[result.verdict] || VERDICT.WATCH) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono pb-20">

      {/* HEADER */}
      <div className="border-b-8 border-brand-light pb-5 slide-in-left">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter flex items-center gap-3">
          <Flame size={44} strokeWidth={2.5} style={{ color: 'var(--color-brand-danger)' }} />
          Burnout Runway
        </h2>
        <p className="text-brand-gray font-black uppercase mt-2 text-xs tracking-widest">
          How many days until something breaks? · 4-dimension burnout index · AI escape protocol
        </p>
      </div>

      {/* FORM */}
      {!result && !loading && (
        <form onSubmit={handleSubmit} className="chart-card-animate brutal-box p-8 space-y-7" style={{ animationDelay: '0.1s' }}>

          <div>
            <label className="block text-xs font-black uppercase mb-2 text-brand-gray">💼 Your Current Job / Role</label>
            <input type="text" placeholder="e.g. Senior Software Engineer at StartupXYZ"
              value={form.role} onChange={(e) => set('role', e.target.value)}
              className="brutal-input" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <SliderInput label="⏰ Hours worked per week"
              value={form.hoursPerWeek} min={30} max={90} onChange={(v) => set('hoursPerWeek', v)}
              unit="h" color="#FF6B00" />
            <SliderInput label="🚌 Daily commute (one way)"
              value={form.commuteMinutes} min={0} max={180} onChange={(v) => set('commuteMinutes', v)}
              unit=" min" color="#FF6B00" />
            <SliderInput label="✈ Last vacation was"
              value={form.lastVacationMonths} min={0} max={24} onChange={(v) => set('lastVacationMonths', v)}
              unit=" mo ago" color='#FFD700' />
            <SliderInput label="⚖ Work-life balance (1=awful, 10=great)"
              value={form.workLifeBalance} min={1} max={10} onChange={(v) => set('workLifeBalance', v)}
              color="#0BF46C" />
            <SliderInput label="💡 Meaningfulness of work (1=pointless, 10=purpose-driven)"
              value={form.meaningfulness} min={1} max={10} onChange={(v) => set('meaningfulness', v)}
              color="#8B5CF6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <ToggleGroup label="❤️ Do you genuinely like your work?"
              value={form.likesWork ? 'yes' : 'no'}
              onChange={(v) => set('likesWork', v === 'yes')}
              options={[
                { value: 'yes', label: '✓ Yes',  color: '#0BF46C' },
                { value: 'no',  label: '✗ No',   color: '#FF0000' },
              ]} />
            <ToggleGroup label="👔 Manager quality"
              value={form.managerQuality}
              onChange={(v) => set('managerQuality', v)}
              options={[
                { value: 'good', label: '😊 Good', color: '#0BF46C' },
                { value: 'ok',   label: '😐 OK',   color: '#FFD700' },
                { value: 'bad',  label: '😤 Bad',  color: '#FF0000' },
              ]} />
          </div>

          <button type="submit" className="brutal-btn w-full py-5 text-xl flex items-center justify-center gap-3">
            <Flame size={22} /> CALCULATE MY RUNWAY
          </button>
        </form>
      )}

      {/* ERROR */}
      {error && (
        <div className="brutal-box p-4 bg-brand-danger text-white font-black text-center uppercase fade-in">
          <AlertCircle className="inline mr-2" size={18} /> {error}
        </div>
      )}

      {/* SKELETON */}
      {loading && <BurnoutSkeleton />}

      {/* RESULTS */}
      {result && !loading && v && (
        <div className="space-y-8">

          {/* Controls */}
          <div className="flex items-center justify-between slide-in-left">
            <div className="text-xs font-black uppercase text-brand-gray">🔥 Burnout Index — {result.role}</div>
            <button onClick={handleReset}
              className="flex items-center gap-2 text-xs font-black uppercase text-brand-gray hover:text-brand-light transition-colors">
              <RefreshCw size={14} /> Recalculate
            </button>
          </div>

          {/* VERDICT BANNER */}
          <div className="chart-card-animate brutal-box p-5 border-l-8 text-center"
            style={{ animationDelay: '0s', borderLeftColor: v.color, backgroundColor: v.bg }}>
            <div className="text-3xl font-black uppercase" style={{ color: v.color }}>
              {v.emoji} {v.label}
            </div>
          </div>

          {/* GAUGE + DAYS */}
          <div className="chart-card-animate brutal-box p-8 flex flex-col md:flex-row items-center justify-around gap-8"
            style={{ animationDelay: '0.1s' }}>
            <div className="text-center">
              <BurnoutRing score={result.overall} active={active} />
              <div className="text-xs font-black uppercase text-brand-gray mt-3 tracking-widest">Burnout Index</div>
            </div>

            <div className="text-center">
              <div className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: v.color }}>
                ⚡ Days Until Breakdown
              </div>
              <div className="text-7xl font-black tabular-nums leading-none" style={{ color: v.color,
                textShadow: `0 0 40px ${v.color}` }}>
                {daysAnim}
              </div>
              <div className="text-[10px] text-brand-gray font-black uppercase mt-2 tracking-widest">days remaining</div>
            </div>
          </div>

          {/* 4 DIMENSION BARS */}
          <div className="chart-card-animate brutal-box p-6 space-y-5" style={{ animationDelay: '0.25s' }}>
            <h3 className="text-xl font-black uppercase text-brand-light border-b-4 border-brand-light pb-3">
              📊 Burnout Dimensions
            </h3>
            <DimBar label="🏋 Physical Load"     value={result.dimensions.physical}     color="#FF6B00" delay={0.35} active={active} />
            <DimBar label="💫 Motivational Drain" value={result.dimensions.motivational} color="#FF0000" delay={0.45} active={active} />
            <DimBar label="🤝 Relational Friction"value={result.dimensions.relational}   color="#8B5CF6" delay={0.55} active={active} />
            <DimBar label="😰 Emotional Depletion"value={result.dimensions.emotional}    color="#FFD700" delay={0.65} active={active} />
          </div>

          {/* AI ESCAPE PROTOCOL */}
          <div className="chart-card-animate" style={{ animationDelay: '0.7s' }}>
            <div className="brutal-box p-8"
              style={{ borderColor: v.color, borderWidth: '4px', boxShadow: `8px 8px 0 ${v.color}40` }}>
              <div className="text-[10px] font-black uppercase mb-5 flex items-center gap-2 tracking-widest"
                style={{ color: v.color }}>
                <span className="border-2 px-2 py-0.5" style={{ borderColor: v.color }}>AI ESCAPE PROTOCOL</span>
                <span>Burnout Score: {result.overall}/100</span>
              </div>
              <div className="text-brand-light text-sm leading-7 min-h-[80px]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {narrative.displayed}
                {!narrative.done && (
                  <span className="blink font-bold" style={{ color: v.color }}>▌</span>
                )}
              </div>
            </div>
          </div>

          {/* RECOVERY ACTIONS */}
          <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.85s' }}>
            <h3 className="text-xl font-black uppercase text-brand-light border-b-4 border-brand-light pb-3 mb-5">
              🛡 Immediate Recovery Actions
            </h3>
            <div className="space-y-3">
              {[
                result.dimensions.physical > 60     && '📵 Set a hard stop at 6PM for the next 14 days. Non-negotiable. No exceptions.',
                result.dimensions.physical > 40     && '🚶 30-min walk before lunch — research shows this cuts cortisol faster than any supplement.',
                result.dimensions.motivational > 60 && '📝 Write down 3 things you want to be true about your career in 12 months. Start there.',
                result.dimensions.motivational > 40 && '📅 Block 1hr per week to explore the career you keep saying "someday" about.',
                result.dimensions.relational > 50   && '🗣 Have one direct conversation with your manager about what you need. Not a hint — a statement.',
                result.dimensions.emotional > 50    && '🧘 Take at least 2 full days off within the next 3 weeks — screen off, notifications off.',
                result.overall > 50                  && '🔴 Start your exit plan this week. Not the full plan — just the first document.',
              ].filter(Boolean).map((action, i) => (
                <div key={i} className="flex gap-3 items-start text-sm font-black text-brand-light">
                  <span className="text-brand-danger mt-0.5 shrink-0">→</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default BurnoutIndex;
