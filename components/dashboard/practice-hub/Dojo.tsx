import React, { useState } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';
import { MOCK_MARTIAL_ARTS_TECHNIQUES } from '../../../constants';
import type { MartialArtTechnique } from '../../../types';

const Dojo: React.FC = () => {
    return (
         <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Welcome to The Dojo!</h2>
                <p className="text-[var(--muted)]">Train your mind and body. Study the techniques, understand their purpose, and test your knowledge. Focus and discipline are key.</p>
            </section>
            <section>
                 <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Technique Library</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {MOCK_MARTIAL_ARTS_TECHNIQUES.map(tech => (
                         <TechniqueCard key={tech.id} technique={tech} />
                     ))}
                 </div>
            </section>
        </div>
    );
};

const TechniqueCard: React.FC<{ technique: MartialArtTechnique }> = ({ technique }) => {
    const { addPoints } = useGamification();
    const { addToast } = useToast();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const isAnswered = selectedOption !== null;

    const handleSelectOption = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
        
        const isCorrect = optionIndex === technique.quiz.correctOptionIndex;
        if (isCorrect) {
            addToast('Correct understanding!', 'success');
            addPoints(50, `mastering a ${technique.style} technique`);
        } else {
            addToast('Incorrect. Study the explanation.', 'error');
        }
    };
    
    return (
        <div className="bento-card space-y-3">
            <div>
                <p className="text-sm font-bold text-[var(--primary)]">{technique.style}</p>
                <h4 className="font-bold text-lg text-[var(--foreground)]">{technique.name}</h4>
                <p className="text-sm text-[var(--muted)] mt-1">{technique.description}</p>
            </div>
            <div className="pt-3 border-t border-[var(--border)]">
                <p className="font-semibold text-sm text-[var(--foreground)] mb-2">{technique.quiz.question}</p>
                <div className="space-y-2">
                    {technique.quiz.options.map((option, index) => {
                        const isCorrect = index === technique.quiz.correctOptionIndex;
                        const isSelected = selectedOption === index;
                        let buttonClass = 'w-full text-left p-2 rounded-md border text-sm transition-colors ';
                        if (isAnswered) {
                            if (isCorrect) buttonClass += 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700';
                            else if (isSelected) buttonClass += 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700';
                            else buttonClass += 'bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600 opacity-50';
                        } else {
                            buttonClass += 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--secondary)]';
                        }
                        return (
                             <button key={index} onClick={() => handleSelectOption(index)} disabled={isAnswered} className={buttonClass}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                {isAnswered && (
                     <div className="mt-3 p-2 rounded-md text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        <strong>Principle:</strong> {technique.quiz.explanation}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dojo;
