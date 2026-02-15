import React from 'react';
import EmotionTrackerSection from '../sections/EmotionTrackerSection';

const HealthPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <EmotionTrackerSection />
      <div className="bento-card mt-6">
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">More Mental Wellness Resources Coming Soon</h3>
        <p className="text-[var(--muted)]">We're working on bringing you guided meditations, stress management techniques, and more to support your emotional health journey.</p>
      </div>
    </div>
  );
};

export default HealthPage;
