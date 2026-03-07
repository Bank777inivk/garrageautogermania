import React, { useState, useEffect } from 'react';
import DocumentPreview from './DocumentPreview';

const DocumentExternalPreview = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        // Load initial state
        const savedSettings = localStorage.getItem('doc_preview_sync');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse settings from storage", e);
            }
        }

        // Listen for changes in the editor tab
        const handleStorageChange = (e) => {
            if (e.key === 'doc_preview_sync' && e.newValue) {
                try {
                    setSettings(JSON.parse(e.newValue));
                } catch (err) {
                    console.error("Error updating preview from storage", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (!settings) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Chargement de l'aperçu...</h1>
                <p className="text-slate-400 font-medium">En attente de données du Studio Documentaire.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col h-screen">
                <DocumentPreview
                    settings={settings}
                    docType={settings.docType || 'contract'}
                    setDocType={() => { }} // Read-only in external preview
                    fullScreenMode
                />
            </div>
        </div>
    );
};

export default DocumentExternalPreview;
