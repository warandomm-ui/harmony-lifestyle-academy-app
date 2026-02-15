import React from 'react';

interface ProgressBarProps {
    label: string;
    percentage: number;
    value?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, percentage, value }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
            <span className="text-sm font-medium text-[var(--muted)]">
                {value !== undefined ? value : `${Math.round(percentage)}%`}
            </span>
        </div>
        <div className="w-full bg-[var(--border)] rounded-full h-2.5">
            <div className="bg-[var(--primary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);