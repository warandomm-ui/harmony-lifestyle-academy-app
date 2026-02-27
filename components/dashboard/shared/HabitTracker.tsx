import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';
import { useGamification } from '../../../contexts/GamificationContext';

export interface Habit {
    id: string;
    icon: string;
    label: string;
}

interface HabitTrackerProps {
    title: string;
    habits: Habit[];
    storageKey: string;
    accentColor: string;   // e.g. 'red' | 'green' | 'blue' | 'emerald'
    completionLabel?: string;
}

const COLOR_MAP: Record<string, { ring: string; check: string; progress: string; bg: string; badge: string }> = {
    red:     { ring: 'ring-red-400',     check: 'text-red-500',     progress: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-900/20',     badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    green:   { ring: 'ring-green-400',   check: 'text-green-500',   progress: 'bg-green-500',   bg: 'bg-green-50 dark:bg-green-900/20', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    blue:    { ring: 'ring-blue-400',    check: 'text-blue-500',    progress: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    emerald: { ring: 'ring-emerald-400', check: 'text-emerald-500', progress: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    purple:  { ring: 'ring-purple-400',  check: 'text-purple-500',  progress: 'bg-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

const today = () => new Date().toISOString().slice(0, 10);

const HabitTracker: React.FC<HabitTrackerProps> = ({
    title,
    habits,
    storageKey,
    accentColor,
    completionLabel = 'Amazing! All habits done for today! 🎉',
}) => {
    const { addToast } = useToast();
    const { addPoints } = useGamification();
    const c = COLOR_MAP[accentColor] || COLOR_MAP.green;

    const fullKey = `${storageKey}_${today()}`;

    const [done, setDone] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(fullKey);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });
    const [celebrated, setCelebrated] = useState(false);

    useEffect(() => {
        localStorage.setItem(fullKey, JSON.stringify(Array.from(done)));
        if (done.size === habits.length && !celebrated) {
            setCelebrated(true);
            addPoints(30, title);
            addToast(completionLabel, 'success');
        }
    }, [done]);

    const toggle = (id: string) => {
        setDone(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const pct = Math.round((done.size / habits.length) * 100);

    return (
        <div className={`bento-card ${c.bg} border border-[var(--border)]`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[var(--foreground)]">{title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.badge}`}>
                    {done.size}/{habits.length} today
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[var(--border)] rounded-full mb-5">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${c.progress}`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            <ul className="space-y-2">
                {habits.map(habit => {
                    const checked = done.has(habit.id);
                    return (
                        <li key={habit.id}>
                            <button
                                onClick={() => toggle(habit.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                                    ${checked
                                        ? 'bg-[var(--card)] opacity-70'
                                        : 'bg-[var(--card)] hover:bg-[var(--secondary)]'
                                    }`}
                            >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${checked ? `${c.ring} ring-2` : 'border-[var(--border)]'}`}>
                                    {checked && <CheckCircleIcon className={`h-5 w-5 ${c.check}`} />}
                                </div>
                                <span className="text-lg">{habit.icon}</span>
                                <span className={`text-sm font-medium flex-1 ${checked ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>
                                    {habit.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {done.size === habits.length && (
                <p className="mt-4 text-center text-sm font-bold text-[var(--muted)] animate-fade-in">
                    ✅ All done — resets tomorrow!
                </p>
            )}
        </div>
    );
};

export default HabitTracker;
