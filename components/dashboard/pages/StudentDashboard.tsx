
import React from 'react';
import { Course } from '../../../types';
import { PlayIcon, CheckBadgeIcon, BookOpenIcon, AcademicCapIcon, TrophyIcon, UsersIcon } from '../Icons';
import { ProgressBar } from '../shared/ProgressBar';
import { useGamification } from '../../../contexts/GamificationContext';
import { MOCK_BADGES } from '../../../constants';

interface StudentDashboardProps {
    courses: Course[];
    onPlayCourse: (course: Course) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ courses, onPlayCourse }) => {
    const { profile } = useGamification();
    const completedCourses = courses.filter(c => c.progress === 100);
    const inProgressCourses = courses.filter(c => c.progress < 100 && c.progress > 0);
    const activeCourse = inProgressCourses.length > 0 ? inProgressCourses[0] : courses[0];

    const recentBadges = MOCK_BADGES
        .filter(badge => profile.badges.includes(badge.id))
        .slice(0, 4);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero: Resume Learning */}
            <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-purple-200 font-bold uppercase tracking-wider text-sm mb-2">Pick up where you left off</p>
                        <h2 className="text-3xl font-extrabold mb-2">{activeCourse?.title || "Ready to start learning?"}</h2>
                        <p className="text-purple-100 mb-6 max-w-lg">{activeCourse?.subtitle || "Explore our catalog and enroll in your first course today."}</p>
                        <button 
                            onClick={() => onPlayCourse(activeCourse)}
                            className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-50 transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <PlayIcon className="h-5 w-5" />
                            Resume Lesson
                        </button>
                    </div>
                    <div className="hidden md:block">
                        <div className="text-9xl opacity-20 transform rotate-12">
                            {activeCourse?.icon || '🎓'}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* My Courses */}
                    <section>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                            <BookOpenIcon className="h-6 w-6 text-[var(--primary)]" />
                            My Courses
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {courses.map(course => (
                                <div key={course.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => onPlayCourse(course)}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-3 bg-[var(--secondary)]/30 rounded-lg text-3xl">
                                            {course.icon}
                                        </div>
                                        {course.progress === 100 && (
                                            <CheckBadgeIcon className="h-6 w-6 text-green-500" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-[var(--foreground)] line-clamp-1">{course.title}</h4>
                                    <p className="text-xs text-[var(--muted)] mb-3">{course.subtitle}</p>
                                    <ProgressBar label="" percentage={course.progress} value={`${course.progress}%`} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Certificates */}
                    <section>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                            <AcademicCapIcon className="h-6 w-6 text-yellow-500" />
                            Certificates & Achievements
                        </h2>
                        {completedCourses.length > 0 ? (
                            <div className="space-y-3">
                                {completedCourses.map(course => (
                                    <div key={`cert-${course.id}`} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                                                <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--foreground)]">{course.title}</p>
                                                <p className="text-xs text-[var(--muted)]">Completed on {new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-[var(--primary)] hover:underline">Download</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--secondary)]/20 rounded-xl p-6 text-center border border-dashed border-[var(--border)]">
                                <p className="text-[var(--muted)]">Complete a course to earn your first certificate!</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Gamification Mini-Widget */}
                    <div className="bento-card">
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Your Level</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-16 h-16">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-[var(--border)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-[var(--primary)]" strokeDasharray={`${(profile.xpInLevel / profile.xpForNextLevel) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[var(--foreground)]">
                                    {profile.level}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--muted)]">Next Level:</p>
                                <p className="font-bold text-[var(--primary)]">{profile.xpForNextLevel - profile.xpInLevel} XP</p>
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--muted)] uppercase mb-2">Recent Badges</h4>
                        <div className="flex gap-2">
                            {recentBadges.map(badge => (
                                <div key={badge.id} className="bg-[var(--background)] p-2 rounded-lg text-2xl border border-[var(--border)]" title={badge.name}>
                                    {badge.icon}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Feed Snippet */}
                    <div className="bento-card">
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-green-500" />
                            Community
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-xs text-[var(--primary)]">Announcement</span>
                                    <span className="text-[10px] text-[var(--muted)]">2h ago</span>
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">New Python challenge is live! 🐍</p>
                            </div>
                            <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-xs text-orange-500">Discussion</span>
                                    <span className="text-[10px] text-[var(--muted)]">5h ago</span>
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">Tips for staying focused during exams?</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
