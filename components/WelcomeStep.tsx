import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { GitHubIcon, GoogleIcon } from './dashboard/Icons';

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
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeatureIndex(prevIndex => (prevIndex + 1) % features.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(timer);
  }, []);
  
  const handleLogin = (provider: string) => {
    addToast(`${provider} login feature is coming soon!`, 'info');
  };

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
        Sign in to continue your journey, or start fresh to discover your main character energy.
      </p>

      <div className="mt-8 w-full max-w-xs mx-auto space-y-3">
        <button
            onClick={() => handleLogin('GitHub')}
            className="w-full h-12 px-6 inline-flex items-center justify-center gap-4 text-md font-bold text-white bg-[#24292F] dark:bg-[#24292F] rounded-full hover:bg-opacity-90 transition-colors duration-300"
        >
            <GitHubIcon className="h-6 w-6" />
            <span>Sign in with GitHub</span>
        </button>
         <button
            onClick={() => handleLogin('Google')}
            className="w-full h-12 px-6 inline-flex items-center justify-center gap-4 text-md font-bold text-[#1f1f1f] bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors duration-300"
        >
            <GoogleIcon className="h-6 w-6" />
            <span>Sign in with Google</span>
        </button>
      </div>
      
      <div className="my-6 flex items-center max-w-xs mx-auto">
        <div className="flex-grow border-t border-[var(--border)]"></div>
        <span className="flex-shrink mx-4 text-sm font-semibold text-[var(--muted)]">OR</span>
        <div className="flex-grow border-t border-[var(--border)]"></div>
      </div>

      <button
        onClick={onStart}
        className="bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 px-8 rounded-full hover:opacity-90 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/50"
      >
        Find My Vibe
      </button>
    </div>
  );
};

export default WelcomeStep;