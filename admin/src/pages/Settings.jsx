import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import uploadToCloudinary from '@shared/cloudinary/config';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Hash,
    CreditCard,
    PenTool,
    ExternalLink,
    Save,
    Loader2,
    Upload,
    Image as ImageIcon,
    ArrowLeft,
    ChevronRight,
    Zap,
    Shield,
    Smartphone,
    Facebook,
    Banknote,
    Trash2,
    FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DocumentPreview from '../components/DocumentPreview';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState(() => localStorage.getItem('settings_active_view') || 'hub'); // 'hub' or category id: 'identity', 'contact', 'bank', 'documents'
    const [docType, setDocType] = useState('contract'); // 'contract' or 'invoice'
    const [settings, setSettings] = useState({
        companyName: 'GARRAGE AUTO GERMANIA',
        logoUrl: '',
        addressDetails: {
            street: "123 Avenue de l'Automobile",
            zip: '75000',
            city: 'Paris',
            country: 'France'
        },
        email: 'contact@garrageautogermania.com',
        phone: '+33 1 23 45 67 89',
        rib: {
            bankName: 'BNP Paribas',
            titulaire: 'GARRAGE AUTO GERMANIA',
            iban: 'FR76...',
            bic: 'BNPP...'
        },
        signatureUrl: '',
        stampUrl: '',
        documents: {
            managerName: 'Le Gérant',
            contractTerms: 'Conditions du Contrat de Vente\nDécrivez les conditions générales de vente ici...',
            invoiceNotes: 'Notes de Facturation'
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'documents');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Intelligent deep merge to keep defaults for missing fields
                    const mergeDeep = (target, source) => {
                        const output = { ...target };
                        if (source && typeof source === 'object') {
                            Object.keys(source).forEach(key => {
                                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                                    output[key] = mergeDeep(target[key] || {}, source[key]);
                                } else if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
                                    output[key] = source[key];
                                }
                            });
                        }
                        return output;
                    };

                    setSettings(prev => mergeDeep(prev, data));
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Erreur lors du chargement des paramètres');
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        localStorage.setItem('settings_active_view', view);
    }, [view]);


    useEffect(() => {
        if (view === 'documents') {
            localStorage.setItem('doc_preview_sync', JSON.stringify({ ...settings, docType }));
        }
    }, [settings, view, docType]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'documents'), settings);
            toast.success("Configuration enregistrée");
            if (view !== 'hub') setView('hub');
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Erreur d'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const loadingToast = toast.loading("Mise à jour de l'image...");
        try {
            const url = await uploadToCloudinary(file);
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                setSettings(prev => ({
                    ...prev,
                    [parent]: { ...prev[parent], [child]: url }
                }));
            } else {
                setSettings(prev => ({ ...prev, [field]: url }));
            }
            toast.success("Image importée avec succès", { id: loadingToast });
        } catch (error) {
            toast.error("Échec de l'importation", { id: loadingToast });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-slate-100 border-t-red-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={14} className="text-slate-200 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const categories = [
        {
            id: 'identity',
            label: 'Identité Visuelle',
            desc: 'Configurez votre logo et raison sociale.',
            icon: Building2,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            id: 'contact',
            label: 'Canaux de Direct',
            desc: 'Gérez vos coordonnées et réseaux sociaux.',
            icon: Smartphone,
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        },
        {
            id: 'bank',
            label: 'Flux Financiers',
            desc: 'Coordonnées bancaires pour les factures.',
            icon: Banknote,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            id: 'documents',
            label: 'Studio Documentaire',
            desc: 'Éditez vos modèles de contrats et factures.',
            icon: PenTool,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    const Header = ({ title, subtitle, showBack = false }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-1">
                {showBack && (
                    <button
                        onClick={() => setView('hub')}
                        className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-700 transition-colors mb-4 group"
                    >
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Retour au Hub
                    </button>
                )}
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{title}</h1>
                <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
            </div>
            {view !== 'hub' && (
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-red-700 font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Sauvegarder les modifications
                </button>
            )}
        </div>
    );

    const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, type = "text", textArea = false }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-4 text-slate-300" size={18} />}
                {textArea ? (
                    <textarea
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        rows={6}
                        className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 outline-none transition-all font-medium text-slate-900 resize-none`}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 outline-none transition-all font-medium text-slate-900`}
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full px-6 py-8 min-h-screen transition-all duration-700">
            {view === 'hub' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Header
                        title="Configuration Studio"
                        subtitle="Pilotez l'identité et les flux de votre plateforme Premium."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setView(cat.id)}
                                className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 text-left overflow-hidden flex flex-col h-64"
                            >
                                <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <cat.icon size={28} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{cat.label}</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-auto">{cat.desc}</p>

                                <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-red-700 transition-colors mt-4">
                                    Configurer <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>

                                {/* Abstract accent */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 p-10 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-2 text-center md:text-left">
                                <span className="inline-flex items-center gap-2 bg-red-700 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                                    <Shield size={10} fill="currentColor" />
                                    Système Sécurisé
                                </span>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Centralisation des données</h2>
                                <p className="text-slate-400 text-sm font-medium">Vos modifications impactent instantanément les documents clients et l'interface publique.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 shadow-2xl flex items-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" className="text-red-700" />}
                                Sync Globale
                            </button>
                        </div>
                        {/* Background mesh/pattern */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 translate-x-1/4" />
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full mb-12">
                    <Header
                        showBack
                        title={categories.find(c => c.id === view)?.label}
                        subtitle={categories.find(c => c.id === view)?.desc}
                    />

                    <div className={`${view === 'documents' ? 'bg-transparent border-none shadow-none p-0' : 'bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-12 md:p-20'}`}>
                        {view === 'identity' && (
                            <div className="space-y-16">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    <InputGroup
                                        label="Nom de la société"
                                        icon={Building2}
                                        value={settings.companyName}
                                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                        placeholder="Ex: AUTO IMPORT PRO"
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Officiel</label>
                                        <div className="flex items-center gap-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl group/upload">
                                            <div className="relative h-20 w-32 flex items-center justify-center bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                                {settings.logoUrl ? (
                                                    <img src={settings.logoUrl} alt="Logo" className="max-h-16 max-w-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon className="text-slate-200" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Upload className="text-white" size={20} />
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                                                </label>
                                                {settings.logoUrl && (
                                                    <button
                                                        onClick={() => setSettings({ ...settings, logoUrl: '' })}
                                                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm opacity-0 group-hover/upload:opacity-100 transition-opacity z-10"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-[10px] font-black text-slate-900 uppercase">Format Premium</p>
                                                <p className="text-[10px] text-slate-400 font-medium">PNG transparent haute définition recommandé.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'contact' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                    <InputGroup label="Email Support" icon={Mail} value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                                    <InputGroup label="Téléphone" icon={Phone} value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                                    <InputGroup label="WhatsApp" icon={Smartphone} value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
                                    <InputGroup label="Facebook URL" icon={Facebook} value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} />
                                </div>
                                <div className="max-w-3xl">
                                    <InputGroup textArea label="Adresse Officielle" icon={MapPin} value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {view === 'bank' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <InputGroup label="Titulaire du Compte" icon={UserIcon} value={settings.rib.titulaire} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, titulaire: e.target.value } })} />
                                    <InputGroup label="Nom de la Banque" icon={Building2} value={settings.rib.bankName} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bankName: e.target.value } })} />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2">
                                        <InputGroup label="IBAN" icon={CreditCard} value={settings.rib.iban} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, iban: e.target.value } })} />
                                    </div>
                                    <InputGroup label="BIC / SWIFT" icon={Hash} value={settings.rib.bic} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bic: e.target.value } })} />
                                </div>
                            </div>
                        )}

                        {view === 'documents' && (
                            <div className="flex flex-col xl:flex-row gap-8 items-start">
                                {/* Editor Side */}
                                <div className="w-full xl:w-5/12 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-8 md:p-12 space-y-12">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configuration Document</h2>
                                        <button
                                            onClick={() => window.open('/settings/preview', '_blank')}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <ExternalLink size={14} />
                                            Aperçu Plein Écran
                                        </button>
                                    </div>
                                    <div className="space-y-12">
                                        {/* Section: Informations Essentielles */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Informations de la Société</h3>
                                                    <p className="text-[10px] text-slate-400 font-medium">Identité officielle et contacts de l'entreprise</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-8">
                                                {/* Top Section: Stacking Logo and Company Name vertically */}
                                                <div className="flex flex-col gap-6 group/upload border-b border-slate-100 pb-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo de la Société</label>
                                                        <div className="relative h-40 w-full flex items-center justify-center bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                            {settings.logoUrl ? (
                                                                <img src={settings.logoUrl} alt="Logo" className="max-h-32 max-w-full object-contain p-6" />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <ImageIcon className="text-slate-200" size={48} />
                                                                    <span className="text-[10px] font-bold text-slate-300">Aucun logo sélectionné</span>
                                                                </div>
                                                            )}
                                                            <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <Upload className="text-white" size={24} />
                                                                    <span className="text-xs font-black text-white uppercase tracking-wider">Modifier le Logo</span>
                                                                </div>
                                                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                                                            </label>
                                                            {settings.logoUrl && (
                                                                <button
                                                                    onClick={() => setSettings({ ...settings, logoUrl: '' })}
                                                                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-2xl shadow-sm opacity-0 group-hover/upload:opacity-100 transition-opacity z-10"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la Société</label>
                                                        <input
                                                            type="text"
                                                            value={settings.companyName}
                                                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                                            placeholder="Entrez le nom officiel de votre société"
                                                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Bottom Section: Stacking Manager, Email, Phone all vertically for maximum space */}
                                                <div className="flex flex-col gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsable</label>
                                                        <div className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                                                            <UserIcon size={18} className="text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={settings.documents.managerName}
                                                                onChange={(e) => setSettings({ ...settings, documents: { ...settings.documents, managerName: e.target.value } })}
                                                                placeholder="Prénom et Nom du Responsable"
                                                                className="flex-1 bg-transparent border-none p-0 text-base font-bold text-slate-900 placeholder:text-slate-300 focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de Contact</label>
                                                        <div className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                                                            <Mail size={18} className="text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={settings.email}
                                                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                                placeholder="Email professionnel"
                                                                className="flex-1 bg-transparent border-none p-0 text-base font-bold text-slate-500 placeholder:text-slate-300 focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de Téléphone</label>
                                                        <div className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                                                            <Phone size={18} className="text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={settings.phone}
                                                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                                placeholder="Numéro de téléphone"
                                                                className="flex-1 bg-transparent border-none p-0 text-base font-bold text-slate-500 placeholder:text-slate-300 focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Adresse Officielle</label>
                                            <div className="grid grid-cols-1 gap-3">
                                                <input
                                                    type="text"
                                                    value={settings.addressDetails?.street || settings.address}
                                                    onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, street: e.target.value } })}
                                                    placeholder="N° et Nom de rue"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-slate-900 transition-all"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={settings.addressDetails?.zip || ''}
                                                        onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, zip: e.target.value } })}
                                                        placeholder="Code Postal"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-slate-900 transition-all"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.addressDetails?.city || ''}
                                                        onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, city: e.target.value } })}
                                                        placeholder="Ville"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-slate-900 transition-all"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={settings.addressDetails?.country || ''}
                                                    onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, country: e.target.value } })}
                                                    placeholder="Pays"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-slate-900 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Section - Only for Invoices */}
                                    {docType === 'invoice' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                                    <Banknote size={16} />
                                                </div>
                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Coordonnées Bancaires</h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la Banque</label>
                                                    <input
                                                        type="text"
                                                        value={settings.rib.bankName}
                                                        onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bankName: e.target.value } })}
                                                        placeholder="Ex: BNP Paribas"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">IBAN</label>
                                                        <input
                                                            type="text"
                                                            value={settings.rib.iban}
                                                            onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, iban: e.target.value } })}
                                                            placeholder="FR76..."
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">BIC/SWIFT</label>
                                                        <input
                                                            type="text"
                                                            value={settings.rib.bic}
                                                            onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bic: e.target.value } })}
                                                            placeholder="BNPP..."
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Signature & Cachet Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                            <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                                <Shield size={16} />
                                            </div>
                                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Signataire & Cachet</h3>
                                        </div>

                                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-6">
                                            <div className="flex gap-4 items-stretch">
                                                <div className="w-24 space-y-2">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Signature</p>
                                                    <div className="relative h-16 border border-slate-100 bg-white rounded-xl overflow-hidden group/sig shadow-sm">
                                                        {settings.documents.signatureUrl ? (
                                                            <img src={settings.documents.signatureUrl} alt="Signature" className="h-full w-full object-contain p-2" />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-slate-200"><PenTool size={16} /></div>
                                                        )}
                                                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                            <Upload className="text-white" size={12} />
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'documents.signatureUrl')} />
                                                        </label>
                                                        {settings.documents.signatureUrl && (
                                                            <button
                                                                onClick={() => setSettings({ ...settings, documents: { ...settings.documents, signatureUrl: '' } })}
                                                                className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm opacity-0 group-hover/sig:opacity-100 transition-opacity z-10"
                                                            >
                                                                <Trash2 size={8} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-24 space-y-2">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Cachet</p>
                                                    <div className="relative h-16 border border-slate-100 bg-white rounded-xl overflow-hidden group/stamp shadow-sm">
                                                        {settings.documents.stampUrl ? (
                                                            <img src={settings.documents.stampUrl} alt="Stamp" className="h-full w-full object-contain p-2" />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-slate-200"><Zap size={16} /></div>
                                                        )}
                                                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/stamp:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                            <Upload className="text-white" size={12} />
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'documents.stampUrl')} />
                                                        </label>
                                                        {settings.documents.stampUrl && (
                                                            <button
                                                                onClick={() => setSettings({ ...settings, documents: { ...settings.documents, stampUrl: '' } })}
                                                                className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm opacity-0 group-hover/stamp:opacity-100 transition-opacity z-10"
                                                            >
                                                                <Trash2 size={8} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                <p>Ces fichiers seront apposés au bas de vos {docType === 'contract' ? 'contrats' : 'factures'}.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                            <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center">
                                                <FileText size={16} />
                                            </div>
                                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Contenu du Document</h3>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                            {docType === 'contract' ? (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Conditions du Contrat de Vente</label>
                                                    <textarea
                                                        value={settings.documents.contractTerms}
                                                        onChange={(e) => setSettings({ ...settings, documents: { ...settings.documents, contractTerms: e.target.value } })}
                                                        placeholder="Décrivez les conditions générales de vente ici..."
                                                        rows={6}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[10px] font-bold text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes de Facturation</label>
                                                    <textarea
                                                        value={settings.documents.invoiceNotes}
                                                        onChange={(e) => setSettings({ ...settings, documents: { ...settings.documents, invoiceNotes: e.target.value } })}
                                                        placeholder="Ex: Pénalités de retard, informations de paiement..."
                                                        rows={6}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[10px] font-bold text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Preview Side */}
                                <div className="w-full xl:w-7/12 sticky top-8 pb-12">
                                    <DocumentPreview settings={settings} docType={docType} setDocType={setDocType} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const UserIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export default Settings;
