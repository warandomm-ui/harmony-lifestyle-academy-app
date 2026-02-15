
import React, { useState } from 'react';
import { CashIcon, TrendingUpIcon, DownloadIcon } from '../Icons';
import { exportToCSV } from '../../../utils/exportUtils';

const StatCard: React.FC<{ title: string; value: string; trend: string; positive: boolean }> = ({ title, value, trend, positive }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <div className="flex items-end justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
            <span className={`text-sm font-bold px-2 py-1 rounded-lg ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend}
            </span>
        </div>
    </div>
);

const AdminRevenuePage: React.FC = () => {
    // Mock transaction data
    const transactions = [
        { id: 'tx1', user: 'Ali B.', email: 'ali@test.com', item: 'Pro Plan (Monthly)', amount: 25.00, date: '2024-08-24 14:30' },
        { id: 'tx2', user: 'Sarah T.', email: 'sarah@test.com', item: 'Harmony Hoodie', amount: 120.00, date: '2024-08-24 14:15' },
        { id: 'tx3', user: 'Ken L.', email: 'ken@test.com', item: 'Python Course', amount: 50.00, date: '2024-08-24 13:00' },
        { id: 'tx4', user: 'Mei Ling', email: 'mei@test.com', item: 'Pro Plan (Yearly)', amount: 250.00, date: '2024-08-24 11:00' },
        { id: 'tx5', user: 'Raj P.', email: 'raj@test.com', item: 'E-Book: Sejarah', amount: 15.00, date: '2024-08-24 09:30' },
    ];

    const handleExport = () => {
        exportToCSV(transactions, `harmony_revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <TrendingUpIcon className="h-8 w-8 text-green-600" />
                        Cashflow Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Financial performance & live sales feed.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="bg-gray-800 dark:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition flex items-center gap-2"
                >
                    <DownloadIcon className="h-5 w-5" />
                    Export to CSV
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Revenue (YTD)" value="RM 124,500" trend="+18.2%" positive={true} />
                <StatCard title="Monthly Recurring (MRR)" value="RM 12,400" trend="+5.4%" positive={true} />
                <StatCard title="Avg. Revenue Per User" value="RM 45.00" trend="-1.2%" positive={false} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Revenue Growth (6 Months)</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 px-4">
                        {[40, 55, 45, 70, 65, 85].map((h, i) => (
                            <div key={i} className="w-full bg-green-500/20 hover:bg-green-500/40 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                                <div className="absolute bottom-0 w-full bg-green-500 rounded-t-lg" style={{ height: '20%' }}></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                    RM {(h * 150).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
                        <span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Real-time Sales Feed</h3>
                    <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{tx.user}</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 rounded">{tx.email}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{tx.item}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600 dark:text-green-400">RM {tx.amount.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">{tx.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenuePage;
