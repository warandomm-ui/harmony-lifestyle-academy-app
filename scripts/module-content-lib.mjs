// Shared loader for the curated module content in content/modules/*.json.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT_DIR = join(ROOT, 'content', 'modules');

/** Stable primary key for a topic row: "<moduleId>/<slug>". */
export const topicId = (moduleId, slug) => `${moduleId}/${slug}`;

/** All modules, sorted by their `order` field. Throws on unparseable JSON. */
export function loadModules() {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, ...JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8')) }))
    .sort((a, b) => a.order - b.order);
}
