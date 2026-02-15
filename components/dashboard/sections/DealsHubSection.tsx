
import React, { useState } from 'react';
import { TagIcon, UsersIcon, ClockIcon, CheckCircleIcon, ClipboardListIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

interface Deal {
    id: string;
    code: string;
    description: string;
    discount: string;
    expiry?: string;
    type: 'Student' | 'Parent' | 'Limited';
}

const DealsHubSection: React.FC = () => {
    const { addToast } = useToast();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    
    // Bulk Inquiry State
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('School');
    const [email, setEmail] = useState('');

    const activeDeals: Deal[] = [
        { id: '1', code: 'HARMONY2024', description: 'Get 20% off your first month of Pro.', discount: '20% OFF', type: 'Student' },
        { id: '2', code: 'FLASH50', description: 'Limited time offer! Save on yearly plans.', discount: 'RM 50 OFF', expiry: 'Ends in 2 days', type: 'Limited' },
        { id: '3', code: 'FAMILY_BUNDLE', description: 'Sign up 2+ students and save.', discount: '15% OFF', type: 'Parent' },
    ];

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        addToast('Coupon code copied!', 'success');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgName || !email) {
            addToast('Please fill in all fields.', 'error');
            return;
        }
        addToast('Inquiry sent! We will contact you shortly with bulk rates.', 'success');
        setOrgName('');
        setEmail('');
    };

    return (
        <div className="bento-card bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-green-600">
                    <TagIcon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">Partnerships & Deals</h2>
                    <p className="text-sm text-[var(--muted)]">Exclusive offers for students, parents, and schools.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Coupons Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-yellow-500" />
                        Active Promo Codes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeDeals.map(deal => (
                            <div key={deal.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 relative overflow-hidden group hover:border-green-500 transition-colors">
                                {/* Ticket Cutout Effect */}
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-50 dark:bg-[#111a17] rounded-full"></div>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-50 dark:bg-[#111a17] rounded-full"></div>

                                <div className="pl-4 pr-4 text-center">
                                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">{deal.type} Deal</p>
                                    <h4 className="text-2xl font-extrabold text-green-600 dark:text-green-400">{deal.discount}</h4>
                                    <p className="text-sm text-[var(--foreground)] mt-1 mb-3">{deal.description}</p>
                                    
                                    {deal.expiry && (
                                        <div className="flex justify-center items-center gap-1 text-xs text-red-500 font-bold mb-3 animate-pulse">
                                            <ClockIcon className="h-3 w-3" /> {deal.expiry}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleCopy(deal.code, deal.id)}
                                        className={`w-full py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                                            copiedId === deal.id
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-[var(--foreground)] group-hover:bg-green-100 dark:group-hover:bg-green-900/50 dark:group-hover:text-green-300'
                                        }`}
                                    >
                                        {copiedId === deal.id ? 'COPIED!' : deal.code}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bulk/Corporate Inquiry Column */}
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl border border-[var(--border)]">
                    <h3 className="font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-blue-500" />
                        Schools & Bulk Access
                    </h3>
                    <p className="text-xs text-[var(--muted)] mb-4">
                        Get special rates for entire classrooms, schools, or company employee benefits.
                    </p>
                    <form onSubmit={handleBulkSubmit} className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-[var(--muted)] mb-1">Organization Name</label>
                            <input 
                                type="text" 
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="e.g. SMK Damansara"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--muted)] mb-1">Type</label>
                            <select 
                                value={orgType}
                                onChange={(e) => setOrgType(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                                <option value="School">School / Education</option>
                                <option value="Company">Company / Corporate</option>
                                <option value="NGO">NGO / Non-Profit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--muted)] mb-1">Contact Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="admin@school.edu.my"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-md mt-2"
                        >
                            Request Quote
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 15.03a.75.75 0 10-1.06 1.06l.11.11a.75.75 0 001.06-1.06l-.11-.11z" clipRule="evenodd" />
    </svg>
);

export default DealsHubSection;
