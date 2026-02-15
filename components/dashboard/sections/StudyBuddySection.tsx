import React, { useState, useEffect, useRef } from 'react';
import { useStudyBuddy } from '../../../contexts/StudyBuddyContext';
import { AcademicCapIcon, SparklesIcon, SpinnerIcon, CheckCircleIcon, XCircleIcon } from '../Icons';

interface StudyBuddySectionProps {
  selectedSkills: string[];
}

const StudyBuddySection: React.FC<StudyBuddySectionProps> = ({ selectedSkills }) => {
  const { topic, setTopic, messages, sendMessage, isLoading, clearSession } = useStudyBuddy();

  if (!topic) {
    return <TopicSelectionView skills={selectedSkills} onSelectTopic={setTopic} />;
  }

  return <ChatView onClearSession={clearSession} />;
};

// --- Topic Selection View ---
const TopicSelectionView: React.FC<{ skills: string[]; onSelectTopic: (topic: string) => void }> = ({ skills, onSelectTopic }) => (
  <div className="bento-card">
    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
      <AcademicCapIcon className="h-7 w-7 text-[var(--primary)]" />
      AI Study Buddy
    </h2>
    <p className="text-[var(--muted)] mb-6">Choose a topic to start a personalized study session. Your buddy can quiz you, explain concepts, and give you encouragement!</p>
    <div className="flex flex-wrap gap-3">
      {skills.map(skill => (
        <button
          key={skill}
          onClick={() => onSelectTopic(skill)}
          className="px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-green-500"
        >
          {skill}
        </button>
      ))}
    </div>
  </div>
);

// --- Chat View ---
const ChatView: React.FC<{ onClearSession: () => void }> = ({ onClearSession }) => {
    const { topic, messages, sendMessage, isLoading } = useStudyBuddy();
    const [userInput, setUserInput] = useState('');
    const [answeredQuizId, setAnsweredQuizId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isLoading) {
            sendMessage(userInput, 'explain');
            setUserInput('');
        }
    };
    
    const handleQuizAnswer = (quizId: string, answer: string, correctAnswer: string) => {
        if (answeredQuizId === quizId) return; // Prevent re-answering
        setAnsweredQuizId(quizId);
        const isCorrect = answer === correctAnswer;
        const feedback = isCorrect ? `Correct! Great job.` : `Not quite. The correct answer was "${correctAnswer}". Let's review.`;
        sendMessage(feedback, 'explain');
    };

    return (
    <div className="bento-card flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <AcademicCapIcon className="h-7 w-7 text-[var(--primary)]" />
          Studying: {topic}
        </h2>
        <button onClick={onClearSession} className="font-semibold text-sm text-[var(--muted)] hover:underline">
          Change Topic
        </button>
      </div>
      
      <div ref={messagesEndRef} className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[var(--primary)] text-white rounded-br-lg' : 'bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-lg'}`}>
              <p>{msg.text}</p>
              {msg.quiz && (
                <div className="mt-3 space-y-2">
                  {msg.quiz.options.map((opt, i) => {
                    const isAnswered = answeredQuizId === msg.id;
                    const isCorrect = opt === msg.quiz!.correctAnswer;
                    
                    let buttonClass = 'bg-white/50 text-left w-full p-2 rounded-lg border-2 border-transparent hover:border-[var(--primary)]/50 disabled:cursor-not-allowed';
                    if (isAnswered) {
                        buttonClass += isCorrect ? ' bg-green-500/20 border-green-500' : ' bg-red-500/20 border-red-500';
                    }

                    return (
                        <button key={i} onClick={() => handleQuizAnswer(msg.id, opt, msg.quiz!.correctAnswer)} disabled={isAnswered} className={buttonClass}>
                           {opt}
                        </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-lg flex items-center gap-2">
              <SpinnerIcon className="h-4 w-4" />
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-[var(--border)]">
        <form onSubmit={handleSendMessage} className="flex gap-3">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a question or answer the quiz..." className="flex-1 px-4 py-3 rounded-full bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition" disabled={isLoading} />
        </form>
        <div className="flex justify-center gap-2 mt-3">
             <button onClick={() => sendMessage("Quiz me on this topic.", 'quiz')} disabled={isLoading} className="text-xs font-semibold bg-[var(--background)] px-3 py-1.5 rounded-full hover:bg-[var(--secondary)] disabled:opacity-50">❓ Quiz Me</button>
             <button onClick={() => sendMessage("Give me some encouragement.", 'encourage')} disabled={isLoading} className="text-xs font-semibold bg-[var(--background)] px-3 py-1.5 rounded-full hover:bg-[var(--secondary)] disabled:opacity-50">💖 Encourage Me</button>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddySection;