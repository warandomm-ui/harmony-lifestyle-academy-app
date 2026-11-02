import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  className?: string;
}

// Shown wherever a list has no real data yet, instead of sample/placeholder records.
const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center text-center gap-2 p-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--secondary)]/30 ${className}`}
  >
    <span className="text-3xl" aria-hidden="true">{icon}</span>
    <p className="font-semibold text-[var(--foreground)]">{title}</p>
    {description && <p className="text-sm text-[var(--muted)] max-w-md">{description}</p>}
  </div>
);

export default EmptyState;
