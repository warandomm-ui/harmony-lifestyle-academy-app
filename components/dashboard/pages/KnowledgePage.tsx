
import React from 'react';
import LearningJourneySection from '../LearningJourneySection';
import StudyBuddySection from '../sections/StudyBuddySection';
import TodoListSection from '../sections/TodoListSection';
import ProjectsSection from '../sections/ProjectsSection';
import TimeTableSection from '../sections/TimeTableSection';
import WorldEducationSection from '../sections/WorldEducationSection';
import LinkedInSyncSection from '../sections/LinkedInSyncSection';
import type { Course } from '../../../types';
import { useGamification } from '../../../contexts/GamificationContext';
import { LightBulbIcon } from '../Icons';

interface KnowledgePageProps {
  courses: Course[];
  selectedSkills: string[];
  onOpenCourseCreator: () => void;
  onPlayCourse: (course: Course) => void;
}

const KnowledgePage: React.FC<KnowledgePageProps> = ({ courses, selectedSkills, onOpenCourseCreator, onPlayCourse }) => {
    const { profile } = useGamification();
    const canTeach = profile.level >= 10;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <LearningJourneySection courses={courses} onPlayCourse={onPlayCourse} />
            <LinkedInSyncSection completedCourses={courses} skills={selectedSkills} />
        </div>
        <div className="lg:col-span-1 space-y-6">
            {canTeach && (
                <div className="bento-card bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 flex flex-col justify-center items-center text-center">
                    <LightBulbIcon className="h-12 w-12 text-purple-500" />
                    <h3 className="text-xl font-bold text-[var(--foreground)] mt-4">Teach & Mentor</h3>
                    <p className="text-[var(--muted)] mt-2">You've reached Level 10! Solidify your knowledge by teaching others. Create a mini-lesson and earn bonus XP.</p>
                    <button 
                        onClick={onOpenCourseCreator}
                        className="mt-4 bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105">
                        Create a Mini-Lesson
                    </button>
                </div>
            )}
            <TodoListSection />
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <StudyBuddySection selectedSkills={selectedSkills} />
          <TimeTableSection />
      </div>
      
      <ProjectsSection />
      <WorldEducationSection />
    </div>
  );
};

export default KnowledgePage;
