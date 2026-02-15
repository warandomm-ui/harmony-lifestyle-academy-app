
import React, { useState, useEffect } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';

interface CheckInData {
  mood: string;
  energy: number;
  intention: string;
  gratitude: string;
  reflection: string;
  completedMorning: boolean;
  completedEvening: boolean;
  lastUpdated: string;
}

const MOODS = [
  { label: 'Great', emoji: '🤩' },
  { label: 'Good', emoji: '🙂' },
  { label: 'Okay', emoji: '😐' },
  { label: 'Low', emoji: '😔' },
  { label: 'Stressed', emoji: '😫' },
];

const DailyCheckIn: React.FC = () => {
  const { addPoints } = useGamification();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  
  const [data, setData] = useState<CheckInData>({
    mood: '',
    energy: 5,
    intention: '',
    gratitude: '',
    reflection: '',
    completedMorning: false,
    completedEvening: false,
    lastUpdated: new Date().toDateString(),
  });

  useEffect(() => {
    const savedData = localStorage.getItem('dailyCheckIn');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Reset if it's a new day
      if (parsed.lastUpdated !== new Date().toDateString()) {
        setData({ ...data, lastUpdated: new Date().toDateString() });
      } else {
        setData(parsed);
      }
    }
    
    // Set active tab based on time of day
    const currentHour = new Date().getHours();
    if (currentHour >= 17) { // 5 PM onwards
        setActiveTab('evening');
    }
  }, []);

  const handleSave = (type: 'morning' | 'evening') => {
    const newData = {
        ...data,
        [type === 'morning' ? 'completedMorning' : 'completedEvening']: true,
        lastUpdated: new Date().toDateString()
    };
    setData(newData);
    localStorage.setItem('dailyCheckIn', JSON.stringify(newData));
    addPoints(20, `completing ${type} check-in`);
    addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} check-in complete!`, 'success');
  };

  return (
    <div className="bento-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Daily Mindset</h2>
        <div className="flex bg-[var(--background)] rounded-full p-1 border border-[var(--border)]">
            <button 
                onClick={() => setActiveTab('morning')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${activeTab === 'morning' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--muted)]'}`}
            >
                ☀️ Morning
            </button>
            <button 
                onClick={() => setActiveTab('evening')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${activeTab === 'evening' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--muted)]'}`}
            >
                🌙 Evening
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {activeTab === 'morning' ? (
            data.completedMorning ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6 animate-fade-in">
                    <span className="text-4xl mb-2">☀️✅</span>
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Morning Ready!</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">Intention: "{data.intention}"</p>
                    <p className="text-xs text-green-600 mt-2 font-semibold">Come back this evening.</p>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in-fast">
                    <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Current Vibe</label>
                        <div className="flex justify-between">
                            {MOODS.map(m => (
                                <button 
                                    key={m.label}
                                    onClick={() => setData({...data, mood: m.label})}
                                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${data.mood === m.label ? 'bg-[var(--primary)]/20 scale-110' : 'hover:bg-[var(--background)]'}`}
                                >
                                    <span className="text-2xl">{m.emoji}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Today's Intention</label>
                        <input 
                            type="text" 
                            placeholder="I will focus on..."
                            value={data.intention}
                            onChange={(e) => setData({...data, intention: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Energy Level: {data.energy}/10</label>
                        <input 
                            type="range" min="1" max="10" 
                            value={data.energy} 
                            onChange={(e) => setData({...data, energy: parseInt(e.target.value)})}
                            className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                    </div>
                    <button 
                        onClick={() => handleSave('morning')}
                        disabled={!data.mood || !data.intention}
                        className="w-full bg-[var(--primary)] text-white font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all mt-2"
                    >
                        Save Morning Check-in
                    </button>
                </div>
            )
        ) : (
            data.completedEvening ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6 animate-fade-in">
                    <span className="text-4xl mb-2">🌙✨</span>
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Sweet Dreams!</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">Reflection recorded.</p>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in-fast">
                     <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Daily Gratitude</label>
                        <textarea 
                            placeholder="I am thankful for..."
                            value={data.gratitude}
                            onChange={(e) => setData({...data, gratitude: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border-2 border-[var(--border)] focus:border-indigo-500 focus:outline-none text-sm resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--muted)] uppercase mb-2 block">Evening Reflection</label>
                        <textarea 
                            placeholder="What went well today?"
                            value={data.reflection}
                            onChange={(e) => setData({...data, reflection: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border-2 border-[var(--border)] focus:border-indigo-500 focus:outline-none text-sm resize-none"
                        />
                    </div>
                    <button 
                        onClick={() => handleSave('evening')}
                        disabled={!data.gratitude}
                        className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all mt-2"
                    >
                        Save Evening Reflection
                    </button>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default DailyCheckIn;
