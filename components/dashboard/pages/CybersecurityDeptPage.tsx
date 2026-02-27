
import React from 'react';
import { ShieldCheckIcon } from '../Icons';

const CybersecurityDeptPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bento-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheckIcon className="h-16 w-16 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">Cybersecurity Department</h2>
        <p className="text-[var(--muted)] max-w-md mx-auto">
          Learn to protect systems, networks, and programs from digital attacks. This department is coming soon with full course content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Network Security', 'Ethical Hacking', 'Digital Forensics'].map((topic) => (
          <div key={topic} className="bento-card p-6">
            <h3 className="font-bold text-[var(--foreground)] mb-2">{topic}</h3>
            <p className="text-sm text-[var(--muted)]">Coming soon — stay tuned for exciting content in this area.</p>
            <div className="mt-4">
              <span className="inline-block px-3 py-1 text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CybersecurityDeptPage;
