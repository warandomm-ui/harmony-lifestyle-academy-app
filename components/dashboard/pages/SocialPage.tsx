import React from 'react';
import CommunityHighlightsSection from '../CommunityHighlightsSection';
import ChatGroupsSection from '../sections/ChatGroupsSection';
import { HeartIcon } from '../Icons';

const VolunteeringSection: React.FC = () => {
  const opportunities = [
    {
      title: 'Tutor for Underprivileged Kids',
      org: 'Teach for Malaysia',
      commitment: '2 hours/week',
      type: 'Online'
    },
    {
      title: 'Weekend Beach Cleanup',
      org: 'Local Environmental Group',
      commitment: '4 hours/weekend',
      type: 'In-Person'
    },
    {
      title: 'Community Soup Kitchen',
      org: 'Kechara Soup Kitchen',
      commitment: 'Flexible',
      type: 'In-Person'
    },
  ];

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Volunteering Opportunities</h2>
      <div className="space-y-4">
        {opportunities.map(op => (
          <div key={op.title} className="bg-[var(--secondary)]/50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold text-[var(--foreground)]">{op.title}</p>
              <p className="text-sm text-[var(--muted)]">{op.org}</p>
              <div className="flex items-center gap-4 text-xs mt-1 text-[var(--muted-foreground)]">
                <span>{op.commitment}</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${op.type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{op.type}</span>
              </div>
            </div>
            <button className="font-semibold text-sm bg-[var(--primary)] text-white px-4 py-1.5 rounded-full hover:opacity-90">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


const SocialPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <CommunityHighlightsSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatGroupsSection />
        <VolunteeringSection />
      </div>
    </div>
  );
};

export default SocialPage;