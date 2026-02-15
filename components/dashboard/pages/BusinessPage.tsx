
import React from 'react';
import { TrendingUpIcon, DocumentTextIcon, LightBulbIcon } from '../Icons';
import type { AnalysisResult } from '../../../types';
import CareerPathCard from '../../CareerPathCard';
import ProductManagerSection from '../sections/ProductManagerSection';

interface BusinessPageProps {
  userResults: AnalysisResult;
}

const BusinessPage: React.FC<BusinessPageProps> = ({ userResults }) => {
  const topCareers = userResults.careerRecommendations.slice(0, 3);

  const toolkitItems = [
    { title: 'Business Plan Template', icon: <DocumentTextIcon className="h-8 w-8 text-blue-500" /> },
    { title: 'Market Research Guide', icon: <TrendingUpIcon className="h-8 w-8 text-green-500" /> },
    { title: 'Startup Pitch Deck', icon: <LightBulbIcon className="h-8 w-8 text-yellow-500" /> },
  ];

  return (
    <div className="space-y-8">
        <section className="bento-card text-center">
            <TrendingUpIcon className="h-12 w-12 text-[var(--primary)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Your Business & Career Hub</h2>
            <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                Explore career paths tailored to your personality, or get the tools to build your own venture. Your professional journey starts here.
            </p>
        </section>

        <ProductManagerSection />

        <section>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">⭐ Career Spotlight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topCareers.map(career => (
                    <CareerPathCard
                        key={career.name}
                        career={career}
                        isSelected={false} // Not for selection, just display
                        onSelect={() => {}} // No-op
                        isTopPick={true}
                        personalityType={userResults.personalityType}
                    />
                ))}
            </div>
        </section>

        <section>
             <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">🚀 Entrepreneur's Toolkit</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {toolkitItems.map(item => (
                    <div key={item.title} className="bento-card flex flex-col items-center text-center">
                        <div className="mb-4">{item.icon}</div>
                        <h4 className="font-bold text-lg text-[var(--foreground)]">{item.title}</h4>
                        <button className="mt-4 w-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold py-2 px-4 rounded-full hover:bg-[var(--primary)]/20 transition">
                            Download
                        </button>
                    </div>
                ))}
            </div>
        </section>
    </div>
  );
};

export default BusinessPage;
