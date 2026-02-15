
import React from 'react';
import { ProgressBar } from './shared/ProgressBar';
import { Course } from '../../types';

// --- Progress Overview Card ---
const ProgressOverviewCard: React.FC = () => {
    return (
        <div className="bg-[var(--secondary)] rounded-2xl p-6 h-full">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">🎯 This Week's Goals</h3>
            <div className="space-y-4">
                <ProgressBar label="Complete 3 Matematik lessons" percentage={60} />
                <ProgressBar label="Build Python project" percentage={40} />
                <ProgressBar label="Join 2 community events" percentage={25} />
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--primary)]/20 text-center">
                <span className="font-semibold text-[var(--foreground)]">Weekly streak: 🔥 12 days</span>
            </div>
        </div>
    );
};

// --- Next Lesson Preview ---
const NextLessonPreview: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="bg-[var(--secondary)] rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">UP NEXT</p>
        <h3 className="text-xl font-bold text-[var(--foreground)] mt-1">📚 Algebraic Expressions</h3>
        <div className="flex items-center space-x-4 text-sm text-[var(--muted)] mt-3">
          <span>🕒 25 minutes</span>
          <span>📊 Intermediate</span>
        </div>
      </div>
      <button 
        onClick={onStart}
        className="mt-6 w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-3 px-4 rounded-full hover:opacity-90 transition-all transform hover:scale-105"
      >
        Start Lesson
      </button>
    </div>
  );
};


// --- Course Card for Carousel ---
const CourseCard = ({ icon, title, subtitle, progress, onPlay }: Course & { onPlay: () => void }) => {
    return (
        <div className="flex-shrink-0 w-60 bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]">
            <div className="text-3xl mb-2">{icon}</div>
            <h4 className="font-bold text-[var(--foreground)]">{title}</h4>
            <p className="text-sm text-[var(--muted)] mb-3 truncate">{subtitle}</p>
            <ProgressBar label={`Progress`} percentage={progress} />
            <button 
                onClick={onPlay}
                className="mt-4 w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold py-2 px-4 rounded-full hover:opacity-90 transition-transform hover:scale-105"
            >
                Continue
            </button>
        </div>
    );
};

// --- Active Courses Carousel ---
const ActiveCoursesCarousel: React.FC<{ courses: Course[]; onPlayCourse: (course: Course) => void }> = ({ courses, onPlayCourse }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Active Courses</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
                {courses.map((course, index) => (
                    <CourseCard key={index} {...course} onPlay={() => onPlayCourse(course)} />
                ))}
            </div>
        </div>
    );
};


interface LearningJourneySectionProps {
  courses: Course[];
  onPlayCourse: (course: Course) => void;
}

// --- Main Section Component ---
const LearningJourneySection: React.FC<LearningJourneySectionProps> = ({ courses, onPlayCourse }) => {
  return (
    <div className="bento-card h-full">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Your Glow Up Path 💫</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressOverviewCard />
            {/* For demo purposes, start any course when 'Start Lesson' is clicked */}
            <NextLessonPreview onStart={() => onPlayCourse(courses[0])} />
        </div>
        <ActiveCoursesCarousel courses={courses} onPlayCourse={onPlayCourse} />
      </div>
    </div>
  );
};
export default LearningJourneySection;
