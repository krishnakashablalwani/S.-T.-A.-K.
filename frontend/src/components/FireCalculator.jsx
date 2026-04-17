import React, { useState, useEffect, useRef } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, ResponsiveContainer, Area,
} from 'recharts';
import { TrendingUp, RefreshCw, AlertCircle, DollarSign, Flame } from 'lucide-react';

/* ── HOOKS ──────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 2000, active = false) => {
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

/* ── FORMAT ─────────────────────────────────────────────────────── */
const fmtCr = (n) =>
  n == null  ? '—'
  : n >= 10000000 ? `₹${(n / 10000000).toFixed(2)}Cr`
  : n >= 100000   ? `₹${(n / 100000).toFixed(1)}L`
  : `₹${n.toLocaleString('en-IN')}`;

const fmtCrShort = (n) =>
  n >= 10000000 ? `${(n / 10000000).toFixed(1)}Cr`
  : n >= 100000 ? `${(n / 100000).toFixed(0)}L`
  : `${Math.round(n / 1000)}K`;

/* ── FIRE READINESS RING GAUGE ──────────────────────────────────── */
const FireRing = ({ pct, active, yearsCurrent, yearsDream, yearsSaved }) => {
  const [animPct, setAnimPct] = useState(0);
  const SIZE   = 260;
  const STROKE = 22;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;
  const gap    = pct >= 80 ? '#0BF46C' : pct >= 50 ? '#FFD700' : pct >= 25 ? '#FF6B00' : '#FF0000';

  useEffect(() => {
    if (!active) return;
    setAnimPct(0);
    const t0 = Date.now();
    const dur = 2000;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setAnimPct(Math.round(e * pct));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [pct, active]);

  const dash   = (animPct / 100) * CIRC;
  const label  = animPct >= 80 ? 'FIRE READY' : animPct >= 50 ? 'ON TRACK' : animPct >= 25 ? 'BUILDING' : 'EARLY DAYS';

  return (
    <div className="brutal-box p-8 flex flex-col items-center text-center chart-card-animate"
      style={{ animationDelay: '0s', borderColor: gap, boxShadow: `8px 8px 0 ${gap}55` }}>
      <div className="text-[10px] font-black uppercase tracking-widest mb-4 text-brand-gray">
        🔥 FIRE Readiness Score
      </div>
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none" stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE} strokeLinecap="round" />
          {/* Progress arc */}
          <circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none" stroke={gap}
            strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: 'none', filter: `drop-shadow(0 0 12px ${gap})` }} />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[64px] font-black tabular-nums leading-none" style={{ color: gap, textShadow: `0 0 40px ${gap}` }}>
            {animPct}
          </div>
          <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: gap }}>%</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-gray mt-1">{label}</div>
        </div>
      </div>

      {/* Quick stats under ring */}
      <div className="grid grid-cols-3 gap-3 mt-5 w-full">
        <div className="text-center">
          <div className="text-xs font-black uppercase text-brand-gray mb-1">Current</div>
          <div className="text-2xl font-black" style={{ color: '#0BF46C' }}>
            {yearsCurrent ?? '50+'}
          </div>
          <div className="text-[9px] font-black uppercase text-brand-gray">yrs to FIRE</div>
        </div>
        <div className="text-center border-x-2 border-brand-gray/20">
          <div className="text-xs font-black uppercase text-brand-gray mb-1">You Save</div>
          <div className="text-2xl font-black" style={{ color: '#FF0000', textShadow: '0 0 20px rgba(255,0,0,0.5)' }}>
            {yearsSaved ?? '—'}
          </div>
          <div className="text-[9px] font-black uppercase text-brand-danger">yrs of life</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-black uppercase text-brand-gray mb-1">Dream</div>
          <div className="text-2xl font-black" style={{ color: '#8B5CF6' }}>
            {yearsDream ?? '50+'}
          </div>
          <div className="text-[9px] font-black uppercase text-brand-gray">yrs to FIRE</div>
        </div>
      </div>
    </div>
  );
};

