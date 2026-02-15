
import React, { useState } from 'react';
import { BookOpenIcon, PlusIcon, PencilIcon, TrashIcon, PlayIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

interface AdminCourse {
    id: string;
    title: string;
    instructor: string;
    status: 'Draft' | 'Published';
    lessons: number;
    thumbnail: string;
}

const AdminCoursesPage: React.FC = () => {
    const { addToast } = useToast();
    const [courses, setCourses] = useState<AdminCourse[]>([
        { id: '1', title: 'Python for Beginners', instructor: 'Harmony AI', status: 'Published', lessons: 12, thumbnail: '🐍' },
        { id: '2', title: 'Financial Literacy 101', instructor: 'Cikgu Siti', status: 'Draft', lessons: 5, thumbnail: '💰' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    const handleCreateCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourseTitle.trim()) return;
        
        const newCourse: AdminCourse = {
            id: Date.now().toString(),
            title: newCourseTitle,
            instructor: 'You',
            status: 'Draft',
            lessons: 0,
            thumbnail: '🆕',
        };
        setCourses([...courses, newCourse]);
        setNewCourseTitle('');
        setShowModal(false);
        addToast('Course created successfully!', 'success');
    };

    const deleteCourse = (id: string) => {
        if (window.confirm("Are you sure? This cannot be undone.")) {
            setCourses(prev => prev.filter(c => c.id !== id));
            addToast('Course deleted.', 'info');
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Course Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Upload courses, manage lessons, and track content.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Upload Course
                </button>
            </header>

            {/* Course List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                            <th className="px-6 py-4">Course Name</th>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4 text-center">Lessons</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {courses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                                            {course.thumbnail}
                                        </div>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{course.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{course.instructor}</td>
                                <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-300">{course.lessons}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        course.status === 'Published' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                        {course.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteCourse(course.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {courses.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No courses found. Create your first one!</div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-fast">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Create New Course</h2>
                        <form onSubmit={handleCreateCourse}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="e.g. Advanced Mathematics"
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoursesPage;
