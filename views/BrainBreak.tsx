
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BrainBreak: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Let go'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(120); // 2 mins session

  // 4-7-8 Breathing logic timings
  useEffect(() => {
    let timer: any;
    const cycle = () => {
      setPhase('Inhale');
      timer = setTimeout(() => {
        setPhase('Hold');
        timer = setTimeout(() => {
          setPhase('Let go');
          timer = setTimeout(cycle, 8000);
        }, 7000);
      }, 4000);
    };

    cycle();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    navigate('/garden', { replace: true });
  };

  return (
    <div className="h-full bg-zen-background flex flex-col items-center justify-between p-8 animate-in fade-in duration-1000">
      <header className="w-full flex items-center justify-between">
        <button 
          onClick={handleClose}
          className="size-10 rounded-full bg-white/50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex items-center gap-2 opacity-50">
          <span className="material-symbols-outlined text-gray-500">spa</span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Zen Scholar</span>
        </div>
        <div className="size-10"></div> {/* Spacer for symmetry */}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full relative">
        {/* Progress Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
           <svg className="size-[320px] -rotate-90" viewBox="0 0 100 100">
             <circle 
               cx="50" cy="50" r="48" 
               fill="none" 
               stroke="#E2E8F0" 
               strokeWidth="0.5" 
             />
             <circle 
               cx="50" cy="50" r="48" 
               fill="none" 
               stroke="rgba(43, 238, 231, 0.4)" 
               strokeWidth="1.5" 
               strokeDasharray="301.6"
               strokeDashoffset={301.6 * (1 - timeLeft / 120)}
               className="transition-all duration-1000 ease-linear"
             />
           </svg>
        </div>

        {/* Breathing Circle */}
        <div className="relative size-64 bg-primary/10 rounded-full flex items-center justify-center animate-breathe border border-primary/20 backdrop-blur-sm overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent opacity-40"></div>
           <h2 className="relative text-3xl font-light text-gray-600 transition-all duration-700">
             {phase}...
           </h2>
        </div>

        <p className="mt-12 text-sm font-bold tracking-widest text-gray-300 uppercase">{formatTime(timeLeft)} remaining</p>
      </main>

      <footer className="w-full flex flex-col items-center gap-6 pb-12">
        <div className="flex flex-col items-center gap-2 opacity-40">
           <span className="material-symbols-outlined animate-pulse text-3xl">touch_app</span>
           <p className="text-[10px] font-bold tracking-widest uppercase">Long press to pause</p>
        </div>

        <div className="flex items-center gap-4 px-6 py-3 bg-white/40 rounded-full border border-white backdrop-blur-md">
           <span className="material-symbols-outlined text-gray-400 text-sm">volume_up</span>
           <div className="h-1 w-20 bg-gray-200 rounded-full overflow-hidden">
             <div className="h-full w-2/3 bg-primary rounded-full"></div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default BrainBreak;
