import React, { useState } from 'react';
import { Play, Plus, Trash2, Zap } from 'lucide-react';

const SCENARIOS = [
  { id: 'normal', label: 'Normal', emoji: '📊', growthMod: 1.0, layoffMod: 1.0, color: 'border-brand-light' },
  { id: 'bull', label: 'Bull Market', emoji: '🚀', growthMod: 1.3, layoffMod: 0.5, color: 'border-brand-accent' },
  { id: 'recession', label: 'Recession', emoji: '📉', growthMod: 0.7, layoffMod: 2.0, color: 'border-brand-danger' },
  { id: 'ai_disruption', label: 'AI Disruption', emoji: '🤖', growthMod: 0.85, layoffMod: 1.8, color: 'border-yellow-500' },
];

const SidebarForm = ({ onSimulate, loading }) => {
  const [formData, setFormData] = useState({
    careerName: '',
    yearsToSimulate: 10,
    userSkillLevel: 'Beginner',
    location: 'Tier 2',
    compareCareerName: '',
    inflationRate: 0.03,
    startingDebt: 0,
    debtInterestRate: 0.05,
    lifeEvents: [],
    scenario: 'normal',
    learningInvestment: false,
  });

  const [resumeText, setResumeText] = useState('');
  const [skillAnalysis, setSkillAnalysis] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.careerName) return;
    const scenario = SCENARIOS.find(s => s.id === formData.scenario);
    onSimulate({ ...formData, scenarioGrowthMod: scenario.growthMod, scenarioLayoffMod: scenario.layoffMod });
  };

  const handleAddEvent = () => {
    setFormData(prev => ({
      ...prev,
      lifeEvents: [...prev.lifeEvents, { year: 5, cost: 0, newGrowthRateBoost: 0 }]
    }));
  };

  const updateEvent = (index, field, value) => {
    const updated = [...formData.lifeEvents];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, lifeEvents: updated }));
  };

  const removeEvent = (index) => {
    const updated = [...formData.lifeEvents];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, lifeEvents: updated }));
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText || !formData.careerName) return;
    setAnalyzingResume(true);
    setSkillAnalysis('');
    try {
      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: resumeText, careerName: formData.careerName })
      });
      const data = await response.json();
      setSkillAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingResume(false);
    }
  };


  return (

    <form onSubmit={handleSubmit} className="space-y-8 pb-10 font-mono">

      {/* Career Input */}
      <div className="space-y-6 text-brand-light">
        <div>
          <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Target Career Name</label>
          <input
            type="text"
            name="careerName"
            placeholder="e.g. Space Tourism Guide"
            value={formData.careerName}
            onChange={handleChange}
            className="brutal-input text-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Career Duration</label>
            <div className="flex items-center gap-2">
              <input type="range" name="yearsToSimulate" min="5" max="45" value={formData.yearsToSimulate} onChange={handleChange} className="w-full accent-brand-accent" />
              <span className="font-black border-2 border-brand-light px-2 text-brand-light">{formData.yearsToSimulate}Y</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Skill Level</label>
            <select name="userSkillLevel" value={formData.userSkillLevel} onChange={handleChange} className="brutal-input py-1 text-sm">
              <option value="Beginner">Beginner (+0%)</option>
              <option value="Intermediate">Intermediate (+15%)</option>
              <option value="Advanced">Advanced (+30%)</option>

            </select>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Location Tier</label>
          <div className="flex gap-2">
            {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
              <button
                key={tier}
                type="button"
                onClick={() => setFormData(p => ({ ...p, location: tier }))}
                className={`flex-1 py-1 text-xs border-4 font-black uppercase transition-all ${formData.location === tier ? 'bg-brand-accent text-brand-light border-brand-light' : 'bg-brand-black text-brand-gray border-brand-gray/30'}`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 SCENARIO SELECTOR */}
        <div>
          <label className="block text-sm font-black uppercase mb-2 text-brand-gray">⚡ Economic Scenario</label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFormData(p => ({ ...p, scenario: s.id }))}
                className={`py-2 px-2 border-4 font-black uppercase text-xs transition-all text-left ${formData.scenario === s.id ? `${s.color} bg-brand-light text-brand-black` : 'border-brand-gray/30 bg-brand-black text-brand-gray'}`}
              >
                {s.emoji} {s.label}
                {formData.scenario === s.id && <div className="text-[9px] font-normal normal-case mt-1 opacity-80">Growth ×{s.growthMod} · Layoff ×{s.layoffMod}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Career */}
        <div>
          <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Compare Career (Optional)</label>
          <input
            type="text"
            name="compareCareerName"
            placeholder="e.g. Data Scientist"
            value={formData.compareCareerName}
            onChange={handleChange}
            className="brutal-input"
          />
        </div>

        {/* 📚 SKILL DECAY ENGINE TOGGLE */}
        <div className={`brutal-box p-4 transition-all ${formData.learningInvestment ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-gray/30 bg-brand-black'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-black uppercase text-brand-light">📚 Learning Investment</div>
              <div className="text-[10px] font-black uppercase text-brand-gray mt-0.5">Spend 5% salary on upskilling each year</div>
            </div>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, learningInvestment: !p.learningInvestment }))}
              className={`w-14 h-7 border-4 flex items-center px-1 transition-all ${formData.learningInvestment ? 'bg-brand-accent border-brand-light' : 'bg-brand-gray/20 border-brand-gray/40'}`}
            >
              <div className={`w-4 h-4 bg-brand-light transition-transform ${formData.learningInvestment ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          {formData.learningInvestment ? (
            <div className="text-[10px] font-black space-y-1 border-t-2 border-brand-accent pt-2">
              <div className="text-brand-accent">✅ Growth rate compounds +0.5%/yr</div>
              <div className="text-brand-accent">✅ Automation risk decreases each year</div>
              <div className="text-brand-gray">💸 -5% net income per year</div>
            </div>
          ) : (
            <div className="text-[10px] font-black space-y-1 border-t-2 border-brand-gray/30 pt-2">
              <div className="text-brand-danger">⚠️ Growth rate decays -0.3%/yr</div>
              <div className="text-brand-danger">⚠️ Automation risk increases each year</div>
            </div>
          )}
        </div>

        {/* Resume Analyzer */}
        <div className="brutal-box p-4 bg-brand-black border-brand-gray/30 relative">
          <div className="absolute -top-3 -right-3 bg-brand-accent text-brand-light px-2 border-4 border-brand-light font-black uppercase text-sm -rotate-3 shadow-[4px_4px_0_0_rgba(11,244,108,0.4)]">AI Coach</div>
          <label className="block text-sm font-black uppercase mb-2 text-brand-gray">Resume Matcher</label>
          <textarea
            placeholder="Paste your top skills or resume here to find skill gaps before simulating..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="brutal-input text-xs h-24 mb-3 border-brand-gray/60"
          />
          <button
            type="button"
            disabled={analyzingResume || !resumeText || !formData.careerName}
            onClick={handleAnalyzeResume}
            className="brutal-btn w-full py-2 text-sm flex justify-center items-center gap-2"
          >
            {analyzingResume ? 'ANALYZING...' : <><Zap size={16} fill="#1A1A1A" /> ANALYZE MY SKILLS</>}
          </button>
          {skillAnalysis && (
            <div className="mt-4 p-3 bg-brand-black border-2 border-dashed border-brand-accent text-[10px] leading-tight overflow-y-auto max-h-32 text-brand-light styled-scroll" dangerouslySetInnerHTML={{ __html: skillAnalysis }} />
          )}
        </div>

        {/* Education Debt */}
        <div className="h-[2px] bg-brand-gray/30 w-full"></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Starting Student Debt</label>
            <input type="number" name="startingDebt" value={formData.startingDebt} onChange={handleChange} className="brutal-input" />
          </div>
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Interest Rate</label>
            <input type="number" name="debtInterestRate" step="0.01" min="0" max="0.5" value={formData.debtInterestRate} onChange={handleChange} className="brutal-input" />
          </div>
        </div>

        {/* Life Events */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase border-b-4 border-brand-accent text-brand-light">LIFE EVENTS</h3>
            <button type="button" onClick={handleAddEvent} className="brutal-btn p-1 border-brand-light">
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
          {formData.lifeEvents.map((event, i) => (
            <div key={i} className="brutal-box p-4 bg-brand-black border-brand-gray/30 relative group">
              <button type="button" onClick={() => removeEvent(i)} className="absolute -top-3 -right-3 brutal-btn bg-brand-danger text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Trash2 size={20} strokeWidth={3} />
              </button>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-brand-gray">YEAR</label>
                  <input type="number" min="1" max="30" value={event.year} onChange={(e) => updateEvent(i, 'year', e.target.value)} className="brutal-input py-1 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-brand-gray">COST (₹)</label>
                  <input type="number" value={event.cost} onChange={(e) => updateEvent(i, 'cost', e.target.value)} className="brutal-input py-1 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-brand-gray">BOOST %</label>
                  <input type="number" step="0.01" value={event.newGrowthRateBoost} onChange={(e) => updateEvent(i, 'newGrowthRateBoost', e.target.value)} className="brutal-input py-1 text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !formData.careerName}
        className="brutal-btn w-full py-4 text-xl flex items-center justify-center gap-3 mt-8"
      >
        {loading ? 'SIMULATING VIA AI...' : <><Play fill="#1A1A1A" size={24} /> RUN SIMULATION</>}
      </button>
    </form>
  );
};

export default SidebarForm;
