import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from './exportUtils';

/**
 * exportToCSV builds a CSV in memory, wraps it in a Blob and clicks a synthetic
 * anchor. jsdom has no URL.createObjectURL, so we stub it and capture the Blob
 * to read back exactly what would have been downloaded.
 *
 * The escaping here is a security control — it defuses CSV formula injection,
 * where a cell beginning with =, +, - or @ is executed by Excel/Sheets when the
 * exported file is opened. AdminRevenuePage exports transaction data, so the
 * content is not fully under our control.
 */

let capturedBlob: Blob | null = null;
let clickCount = 0;

beforeEach(() => {
  capturedBlob = null;
  clickCount = 0;

  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock';
    }),
    revokeObjectURL: vi.fn(),
  });

  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
    clickCount += 1;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const csvFor = async (data: any[]): Promise<string> => {
  exportToCSV(data, 'report.csv');
  if (!capturedBlob) throw new Error('no blob was produced');
  return capturedBlob.text();
};

const rowsOf = async (data: any[]): Promise<string[]> => (await csvFor(data)).split('\n');

describe('empty input', () => {
  it('does nothing for an empty array', () => {
    exportToCSV([], 'report.csv');
    expect(capturedBlob).toBeNull();
    expect(clickCount).toBe(0);
  });

  it('does nothing for null or undefined', () => {
    exportToCSV(null as unknown as any[], 'report.csv');
    exportToCSV(undefined as unknown as any[], 'report.csv');
    expect(capturedBlob).toBeNull();
    expect(clickCount).toBe(0);
  });
});

describe('structure', () => {
  it('writes a header row from the keys of the first object', async () => {
    const rows = await rowsOf([{ id: 1, name: 'Aisyah' }]);
    expect(rows[0]).toBe('id,name');
  });

  it('writes one row per record', async () => {
    const rows = await rowsOf([
      { id: 1, name: 'Aisyah' },
      { id: 2, name: 'Mei Ling' },
    ]);

    expect(rows).toEqual(['id,name', '1,Aisyah', '2,Mei Ling']);
  });

  it('triggers exactly one download', async () => {
    await csvFor([{ id: 1 }]);
    expect(clickCount).toBe(1);
  });

  it('emits a text/csv blob', async () => {
    await csvFor([{ id: 1 }]);
    expect(capturedBlob!.type).toBe('text/csv;charset=utf-8;');
  });

  // Documents a real limitation rather than desired behaviour: the key set is
  // taken from data[0] only, so any field absent from the first record is
  // silently dropped for every record.
  it('drops columns that are missing from the first record', async () => {
    const rows = await rowsOf([{ id: 1 }, { id: 2, email: 'a@b.my' }]);

    expect(rows[0]).toBe('id');
    expect(rows[2]).toBe('2');
    expect(rows.join('\n')).not.toContain('a@b.my');
  });
});

describe('formula injection escaping', () => {
  it.each([
    ['=SUM(1+1)', "'=SUM(1+1)"],
    ['+1234', "'+1234"],
    ['-1234', "'-1234"],
    ['@user', "'@user"],
  ])('prefixes %s with an apostrophe', async (input, expected) => {
    const rows = await rowsOf([{ note: input }]);
    expect(rows[1]).toBe(expected);
  });

  it.each([
    ['\tleading tab'],
    ['\rleading carriage return'],
  ])('prefixes control character %j', async input => {
    const rows = await rowsOf([{ note: input }]);
    expect(rows[1].startsWith("'")).toBe(true);
  });

  it('quotes a neutralised formula that also contains a comma', async () => {
    const rows = await rowsOf([{ note: '=SUM(A1,A2)' }]);
    // Escaped first, then quoted because of the embedded comma.
    expect(rows[1]).toBe('"\'=SUM(A1,A2)"');
  });

  it('leaves a negative number as an escaped string', async () => {
    // Worth knowing: this is why exported negative amounts read as text in
    // Excel. The security trade-off is deliberate.
    const rows = await rowsOf([{ amount: -50 }]);
    expect(rows[1]).toBe("'-50");
  });

  it('does not escape a value that merely contains a formula character', async () => {
    const rows = await rowsOf([{ note: 'a=b' }]);
    expect(rows[1]).toBe('a=b');
  });
});

describe('CSV quoting', () => {
  it('doubles embedded quotes and wraps the cell', async () => {
    const rows = await rowsOf([{ note: 'He said "hi"' }]);
    expect(rows[1]).toBe('"He said ""hi"""');
  });

  it('wraps cells containing a comma', async () => {
    const rows = await rowsOf([{ note: 'Kuala Lumpur, Malaysia' }]);
    expect(rows[1]).toBe('"Kuala Lumpur, Malaysia"');
  });

  it('wraps cells containing a newline', async () => {
    const rows = await csvFor([{ note: 'line one\nline two' }]);
    expect(rows).toContain('"line one\nline two"');
  });

  it('leaves plain values unquoted', async () => {
    const rows = await rowsOf([{ note: 'plain value' }]);
    expect(rows[1]).toBe('plain value');
  });
});

describe('value coercion', () => {
  it('renders null and undefined as empty cells', async () => {
    const rows = await rowsOf([{ a: null, b: undefined, c: 'x' }]);
    expect(rows[1]).toBe(',,x');
  });

  it('renders 0 and false rather than treating them as empty', async () => {
    const rows = await rowsOf([{ a: 0, b: false }]);
    expect(rows[1]).toBe('0,false');
  });

  it('formats Date values with toLocaleString', async () => {
    const date = new Date('2026-08-13T10:30:00Z');
    const rows = await rowsOf([{ when: date }]);

    const expected = date.toLocaleString();
    // toLocaleString output may itself contain a comma, in which case it is
    // quoted like any other cell.
    expect(rows[1]).toBe(
      expected.search(/("|,|\n)/g) >= 0 ? `"${expected}"` : expected,
    );
  });

  it('preserves unicode and emoji', async () => {
    const rows = await rowsOf([{ note: 'Selamat pagi 🌅 مرحبا' }]);
    expect(rows[1]).toBe('Selamat pagi 🌅 مرحبا');
  });
});
