import React, { useState } from 'react';
import { ChevronDownIcon } from '../Icons';

interface DimensionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    tips?: string[];
}

const DimensionCard: React.FC<DimensionCardProps> = ({ icon, title, description, tips }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bento-card flex flex-col items-start text-left h-full transition-shadow hover:shadow-md">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-lg text-[var(--foreground)]">{title}</h3>
            <p className="text-sm text-[var(--muted)] mt-1 flex-grow">{description}</p>

            <button
                onClick={() => setExpanded(v => !v)}
                className="mt-4 flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline self-start text-sm"
            >
                {expanded ? 'Close' : 'Explore'}
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && tips && tips.length > 0 && (
                <div className="mt-3 w-full border-t border-[var(--border)] pt-3 animate-fade-in">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Quick Actions</p>
                    <ul className="space-y-2">
                        {tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                                <span className="text-[var(--primary)] font-bold flex-shrink-0 mt-0.5">→</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DimensionCard;
