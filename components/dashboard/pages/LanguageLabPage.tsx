
import React, { useState, useRef, useEffect } from 'react';
import { GlobeAltIcon, ChatAltIcon, PlayIcon, BookOpenIcon, SpinnerIcon } from '../Icons';
import { getLanguageTutorResponse } from '../../../services/geminiService';
import { useToast } from '../../../contexts/ToastContext';

type Language = 'Arabic' | 'Mandarin' | 'English' | 'Hindi';

const LANGUAGES: { id: Language; label: string; flag: string; greeting: string; scriptName: string }[] = [
    { id: 'Arabic', label: 'Arabic (MSA)', flag: '🇸🇦', greeting: 'Marhaban (مرحبا)', scriptName: 'Abjad' },
    { id: 'Mandarin', label: 'Mandarin', flag: '🇨🇳', greeting: 'Nǐ hǎo (你好)', scriptName: 'Hanzi' },
    { id: 'English', label: 'English', flag: '🇬🇧', greeting: 'Hello', scriptName: 'Latin' },
    { id: 'Hindi', label: 'Hindi', flag: '🇮🇳', greeting: 'Namaste (नमस्ते)', scriptName: 'Devanagari' },
];

const SCENARIOS = [
    { title: 'At a Cafe', prompt: 'ordering coffee and a pastry' },
    { title: 'Greetings', prompt: 'meeting someone for the first time' },
    { title: 'Directions', prompt: 'asking how to get to the train station' },
    { title: 'Shopping', prompt: 'bargaining for a souvenir' },
];

