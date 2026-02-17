
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, Subject } from '../types';
import { getEncouragement } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [aiQuote, setAiQuote] = useState("Resting is part of the progress.");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');

  const [subjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('zen_subjects');
    return saved ? JSON.parse(saved) : [
      { id: 'physics', name: 'Physics', color: '#2beee7', icon: 'architecture' },
      { id: 'chem', name: 'Chemistry', color: '#fca5a5', icon: 'science' },
      { id: 'math', name: 'Math', color: '#c084fc', icon: 'functions' },
      { id: 'recovery', name: 'Recovery', color: '#fb923c', icon: 'spa' }
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zen_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Review Newton Laws', subjectId: 'physics', duration: '45m', icon: 'architecture', completed: false },
      { id: '2', title: 'Breathing Exercise', subjectId: 'recovery', duration: '2m', icon: 'spa', completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('zen_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    getEncouragement("Balance and focus for students").then(quote => {
      setAiQuote(quote);
      setIsLoading(false);
    });
    if (subjects.length > 0) setSelectedSubId(subjects[0].id);
  }, [subjects]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      subjectId: selectedSubId || 'general',
      duration: '25m',
      icon: subjects.find(s => s.id === selectedSubId)?.icon || 'assignment',
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTaskDuration = (id: string, duration: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, duration } : t));
  };

  const startPomodoro = (task: Task) => {
    navigate('/pomodoro', { state: { task } });
  };

  const activeTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="p-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">Focus Flow.</h1>
        </div>
        <button 
          onClick={() => navigate('/you')}
          className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-gray-400">notifications</span>
        </button>
      </header>

      {/* Gauge Card */}
      <div className="relative flex flex-col items-center justify-center mb-12 group">
        <div className="relative size-64">
          <svg className="size-full" viewBox="0 0 100 100">
            <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <path
              d="M 20 80 A 40 40 0 1 1 80 80"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="188.5"
              strokeDashoffset={188.5 * (1 - (tasks.filter(t => t.completed).length / (tasks.length || 1)))}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2beee7" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
            <span className="text-sm font-bold text-gray-400 tracking-widest uppercase block mb-1">Status</span>
            <p className="text-xs text-gray-400 font-medium">
              {activeTasksCount === 0 ? 'Clear mind.' : `${activeTasksCount} steps to go.`}
            </p>
          </div>
        </div>
        
        <div className="w-full mt-4 bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center backdrop-blur-sm">
          <p className={`text-sm italic text-primary-dark ${isLoading ? 'animate-pulse' : ''}`}>
             "{aiQuote}"
          </p>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-800">Your Session</h2>
          <button 
            onClick={() => setShowAddTask(true)}
            className="size-10 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {showAddTask && (
          <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 animate-in zoom-in duration-300">
            <input 
              autoFocus
              className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary p-0 mb-4 text-sm font-medium"
              placeholder="What are we doing?"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
              {subjects.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedSubId(s.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedSubId === s.id ? 'bg-primary text-white' : 'bg-white text-gray-400'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddTask(false)} className="text-xs font-bold text-gray-400 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={addTask} className="text-xs font-bold bg-zen-dark text-white px-6 py-2 rounded-xl active:scale-95 transition-transform">Add Task</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tasks.map((task) => {
            const subject = subjects.find(s => s.id === task.subjectId);
            return (
              <div 
                key={task.id} 
                className={`p-5 rounded-3xl flex items-center gap-4 transition-all border ${
                  task.completed ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 hover:border-primary/30 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                    task.completed ? 'bg-gray-200 text-gray-400' : 'bg-primary/10 text-primary-dark'
                  }`}
                  style={!task.completed && subject ? { backgroundColor: `${subject.color}20`, color: subject.color } : {}}
                >
                  <span className="material-symbols-outlined">{task.completed ? 'check' : task.icon}</span>
                </button>
                <div className="flex-1 cursor-pointer">
                  <div className="flex gap-2 items-center mb-1" onClick={() => toggleTask(task.id)}>
                    <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">
                      {subject?.name || 'RECOVERY'}
                    </span>
                  </div>
                  <h3 
                    onClick={() => toggleTask(task.id)}
                    className={`font-bold text-gray-800 transition-all ${task.completed ? 'line-through text-gray-400' : ''}`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="text"
                      className={`text-[10px] font-medium bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 p-0 w-10 text-gray-400 transition-colors ${task.completed ? 'opacity-50' : 'hover:border-gray-200'}`}
                      value={task.duration}
                      disabled={task.completed}
                      onChange={(e) => updateTaskDuration(task.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-[10px] font-medium text-gray-300 uppercase tracking-tighter">• Est. Time</span>
                  </div>
                </div>
                {!task.completed && (
                  <button 
                    onClick={() => startPomodoro(task)}
                    className="size-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">timer</span>
                  </button>
                )}
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="py-20 text-center opacity-20">
              <span className="material-symbols-outlined text-6xl">spa</span>
              <p className="text-sm font-bold mt-4 uppercase tracking-[0.2em]">All clear.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
