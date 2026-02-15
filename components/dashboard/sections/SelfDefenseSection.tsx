import React from 'react';
import { ShieldCheckIcon } from '../Icons';

const selfDefenseStyles = [
    {
        name: 'Silat',
        style: 'Southeast Asian Martial Art',
        description: 'A collective of indigenous martial arts from Southeast Asia, focusing on strikes, joint manipulation, and throws. Emphasizes fluid movement and adaptability.',
        icon: '🤺',
    },
    {
        name: 'Taekwondo',
        style: 'Korean Martial Art',
        description: 'Characterized by its emphasis on head-height kicks, jumping and spinning kicks, and fast kicking techniques. Great for flexibility and speed.',
        icon: '🥋',
    },
    {
        name: 'Basic Self-Defense',
        style: 'Practical Techniques',
        description: 'Learn simple, effective techniques for situational awareness, de-escalation, and defending against common attacks.',
        icon: '🚶‍♀️',
    },
];

const SelfDefenseSection: React.FC = () => {
    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="h-7 w-7 text-red-500" />
                Self-Defense Basics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selfDefenseStyles.map(style => (
                    <div key={style.name} className="bg-[var(--secondary)] rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-3">{style.icon}</div>
                        <h3 className="font-bold text-lg text-[var(--foreground)]">{style.name}</h3>
                        <p className="text-sm font-semibold text-[var(--primary)]">{style.style}</p>
                        <p className="text-sm text-[var(--muted)] mt-2">{style.description}</p>
                        <button className="mt-4 w-full bg-red-500/20 text-red-700 dark:text-red-300 font-bold py-2 px-4 rounded-full hover:bg-red-500/30 transition">
                            Learn More
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelfDefenseSection;