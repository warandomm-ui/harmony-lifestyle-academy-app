/**
 * HarmonyConnectorContext
 *
 * Provides React components with access to the Claude AI connector,
 * including connection status tracking and convenience methods.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import * as connector from '../services/harmonyConnector';
import type {
  HarmonyConnectorAction,
  HarmonyConnectorMessage,
  HarmonyConnectorStatus,
  GeneratedModuleContent,
} from '../types';
import { useAuth } from './AuthContext';

// ── Context value shape ──────────────────────────────────────────────────────
interface HarmonyConnectorContextValue {
  /** Current connection / loading status */
  status: HarmonyConnectorStatus;

  /** Free-form chat with Harmony AI */
  chat: (
    messages: HarmonyConnectorMessage[],
    options?: { system?: string; model?: string; maxTokens?: number; temperature?: number },
  ) => Promise<string>;

  /** Generate a structured lesson + quiz + reflection */
  generateModuleContent: (
    moduleName: string,
    topic: string,
    context?: string,
  ) => Promise<GeneratedModuleContent>;

  /** Run a JSON-returning analysis prompt */
  analyze: <T = any>(prompt: string, options?: { model?: string; maxTokens?: number }) => Promise<T>;

  /** Study buddy interaction */
  studyBuddy: (
    messages: HarmonyConnectorMessage[],
    options?: { model?: string; maxTokens?: number },
  ) => Promise<string>;

  /** Spiritual guidance */
  spiritualGuidance: (
    prompt: string,
    options?: { model?: string; maxTokens?: number },
  ) => Promise<any>;

  /** Manually re-check the connection */
  checkConnection: () => Promise<boolean>;
}

const HarmonyConnectorContext = createContext<HarmonyConnectorContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export const HarmonyConnectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [status, setStatus] = useState<HarmonyConnectorStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastAction: null,
  });

  // Track in-flight requests
  const inflightRef = useRef(0);

  const wrapCall = useCallback(
    <T,>(action: HarmonyConnectorAction, fn: () => Promise<T>): Promise<T> => {
      inflightRef.current += 1;
      setStatus(s => ({ ...s, isLoading: true, error: null, lastAction: action }));

      return fn()
        .then(result => {
          inflightRef.current -= 1;
          setStatus(s => ({
            ...s,
            isConnected: true,
            isLoading: inflightRef.current > 0,
            error: null,
          }));
          return result;
        })
        .catch(err => {
          inflightRef.current -= 1;
          const message = err?.message || 'Unknown connector error';
          setStatus(s => ({
            ...s,
            isLoading: inflightRef.current > 0,
            error: message,
          }));
          throw err;
        });
    },
    [],
  );

  // Auto-check connection when user signs in
  useEffect(() => {
    if (user) {
      connector.checkConnection().then(ok =>
        setStatus(s => ({ ...s, isConnected: ok })),
      );
    } else {
      setStatus({ isConnected: false, isLoading: false, error: null, lastAction: null });
    }
  }, [user]);

  const value: HarmonyConnectorContextValue = {
    status,

    chat: useCallback(
      (messages, options) => wrapCall('chat', () => connector.chat(messages, options)),
      [wrapCall],
    ),

    generateModuleContent: useCallback(
      (moduleName, topic, ctx) =>
        wrapCall('generateContent', () => connector.generateModuleContent(moduleName, topic, ctx)),
      [wrapCall],
    ),

    analyze: useCallback(
      (prompt, options) => wrapCall('analyze', () => connector.analyze(prompt, options)),
      [wrapCall],
    ),

    studyBuddy: useCallback(
      (messages, options) => wrapCall('studyBuddy', () => connector.studyBuddy(messages, options)),
      [wrapCall],
    ),

    spiritualGuidance: useCallback(
      (prompt, options) =>
        wrapCall('spiritualGuidance', () => connector.spiritualGuidance(prompt, options)),
      [wrapCall],
    ),

    checkConnection: useCallback(async () => {
      const ok = await connector.checkConnection();
      setStatus(s => ({ ...s, isConnected: ok }));
      return ok;
    }, []),
  };

  return (
    <HarmonyConnectorContext.Provider value={value}>
      {children}
    </HarmonyConnectorContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useHarmonyConnector(): HarmonyConnectorContextValue {
  const ctx = useContext(HarmonyConnectorContext);
  if (!ctx) {
    throw new Error('useHarmonyConnector must be used within a <HarmonyConnectorProvider>');
  }
  return ctx;
}
