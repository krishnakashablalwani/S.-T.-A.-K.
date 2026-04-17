import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';

const Chatbot = ({ careerName, timelineSummary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !careerName) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerName, timelineSummary, message: userMsg })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
       console.error(err);
       setMessages(prev => [...prev, { sender: 'ai', text: 'SYSTEM OFFLINE OR API KEY MISSING.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brutal-box flex flex-col h-full bg-black font-mono">
       <div className="bg-brand-black text-brand-light p-3 border-b-4 border-brand-light/30 font-black uppercase text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={24} fill="#E8DBC5" /> COMMAND LINK
          </div>
          <span className="bg-brand-accent px-2 text-xs leading-tight text-black border-2 border-black animate-pulse">LIVE</span>
       </div>
       
       <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black styled-scroll">
          {messages.length === 0 && (
             <div className="text-sm font-bold text-center mt-10 p-4 border-4 border-dashed border-brand-gray/40 text-brand-gray bg-black">
               SYSTEM READY<br/> CONSULT AI FOR <span className="text-brand-accent">{careerName.toUpperCase()}</span>
             </div>
          )}
          {messages.map((msg, i) => (
             <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[85%] border-4 font-bold shadow-[4px_4px_0_0_rgba(114,87,82,0.3)] ${msg.sender === 'user' ? 'bg-brand-gray text-brand-light border-brand-light/20' : 'bg-brand-light text-black border-black'}`}>
                   {msg.text.split('\n').map((line, idx) => <span key={idx}>{line}<br/></span>)}
                </div>
             </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="p-2 border-4 border-black bg-brand-accent text-black font-black uppercase text-xs animate-pulse">
                 QUERYING...
               </div>
             </div>
          )}
       </div>

       <form onSubmit={handleSend} className="p-3 border-t-4 border-brand-light/30 flex gap-2 bg-black">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE COMMAND..." 
            className="brutal-input flex-1 uppercase text-sm"
          />
          <button type="submit" disabled={loading || !input.trim()} className="brutal-btn px-4 bg-brand-accent">
            <Send size={20} fill="black" />
          </button>
       </form>
    </div>
  );
};

export default Chatbot;
