import React, { useState } from 'react';
import { ShieldCheckIcon, AcademicCapIcon } from '../Icons';
import CybersecurityOps from '../practice-hub/CybersecurityOps';
import CulinaryKitchen from '../practice-hub/CulinaryKitchen';
import AIRoboticsLab from '../practice-hub/AIRoboticsLab';
import Dojo from '../practice-hub/Dojo';

type PracticeHubView = 'cyber' | 'culinary' | 'ai' | 'martial-arts';

const PracticeHubPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PracticeHubView>('cyber');

    const tabs: { id: PracticeHubView; label: string; icon: React.ReactNode }[] = [
        { id: 'cyber', label: 'Cybersecurity Ops', icon: <ShieldCheckIcon className="h-5 w-5" /> },
        { id: 'culinary', label: 'Culinary Kitchen', icon: <span className="text-xl">🍳</span> },
        { id: 'ai', label: 'AI & Robotics Lab', icon: <span className="text-xl">🤖</span> },
        { id: 'martial-arts', label: 'The Dojo', icon: <span className="text-xl">🥋</span> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'cyber':
                return <CybersecurityOps />;
            case 'culinary':
                return <CulinaryKitchen />;
            case 'ai':
                return <AIRoboticsLab />;
             case 'martial-arts':
                return <Dojo />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-[var(--primary)] text-[var(--primary)]'
                                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            
            <div className="animate-fade-in-fast">
                {renderContent()}
            </div>
        </div>
    );
};

export default PracticeHubPage;
