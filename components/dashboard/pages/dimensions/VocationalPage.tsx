import React from 'react';
import DimensionCard from '../../shared/DimensionCard';
import AffiliateSection from '../../sections/AffiliateSection';
import { BriefcaseIcon } from '../../Icons';

const vocationalTopics = [
    {
        icon: '🧭', title: 'Career Exploration',
        description: 'Discover career paths that align with your personality, interests, and skills.',
        tips: [
            'Take the Harmony Personality Assessment and review your career matches.',
            'Shadow or interview one professional in a field you\'re curious about.',
            'List your top 5 activities you\'d do for free — your career often lives there.',
        ],
    },
    {
        icon: '🛠️', title: 'Skill Development',
        description: 'Identify and learn the skills you need for your desired career, from technical to soft skills.',
        tips: [
            'Find the top 3 skills listed in job postings for your dream role.',
            'Dedicate 30 minutes daily to building one specific skill this month.',
            'Build a portfolio — even simple projects prove competence to employers.',
        ],
    },
    {
        icon: '⚖️', title: 'Work-Life Balance',
        description: 'Learn strategies to manage your time and energy between your studies, work, and personal life.',
        tips: [
            'Time-block your calendar: work, study, rest, and fun each get a slot.',
            'Learn to say no to requests that don\'t align with your top priorities.',
            'Take a genuine break — phone away, outside, for at least 20 minutes a day.',
        ],
    },
    {
        icon: '💰', title: 'Financial Literacy',
        description: 'Master the basics of budgeting, saving, and investing to build a secure financial future.',
        tips: [
            'Track every ringgit you spend for 2 weeks to find your money leaks.',
            'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
            'Open a savings account and automate a fixed transfer every payday.',
        ],
    },
    {
        icon: '🚀', title: 'Entrepreneurship',
        description: 'Explore what it takes to start your own business or develop a side hustle for extra income.',
        tips: [
            'Identify one problem in your daily life that you could solve for others.',
            'Start small: sell a product or service to 3 people before building a business plan.',
            'Read or listen to one entrepreneur\'s story this week for inspiration.',
        ],
    },
];

const VocationalPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bento-card text-center bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50">
                <BriefcaseIcon className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Vocational Wellness</h2>
                <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                    Finding satisfaction and enrichment from your work and studies is crucial. This dimension focuses on your career path, skill development, and financial health.
                </p>
            </div>

            {/* Affiliate & Revenue Engine */}
            <AffiliateSection />

            <section>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Vocational Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vocationalTopics.map(topic => (
                        <DimensionCard key={topic.title} {...topic} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default VocationalPage;
