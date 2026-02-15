
import React, { useState } from 'react';
import { TagIcon, PlusIcon, TrashIcon, CalendarIcon, UsersIcon, ClockIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

interface Coupon {
    id: string;
    code: string;
    discount: string;
    uses: number;
    maxUses?: number;
    expiryDate?: string;
    targetAudience: 'Student' | 'Parent' | 'School' | 'Company';
    status: 'Active' | 'Expired' | 'Scheduled';
}

const AdminCouponsPage: React.FC = () => {
    const { addToast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([
        { id: '1', code: 'WELCOME20', discount: '20% OFF', uses: 45, maxUses: 100, expiryDate: '2024-12-31', targetAudience: 'Student', status: 'Active' },
        { id: '2', code: 'SCHOOL_BULK_50', discount: 'RM 500 OFF', uses: 2, maxUses: 10, expiryDate: '2024-09-01', targetAudience: 'School', status: 'Active' },
        { id: '3', code: 'EARLYBIRD', discount: 'RM 50 OFF', uses: 12, maxUses: 50, expiryDate: '2023-01-01', targetAudience: 'Parent', status: 'Expired' },
    ]);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [newCode, setNewCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [targetAudience, setTargetAudience] = useState<Coupon['targetAudience']>('Student');

    const handleCreateCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode || !discountAmount) return;

        const newCoupon: Coupon = {
            id: Date.now().toString(),
            code: newCode.toUpperCase(),
            discount: discountAmount,
            uses: 0,
            maxUses: maxUses ? parseInt(maxUses) : undefined,
            expiryDate: expiryDate || undefined,
            targetAudience: targetAudience,
            status: 'Active'
        };

        setCoupons([newCoupon, ...coupons]);
        
        // Reset Form
        setNewCode('');
        setDiscountAmount('');
        setExpiryDate('');
        setMaxUses('');
        setTargetAudience('Student');
        setShowForm(false);
        
        addToast(`Coupon ${newCoupon.code} created!`, 'success');
    };

    const deleteCoupon = (id: string) => {
        if(window.confirm('Delete this coupon?')) {
            setCoupons(prev => prev.filter(c => c.id !== id));
            addToast('Coupon removed.', 'info');
        }
    };

    const getAudienceColor = (audience: Coupon['targetAudience']) => {
        switch(audience) {
            case 'School': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Company': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Parent': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <TagIcon className="h-8 w-8 text-green-500" />
                        Coupon Engine
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage discount codes, bulk deals, and time-limited promos.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-500/20"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create Promo
                </button>
            </header>

            {showForm && (
                <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-green-200 dark:border-green-800 animate-fade-in-fast">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Configure New Deal</h3>
                    <form onSubmit={handleCreateCoupon} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Coupon Code</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. SUMMER2024"
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount Value</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 20% OFF or RM 50"
                                    value={discountAmount}
                                    onChange={e => setDiscountAmount(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Target Audience</label>
                                <select 
                                    value={targetAudience} 
                                    onChange={(e) => setTargetAudience(e.target.value as Coupon['targetAudience'])}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="Student">Student (Standard)</option>
                                    <option value="Parent">Parent (Family Deals)</option>
                                    <option value="School">School (Bulk)</option>
                                    <option value="Company">Company (Corporate)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expiry Date (Optional)</label>
                                <input 
                                    type="date" 
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Usage Limit (Optional)</label>
                                <input 
                                    type="number" 
                                    placeholder="Max redemptions"
                                    value={maxUses}
                                    onChange={e => setMaxUses(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                            <button type="submit" className="bg-green-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-green-700 transition">
                                Launch Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className={`p-3 rounded-lg ${coupon.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                <TagIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-mono font-bold text-gray-800 dark:text-gray-100">{coupon.code}</h3>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${getAudienceColor(coupon.targetAudience)}`}>
                                        {coupon.targetAudience}
                                    </span>
                                    {coupon.status === 'Expired' && <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded">EXPIRED</span>}
                                </div>
                                <p className="text-green-600 dark:text-green-400 font-bold mt-1">{coupon.discount}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {coupon.uses} used {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</span>
                                    {coupon.expiryDate && (
                                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Expires: {coupon.expiryDate}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full sm:w-auto justify-end">
                            <div className="text-right hidden sm:block mr-4">
                                <p className="text-xs text-gray-400 uppercase font-bold">Conversion</p>
                                <p className="font-bold text-gray-700 dark:text-gray-300">{Math.floor(Math.random() * 20) + 5}%</p>
                            </div>
                            <button 
                                onClick={() => deleteCoupon(coupon.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                title="Delete Coupon"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCouponsPage;
