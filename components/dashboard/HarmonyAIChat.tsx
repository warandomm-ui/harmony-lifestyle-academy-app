import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import { useChat } from '../../contexts/ChatContext';
import { decode, decodeAudioData, createBlob } from '../../utils/audioUtils';
import { MicrophoneIcon, StopIcon, XIcon, ChatAltIcon, TrashIcon, DownloadIcon } from './Icons';
import type { Transcript } from '../../types'; // Import Transcript type
import { useToast } from '../../contexts/ToastContext';
import { generateContent } from '../../services/aiProxyService';

const TypingIndicator = () => (
    <div className="flex space-x-1 p-3">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
    </div>
);


const HarmonyAIChat: React.FC = () => {
    const { isChatOpen, toggleChat } = useChat();
    const [isRecording, setIsRecording] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState('Idle. Press mic to start.');
  const [textInput, setTextInput] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();
    
    const audioRefs = useRef<{
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        scriptProcessor: ScriptProcessorNode | null;
        mediaStream: MediaStream | null;
        nextStartTime: number;
        sources: Set<AudioBufferSourceNode>;
    }>({
        inputAudioContext: null,
        outputAudioContext: null,
        scriptProcessor: null,
        mediaStream: null,
        nextStartTime: 0,
        sources: new Set(),
    });

    const sessionPromiseRef = useRef<Promise<any> | null>(null);

    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [transcripts]);
    
    const stopConversation = useCallback(() => {
        setIsRecording(false);
        setIsConnecting(false);
        setStatus('Idle. Press mic to start.');
    
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.close();
            }).catch(e => console.error("Error closing session:", e));
            sessionPromiseRef.current = null;
        }
    
        if (audioRefs.current.scriptProcessor) {
            audioRefs.current.scriptProcessor.disconnect();
            audioRefs.current.scriptProcessor = null;
        }
    
        if (audioRefs.current.mediaStream) {
            audioRefs.current.mediaStream.getTracks().forEach(track => track.stop());
            audioRefs.current.mediaStream = null;
        }
    
        if (audioRefs.current.inputAudioContext && audioRefs.current.inputAudioContext.state !== 'closed') {
            audioRefs.current.inputAudioContext.close();
            audioRefs.current.inputAudioContext = null;
        }
        if (audioRefs.current.outputAudioContext && audioRefs.current.outputAudioContext.state !== 'closed') {
             for (const source of audioRefs.current.sources.values()) {
                source.stop();
                audioRefs.current.sources.delete(source);
            }
            audioRefs.current.outputAudioContext.close();
            audioRefs.current.outputAudioContext = null;
        }
         audioRefs.current.nextStartTime = 0;
    }, []);
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopConversation();
        };
    }, [stopConversation]);
    
    useEffect(() => {
        // If chat is closed, ensure everything is stopped
        if (!isChatOpen) {
            stopConversation();
        }
    }, [isChatOpen, stopConversation]);


    const startConversation = async () => {
        setIsRecording(true);
        setIsConnecting(true);
        setStatus('Connecting...');
        setTranscripts([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRefs.current.mediaStream = stream;

            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            
            // Initialize audio contexts
            audioRefs.current.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioRefs.current.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioRefs.current.nextStartTime = 0;
            audioRefs.current.sources = new Set();
            
            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setStatus('Listening... Talk now!');
                        const source = audioRefs.current.inputAudioContext!.createMediaStreamSource(stream);
                        const scriptProcessor = audioRefs.current.inputAudioContext!.createScriptProcessor(4096, 1, 1);
                        audioRefs.current.scriptProcessor = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: GenAIBlob = createBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioRefs.current.inputAudioContext!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // FIX: The 'isFinal' property is not available on the Transcription object.
                        // The logic is updated to manually manage the final state based on 'turnComplete' event.
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscription += text;
                            setTranscripts(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'user' && !last.isFinal) {
                                    const newTranscripts = [...prev.slice(0, -1), { ...last, text: currentInputTranscription }];
                                    return newTranscripts;
                                }
                                return [...prev, { speaker: 'user', text: currentInputTranscription, isFinal: false }];
                            });
                         }
                        
                         if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscription += text;
                            setTranscripts(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'model' && !last.isFinal) {
                                    const newTranscripts = [...prev.slice(0, -1), { ...last, text: currentOutputTranscription }];
                                    return newTranscripts;
                                }
                                return [...prev, { speaker: 'model', text: currentOutputTranscription, isFinal: false }];
                            });
                        }
                        
                        if (message.serverContent?.turnComplete) {
                            const groundingLinks = message.serverContent?.groundingMetadata?.groundingChunks?.map(chunk => {
                                if (chunk.web) {
                                    return { uri: chunk.web.uri, title: chunk.web.title || 'Web Source' };
                                }
                                if (chunk.maps) {
                                    return { uri: chunk.maps.uri, title: chunk.maps.title || 'Maps Source' };
                                }
                                return null;
                            }).filter(Boolean) as { uri: string; title: string }[];

                            setTranscripts(prev => prev.map(t => {
                                if (!t.isFinal) {
                                    return {
                                        ...t,
                                        isFinal: true,
                                        groundingLinks: t.speaker === 'model' && groundingLinks?.length ? groundingLinks : undefined
                                    };
                                }
                                return t;
                            }));
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64EncodedAudioString) {
                            const outputCtx = audioRefs.current.outputAudioContext;
                            if (outputCtx) {
                                audioRefs.current.nextStartTime = Math.max(audioRefs.current.nextStartTime, outputCtx.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputCtx, 24000, 1);
                                const source = outputCtx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputCtx.destination);
                                source.addEventListener('ended', () => { audioRefs.current.sources.delete(source); });
                                source.start(audioRefs.current.nextStartTime);
                                audioRefs.current.nextStartTime += audioBuffer.duration;
                                audioRefs.current.sources.add(source);
                            }
                        }

                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                             for (const source of audioRefs.current.sources.values()) {
                                source.stop();
                                audioRefs.current.sources.delete(source);
                            }
                            audioRefs.current.nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus(`Error: ${e.message}. Please try again.`);
                        stopConversation();
                    },
                    onclose: () => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    systemInstruction: 'You are Harmony AI, a friendly and helpful guide for Malaysian youth. Keep your answers concise, encouraging, and easy to understand.',
                    tools: [{googleSearch: {}}], // Added googleSearch tool
                },
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setStatus('Error: Could not access microphone.');
            setIsRecording(false);
            setIsConnecting(false);
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopConversation();
        } else {
            startConversation();
        }
    };

    const handleClearHistory = () => {
        if (transcripts.length > 0) {
            setTranscripts([]);
            addToast('Chat history cleared.', 'info');
        }
    };

    const handleDownloadTranscript = () => {
        if (transcripts.length === 0) {
            addToast('Nothing to download.', 'info');
            return;
        }
        const formatted = transcripts
            .map(t => `${t.speaker === 'user' ? 'You' : 'Harmony AI'}: ${t.text}`)
            .join('\n\n');
        
        const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `harmony-ai-transcript-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('Transcript downloaded!', 'success');
    };

    if (!isChatOpen) {
        return null;
    }
    
    
  // Send text message via AI proxy
  const sendTextMessage = async () => {
    if (!textInput.trim() || isSendingText) return;
    const userMsg = textInput.trim();
    setTextInput('');
    setIsSendingText(true);
    // Add user message to transcript
    setTranscripts(prev => [...prev, { speaker: 'user', text: userMsg, isFinal: true }]);
    try {
      const response = await generateContent(
        'You are Harmony AI, a friendly and knowledgeable assistant for Harmony Lifestyle Academy (HLA). ' +
        'HLA is a homeschooling academy for students aged 7-17 in Malaysia. ' +
        'Help students with their studies, personal development, and well-being. ' +
        'Respond in a warm, encouraging tone. Use Bahasa Malaysia if the student writes in BM. ' +
        'User message: ' + userMsg
      );
      setTranscripts(prev => [...prev, { speaker: 'model', text: response, isFinal: true }]);
    } catch (error) {
      setTranscripts(prev => [...prev, { speaker: 'model', text: 'Maaf, saya tidak dapat memproses mesej anda. Sila cuba lagi.', isFinal: true }]);
    }
    setIsSendingText(false);
  };

return (
        <div className="absolute bottom-4 right-4 w-[400px] h-[600px] bg-[var(--card)] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border)] animate-fade-in-up">
            <header className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10">
                <div className="flex items-center gap-3">
                    <ChatAltIcon className="h-6 w-6 text-[var(--primary)]"/>
                    <h2 className="text-lg font-bold text-[var(--foreground)]">Harmony AI</h2>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleClearHistory} title="Clear history" className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                    <button onClick={handleDownloadTranscript} title="Download transcript" className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
                        <DownloadIcon className="h-5 w-5"/>
                    </button>
                    <button onClick={toggleChat} title="Close chat" className="p-1 rounded-full text-[var(--muted)] hover:bg-[var(--secondary)]">
                        <XIcon className="h-5 w-5"/>
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-[var(--background)]">
                <div className="space-y-4">
                     {transcripts.length === 0 && (
                        <div className="text-center text-[var(--muted)] py-10">
                            <p>Press the mic to start chatting with Harmony AI.</p>
                        </div>
                    )}
                    {transcripts.map((t, i) => (
                        <div key={i} className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${t.speaker === 'user' ? 'bg-[var(--primary)] text-white rounded-br-lg' : 'bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-lg'}`}>
                                <p className="text-sm">{t.text}</p>
                                {t.groundingLinks && t.groundingLinks.length > 0 && (
                                    <div className="mt-2 text-xs">
                                        <p className="font-semibold">Sources:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {t.groundingLinks.map((link, linkIndex) => (
                                                <li key={linkIndex} className="truncate">
                                                    <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline dark:text-blue-400">
                                                        {link.title || (() => { try { return new URL(link.uri).hostname; } catch { return link.uri; } })()}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {transcripts.length > 0 && transcripts[transcripts.length - 1].speaker === 'model' && !transcripts[transcripts.length - 1].isFinal && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] rounded-bl-lg">
                                <TypingIndicator />
                            </div>
                        </div>
                     )}
                    <div ref={transcriptEndRef} />
                </div>
            </div>

            <footer className="p-4 border-t border-[var(--border)] flex-shrink-0">
                <div className="flex flex-col items-center justify-center gap-3">
                     <p className={`text-sm text-center font-medium transition-colors ${isConnecting ? 'text-yellow-500' : 'text-[var(--muted)]'}`}>
                        {status}
                    </p>
                    <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isSendingText}
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!textInput.trim() || isSendingText}
                  className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  {isSendingText ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  )}
                </button>
              </div>
              <button 
                        onClick={handleToggleRecording}
                        disabled={isConnecting}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 text-white focus:outline-none focus:ring-4 focus:ring-opacity-50
                            ${isRecording ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 animate-pulse' : 'bg-[var(--primary)] hover:opacity-90 focus:ring-[var(--primary)]/50'}
                            ${isConnecting ? 'cursor-not-allowed bg-gray-400' : ''}
                        `}
                    >
                       {isRecording ? <StopIcon className="h-8 w-8"/> : <MicrophoneIcon className="h-8 w-8"/>}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default HarmonyAIChat;
