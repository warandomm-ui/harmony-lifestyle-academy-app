import React, { useState } from 'react';
import type { LifeVision } from '../types';
import { useToast } from '../contexts/ToastContext';
import * as Icons from './dashboard/Icons';

interface LifeGoalsStepProps {
  onComplete: (vision: LifeVision) => void;
  onSkip: () => void;
}

const LifeGoalsStep: React.FC<LifeGoalsStepProps> = ({ onComplete, onSkip }) => {
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');
    const [goals, setGoals] = useState({
        wisdomGoal: '',
        knowledgeGoal: '',
        careerFinanceGoal: '',
        healthFitnessGoal: '',
        socialCommGoal: ''
    });

    const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGoals(prev => ({...prev, [name]: value}));
    };
    
    const canContinue = vision.trim() !== '' && mission.trim() !== '';

    const handleSubmit = () => {
        onComplete({
            vision,
            mission,
            ...goals
        });
    };

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Define Your Life's Compass</h2>
            <p className="text-[var(--muted)] mt-2">Let's set your vision, mission, and goals. This will guide your journey.</p>

            <div className="mt-8 text-left space-y-6">
                 {/* Vision and Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="font-bold text-lg text-[var(--foreground)]">My Vision</label>
                        <p className="text-xs text-[var(--muted)] mb-2">The future you dream of creating.</p>
                        <textarea
                            value={vision}
                            onChange={(e) => setVision(e.target.value)}
                            rows={4}
                            className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="e.g., To live a life of creativity, learning, and positive impact on my community."
                        />
                    </div>
                     <div>
                        <label className="font-bold text-lg text-[var(--foreground)]">My Mission</label>
                        <p className="text-xs text-[var(--muted)] mb-2">Your purpose and how you'll achieve your vision.</p>
                        <textarea
                            value={mission}
                            onChange={(e) => setMission(e.target.value)}
                            rows={4}
                            className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="e.g., To use my skills in technology and art to build tools that help people connect and learn."
                        />
                    </div>
                </div>

                {/* Goal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <GoalInputCard 
                        name="wisdomGoal" 
                        value={goals.wisdomGoal} 
                        onChange={handleGoalChange}
                        icon={<Icons.SparklesIcon />} 
                        title="Wisdom (Soul)" 
                        placeholder="e.g., Practice mindfulness for 10 mins daily."
                    />
                    <GoalInputCard 
                        name="knowledgeGoal" 
                        value={goals.knowledgeGoal} 
                        onChange={handleGoalChange}
                        icon={<Icons.AcademicCapIcon />} 
                        title="Knowledge (Mind)" 
                        placeholder="e.g., Achieve straight A's in SPM."
                    />
                    <GoalInputCard 
                        name="careerFinanceGoal" 
                        value={goals.careerFinanceGoal} 
                        onChange={handleGoalChange}
                        icon={<Icons.CashIcon />} 
                        title="Career & Finance (Desire)" 
                        placeholder="e.g., Save RM 1,000 by year-end."
                    />
                     <GoalInputCard 
                        name="healthFitnessGoal" 
                        value={goals.healthFitnessGoal} 
                        onChange={handleGoalChange}
                        icon={<Icons.HeartIcon />} 
                        title="Health & Fitness (Heart)" 
                        placeholder="e.g., Run a 5k race this year."
                    />
                     <GoalInputCard 
                        name="socialCommGoal" 
                        value={goals.socialCommGoal} 
                        onChange={handleGoalChange}
                        icon={<Icons.UsersIcon />} 
                        title="Social & Communication (Body)" 
                        placeholder="e.g., Volunteer 10 hours a month."
                    />
                </div>
            </div>

            <div className="text-center mt-10 pt-6 border-t dark:border-gray-700 flex items-center justify-center gap-6">
                <button type="button" onClick={onSkip} className="text-gray-500 dark:text-gray-400 font-medium hover:underline focus:outline-none">
                    Skip for now
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!canContinue}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};


interface GoalInputCardProps {
    // FIX: Replaced the undefined 'LifeGoalsStepState' type with a derived type from 'LifeVision' to ensure the 'name' prop is correctly typed as one of the goal keys.
    name: keyof Omit<LifeVision, 'vision' | 'mission'>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    icon: React.ReactNode;
    title: string;
    placeholder: string;
}

const GoalInputCard: React.FC<GoalInputCardProps> = ({ name, value, onChange, icon, title, placeholder }) => (
    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] flex flex-col">
        <div className="flex items-center gap-2 mb-2">
            <div className="text-[var(--primary)]">{icon}</div>
            <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
        </div>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={3}
            className="w-full text-sm rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] p-2 flex-grow"
            placeholder={placeholder}
        />
    </div>
);


export default LifeGoalsStep;