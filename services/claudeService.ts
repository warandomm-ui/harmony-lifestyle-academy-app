/**
 * Claude Service — thin wrapper around HarmonyConnector
 *
 * Previously called the Anthropic SDK directly from the browser,
 * exposing the API key. Now delegates to the secure Harmony Connector
 * which routes all requests through the Supabase Edge Function.
 */

export {
  generateModuleContent,
  clearModuleContentCache,
} from './harmonyConnector';
