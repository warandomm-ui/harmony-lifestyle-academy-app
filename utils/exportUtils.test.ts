import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportToCSV } from './exportUtils';

describe('exportToCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn<() => void>>;
  let capturedBlob: Blob | undefined;

  beforeEach(() => {
    clickSpy = vi.fn<() => void>();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      clickSpy();
    });
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn((blob: Blob) => {
          capturedBlob = blob;
          return 'blob:mock-url';
        }),
        revokeObjectURL: vi.fn(),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    capturedBlob = undefined;
  });

  const getCsvText = async () => {
    expect(capturedBlob).toBeDefined();
    return capturedBlob!.text();
  };

  it('does nothing when data is empty or missing', () => {
    exportToCSV([], 'file.csv');
    exportToCSV(undefined as unknown as any[], 'file.csv');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('builds a header row from object keys and triggers a download', async () => {
    exportToCSV([{ name: 'Ali', score: 90 }], 'scores.csv');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const text = await getCsvText();
    expect(text).toBe('name,score\nAli,90');
  });

  it('quotes cells containing commas, quotes, or newlines', async () => {
    exportToCSV([{ note: 'hello, "world"\nline2' }], 'notes.csv');
    const text = await getCsvText();
    expect(text).toBe('note\n"hello, ""world""\nline2"');
  });

  it('escapes formula-injection payloads with a leading single quote', async () => {
    exportToCSV(
      [
        { cell: '=SUM(A1:A2)' },
        { cell: '+1+1' },
        { cell: '-1+1' },
        { cell: '@cmd' },
      ],
      'injection.csv'
    );
    const text = await getCsvText();
    const rows = text.split('\n').slice(1);
    expect(rows).toEqual(["'=SUM(A1:A2)", "'+1+1", "'-1+1", "'@cmd"]);
  });

  it('renders null/undefined cells as empty strings', async () => {
    exportToCSV([{ a: null, b: undefined, c: 1 }], 'nulls.csv');
    const text = await getCsvText();
    expect(text).toBe('a,b,c\n,,1');
  });

  it('formats Date cells with toLocaleString', async () => {
    const date = new Date('2024-01-01T00:00:00Z');
    exportToCSV([{ when: date }], 'dates.csv');
    const text = await getCsvText();
    const formatted = date.toLocaleString();
    // toLocaleString() commonly contains a comma, which itself triggers CSV quoting.
    const expectedCell = formatted.includes(',') ? `"${formatted}"` : formatted;
    expect(text).toBe(`when\n${expectedCell}`);
  });
});
