import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatAltIcon, SpinnerIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const GeneralTextChatbotSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'initial',
    role: 'model',
    text: 'Hello! How can I help you today?',
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const chatRef = useRef<Chat | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on component mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are Harmony AI, a friendly and helpful guide for Malaysian youth. Keep your answers concise, encouraging, and easy to understand.',
          },
        });
        console.log('Gemini text chat session initialized.');
      } catch (error) {
        console.error('Error initializing Gemini text chat:', error);
        addToast('Failed to initialize chat. Please check your API key.', 'error');
      }
    };

    initChat();
  }, [addToast]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    if (!chatRef.current) {
      addToast('Chat not initialized yet. Please try again.', 'info');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: userMessage.text });

      let modelResponseText = '';
      const modelMessageId = `${Date.now()}-model`;
      setMessages((prev) => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        modelResponseText += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: modelResponseText } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      addToast('Failed to get response from Harmony AI. Please try again.', 'error');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.startsWith(Date.now().toString().substring(0, 10)) && msg.role === 'model' // Approximate matching for the error message
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bento-card flex flex-col h-[500px]">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <ChatAltIcon className="h-7 w-7 text-[var(--accent)]" />
        Text Chat with Harmony AI
      </h2>
      <div ref={chatHistoryRef} className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--primary)] text-white rounded-br-lg'
                  : 'bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-lg'
              }`}
            >
              {msg.text}
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
      <form onSubmit={handleSendMessage} className="flex gap-3 flex-shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Harmony AI..."
          className="flex-1 px-4 py-3 rounded-full bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-[var(--primary)] text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
          disabled={!inputMessage.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GeneralTextChatbotSection;