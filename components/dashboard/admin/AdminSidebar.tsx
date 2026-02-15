
import React from 'react';
import * as Icons from '../Icons';
import { DashboardView } from '../../../types';

interface AdminSidebarProps {
    setCurrentView: (view: DashboardView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ setCurrentView }) => {
    return (
        <nav className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 px-4">
                <button onClick={() => setCurrentView('admin')} className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Harmony Admin
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <AdminNavGroup label="DASHBOARD" icon={<Icons.HomeIcon />}>
                    <AdminSubNavItem label="Overview" onClick={() => setCurrentView('admin')} />
                </AdminNavGroup>

                <AdminNavGroup label="CONTENT" icon={<Icons.AcademicCapIcon />}>
                    <AdminSubNavItem label="Course Management" onClick={() => setCurrentView('admin-courses')} />
                    <AdminSubNavItem label="Lessons & Modules" onClick={() => setCurrentView('admin-courses')} />
                </AdminNavGroup>

                <AdminNavGroup label="SALES & MARKETING" icon={<Icons.TagIcon />}>
                    <AdminSubNavItem label="Coupons" onClick={() => setCurrentView('admin-coupons')} />
                    <AdminSubNavItem label="Affiliate Program" onClick={() => setCurrentView('admin-affiliates')} />
                    <AdminSubNavItem label="Promotional Banners" />
                </AdminNavGroup>

                <AdminNavGroup label="FINANCES" icon={<Icons.CashIcon />}>
                    <AdminSubNavItem label="Revenue Insights" onClick={() => setCurrentView('admin-revenue')} />
                    <AdminSubNavItem label="Profit-Sharing" onClick={() => setCurrentView('admin-profit-sharing')} />
                    <AdminSubNavItem label="Student Rewards" onClick={() => setCurrentView('admin-rewards')} />
                </AdminNavGroup>

                <AdminNavGroup label="INTEGRATIONS" icon={<Icons.ZapIcon />}>
                    <AdminSubNavItem label="Pixel Tracking" onClick={() => setCurrentView('admin-integrations')} />
                    <AdminSubNavItem label="Google Cloud" onClick={() => setCurrentView('admin-google-cloud')} />
                </AdminNavGroup>

                <AdminNavGroup label="MEMBERS" icon={<Icons.UsersIcon />}>
                    <AdminSubNavItem label="Member List" />
                    <AdminSubNavItem label="Automation" />
                    <AdminSubNavItem label="Moderation" />
                </AdminNavGroup>

            </div>
        </nav>
    );
};

const AdminNavGroup: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <details className="group" open>
        <summary className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 list-none">
            <span className="text-gray-400 dark:text-gray-500">{icon}</span>
            <span className="flex-1 font-bold text-xs uppercase tracking-wider">{label}</span>
            <Icons.ChevronDownIcon className="h-4 w-4 transform transition-transform group-open:rotate-0 -rotate-90" />
        </summary>
        <div className="pl-4 space-y-1 mt-1">
            {children}
        </div>
    </details>
);

const AdminSubNavItem: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
    <button onClick={onClick} className="w-full text-left block pl-5 pr-2 py-1.5 text-sm rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 font-medium">
        {label}
    </button>
);

export default AdminSidebar;
