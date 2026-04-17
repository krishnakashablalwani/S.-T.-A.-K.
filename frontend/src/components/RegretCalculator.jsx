import React, { useState, useEffect } from 'react';
import { Skull, Clock, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';

/* ── HOOKS ──────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 1800, active = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    setVal(0);
    const t0 = Date.now();
    const raf = () => {
      const prog = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3); // ease-out cubic
      setVal(Math.round(eased * target));
      if (prog < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
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

/* ── LOADING SKELETON ───────────────────────────────────────────── */
const RegretSkeleton = () => {
  const [tick, setTick] = useState(0);
  const steps = [
    'Auditing opportunity cost…',
    'Computing compound wealth gap…',
    'Scoring regret dimensions…',
    'Retrieving message from your 65-year-old self…',
    'Preparing your verdict…',
  ];
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % steps.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-8 fade-in">
      <div className="brutal-box p-10 text-center">
        <div className="text-6xl mb-6">💀</div>
        <div className="text-3xl font-black uppercase text-brand-danger blink mb-3">
          Auditing Your Choices
        </div>
        <div className="text-sm font-black uppercase text-brand-gray h-5 transition-all">
          {steps[tick]}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-none transition-all duration-300"
              style={{
                backgroundColor: i <= tick ? 'var(--color-brand-danger)' : 'var(--color-brand-gray)',
                transform: i === tick ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 0.15, 0.3].map((d, i) => (
          <div key={i} className="chart-card-animate brutal-box p-6" style={{ animationDelay: `${d}s` }}>
            <div className="skeleton-shimmer h-4 w-24 mb-4" />
            <div className="skeleton-shimmer h-12 w-36 mb-2" />
            <div className="skeleton-shimmer h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.45s' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-5">
            <div className="skeleton-shimmer h-3 w-48 mb-2" />
            <div className="skeleton-shimmer h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="chart-card-animate brutal-box p-8" style={{ animationDelay: '0.6s' }}>
        <div className="skeleton-shimmer h-4 w-64 mb-6" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-shimmer h-3 w-full mb-3" style={{ width: `${95 - i * 5}%` }} />
        ))}
      </div>
    </div>
  );
};

/* ── VERDICT CONFIG ─────────────────────────────────────────────── */
const VERDICT = {
  PIVOT_NOW: {
    label: '🔥 PIVOT NOW',
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.08)',
    desc: 'Your regret trajectory is critical. Every additional day of inaction compounds your future pain irreversibly.',
  },
  PLAN_PIVOT: {
    label: '⚡ PLAN YOUR PIVOT',
    color: '#FFD700',
    bg: 'rgba(255,215,0,0.08)',
    desc: 'The window is closing but not shut. Design your exit strategy within the next 90 days — then execute.',
  },
  STAY_OPTIMISE: {
    label: '✅ STAY & OPTIMISE',
    color: '#0BF46C',
    bg: 'rgba(11,244,108,0.08)',
    desc: "Your regret trajectory is manageable — but don't confuse comfort with satisfaction.",
  },
};

const fmt = (n) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr`
  : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : `₹${n.toLocaleString('en-IN')}`;

const regretColor = (v) => v > 70 ? '#FF0000' : v > 45 ? '#FFD700' : '#0BF46C';
const regretLabel = (v) => v > 70 ? 'CRITICAL' : v > 45 ? 'MODERATE' : 'MANAGEABLE';

/* ── MAIN COMPONENT ─────────────────────────────────────────────── */
const RegretCalculator = () => {
  const [form, setForm] = useState({
    currentCareer: '',
    dreamCareer: '',
    currentAge: 27,
    yearsOfHesitation: 2,
    currentSalary: 1200000,
  });
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);
  const [error,   setError]     = useState('');
  const [active,  setActive]    = useState(false); // triggers counters + typewriter

  const wealthGapCount   = useCountUp(result?.wealthGap,     2000, active);
  const costDayCount     = useCountUp(result?.costPerDay,     1200, active);
  const retirGapCount    = useCountUp(result?.retirementGap,  2400, active);
  const letter           = useTypewriter(result?.futureSelfLetter, 13, active);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setActive(false);
    setError('');

    const minDelay = new Promise(r => setTimeout(r, 2800));

    try {
      const [data] = await Promise.all([
        fetch('http://localhost:5000/api/regret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }).then(r => {
          if (!r.ok) throw new Error('Server error — check your backend is running.');
          return r.json();
        }),
        minDelay,
      ]);
      setResult(data);
      // Give one frame before triggering animations
      setTimeout(() => setActive(true), 80);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setActive(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono pb-20">

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <div className="border-b-8 border-brand-light pb-5 slide-in-left">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter flex items-center gap-3">
          <Skull size={44} strokeWidth={2.5} className="text-brand-danger" />
          Life Regret Calculator
        </h2>
        <p className="text-brand-gray font-black uppercase mt-2 text-xs tracking-widest">
          Quantify the financial &amp; emotional cost of career inaction · Brutally honest · No comfort zone
        </p>
      </div>

      {/* ── FORM ─────────────────────────────────────────────────── */}
      {!result && !loading && (
        <form
          onSubmit={handleSubmit}
          className="chart-card-animate brutal-box p-8 space-y-6"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                📍 Your Current Career / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer at TCS"
                value={form.currentCareer}
                onChange={e => set('currentCareer', e.target.value)}
                className="brutal-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                🎯 The Dream Career You Keep Delaying
              </label>
              <input
                type="text"
                placeholder="e.g. Independent Game Developer"
                value={form.dreamCareer}
                onChange={e => set('dreamCareer', e.target.value)}
                className="brutal-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                🎂 Your Current Age
              </label>
              <input
                type="number" min={18} max={60}
                value={form.currentAge}
                onChange={e => set('currentAge', Number(e.target.value))}
                className="brutal-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                ⏳ Years You've Been Hesitating
              </label>
              <input
                type="number" min={0} max={35}
                value={form.yearsOfHesitation}
                onChange={e => set('yearsOfHesitation', Number(e.target.value))}
                className="brutal-input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                💰 Current Annual Gross Salary (₹)
              </label>
              <input
                type="number" min={100000} step={50000}
                value={form.currentSalary}
                onChange={e => set('currentSalary', Number(e.target.value))}
                className="brutal-input"
                required
              />
              <p className="text-[10px] font-black uppercase text-brand-gray mt-1">
                Used to calculate compound opportunity cost. Stays private — never stored.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="brutal-btn w-full py-5 text-xl flex items-center justify-center gap-3"
          >
            <Skull size={22} /> CALCULATE MY LIFE REGRET
          </button>
        </form>
      )}

      {/* ── ERROR ─────────────────────────────────────────────────── */}
      {error && (
        <div className="brutal-box p-4 bg-brand-danger text-white font-black text-center uppercase fade-in">
          <AlertTriangle className="inline mr-2" size={18} /> {error}
        </div>
      )}

      {/* ── LOADING ───────────────────────────────────────────────── */}
      {loading && <RegretSkeleton />}

      {/* ── RESULTS ───────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-8">

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-black uppercase text-brand-gray hover:text-brand-light transition-colors slide-in-left"
          >
            <RefreshCw size={14} /> Recalculate
          </button>

          {/* VERDICT ──────────────────────────────────────────────── */}
          {(() => {
            const v = VERDICT[result.verdict];
            return (
              <div
                className="chart-card-animate brutal-box p-8 text-center"
                style={{
                  animationDelay: '0s',
                  borderColor: v.color,
                  borderWidth: '6px',
                  backgroundColor: v.bg,
                  boxShadow: `10px 10px 0 ${v.color}`,
                }}
              >
                <div className="text-5xl font-black uppercase tracking-tighter mb-2" style={{ color: v.color }}>
                  {v.label}
                </div>
                <div className="text-brand-light font-black text-sm max-w-xl mx-auto">{v.desc}</div>
              </div>
            );
          })()}

          {/* COST COUNTERS ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0.12s', borderColor: '#FF0000', boxShadow: '6px 6px 0 #FF0000' }}
            >
              <div className="text-[10px] font-black uppercase text-brand-danger mb-2 tracking-widest flex items-center justify-center gap-1">
                <TrendingDown size={12} /> Wealth Left on Table
              </div>
              <div className="text-4xl font-black text-brand-danger tabular-nums leading-none">
                {fmt(wealthGapCount)}
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">
                from {result.yearsOfHesitation}yr of hesitation
              </div>
            </div>

            <div className="chart-card-animate brutal-box p-6 text-center" style={{ animationDelay: '0.22s' }}>
              <div className="text-[10px] font-black uppercase text-brand-gray mb-2 tracking-widest flex items-center justify-center gap-1">
                <Clock size={12} /> Cost Per Day
              </div>
              <div className="text-4xl font-black text-brand-light tabular-nums leading-none">
                ₹{costDayCount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">ticking every 24 hrs</div>
            </div>

            <div className="chart-card-animate brutal-box p-6 text-center" style={{ animationDelay: '0.32s' }}>
              <div className="text-[10px] font-black uppercase text-brand-gray mb-2 tracking-widest">
                🏁 Retirement Gap (age 65)
              </div>
              <div
                className="text-4xl font-black tabular-nums leading-none"
                style={{ color: regretColor(result.overallRegretScore) }}
              >
                {fmt(retirGapCount)}
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">
                less wealth if you stay
              </div>
            </div>
          </div>

          {/* REGRET SCORE + BREAKDOWN ─────────────────────────────── */}
          <div
            className="chart-card-animate brutal-box p-6"
            style={{ animationDelay: '0.42s' }}
          >
            <div className="flex items-start justify-between mb-6 border-b-4 border-brand-light pb-4">
              <h3 className="text-xl font-black uppercase text-brand-light">📊 Regret Breakdown</h3>
              <div className="text-right">
                <div
                  className="text-4xl font-black tabular-nums"
                  style={{ color: regretColor(result.overallRegretScore) }}
                >
                  {result.overallRegretScore}<span className="text-lg">/100</span>
                </div>
                <div
                  className="text-[10px] font-black uppercase"
                  style={{ color: regretColor(result.overallRegretScore) }}
                >
                  {regretLabel(result.overallRegretScore)} REGRET
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { label: '💰 Financial Regret',         key: 'financial' },
                { label: '🎯 Purpose / Meaning Regret', key: 'purpose'  },
                { label: '🗽 Autonomy Regret',           key: 'autonomy' },
                { label: '📈 Growth / Learning Regret',  key: 'growth'   },
              ].map(({ label, key }) => {
                const val = result.regretBreakdown[key];
                const col = regretColor(val);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-black uppercase mb-1">
                      <span className="text-brand-light">{label}</span>
                      <span style={{ color: col }}>{val}/100</span>
                    </div>
                    <div className="h-3 bg-brand-gray/20 border border-brand-light/20 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: active ? `${val}%` : '0%',
                          backgroundColor: col,
                          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BRUTAL TRUTHS ────────────────────────────────────────── */}
          <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.55s' }}>
            <h3 className="text-xl font-black uppercase border-b-4 border-brand-danger pb-3 mb-5 text-brand-danger flex items-center gap-2">
              <AlertTriangle size={20} /> Brutal Truths
            </h3>
            <ul className="space-y-4">
              {result.insights.map((insight, i) => (
                <li
                  key={i}
                  className="chart-card-animate flex gap-3 items-start text-sm font-medium text-brand-light border-l-4 border-brand-danger pl-4 py-1"
                  style={{ animationDelay: `${0.55 + i * 0.1}s` }}
                >
                  <span className="shrink-0 font-black text-brand-danger text-xs mt-0.5">{i + 1}.</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* FUTURE SELF LETTER ───────────────────────────────────── */}
          <div className="chart-card-animate" style={{ animationDelay: '0.9s' }}>
            <div
              className="brutal-box p-8"
              style={{
                borderColor: '#725752',
                borderWidth: '4px',
                boxShadow: '8px 8px 0 rgba(114,87,82,0.35)',
              }}
            >
              {/* Letter header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-brand-gray/40">
                <div className="text-[10px] font-black uppercase font-mono text-brand-gray tracking-widest">
                  <span
                    className="border-2 border-brand-danger text-brand-danger px-2 py-0.5 mr-2"
                    style={{ fontVariantCaps: 'all-small-caps' }}
                  >
                    CLASSIFIED
                  </span>
                  Letter from your 65-year-old self ·{' '}
                  {result.currentCareer} → {result.dreamCareer}
                </div>
              </div>

              {/* Typewriter text */}
              <div
                className="text-brand-light text-sm leading-7 whitespace-pre-line min-h-[160px]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {letter.displayed}
                {!letter.done && (
                  <span className="blink text-brand-accent font-bold">▌</span>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t-2 border-brand-gray/30 flex justify-between items-end">
                <div className="text-[10px] font-mono uppercase text-brand-gray">
                  — Your Future Self, Age 65 ·{' '}
                  {result.yearsToRetirement} years from now
                </div>
                <div
                  className="text-[10px] font-black uppercase px-2 py-0.5 border-2"
                  style={{
                    borderColor: regretColor(result.overallRegretScore),
                    color: regretColor(result.overallRegretScore),
                  }}
                >
                  Regret Score: {result.overallRegretScore}/100
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default RegretCalculator;
