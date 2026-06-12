// ═══════════════════════════════════════════════
// FILE: components/PaymentSuccessPage.tsx
// Landing page selepas redirect dari ToyyibPay
// ToyyibPay redirect ke /payment/success?status_id=1&billcode=...&order_id=...
// status_id: 1 = success, 2 = pending, 3 = fail
// Aktivasi sebenar berlaku melalui /api/toyyibpay/callback (server-side);
// page ini untuk paparan sahaja.
// ═══════════════════════════════════════════════

const STATUS = {
  '1': {
    icon: '🎉',
    title: 'Pembayaran Berjaya!',
    message:
      'Terima kasih! Langganan premium kamu sedang diaktifkan — biasanya serta-merta. Kalau status belum berubah, tunggu seminit dan refresh.',
  },
  '2': {
    icon: '⏳',
    title: 'Pembayaran Dalam Proses',
    message:
      'Bayaran kamu sedang diproses oleh bank. Langganan akan aktif secara automatik sebaik sahaja pembayaran disahkan.',
  },
  '3': {
    icon: '😔',
    title: 'Pembayaran Tidak Berjaya',
    message:
      'Bayaran tidak dapat diproses. Tiada caj dikenakan. Cuba lagi atau guna kaedah pembayaran lain.',
  },
} as const;

export default function PaymentSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const statusId = (params.get('status_id') || '2') as keyof typeof STATUS;
  const status = STATUS[statusId] || STATUS['2'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d1b2a]">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a3e] bg-[#161625] p-8 text-center shadow-2xl">
        <div className="text-5xl mb-4">{status.icon}</div>
        <h1 className="text-2xl font-bold text-white mb-3">{status.title}</h1>
        <p className="text-sm text-[#8888aa] mb-8">{status.message}</p>

        <button
          onClick={() => { window.location.href = '/'; }}
          className="w-full rounded-xl bg-[#C9A84C] py-3.5 font-bold text-black hover:bg-[#d9b85c] transition"
        >
          Kembali ke Dashboard
        </button>

        <p className="mt-5 text-xs text-[#8888aa]">
          Ada masalah? Hubungi kami dan sertakan bill code:{' '}
          <span className="font-mono text-[#C9A84C]">{params.get('billcode') || '-'}</span>
        </p>
      </div>
    </div>
  );
}
