
import React, { useState } from 'react';
import { LinkedInIcon, CheckBadgeIcon, SparklesIcon, SpinnerIcon, CheckCircleIcon } from '../Icons';
import type { Course } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';

interface LinkedInSyncSectionProps {
  completedCourses: Course[];
  skills: string[];
}

const LinkedInSyncSection: React.FC<LinkedInSyncSectionProps> = ({ completedCourses, skills }) => {
  const { addToast } = useToast();
  const [syncedItems, setSyncedItems] = useState<Set<string>>(new Set());
  const [syncingItems, setSyncingItems] = useState<Set<string>>(new Set());

  const handleSync = (id: string, name: string, type: 'Certification' | 'Skill') => {
    if (syncedItems.has(id)) return;

    setSyncingItems(prev => new Set(prev).add(id));

    // Simulate API call to LinkedIn
    setTimeout(() => {
      setSyncingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setSyncedItems(prev => new Set(prev).add(id));
      addToast(`${type} "${name}" added to your LinkedIn profile!`, 'success');
    }, 1500);
  };

  // Filter only completed courses (mocking 100% for demo if none exist, or using actual progress)
  // For demonstration, we'll treat courses > 80% as eligible for "Early Access Badge" or similar if not 100%
  const certsToSync = completedCourses.filter(c => c.progress >= 100);
  
  // Mocking a completed course if the user has none, just to show the UI
  const displayCerts = certsToSync.length > 0 ? certsToSync : [
    { title: 'Python for Beginners', subtitle: 'Completed', icon: '🐍', progress: 100 } // Mock for UI preview
  ];

  const displaySkills = skills.slice(0, 5); // Show top 5 skills

  return (
    <div className="bento-card bg-white dark:bg-[#1e293b] border border-[#0a66c2]/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <LinkedInIcon className="h-6 w-6 text-[#0a66c2]" />
          Professional Profile Sync
        </h2>
        <span className="px-3 py-1 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] text-xs font-bold">
            LinkedIn Integration
        </span>
      </div>

      <div className="space-y-6">
        {/* Certifications Section */}
        <div>
            <h3 className="text-sm font-bold uppercase text-[var(--muted)] mb-3 flex items-center gap-2">
                <CheckBadgeIcon className="h-4 w-4" /> Pending Certifications
            </h3>
            <div className="space-y-3">
                {displayCerts.map((cert, index) => {
                    const id = `cert-${index}`;
                    const isSynced = syncedItems.has(id);
                    const isSyncing = syncingItems.has(id);

                    return (
                        <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{cert.icon}</div>
                                <div>
                                    <p className="font-bold text-sm text-[var(--foreground)]">{cert.title}</p>
                                    <p className="text-xs text-[var(--muted)]">Harmony Academy Certified</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSync(id, cert.title, 'Certification')}
                                disabled={isSynced || isSyncing}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    isSynced 
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-[#0a66c2] text-white hover:bg-[#004182]'
                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isSyncing ? <SpinnerIcon className="h-3 w-3" /> : isSynced ? <CheckCircleIcon className="h-3 w-3" /> : <LinkedInIcon className="h-3 w-3 fill-current" />}
                                {isSyncing ? 'Syncing...' : isSynced ? 'Added to Profile' : 'Add to Profile'}
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
                    const isSyncing = syncingItems.has(id);

                    return (
                        <div key={id} className="flex items-center justify-between p-2 px-3 rounded-lg bg-[var(--secondary)]/30 border border-[var(--border)]">
                            <span className="text-sm font-medium text-[var(--foreground)]">{skill}</span>
                            <button
                                onClick={() => handleSync(id, skill, 'Skill')}
                                disabled={isSynced || isSyncing}
                                className={`p-1.5 rounded-full transition-colors ${
                                    isSynced 
                                    ? 'text-green-600 bg-green-100' 
                                    : 'text-[#0a66c2] hover:bg-[#0a66c2]/10'
                                }`}
                                title="Add to LinkedIn Skills"
                            >
                                {isSyncing ? <SpinnerIcon className="h-4 w-4" /> : isSynced ? <CheckCircleIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
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
