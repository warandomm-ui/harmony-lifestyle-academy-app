import type { ConnectorConfig } from '../types';

/**
 * HLA Connector Registry
 *
 * Each entry maps a functional category to the specific tool used by
 * Harmony Lifestyle Academy. Connectors with an `mcpServer` value can
 * be orchestrated through MCP; those without require direct API / SDK
 * integration or manual workflows.
 */
export const HLA_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'google-calendar',
    category: 'calendar',
    name: 'Google Calendar',
    description: 'Sync timetable entries, class schedules, and study sessions.',
    icon: '📅',
    color: 'bg-blue-100 text-blue-600',
    mcpServer: 'google-calendar',
    status: 'disconnected',
    lastSynced: null,
    capabilities: [
      'list_events',
      'create_event',
      'update_event',
      'delete_event',
      'list_calendars',
    ],
  },
  {
    id: 'gmail',
    category: 'email',
    name: 'Gmail',
    description: 'Send course notifications, receipts, and engagement emails.',
    icon: '✉️',
    color: 'bg-red-100 text-red-600',
    mcpServer: 'gmail',
    status: 'disconnected',
    lastSynced: null,
    capabilities: [
      'send_email',
      'read_email',
      'search_emails',
      'create_draft',
      'list_labels',
    ],
  },
  {
    id: 'asana',
    category: 'project-tracker',
    name: 'Asana',
    description: 'Track academy projects, student tasks, and team workflows.',
    icon: '🎯',
    color: 'bg-orange-100 text-orange-600',
    mcpServer: 'asana',
    status: 'disconnected',
    lastSynced: null,
    capabilities: [
      'list_tasks',
      'create_task',
      'update_task',
      'list_projects',
      'search_tasks',
    ],
  },
  {
    id: 'google-drive',
    category: 'knowledge-base',
    name: 'Google Drive',
    description: 'Access course materials, lesson plans, and shared resources.',
    icon: '📁',
    color: 'bg-green-100 text-green-600',
    mcpServer: 'google-drive',
    status: 'disconnected',
    lastSynced: null,
    capabilities: [
      'search_files',
      'read_file',
      'list_files',
      'create_file',
      'share_file',
    ],
  },
  {
    id: 'google-workspace',
    category: 'office-suite',
    name: 'Google Workspace',
    description: 'Docs, Sheets & Slides for collaborative course creation.',
    icon: '📝',
    color: 'bg-yellow-100 text-yellow-700',
    mcpServer: null, // no dedicated MCP server — uses Drive + Docs APIs
    status: 'disconnected',
    lastSynced: null,
    capabilities: [
      'create_document',
      'create_spreadsheet',
      'create_presentation',
    ],
  },
  {
    id: 'whatsapp-telegram',
    category: 'team-chat',
    name: 'WhatsApp + Telegram',
    description: 'Community chat channels for student support and announcements.',
    icon: '💬',
    color: 'bg-emerald-100 text-emerald-600',
    mcpServer: null, // no MCP server available — manual / webhook integration
    status: 'disconnected',
    lastSynced: null,
    capabilities: [
      'send_message',
      'broadcast_announcement',
    ],
  },
];

/** Look up a connector by its ID. */
export function getConnector(id: string): ConnectorConfig | undefined {
  return HLA_CONNECTORS.find((c) => c.id === id);
}

/** Return only connectors that have an MCP server configured. */
export function getMcpConnectors(): ConnectorConfig[] {
  return HLA_CONNECTORS.filter((c) => c.mcpServer !== null);
}

/** Category display labels */
export const CATEGORY_LABELS: Record<string, string> = {
  'calendar': 'Calendar',
  'email': 'Email',
  'project-tracker': 'Project Tracker',
  'knowledge-base': 'Knowledge Base',
  'office-suite': 'Office Suite',
  'team-chat': 'Team Chat',
};
