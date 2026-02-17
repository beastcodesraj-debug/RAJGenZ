
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import LearningPath from './views/LearningPath';
import BrainBreak from './views/BrainBreak';
import Reflection from './views/Reflection';
import Profile from './views/Profile';
import PomodoroTimer from './views/PomodoroTimer';
import NavBar from './components/NavBar';
import { AppView, UserProfile } from './types';
import { getAfterSchoolMotivation } from './services/geminiService';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState<AppView>('garden');

  useEffect(() => {
    const path = location.pathname.substring(1) as AppView || 'garden';
    setActiveView(path);
    
    // Check if there is an active Pomodoro session on mount
    const savedSession = localStorage.getItem('zen_active_pomodoro');
    if (savedSession && path !== 'pomodoro') {
      const session = JSON.parse(savedSession);
      if (session.isActive && session.endTime > Date.now()) {
        console.log("Pomodoro session active in background...");
      }
    }
  }, [location]);

  // Daily 12 PM Motivation Scheduler
  useEffect(() => {
    const checkNotification = async () => {
      const enabled = localStorage.getItem('zen_notifications_enabled') === 'true';
      if (!enabled) return;

      const now = new Date();
      const currentHour = now.getHours();
      const todayDate = now.toDateString();
      const lastSentDate = localStorage.getItem('zen_last_motivation_date');

      // Trigger if it's 12 PM or later AND hasn't been sent today
      if (currentHour >= 12 && lastSentDate !== todayDate) {
        if (Notification.permission === 'granted') {
          const profileData = localStorage.getItem('zen_profile');
          const name = profileData ? JSON.parse(profileData).name : 'Scholar';
          
          const motivation = await getAfterSchoolMotivation(name);
          
          new Notification("ZenScholar: Welcome Home", {
            body: motivation,
            icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zen",
          });

          localStorage.setItem('zen_last_motivation_date', todayDate);
        }
      }
    };

    const interval = setInterval(checkNotification, 60000); // Check every minute
    checkNotification(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const handleNav = (view: AppView) => {
    navigate(`/${view}`);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-zen-background shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-24">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/garden" element={<Dashboard />} />
          <Route path="/path" element={<LearningPath />} />
          <Route path="/brainbreak" element={<BrainBreak />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/you" element={<Profile />} />
          <Route path="/pomodoro" element={<PomodoroTimer />} />
        </Routes>
      </main>

      {/* Persistent Bottom Nav */}
      {activeView !== 'brainbreak' && activeView !== 'pomodoro' && (
        <NavBar activeView={activeView} onNav={handleNav} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
