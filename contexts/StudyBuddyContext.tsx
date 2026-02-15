import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { StudyBuddyMessage, StudyMode } from '../types';
import { getStudyBuddyResponse } from '../services/geminiService';
import { useToast } from './ToastContext';

interface StudyBuddyContextType {
  topic: string | null;
  setTopic: (topic: string | null) => void;
  messages: StudyBuddyMessage[];
  sendMessage: (text: string, mode?: StudyMode) => Promise<void>;
  isLoading: boolean;
  clearSession: () => void;
}

const StudyBuddyContext = createContext<StudyBuddyContextType | undefined>(undefined);

export const StudyBuddyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudyBuddyMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const clearSession = useCallback(() => {
    setTopic(null);
    setMessages([]);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(async (text: string, mode: StudyMode = 'explain') => {
    if (!topic) return;

    const userMessage: StudyBuddyMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await getStudyBuddyResponse([...messages, userMessage], topic, mode, text);
      
      let modelMessage: StudyBuddyMessage;
      
      if (mode === 'quiz') {
        modelMessage = {
          id: `${Date.now()}-model`,
          role: 'model',
          text: response.question,
          quiz: {
            question: response.question,
            options: response.options,
            correctAnswer: response.correctAnswer,
          },
        };
      } else {
         modelMessage = {
          id: `${Date.now()}-model`,
          role: 'model',
          text: response,
        };
      }
      
      setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
      addToast(error.message || "Failed to get response from Study Buddy.", 'error');
      const errorMessage: StudyBuddyMessage = {
        id: `${Date.now()}-error`,
        role: 'model',
        text: 'Sorry, I had trouble connecting. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [topic, messages, addToast]);

  return (
    <StudyBuddyContext.Provider value={{ topic, setTopic, messages, sendMessage, isLoading, clearSession }}>
      {children}
    </StudyBuddyContext.Provider>
  );
};

export const useStudyBuddy = (): StudyBuddyContextType => {
  const context = useContext(StudyBuddyContext);
  if (!context) {
    throw new Error('useStudyBuddy must be used within a StudyBuddyProvider');
  }
  return context;
};