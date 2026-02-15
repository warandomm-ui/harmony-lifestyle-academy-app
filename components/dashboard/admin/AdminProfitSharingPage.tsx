
import React, { useState } from 'react';
import { PieChartIcon, CurrencyDollarIcon, UsersIcon, CheckCircleIcon, ClockIcon, TrendingUpIcon } from '../Icons';
import { MOCK_PROFIT_SHARING_CYCLES } from '../../../constants';
import { useToast } from '../../../contexts/ToastContext';

const AdminProfitSharingPage: React.FC = () => {
    const { addToast } = useToast();
    const [cycles, setCycles] = useState(MOCK_PROFIT_SHARING_CYCLES);

    const handleCalculate = (id: string) => {
        addToast("Initiating AI calculation for this cycle...", "info");
        // Set status to calculating
        setCycles(prev => prev.map(c => c.id === id ? { ...c, status: 'Calculating' } : c));
        
        // Simulate process completion
        setTimeout(() => {
            setCycles(prev => prev.map(c => c.id === id ? { ...c, status: 'Active' } : c));
            addToast("Calculation complete! Review suggested payouts.", "success");
        }, 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Calculating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Distributed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate total distributed so far for a summary card
    const totalDistributed = cycles
        .filter(c => c.status === 'Distributed')
        .reduce((acc, curr) => acc + curr.totalPool, 0);

    const activeCycle = cycles.find(c => c.status === 'Active') || cycles[0];

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <PieChartIcon className="h-8 w-8 text-green-600" />
                    Profit-Sharing Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage profit pools and monthly distribution cycles.</p>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Distributed (YTD)</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                        RM {totalDistributed.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Active Pool ({activeCycle?.month})</p>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            RM {activeCycle?.totalPool.toLocaleString() || '0'}
                        </p>
                        {activeCycle && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12%</span>}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Eligible Students</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {activeCycle?.eligibleStudents || '0'}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Cycle History</h3>
                    <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                            <th className="px-6 py-4">Cycle (Month)</th>
                            <th className="px-6 py-4">Total Pool</th>
                            <th className="px-6 py-4">Eligible Students</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {cycles.length > 0 ? (
                            cycles.map((cycle) => (
                                <tr key={cycle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                                        {cycle.month}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[var(--primary)] font-bold">
                                        <div className="flex items-center gap-1">
                                            <CurrencyDollarIcon className="h-4 w-4" />
                                            {cycle.totalPool.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4 text-gray-400" />
                                            {cycle.eligibleStudents}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(cycle.status)}`}>
                                            {cycle.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {cycle.status === 'Active' && (
                                            <button 
                                                onClick={() => handleCalculate(cycle.id)}
                                                className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-end gap-1 ml-auto"
                                            >
                                                <TrendingUpIcon className="h-4 w-4" />
                                                Calculate Payouts
                                            </button>
                                        )}
                                        {cycle.status === 'Distributed' && (
                                            <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                                <CheckCircleIcon className="h-3 w-3" />
                                                Paid on {cycle.distributedDate}
                                            </span>
                                        )}
                                        {cycle.status === 'Calculating' && (
                                            <span className="text-xs text-yellow-600 animate-pulse flex items-center justify-end gap-1">
                                                <ClockIcon className="h-3 w-3" />
                                                Processing...
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <PieChartIcon className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="font-medium">Profit-sharing data will appear here.</p>
                                        <p className="text-sm mt-1">Start a new cycle to begin distributing rewards.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProfitSharingPage;
