
import React, { useState } from 'react';
import { SparklesIcon, BookOpenIcon, PlayIcon, CheckCircleIcon, ChevronDownIcon } from '../Icons';

interface Module {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    lessons: {
        title: string;
        summary: string;
        keyTakeaways: string[];
    }[];
}

const THE_PATH_MODULES: Module[] = [
    {
        id: 'foundation',
        title: '1. Foundation',
        description: 'Discovering who you are, seeking truth, and understanding your origin.',
        icon: '🏛️',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        lessons: [
            {
                title: 'The Awakening',
                summary: 'Life often begins with a realization: "Am I truly living or just existing?" Understanding that your current reality is a result of past choices is the first step to rebuilding.',
                keyTakeaways: ['Confronting reality is the first step to change.', 'You are responsible for your own life journey.', 'Ignorance is no longer an excuse.']
            },
            {
                title: 'Seeking the Truth',
                summary: 'Like the "Broken Telephone" game, truth often gets distorted over time. We must seek the original message and verify information for ourselves rather than blindly following.',
                keyTakeaways: ['Question what you have been told.', 'Seek the unaltered original message.', 'Truth brings clarity, even if it is uncomfortable at first.']
            },
            {
                title: 'The Creator',
                summary: 'Understanding the attributes of the Creator (Absolute Existence, Uniqueness, Self-Sufficiency) gives life meaning and direction.',
                keyTakeaways: ['We exist because of a higher power.', 'Our purpose is connected to seeking this truth.']
            }
        ]
    },
    {
        id: 'lifestyle',
        title: '2. Lifestyle Habits',
        description: 'Building the daily routines and discipline that shape your future.',
        icon: '🌅',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        lessons: [
            {
                title: 'The Learning Formula',
                summary: 'True growth comes from a cycle: Read (Intentionality), Write (Clarify), Teach (Reinforce), and Apply (Action).',
                keyTakeaways: ['Read with the intention to change.', 'Write to remember and organize.', 'Teach to master the concept.', 'Apply to grow.']
            },
            {
                title: 'Small Steps, Big Change',
                summary: 'Transformation doesn\'t happen overnight. Start with 10 minutes a day. Consistency matters more than intensity.',
                keyTakeaways: ['Start small (e.g., 10 mins reading).', 'Build momentum through daily habits.', 'Celebrate small wins.']
            },
            {
                title: 'Morning Routines',
                summary: 'How you start your day determines how you live your life. Wake up with intention, gratitude, and a plan.',
                keyTakeaways: ['Win the morning, win the day.', 'Incorporate silence/prayer.', 'Plan your priorities.']
            }
        ]
    },
    {
        id: 'mindfulness',
        title: '3. Mindfulness',
        description: 'Mastering your mind, emotions, and finding inner peace.',
        icon: '🧘',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        lessons: [
            {
                title: 'Awareness vs. Survival',
                summary: 'Are you conscious of your choices, or just reacting to life? Mindfulness is the act of pausing to choose wisdom over impulse.',
                keyTakeaways: ['Stop living on autopilot.', 'Reflect on "Why am I doing this?".', 'Control negative thoughts before they control you.']
            },
            {
                title: 'Emotional Intelligence',
                summary: 'Controlling anger and responding with kindness. Understanding that reacting impulsively often leads to regret.',
                keyTakeaways: ['Pause before responding.', 'Silence is often the best answer.', 'Protect your peace from negativity.']
            },
            {
                title: 'Forgiveness',
                summary: 'Letting go is not for the other person; it is for you. Holding onto resentment is a heavy burden that blocks your own growth.',
                keyTakeaways: ['Forgive to free yourself.', 'Detach from emotional reactions.', 'Reframe criticism as an opportunity for growth.']
            }
        ]
    },
    {
        id: 'purpose',
        title: '4. Purpose',
        description: 'Aligning your life with a higher calling and serving others.',
        icon: '🧭',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        lessons: [
            {
                title: 'Redefining Success',
                summary: 'Success is not just about wealth or fame. It is about the legacy you leave and the lives you impact. From "Success" to "Significance".',
                keyTakeaways: ['Value impact over income.', 'What will you be remembered for?', 'True fulfillment comes from service.']
            },
            {
                title: 'Wealth as a Trust',
                summary: 'Money is not evil; it is a tool. You are a trustee, not just an owner. Use it to benefit yourself and those around you.',
                keyTakeaways: ['Wealth is a responsibility.', 'Earn ethically, spend wisely.', 'Circulate wealth through charity.']
            },
            {
                title: 'The Search for Meaning',
                summary: 'Beyond the daily grind, what is your "Why"? Aligning your daily actions with your ultimate purpose brings deep satisfaction.',
                keyTakeaways: ['Connect your work to a higher goal.', 'Live with intention.', 'Serve humanity.']
            }
        ]
    },
    {
        id: 'creativity',
        title: '5. Creativity',
        description: 'Innovation, problem-solving, and turning challenges into opportunities.',
        icon: '💡',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        lessons: [
            {
                title: 'Reframing Challenges',
                summary: 'Every setback is a setup for a comeback. Creativity is the ability to see a solution where others see a dead end.',
                keyTakeaways: ['Adversity reveals potential.', 'Ask "How can I fix this?" instead of "Why me?".', 'Failures are just lessons.']
            },
            {
                title: 'Building Something New',
                summary: 'Whether it is a business or a new habit, the act of creation is divine. Use your skills to build value for the world.',
                keyTakeaways: ['Start small, think big.', 'Solve real problems.', ' Innovate with ethics.']
            },
            {
                title: 'Adaptability',
                summary: 'The world changes fast. The ability to unlearn and relearn is the ultimate creative skill.',
                keyTakeaways: ['Be flexible like water.', 'Embrace new technologies and methods.', 'Stay curious.']
            }
        ]
    },
    {
        id: 'balance',
        title: '6. Balance',
        description: 'Harmonizing work, health, finance, and relationships.',
        icon: '⚖️',
        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        lessons: [
            {
                title: 'The Body is a Trust',
                summary: 'Your health affects everything. You cannot serve your purpose if your vessel is broken. Treat your body with respect.',
                keyTakeaways: ['Health is an asset.', 'Prevention is better than cure.', 'Listen to your body\'s signals.']
            },
            {
                title: 'The 1/3 Rule',
                summary: 'Moderation in eating: 1/3 for food, 1/3 for water, 1/3 for air. Never overfill the vessel.',
                keyTakeaways: ['Eat to live, don\'t live to eat.', 'Stop before you are full.', 'Digestion affects the mind.']
            },
            {
                title: 'Ethical Balance',
                summary: 'Avoiding debt, interest, and greed. Living within your means brings peace of mind.',
                keyTakeaways: ['Avoid debt traps.', 'Save but do not hoard.', 'Balance earning with giving.']
            }
        ]
    },
    {
        id: 'nature',
        title: '7. Nature Living',
        description: 'Reconnecting with the natural world for healing and reflection.',
        icon: '🌿',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        lessons: [
            {
                title: 'Reflection in Nature',
                summary: 'The vast sky and the stars remind us of our place in the universe. Disconnect to reconnect.',
                keyTakeaways: ['Spend time outdoors.', 'Observe the signs in creation.', 'Find silence in nature.']
            },
            {
                title: 'Natural Healing',
                summary: 'Using foods from the earth (Honey, Dates, Olive Oil) for vitality and strength.',
                keyTakeaways: ['Eat whole, natural foods.', 'Avoid processed "fillers".', 'Nature is the best pharmacy.']
            },
            {
                title: 'Movement',
                summary: 'We were designed to move. Walking, swimming, and active living keep the body tuned.',
                keyTakeaways: ['Walk daily.', 'Movement is medicine.', 'Engage in sports (Swimming, Archery).']
            }
        ]
    }
];

