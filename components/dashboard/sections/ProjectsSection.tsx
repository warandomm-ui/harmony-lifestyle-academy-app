import React from 'react';
import EmptyState from '../shared/EmptyState';

// Shows only the user's real projects. There is no project tracking yet, so this is an
// empty state instead of the sample "Platformer Game 25%" cards and invented challenge
// deadline/prize that were here before.
const ProjectsSection: React.FC = () => {
    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Your Projects</h2>
            <EmptyState
                icon="🛠️"
                title="Belum ada projek"
                description="Projek yang anda mulakan akan dipaparkan di sini bersama kemajuannya."
            />
        </div>
    );
};

export default ProjectsSection;
