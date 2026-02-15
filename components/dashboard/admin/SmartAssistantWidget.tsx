
import React, { useState } from 'react';
import { getAdminAssistance } from '../../../services/geminiService';
import { SparklesIcon, SpinnerIcon } from '../Icons';
import type { AdminAssistanceResult } from '../../../types';
import { MOCK_STUDENT_DATA } from '../../../constants';

const SmartAssistantWidget: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<AdminAssistanceResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Security: Input validation and length limiting to prevent prompt overflows
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt) return;
        if (cleanPrompt.length > 1000) {
            setError('Prompt is too long. Please keep it under 1000 characters.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await getAdminAssistance(cleanPrompt, MOCK_STUDENT_DATA);
            setResponse(result);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const quickPrompts = [
        "Draft a welcome message for new students.",
        "Suggest 3 new features to improve engagement.",
        "What are some good topics for a community workshop?",
        "Analyze student engagement and learning progress.",
    ];

    // Simple parser to convert basic markdown-like returns to safe JSX 
    // This replaces dangerouslySetInnerHTML for better security (XSS Mitigation)
    const renderSafeText = (text: string) => {
        return text.split('\n').map((line, i) => (
            <span key={i} className="block mb-2">
                {line.startsWith('### ') ? <strong className="text-lg block mt-4">{line.replace('### ', '')}</strong> :
                 line.startsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : 
                 line.startsWith('- ') ? <span className="pl-4 block">• {line.replace('- ', '')}</span> :
                 line}
            </span>
        ));
    };

    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="h-6 w-6 text-purple-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Admin Smart Assistant</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Ask Gemini for insights or content drafts. Student data is automatically summarized for context.
            </p>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Generate a 3-module course outline for 'Financial Literacy'..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-purple-500 focus:outline-none transition text-sm"
                />
                <div className="flex justify-between items-center mt-2 mb-3">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Quick Prompts:</div>
                    <div className="text-[10px] text-gray-400">{prompt.length}/1000</div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {quickPrompts.map(p => (
                        <button key={p} type="button" onClick={() => setPrompt(p)} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-bold uppercase tracking-tighter transition-colors">{p}</button>
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon /> Thinking...
                        </>
                    ) : (
                        "Ask Gemini"
                    )}
                </button>
            </form>

            {(response || error) && (
                 <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-purple-500" />
                        Response:
                     </h4>
                     {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                     {response && (
                        <div className="animate-fade-in-up">
                            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {renderSafeText(response.text)}
                            </div>
                            {response.groundingLinks && response.groundingLinks.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Verified Sources:</p>
                                    <ul className="space-y-1.5">
                                        {response.groundingLinks.map((link, linkIndex) => (
                                            <li key={linkIndex} className="truncate">
                                                <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    {link.title || new URL(link.uri).hostname}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                     )}
                 </div>
            )}
        </section>
    );
};

export default SmartAssistantWidget;
