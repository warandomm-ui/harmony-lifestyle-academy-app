import React, { useState, useEffect } from 'react';

const messages = [
    "Analyzing your personality...",
    "Matching you with the right mentors...",
    "Building your learning roadmap...",
    "Setting up your community spaces...",
    "Finalizing your personalized plan..."
];

const GeneratingDashboardStep: React.FC = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 1000); // Change message every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center py-20 flex flex-col items-center justify-center animate-fade-in">
            <div className="text-5xl mb-6">✨</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Creating your personalized Harmony path...</h2>
            
            <div className="relative h-6 w-full max-w-sm mt-4 overflow-hidden">
                {messages.map((message, index) => (
                    <p
                        key={index}
                        className={`absolute w-full text-center text-gray-500 dark:text-gray-400 transition-all duration-500 ease-in-out ${
                            index === currentMessageIndex ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                        }`}
                    >
                        {message}
                    </p>
                ))}
            </div>

            <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-6">
                <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full animate-loading-bar"></div>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default GeneratingDashboardStep;
