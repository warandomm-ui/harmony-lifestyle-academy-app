
import React, { useState } from 'react';
import { generateCourseOutline, generatePlaceholderVideo } from '../../services/geminiService';
import type { Course, CourseDifficulty, CourseLesson, CourseOutline, LessonType } from '../../types';
import { XIcon, BookOpenIcon, PlayIcon, ClipboardListIcon, QuestionMarkCircleIcon, SparklesIcon, SpinnerIcon, MicrophoneIcon } from './Icons';
import { useToast } from '../../contexts/ToastContext';

interface CourseCreatorModalProps {
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

type GenerationState = 'idle' | 'loading' | 'success' | 'error';

const generatingMessages = [
    "Consulting expert curriculum designers...",
    "Structuring modules and lessons...",
    "Finding the best learning activities...",
    "Personalizing your educational path...",
    "Finalizing the course blueprint...",
];

const lessonTypeIcons: Record<LessonType, React.ReactNode> = {
    'Reading': <BookOpenIcon className="h-5 w-5 text-blue-500" />,
    'Video': <PlayIcon className="h-5 w-5 text-purple-500" />,
    'Audio': <MicrophoneIcon className="h-5 w-5 text-pink-500" />,
    'Project': <ClipboardListIcon className="h-5 w-5 text-orange-500" />,
    'Quiz': <QuestionMarkCircleIcon className="h-5 w-5 text-green-500" />,
};

const COURSE_ICONS = ['📚', '💡', '🚀', '🧠', '⚙️', '📈', '🎨', '🌍'];

const CourseCreatorModal: React.FC<CourseCreatorModalProps> = ({ onClose, onCourseCreated }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('Beginner');
  const [state, setState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseOutline | null>(null);
  const { addToast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setState('loading');
    setError(null);
    setCourse(null);

    try {
      const generatedCourse = await generateCourseOutline(topic, difficulty);
      setCourse(generatedCourse);
      setState('success');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while creating your course. Please try again.');
      setState('error');
    }
  };

  const handleSaveCourse = () => {
    if (!course) return;
    const newCourse: Course = {
        id: Date.now().toString(),
        icon: COURSE_ICONS[Math.floor(Math.random() * COURSE_ICONS.length)],
        title: course.title,
        subtitle: course.difficulty,
        progress: 0,
    };
    onCourseCreated(newCourse);
    addToast('Course saved to your journey!', 'success');
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return <LoadingState />;
      case 'error':
        return <ErrorState message={error!} onRetry={() => setState('idle')} />;
      case 'success':
        return course ? <SuccessState course={course} onSave={handleSaveCourse} onCreateNew={() => { setCourse(null); setTopic(''); setState('idle'); }} /> : null;
      case 'idle':
      default:
        return (
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">Create a New Course</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-8">What do you want to learn today? Tell Harmony AI.</p>
            
            <div className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course Topic</label>
                    <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Introduction to Malaysian Stock Market"
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                    <div className="flex gap-3">
                    {(['Beginner', 'Intermediate', 'Advanced'] as CourseDifficulty[]).map(level => (
                        <button
                        type="button"
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-200
                            ${difficulty === level
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-green-500'
                            }`}
                        >
                        {level}
                        </button>
                    ))}
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center">
                <button
                    type="submit"
                    disabled={!topic}
                    className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 enabled:hover:bg-green-700 enabled:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="h-5 w-5" />
                    Generate My Course
                </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 flex justify-end p-2">
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <XIcon className="h-5 w-5" />
            </button>
        </div>
        <div className="overflow-y-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};


const LoadingState = () => {
    const [message, setMessage] = useState(generatingMessages[0]);

    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % generatingMessages.length;
            setMessage(generatingMessages[index]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center py-20 px-8 flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-green-600 dark:text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Building Your Course...</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 transition-opacity duration-500">{message}</p>
        </div>
    );
};

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-20 px-8">
        <div className="text-5xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-500">Something Went Wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{message}</p>
        <button onClick={onRetry} className="mt-8 bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700">
            Try Again
        </button>
    </div>
);

const SuccessState: React.FC<{ course: CourseOutline; onSave: () => void; onCreateNew: () => void }> = ({ course, onSave, onCreateNew }) => {
    type VideoStatus = 'idle' | 'generating' | 'success' | 'error';
    const [videoStatuses, setVideoStatuses] = useState<Record<string, { status: VideoStatus; url?: string; error?: string }>>({});
    
    const handleGenerateVideo = async (moduleIndex: number, lessonIndex: number, lesson: CourseLesson) => {
        const key = `${moduleIndex}-${lessonIndex}`;
        
        setVideoStatuses(prev => ({ ...prev, [key]: { status: 'generating' } }));
        
        try {
            const prompt = `${lesson.title}: ${lesson.description}`;
            const videoUrl = await generatePlaceholderVideo(prompt); 
            setVideoStatuses(prev => ({ ...prev, [key]: { status: 'success', url: videoUrl } }));
        } catch (error: any) {
            console.error("Video generation failed:", error);
            let errorMessage = "Video generation failed. Please ensure your Gemini API key is valid and try again.";
            setVideoStatuses(prev => ({ ...prev, [key]: { status: 'error', error: errorMessage } }));
        }
    };

    return (
    <div className="p-8">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{course.title}</h2>
            <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{course.difficulty}</span>
                <span>{course.duration}</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{course.description}</p>
        </div>

        <div className="space-y-4">
            {course.modules.map((module, index) => (
                <details key={index} open={index === 0} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <summary className="font-bold text-lg text-gray-800 dark:text-gray-100 cursor-pointer">{`Module ${index + 1}: ${module.title}`}</summary>
                    <p className="text-sm text-gray-600 dark:text-gray-400 my-2">{module.description}</p>
                    <ul className="mt-3 space-y-2 pl-4 border-l-2 border-green-200 dark:border-green-800">
                        {module.lessons.map((lesson, lessonIndex) => {
                             const key = `${index}-${lessonIndex}`;
                             const videoStatus = videoStatuses[key] || { status: 'idle' };
                            return (
                            <li key={lessonIndex}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">{lessonTypeIcons[lesson.type]}</div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">{lesson.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.description}</p>
                                    </div>
                                </div>
                                {lesson.type === 'Video' && (
                                    <div className="mt-2 pl-8">
                                        {videoStatus.status === 'idle' && (
                                            <button 
                                                onClick={() => handleGenerateVideo(index, lessonIndex, lesson)}
                                                className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 text-xs font-bold py-1.5 px-3 rounded-full hover:bg-purple-200 dark:hover:bg-purple-500/30 transition flex items-center gap-1.5"
                                            >
                                                <PlayIcon className="h-4 w-4" />
                                                Generate Video Placeholder
                                            </button>
                                        )}
                                        {videoStatus.status === 'generating' && (
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <SpinnerIcon className="h-4 w-4" />
                                                <span>Generating video... this may take a few minutes.</span>
                                            </div>
                                        )}
                                        {videoStatus.status === 'success' && videoStatus.url && (
                                            <video src={videoStatus.url} controls className="w-full max-w-sm rounded-md mt-2 aspect-video" />
                                        )}
                                        {videoStatus.status === 'error' && (
                                            <div className="text-xs text-red-600 dark:text-red-400">
                                                <p className="font-semibold mb-1">{videoStatus.error}</p>
                                                 <button 
                                                    onClick={() => handleGenerateVideo(index, lessonIndex, lesson)}
                                                    className="font-bold underline"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        )})}
                    </ul>
                </details>
            ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={onCreateNew}
                className="font-bold py-3 px-8 rounded-full transition-colors duration-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
            >
                Create Another
            </button>
            <button
                onClick={onSave}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105"
            >
                Save to My Journey
            </button>
        </div>
    </div>
);
};
export default CourseCreatorModal;
