import { supabase } from './supabaseClient';

/**
 * Asana Connector
 *
 * MCP Server: asana
 * Capabilities: list_tasks, create_task, update_task, list_projects, search_tasks
 *
 * All calls are proxied through Supabase Edge Functions so that API
 * tokens never reach the browser.
 */

const EDGE_FN = 'asana-proxy';

export interface AsanaTask {
  gid?: string;
  name: string;
  notes?: string;
  due_on?: string;      // YYYY-MM-DD
  assignee?: string;    // user GID
  completed?: boolean;
  projects?: string[];  // project GIDs
  tags?: string[];
}

export interface AsanaProject {
  gid: string;
  name: string;
  color: string;
  archived: boolean;
}

async function callEdgeFunction<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(EDGE_FN, {
    body: { action, ...payload },
  });

  if (error) throw new Error(`[Asana] ${action} failed: ${error.message}`);
  return data as T;
}

/** List tasks in a project. */
export async function listTasks(projectGid: string): Promise<AsanaTask[]> {
  return callEdgeFunction<AsanaTask[]>('list_tasks', { projectGid });
}

/** Create a new task. */
export async function createTask(task: AsanaTask): Promise<AsanaTask> {
  return callEdgeFunction<AsanaTask>('create_task', { task });
}

/** Update an existing task. */
export async function updateTask(taskGid: string, updates: Partial<AsanaTask>): Promise<AsanaTask> {
  return callEdgeFunction<AsanaTask>('update_task', { taskGid, updates });
}

/** List all projects in the workspace. */
export async function listProjects(): Promise<AsanaProject[]> {
  return callEdgeFunction<AsanaProject[]>('list_projects');
}

/** Search tasks by text query. */
export async function searchTasks(query: string, projectGid?: string): Promise<AsanaTask[]> {
  return callEdgeFunction<AsanaTask[]>('search_tasks', { query, projectGid });
}
