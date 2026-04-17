import React, { useState, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Activity, RefreshCw, AlertCircle } from 'lucide-react';

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

/* ── GRADE CONFIG ───────────────────────────────────────────────── */
const GRADES = {
  A: { color: '#0BF46C', label: 'Excellent', emoji: '🏆', glow: 'rgba(11,244,108,0.4)' },
  B: { color: '#3B82F6', label: 'Good',      emoji: '👍', glow: 'rgba(59,130,246,0.4)' },
  C: { color: '#FFD700', label: 'Average',   emoji: '😐', glow: 'rgba(255,215,0,0.4)'  },
  D: { color: '#FF6B00', label: 'Weak',      emoji: '⚠️', glow: 'rgba(255,107,0,0.4)'  },
  F: { color: '#FF0000', label: 'Critical',  emoji: '🚨', glow: 'rgba(255,0,0,0.4)'    },
};

const DIM_META = {
  financial: { icon: '💰', label: 'Financial Health'    },
  growth:    { icon: '📈', label: 'Growth Trajectory'   },
  security:  { icon: '🛡', label: 'Job Security'        },
  purpose:   { icon: '🎯', label: 'Purpose Alignment'   },
  market:    { icon: '🌐', label: 'Market Position'     },
};

/* ── QUIZ QUESTIONS ─────────────────────────────────────────────── */
const QUESTIONS = [
  // Financial Health
  { key: 'q1',  dim: 'financial', text: 'Your salary vs market rate for your role?',          lo: 'Way Below', hi: 'Way Above' },
  { key: 'q2',  dim: 'financial', text: 'How often do you get meaningful pay increases?',     lo: 'Never',     hi: 'Regularly' },
  // Growth
  { key: 'q3',  dim: 'growth',    text: 'Marketable new skills gained in the past 12 months?', lo: 'Zero',    hi: '5+' },
  { key: 'q4',  dim: 'growth',    text: 'Clarity of your path to the next level?',            lo: 'No Path',   hi: 'Crystal Clear' },
  // Security
  { key: 'q5',  dim: 'security',  text: 'Current strength of your industry?',                lo: 'Declining', hi: 'Booming' },
  { key: 'q6',  dim: 'security',  text: 'Stability of your specific company / team?',        lo: 'Fragile',   hi: 'Rock Solid' },
  // Purpose
  { key: 'q7',  dim: 'purpose',   text: 'Your work aligns with your personal values?',        lo: 'Not at All', hi: 'Completely' },
  { key: 'q8',  dim: 'purpose',   text: 'Meaningfulness of your day-to-day impact?',         lo: 'Pointless', hi: 'Deeply Meaningful' },
  // Market
  { key: 'q9',  dim: 'market',    text: 'Demand for your skills outside your company?',       lo: 'Unemployable', hi: 'Always Headhunted' },
  { key: 'q10', dim: 'market',    text: 'Your professional reputation / personal brand?',     lo: 'Unknown',   hi: 'Industry Leader' },
];

/* ── RATING BUTTONS ─────────────────────────────────────────────── */
const RatingButtons = ({ value, onChange }) => {
  const labels = ['', 'Very Low', 'Low', 'Average', 'High', 'Very High'];
  return (
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          title={labels[n]}
          className="w-9 h-9 font-black text-sm transition-all"
          style={{
            border: `2px solid ${value === n ? 'var(--color-brand-accent)' : 'var(--color-brand-light)'}`,
            backgroundColor: value === n ? 'var(--color-brand-accent)' : 'transparent',
            color: value === n ? '#000' : 'var(--color-brand-light)',
            transform: value === n ? 'scale(1.15)' : 'scale(1)',
          }}>
          {n}
        </button>
      ))}
    </div>
  );
};