const ThePathPage: React.FC = () => {
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Hero Header */}
            <section className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-10 -translate-y-10">
                    📖
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold mb-2">The Path</h1>
                    <p className="text-indigo-200 text-lg font-medium mb-6 max-w-2xl">
                        A journey to Truth, Consciousness, Giving, Patience, and Forgiveness. 
                        Based on the book, broken down into 7 transformative pillars.
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg">
                            <PlayIcon className="h-5 w-5" />
                            Start Journey
                        </button>
                        <span className="text-sm font-semibold text-indigo-300">
                            21 Lessons • 7 Modules
                        </span>
                    </div>
                </div>
            </section>

            {/* Module Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {THE_PATH_MODULES.map((module) => (
                    <div 
                        key={module.id}
                        className={`bg-[var(--card)] rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden flex flex-col ${activeModuleId === module.id ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                        onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                    >
                        <div className="p-6 flex-grow">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${module.color}`}>
                                {module.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{module.title}</h3>
                            <p className="text-sm text-[var(--muted)] line-clamp-3">{module.description}</p>
                        </div>
                        
                        <div className="bg-[var(--secondary)]/20 p-4 border-t border-[var(--border)] flex justify-between items-center">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">{module.lessons.length} Lessons</span>
                            <ChevronDownIcon className={`h-5 w-5 text-[var(--muted)] transition-transform duration-300 ${activeModuleId === module.id ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Expanded Lessons View */}
                        {activeModuleId === module.id && (
                            <div className="border-t border-[var(--border)] bg-[var(--background)] animate-fade-in-fast">
                                {module.lessons.map((lesson, idx) => (
                                    <div key={idx} className="p-5 border-b border-[var(--border)] last:border-none hover:bg-[var(--card)] transition-colors group">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <CheckCircleIcon className="h-5 w-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--foreground)] text-base">{lesson.title}</h4>
                                                <p className="text-sm text-[var(--muted)] mt-1 mb-3">{lesson.summary}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {lesson.keyTakeaways.map((tag, tIdx) => (
                                                        <span key={tIdx} className="text-[10px] font-bold bg-[var(--secondary)]/50 text-[var(--foreground)] px-2 py-1 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 text-center">
                                    <button className="text-sm font-bold text-[var(--primary)] hover:underline flex items-center justify-center gap-1">
                                        <BookOpenIcon className="h-4 w-4" />
                                        Open Module Details
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
};

export default ThePathPage;
