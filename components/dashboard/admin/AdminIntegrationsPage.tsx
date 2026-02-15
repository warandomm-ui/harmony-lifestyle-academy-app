
import React, { useState } from 'react';
import { ZapIcon, CheckCircleIcon, SpinnerIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';

const IntegrationCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: string; 
    placeholder: string; 
    color: string;
}> = ({ title, description, icon, placeholder, color }) => {
    const { addToast } = useToast();
    const [pixelId, setPixelId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        if (!pixelId) return;
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            addToast(`${title} ID saved successfully!`, 'success');
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${color}`}>
                {icon}
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 flex-grow">{description}</p>
            
            <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Pixel / Measurement ID</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={pixelId}
                        onChange={(e) => { setPixelId(e.target.value); setIsSaved(false); }}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                        placeholder={placeholder}
                    />
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !pixelId}
                        className={`px-4 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${isSaved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isSaving ? <SpinnerIcon className="h-4 w-4" /> : isSaved ? <CheckCircleIcon className="h-4 w-4" /> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminIntegrationsPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <ZapIcon className="h-8 w-8 text-yellow-500" />
                    Tracking & Integrations
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Connect your analytics tools to track performance across platforms.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <IntegrationCard 
                    title="Meta Pixel (Facebook)" 
                    description="Track conversions from Facebook and Instagram ads."
                    icon="f"
                    placeholder="ID: 1234567890"
                    color="bg-blue-100 text-blue-600"
                />
                <IntegrationCard 
                    title="TikTok Pixel" 
                    description="Measure the effectiveness of your TikTok ad campaigns."
                    icon="🎵"
                    placeholder="ID: C123ABC456"
                    color="bg-black text-white dark:bg-gray-700"
                />
                <IntegrationCard 
                    title="Google Analytics 4" 
                    description="Get deeper insights into user behavior on your dashboard."
                    icon="G"
                    placeholder="ID: G-XXXXXXXXXX"
                    color="bg-orange-100 text-orange-600"
                />
            </div>
        </div>
    );
};

export default AdminIntegrationsPage;
