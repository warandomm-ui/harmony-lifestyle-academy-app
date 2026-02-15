import React, { useState, useEffect, useMemo } from 'react';
import { ProgressBar } from '../shared/ProgressBar';
import { ArrowUpCircleIcon, PlusIcon } from '../Icons';
import { MOCK_INCOME_DATA } from '../../../constants';
import type { IncomeEntry } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';

const COMMON_SOURCES = [
    'Allowance',
    'Part-time Job',
    'Freelancing',
    'Tutoring',
    'Selling Items',
    'Gift/Bonus',
    'Content Creation',
    'Scholarship/Grant'
];

const MoneyMattersSection: React.FC = () => {
    const { addToast } = useToast();
    const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [newIncome, setNewIncome] = useState({ source: '', amount: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        const storedEntries = localStorage.getItem('incomeEntries');
        if (storedEntries) {
            setIncomeEntries(JSON.parse(storedEntries));
        } else {
            setIncomeEntries(MOCK_INCOME_DATA);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('incomeEntries', JSON.stringify(incomeEntries));
    }, [incomeEntries]);

    const totalIncomeThisMonth = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return incomeEntries
            .filter(entry => {
                const entryDate = new Date(entry.date);
                // Adjust for timezone issues when creating date from 'YYYY-MM-DD'
                const entryDateUTC = new Date(entryDate.valueOf() + entryDate.getTimezoneOffset() * 60 * 1000);
                return entryDateUTC.getMonth() === currentMonth && entryDateUTC.getFullYear() === currentYear;
            })
            .reduce((total, entry) => total + Number(entry.amount), 0);
    }, [incomeEntries]);

    // Mock spent amount for now. In a real app this would be tracked.
    const spentAmount = 180;
    const remainingAmount = totalIncomeThisMonth - spentAmount;
    const spendingPercentage = totalIncomeThisMonth > 0 ? Math.min((spentAmount / totalIncomeThisMonth) * 100, 100) : 0;
    
    const handleIncomeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewIncome(prev => ({ ...prev, [name]: value }));
    };

    const handleAddIncome = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIncome.source.trim() || !newIncome.amount || Number(newIncome.amount) <= 0) {
            addToast('Please provide a valid source and positive amount.', 'error');
            return;
        }
        const newEntry: IncomeEntry = {
            id: Date.now().toString(),
            source: newIncome.source.trim(),
            amount: Number(newIncome.amount),
            date: newIncome.date
        };
        setIncomeEntries(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setNewIncome({ source: '', amount: '', date: new Date().toISOString().split('T')[0] });
        setShowIncomeForm(false);
        addToast('Income logged successfully!', 'success');
    };

    const recentIncome = incomeEntries.slice(0, 5);

    return (
        <div className="bento-card">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Secure the Bag 💰</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* This Month's Budget Card */}
                <div className="md:col-span-2 bg-[var(--secondary)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">This Month's Budget</h3>
                    
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                            <p className="text-sm text-[var(--muted)]">Income</p>
                            <p className="font-bold text-lg text-green-500">RM {totalIncomeThisMonth.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--muted)]">Spent</p>
                            <p className="font-bold text-lg text-red-500">RM {spentAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--muted)]">Remaining</p>
                            <p className="font-bold text-lg text-[var(--foreground)]">RM {remainingAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <ProgressBar label="Spending" percentage={spendingPercentage} value={`${Math.round(spendingPercentage)}%`} />

                    <div className="mt-4 pt-4 border-t border-[var(--primary)]/20">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Top categories:</h4>
                        <ul className="text-sm text-[var(--muted)] space-y-1">
                            <li className="flex justify-between"><span>🍔 Food:</span> <span className="font-medium">RM 80</span></li>
                            <li className="flex justify-between"><span>🎮 Entertainment:</span> <span className="font-medium">RM 50</span></li>
                            <li className="flex justify-between"><span>📚 Study materials:</span> <span className="font-medium">RM 30</span></li>
                        </ul>
                    </div>
                </div>
                {/* Financial Tip Card */}
                <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl p-6 flex flex-col items-center justify-center text-center text-white">
                    <div className="text-4xl mb-3">💡</div>
                    <h3 className="text-lg font-bold">Financial Tip</h3>
                    <p className="mt-2 flex-grow text-sm">
                        "Save 20% of your allowance *before* you start spending. Pay your future self first!"
                    </p>
                </div>
            </div>

            {/* Income Tracker Section */}
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[var(--foreground)]">Income Tracker</h3>
                    <button onClick={() => setShowIncomeForm(!showIncomeForm)} className="flex items-center gap-2 font-semibold text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-full hover:opacity-90 transition">
                        <PlusIcon className="h-5 w-5" />
                        Log Income
                    </button>
                </div>
                
                {showIncomeForm && (
                    <form onSubmit={handleAddIncome} className="bg-[var(--background)] p-4 rounded-lg mb-4 space-y-3 animate-fade-in-fast">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <input 
                                type="text" 
                                name="source" 
                                value={newIncome.source} 
                                onChange={handleIncomeInputChange} 
                                placeholder="Source (e.g., Allowance)" 
                                list="income-sources"
                                className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition" 
                                required 
                            />
                            <datalist id="income-sources">
                                {COMMON_SOURCES.map(source => (
                                    <option key={source} value={source} />
                                ))}
                            </datalist>
                            <input type="number" name="amount" value={newIncome.amount} onChange={handleIncomeInputChange} placeholder="Amount (RM)" className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition" required />
                            <input type="date" name="date" value={newIncome.date} onChange={handleIncomeInputChange} className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-[var(--muted)]" required />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowIncomeForm(false)} className="px-4 py-2 rounded-full font-semibold text-[var(--muted)] hover:bg-[var(--secondary)] transition">Cancel</button>
                            <button type="submit" className="bg-[var(--primary)] text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition">Save Entry</button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-[var(--muted)]">Recent Income</h4>
                    {recentIncome.length > 0 ? (
                        recentIncome.map(entry => (
                            <div key={entry.id} className="bg-[var(--background)] rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArrowUpCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm text-[var(--foreground)]">{entry.source}</p>
                                        <p className="text-xs text-[var(--muted)]">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-sm text-green-500">+RM {Number(entry.amount).toFixed(2)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-[var(--muted)] py-4">No income logged yet. Add your first entry!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoneyMattersSection;