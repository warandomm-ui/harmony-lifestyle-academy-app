import { supabase } from './supabaseClient';

/**
 * Google Drive Connector
 *
 * MCP Server: google-drive
 * Capabilities: search_files, read_file, list_files, create_file, share_file
 *
 * All calls are proxied through Supabase Edge Functions so that OAuth
 * tokens and secrets never reach the browser.
 */

const EDGE_FN = 'google-drive-proxy';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  parents?: string[];
}

export interface DriveSearchResult {
  files: DriveFile[];
  nextPageToken?: string;
}

async function callEdgeFunction<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(EDGE_FN, {
    body: { action, ...payload },
  });

  if (error) throw new Error(`[GoogleDrive] ${action} failed: ${error.message}`);
  return data as T;
}

/** Search files by query string (Google Drive query syntax). */
export async function searchFiles(query: string, pageSize = 20): Promise<DriveSearchResult> {
  return callEdgeFunction<DriveSearchResult>('search_files', { query, pageSize });
}

/** Read file metadata and content link by ID. */
export async function readFile(fileId: string): Promise<DriveFile & { content?: string }> {
  return callEdgeFunction('read_file', { fileId });
}

/** List files in a folder (or root). */
export async function listFiles(folderId?: string, pageSize = 50): Promise<DriveSearchResult> {
  return callEdgeFunction<DriveSearchResult>('list_files', { folderId, pageSize });
}

/** Create a new file (Google Doc, Sheet, etc.). */
export async function createFile(
  name: string,
  mimeType: string,
  parentFolderId?: string,
  content?: string
): Promise<DriveFile> {
  return callEdgeFunction<DriveFile>('create_file', { name, mimeType, parentFolderId, content });
}

/** Share a file with a user or domain. */
export async function shareFile(
  fileId: string,
  email: string,
  role: 'reader' | 'writer' | 'commenter' = 'reader'
): Promise<{ permissionId: string }> {
  return callEdgeFunction<{ permissionId: string }>('share_file', { fileId, email, role });
}
