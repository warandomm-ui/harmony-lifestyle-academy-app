import React, { useState } from 'react';
import { ShieldCheckIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon } from '../Icons';
import { MOCK_SECURITY_ALERTS, MOCK_CYBERSECURITY_CHALLENGES } from '../../../constants';
import type { SecurityAlert, CybersecurityChallenge, AlertSeverity } from '../../../types';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';

// --- Stat Card Component ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bento-card flex items-center gap-4">
        <div className="p-3 bg-[var(--primary)]/10 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
        </div>
    </div>
);

// --- Alert Card Component ---
const AlertCard: React.FC<{ alert: SecurityAlert; onResolve: (points: number) => void; }> = ({ alert, onResolve }) => {
    const { addToast } = useToast();
    const [isInvestigating, setIsInvestigating] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    
    const severityStyles: Record<AlertSeverity, { bg: string; text: string; ring: string }> = {
        Low: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300', ring: 'ring-blue-500' },
        Medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', ring: 'ring-yellow-500' },
        High: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-300', ring: 'ring-orange-500' },
        Critical: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', ring: 'ring-red-500' },
    };

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === alert.resolutionSteps!.correctOptionIndex) {
            addToast('Correct action taken! Incident resolved.', 'success');
            onResolve(50); // Award 50 points for resolving
        } else {
            addToast('Incorrect action. Review the explanation to learn more.', 'error');
        }
    };

    return (
        <div className={`p-4 rounded-lg transition-all duration-300 ${isInvestigating ? `ring-2 ${severityStyles[alert.severity].ring}` : ''} ${severityStyles[alert.severity].bg}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityStyles[alert.severity].bg} ${severityStyles[alert.severity].text}`}>{alert.severity}</span>
                        <h4 className="font-bold text-[var(--foreground)]">{alert.title}</h4>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">{alert.timestamp}</p>
                </div>
                {alert.status === 'Open' && !isInvestigating && (
                    <button onClick={() => setIsInvestigating(true)} className="flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline">
                        <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                        Investigate
                    </button>
                )}
                {alert.status === 'Resolved' && (
                     <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        Resolved
                    </div>
                )}
            </div>
            
            <p className="text-sm text-[var(--muted)] mt-2">{alert.description}</p>
            
            {isInvestigating && alert.resolutionSteps && (
                <div className="mt-4 pt-4 border-t border-[var(--primary)]/20 animate-fade-in-fast">
                    <p className="font-semibold text-sm text-[var(--foreground)] mb-2">{alert.resolutionSteps.question}</p>
                    <div className="space-y-2">
                        {alert.resolutionSteps.options.map((option, index) => {
                            const isCorrect = index === alert.resolutionSteps!.correctOptionIndex;
                            const isSelected = selectedOption === index;
                            
                            let buttonClass = 'w-full text-left p-2 rounded-md border text-sm transition-colors ';
                            if (isAnswered) {
                                if (isCorrect) {
                                    buttonClass += 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700 text-green-800 dark:text-green-300';
                                } else if (isSelected) {
                                     buttonClass += 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700 text-red-800 dark:text-red-300';
                                } else {
                                     buttonClass += 'bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-500';
                                }
                            } else {
                                buttonClass += 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--secondary)]';
                            }
                            
                            return (
                                <button key={index} onClick={() => handleOptionSelect(index)} disabled={isAnswered} className={buttonClass}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                    {isAnswered && (
                        <div className={`mt-3 p-2 rounded-md text-sm ${selectedOption === alert.resolutionSteps.correctOptionIndex ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                            <strong>Explanation:</strong> {alert.resolutionSteps.explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const CybersecurityOps: React.FC = () => {
    const { addPoints } = useGamification();
    const [alerts, setAlerts] = useState<SecurityAlert[]>(MOCK_SECURITY_ALERTS);
    const [challenges, setChallenges] = useState<CybersecurityChallenge[]>(MOCK_CYBERSECURITY_CHALLENGES);

    const handleResolveAlert = (alertId: string, points: number) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a));
        addPoints(points, 'resolving a security alert');
    };

    const handleCompleteChallenge = (challengeId: string, points: number) => {
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status: 'Completed' } : c));
        addPoints(points, `completing a ${challenges.find(c=>c.id === challengeId)?.difficulty} challenge`);
    };

    const openAlerts = alerts.filter(a => a.status === 'Open').length;
    const resolvedToday = alerts.filter(a => a.status === 'Resolved').length; // Mock, should be date-based

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Welcome, Cybersecurity Analyst!</h2>
                <p className="text-[var(--muted)]">The platform's security is in your hands. Analyze alerts and tackle challenges to keep Harmony safe.</p>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Open Alerts" value={openAlerts.toString()} icon={<ShieldCheckIcon className="h-6 w-6 text-[var(--primary)]" />} />
                <StatCard title="Incidents Resolved (Today)" value={resolvedToday.toString()} icon={<CheckCircleIcon className="h-6 w-6 text-[var(--primary)]" />} />
                <StatCard title="Current Threat Level" value="Low" icon={<ChevronDownIcon className="h-6 w-6 text-green-500" />} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Security Alerts Feed */}
                <section>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Live Security Feed</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {alerts.map(alert => (
                           <AlertCard key={alert.id} alert={alert} onResolve={(points) => handleResolveAlert(alert.id, points)} />
                        ))}
                    </div>
                </section>
                
                {/* Bounty Board */}
                <section>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Challenge & Bounty Board</h3>
                     <div className="space-y-4">
                        {challenges.map(challenge => (
                            <div key={challenge.id} className="bento-card">
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
                                        <button onClick={() => handleCompleteChallenge(challenge.id, challenge.rewardPoints)} className="text-sm font-semibold bg-[var(--primary)] text-white px-4 py-1.5 rounded-full hover:opacity-90">
                                            Complete
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CybersecurityOps;
