import React, { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';

const PivotEngine = () => {
  const [currentCareer, setCurrentCareer] = useState('');
  const [targetCareer, setTargetCareer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePivot = async (e) => {
    e.preventDefault();
    if (!currentCareer || !targetCareer) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('http://localhost:5000/api/pivot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCareer, targetCareer })
      });
      if (!response.ok) throw new Error('Pivot analysis failed.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-mono">
      <div className="border-b-8 border-brand-light pb-4">
        <h2 className="text-5xl font-black uppercase text-brand-light tracking-tighter">⚡ AI Pivot Engine</h2>
        <p className="text-brand-gray font-black uppercase mt-2">
          Find the fastest path from your current career to a high-growth, future-proof one.
        </p>
      </div>

      <form onSubmit={handlePivot} className="brutal-box p-8 bg-brand-black grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
        <div>
          <label className="block text-sm font-black uppercase mb-2 text-brand-gray">📍 Current Career</label>
          <input
            type="text"
            placeholder="e.g. Financial Analyst"
            value={currentCareer}
            onChange={e => setCurrentCareer(e.target.value)}
            className="brutal-input text-lg"
            required
          />
        </div>
        <div className="flex items-center justify-center py-3">
          <ArrowRight size={40} strokeWidth={3} className="text-brand-accent" />
        </div>
        <div>
          <label className="block text-sm font-black uppercase mb-2 text-brand-gray">🎯 Target Career</label>
          <input
            type="text"
            placeholder="e.g. AI Product Manager"
            value={targetCareer}
            onChange={e => setTargetCareer(e.target.value)}
            className="brutal-input text-lg"
            required
          />
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="brutal-btn w-full py-4 text-xl flex items-center justify-center gap-3"
          >
            {loading ? 'AI IS CALCULATING YOUR FUTURE...' : <><Zap size={24} fill="#1A1A1A" /> GENERATE PIVOT PLAN</>}
          </button>
        </div>
      </form>

      {error && (
        <div className="brutal-box p-4 bg-brand-danger text-white font-black text-center uppercase">{error}</div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Compatibility Score */}
          <div className="brutal-box p-6 bg-brand-accent flex items-center gap-6">
            <div className="text-6xl font-black text-brand-light shrink-0">{result.compatibilityScore}<span className="text-2xl">%</span></div>
            <div>
              <div className="text-sm font-black uppercase text-brand-light/70">Career Compatibility</div>
              <div className="text-xl font-black uppercase text-brand-light">{result.currentCareer} → {result.targetCareer}</div>
              <div className="text-sm text-brand-light mt-1">{result.compatibilitySummary}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Transferable Skills */}
            <div className="brutal-box p-5 bg-brand-black">
              <h3 className="text-lg font-black uppercase border-b-4 border-brand-accent mb-4 text-brand-light">✅ Transferable Skills</h3>
              <ul className="space-y-2">
                {(result.transferableSkills || []).map((s, i) => (
                  <li key={i} className="text-sm font-black text-brand-accent bg-brand-accent/10 px-3 py-1 border-l-4 border-brand-accent">{s}</li>
                ))}
              </ul>
            </div>

            {/* Bridge Skills */}
            <div className="brutal-box p-5 bg-brand-black">
              <h3 className="text-lg font-black uppercase border-b-4 border-yellow-500 mb-4 text-brand-light">⚡ Bridge Skills to Learn</h3>
              <ul className="space-y-2">
                {(result.bridgeSkills || []).map((s, i) => (
                  <li key={i} className="text-sm font-black text-yellow-700 bg-yellow-100 px-3 py-1 border-l-4 border-yellow-500">{s}</li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="brutal-box p-5 bg-brand-black">
              <h3 className="text-lg font-black uppercase border-b-4 border-brand-danger mb-4 text-brand-light">📅 Pivot Roadmap</h3>
              <ul className="space-y-3">
                {(result.roadmap || []).map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-6 h-6 bg-brand-danger text-white font-black text-xs flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs font-black text-brand-light">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Insight */}
          {result.aiInsight && (
            <div className="brutal-box p-5 bg-brand-black border-brand-accent">
              <h3 className="text-lg font-black uppercase text-brand-accent mb-2">🤖 AI DIRECTIVE</h3>
              <p className="text-sm text-brand-light font-medium leading-relaxed">{result.aiInsight}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PivotEngine;