const LanguageLabPage: React.FC = () => {
    const [activeLanguage, setActiveLanguage] = useState<Language>('Arabic');
    const [activeTab, setActiveTab] = useState<'immersion' | 'practice' | 'script'>('practice');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Language Selector Header */}
            <div className="bento-card bg-gradient-to-r from-indigo-50 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border-none">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                            <GlobeAltIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            Polyglot Lab
                        </h2>
                        <p className="text-[var(--muted)] mt-1">Master languages through immersion and active recall.</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.id}
                                onClick={() => setActiveLanguage(lang.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                                    activeLanguage === lang.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105'
                                        : 'bg-[var(--card)] border-transparent hover:border-indigo-300 text-[var(--foreground)]'
                                }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className="font-bold">{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="flex border-b border-[var(--border)] mb-4">
                <TabButton label="💬 AI Roleplay" isActive={activeTab === 'practice'} onClick={() => setActiveTab('practice')} />
                <TabButton label="🎧 Immersion Phrases" isActive={activeTab === 'immersion'} onClick={() => setActiveTab('immersion')} />
                <TabButton label="✍️ Script Mastery" isActive={activeTab === 'script'} onClick={() => setActiveTab('script')} />
            </div>

            {activeTab === 'practice' && <RoleplaySection language={activeLanguage} />}
            {activeTab === 'immersion' && <ImmersionSection language={activeLanguage} />}
            {activeTab === 'script' && <ScriptSection language={activeLanguage} />}
        </div>
    );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
            isActive
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
        }`}
    >
        {label}
    </button>
);

// --- Roleplay Section ---
const RoleplaySection: React.FC<{ language: Language }> = ({ language }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const currentLangData = LANGUAGES.find(l => l.id === language)!;

    useEffect(() => {
        // Reset chat when language changes
        setMessages([]);
        setSelectedScenario(null);
    }, [language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startScenario = (scenarioPrompt: string) => {
        setSelectedScenario(scenarioPrompt);
        setMessages([{ role: 'model', text: `(Starting scenario: ${scenarioPrompt}. I will speak in ${language}.) ${currentLangData.greeting}!` }]);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await getLanguageTutorResponse(language, messages, userMsg);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            addToast("Failed to get tutor response.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Scenarios Sidebar */}
            <div className="lg:col-span-1 bento-card overflow-y-auto">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Choose a Scenario</h3>
                <div className="space-y-3">
                    {SCENARIOS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => startScenario(s.prompt)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                                selectedScenario === s.prompt
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500'
                                    : 'bg-[var(--background)] border-[var(--border)] hover:border-indigo-300'
                            }`}
                        >
                            <div className="font-bold text-[var(--foreground)]">{s.title}</div>
                            <div className="text-xs text-[var(--muted)] mt-1">Practice: {s.prompt}</div>
                        </button>
                    ))}
                </div>
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Tip:</strong> Make mistakes! The AI tutor will correct your grammar gently at the end of its response.
                </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bento-card flex flex-col relative bg-[var(--background)] border-2 border-[var(--border)]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[var(--muted)] opacity-50">
                            <ChatAltIcon className="h-16 w-16 mb-4" />
                            <p>Select a scenario to start practicing {language}!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-gray-100 dark:bg-gray-700 text-[var(--foreground)] rounded-bl-none'
                                }`}>
                                    <p className="whitespace-pre-line">{msg.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                                <SpinnerIcon className="h-4 w-4 text-indigo-500" />
                                <span className="text-xs text-[var(--muted)]">Tutor is typing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-[var(--border)] bg-[var(--card)] rounded-b-2xl flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={messages.length === 0 ? "Select a scenario first..." : `Type your reply in ${language} (or English)...`}
                        disabled={messages.length === 0 || loading}
                        className="flex-1 px-4 py-3 rounded-full bg-[var(--background)] border-2 border-[var(--border)] focus:border-indigo-500 focus:outline-none transition disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={messages.length === 0 || loading || !input.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Immersion Section ---
const ImmersionSection: React.FC<{ language: Language }> = ({ language }) => {
    // Mock data - in a real app, this could be fetched or extensive
    const PHRASES: Record<Language, { text: string; trans: string; roman: string }[]> = {
        Arabic: [
            { text: 'السّلام عليكم', trans: 'Peace be upon you', roman: 'As-salamu alaykum' },
            { text: 'كيف حالك؟', trans: 'How are you?', roman: 'Kayfa haluka?' },
            { text: 'شكراً', trans: 'Thank you', roman: 'Shukran' },
        ],
        Mandarin: [
            { text: '你好', trans: 'Hello', roman: 'Nǐ hǎo' },
            { text: '谢谢', trans: 'Thank you', roman: 'Xièxiè' },
            { text: '这个多少钱？', trans: 'How much is this?', roman: 'Zhège duōshǎo qián?' },
        ],
        English: [
            { text: 'Hello', trans: 'Hello', roman: '-' },
            { text: 'How are you?', trans: 'How are you?', roman: '-' },
        ],
        Hindi: [
            { text: 'नमस्ते', trans: 'Hello', roman: 'Namaste' },
            { text: 'आप कैसे हैं?', trans: 'How are you?', roman: 'Aap kaise hain?' },
            { text: 'धन्यवाद', trans: 'Thank you', roman: 'Dhanyavaad' },
        ]
    };

    return (
        <div className="bento-card">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-6">Phrasebook & Pronunciation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PHRASES[language].map((phrase, idx) => (
                    <div key={idx} className="bg-[var(--secondary)]/30 border border-[var(--border)] rounded-2xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                        <div className="text-4xl mb-4 font-bold text-[var(--primary)]">{phrase.text}</div>
                        <div className="text-lg font-semibold text-[var(--foreground)]">{phrase.roman}</div>
                        <div className="text-sm text-[var(--muted)] mt-1">{phrase.trans}</div>
                        <button className="mt-4 p-3 rounded-full bg-[var(--primary)] text-white opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                            <PlayIcon className="h-6 w-6" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center text-[var(--muted)]">
                <p>Tip: Use the "AI Roleplay" tab to practice using these in sentences!</p>
            </div>
        </div>
    );
};

// --- Script Section ---
const ScriptSection: React.FC<{ language: Language }> = ({ language }) => {
    const renderContent = () => {
        switch (language) {
            case 'Arabic':
                return (
                    <div className="space-y-6">
                        <p className="text-[var(--muted)]">Arabic is written from right to left. Letters change shape depending on their position (initial, medial, final).</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Alif (ا)', 'Ba (ب)', 'Ta (ت)', 'Tha (ث)'].map(char => (
                                <div key={char} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-[var(--border)] text-center">
                                    <span className="text-3xl font-bold block mb-2">{char.split(' ')[1].replace(/[()]/g, '')}</span>
                                    <span className="text-sm text-[var(--muted)]">{char.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Mandarin':
                return (
                    <div className="space-y-6">
                        <p className="text-[var(--muted)]">Mandarin uses Hanzi (characters). Pinyin is the romanization system with 4 main tones.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Ma (妈) - Mom', 'Ma (麻) - Hemp', 'Ma (马) - Horse', 'Ma (骂) - Scold'].map(char => (
                                <div key={char} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-[var(--border)] text-center">
                                    <span className="text-3xl font-bold block mb-2">{char.split(/[()]/)[1]}</span>
                                    <span className="text-sm text-[var(--muted)]">{char.split(' ')[0]}</span>
                                    <span className="block text-xs text-gray-400 mt-1">{char.split(' - ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Hindi':
                return (
                    <div className="space-y-6">
                        <p className="text-[var(--muted)]">Hindi uses the Devanagari script. It is written left to right and has a distinctive horizontal line running along the top of letters.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Ka (क)', 'Kha (ख)', 'Ga (ग)', 'Gha (घ)'].map(char => (
                                <div key={char} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-[var(--border)] text-center">
                                    <span className="text-3xl font-bold block mb-2">{char.split(' ')[1].replace(/[()]/g, '')}</span>
                                    <span className="text-sm text-[var(--muted)]">{char.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div className="text-center py-10 text-[var(--muted)]">Script mastery not applicable or currently unavailable for this language.</div>;
        }
    };

    return (
        <div className="bento-card">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Script & Writing System</h3>
            {renderContent()}
        </div>
    );
};

export default LanguageLabPage;
