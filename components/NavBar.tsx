
import React from 'react';
import { AppView } from '../types';

interface NavBarProps {
  activeView: AppView;
  onNav: (view: AppView) => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeView, onNav }) => {
  const tabs: { id: AppView; label: string; icon: string }[] = [
    { id: 'garden', label: 'Garden', icon: 'spa' },
    { id: 'path', label: 'Path', icon: 'map' },
    { id: 'brainbreak', label: '', icon: 'play_arrow' }, // Center FAB-ish
    { id: 'reflection', label: 'Mirror', icon: 'view_quilt' },
    { id: 'you', label: 'You', icon: 'account_circle' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex items-end justify-between z-50">
      {tabs.map((tab) => {
        if (tab.id === 'brainbreak') {
          return (
            <button
              key={tab.id}
              onClick={() => onNav('brainbreak')}
              className="mb-4 bg-primary text-zen-dark size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 transform hover:scale-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-3xl font-bold">play_arrow</span>
            </button>
          );
        }

        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNav(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all group ${
              isActive ? 'text-primary-dark' : 'text-gray-400'
            }`}
          >
            <span className={`material-symbols-outlined transition-all ${isActive ? 'scale-110' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">{tab.label}</span>
            {isActive && <div className="size-1 bg-primary rounded-full mt-0.5"></div>}
          </button>
        );
      })}
    </div>
  );
};

export default NavBar;
