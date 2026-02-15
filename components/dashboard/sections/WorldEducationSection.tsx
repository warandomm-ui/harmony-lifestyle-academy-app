import React from 'react';
import { GlobeAltIcon } from '../Icons';
import { MOCK_WORLD_EDUCATION_DATA } from '../../../constants';

const WorldEducationSection: React.FC = () => {
  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <GlobeAltIcon className="h-7 w-7 text-[var(--primary)]" />
        Top World Education Systems
      </h2>
      <div className="space-y-6">
        {MOCK_WORLD_EDUCATION_DATA.map((country, index) => (
          <div key={index} className="pb-4 last:pb-0 border-b last:border-b-0 border-[var(--border)]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flagEmoji}</span>
              <h3 className="text-lg font-bold text-[var(--foreground)]">{country.name}</h3>
            </div>
            <p className="text-[var(--muted)] mt-2">{country.summary}</p>
            
            {country.onlineStudySections && country.onlineStudySections.length > 0 && (
              <details className="group mt-3">
                <summary className="font-semibold text-[var(--primary)] cursor-pointer list-none flex items-center gap-2 hover:opacity-80">
                  <span>Online Study Opportunities</span>
                  <svg className="h-4 w-4 transform transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <ul className="list-disc list-inside text-sm text-[var(--muted)] mt-2 space-y-1 pl-2">
                  {country.onlineStudySections.map((section, secIndex) => (
                    <li key={secIndex}>
                      <a href={section.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline dark:text-blue-400">
                        {section.name}
                      </a>: {section.description}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldEducationSection;