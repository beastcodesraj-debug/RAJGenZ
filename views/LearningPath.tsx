
import React, { useState, useEffect } from 'react';
import { PathItem, Subject } from '../types';

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'physics', name: 'Physics', color: '#2beee7', icon: 'architecture' },
  { id: 'chem', name: 'Chemistry', color: '#fca5a5', icon: 'science' },
  { id: 'math', name: 'Math', color: '#c084fc', icon: 'functions' },
];

const LearningPath: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('zen_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [activeSubjectId, setActiveSubjectId] = useState(subjects[0].id);
  const [paths, setPaths] = useState<PathItem[]>(() => {
    const saved = localStorage.getItem('zen_paths');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', subjectId: 'physics', title: 'Vectors', status: 'mastered', subtopics: [{ id: 's1', title: 'Dot Product', completed: true }] },
      { id: 'p2', subjectId: 'physics', title: 'Kinematics', status: 'current', subtopics: [{ id: 's2', title: 'Projectile Motion', completed: false }] },
    ];
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    localStorage.setItem('zen_subjects', JSON.stringify(subjects));
    localStorage.setItem('zen_paths', JSON.stringify(paths));
  }, [subjects, paths]);

  const activePaths = paths.filter(p => p.subjectId === activeSubjectId);
  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const selectedNode = activePaths.find(p => p.id === selectedNodeId);

  const addPathNode = () => {
    const newNode: PathItem = {
      id: Date.now().toString(),
      subjectId: activeSubjectId,
      title: 'New Chapter',
      status: activePaths.length === 0 ? 'current' : 'locked',
      subtopics: []
    };
    setPaths([...paths, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const newSub: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      icon: 'book'
    };
    setSubjects([...subjects, newSub]);
    setActiveSubjectId(newSub.id);
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  const updateNodeTitle = (id: string, title: string) => {
    setPaths(paths.map(p => p.id === id ? { ...p, title } : p));
  };

  const addSubtopic = (nodeId: string) => {
    setPaths(paths.map(p => p.id === nodeId ? {
      ...p,
      subtopics: [...p.subtopics, { id: Date.now().toString(), title: 'New Topic', completed: false }]
    } : p));
  };

  const toggleSubtopic = (nodeId: string, topicId: string) => {
    setPaths(paths.map(p => p.id === nodeId ? {
      ...p,
      subtopics: p.subtopics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
    } : p));
  };

  return (
    <div className="min-h-full bg-zen-background p-6 pb-40 transition-colors duration-500" style={{ backgroundColor: `${activeSubject.color}08` }}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Path</h1>
        <p className="text-xs font-medium text-gray-400 mt-1">Design your learning journey.</p>
      </header>

      {/* Subject Switcher */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 mb-10">
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveSubjectId(s.id); setSelectedNodeId(null); }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
              activeSubjectId === s.id 
              ? 'bg-white border-primary text-gray-800 shadow-md scale-105' 
              : 'bg-white/50 border-transparent text-gray-400 opacity-60'
            }`}
          >
            {s.name}
          </button>
        ))}
        <button 
          onClick={() => setIsAddingSubject(true)}
          className="size-10 shrink-0 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* New Subject Modal */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xs shadow-2xl">
            <h3 className="font-bold text-xl mb-4">New Subject</h3>
            <input 
              autoFocus
              className="w-full border-0 border-b-2 border-primary/20 focus:border-primary focus:ring-0 p-2 mb-6 text-lg"
              placeholder="E.g. Biology"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubject()}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsAddingSubject(false)} className="flex-1 py-3 text-gray-400 font-bold">Cancel</button>
              <button onClick={addSubject} className="flex-1 py-3 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/30">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Path Viz */}
      <div className="relative flex flex-col items-center min-h-[400px]">
        {activePaths.length > 1 && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 800">
             <path 
               d={`M 200 40 Q 250 150 150 250 T 200 ${40 + (activePaths.length * 160)}`} 
               fill="none" 
               stroke={activeSubject.color} 
               strokeWidth="4" 
               strokeDasharray="8 12"
             />
          </svg>
        )}

        <div className="relative z-10 space-y-32 flex flex-col items-center w-full">
           {activePaths.map((item, idx) => (
             <div 
               key={item.id} 
               onClick={() => setSelectedNodeId(item.id)}
               className={`flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${
                 idx % 2 === 0 ? 'translate-x-6' : '-translate-x-6'
               } ${selectedNodeId === item.id ? 'scale-110 z-20' : ''}`}
             >
               <div className={`size-20 rounded-full flex items-center justify-center shadow-xl border-4 transition-all ${
                 selectedNodeId === item.id ? 'ring-4 ring-primary ring-offset-4' : ''
               } ${
                 item.status === 'mastered' ? 'bg-primary border-white text-white' : 
                 item.status === 'current' ? 'bg-white text-primary border-primary animate-pulse' : 
                 'bg-gray-100 text-gray-300 border-gray-50'
               }`}
               style={item.status === 'mastered' ? { backgroundColor: activeSubject.color } : {}}>
                 <span className="material-symbols-outlined text-3xl">
                   {item.status === 'mastered' ? 'check_circle' : item.status === 'current' ? 'bolt' : 'lock'}
                 </span>
               </div>
               <div className="mt-4 text-center">
                 <h3 className="font-bold text-gray-700 text-sm max-w-[120px] line-clamp-2">{item.title}</h3>
                 <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">{item.status}</span>
               </div>
             </div>
           ))}

           {/* Add Node Placeholder */}
           <button 
             onClick={addPathNode}
             className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
           >
              <div className="size-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Next Chapter</span>
           </button>
        </div>
      </div>

      {/* Node Editor Drawer */}
      {selectedNode && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[60] animate-in slide-in-from-bottom duration-500">
           <div className="bg-white rounded-t-[3rem] p-8 shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.1)] border-t border-gray-100">
             <div className="flex items-center justify-between mb-6">
                <input 
                  className="text-2xl font-bold text-gray-800 bg-transparent border-0 focus:ring-0 p-0 w-full"
                  value={selectedNode.title}
                  onChange={(e) => updateNodeTitle(selectedNode.id, e.target.value)}
                  placeholder="Chapter Title"
                />
                <button onClick={() => setSelectedNodeId(null)} className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>

             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {selectedNode.subtopics.map(topic => (
                  <div key={topic.id} className="p-4 bg-gray-50/50 rounded-2xl flex items-center gap-4 group">
                    <button 
                      onClick={() => toggleSubtopic(selectedNode.id, topic.id)}
                      className={`size-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        topic.completed ? 'bg-primary border-primary text-white' : 'border-gray-200 text-transparent'
                      }`}
                      style={topic.completed ? { backgroundColor: activeSubject.color, borderColor: activeSubject.color } : {}}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </button>
                    <input 
                      className={`flex-1 bg-transparent border-0 focus:ring-0 p-0 text-sm font-medium ${topic.completed ? 'text-gray-300 line-through' : 'text-gray-600'}`}
                      value={topic.title}
                      onChange={(e) => {
                        setPaths(paths.map(p => p.id === selectedNode.id ? {
                          ...p,
                          subtopics: p.subtopics.map(t => t.id === topic.id ? { ...t, title: e.target.value } : t)
                        } : p));
                      }}
                    />
                  </div>
                ))}
                
                <button 
                  onClick={() => addSubtopic(selectedNode.id)}
                  className="w-full p-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-bold text-gray-300 flex items-center justify-center gap-2 hover:border-primary/20 hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>New Subtopic</span>
                </button>
             </div>

             <div className="mt-8 flex gap-3">
               <button 
                 onClick={() => {
                   setPaths(paths.map(p => p.id === selectedNode.id ? { ...p, status: p.status === 'mastered' ? 'current' : 'mastered' } : p));
                 }}
                 className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-transform active:scale-95"
                 style={{ backgroundColor: activeSubject.color }}
               >
                 <span className="material-symbols-outlined">check_circle</span>
                 {selectedNode.status === 'mastered' ? 'Mark as Current' : 'Mark as Mastered'}
               </button>
               <button 
                 onClick={() => {
                   if(confirm('Delete this chapter?')) {
                     setPaths(paths.filter(p => p.id !== selectedNode.id));
                     setSelectedNodeId(null);
                   }
                 }}
                 className="size-14 rounded-2xl bg-red-50 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
               >
                 <span className="material-symbols-outlined">delete</span>
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
