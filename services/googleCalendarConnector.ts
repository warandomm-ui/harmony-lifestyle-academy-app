import { supabase } from './supabaseClient';

/**
 * Google Calendar Connector
 *
 * MCP Server: google-calendar
 * Capabilities: list_events, create_event, update_event, delete_event, list_calendars
 *
 * All calls are proxied through Supabase Edge Functions so that OAuth
 * tokens and secrets never reach the browser.
 */

const EDGE_FN = 'google-calendar-proxy';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  location?: string;
  attendees?: string[];
  recurrence?: string[];
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  primary: boolean;
}

async function callEdgeFunction<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(EDGE_FN, {
    body: { action, ...payload },
  });

  if (error) throw new Error(`[GoogleCalendar] ${action} failed: ${error.message}`);
  return data as T;
}

/** List calendars accessible to the authenticated user. */
export async function listCalendars(): Promise<CalendarListEntry[]> {
  return callEdgeFunction<CalendarListEntry[]>('list_calendars');
}

/** List events within a date range. */
export async function listEvents(
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  return callEdgeFunction<CalendarEvent[]>('list_events', { calendarId, timeMin, timeMax });
}

/** Create a new calendar event. */
export async function createEvent(
  calendarId: string,
  event: CalendarEvent
): Promise<CalendarEvent> {
  return callEdgeFunction<CalendarEvent>('create_event', { calendarId, event });
}

/** Update an existing event. */
export async function updateEvent(
  calendarId: string,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  return callEdgeFunction<CalendarEvent>('update_event', { calendarId, eventId, updates });
}

/** Delete an event. */
export async function deleteEvent(calendarId: string, eventId: string): Promise<void> {
  await callEdgeFunction<void>('delete_event', { calendarId, eventId });
}