/* ── QUESTION ROW ───────────────────────────────────────────────── */
const QuestionRow = ({ q, value, onChange }) => (
  <div className="space-y-2">
    <p className="text-sm font-black text-brand-light leading-snug">{q.text}</p>
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-black uppercase text-brand-gray w-20 text-right shrink-0">{q.lo}</span>
      <RatingButtons value={value} onChange={onChange} />
      <span className="text-[9px] font-black uppercase text-brand-gray shrink-0">{q.hi}</span>
    </div>
  </div>
);

/* ── SKELETON ───────────────────────────────────────────────────── */
const HealthSkeleton = () => {
  const [tick, setTick] = useState(0);
  const steps = ['Analysing your quiz responses…', 'Scoring each dimension…', 'Comparing to career benchmarks…', 'Generating your health grade…', 'Writing your diagnostic report…'];
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % steps.length), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-8 fade-in">
      <div className="brutal-box p-10 text-center">
        <div className="text-6xl mb-4">🩺</div>
        <div className="text-3xl font-black uppercase blink mb-3" style={{ color: '#3B82F6' }}>Diagnosing Your Career</div>
        <p className="text-sm font-black uppercase text-brand-gray">{steps[tick]}</p>
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-2 w-2 transition-all duration-300" style={{
              backgroundColor: i <= tick ? '#3B82F6' : 'var(--color-brand-gray)',
              transform: i === tick ? 'scale(1.6)' : 'scale(1)',
            }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal-box p-6 flex items-center justify-center">
          <div className="skeleton-shimmer rounded-full" style={{ width: 160, height: 160 }} />
        </div>
        <div className="space-y-4 brutal-box p-6">
          {[0,1,2,3,4].map(i => (
            <div key={i}>
              <div className="skeleton-shimmer h-2 w-28 mb-2" />
              <div className="skeleton-shimmer h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── RADAR TOOLTIP ──────────────────────────────────────────────── */
const RadarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="brutal-box p-3 text-xs font-black uppercase"
      style={{ backgroundColor: 'var(--color-brand-black)', borderColor: 'var(--color-brand-light)' }}>
      <div style={{ color: 'var(--color-brand-accent)' }} className="mb-1">{label}</div>
      {payload.map((p) => <div key={p.dataKey} style={{ color: p.stroke }}>{p.name}: {p.value}/100</div>)}
    </div>
  );
};

/* ── MAIN ───────────────────────────────────────────────────────── */
const CareerHealth = () => {
  const initialAnswers = QUESTIONS.reduce((acc, q) => ({ ...acc, [q.key]: 3 }), {});
  const [role,    setRole]    = useState('');
  const [answers, setAnswers] = useState(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [active,  setActive]  = useState(false);

  const report = useTypewriter(result?.report, 14, active);

  // Group questions by dimension
  const dimGroups = Object.keys(DIM_META).map((dim) => ({
    dim,
    ...DIM_META[dim],
    questions: QUESTIONS.filter((q) => q.dim === dim),
  }));

  // Compute live preview score as user answers
  const previewScore = Math.round(
    QUESTIONS.reduce((sum, q) => sum + answers[q.key], 0) / QUESTIONS.length * 20
  );

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!role.trim()) { setError('Please enter your role.'); return; }
    setLoading(true); setActive(false); setError('');
    const minDelay = new Promise((r) => setTimeout(r, 2200));
    try {
      const [data] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/career-health`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ role, answers }),
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
  const g = result ? (GRADES[result.grade] || GRADES.C) : null;

  const radarData = result ? Object.entries(result.dims).map(([k, v]) => ({
    dim: DIM_META[k]?.label.split(' ')[0],
    score: v,
  })) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono pb-20">

      {/* HEADER */}
      <div className="border-b-8 border-brand-light pb-5 slide-in-left">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter flex items-center gap-3">
          <Activity size={44} strokeWidth={2.5} style={{ color: '#3B82F6' }} />
          Career Health Check
        </h2>
        <p className="text-brand-gray font-black uppercase mt-2 text-xs tracking-widest">
          10-question diagnostic · 5 life dimensions · Brutally honest grade + AI report
        </p>
      </div>

      {/* FORM */}
      {!result && !loading && (
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Role input + live score preview */}
          <div className="chart-card-animate brutal-box p-6 flex flex-col md:flex-row gap-6 items-end"
            style={{ animationDelay: '0s' }}>
            <div className="flex-1">
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">💼 Your Current Role</label>
              <input type="text" placeholder="e.g. Mid-level Backend Developer at a Series B startup"
                value={role} onChange={(e) => setRole(e.target.value)}
                className="brutal-input" required />
            </div>
            <div className="shrink-0 text-center">
              <div className="text-[9px] font-black uppercase text-brand-gray mb-1">Live Preview Score</div>
              <div className="text-4xl font-black tabular-nums" style={{
                color: previewScore >= 80 ? '#0BF46C' : previewScore >= 60 ? '#3B82F6' : previewScore >= 40 ? '#FFD700' : '#FF0000',
              }}>
                {previewScore}/100
              </div>
            </div>
          </div>

          {/* QUIZ — grouped by dimension */}
          {dimGroups.map((group, gi) => (
            <div key={group.dim}
              className="chart-card-animate brutal-box p-7 space-y-6"
              style={{ animationDelay: `${0.05 * gi}s`, borderLeftWidth: '5px',
                borderLeftColor: Object.values(GRADES)[gi % 5].color }}>
              <h3 className="text-base font-black uppercase border-b-2 border-brand-gray/30 pb-3 text-brand-light">
                {group.icon} {group.label}
              </h3>
              {group.questions.map((q) => (
                <QuestionRow key={q.key} q={q}
                  value={answers[q.key]}
                  onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} />
              ))}
            </div>
          ))}

          {error && (
            <div className="brutal-box p-4 text-white font-black text-center uppercase fade-in"
              style={{ backgroundColor: 'var(--color-brand-danger)' }}>
              <AlertCircle className="inline mr-2" size={18} /> {error}
            </div>
          )}

          <button type="submit" className="brutal-btn w-full py-5 text-xl flex items-center justify-center gap-3">
            <Activity size={22} /> GET MY CAREER HEALTH GRADE
          </button>
        </form>
      )}

      {/* SKELETON */}
      {loading && <HealthSkeleton />}

      {/* RESULTS */}
      {result && !loading && g && (
        <div className="space-y-8">
          <div className="flex items-center justify-between slide-in-left">
            <div className="text-xs font-black uppercase text-brand-gray">🩺 Health Report — {result.role}</div>
            <button onClick={handleReset}
              className="flex items-center gap-2 text-xs font-black uppercase text-brand-gray hover:text-brand-light transition-colors">
              <RefreshCw size={14} /> Retake Quiz
            </button>
          </div>

          {/* GRADE + RADAR SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Grade card */}
            <div className="chart-card-animate brutal-box p-8 flex flex-col items-center justify-center text-center"
              style={{ animationDelay: '0s', borderColor: g.color, boxShadow: `8px 8px 0 ${g.glow}` }}>
              <div className="text-7xl mb-3">{g.emoji}</div>
              <div className="text-[150px] font-black leading-none" style={{ color: g.color, textShadow: `0 0 60px ${g.glow}` }}>
                {result.grade}
              </div>
              <div className="text-xl font-black uppercase" style={{ color: g.color }}>{g.label}</div>
              <div className="text-3xl font-black tabular-nums mt-2 text-brand-light">{result.overall}/100</div>
            </div>

            {/* Radar */}
            <div className="chart-card-animate brutal-box p-5" style={{ animationDelay: '0.1s' }}>
              <div className="text-xs font-black uppercase text-brand-gray mb-3 tracking-widest">5-Dimension Career Radar</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: 'var(--color-brand-gray)', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-brand-gray)', fontSize: 8 }} tickCount={3} />
                  <Radar name="Your Score" dataKey="score"
                    stroke={g.color} fill={g.color + '30'} strokeWidth={2.5} />
                  <Tooltip content={<RadarTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5 DIMENSION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Object.entries(result.dims).map(([key, val], i) => {
              const meta = DIM_META[key];
              const grd  = val >= 80 ? 'A' : val >= 65 ? 'B' : val >= 50 ? 'C' : val >= 35 ? 'D' : 'F';
              const gc   = GRADES[grd];
              const isWeakest   = key === result.weakest;
              const isStrongest = key === result.strongest;
              return (
                <div key={key}
                  className="chart-card-animate brutal-box p-4 text-center"
                  style={{ animationDelay: `${0.2 + i * 0.06}s`, borderColor: gc.color,
                    backgroundColor: isWeakest ? `${gc.color}10` : 'transparent' }}>
                  <div className="text-2xl mb-1">{meta.icon}</div>
                  <div className="text-[9px] font-black uppercase text-brand-gray mb-2 leading-tight">{meta.label}</div>
                  <div className="text-2xl font-black tabular-nums mb-0.5" style={{ color: gc.color }}>{val}</div>
                  <div className="text-[9px] font-black uppercase" style={{ color: gc.color }}>{grd} • {gc.label}</div>
                  {isWeakest   && <div className="text-[8px] font-black uppercase text-brand-danger mt-1">⬇ Weakest</div>}
                  {isStrongest && <div className="text-[8px] font-black uppercase text-green-400 mt-1">⬆ Strongest</div>}
                </div>
              );
            })}
          </div>

          {/* AI HEALTH REPORT */}
          <div className="chart-card-animate" style={{ animationDelay: '0.55s' }}>
            <div className="brutal-box p-8"
              style={{ borderColor: g.color, borderWidth: '4px', boxShadow: `8px 8px 0 ${g.glow}` }}>
              <div className="text-[10px] font-black uppercase mb-5 flex items-center gap-2 tracking-widest"
                style={{ color: g.color }}>
                <span className="border-2 px-2 py-0.5" style={{ borderColor: g.color }}>🩺 AI DIAGNOSTIC REPORT</span>
                <span>Grade {result.grade} · {result.overall}/100</span>
              </div>
              <div className="text-brand-light text-sm leading-7 min-h-[70px]"
                style={{ fontFamily: 'Georgia, serif' }}>
                {report.displayed}
                {!report.done && <span className="blink font-bold" style={{ color: g.color }}>▌</span>}
              </div>
            </div>
          </div>

          {/* QUICK ACTION PLAN */}
          <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-xl font-black uppercase text-brand-light border-b-4 border-brand-light pb-3 mb-5">
              🔧 30-Day Prescription
            </h3>
            <div className="space-y-3">
              {[
                result.dims.financial < 60 && '💰 Research glassdoor/LinkedIn salaries for your role this week. If you\'re below P50 — schedule a pay review within 30 days.',
                result.dims.growth < 60    && '📚 Commit to one structured skill course by Friday. Block 1 hr/day. Finish it.',
                result.dims.security < 60  && '🌐 Update your LinkedIn and apply to 2 roles you actually want — even if you\'re not ready to move. Test the market.',
                result.dims.purpose < 60   && '📝 Write 200 words on what \'meaningful work\' looks like to you. If your current job isn\'t in that picture, that\'s your answer.',
                result.dims.market < 60    && '🤝 Have a public output this month: a post, a talk, an article, an open-source commit. Start building the reputation.',
                result.overall >= 70       && '🏆 You\'re in a strong position — this is the time to negotiate harder and invest in your next jump, not coast.',
              ].filter(Boolean).map((item, i) => (
                <div key={i} className="flex gap-3 items-start text-sm font-black text-brand-light">
                  <span style={{ color: g.color }} className="shrink-0 mt-0.5">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerHealth;
