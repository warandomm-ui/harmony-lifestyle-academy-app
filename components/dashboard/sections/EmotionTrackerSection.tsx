
import React, { useState, useEffect, useMemo } from 'react';
import { FaceSmileIcon, CalendarIcon, BookOpenIcon, SpinnerIcon, XCircleIcon } from '../Icons';
import { MOCK_EMOTION_DATA, EMOTION_OPTIONS } from '../../../constants';
import type { Emotion, EmotionEntry, WeeklyEmotionReview } from '../../../types';
import { getWeeklyReview } from '../../../services/geminiService';

const EmotionChart: React.FC<{ data: { emotion: Emotion; count: number; emoji: string; color: string; }[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero

  if (data.every(d => d.count === 0)) {
    return (
        <div className="text-center text-sm text-[var(--muted)] py-4">
            Log an emotion to see your weekly summary here.
        </div>
    );
  }

  return (
    <div className="my-4">
      <h4 className="text-sm font-bold text-[var(--muted)] mb-2 text-center">Last 7 Days</h4>
      <div className="flex justify-around items-end h-32 bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
        {data.map(({ emotion, count, emoji, color }) => (
          <div key={emotion} className="flex flex-col items-center w-10 text-center relative group h-full justify-end">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
            </span>
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${color.split(' ')[0]}`}
              style={{ height: `${(count / maxCount) * 100}%` }}
              title={`${emotion}: ${count} times`}
            >
            </div>
            <span className="text-xl mt-1">{emoji}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const EmotionTrackerSection: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [emotionHistory, setEmotionHistory] = useState<EmotionEntry[]>([]);
  const [mostFrequentEmotion, setMostFrequentEmotion] = useState<Emotion | null>(null);
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [weeklyReview, setWeeklyReview] = useState<WeeklyEmotionReview | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    // Load from local storage or use mock data
    const savedHistory = localStorage.getItem('emotionHistory');
    if (savedHistory) {
      setEmotionHistory(JSON.parse(savedHistory));
    } else {
      setEmotionHistory(MOCK_EMOTION_DATA);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
    calculateMostFrequentEmotion();
  }, [emotionHistory]);

  const calculateMostFrequentEmotion = () => {
    if (emotionHistory.length === 0) {
      setMostFrequentEmotion(null);
      return;
    }
    const emotionCounts: { [key in Emotion]?: number } = {};
    for (const entry of emotionHistory) {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    }

    let maxCount = 0;
    let frequentEmotion: Emotion | null = null;
    for (const emotion in emotionCounts) {
      const count = emotionCounts[emotion as Emotion] || 0;
      if (count > maxCount) {
        maxCount = count;
        frequentEmotion = emotion as Emotion;
      }
    }
    setMostFrequentEmotion(frequentEmotion);
  };

  const handleLogEmotion = () => {
    if (!selectedEmotion) return;

    const newEntry: EmotionEntry = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      emotion: selectedEmotion,
      note: note.trim() || undefined,
    };

    setEmotionHistory(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setSelectedEmotion(null);
    setNote('');
  };

  const handleGenerateReview = async () => {
    setView('weekly');
    if (weeklyReview && !reviewError) return; // Don't refetch if we already have it

    setIsReviewLoading(true);
    setReviewError(null);

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const pastWeekEmotions = emotionHistory
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo && entryDate <= today;
      })
      .map(entry => entry.emotion);

    try {
      const review = await getWeeklyReview(pastWeekEmotions);
      setWeeklyReview(review);
    } catch (err) {
      setReviewError("Couldn't generate your weekly review. Please try again.");
    } finally {
      setIsReviewLoading(false);
    }
  };

  const getEmojiForEmotion = (emotion: Emotion) => {
    return EMOTION_OPTIONS.find(opt => opt.emotion === emotion)?.emoji || '❓';
  };

  const getEmotionColorClass = (emotion: Emotion) => {
    return EMOTION_OPTIONS.find(opt => opt.emotion === emotion)?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
  };
  
    const pastWeekEmotionsData = useMemo(() => {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        const counts = EMOTION_OPTIONS.reduce((acc, option) => {
        acc[option.emotion] = { ...option, count: 0 };
        return acc;
        }, {} as Record<Emotion, { emotion: Emotion; emoji: string; color: string; count: number; }>);

        emotionHistory
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= oneWeekAgo && entryDate <= today;
        })
        .forEach(entry => {
            if (counts[entry.emotion]) {
            counts[entry.emotion].count++;
            }
        });
        
        return Object.values(counts);
    }, [emotionHistory]);

  const DailyTrackerView = () => (
    <div className="space-y-4 animate-fade-in-fast">
      <div>
        <p className="text-sm font-bold text-[var(--muted)] mb-2">How are you feeling right now?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {EMOTION_OPTIONS.map(opt => (
            <button
              key={opt.emotion}
              onClick={() => setSelectedEmotion(opt.emotion)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 flex-1 min-w-[80px]
                ${selectedEmotion === opt.emotion ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] transform scale-105' : 'border-transparent hover:border-[var(--border)]'}
                ${opt.color}
              `}
            >
              <span className="text-2xl mb-1">{opt.emoji}</span>
              <span>{opt.emotion}</span>
            </button>
          ))}
        </div>
        
        {selectedEmotion && (
            <div className="mb-4 animate-fade-in-fast">
                <label htmlFor="emotion-note" className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">Add a Note (Optional)</label>
                <textarea
                    id="emotion-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's making you feel this way?"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none text-sm resize-none transition"
                />
            </div>
        )}

        <button
          onClick={handleLogEmotion}
          disabled={!selectedEmotion}
          className="w-full bg-[var(--primary)] text-white font-bold py-2.5 px-4 rounded-full hover:opacity-90 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 transform hover:scale-[1.02] active:scale-100"
        >
          Log Emotion
        </button>
      </div>

      <EmotionChart data={pastWeekEmotionsData} />

      <div>
        {mostFrequentEmotion && (
          <p className="text-sm text-center text-[var(--muted)] mb-3">
            Your most frequent vibe is: <span className={`font-semibold ${getEmotionColorClass(mostFrequentEmotion).split(' ')[1]}`}>{getEmojiForEmotion(mostFrequentEmotion)} {mostFrequentEmotion}</span>
          </p>
        )}
        {emotionHistory.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-xs font-bold text-[var(--muted)] uppercase mb-2">Recent History</h4>
            {emotionHistory.slice(0, 10).map((entry, index) => (
              <div key={index} className="bg-[var(--background)] rounded-lg p-3 flex items-start space-x-3 border border-transparent hover:border-[var(--border)] transition-colors">
                <span className="text-2xl">{getEmojiForEmotion(entry.emotion)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-[var(--foreground)]">{entry.emotion}</p>
                    <span className="text-xs text-[var(--muted)] whitespace-nowrap">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {entry.note && <p className="text-sm text-[var(--muted)] mt-1 italic break-words">"{entry.note}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const WeeklyReviewView = () => (
    <div className="animate-fade-in-fast space-y-4">
      <h3 className="text-lg font-bold text-center text-[var(--foreground)]">Your Weekly Vibe Check</h3>
      {isReviewLoading && (
        <div className="flex flex-col items-center justify-center py-10 text-[var(--muted)]">
          <SpinnerIcon className="h-8 w-8 text-[var(--primary)]" />
          <p className="mt-2 font-semibold">Generating your personalized review...</p>
        </div>
      )}
      {reviewError && (
        <div className="flex flex-col items-center justify-center py-10 text-red-500">
          <XCircleIcon className="h-8 w-8" />
          <p className="mt-2 font-semibold">{reviewError}</p>
        </div>
      )}
      {weeklyReview && !isReviewLoading && (
        <div className="space-y-4">
          <div className="bg-[var(--background)] p-4 rounded-lg border-l-4 border-[var(--primary)]">
            <p className="font-semibold text-[var(--primary)] mb-1">Summary</p>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{weeklyReview.summary}</p>
          </div>
          <div className="bg-[var(--background)] p-4 rounded-lg">
            <p className="font-semibold text-[var(--primary)] mb-2">Reflection Prompts</p>
            <ul className="list-disc list-inside text-sm text-[var(--foreground)] space-y-2">
              {weeklyReview.reflectionQuestions.map((q, i) => <li key={i} className="pl-1">{q}</li>)}
            </ul>
          </div>
          <div className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 p-4 rounded-lg">
            <p className="font-semibold text-[var(--foreground)] mb-1">✨ Tip for the Week Ahead</p>
            <p className="text-sm text-[var(--foreground)]">{weeklyReview.actionableTip}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bento-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <FaceSmileIcon className="h-7 w-7 text-[var(--primary)]" />
          Emotion Tracker
        </h2>
        <div className="flex bg-[var(--background)] rounded-full p-1 border border-[var(--border)]">
          <button
            onClick={() => setView('daily')}
            className={`p-2 rounded-full transition-colors ${view === 'daily' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            title="Daily Log"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleGenerateReview}
            className={`p-2 rounded-full transition-colors ${view === 'weekly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            title="Weekly Review"
          >
            <BookOpenIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {view === 'daily' ? <DailyTrackerView /> : <WeeklyReviewView />}
    </div>
  );
};

export default EmotionTrackerSection;
