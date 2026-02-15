import React from 'react';
import { MOCK_SOCIAL_PROJECTS } from '../../../../constants';
import type { SocialImpactProject } from '../../../../types';
import { LightBulbIcon, UsersIcon, GlobeAltIcon, CashIcon } from '../../Icons';

// --- Project Card Component ---
const ProjectCard: React.FC<{ project: SocialImpactProject }> = ({ project }) => {
    const statusStyles: { [key in typeof project.status]: string } = {
        Open: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <div className="bento-card flex flex-col h-full">
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{project.impactArea}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[project.status]}`}>{project.status}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{project.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{project.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4" />
                        <span>{project.teamSize}</span>
                    </div>
                    {project.incomePotential && (
                        <div className="flex items-center gap-2 font-semibold text-green-600">
                            <CashIcon className="h-4 w-4" />
                            <span>Income Opportunity</span>
                        </div>
                    )}
                </div>
                <button className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105">
                    View Project & Join
                </button>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const SocialImpactProjectsPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <section className="bento-card text-center bg-gradient-to-br from-purple-50 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50">
                <GlobeAltIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Make a Real-World Impact</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-3xl mx-auto">
                    Turn your skills into solutions. Join a team to solve real social problems in your community, develop new skills, and even earn an income.
                </p>
                <button className="mt-6 bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105 flex items-center gap-2 mx-auto">
                    <LightBulbIcon className="h-5 w-5" />
                    Propose a New Project
                </button>
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Project Board</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_SOCIAL_PROJECTS.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SocialImpactProjectsPage;
