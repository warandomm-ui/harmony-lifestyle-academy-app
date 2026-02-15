import React, { useState } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';
import { MOCK_AI_PROJECTS } from '../../../constants';
import type { AIProject } from '../../../types';
import { CheckCircleIcon } from '../Icons';

const AIRoboticsLab: React.FC = () => {
    const { addPoints } = useGamification();
    const [projects, setProjects] = useState<AIProject[]>(MOCK_AI_PROJECTS);

    const handleCompleteProject = (projectId: string, points: number) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Completed' } : p));
        addPoints(points, `completing an AI project`);
    };
    
    return (
         <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Welcome to the AI & Robotics Lab!</h2>
                <p className="text-[var(--muted)]">Apply your coding and analytical skills to solve challenges in machine learning and robotics. Let's build the future!</p>
            </section>
            <section>
                 <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Project Board</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {projects.map(project => (
                         <ProjectCard 
                            key={project.id} 
                            project={project} 
                            onComplete={() => handleCompleteProject(project.id, project.rewardPoints)} 
                        />
                     ))}
                 </div>
            </section>
        </div>
    );
};

const ProjectCard: React.FC<{ project: AIProject, onComplete: () => void }> = ({ project, onComplete }) => {
    const { addToast } = useToast();
    const [isStarted, setIsStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(project.steps.length).fill(null));

    const handleSelectOption = (stepIndex: number, optionIndex: number) => {
        if (answers[stepIndex] !== null) return;

        const newAnswers = [...answers];
        newAnswers[stepIndex] = optionIndex;
        setAnswers(newAnswers);

        const isCorrect = optionIndex === project.steps[stepIndex].correctOptionIndex;
        if (isCorrect) {
            addToast('Correct logic!', 'success');
            if (currentStep < project.steps.length - 1) {
                setTimeout(() => setCurrentStep(prev => prev + 1), 1000);
            } else {
                 addToast('Project completed successfully!', 'success');
                 onComplete();
            }
        } else {
            addToast('That\'s not the right approach. See the explanation.', 'error');
        }
    };

    if (!isStarted) {
        return (
             <div className="bento-card">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-[var(--foreground)]">{project.title}</p>
                        <p className="text-sm text-[var(--muted)] mt-1">{project.description}</p>
                    </div>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full whitespace-nowrap">{project.rewardPoints} XP</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <span className="text-sm font-semibold">{project.difficulty}</span>
                    {project.status === 'Not Started' ? (
                        <button onClick={() => setIsStarted(true)} className="text-sm font-semibold bg-[var(--primary)] text-white px-4 py-1.5 rounded-full hover:opacity-90">
                            Start Project
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

    const step = project.steps[currentStep];
    const isAnswered = answers[currentStep] !== null;

    return (
        <div className="bento-card animate-fade-in-fast">
             <h4 className="font-bold text-lg text-[var(--primary)]">{project.title}</h4>
             <p className="text-sm font-semibold text-[var(--muted)] mb-4">Step {currentStep + 1} of {project.steps.length}</p>

             <p className="text-[var(--foreground)] mb-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-md font-mono text-sm">{step.instruction}</p>
             <p className="font-semibold text-[var(--foreground)] mb-3">{step.question}</p>

             <div className="space-y-2">
                {step.options.map((option, index) => {
                    const isCorrect = index === step.correctOptionIndex;
                    const isSelected = answers[currentStep] === index;
                    let buttonClass = 'w-full text-left p-2 rounded-md border text-sm transition-colors font-mono ';
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

export default AIRoboticsLab;
