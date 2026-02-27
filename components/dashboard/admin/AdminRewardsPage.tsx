
import React, { useState, useMemo } from 'react';
import { MOCK_STUDENT_REWARD_DATA, MOCK_PROFIT_POOL_DATA } from '../../../constants';
import type { StudentRewardInfo, PayoutStatus } from '../../../types';
import { CashIcon, UsersIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, XIcon, PieChartIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

// --- Stat Card Component ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
            </div>
            <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                {icon}
            </div>
        </div>
    </div>
);

// --- Confirmation Modal ---
const ConfirmationModal: React.FC<{ student: StudentRewardInfo; onConfirm: () => void; onCancel: () => void; }> = ({ student, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in-fast">
        <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md">
            <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">Confirm Payout Approval</h2>
                <p className="text-sm text-[var(--muted)] mt-2">
                    Are you sure you want to approve a payout of <strong className="text-[var(--primary)]">{student.suggested_payout} Harmony Coins</strong> to <strong>{student.name}</strong>?
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">This action cannot be undone.</p>
            </div>
            <div className="px-4 sm:px-6 py-4 bg-[var(--background)] flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-2xl">
                <button onClick={onCancel} className="px-4 py-2.5 rounded-full font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition min-h-[44px]">
                    Cancel
                </button>
                <button onClick={onConfirm} className="bg-green-600 text-white font-bold py-2.5 px-4 rounded-full hover:bg-green-700 transition min-h-[44px]">
                    Confirm & Approve
                </button>
            </div>
        </div>
    </div>
);

// --- Admin Rewards Page ---
const AdminRewardsPage: React.FC = () => {
    const { addToast } = useToast();
    const [payouts, setPayouts] = useState<StudentRewardInfo[]>(MOCK_STUDENT_REWARD_DATA);
    const [profitPool] = useState(MOCK_PROFIT_POOL_DATA);
    const [payoutToConfirm, setPayoutToConfirm] = useState<StudentRewardInfo | null>(null);

    const totalSuggestedPayout = useMemo(() => {
        return payouts.reduce((sum, p) => sum + p.suggested_payout, 0);
    }, [payouts]);

    const handleUpdateStatus = (studentId: string, newStatus: PayoutStatus) => {
        setPayouts(prev => prev.map(p => p.student_id === studentId ? { ...p, status: newStatus } : p));
    };

    const handleApproveClick = (student: StudentRewardInfo) => {
        setPayoutToConfirm(student);
    };

    const handleConfirmApprove = () => {
        if (payoutToConfirm) {
            handleUpdateStatus(payoutToConfirm.student_id, 'approved');
            addToast(`Payout for ${payoutToConfirm.name} approved!`, 'success');
            setPayoutToConfirm(null);
        }
    };
    
    const handleReject = (student: StudentRewardInfo) => {
        handleUpdateStatus(student.student_id, 'rejected');
        addToast(`Payout for ${student.name} rejected.`, 'info');
    };

    const getStatusComponent = (status: PayoutStatus) => {
        switch (status) {
            case 'approved':
                return <span className="flex items-center gap-1 text-sm font-semibold text-green-600"><CheckCircleIcon className="h-4 w-4" /> Approved</span>;
            case 'rejected':
                return <span className="flex items-center gap-1 text-sm font-semibold text-red-500"><XCircleIcon className="h-4 w-4" /> Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {payoutToConfirm && (
                <ConfirmationModal 
                    student={payoutToConfirm} 
                    onConfirm={handleConfirmApprove}
                    onCancel={() => setPayoutToConfirm(null)}
                />
            )}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Profit-Sharing & Rewards</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Review and approve AI-suggested payouts for {profitPool.month}.</p>
                </div>
                {/* Navigation to Profit Sharing Page is handled via Sidebar, but adding a quick link here helps workflow */}
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--secondary)]/50 text-[var(--foreground)] rounded-lg font-bold hover:bg-[var(--secondary)] transition cursor-default opacity-50" title="Use sidebar to manage cycles">
                    <PieChartIcon className="h-5 w-5" />
                    Manage Cycles
                </button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Profit Pool" value={`${profitPool.total_pool_amount.toLocaleString()} Coins`} icon={<SparklesIcon className="h-6 w-6 text-[var(--primary)]" />} />
                <StatCard title="Eligible Students" value={profitPool.eligible_students.toString()} icon={<UsersIcon className="h-6 w-6 text-[var(--primary)]" />} />
                <StatCard title="Total Suggested Payout" value={`${totalSuggestedPayout.toLocaleString()} Coins`} icon={<CashIcon className="h-6 w-6 text-[var(--primary)]" />} />
            </section>
            
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Student</th>
                                <th scope="col" className="px-6 py-3">Level</th>
                                <th scope="col" className="px-6 py-3">Progress</th>
                                <th scope="col" className="px-6 py-3">Contribution</th>
                                <th scope="col" className="px-6 py-3">Harmony Coins</th>
                                <th scope="col" className="px-6 py-3">Suggested Payout</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((p) => (
                                <tr key={p.student_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className="text-2xl">{p.avatar}</span>
                                        <span>{p.name}</span>
                                    </td>
                                    <td className="px-6 py-4">{p.level}</td>
                                    <td className="px-6 py-4">{p.progress_score}%</td>
                                    <td className="px-6 py-4">{p.contribution_points} pts</td>
                                    <td className="px-6 py-4">{p.harmony_coins.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold py-1.5 px-4 rounded-full text-base inline-flex items-center gap-2">
                                            <SparklesIcon className="h-5 w-5" />
                                            {p.suggested_payout.toLocaleString()} Coins
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {p.status === 'suggested' ? (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleApproveClick(p)} className="font-medium text-green-600 dark:text-green-500 hover:underline">Approve</button>
                                                <button onClick={() => handleReject(p)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Reject</button>
                                            </div>
                                        ) : (
                                            getStatusComponent(p.status)
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminRewardsPage;