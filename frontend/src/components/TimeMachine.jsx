import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, ReferenceArea,
} from 'recharts';
import { Clock, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

/* ── HOOKS ──────────────────────────────────────────────────────── */
const useCountUp = (target, duration = 1800, active = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
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

/* ── HELPERS ────────────────────────────────────────────────────── */
const fmt = (n) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)}Cr`
  : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : `₹${Math.abs(n).toLocaleString('en-IN')}`;

/* ── YEAR PILL SELECTOR ─────────────────────────────────────────── */
const YearPills = ({ value, onChange, disabled }) => (
  <div className="flex gap-2 flex-wrap">
    {[1, 2, 3, 5, 10].map((y) => (
      <button
        key={y}
        type="button"
        disabled={disabled}
        onClick={() => onChange(y)}
        className="px-4 py-2 font-black uppercase text-xs border-2 transition-all"
        style={{
          borderColor:     value === y ? 'var(--color-brand-accent)' : 'var(--color-brand-gray)',
          backgroundColor: value === y ? 'var(--color-brand-accent)' : 'transparent',
          color:           value === y ? '#1A1A1A' : 'var(--color-brand-light)',
          opacity: disabled ? 0.5 : 1,
          cursor:  disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {y}Y AGO
      </button>
    ))}
  </div>
);

/* ── LOADING SKELETON ───────────────────────────────────────────── */
const TimeMachineSkeleton = ({ yearsAgo }) => {
  const [tick, setTick] = useState(0);
  const steps = [
    'Initialising temporal drive…',
    `Travelling back ${yearsAgo} year(s)…`,
    'Calculating alternate salary trajectory…',
    'Rendering ghost timeline…',
    'Generating alternate universe narrative…',
  ];
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % steps.length), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-8 fade-in">
      <div className="brutal-box p-10 text-center">
        <div className="text-6xl mb-5">⏰</div>
        <div className="text-3xl font-black uppercase blink mb-3" style={{ color: 'var(--color-brand-accent)' }}>
          Accessing the Past
        </div>
        <div className="text-sm font-black uppercase text-brand-gray h-5">{steps[tick]}</div>
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 transition-all duration-300"
              style={{
                backgroundColor: i <= tick ? 'var(--color-brand-accent)' : 'var(--color-brand-gray)',
                transform: i === tick ? 'scale(1.6)' : 'scale(1)',
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
        <div className="skeleton-shimmer h-3 w-48 mb-6" />
        <div className="skeleton-shimmer h-64 w-full" />
      </div>

      <div className="chart-card-animate brutal-box p-8" style={{ animationDelay: '0.6s' }}>
        <div className="skeleton-shimmer h-4 w-56 mb-5" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-shimmer h-3 mb-3" style={{ width: `${95 - i * 8}%` }} />
        ))}
      </div>
    </div>
  );
};

/* ── CUSTOM TOOLTIP ─────────────────────────────────────────────── */
const GhostTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const ghost   = payload.find((p) => p.dataKey === 'ghostSalary');
  const current = payload.find((p) => p.dataKey === 'currentSalary');
  return (
    <div
      className="brutal-box p-3 text-xs font-black uppercase"
      style={{ backgroundColor: 'var(--color-brand-black)', borderColor: 'var(--color-brand-light)' }}
    >
      <div className="mb-2" style={{ color: 'var(--color-brand-accent)' }}>Age {label}</div>
      {ghost   && <div className="mb-1" style={{ color: '#8B5CF6' }}>👻 Ghost: {fmt(ghost.value)}/yr</div>}
      {current && <div style={{ color: '#0BF46C' }}>📍 You: {fmt(current.value)}/yr</div>}
      {ghost && current && (
        <div className="mt-2 border-t border-brand-gray/30 pt-2" style={{ color: 'var(--color-brand-danger)' }}>
          Gap: +{fmt(ghost.value - current.value)}/yr
        </div>
      )}
    </div>
  );
};

/* ── MAIN COMPONENT ─────────────────────────────────────────────── */
const TimeMachine = () => {
  const [form, setForm] = useState({
    currentCareer: '',
    dreamCareer:   '',
    currentAge:    27,
    currentSalary: 1200000,
    yearsAgo:      2,
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [active,  setActive]  = useState(false);

  const salaryGapAnim = useCountUp(result?.salaryGapToday,  1800, active);
  const wealthGapAnim = useCountUp(result?.wealthGapToday,  2100, active);
  const futureGapAnim = useCountUp(result?.futureSalaryGap, 2400, active);
  const narrative     = useTypewriter(result?.narrative, 14, active);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const runSimulation = async (payload) => {
    setLoading(true);
    setActive(false);
    setError('');
    const minDelay = new Promise((r) => setTimeout(r, 2200));
    try {
      const [data] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/time-machine`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        }).then((r) => {
          if (!r.ok) throw new Error('Server error — make sure your backend is running.');
          return r.json();
        }),
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

  const handleSubmit = (e) => { e?.preventDefault(); runSimulation(form); };

  // Live-update years when pills change (only after first run)
  const handleYearsChange = (y) => {
    const next = { ...form, yearsAgo: y };
    setForm(next);
    if (result) runSimulation(next);
  };

  const handleReset = () => { setResult(null); setActive(false); setError(''); };

  const axisColor  = 'var(--color-brand-gray)';
  const futureRows = result?.timeline?.filter((p) => !p.isPast && !p.isToday) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono pb-20">

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className="border-b-8 border-brand-light pb-5 slide-in-left">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter flex items-center gap-3">
          <Clock size={44} strokeWidth={2.5} style={{ color: 'var(--color-brand-accent)' }} />
          Time Machine
        </h2>
        <p className="text-brand-gray font-black uppercase mt-2 text-xs tracking-widest">
          See exactly who you'd be today had you made the switch earlier · choose 1–10 years
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
                placeholder="e.g. Data Analyst at Infosys"
                value={form.currentCareer}
                onChange={(e) => set('currentCareer', e.target.value)}
                className="brutal-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                🎯 The Dream Career You're Delaying
              </label>
              <input
                type="text"
                placeholder="e.g. Machine Learning Engineer"
                value={form.dreamCareer}
                onChange={(e) => set('dreamCareer', e.target.value)}
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
                onChange={(e) => set('currentAge', Number(e.target.value))}
                className="brutal-input" required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">
                💰 Current Annual Salary (₹)
              </label>
              <input
                type="number" min={100000} step={50000}
                value={form.currentSalary}
                onChange={(e) => set('currentSalary', Number(e.target.value))}
                className="brutal-input" required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-3 text-brand-gray">
              ⏳ What if you had made the switch this many years ago?
            </label>
            <YearPills value={form.yearsAgo} onChange={(y) => set('yearsAgo', y)} disabled={false} />
          </div>

          <button
            type="submit"
            className="brutal-btn w-full py-5 text-xl flex items-center justify-center gap-3"
          >
            <Clock size={22} /> ENTER THE TIME MACHINE
          </button>
        </form>
      )}

      {/* ── ERROR ─────────────────────────────────────────────────── */}
      {error && (
        <div className="brutal-box p-4 bg-brand-danger text-white font-black text-center uppercase fade-in">
          <AlertCircle className="inline mr-2" size={18} /> {error}
        </div>
      )}

      {/* ── SKELETON ─────────────────────────────────────────────── */}
      {loading && <TimeMachineSkeleton yearsAgo={form.yearsAgo} />}

      {/* ── RESULTS ──────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-8">

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-in-left">
            <div>
              <div className="text-xs font-black uppercase text-brand-gray mb-2">
                ⏳ Adjust time window — updates instantly:
              </div>
              <YearPills value={result.yearsAgo} onChange={handleYearsChange} disabled={loading} />
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-black uppercase text-brand-gray hover:text-brand-light transition-colors self-end sm:self-auto"
            >
              <RefreshCw size={14} /> New Simulation
            </button>
          </div>

          {/* Scenario context */}
          <div
            className="chart-card-animate brutal-box p-5 border-l-8"
            style={{ animationDelay: '0s', borderLeftColor: 'var(--color-brand-accent)' }}
          >
            <div className="text-[10px] font-black uppercase text-brand-gray mb-1 tracking-widest">Scenario</div>
            <div className="text-base font-black text-brand-light leading-relaxed">
              If <span style={{ color: 'var(--color-brand-danger)' }}>{result.currentCareer}</span> you had switched to{' '}
              <span style={{ color: '#0BF46C' }}>{result.dreamCareer}</span>{' '}
              exactly <span style={{ color: 'var(--color-brand-accent)' }}>{result.yearsAgo} year(s) ago</span>{' '}
              at age <span style={{ color: 'var(--color-brand-accent)' }}>{result.currentAge - result.yearsAgo}</span>…
            </div>
            <div className="text-[10px] font-black uppercase text-brand-gray mt-2">
              Starting salary: {fmt(result.startSalary)} · Ghost grows at 18%/yr · Current grows at 10%/yr
            </div>
          </div>

          {/* 3 METRIC CARDS ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0.1s', borderColor: '#8B5CF6', boxShadow: '6px 6px 0 #8B5CF6' }}
            >
              <div className="text-[10px] font-black uppercase mb-2 tracking-widest" style={{ color: '#8B5CF6' }}>
                👻 Ghost Salary Gap Today
              </div>
              <div className="text-4xl font-black tabular-nums leading-none" style={{ color: '#8B5CF6' }}>
                +{fmt(salaryGapAnim)}/yr
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">
                more than you earn right now
              </div>
            </div>

            <div
              className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0.2s', borderColor: 'var(--color-brand-danger)', boxShadow: '6px 6px 0 var(--color-brand-danger)' }}
            >
              <div className="text-[10px] font-black uppercase text-brand-danger mb-2 tracking-widest">
                💸 Cumulative Wealth Gap
              </div>
              <div className="text-4xl font-black text-brand-danger tabular-nums leading-none">
                {fmt(wealthGapAnim)}
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">
                wealth you don't have today
              </div>
            </div>

            <div
              className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0.3s', borderColor: '#0BF46C', boxShadow: '6px 6px 0 #0BF46C' }}
            >
              <div className="text-[10px] font-black uppercase mb-2 tracking-widest" style={{ color: '#0BF46C' }}>
                📈 10-Year Future Salary Gap
              </div>
              <div className="text-4xl font-black tabular-nums leading-none" style={{ color: '#0BF46C' }}>
                +{fmt(futureGapAnim)}/yr
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">
                ahead at age {result.currentAge + 10}
              </div>
            </div>
          </div>

          {/* GHOST TRAJECTORY CHART ─────────────────────────────── */}
          <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.42s' }}>
            <h3 className="text-xl font-black uppercase mb-1 text-brand-light flex items-center gap-2">
              <TrendingUp size={20} /> Ghost Trajectory vs Your Current Path
            </h3>
            <p className="text-[10px] font-black uppercase text-brand-gray mb-6 tracking-widest">
              Purple area = ghost you · Green dashed = current you ·{' '}
              <span style={{ color: '#FFD700' }}>Yellow line = TODAY</span>
            </p>

            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={result.timeline} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

                {/* Shade the PAST period */}
                <ReferenceArea
                  x1={result.currentAge - result.yearsAgo}
                  x2={result.currentAge}
                  fill="rgba(139,92,246,0.07)"
                  stroke="none"
                  label={{
                    value: '◀ PAST',
                    fill: 'rgba(139,92,246,0.5)',
                    fontSize: 9,
                    fontWeight: 900,
                    position: 'insideTopLeft',
                  }}
                />

                <XAxis
                  dataKey="year"
                  tick={{ fill: axisColor, fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) => v === result.currentAge ? 'TODAY' : String(v)}
                  stroke={axisColor}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 9, fontWeight: 700 }}
                  tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`}
                  stroke={axisColor}
                  width={58}
                />
                <Tooltip content={<GhostTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                  formatter={(v) => v === 'ghostSalary' ? '👻 Ghost You (18%/yr)' : '📍 Current Path (10%/yr)'}
                />

                {/* Ghost path — filled area */}
                <Area
                  type="monotone"
                  dataKey="ghostSalary"
                  fill="rgba(139,92,246,0.18)"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={false}
                  name="ghostSalary"
                />

                {/* Current path — dashed line */}
                <Line
                  type="monotone"
                  dataKey="currentSalary"
                  stroke="#0BF46C"
                  strokeWidth={3}
                  strokeDasharray="7 4"
                  dot={false}
                  name="currentSalary"
                />

                {/* TODAY marker */}
                <ReferenceLine
                  x={result.currentAge}
                  stroke="#FFD700"
                  strokeWidth={3}
                  label={{
                    value: '⬇ TODAY',
                    fill: '#FFD700',
                    fontSize: 10,
                    fontWeight: 900,
                    position: 'top',
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* PARALLEL UNIVERSE NARRATIVE ────────────────────────── */}
          <div className="chart-card-animate" style={{ animationDelay: '0.62s' }}>
            <div
              className="brutal-box p-8"
              style={{ borderColor: '#8B5CF6', borderWidth: '4px', boxShadow: '8px 8px 0 rgba(139,92,246,0.28)' }}
            >
              <div className="text-[10px] font-black uppercase font-mono mb-5 flex items-center gap-2 tracking-widest" style={{ color: '#8B5CF6' }}>
                <span className="border-2 px-2 py-0.5" style={{ borderColor: '#8B5CF6' }}>PARALLEL UNIVERSE SCAN</span>
                <span>Ghost You · Age {result.currentAge}</span>
              </div>
              <div
                className="text-brand-light text-sm leading-7 min-h-[80px]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {narrative.displayed}
                {!narrative.done && (
                  <span className="blink font-bold" style={{ color: '#8B5CF6' }}>▌</span>
                )}
              </div>
            </div>
          </div>

          {/* FUTURE SALARY DIVERGENCE TABLE ────────────────────── */}
          {futureRows.length > 0 && (
            <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.78s' }}>
              <h3 className="text-xl font-black uppercase mb-5 border-b-4 border-brand-light pb-3 text-brand-light">
                📅 The Divergence — Next {Math.min(futureRows.length, 5)} Years
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-black uppercase">
                  <thead>
                    <tr className="border-b-2 border-brand-gray/30">
                      <th className="text-left py-2 pr-4 text-brand-gray">Age</th>
                      <th className="text-right py-2 px-4" style={{ color: '#8B5CF6' }}>👻 Ghost Salary</th>
                      <th className="text-right py-2 px-4" style={{ color: '#0BF46C' }}>📍 Your Salary</th>
                      <th className="text-right py-2 pl-4 text-brand-danger">Annual Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureRows.slice(0, 5).map((row) => (
                      <tr
                        key={row.year}
                        className="border-b border-brand-gray/10 hover:bg-brand-gray/5 transition-colors"
                      >
                        <td className="py-3 pr-4 text-brand-light">{row.year}</td>
                        <td className="py-3 px-4 text-right tabular-nums" style={{ color: '#8B5CF6' }}>
                          {fmt(row.ghostSalary)}/yr
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums" style={{ color: '#0BF46C' }}>
                          {fmt(row.currentSalary)}/yr
                        </td>
                        <td className="py-3 pl-4 text-right text-brand-danger tabular-nums">
                          +{fmt(row.salaryGap)}/yr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-brand-gray/20 text-[10px] font-black uppercase text-brand-gray">
                Ghost: 18%/yr growth · Current: 10%/yr growth · Gap compounds every year of inaction
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default TimeMachine;
