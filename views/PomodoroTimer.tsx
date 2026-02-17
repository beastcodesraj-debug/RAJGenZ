
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PomodoroSession, Task, UserProfile } from '../types';

const WORK_TIME = 25 * 60 * 1000;
const BREAK_TIME = 5 * 60 * 1000;

const PomodoroTimer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task as Task;

  const [timeLeft, setTimeLeft] = useState<number>(WORK_TIME);
  const [session, setSession] = useState<PomodoroSession | null>(null);

  // Initialize or Resume session
  useEffect(() => {
    const saved = localStorage.getItem('zen_active_pomodoro');
    const now = Date.now();

    if (saved) {
      const parsed = JSON.parse(saved) as PomodoroSession;
      if (parsed.isActive && parsed.endTime > now) {
        setSession(parsed);
        setTimeLeft(parsed.endTime - now);
        return;
      }
    }

    // Start new session if nothing active or passed new task
    if (task) {
      const newSession: PomodoroSession = {
        taskId: task.id,
        subjectId: task.subjectId,
        startTime: now,
        endTime: now + WORK_TIME,
        type: 'work',
        isActive: true,
        totalWorkMinutes: 25
      };
      setSession(newSession);
      setTimeLeft(WORK_TIME);
      localStorage.setItem('zen_active_pomodoro', JSON.stringify(newSession));
    } else {
      // Default to general focus if accessed directly without task
      const generalSession: PomodoroSession = {
        taskId: 'general',
        subjectId: 'general',
        startTime: now,
        endTime: now + WORK_TIME,
        type: 'work',
        isActive: true,
        totalWorkMinutes: 25
      };
      setSession(generalSession);
      setTimeLeft(WORK_TIME);
      localStorage.setItem('zen_active_pomodoro', JSON.stringify(generalSession));
    }
  }, [task]);

  const updateProfileFocus = useCallback((minutes: number) => {
    const saved = localStorage.getItem('zen_profile');
    if (saved) {
      const profile = JSON.parse(saved) as UserProfile;
      profile.focusTime += minutes;
      localStorage.setItem('zen_profile', JSON.stringify(profile));
    }
  }, []);

  useEffect(() => {
    if (!session || !session.isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = session.endTime - now;

      if (remaining <= 0) {
        clearInterval(interval);
        handleSessionEnd();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleSessionEnd = () => {
    if (!session) return;

    // Notify user if possible
    if (Notification.permission === "granted") {
      new Notification(session.type === 'work' ? "Focus Session Over" : "Break Over", {
        body: session.type === 'work' ? "Time for a well-deserved break!" : "Ready to focus again?",
        icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zen",
      });
    }

    if (session.type === 'work') {
      updateProfileFocus(25);
      const nextSession: PomodoroSession = {
        ...session,
        type: 'break',
        endTime: Date.now() + BREAK_TIME,
      };
      setSession(nextSession);
      setTimeLeft(BREAK_TIME);
      localStorage.setItem('zen_active_pomodoro', JSON.stringify(nextSession));
    } else {
      const nextSession: PomodoroSession = {
        ...session,
        type: 'work',
        endTime: Date.now() + WORK_TIME,
      };
      setSession(nextSession);
      setTimeLeft(WORK_TIME);
      localStorage.setItem('zen_active_pomodoro', JSON.stringify(nextSession));
    }
  };

  const cancelSession = () => {
    // Immediate navigation for the "Close" action to feel responsive
    localStorage.removeItem('zen_active_pomodoro');
    navigate('/garden', { replace: true });
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = session ? (1 - timeLeft / (session.type === 'work' ? WORK_TIME : BREAK_TIME)) : 0;

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="h-full bg-zen-dark flex flex-col items-center justify-between p-8 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute inset-0 transition-all duration-[3000ms] opacity-20 ${
        session?.type === 'work' ? 'bg-primary' : 'bg-orange-400'
      }`}></div>

      <header className="w-full flex items-center gap-4 z-10">
        <button 
          onClick={cancelSession}
          className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Session Active</span>
          <h2 className="text-lg font-bold">
            {task?.title || "Deep Focus"}
          </h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <div className="relative size-72">
          {/* Progress Circle */}
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="4" 
            />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={session?.type === 'work' ? '#2beee7' : '#fb923c'} 
              strokeWidth="4" 
              strokeDasharray="282.7"
              strokeDashoffset={282.7 * (1 - progress)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-light tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mt-4">
              {session?.type === 'work' ? 'Focusing' : 'Resting'}
            </span>
          </div>
        </div>

        <div className="mt-16 text-center space-y-2 opacity-60">
           <p className="text-xs font-medium italic">"Deep work is the superpower of the 21st century."</p>
           <p className="text-[10px] uppercase tracking-widest">— Cal Newport</p>
        </div>
      </main>

      <footer className="w-full pb-12 z-10 flex flex-col items-center gap-8">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`size-1 w-8 rounded-full mb-2 ${session?.type === 'work' ? 'bg-primary' : 'bg-white/20'}`}></div>
            <span className="text-[10px] font-bold opacity-40 uppercase">Phase 1</span>
          </div>
          <div className="flex flex-col items-center opacity-20">
            <div className="size-1 w-8 bg-white rounded-full mb-2"></div>
            <span className="text-[10px] font-bold uppercase">Phase 2</span>
          </div>
          <div className="flex flex-col items-center opacity-20">
            <div className="size-1 w-8 bg-white rounded-full mb-2"></div>
            <span className="text-[10px] font-bold uppercase">Phase 3</span>
          </div>
        </div>

        <button 
          onClick={handleSessionEnd}
          className="px-12 py-4 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
        >
          {session?.type === 'work' ? 'Skip to Break' : 'Start Next Focus'}
        </button>
      </footer>
    </div>
  );
};

export default PomodoroTimer;
