
import React, { useState } from 'react';
import { UsersIcon, CheckCircleIcon, XCircleIcon, LinkIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

interface Affiliate {
    id: string;
    name: string;
    email: string;
    code: string;
    sales: number;
    earnings: string;
    status: 'Approved' | 'Pending';
}

const AdminAffiliatesPage: React.FC = () => {
    const { addToast } = useToast();
    const [affiliates, setAffiliates] = useState<Affiliate[]>([
        { id: '1', name: 'Aina C.', email: 'aina@example.com', code: 'AINA10', sales: 12, earnings: 'RM 360', status: 'Approved' },
        { id: '2', name: 'Bala S.', email: 'bala@example.com', code: 'BALA_POWER', sales: 0, earnings: 'RM 0', status: 'Pending' },
    ]);

    const handleApprove = (id: string) => {
        setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
        addToast('Affiliate approved.', 'success');
    };

    const handleReject = (id: string) => {
        setAffiliates(prev => prev.filter(a => a.id !== id));
        addToast('Affiliate application rejected.', 'info');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-blue-500" />
                        Affiliate Partners
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage influencers and students promoting Harmony.</p>
                </div>
                <button className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Generate Invite Link
                </button>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                            <th className="px-6 py-4">Partner</th>
                            <th className="px-6 py-4">Referral Code</th>
                            <th className="px-6 py-4 text-center">Total Sales</th>
                            <th className="px-6 py-4">Earnings</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {affiliates.map(affiliate => (
                            <tr key={affiliate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{affiliate.name}</p>
                                        <p className="text-xs text-gray-500">{affiliate.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                                        {affiliate.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-gray-800 dark:text-gray-200">{affiliate.sales}</td>
                                <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">{affiliate.earnings}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        affiliate.status === 'Approved' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                        {affiliate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {affiliate.status === 'Pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleApprove(affiliate.id)} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Approve">
                                                <CheckCircleIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleReject(affiliate.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="Reject">
                                                <XCircleIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Active</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAffiliatesPage;
