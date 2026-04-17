import React, { useState, useEffect } from 'react';
import SidebarForm from './components/SidebarForm';
import SimulationResults from './components/SimulationResults';
import PivotEngine from './components/PivotEngine';
import RegretCalculator from './components/RegretCalculator';
import TimeMachine from './components/TimeMachine';
import SkillGap from './components/SkillGap';
import BurnoutIndex from './components/BurnoutIndex';
import FireCalculator from './components/FireCalculator';
import CareerHealth from './components/CareerHealth';

/* ── SIMULATION SKELETON ──────────────────────────────────────────
   Shows for a minimum of 2.5 s for drama/anticipation.
   An animated year-counter ticks 1→10 to sell the illusion.
────────────────────────────────────────────────────────────────── */
const SimulationSkeleton = () => {
  const [year, setYear] = useState(1);
  const [dot, setDot] = useState('');

  useEffect(() => {
    const yearInterval = setInterval(() => {
      setYear(y => (y >= 10 ? 1 : y + 1));
    }, 220);
    const dotInterval = setInterval(() => {
      setDot(d => (d.length >= 3 ? '' : d + '.'));
    }, 420);
    return () => {
      clearInterval(yearInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const SkeletonCard = ({ delay = '0s', tall = false }) => (
    <div
      className="chart-card-animate brutal-box p-4"
      style={{ animationDelay: delay }}
    >
      <div className="skeleton-shimmer h-7 w-44 mb-4" style={{ border: '2px solid transparent' }} />
      <div className={`skeleton-shimmer w-full ${tall ? 'h-80' : 'h-72'}`} style={{ border: '2px solid transparent' }} />
    </div>
  );

  return (
    <div className="space-y-8 font-mono p-6 md:p-10 fade-in">
      {/* Header skeleton */}
      <div className="flex justify-between items-center border-b-8 border-brand-light pb-4 gap-4">
        <div className="skeleton-shimmer h-14 w-72" />
        <div className="skeleton-shimmer h-12 w-40" />
      </div>

      {/* AI Directive skeleton */}
      <div className="skeleton-shimmer h-28 w-full" />

      {/* Year counter hero */}
      <div className="brutal-box p-8 text-center bg-brand-black border-brand-accent relative overflow-hidden">
        <div className="text-xs font-black uppercase text-brand-gray mb-3 tracking-widest">
          COMPUTING 10-YEAR FINANCIAL TRAJECTORY
        </div>
        <div className="text-7xl font-black text-brand-accent tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
          YEAR {String(year).padStart(2, '0')}
        </div>
        <div className="text-xl font-black text-brand-light mt-2 blink">
          SIMULATING{dot}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-black uppercase text-brand-gray">
          <div>▸ TAX ENGINE</div>
          <div>▸ LAYOFF MODEL</div>
          <div>▸ SKILL DECAY</div>
          <div>▸ PPP CALC</div>
          <div>▸ BURNOUT SCORE</div>
          <div>▸ WEALTH MODEL</div>
        </div>
      </div>

      {/* 4 chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonCard delay="0.05s" />
        <SkeletonCard delay="0.15s" />
        <SkeletonCard delay="0.25s" />
        <SkeletonCard delay="0.35s" />
      </div>
    </div>
  );
};

/* ── APP ────────────────────────────────────────────────────────── */
function App() {
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('simulate');
  const [darkMode, setDarkMode] = useState(false);

  const handleSimulate = async (data) => {
    setLoading(true);
    setSimulationData(null);
    setError('');

    // Minimum 2.5s skeleton for anticipation theater
    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const [result] = await Promise.all([
        fetch('http://localhost:5000/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(r => {
          if (!r.ok) throw new Error('Simulation failed. Target server error or Missing API Key.');
          return r.json();
        }),
        minDelay,
      ]);
      setSimulationData(result);
    } catch (err) {
      await minDelay;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CHART_AXIS  = darkMode ? '#fffff0' : '#1A1A1A';
  const CHART_GRID  = darkMode ? '#a09080' : '#725752';

  return (
    <div
      data-theme={darkMode ? 'dark' : 'light'}
      className="min-h-screen flex flex-col font-mono bg-brand-black text-brand-light"
    >
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="bg-brand-black p-4 border-b-8 border-brand-light flex items-center justify-between z-10 relative slide-in-left">
        <div className="flex items-center gap-4">
          <label className="brutal-box p-1 hidden md:block border-brand-light">
            <img
              src="/logo.jpeg"
              alt="Logo"
              className="h-10 w-auto inline-block border-2 border-brand-light"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </label>
          <h1 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap text-brand-light">
            S. T. A. K.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark / Light toggle */}
          <button
            className="theme-toggle-btn font-mono text-sm"
            onClick={() => setDarkMode(d => !d)}
            title="Toggle dark/light mode"
          >
            {darkMode ? '☀ LIGHT' : '☾ DARK'}
          </button>

          {/* Tab Navigation — scrollable on mobile */}
          <div className="flex gap-0 border-4 border-brand-light overflow-x-auto max-w-full" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTab('simulate')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all whitespace-nowrap shrink-0 ${activeTab === 'simulate'
                ? 'bg-brand-accent text-brand-light'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
            >
              ▶ Simulate
            </button>
            <button
              onClick={() => setActiveTab('pivot')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'pivot'
                ? 'bg-brand-danger text-white'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
            >
              ⚡ AI Pivot
            </button>
            <button
              onClick={() => setActiveTab('regret')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'regret'
                ? 'bg-brand-danger text-white'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
            >
              💀 Regret
            </button>
            <button
              onClick={() => setActiveTab('timemachine')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'timemachine'
                ? 'bg-brand-accent text-brand-light'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
            >
              ⏰ Time Machine
            </button>
            <button
              onClick={() => setActiveTab('skillgap')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'skillgap'
                ? 'bg-brand-accent text-brand-light'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
            >
              🎯 Skills
            </button>
            <button
              onClick={() => setActiveTab('burnout')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'burnout'
                ? 'bg-brand-danger text-white'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
            >
              🔥 Burnout
            </button>
            <button
              onClick={() => setActiveTab('fire')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'fire'
                ? 'text-black'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
              style={activeTab === 'fire' ? { backgroundColor: '#FFD700' } : {}}
            >
              💰 FIRE
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-4 py-2 font-black uppercase text-sm transition-all border-l-4 border-brand-light whitespace-nowrap shrink-0 ${activeTab === 'health'
                ? 'text-white'
                : 'bg-brand-black text-brand-light hover:bg-brand-gray/20'}`}
              style={activeTab === 'health' ? { backgroundColor: '#3B82F6' } : {}}
            >
              🩺 Health
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {activeTab === 'simulate' ? (
          <>
            <aside className="w-full md:w-[420px] bg-brand-black p-6 overflow-y-auto border-r-8 border-brand-light z-0 styled-scroll">
              <SidebarForm onSimulate={handleSimulate} loading={loading} />
              {error && (
                <div className="mt-6 brutal-box p-4 bg-brand-danger text-white font-black text-center uppercase border-brand-light fade-in">
                  {error}
                </div>
              )}
            </aside>

            <section className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
              {loading ? (
                <SimulationSkeleton />
              ) : simulationData ? (
                <SimulationResults
                  data={simulationData}
                  darkMode={darkMode}
                  chartAxisColor={CHART_AXIS}
                  chartGridColor={CHART_GRID}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center fade-in">
                  <div className="brutal-box p-10 max-w-lg text-center transform -rotate-1 bg-brand-black border-brand-light">
                    <h2 className="text-4xl font-black uppercase mb-4 text-brand-accent">Awaiting Input</h2>
                    <p className="text-lg font-black border-t-4 border-brand-light pt-4 text-brand-light">
                      ENTER PARAMETERS ON THE<br /> LEFT SIDEBAR.<br />
                      <span className="text-brand-accent opacity-80 animate-pulse">SMASH THE RUN BUTTON.</span>
                    </p>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'pivot' ? (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <PivotEngine darkMode={darkMode} />
          </div>
        ) : activeTab === 'regret' ? (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <RegretCalculator />
          </div>
        ) : activeTab === 'timemachine' ? (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <TimeMachine />
          </div>
        ) : activeTab === 'skillgap' ? (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <SkillGap />
          </div>
        ) : activeTab === 'burnout' ? (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <BurnoutIndex />
          </div>
        ) : activeTab === 'fire' ? (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <FireCalculator />
          </div>
        ) : (
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-brand-black">
            <CareerHealth />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
