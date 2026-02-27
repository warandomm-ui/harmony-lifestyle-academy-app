
import React from 'react';
import { ChartBarIcon, TrendingUpIcon, UsersIcon } from '../Icons';
import AdminSidebar from '../admin/AdminSidebar';
import SmartAssistantWidget from '../admin/SmartAssistantWidget';
import GoogleCloudManagement from '../admin/GoogleCloudManagement';
import { DashboardView } from '../../../types';
import AdminRewardsPage from '../admin/AdminRewardsPage';
import AdminCoursesPage from '../admin/AdminCoursesPage';
import AdminCouponsPage from '../admin/AdminCouponsPage';
import AdminAffiliatesPage from '../admin/AdminAffiliatesPage';
import AdminRevenuePage from '../admin/AdminRevenuePage';
import AdminIntegrationsPage from '../admin/AdminIntegrationsPage';
import AdminProfitSharingPage from '../admin/AdminProfitSharingPage';

interface AdminPanelProps {
    currentView: DashboardView;
    setCurrentView: (view: DashboardView) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; trend: string; }> = ({ icon, title, value, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                {icon}
            </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-1">
            <TrendingUpIcon className="h-4 w-4 text-green-500" />
            <span>{trend}</span>
        </p>
    </div>
);

const AdminDashboard: React.FC<{ setCurrentView: (view: DashboardView) => void }> = ({ setCurrentView }) => (
    <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Dashboard</h1>

        {/* App Analytics Section */}
        <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<UsersIcon className="h-6 w-6 text-green-600" />} title="Total Users" value="1,284" trend="+5.2% this month" />
                <StatCard icon={<ChartBarIcon className="h-6 w-6 text-green-600" />} title="Daily Engagement" value="78%" trend="-1.5% yesterday" />
                <StatCard icon={<TrendingUpIcon className="h-6 w-6 text-green-600" />} title="Revenue" value="RM 4,200" trend="+20% this month" />
            </div>
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <SmartAssistantWidget />
            </div>
            <div className="lg:col-span-1">
                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><button onClick={() => setCurrentView('admin-affiliates')} className="font-semibold text-green-600 hover:underline text-left">Manage Members</button></li>
                        <li><button onClick={() => setCurrentView('admin-revenue')} className="font-semibold text-green-600 hover:underline text-left">View Income Reports</button></li>
                        <li><button onClick={() => setCurrentView('admin-coupons')} className="font-semibold text-green-600 hover:underline text-left">Send Invites</button></li>
                        <li><button onClick={() => setCurrentView('admin-rewards')} className="font-semibold text-green-600 hover:underline text-left">Check Moderation Queue</button></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ currentView, setCurrentView }) => {
    
    const renderContent = () => {
        switch (currentView) {
            case 'admin-google-cloud':
                return <GoogleCloudManagement />;
            case 'admin-rewards':
                return <AdminRewardsPage />;
            case 'admin-profit-sharing':
                return <AdminProfitSharingPage />;
            case 'admin-courses':
                return <AdminCoursesPage />;
            case 'admin-coupons':
                return <AdminCouponsPage />;
            case 'admin-affiliates':
                return <AdminAffiliatesPage />;
            case 'admin-revenue':
                return <AdminRevenuePage />;
            case 'admin-integrations':
                return <AdminIntegrationsPage />;
            case 'admin':
            default:
                return <AdminDashboard setCurrentView={setCurrentView} />;
        }
    };
    
    return (
        <main className="flex-1 flex overflow-hidden">
            <AdminSidebar setCurrentView={setCurrentView} />
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {renderContent()}
            </div>
        </main>
    );
};

export default AdminPanel;