import React, { useState, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Target, Zap, RefreshCw, AlertCircle, Clock, TrendingUp } from 'lucide-react';

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

const useTypewriter = (text = '', speed = 12, active = false) => {
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
  : `₹${n.toLocaleString('en-IN')}`;

const PRIORITY = {
  1: { color: '#FF0000', label: '🔴 CRITICAL' },
  2: { color: '#FF6B00', label: '🟠 HIGH' },
  3: { color: '#FFD700', label: '🟡 MEDIUM' },
  4: { color: '#3B82F6', label: '🔵 GOOD TO HAVE' },
  5: { color: '#14B8A6', label: '🟢 BONUS' },
};

/* ── SKELETON ───────────────────────────────────────────────────── */
const SkillSkeleton = () => {
  const [tick, setTick] = useState(0);
  const steps = [
    'Mapping your current skill matrix…',
    'Comparing against target role requirements…',
    'Calculating salary premium per skill…',
    'Building your 90-day battle plan…',
    'Generating personalised roadmap…',
  ];
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % steps.length), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-8 fade-in">
      <div className="brutal-box p-10 text-center">
        <div className="text-6xl mb-5">🎯</div>
        <div className="text-3xl font-black uppercase blink mb-3" style={{ color: 'var(--color-brand-accent)' }}>
          Assassinating Your Gaps
        </div>
        <div className="text-sm font-black uppercase text-brand-gray h-5">{steps[tick]}</div>
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-2 w-2 transition-all duration-300" style={{
              backgroundColor: i <= tick ? 'var(--color-brand-accent)' : 'var(--color-brand-gray)',
              transform: i === tick ? 'scale(1.6)' : 'scale(1)',
            }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 0.1, 0.2].map((d, i) => (
          <div key={i} className="chart-card-animate brutal-box p-5" style={{ animationDelay: `${d}s` }}>
            <div className="skeleton-shimmer h-3 w-20 mb-3" />
            <div className="skeleton-shimmer h-8 w-32 mb-2" />
            <div className="skeleton-shimmer h-2 w-24" />
          </div>
        ))}
      </div>
      <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.3s' }}>
        <div className="skeleton-shimmer h-3 w-48 mb-6" />
        <div className="skeleton-shimmer h-56 w-full" />
      </div>
      {[0.5, 0.65, 0.8].map((d, i) => (
        <div key={i} className="chart-card-animate brutal-box p-5" style={{ animationDelay: `${d}s` }}>
          <div className="skeleton-shimmer h-3 w-36 mb-4" />
          <div className="skeleton-shimmer h-2 w-full mb-2" />
          <div className="skeleton-shimmer h-2 w-4/5" />
        </div>
      ))}
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
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke }}>{p.name}: {p.value}/100</div>
      ))}
    </div>
  );
};