/* ── SKELETON ───────────────────────────────────────────────────── */
const FireSkeleton = () => {
  const [tick, setTick] = useState(0);
  const steps = [
    'Calculating your FIRE number…',
    'Running month-by-month compounding…',
    'Projecting current path…',
    'Projecting dream career path…',
    'Quantifying years saved…',
  ];
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % steps.length), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-8 fade-in">
      <div className="brutal-box p-10 text-center" style={{ borderColor: '#FFD700' }}>
        <div className="text-7xl mb-4">🔥</div>
        <div className="text-4xl font-black uppercase blink mb-3" style={{ color: '#FFD700' }}>
          Crunching Your Numbers
        </div>
        <p className="text-sm font-black uppercase text-brand-gray tracking-widest">{steps[tick]}</p>
        <div className="mt-8 flex justify-center gap-3">
          {steps.map((_, i) => (
            <div key={i} className="h-2 w-2 transition-all duration-300" style={{
              backgroundColor: i <= tick ? '#FFD700' : 'var(--color-brand-gray)',
              transform: i === tick ? 'scale(1.8)' : 'scale(1)',
              boxShadow: i === tick ? '0 0 8px rgba(255,215,0,0.8)' : 'none',
            }} />
          ))}
        </div>
      </div>
      {/* Ring skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal-box p-8 flex items-center justify-center">
          <div className="skeleton-shimmer rounded-full" style={{ width: 200, height: 200 }} />
        </div>
        <div className="brutal-box p-8 space-y-6">
          <div className="skeleton-shimmer h-16 w-48 mx-auto" />
          <div className="skeleton-shimmer h-4 w-full" />
          <div className="skeleton-shimmer h-4 w-5/6" />
          <div className="skeleton-shimmer h-4 w-4/6" />
        </div>
      </div>
      <div className="brutal-box p-6">
        <div className="skeleton-shimmer h-3 w-48 mb-6" />
        <div className="skeleton-shimmer h-64 w-full" />
      </div>
    </div>
  );
};

/* ── CUSTOM TOOLTIP ─────────────────────────────────────────────── */
const FireTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="brutal-box p-3 text-xs font-black uppercase space-y-1"
      style={{ backgroundColor: 'var(--color-brand-black)', borderColor: 'var(--color-brand-light)' }}>
      <div className="text-brand-gray mb-1">Year {label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {fmtCr(p.value)}
        </div>
      ))}
    </div>
  );
};

/* ── SLIDER ─────────────────────────────────────────────────────── */
const SliderInput = ({ label, value, min, max, step = 1, onChange, unit = '', color = '#FFD700' }) => (
  <div>
    <div className="flex justify-between text-xs font-black uppercase mb-2">
      <label className="text-brand-gray">{label}</label>
      <span style={{ color, textShadow: `0 0 8px ${color}55` }}>{unit}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full" style={{ accentColor: color }} />
    <div className="flex justify-between text-[9px] text-brand-gray/40 font-black mt-0.5">
      <span>{unit}{min.toLocaleString('en-IN')}</span><span>{unit}{max.toLocaleString('en-IN')}</span>
    </div>
  </div>
);

