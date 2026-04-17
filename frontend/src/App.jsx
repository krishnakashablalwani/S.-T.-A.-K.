import React, { useState } from 'react';
import SidebarForm from './components/SidebarForm';
import SimulationResults from './components/SimulationResults';

function App() {
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSimulate = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Simulation failed. Target server error or Missing API Key.');
      }
      const result = await response.json();
      setSimulationData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-mono bg-black text-brand-light">
      <header className="bg-black p-4 border-b-8 border-brand-light flex items-center justify-center md:justify-start z-10 relative">
        <label className="mr-4 brutal-box p-1 hidden md:block border-brand-light">
          <img src="/logo.jpeg" alt="Logo" className="h-10 w-auto inline-block border-2 border-brand-light" onError={(e) => { e.target.style.display = 'none'; }} />
        </label>
        <h1 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap text-brand-light">Career Decision Simulator</h1>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <aside className="w-full md:w-[420px] bg-black p-6 overflow-y-auto border-r-8 border-brand-light z-0 styled-scroll">
          <SidebarForm onSimulate={handleSimulate} loading={loading} />
          {error && <div className="mt-6 brutal-box p-4 bg-brand-danger text-black font-black text-center uppercase border-brand-light">{error}</div>}
        </aside>

        <section className="flex-1 p-6 md:p-10 overflow-y-auto bg-black">
          {simulationData ? (
            <SimulationResults data={simulationData} />
          ) : (
             <div className="h-full flex flex-col items-center justify-center">
               <div className="brutal-box p-10 max-w-lg text-center transform -rotate-1 bg-black border-brand-light">
                 <h2 className="text-4xl font-black uppercase mb-4 text-brand-accent">Awaiting Input</h2>
                 <p className="text-lg font-black border-t-4 border-brand-light pt-4 text-brand-light">
                   ENTER PARAMETERS ON THE<br/> LEFT SIDEBAR.<br/>
                   <span className="text-brand-accent opacity-80 animate-pulse">SMASH THE RUN BUTTON.</span>
                 </p>
               </div>
             </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
