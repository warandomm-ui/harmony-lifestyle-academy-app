import { supabase } from './supabaseClient';

/**
 * Gmail Connector
 *
 * MCP Server: gmail
 * Capabilities: send_email, read_email, search_emails, create_draft, list_labels
 *
 * All calls are proxied through Supabase Edge Functions so that OAuth
 * tokens and secrets never reach the browser.
 */

const EDGE_FN = 'gmail-proxy';

export interface EmailMessage {
  id?: string;
  threadId?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface EmailSummary {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  labelIds: string[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
}

async function callEdgeFunction<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(EDGE_FN, {
    body: { action, ...payload },
  });

  if (error) throw new Error(`[Gmail] ${action} failed: ${error.message}`);
  return data as T;
}

/** Send an email. */
export async function sendEmail(message: EmailMessage): Promise<{ id: string }> {
  return callEdgeFunction<{ id: string }>('send_email', { message });
}

/** Read a single email by ID. */
export async function readEmail(messageId: string): Promise<EmailMessage & { from: string; date: string }> {
  return callEdgeFunction('read_email', { messageId });
}

/** Search emails with a Gmail query string. */
export async function searchEmails(query: string, maxResults = 20): Promise<EmailSummary[]> {
  return callEdgeFunction<EmailSummary[]>('search_emails', { query, maxResults });
}

/** Create a draft (does not send). */
export async function createDraft(message: EmailMessage): Promise<{ id: string }> {
  return callEdgeFunction<{ id: string }>('create_draft', { message });
}

/** List all labels in the mailbox. */
export async function listLabels(): Promise<GmailLabel[]> {
  return callEdgeFunction<GmailLabel[]>('list_labels');
}