/* ── SKILL CARD ─────────────────────────────────────────────────── */
const SkillCard = ({ skill, idx }) => {
  const p = PRIORITY[skill.priority] || PRIORITY[3];
  return (
    <div
      className="chart-card-animate brutal-box p-5"
      style={{ animationDelay: `${0.5 + idx * 0.08}s`, borderLeftColor: p.color, borderLeftWidth: '6px' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black px-2 py-0.5 uppercase" style={{ backgroundColor: p.color + '22', color: p.color, border: `1px solid ${p.color}` }}>
              {p.label}
            </span>
          </div>
          <div className="text-base font-black text-brand-light mb-3">{skill.name}</div>

          {/* Gap bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-black uppercase text-brand-gray mb-1">
              <span>You: {skill.current}/100</span>
              <span>Target: {skill.target}/100</span>
            </div>
            <div className="h-3 rounded-none border border-brand-gray/30 relative overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${skill.current}%`, backgroundColor: p.color + '80' }} />
              <div className="absolute top-0 h-full border-r-2 border-dashed border-white/40" style={{ left: `${skill.target}%` }} />
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-black uppercase text-brand-gray mb-1">Salary Unlock</div>
          <div className="text-xl font-black" style={{ color: '#0BF46C' }}>+{fmt(skill.salaryPremium)}/yr</div>
          <div className="text-[10px] font-black uppercase text-brand-gray mt-1">{skill.weeksToLearn}w to learn</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase text-brand-gray">
        <span>📚 FREE RESOURCE:</span>
        <span style={{ color: 'var(--color-brand-accent)' }}>{skill.resource}</span>
      </div>
    </div>
  );
};

/* ── MAIN ───────────────────────────────────────────────────────── */
const SkillGap = () => {
  const [form, setForm] = useState({
    currentRole: '',
    targetRole: '',
    currentSkills: '',
    yearsOfExperience: 3,
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [active,  setActive]  = useState(false);

  const unlockAnim = useCountUp(result?.totalSalaryUnlock, 2000, active);
  const battlePlan = useTypewriter(result?.battlePlan?.replace(/\\n/g, '\n'), 10, active);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setActive(false);
    setError('');
    const minDelay = new Promise((r) => setTimeout(r, 2400));
    try {
      const [data] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/skill-gap`, {
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

  const radarData = result?.skills?.map((s) => ({
    skill: s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name,
    current: s.current,
    target:  s.target,
  })) || [];

  const axisColor = 'var(--color-brand-gray)';

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono pb-20">

      {/* HEADER */}
      <div className="border-b-8 border-brand-light pb-5 slide-in-left">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter flex items-center gap-3">
          <Target size={44} strokeWidth={2.5} style={{ color: 'var(--color-brand-accent)' }} />
          Skill Gap Assassin
        </h2>
        <p className="text-brand-gray font-black uppercase mt-2 text-xs tracking-widest">
          Pinpoint exactly what stands between you and your dream role · salary premium per skill · 90-day battle plan
        </p>
      </div>

      {/* FORM */}
      {!result && !loading && (
        <form onSubmit={handleSubmit} className="chart-card-animate brutal-box p-8 space-y-6" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">📍 Your Current Role</label>
              <input type="text" placeholder="e.g. Data Analyst at Infosys"
                value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)}
                className="brutal-input" required />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">🎯 Target Role You Want</label>
              <input type="text" placeholder="e.g. Machine Learning Engineer"
                value={form.targetRole} onChange={(e) => set('targetRole', e.target.value)}
                className="brutal-input" required />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">🧠 Skills You Already Have (comma separated)</label>
              <input type="text" placeholder="Python, SQL, Excel, Statistics…"
                value={form.currentSkills} onChange={(e) => set('currentSkills', e.target.value)}
                className="brutal-input" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-brand-gray">⏱ Years of Experience</label>
              <input type="number" min={0} max={30} value={form.yearsOfExperience}
                onChange={(e) => set('yearsOfExperience', Number(e.target.value))}
                className="brutal-input" required />
            </div>
          </div>
          <button type="submit" className="brutal-btn w-full py-5 text-xl flex items-center justify-center gap-3">
            <Target size={22} /> IDENTIFY MY GAPS
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
      {loading && <SkillSkeleton />}

      {/* RESULTS */}
      {result && !loading && (
        <div className="space-y-8">

          {/* Controls */}
          <div className="flex items-center justify-between slide-in-left">
            <div className="text-xs font-black uppercase text-brand-gray">
              🎯 {form.currentRole} → {form.targetRole}
            </div>
            <button onClick={handleReset}
              className="flex items-center gap-2 text-xs font-black uppercase text-brand-gray hover:text-brand-light transition-colors">
              <RefreshCw size={14} /> New Analysis
            </button>
          </div>

          {/* 3 SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0s', borderColor: '#0BF46C', boxShadow: '6px 6px 0 rgba(11,244,108,0.3)' }}>
              <div className="text-[10px] font-black uppercase mb-2 tracking-widest" style={{ color: '#0BF46C' }}>
                💰 Total Salary Unlock
              </div>
              <div className="text-4xl font-black tabular-nums leading-none" style={{ color: '#0BF46C' }}>
                +{fmt(unlockAnim)}/yr
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">if you close all gaps</div>
            </div>

            <div className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0.1s', borderColor: '#FFD700', boxShadow: '6px 6px 0 rgba(255,215,0,0.3)' }}>
              <div className="text-[10px] font-black uppercase mb-2 tracking-widest text-yellow-400">
                ⏳ Estimated Switch Time
              </div>
              <div className="text-4xl font-black tabular-nums leading-none text-yellow-400">
                {result.timeToSwitch}
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">months to transition</div>
            </div>

            <div className="chart-card-animate brutal-box p-6 text-center"
              style={{ animationDelay: '0.2s', borderColor: 'var(--color-brand-danger)', boxShadow: '6px 6px 0 rgba(255,0,0,0.3)' }}>
              <div className="text-[10px] font-black uppercase text-brand-danger mb-2 tracking-widest">
                🔥 Critical Gaps
              </div>
              <div className="text-4xl font-black text-brand-danger">
                {result.skills?.filter((s) => s.priority <= 2).length || 0}
              </div>
              <div className="text-[10px] text-brand-gray font-black mt-2 uppercase">need immediate action</div>
            </div>
          </div>

          {/* RADAR CHART — Skills DNA */}
          <div className="chart-card-animate brutal-box p-6" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xl font-black uppercase mb-1 text-brand-light">🧬 Your Skills DNA vs Target Profile</h3>
            <p className="text-[10px] font-black uppercase text-brand-gray mb-6 tracking-widest">
              Purple = you today · Green = target role requirement
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: axisColor, fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: axisColor, fontSize: 9 }} tickCount={4} />
                <Radar name="You Today" dataKey="current" stroke="#8B5CF6" fill="rgba(139,92,246,0.25)" strokeWidth={2} />
                <Radar name="Target Role" dataKey="target"  stroke="#0BF46C" fill="rgba(11,244,108,0.10)"  strokeWidth={2} strokeDasharray="5 3" />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                <Tooltip content={<RadarTip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* SKILL CARDS */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-brand-light border-b-4 border-brand-light pb-3 flex items-center gap-2">
              <Zap size={20} /> Kill Shot Skills — Priority Order
            </h3>
            {result.skills?.map((skill, i) => (
              <SkillCard key={i} skill={skill} idx={i} />
            ))}
          </div>

          {/* BATTLE PLAN */}
          <div className="chart-card-animate" style={{ animationDelay: '0.9s' }}>
            <div className="brutal-box p-8"
              style={{ borderColor: 'var(--color-brand-accent)', borderWidth: '4px', boxShadow: '8px 8px 0 rgba(var(--color-brand-accent-rgb, 0,255,136),0.2)' }}>
              <div className="text-[10px] font-black uppercase mb-5 flex items-center gap-2 tracking-widest"
                style={{ color: 'var(--color-brand-accent)' }}>
                <TrendingUp size={14} />
                <span className="border-2 px-2 py-0.5" style={{ borderColor: 'var(--color-brand-accent)' }}>90-DAY BATTLE PLAN</span>
              </div>
              <div className="text-brand-light text-sm leading-7 whitespace-pre-line min-h-[80px]"
                style={{ fontFamily: 'Georgia, serif' }}>
                {battlePlan.displayed}
                {!battlePlan.done && (
                  <span className="blink font-bold" style={{ color: 'var(--color-brand-accent)' }}>▌</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
