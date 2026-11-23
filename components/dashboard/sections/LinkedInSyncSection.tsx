
import React, { useState } from 'react';
import { LinkedInIcon, CheckBadgeIcon, SparklesIcon, CheckCircleIcon } from '../Icons';
import type { Course } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';

interface LinkedInSyncSectionProps {
  completedCourses: Course[];
  skills: string[];
}

const LinkedInSyncSection: React.FC<LinkedInSyncSectionProps> = ({ completedCourses, skills }) => {
  const { addToast } = useToast();
  const [syncedItems, setSyncedItems] = useState<Set<string>>(new Set());

  // There is no LinkedIn API integration: open LinkedIn's own "add to profile" page
  // so the user adds the item themselves, and never claim it was added for them.
  const handleSync = (id: string, name: string, type: 'Certification' | 'Skill') => {
    const url = type === 'Certification'
      ? `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(name)}&organizationName=${encodeURIComponent('Harmony Lifestyle Academy')}`
      : 'https://www.linkedin.com/in/me/details/skills/';
    window.open(url, '_blank', 'noopener,noreferrer');
    setSyncedItems(prev => new Set(prev).add(id));
    addToast(`LinkedIn opened — finish adding "${name}" there.`, 'info');
  };

  // Only real completed courses are shown — no mock certificates.
  const displayCerts = completedCourses.filter(c => c.progress >= 100);

  const displaySkills = skills.slice(0, 5); // Show top 5 skills

  return (
    <div className="bento-card bg-white dark:bg-[#1e293b] border border-[#0a66c2]/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <LinkedInIcon className="h-6 w-6 text-[#0a66c2]" />
          Add to LinkedIn
        </h2>
        <span className="px-3 py-1 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] text-xs font-bold">
            Opens LinkedIn
        </span>
      </div>

      <div className="space-y-6">
        {/* Certifications Section */}
        <div>
            <h3 className="text-sm font-bold uppercase text-[var(--muted)] mb-3 flex items-center gap-2">
                <CheckBadgeIcon className="h-4 w-4" /> Completed Courses
            </h3>
            <div className="space-y-3">
                {displayCerts.length === 0 && (
                    <p className="text-sm text-[var(--muted)]">Complete a course to add its certificate to LinkedIn.</p>
                )}
                {displayCerts.map((cert, index) => {
                    const id = `cert-${index}`;
                    const isSynced = syncedItems.has(id);

                    return (
                        <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{cert.icon}</div>
                                <div>
                                    <p className="font-bold text-sm text-[var(--foreground)]">{cert.title}</p>
                                    <p className="text-xs text-[var(--muted)]">Completed at Harmony Lifestyle Academy</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSync(id, cert.title, 'Certification')}
                                disabled={isSynced}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    isSynced 
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-[#0a66c2] text-white hover:bg-[#004182]'
                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isSynced ? <CheckCircleIcon className="h-3 w-3" /> : <LinkedInIcon className="h-3 w-3 fill-current" />}
                                {isSynced ? 'Opened in LinkedIn' : 'Add on LinkedIn'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Skills Section */}
        <div>
            <h3 className="text-sm font-bold uppercase text-[var(--muted)] mb-3 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" /> Acquired Skills
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displaySkills.map((skill, index) => {
                    const id = `skill-${index}`;
                    const isSynced = syncedItems.has(id);

                    return (
                        <div key={id} className="flex items-center justify-between p-2 px-3 rounded-lg bg-[var(--secondary)]/30 border border-[var(--border)]">
                            <span className="text-sm font-medium text-[var(--foreground)]">{skill}</span>
                            <button
                                onClick={() => handleSync(id, skill, 'Skill')}
                                disabled={isSynced}
                                className={`p-1.5 rounded-full transition-colors ${
                                    isSynced 
                                    ? 'text-green-600 bg-green-100' 
                                    : 'text-[#0a66c2] hover:bg-[#0a66c2]/10'
                                }`}
                                title="Add to LinkedIn Skills"
                            >
                                {isSynced ? <CheckCircleIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

// Small helper icon for the add button
const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

export default LinkedInSyncSection;
