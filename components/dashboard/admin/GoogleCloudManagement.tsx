import React from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { useToast } from '../../../contexts/ToastContext';
import { ShieldCheckIcon, KeyIcon, ServerIcon } from '../Icons';

const AccessDenied: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-dashed border-yellow-400 dark:border-yellow-700">
        <ShieldCheckIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">Access Restricted</h2>
        <p className="text-yellow-600 dark:text-yellow-300 mt-2 max-w-md">
            This section is for Super Admins only. Please contact your system administrator if you believe you should have access.
        </p>
    </div>
);

const GoogleCloudManagement: React.FC = () => {
    const { adminRole } = useAdmin();
    const { addToast } = useToast();

    if (adminRole !== 'super-admin') {
        return <AccessDenied />;
    }

    const handleAction = (action: string) => {
        addToast(`Action "${action}" is a placeholder for backend integration.`, 'info');
    };

    const apiKeys = [
        { key: 'prod_gcp_**** **** **** 1234', status: 'Active', created: '2023-01-15' },
        { key: 'dev_gcp_**** **** **** 5678', status: 'Active', created: '2023-03-20' },
        { key: 'old_key_**** **** **** 9012', status: 'Revoked', created: '2022-11-01' },
    ];

    const storageBuckets = [
        { name: 'hla-prod-learning-materials', region: 'asia-southeast1', created: '2023-01-15' },
        { name: 'hla-prod-user-uploads', region: 'asia-southeast1', created: '2023-02-01' },
        { name: 'hla-staging-assets', region: 'us-central1', created: '2023-03-20' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Google Cloud Management</h1>

            <div className="space-y-8">
                {/* API Key Management */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <KeyIcon /> API Key Management
                        </h2>
                        <button onClick={() => handleAction('Add New Key')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                            Add New Key
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Key</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Created</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiKeys.map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{item.key}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4">{item.created}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleAction('Revoke Key')} className="font-medium text-red-600 dark:text-red-500 hover:underline">Revoke</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                
                {/* Cloud Storage Management */}
                 <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <ServerIcon /> Cloud Storage Buckets
                        </h2>
                        <button onClick={() => handleAction('Create Bucket')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                            Create Bucket
                        </button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Bucket Name</th>
                                    <th scope="col" className="px-6 py-3">Region</th>
                                    <th scope="col" className="px-6 py-3">Created</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storageBuckets.map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4">{item.region}</td>
                                        <td className="px-6 py-4">{item.created}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleAction('Manage Bucket')} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default GoogleCloudManagement;