/* ── MAIN ───────────────────────────────────────────────────────── */
const FireCalculator = () => {
  const [form, setForm] = useState({
    currentMonthlySalary: 100000,
    monthlyExpenses:       60000,
    currentSavings:        500000,
    dreamMonthlySalary:   200000,
    annualReturnRate:       0.12,
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [active,  setActive]  = useState(false);

  const fireAnim   = useCountUp(result?.fireTarget,          2200, active);
  const sipAnim    = useCountUp(result?.sipNeededCurrent,    1800, active);
  const sipDreamAnim = useCountUp(result?.sipNeededDream,    1800, active);
  const narrative  = useTypewriter(result?.narrative, 12, active);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Derived
  const monthlySavings = form.currentMonthlySalary - form.monthlyExpenses;
  const savingsRate    = form.currentMonthlySalary > 0 ? Math.round((monthlySavings / form.currentMonthlySalary) * 100) : 0;
  const srColor        = savingsRate >= 30 ? '#0BF46C' : savingsRate >= 15 ? '#FFD700' : '#FF0000';
  const srLabel        = savingsRate >= 30 ? '🟢 Strong saver' : savingsRate >= 15 ? '🟡 Moderate' : '🔴 Too low';

  // FIRE readiness: 0–100 based on currentYears (50+ = 0, 0 = 100)
  const readinessPct = result
    ? result.currentYears ? Math.max(0, Math.round(100 - (result.currentYears / 50) * 100)) : 0
    : 0;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true); setActive(false); setError('');
    const minDelay = new Promise((r) => setTimeout(r, 2600));
    try {
      const [data] = await Promise.all([
        fetch('http://localhost:5000/api/fire', {
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
  const fireTarget  = result?.fireTarget;

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono pb-20">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="border-b-8 border-brand-light pb-6 slide-in-left">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter flex items-center gap-3">
          <Flame size={44} strokeWidth={2} style={{ color: '#FFD700', filter: 'drop-shadow(0 0 12px #FFD700)' }} />
          FIRE Calculator
        </h2>
        <p className="text-brand-gray font-black uppercase mt-2 text-xs tracking-widest">
          Financial Independence · Retire Early · Every year you delay costs you more than money
        </p>
      </div>

      {/* ── LIVE SAVINGS RATE BADGE ─────────────────────────────────── */}
      {!result && !loading && (
        <div className="brutal-box p-4 flex items-center gap-4 text-xs font-black uppercase"
          style={{ backgroundColor: `${srColor}08`, borderColor: srColor, borderWidth: 3 }}>
          <span className="text-brand-gray">Live savings rate:</span>
          <span className="text-2xl font-black tabular-nums" style={{ color: srColor, textShadow: `0 0 10px ${srColor}` }}>
            {savingsRate}%
          </span>
          <span style={{ color: srColor }}>{srLabel}</span>
          <span className="ml-auto text-brand-gray">₹{Math.max(0, monthlySavings).toLocaleString('en-IN')}/mo saving</span>
        </div>
      )}

      {/* ── FORM ────────────────────────────────────────────────────── */}
      {!result && !loading && (
        <form onSubmit={handleSubmit} className="chart-card-animate brutal-box p-8 space-y-8"
          style={{ animationDelay: '0.1s', borderColor: '#FFD70033' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SliderInput label="💼 Current Monthly Salary"
              value={form.currentMonthlySalary} min={20000} max={1000000} step={5000}
              onChange={(v) => set('currentMonthlySalary', v)} unit="₹" color="#0BF46C" />
            <SliderInput label="🏠 Monthly Expenses (all-in)"
              value={form.monthlyExpenses} min={10000} max={500000} step={5000}
              onChange={(v) => set('monthlyExpenses', v)} unit="₹" color="#FF6B00" />
            <SliderInput label="💎 Current Portfolio / Investments"
              value={form.currentSavings} min={0} max={20000000} step={100000}
              onChange={(v) => set('currentSavings', v)} unit="₹" color="#8B5CF6" />
            <SliderInput label="🚀 Dream Career Monthly Salary"
              value={form.dreamMonthlySalary} min={20000} max={2000000} step={5000}
              onChange={(v) => set('dreamMonthlySalary', v)} unit="₹" color="#FFD700" />
            <SliderInput label="📈 Expected Annual Returns"
              value={Math.round(form.annualReturnRate * 100)} min={6} max={20}
              onChange={(v) => set('annualReturnRate', v / 100)} unit="%" color="#3B82F6" />
          </div>
          <button type="submit"
            className="brutal-btn w-full py-6 text-xl flex items-center justify-center gap-3"
            style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>
            <Flame size={22} /> CALCULATE MY FIRE DATE
          </button>
        </form>
      )}

      {/* ── ERROR ───────────────────────────────────────────────────── */}
      {error && (
        <div className="brutal-box p-4 text-white font-black text-center uppercase fade-in"
          style={{ backgroundColor: 'var(--color-brand-danger)' }}>
          <AlertCircle className="inline mr-2" size={18} /> {error}
        </div>
      )}

      {/* ── SKELETON ────────────────────────────────────────────────── */}
      {loading && <FireSkeleton />}

      {/* ── RESULTS ─────────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-8">
          <div className="flex items-center justify-between slide-in-left">
            <div className="text-xs font-black uppercase text-brand-gray">🔥 FIRE Analysis</div>
            <button onClick={handleReset}
              className="flex items-center gap-2 text-xs font-black uppercase text-brand-gray hover:text-brand-light transition-colors">
              <RefreshCw size={14} /> New Scenario
            </button>
          </div>

          {/* ── TOP ROW: Giant FIRE number + Ring side by side ───────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* FIRE corpus — hero card */}
            <div className="chart-card-animate brutal-box p-8 flex flex-col justify-center text-center"
              style={{ animationDelay: '0s', borderColor: '#FFD700', borderWidth: 4,
                boxShadow: '10px 10px 0 rgba(255,215,0,0.3)',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.04) 0%, transparent 60%)' }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-3">
                🎯 Your FIRE Number
              </div>
              <div className="text-[72px] font-black tabular-nums leading-none"
                style={{ color: '#FFD700', textShadow: '0 0 60px rgba(255,215,0,0.7)' }}>
                {fmtCr(fireAnim)}
              </div>
              <div className="text-[10px] text-brand-gray font-black uppercase mt-3 leading-5">
                25× annual expenses<br />
                Invested at {Math.round(form.annualReturnRate * 100)}% p.a. → covers you <em>forever</em>
              </div>

              {/* SIP needed */}
              <div className="mt-6 pt-5 border-t-2 border-brand-gray/20 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] font-black uppercase text-brand-gray mb-1">SIP Needed Now</div>
                  <div className="text-xl font-black tabular-nums" style={{ color: '#0BF46C' }}>
                    {fmtCr(sipAnim)}<span className="text-xs">/mo</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase text-brand-gray mb-1">SIP on Dream Salary</div>
                  <div className="text-xl font-black tabular-nums" style={{ color: '#8B5CF6' }}>
                    {fmtCr(sipDreamAnim)}<span className="text-xs">/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Readiness Ring */}
            <FireRing
              pct={readinessPct}
              active={active}
              yearsCurrent={result.currentYears}
              yearsDream={result.dreamYears}
              yearsSaved={result.yearsSaved}
            />
          </div>

          {/* ── LIFE YEARS SAVED — dramatic banner ───────────────────── */}
          {result.yearsSaved > 0 && (
            <div className="chart-card-animate brutal-box p-8 text-center"
              style={{ animationDelay: '0.25s',
                borderColor: 'var(--color-brand-danger)', borderWidth: 4,
                boxShadow: '10px 10px 0 rgba(255,0,0,0.3)',
                background: 'linear-gradient(135deg, rgba(255,0,0,0.06) 0%, transparent 60%)' }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-danger mb-3">
                ⚡ Switching careers buys you back
              </div>
              <div className="text-[100px] font-black tabular-nums leading-none"
                style={{ color: 'var(--color-brand-danger)', textShadow: '0 0 60px rgba(255,0,0,0.6)' }}>
                {result.yearsSaved}
              </div>
              <div className="text-2xl font-black uppercase text-brand-danger">years of your life</div>
              <div className="text-sm font-black uppercase text-brand-gray mt-4 tracking-widest">
                That's <span style={{ color: 'var(--color-brand-danger)' }}>{result.yearsSaved * 52} Mondays</span>,&nbsp;
                <span style={{ color: 'var(--color-brand-danger)' }}>{result.yearsSaved * 12} months</span> of waking up without having to justify your existence to a manager.
              </div>
            </div>
          )}

          {/* ── WEALTH ACCUMULATION CHART ────────────────────────────── */}
          <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.35s' }}>
            <h3 className="text-xl font-black uppercase mb-1 text-brand-light">📈 Wealth Accumulation Paths</h3>
            <p className="text-[10px] font-black uppercase text-brand-gray mb-6 tracking-widest">
              Green dashed = current · Purple = dream career · Gold line = FIRE target
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={result.chartData} margin={{ top: 10, right: 24, left: 8, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year"
                  tick={{ fill: 'var(--color-brand-gray)', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) => `Y${v}`} />
                <YAxis
                  tick={{ fill: 'var(--color-brand-gray)', fontSize: 9, fontWeight: 700 }}
                  tickFormatter={fmtCrShort} width={52} />
                <Tooltip content={<FireTooltip />} />
                {fireTarget && (
                  <ReferenceLine y={fireTarget} stroke="#FFD700" strokeWidth={2.5} strokeDasharray="5 4"
                    label={{ value: '🎯 FIRE TARGET', fill: '#FFD700', fontSize: 9, fontWeight: 900, position: 'insideTopRight' }} />
                )}
                <Area type="monotone" dataKey="current" name="Current Path"
                  fill="rgba(11,244,108,0.06)" stroke="#0BF46C" strokeWidth={2.5} strokeDasharray="7 4"
                  dot={false} />
                <Line type="monotone" dataKey="dream" name="Dream Career"
                  stroke="#8B5CF6" strokeWidth={3.5} dot={false}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.7))' }} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ── AI NARRATIVE ─────────────────────────────────────────── */}
          <div className="chart-card-animate" style={{ animationDelay: '0.5s' }}>
            <div className="brutal-box p-8"
              style={{ borderColor: '#FFD700', borderWidth: 4, boxShadow: '8px 8px 0 rgba(255,215,0,0.18)' }}>
              <div className="text-[10px] font-black uppercase mb-5 flex items-center gap-2 tracking-widest text-yellow-400">
                <DollarSign size={12} />
                <span className="border-2 border-yellow-400 px-2 py-0.5">FIRE REALITY CHECK</span>
              </div>
              <div className="text-brand-light text-sm leading-7 min-h-[70px]"
                style={{ fontFamily: 'Georgia, serif' }}>
                {narrative.displayed}
                {!narrative.done && <span className="blink font-bold text-yellow-400">▌</span>}
              </div>
            </div>
          </div>

          {/* ── KEY NUMBERS TABLE ─────────────────────────────────────── */}
          <div className="chart-card-animate brutal-box p-6 space-y-3" style={{ animationDelay: '0.65s' }}>
            <h3 className="text-xl font-black uppercase text-brand-light border-b-4 border-brand-light pb-3">
              ⚡ Full Breakdown
            </h3>
            {[
              ['Current monthly savings',         fmtCr(result.monthlySavingsCurrent),  '#0BF46C'],
              ['Dream career monthly savings',    fmtCr(result.monthlySavingsDream),     '#8B5CF6'],
              ['Extra savings from career switch', fmtCr((result.monthlySavingsDream - result.monthlySavingsCurrent) * 12) + '/yr', '#FFD700'],
              ['FIRE corpus target',               fmtCr(result.fireTarget),              '#FFD700'],
              ['SIP needed (current salary)',      fmtCr(result.sipNeededCurrent) + '/mo', '#0BF46C'],
              ['SIP needed (dream salary)',        fmtCr(result.sipNeededDream) + '/mo',   '#8B5CF6'],
              ['Expected return rate',             `${Math.round(form.annualReturnRate * 100)}% p.a.`, '#3B82F6'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-brand-gray/15 pb-2">
                <span className="font-black uppercase text-xs text-brand-gray">{label}</span>
                <span className="font-black" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FireCalculator;
