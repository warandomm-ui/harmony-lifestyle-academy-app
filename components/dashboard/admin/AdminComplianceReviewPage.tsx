import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import {
  decideReview, isComplianceReviewer, listReviews,
  type ComplianceReviewItem, type ReviewStatus,
} from '../../../services/complianceReviewService';

const MAQSAD_LABEL: Record<string, string> = {
  din: 'Agama (Akidah)',
  aql: 'Akal',
  karamah: 'Maruah',
  nafs: 'Keselamatan',
  data: 'Integriti Data',
  competence: 'Had Kompetensi AI',
};

const SEVERITY_STYLE: Record<string, string> = {
  block: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  hold: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  redact: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  notice: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const TABS: { id: ReviewStatus; label: string }[] = [
  { id: 'pending', label: 'Menunggu' },
  { id: 'blocked', label: 'Disekat' },
  { id: 'approved', label: 'Diluluskan' },
  { id: 'rejected', label: 'Ditolak' },
];

const ReviewCard: React.FC<{ item: ComplianceReviewItem; onDecided: () => void }> = ({ item, onDecided }) => {
  const { addToast } = useToast();
  const [note, setNote] = useState('');
  const [released, setReleased] = useState(item.held_content);
  const [busy, setBusy] = useState(false);
  const pending = item.status === 'pending';

  const decide = async (decision: 'approved' | 'rejected') => {
    setBusy(true);
    try {
      await decideReview(item.id, decision, { note, releasedContent: released });
      addToast(decision === 'approved' ? 'Kandungan diluluskan dan dilepaskan kepada pelajar.' : 'Kandungan ditolak.', 'success');
      onDecided();
    } catch (e: any) {
      addToast(e.message || 'Gagal menyimpan keputusan.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-mono">#{item.id.slice(0, 8)} · {item.action} · {item.model || '—'}</span>
        <time>{new Date(item.created_at).toLocaleString('ms-MY')}</time>
      </header>

      <ul className="space-y-2">
        {item.findings.map((f, i) => (
          <li key={i} className="text-sm">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mr-2 ${SEVERITY_STYLE[f.severity]}`}>
              {f.severity.toUpperCase()}
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{MAQSAD_LABEL[f.maqsad] ?? f.maqsad}</span>
            <span className="text-gray-600 dark:text-gray-300"> — {f.reason}</span>
            {f.excerpt && (
              <q className="block mt-1 ml-1 text-xs italic text-gray-500 dark:text-gray-400 break-words">{f.excerpt}</q>
            )}
          </li>
        ))}
      </ul>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
          {pending ? 'Kandungan (boleh dibetulkan sebelum dilepaskan)' : 'Kandungan yang ditahan'}
        </label>
        {pending ? (
          <textarea
            value={released}
            onChange={(e) => setReleased(e.target.value)}
            rows={8}
            dir="auto"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-800 dark:text-gray-100 font-mono"
          />
        ) : (
          <pre dir="auto" className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-800 dark:text-gray-100 max-h-64 overflow-y-auto">
            {item.status === 'approved' ? item.released_content : item.held_content}
          </pre>
        )}
      </div>

      {pending ? (
        <div className="space-y-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan penyemak (wajib): rujukan yang disemak, pembetulan, sebab keputusan"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100"
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              disabled={busy || !note.trim()}
              onClick={() => decide('rejected')}
              className="px-4 py-2.5 rounded-full font-bold text-red-600 border border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 min-h-[44px]"
            >
              Tolak
            </button>
            <button
              disabled={busy || !note.trim() || !released.trim()}
              onClick={() => decide('approved')}
              className="px-4 py-2.5 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 min-h-[44px]"
            >
              Sahkan & Lepaskan
            </button>
          </div>
        </div>
      ) : (
        item.reviewer_note && (
          <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Catatan penyemak:</strong> {item.reviewer_note}</p>
        )
      )}
    </article>
  );
};

const AdminComplianceReviewPage: React.FC = () => {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<ReviewStatus>('pending');
  const [items, setItems] = useState<ComplianceReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { isComplianceReviewer().then(setAllowed); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listReviews(tab));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Semakan Pematuhan AI</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Output AI yang diragui atau melebihi kompetensi AI ditahan di sini sehingga disahkan oleh penyemak bertauliah.
        </p>
      </div>

      {allowed === false && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          Akaun anda belum didaftarkan sebagai penyemak. Pemilik projek perlu menambah anda ke jadual
          <code className="mx-1">ai_compliance_reviewers</code> (lihat <code>supabase/ai_compliance_schema.sql</code>).
        </div>
      )}

      {allowed && (
        <>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  tab === t.id ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
            <button onClick={load} className="ml-auto px-4 py-2 rounded-full text-sm font-bold text-green-700 dark:text-green-400 hover:underline">
              Muat semula
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-gray-500">Memuatkan…</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Tiada item dalam kategori ini.</p>
          )}
          <div className="space-y-4">
            {items.map((item) => <ReviewCard key={item.id} item={item} onDecided={load} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminComplianceReviewPage;
