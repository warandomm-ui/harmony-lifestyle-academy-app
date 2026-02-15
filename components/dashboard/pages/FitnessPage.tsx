import React from 'react';
import HealthSnapshotSection from '../sections/HealthSnapshotSection';
import SelfDefenseSection from '../sections/SelfDefenseSection';

const FitnessPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <HealthSnapshotSection />
      <SelfDefenseSection />
    </div>
  );
};

export default FitnessPage;