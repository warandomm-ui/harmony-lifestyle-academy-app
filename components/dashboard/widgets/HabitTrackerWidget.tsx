
import React, { useState, useEffect } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { CheckCircleIcon, PlusIcon, TrashIcon, FireIcon } from '../Icons';

interface Habit {
  id: string;
  name: string;
  type: 'positive' | 'negative'; // to build vs to break
  streak: number;
  completedToday: boolean;
}

const HabitTrackerWidget: React.FC = () => {
  const { addPoints } = useGamification();
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Drink 2L Water', type: 'positive', streak: 5, completedToday: false },
    { id: '2', name: 'Read 15 mins', type: 'positive', streak: 12, completedToday: true },
    { id: '3', name: 'No Sugar', type: 'negative', streak: 3, completedToday: false },
  ]);
  const [newHabitName, setNewHabitName] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userHabits');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userHabits', JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        if (!habit.completedToday) {
            addPoints(10, 'completing a habit');
        }
        return {
          ...habit,
          completedToday: !habit.completedToday,
          streak: !habit.completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        };
      }
      return habit;
    }));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName,
        type: 'positive', // default
        streak: 0,
        completedToday: false
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setShowInput(false);
  };

  const deleteHabit = (id: string) => {
      setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="bento-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Habit Tracker</h2>
        <button 
            onClick={() => setShowInput(!showInput)} 
            className="p-1.5 rounded-full hover:bg-[var(--secondary)] text-[var(--primary)]"
        >
            <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {showInput && (
          <form onSubmit={addHabit} className="mb-4 flex gap-2">
              <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New habit..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm"
                autoFocus
              />
              <button type="submit" className="bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-sm font-bold">Add</button>
          </form>
      )}

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
        {habits.length === 0 && <p className="text-sm text-[var(--muted)] text-center py-4">No habits yet. Start small!</p>}
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className={`group flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${
                habit.completedToday 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                : 'bg-[var(--background)] border-transparent hover:border-[var(--border)]'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <button 
                onClick={() => toggleHabit(habit.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    habit.completedToday 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-green-400'
                }`}
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <span className={`font-medium truncate ${habit.completedToday ? 'text-green-700 dark:text-green-300 line-through decoration-2' : 'text-[var(--foreground)]'}`}>
                {habit.name}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 text-xs font-bold ${habit.streak > 0 ? 'text-orange-500' : 'text-[var(--muted)]'}`}>
                    <FireIcon className="h-4 w-4" />
                    {habit.streak}
                </div>
                <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-500 transition-opacity"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTrackerWidget;
