
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
    // No payment provider is connected yet, so there are no transactions to show.
    // Replace with real records once payments are live.
    const transactions: { id: string; user: string; email: string; item: string; amount: number; date: string }[] = [];

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
                    disabled={transactions.length === 0}
                    className="bg-gray-800 dark:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="h-5 w-5" />
                    Export to CSV
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Revenue (YTD)" value="—" trend="Tiada data" positive={true} />
                <StatCard title="Monthly Recurring (MRR)" value="—" trend="Tiada data" positive={true} />
                <StatCard title="Avg. Revenue Per User" value="—" trend="Tiada data" positive={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Revenue Growth (6 Months)</h3>
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        Carta akan dipaparkan apabila ada data jualan sebenar.
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Real-time Sales Feed</h3>
                    <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                        {transactions.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Belum ada jualan.</p>
                        )}
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
