import React, { useState, useEffect } from 'react';

interface WelcomeStepProps {
  onStart: () => void;
}

const features = [
  { icon: '🧠', text: 'Discover your unique personality.' },
  { icon: '🚀', text: 'Explore tailored career paths.' },
  { icon: '💻', text: 'Build in-demand skills for the future.' },
  { icon: '🤝', text: 'Connect with a supportive community.' },
];

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeatureIndex(prevIndex => (prevIndex + 1) % features.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-center animate-fade-in">
      <div className="h-28 mb-4 flex flex-col items-center justify-center">
        <div key={currentFeatureIndex} className="text-center animate-feature-cycle">
          <div className="text-5xl mb-2">{features[currentFeatureIndex].icon}</div>
          <p className="text-base text-[var(--muted)] font-medium">{features[currentFeatureIndex].text}</p>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">hey! welcome to your glow up.</h2>
      <p className="text-[var(--muted)] mt-4 text-base md:text-lg max-w-md mx-auto">
        Answer a few quick questions so we can discover your main character energy and build a plan that fits you.
      </p>
      <ul className="mt-6 text-sm text-[var(--muted)] max-w-xs mx-auto space-y-1">
        <li>✅ About 5–10 minutes</li>
        <li>✅ No right or wrong answers</li>
        <li>✅ You can skip any step and come back later</li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 px-8 rounded-full hover:opacity-90 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/50"
      >
        Find My Vibe
      </button>
    </div>
  );
};

export default WelcomeStep;