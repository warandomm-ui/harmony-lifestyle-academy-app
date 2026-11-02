import React, { useMemo } from 'react';
import { getReminderForDate, DailyReminderType } from '../../../constants/dailyReminders';

const LABELS: Record<DailyReminderType, { label: string; icon: string }> = {
    quran: { label: 'Ayat Hari Ini', icon: '📖' },
    hadith: { label: 'Hadis Hari Ini', icon: '🕌' },
    sunnah: { label: 'Satu Hari Satu Sunnah', icon: '🌙' },
};

// Daily Islamic reminder: a Quran verse, a hadith, or a sunnah to practise today.
const DailyQuote: React.FC = () => {
    const reminder = useMemo(() => getReminderForDate(new Date()), []);
    const { label, icon } = LABELS[reminder.type];

    return (
        <div className="mt-6 p-4 bg-gradient-to-tr from-[var(--secondary)] to-[var(--card)] rounded-2xl border border-[var(--border)] animate-fade-in-up">
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--primary)] mb-2">{label}</p>
                    <p className="font-medium text-[var(--foreground)] italic leading-relaxed">“{reminder.text}”</p>
                    <p className="text-right text-sm font-semibold text-[var(--muted)] mt-2">
                        {reminder.narrator ? `${reminder.narrator} · ` : ''}{reminder.source}
                    </p>
                    {reminder.practice && (
                        <p className="mt-3 text-sm text-[var(--foreground)] rounded-xl px-3 py-2 bg-[var(--primary)]/10 border border-[var(--border)]">
                            <span className="font-semibold">Amalan hari ini: </span>{reminder.practice}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyQuote;
