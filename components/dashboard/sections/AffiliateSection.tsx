
import React, { useState } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { CashIcon, UsersIcon, TrendingUpIcon, LinkIcon, CheckCircleIcon, PlusIcon } from '../Icons';
import WithdrawalModal from '../WithdrawalModal';

const AffiliateSection: React.FC = () => {
    const { addToast } = useToast();
    const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
    
    // State for Link Generator
    const [generatedLink, setGeneratedLink] = useState('https://harmony.app/ref/student_123');
    const [campaignName, setCampaignName] = useState('Homepage');
    const [isCopied, setIsCopied] = useState(false);

    // Mock Data
    const currentBalance = 1250.00;

    const handleGenerateLink = () => {
        // Simulate generating a tracking link
        const slug = campaignName.toLowerCase().replace(/\s+/g, '-');
        setGeneratedLink(`https://harmony.app/ref/student_123?c=${slug}`);
        addToast('New tracking link generated!', 'success');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        addToast('Affiliate link copied to clipboard!', 'success');
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {isWithdrawalOpen && (
                <WithdrawalModal 
                    balance={currentBalance} 
                    onClose={() => setIsWithdrawalOpen(false)} 
                />
            )}

            <div className="bento-card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                            <TrendingUpIcon className="h-7 w-7 text-green-500" />
                            Affiliate Dashboard
                        </h2>
                        <p className="text-sm text-[var(--muted)] mt-1">Promote Harmony and earn recurring revenue.</p>
                    </div>
                    <button 
                        onClick={() => setIsWithdrawalOpen(true)}
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                        <CashIcon className="h-5 w-5" />
                        Withdraw Funds
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[var(--secondary)]/30 p-6 rounded-2xl border border-[var(--border)]">
                        <p className="text-sm font-bold text-[var(--muted)] uppercase">Total Earnings</p>
                        <p className="text-3xl font-extrabold text-[var(--foreground)] mt-2">RM 1,250.00</p>
                        <p className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1">
                            <TrendingUpIcon className="h-3 w-3" /> +15% this month
                        </p>
                    </div>
                    <div className="bg-[var(--secondary)]/30 p-6 rounded-2xl border border-[var(--border)]">
                        <p className="text-sm font-bold text-[var(--muted)] uppercase">Active Referrals</p>
                        <p className="text-3xl font-extrabold text-[var(--foreground)] mt-2">24</p>
                        <p className="text-xs text-[var(--muted)] mt-1">Students joined via your link</p>
                    </div>
                    <div className="bg-[var(--secondary)]/30 p-6 rounded-2xl border border-[var(--border)]">
                        <p className="text-sm font-bold text-[var(--muted)] uppercase">Conversion Rate</p>
                        <p className="text-3xl font-extrabold text-[var(--foreground)] mt-2">3.2%</p>
                        <p className="text-xs text-[var(--muted)] mt-1">Clicks to Paid Users</p>
                    </div>
                </div>

                {/* Link Generator */}
                <div className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] mb-8">
                    <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-[var(--primary)]" />
                        Link Generator
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">Campaign Target</label>
                            <select 
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
                            >
                                <option value="Homepage">Harmony Homepage</option>
                                <option value="Python Course">Course: Python for Beginners</option>
                                <option value="Summer Camp">Event: Tech Summer Camp</option>
                                <option value="Scholarship">Scholarship Page</option>
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">Generated URL</label>
                            <div className="flex items-center bg-[var(--card)] border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[var(--muted)] font-mono text-sm">
                                <span className="truncate">{generatedLink}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button 
                                onClick={handleGenerateLink}
                                className="px-4 py-3 rounded-xl font-bold bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80 transition"
                                title="Refresh Link"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={handleCopy}
                                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                    isCopied 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                    : 'bg-[var(--primary)] text-white hover:opacity-90'
                                }`}
                            >
                                {isCopied ? <CheckCircleIcon className="h-5 w-5" /> : <LinkIcon className="h-5 w-5" />}
                                {isCopied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-3">
                        Share this link on social media, your blog, or directly with friends. Cookies track referrals for 30 days.
                    </p>
                </div>

                {/* Recent Activity Table */}
                <div>
                    <h3 className="font-bold text-[var(--foreground)] mb-4">Revenue Stream</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-[var(--muted)] uppercase border-b border-[var(--border)]">
                                    <th className="py-3 pl-2">Date</th>
                                    <th className="py-3">Activity</th>
                                    <th className="py-3">Campaign</th>
                                    <th className="py-3 text-right pr-2">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { date: 'Today, 10:42 AM', activity: 'New Subscription (Pro)', campaign: 'Homepage', amount: '+ RM 3.75' },
                                    { date: 'Yesterday, 4:15 PM', activity: 'Course Purchase (Python)', campaign: 'Python Course', amount: '+ RM 12.50' },
                                    { date: '22 Aug, 9:00 AM', activity: 'Withdrawal Request', campaign: '-', amount: '- RM 150.00' },
                                    { date: '20 Aug, 2:30 PM', activity: 'New Subscription (Yearly)', campaign: 'Summer Camp', amount: '+ RM 45.00' },
                                ].map((item, i) => (
                                    <tr key={i} className="border-b border-[var(--border)] last:border-none hover:bg-[var(--secondary)]/10 transition-colors">
                                        <td className="py-4 pl-2 text-sm text-[var(--muted)]">{item.date}</td>
                                        <td className="py-4 text-sm font-semibold text-[var(--foreground)]">{item.activity}</td>
                                        <td className="py-4 text-sm text-[var(--muted)]">{item.campaign}</td>
                                        <td className={`py-4 pr-2 text-sm font-bold text-right ${item.amount.startsWith('-') ? 'text-[var(--muted)]' : 'text-green-500'}`}>{item.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AffiliateSection;
