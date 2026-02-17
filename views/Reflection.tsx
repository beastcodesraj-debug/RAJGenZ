
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeReflection } from '../services/geminiService';

const Reflection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [vent, setVent] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = ["Calculus", "Anxiety", "Social Media", "Lack of Sleep", "Physics", "Family Pressure"];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const feedback = await analyzeReflection(vent, selectedTags);
    setAiFeedback(feedback);
    setIsSubmitting(false);
    // Clear the vent box to symbolize "letting go"
    setVent("");
  };

  return (
    <div className="p-6 pb-32">
       <header className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="size-10 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-400 active:scale-90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Evening Reflection</span>
        <div className="size-10"></div>
      </header>

      {/* Hero Section */}
      <div className="text-center mb-10 animate-float">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/20 text-primary-dark mb-4">
          <span className="material-symbols-outlined text-3xl">psychology_alt</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 leading-tight">What drained you<br />most today?</h1>
        <p className="text-xs text-gray-400 mt-2 font-medium">Select the heavy weights to put them down.</p>
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {tags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-6 py-3 rounded-full border-2 text-sm font-bold transition-all ${
                isSelected 
                  ? 'bg-primary border-primary text-zen-dark shadow-lg shadow-primary/20 scale-95' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-primary/50'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Satisfaction Rating */}
      <div className="mb-12 text-center">
        <h3 className="text-sm font-bold text-gray-800 mb-6 tracking-widest uppercase">How satisfied were you?</h3>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <button 
              key={i} 
              onClick={() => setRating(i)}
              className={`transition-all transform hover:scale-110 ${rating >= i ? 'text-primary' : 'text-gray-200'}`}
            >
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: rating >= i ? "'FILL' 1" : "'FILL' 0" }}>
                emoji_food_beverage
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Vent Box */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 mb-8">
        <label className="block text-sm font-bold text-gray-800 mb-2">The Vent Box</label>
        <textarea 
          value={vent}
          onChange={(e) => setVent(e.target.value)}
          placeholder="Vent here... whatever you type will disappear when you submit, symbolizing letting go."
          className="w-full border-0 border-b border-gray-100 focus:ring-0 focus:border-primary p-0 text-sm text-gray-500 placeholder-gray-300 resize-none min-h-[100px]"
        />
        <div className="flex justify-end mt-2">
          <span className="text-[10px] font-medium text-gray-300 italic">It disappears tomorrow.</span>
        </div>
      </div>

      {/* AI Advice Card */}
      {aiFeedback && (
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex items-center gap-2 mb-2 text-primary-dark">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Zen Insight</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed italic">"{aiFeedback}"</p>
          <button 
            onClick={() => navigate('/garden')}
            className="mt-6 w-full py-3 bg-white/60 hover:bg-white rounded-xl text-[10px] font-bold tracking-widest uppercase text-gray-500 transition-colors"
          >
            Return Home
          </button>
        </div>
      )}

      {/* Submit Button */}
      {!aiFeedback && (
        <div className="fixed bottom-28 left-0 right-0 px-8 flex justify-center z-20 pointer-events-none">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || (!vent && selectedTags.length === 0)}
            className={`pointer-events-auto bg-zen-dark text-white px-10 py-4 rounded-full font-bold shadow-xl flex items-center gap-3 transform active:scale-95 transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <>
                <span>Release & Rest</span>
                <span className="material-symbols-outlined">spa</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Reflection;
