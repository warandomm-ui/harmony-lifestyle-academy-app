import React, { useState, useEffect } from 'react';
import { DAILY_QUOTES } from '../../../constants';
import { LightBulbIcon } from '../Icons';

const DailyQuote: React.FC = () => {
    const [quote, setQuote] = useState({ quote: '', author: '' });

    useEffect(() => {
        const getDayOfYear = (date: Date) => {
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        };

        const today = new Date();
        const dayOfYear = getDayOfYear(today);
        const quoteIndex = dayOfYear % DAILY_QUOTES.length;
        setQuote(DAILY_QUOTES[quoteIndex]);
    }, []);

    return (
        <div className="mt-6 p-4 bg-gradient-to-tr from-[var(--secondary)] to-[var(--card)] rounded-2xl border border-[var(--border)] animate-fade-in-up">
            <div className="flex items-start gap-3">
                <LightBulbIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                    <p className="font-medium text-[var(--foreground)] italic">"{quote.quote}"</p>
                    <p className="text-right text-sm font-semibold text-[var(--muted)] mt-2">— {quote.author}</p>
                </div>
            </div>
        </div>
    );
};

export default DailyQuote;
