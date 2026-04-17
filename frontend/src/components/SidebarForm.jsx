import React, { useState } from 'react';
import { Play, Plus, Trash2, Cpu, Zap } from 'lucide-react';

const SidebarForm = ({ onSimulate, loading }) => {
  const [formData, setFormData] = useState({
    careerName: '',
    yearsToSimulate: 10,
    userSkillLevel: 'Beginner',
    location: 'Global Average',
    compareCareerName: '',
    inflationRate: 0.03,
    startingDebt: 0,
    debtInterestRate: 0.05,
    lifeEvents: []
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
    onSimulate(formData);
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
      
      {/* Infinite AI Career Input */}
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
               <span className="font-black border-2 border-brand-light px-2">{formData.yearsToSimulate}Y</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">Skill Level</label>
            <select name="userSkillLevel" value={formData.userSkillLevel} onChange={handleChange} className="brutal-input py-1 text-sm bg-black">
              <option value="Beginner">Beginner (+0%)</option>
              <option value="Intermediate">Intermediate (+15%)</option>
              <option value="Expert">Expert (+30%)</option>
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
                className={`flex-1 py-1 text-xs border-4 font-black uppercase transition-all ${formData.location === tier ? 'bg-brand-accent text-black border-brand-light' : 'bg-black text-brand-gray border-brand-gray/30'}`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Inflation Toggle */}
        <div className="brutal-box p-3 bg-gray-900 flex items-center justify-between border-gray-700">
           <div>
              <div className="text-xs font-black uppercase text-brand-gray">Economic Model</div>
              <div className="text-sm font-black uppercase">{formData.inflationAdjusted ? 'Inflation Adjusted (Real)' : 'Gross Totals (Nominal)'}</div>
           </div>
           <button 
            type="button"
            onClick={() => setFormData(p => ({ ...p, inflationAdjusted: !p.inflationAdjusted }))}
            className={`w-12 h-6 border-4 flex items-center px-1 transition-colors ${formData.inflationAdjusted ? 'bg-brand-accent border-brand-light' : 'bg-brand-gray/20 border-brand-gray/40'}`}
           >
              <div className={`w-3 h-3 bg-brand-light transition-transform ${formData.inflationAdjusted ? 'translate-x-6' : 'translate-x-0'}`}></div>
           </button>
        </div>

        {/* Resume Analyzer Feature */}
        <div className="brutal-box p-4 bg-black border-brand-gray/30 relative">
           <div className="absolute -top-3 -right-3 bg-brand-accent text-black px-2 border-4 border-brand-light font-black uppercase text-sm -rotate-3 shadow-[4px_4px_0_0_rgba(11,244,108,0.4)]">AI Coach</div>
           <label className="block text-sm font-black uppercase mb-2 text-brand-gray">Resume Matcher</label>
           <textarea 
            placeholder="Paste your top skills or resume here to find skill gaps before simulating..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="brutal-input text-xs h-24 mb-3 border-gray-600"
           />
           <button 
            type="button" 
            disabled={analyzingResume || !resumeText || !formData.careerName}
            onClick={handleAnalyzeResume}
            className="brutal-btn w-full py-2 text-sm flex justify-center items-center gap-2"
           >
             {analyzingResume ? 'ANALYZING...' : <><Zap size={16} fill="black" /> ANALYZE MY SKILLS</>}
           </button>
           {skillAnalysis && (
             <div className="mt-4 p-3 bg-black border-2 border-dashed border-brand-accent text-[10px] leading-tight overflow-y-auto max-h-32 text-gray-300 styled-scroll" dangerouslySetInnerHTML={{ __html: skillAnalysis }} />
           )}
        </div>

        {/* Education Debt */}
        <div className="h-[2px] bg-brand-gray/30 w-full"></div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">starting student debt</label>
            <input 
              type="number" 
              name="startingDebt" 
              value={formData.startingDebt} 
              onChange={handleChange}
              className="brutal-input"
            />
          </div>
          <div>
            <label className="block text-sm font-black uppercase mb-1 text-brand-gray">interest rate</label>
            <input 
              type="number" 
              name="debtInterestRate" 
              step="0.01" min="0" max="0.5"
              value={formData.debtInterestRate} 
              onChange={handleChange}
              className="brutal-input"
            />
          </div>
        </div>

        {/* Life Events */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase border-b-4 border-brand-accent">LIFE EVENTS</h3>
            <button type="button" onClick={handleAddEvent} className="brutal-btn p-1 border-brand-light">
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          {formData.lifeEvents.map((event, i) => (
            <div key={i} className="brutal-box p-4 bg-black border-brand-gray/30 relative group">
               <button type="button" onClick={() => removeEvent(i)} className="absolute -top-3 -right-3 brutal-btn bg-brand-danger text-brand-light p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
        {loading ? 'SIMULATING VIA AI...' : <><Play fill="black" size={24} /> RUN SIMULATION</>}
      </button>
    </form>
  );
};

export default SidebarForm;
