import React, { useState } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';
import { MOCK_CULINARY_CHALLENGES } from '../../../constants';
import type { CulinaryChallenge } from '../../../types';
import { CheckCircleIcon } from '../Icons';

const CulinaryKitchen: React.FC = () => {
    const { addPoints } = useGamification();
    const [challenges, setChallenges] = useState<CulinaryChallenge[]>(MOCK_CULINARY_CHALLENGES);

    const handleCompleteChallenge = (challengeId: string, points: number) => {
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status: 'Completed' } : c));
        addPoints(points, `completing a culinary challenge`);
    };
    
    return (
         <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Welcome to the Culinary Kitchen!</h2>
                <p className="text-[var(--muted)]">Put your cooking knowledge to the test. Follow the recipes, make the right choices, and create delicious virtual dishes.</p>
            </section>
            <section>
                 <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Recipe Book</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {challenges.map(challenge => (
                         <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            onComplete={() => handleCompleteChallenge(challenge.id, challenge.rewardPoints)} 
                        />
                     ))}
                 </div>
            </section>
        </div>
    );
};

const ChallengeCard: React.FC<{ challenge: CulinaryChallenge, onComplete: () => void }> = ({ challenge, onComplete }) => {
    const { addToast } = useToast();
    const [isStarted, setIsStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(challenge.steps.length).fill(null));

    const handleSelectOption = (stepIndex: number, optionIndex: number) => {
        if (answers[stepIndex] !== null) return;

        const newAnswers = [...answers];
        newAnswers[stepIndex] = optionIndex;
        setAnswers(newAnswers);

        const isCorrect = optionIndex === challenge.steps[stepIndex].correctOptionIndex;
        if (isCorrect) {
            addToast('Correct!', 'success');
            if (currentStep < challenge.steps.length - 1) {
                setTimeout(() => setCurrentStep(prev => prev + 1), 1000);
            } else {
                 addToast('Challenge complete! Well done, Chef!', 'success');
                 onComplete();
            }
        } else {
            addToast('Not quite. Read the explanation to learn.', 'error');
        }
    };

    if (!isStarted) {
        return (
             <div className="bento-card">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-[var(--foreground)]">{challenge.title}</p>
                        <p className="text-sm text-[var(--muted)] mt-1">{challenge.description}</p>
                    </div>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full whitespace-nowrap">{challenge.rewardPoints} XP</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <span className="text-sm font-semibold">{challenge.difficulty}</span>
                    {challenge.status === 'Not Started' ? (
                        <button onClick={() => setIsStarted(true)} className="text-sm font-semibold bg-[var(--primary)] text-white px-4 py-1.5 rounded-full hover:opacity-90">
                            Start Challenge
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            Completed
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const step = challenge.steps[currentStep];
    const isAnswered = answers[currentStep] !== null;

    return (
        <div className="bento-card animate-fade-in-fast">
             <h4 className="font-bold text-lg text-[var(--primary)]">{challenge.title}</h4>
             <p className="text-sm font-semibold text-[var(--muted)] mb-4">Step {currentStep + 1} of {challenge.steps.length}</p>

             <p className="text-[var(--foreground)] mb-2">{step.instruction}</p>
             <p className="font-semibold text-[var(--foreground)] mb-3">{step.question}</p>

             <div className="space-y-2">
                {step.options.map((option, index) => {
                    const isCorrect = index === step.correctOptionIndex;
                    const isSelected = answers[currentStep] === index;
                    let buttonClass = 'w-full text-left p-2 rounded-md border text-sm transition-colors ';
                    if (isAnswered) {
                        if (isCorrect) buttonClass += 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700';
                        else if (isSelected) buttonClass += 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700';
                        else buttonClass += 'bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600 opacity-50';
                    } else {
                        buttonClass += 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--secondary)]';
                    }
                    return (
                        <button key={index} onClick={() => handleSelectOption(currentStep, index)} disabled={isAnswered} className={buttonClass}>
                            {option}
                        </button>
                    );
                })}
             </div>
              {isAnswered && (
                <div className="mt-3 p-2 rounded-md text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                    <strong>Explanation:</strong> {step.explanation}
                </div>
            )}
        </div>
    );
};


export default CulinaryKitchen;
