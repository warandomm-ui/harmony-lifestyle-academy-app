
import React, { useState } from 'react';
import { ZapIcon, CheckCircleIcon, SpinnerIcon, LinkIcon } from '../Icons';
import { useToast } from '../../../contexts/ToastContext';
import { HLA_CONNECTORS, CATEGORY_LABELS } from '../../../services/connectors';
import type { ConnectorConfig, ConnectorStatus } from '../../../types';

// ─── Pixel / Analytics card (existing) ───────────────────────────────

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

// ─── Connector card (new) ────────────────────────────────────────────

const STATUS_STYLES: Record<ConnectorStatus, { dot: string; label: string; bg: string }> = {
    connected:    { dot: 'bg-green-500', label: 'Connected',    bg: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    disconnected: { dot: 'bg-gray-400',  label: 'Not connected', bg: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
    error:        { dot: 'bg-red-500',   label: 'Error',        bg: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const ConnectorCard: React.FC<{ connector: ConnectorConfig }> = ({ connector }) => {
    const { addToast } = useToast();
    const [status, setStatus] = useState<ConnectorStatus>(connector.status);
    const [isConnecting, setIsConnecting] = useState(false);

    const style = STATUS_STYLES[status];

    const handleToggle = () => {
        if (status === 'connected') {
            setStatus('disconnected');
            addToast(`${connector.name} disconnected.`, 'success');
            return;
        }

        setIsConnecting(true);
        // Simulated OAuth / API-key flow — replace with real auth when edge functions are deployed
        setTimeout(() => {
            setIsConnecting(false);
            setStatus('connected');
            addToast(`${connector.name} connected successfully!`, 'success');
        }, 2000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${connector.color}`}>
                    {connector.icon}
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    {style.label}
                </span>
            </div>

            {/* Info */}
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{connector.name}</h3>
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-1">
                {CATEGORY_LABELS[connector.category]}
                {connector.mcpServer && <> &middot; MCP: <span className="text-indigo-500 dark:text-indigo-400">{connector.mcpServer}</span></>}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 flex-grow">{connector.description}</p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1.5 mb-5">
                {connector.capabilities.map((cap) => (
                    <span key={cap} className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {cap}
                    </span>
                ))}
            </div>

            {/* Action */}
            <button
                onClick={handleToggle}
                disabled={isConnecting}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2
                    ${status === 'connected'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
            >
                {isConnecting ? (
                    <><SpinnerIcon className="h-4 w-4" /> Connecting...</>
                ) : status === 'connected' ? (
                    'Disconnect'
                ) : (
                    <><LinkIcon className="h-4 w-4" /> Connect</>
                )}
            </button>
        </div>
    );
};

// ─── Page ────────────────────────────────────────────────────────────

const AdminIntegrationsPage: React.FC = () => {
    const mcpConnectors = HLA_CONNECTORS.filter((c) => c.mcpServer !== null);
    const manualConnectors = HLA_CONNECTORS.filter((c) => c.mcpServer === null);

    return (
        <div className="max-w-7xl mx-auto">
            {/* ── Connected Tools (MCP) ── */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <ZapIcon className="h-8 w-8 text-yellow-500" />
                    Tracking & Integrations
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Connect HLA's tool stack — calendar, email, project tracker, knowledge base, and more.</p>
            </header>

            <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Connected Tools (MCP)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">These tools are orchestrated through MCP servers for AI-powered automation.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mcpConnectors.map((c) => (
                        <ConnectorCard key={c.id} connector={c} />
                    ))}
                </div>
            </section>

            {/* ── Manual / Webhook Integrations ── */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Other Integrations</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tools that require direct API keys or webhook configuration (no MCP server available yet).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {manualConnectors.map((c) => (
                        <ConnectorCard key={c.id} connector={c} />
                    ))}
                </div>
            </section>

            {/* ── Analytics Pixels (existing) ── */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Analytics Pixels</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Track conversions and user behaviour across ad platforms.</p>
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
            </section>
        </div>
    );
};

export default AdminIntegrationsPage;
