import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import * as Icons from '../Icons';
import type { LifeVision } from '../../../types';

interface LifeVisionSectionProps {
    initialData: LifeVision;
}

const LifeVisionSection: React.FC<LifeVisionSectionProps> = ({ initialData }) => {
    const { addToast } = useToast();
    const [vision, setVision] = useState(initialData.vision);
    const [mission, setMission] = useState(initialData.mission);
    const [goals, setGoals] = useState({
        wisdomGoal: initialData.wisdomGoal,
        knowledgeGoal: initialData.knowledgeGoal,
        careerFinanceGoal: initialData.careerFinanceGoal,
        healthFitnessGoal: initialData.healthFitnessGoal,
        socialCommGoal: initialData.socialCommGoal
    });
    
    // Update state if initialData prop changes (e.g., on first load after onboarding)
    useEffect(() => {
        setVision(initialData.vision);
        setMission(initialData.mission);
        setGoals({
            wisdomGoal: initialData.wisdomGoal,
            knowledgeGoal: initialData.knowledgeGoal,
            careerFinanceGoal: initialData.careerFinanceGoal,
            healthFitnessGoal: initialData.healthFitnessGoal,
            socialCommGoal: initialData.socialCommGoal
        });
    }, [initialData]);

    const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGoals(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (field: string) => {
        addToast(`${field} saved!`, 'success');
        // In a real app, you'd save this to a database.
        // For this demo, we can save to localStorage.
        localStorage.setItem('lifeVisionData', JSON.stringify({ vision, mission, ...goals }));
    };

    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Icons.SparklesIcon className="h-7 w-7 text-[var(--primary)]" />
                Your Life Vision & Mission
            </h2>

            <div className="space-y-6">
                {/* Vision and Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="font-bold text-lg text-[var(--foreground)]">My Vision</label>
                        <textarea
                            value={vision}
                            onChange={(e) => setVision(e.target.value)}
                            onBlur={() => handleSave('Vision')}
                            rows={4}
                            className="w-full mt-2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="What is the ultimate future you want to create for yourself?"
                        />
                    </div>
                     <div>
                        <label className="font-bold text-lg text-[var(--foreground)]">My Mission</label>
                        <textarea
                            value={mission}
                            onChange={(e) => setMission(e.target.value)}
                            onBlur={() => handleSave('Mission')}
                            rows={4}
                            className="w-full mt-2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="How will you act and what will you do to make your vision a reality?"
                        />
                    </div>
                </div>

                {/* Goal Cards */}
                <div className="pt-6 border-t border-[var(--border)]">
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Your Life Goals</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <GoalCard 
                            name="wisdomGoal"
                            value={goals.wisdomGoal}
                            onChange={handleGoalChange}
                            onSave={() => handleSave('Wisdom Goal')}
                            icon={<Icons.SparklesIcon />} 
                            title="Wisdom (Soul)"
                            placeholder="e.g., Practice mindfulness for 10 mins daily."
                        />
                        <GoalCard 
                            name="knowledgeGoal"
                            value={goals.knowledgeGoal}
                            onChange={handleGoalChange}
                            onSave={() => handleSave('Knowledge Goal')}
                            icon={<Icons.AcademicCapIcon />} 
                            title="Knowledge (Mind)"
                            placeholder="e.g., Achieve straight A's in SPM."
                        />
                         <GoalCard 
                            name="careerFinanceGoal"
                            value={goals.careerFinanceGoal}
                            onChange={handleGoalChange}
                            onSave={() => handleSave('Career & Finance Goal')}
                            icon={<Icons.CashIcon />} 
                            title="Career & Finance (Desire)"
                            placeholder="e.g., Save RM 1,000 by year-end."
                        />
                         <GoalCard 
                            name="healthFitnessGoal"
                            value={goals.healthFitnessGoal}
                            onChange={handleGoalChange}
                            onSave={() => handleSave('Health & Fitness Goal')}
                            icon={<Icons.HeartIcon />} 
                            title="Health & Fitness (Heart)"
                            placeholder="e.g., Run a 5k race this year."
                        />
                        <GoalCard 
                            name="socialCommGoal"
                            value={goals.socialCommGoal}
                            onChange={handleGoalChange}
                            onSave={() => handleSave('Social & Communication Goal')}
                            icon={<Icons.UsersIcon />} 
                            title="Social & Communication (Body)"
                            placeholder="e.g., Volunteer 10 hours a month."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface GoalCardProps {
    // FIX: Corrected the type for the 'name' prop to be a specific string literal union derived from the LifeVision type. The previous type was too broad (string | number | symbol), which is not assignable to the 'name' attribute of a textarea element.
    name: keyof Omit<LifeVision, 'vision' | 'mission'>; // Gets keys from goals state
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSave: () => void;
    icon: React.ReactNode;
    title: string;
    placeholder: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ name, value, onChange, onSave, icon, title, placeholder }) => (
    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] flex flex-col">
        <div className="flex items-center gap-2 mb-2">
            <div className="text-[var(--primary)]">{icon}</div>
            <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
        </div>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onSave}
            rows={3}
            className="w-full text-sm rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] p-2 flex-grow"
            placeholder={placeholder}
        />
    </div>
);


export default LifeVisionSection;