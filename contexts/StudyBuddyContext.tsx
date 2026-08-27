import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { StudyBuddyMessage, StudyMode, StudyBuddyPersona } from '../types';
import { getStudyBuddyResponse } from '../services/geminiService';
import { useToast } from './ToastContext';

interface StudyBuddyContextType {
  persona: StudyBuddyPersona | null;
  setPersona: (persona: StudyBuddyPersona | null) => void;
  topic: string | null;
  setTopic: (topic: string | null) => void;
  messages: StudyBuddyMessage[];
  sendMessage: (text: string, mode?: StudyMode) => Promise<void>;
  isLoading: boolean;
  clearSession: () => void;
  clearTopic: () => void;
}

const StudyBuddyContext = createContext<StudyBuddyContextType | undefined>(undefined);

export const StudyBuddyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<StudyBuddyPersona | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudyBuddyMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const clearSession = useCallback(() => {
    setPersona(null);
    setTopic(null);
    setMessages([]);
    setIsLoading(false);
  }, []);

  const clearTopic = useCallback(() => {
    setTopic(null);
    setMessages([]);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(async (text: string, mode: StudyMode = 'explain') => {
    if (persona?.requiresTopic && !topic) return;

    const effectiveTopic = topic || persona?.role || 'general life skills';
    const userMessage: StudyBuddyMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await getStudyBuddyResponse([...messages, userMessage], effectiveTopic, mode, text, persona?.systemFlavor || '');
      
      let modelMessage: StudyBuddyMessage;
      
      if (mode === 'quiz') {
        let quiz: { question: string; options: string[]; correctAnswer: string } | undefined;
        try {
          const parsed = JSON.parse(response);
          quiz = { question: parsed.question, options: parsed.options, correctAnswer: parsed.correctAnswer };
        } catch {
          // response is plain text, not JSON
        }
        modelMessage = {
          id: `${Date.now()}-model`,
          role: 'model',
          text: quiz?.question ?? response,
          quiz,
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
  }, [persona, topic, messages, addToast]);

  return (
    <StudyBuddyContext.Provider value={{ persona, setPersona, topic, setTopic, messages, sendMessage, isLoading, clearSession, clearTopic }}>
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