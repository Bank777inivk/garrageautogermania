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
    FileText,
    User,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DocumentPreview from '../components/DocumentPreview';
import { useNavigate, useParams } from 'react-router-dom';
import { getPublicIdFromUrl } from '@shared/utils/cloudinary';
import { AlertCircle } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const { tab } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const view = tab || 'hub';
    const [docType, setDocType] = useState('contract'); // 'contract' or 'invoice'
    const [settings, setSettings] = useState({
        companyName: 'GARRAGE AUTO GERMANIA',
        logoUrl: '',
        siret: 'N/A',
        tva: 'N/A',
        addressDetails: {
            street: "123 Avenue de l'Automobile",
            zip: '75000',
            city: 'Paris',
            country: 'France'
        },
        address: "123 Avenue de l'Automobile\n75000 Paris\nFrance", // Fallback
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
            invoiceNotes: "CLAUSE DE PAIEMENT INTÉGRAL : Le règlement total de cette facture proforma déclenche immédiatement la procédure d'exportation et de logistique. Le véhicule est réservé de manière ferme et définitive dès validation du virement. Préparation esthétique et contrôle technique final sous 48h ouvrées. Les documents administratifs originaux seront remis en main propre lors de la livraison ou expédiés par courrier sécurisé après encaissement.\n\nRÉSERVE DE PROPRIÉTÉ : Conformément à la loi, le transfert de propriété n'intervient qu'après paiement intégral du prix convenu.",
            contractTerms: `1. OBJET ET VALIDITÉ : Le présent bon de commande constitue un engagement ferme et irrévocable entre le vendeur et l'acheteur dès sa signature. Il définit les spécifications techniques et les conditions financières du véhicule désigné.
2. CONFORMITÉ ET ÉTAT DU VÉHICULE : Le vendeur certifie que le véhicule est conforme aux standards de sécurité et de fonctionnement. Un certificat de contrôle technique de moins de 6 mois sera fourni lors de la vente pour les véhicules d'occasion.
3. RÉSERVE DE PROPRIÉTÉ : Conformément à la loi n° 80-335 du 12 mai 1980, le transfert de propriété du véhicule est suspendu jusqu'au paiement intégral du prix en principal et accessoires. Les risques sont toutefois transférés à l'acheteur dès la remise des clés.
4. MODALITÉS DE LIVRAISON : La livraison s'effectuera à l'adresse indiquée ou au garage. Le solde restant du prix de vente (70% en cas d'accompte) pourra être acquitté directement lors de la remise des clés. Tout retard logistique de force majeure ne pourra donner lieu à l'annulation de la vente. l'acheteur dispose d'un droit d'inspection lors de la réception.
5. GARANTIE LÉGALE : Le véhicule bénéficie de la garantie légale de conformité et de la garantie contre les vices cachés. Toute garantie commerciale supplémentaire est détaillée dans un carnet spécifique remis lors de la livraison.
6. DROIT DE RÉTRACTATION : Pour les ventes conclues à distance, l'acheteur dispose d'un délai légal de 14 jours pour exercer son droit de rétractation sans avoir à justifier de motifs.`,
            depositNotes: "Réservation confirmée : L'acompte de 30% a été validé. La préparation de votre véhicule se poursuit et le solde restant (70%) sera à régler directement lors de la livraison à votre domicile.",
            fullPaymentNotes: "Le règlement intégral de cette transaction a été perçu. Ce document certifie le transfert des risques et l'engagement des procédures de livraison finale. Le véhicule vous sera remis accompagné de l'ensemble de ses documents administratifs originaux, double de clés et certificat de garantie.",
            deliveryNotes: "Le client reconnaît avoir reçu le véhicule désigné ci-dessus en parfait état de conformité avec le bon de commande. La remise des clés et de l'ensemble du dossier administratif original est effectuée ce jour.",
        },
        watermarkEnabled: false,
        watermarkPublicId: ''
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

                    setSettings(prev => {
                        const merged = mergeDeep(prev, data);
                        
                        // Healing logic: if logoUrl exists but watermarkId is missing, extract it
                        if (merged.logoUrl && !merged.watermarkPublicId) {
                            merged.watermarkPublicId = getPublicIdFromUrl(merged.logoUrl);
                            console.log("Healed watermark ID:", merged.watermarkPublicId);
                        }

                        // Text Healing: force replace old placeholders with new professional defaults
                        const oldInvoicePlaceholder = "Notes de Facturation";
                        const oldContractPlaceholder = "Décrivez les conditions générales de vente ici";
                        
                        if (merged.documents) {
                            if (merged.documents.invoiceNotes === oldInvoicePlaceholder || !merged.documents.invoiceNotes) {
                                merged.documents.invoiceNotes = prev.documents.invoiceNotes;
                            }
                            if (merged.documents.contractTerms?.includes(oldContractPlaceholder) || !merged.documents.contractTerms) {
                                merged.documents.contractTerms = prev.documents.contractTerms;
                            }
                            if (!merged.documents.depositNotes || 
                                merged.documents.depositNotes.includes("selon les modalités convenues lors de la livraison") ||
                                merged.documents.depositNotes.includes("Cet acompte de 30% confirme votre réservation ferme du véhicule")) {
                                merged.documents.depositNotes = prev.documents.depositNotes;
                            }
                            if (!merged.documents.fullPaymentNotes) {
                                merged.documents.fullPaymentNotes = prev.documents.fullPaymentNotes;
                            }
                            if (!merged.documents.deliveryNotes) {
                                merged.documents.deliveryNotes = prev.documents.deliveryNotes;
                            }
                            // Also force heal the contractTerms if it contains the old vague delivery clause
                            if (merged.documents.contractTerms?.includes("selon les modalités convenues lors de la livraison")) {
                                merged.documents.contractTerms = merged.documents.contractTerms.replace(
                                    "selon les modalités convenues lors de la livraison",
                                    "directement lors de la remise des clés"
                                );
                            }
                        }
                        
                        return merged;
                    });
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
            if (view !== 'hub') navigate('/settings');
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
                setSettings(prev => ({ 
                    ...prev, 
                    [field]: url,
                    ...(field === 'logoUrl' ? { watermarkPublicId: getPublicIdFromUrl(url) } : {})
                }));
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
                    <div className="w-12 h-12 border-2 border-[#E5E5E5] border-t-[#FCA311] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={14} className="text-[#14213D]/20 animate-pulse" />
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
            color: 'text-[#FCA311]',
            bg: 'bg-[#14213D]'
        },
        {
            id: 'contact',
            label: 'Canaux de Direct',
            desc: 'Gérez vos coordonnées et réseaux sociaux.',
            icon: Smartphone,
            color: 'text-[#FCA311]',
            bg: 'bg-[#14213D]'
        },
        {
            id: 'bank',
            label: 'Flux Financiers',
            desc: 'Coordonnées bancaires pour les factures.',
            icon: Banknote,
            color: 'text-[#FCA311]',
            bg: 'bg-[#14213D]'
        },
        {
            id: 'documents',
            label: 'Studio Documentaire',
            desc: 'Éditez vos modèles de contrats et factures.',
            icon: PenTool,
            color: 'text-[#FCA311]',
            bg: 'bg-[#14213D]'
        },
    ];

    const Header = ({ title, subtitle, showBack = false }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-12">
            <div className="space-y-1">
                {showBack && (
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#14213D]/40 hover:text-[#FCA311] transition-colors mb-4 group"
                    >
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Retour au Hub
                    </button>
                )}
                <h1 className="text-xl md:text-3xl font-black text-[#14213D] tracking-tight uppercase leading-tight">{title}</h1>
                <p className="text-xs md:text-sm text-[#14213D]/50 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
            {view !== 'hub' && (
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl hover:bg-[#FCA311] hover:text-[#14213D] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-[#14213D]/10 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span className="shrink-0">Sauvegarder</span>
                </button>
            )}
        </div>
    );

    const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, type = "text", textArea = false }) => (
        <div className="space-y-1.5 md:space-y-2">
            <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-[0.15em] ml-1">{label}</label>
            <div className="relative group/input">
                {Icon && (
                    <div className="absolute left-4 top-4 text-[#14213D]/20 group-focus-within/input:text-[#FCA311] transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                {textArea ? (
                    <textarea
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        rows={5}
                        className={`w-full ${Icon ? 'pl-12' : 'px-4 md:px-6'} pr-4 md:pr-6 py-3.5 md:py-4 bg-gray-50 border border-[#E5E5E5] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#FCA311] outline-none transition-all font-bold text-[#14213D] text-sm md:text-base resize-none placeholder:text-gray-300`}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`w-full ${Icon ? 'pl-12' : 'px-4 md:px-6'} pr-4 md:pr-6 py-3.5 md:py-4 bg-gray-50 border border-[#E5E5E5] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#FCA311] outline-none transition-all font-bold text-[#14213D] text-sm md:text-base placeholder:text-gray-300`}
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full px-4 md:px-6 py-6 md:py-8 min-h-screen transition-all duration-700">
            {view === 'hub' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Header
                        title="Configuration Studio"
                        subtitle="Pilotez l'identité et les flux de votre plateforme Premium."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/settings/${cat.id}`)}
                                className="group relative bg-white p-6 md:p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm hover:shadow-xl hover:border-[#FCA311] transition-all duration-500 text-left overflow-hidden flex flex-col h-56 md:h-64"
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#FCA311] group-hover:text-[#14213D] transition-all duration-500`}>
                                    <cat.icon size={24} md:size={28} />
                                </div>
                                <h3 className="text-base md:text-lg font-black text-[#14213D] uppercase tracking-tight mb-2 leading-tight">{cat.label}</h3>
                                <p className="text-[10px] md:text-xs text-[#14213D]/40 font-bold leading-relaxed mb-auto uppercase tracking-widest">{cat.desc}</p>

                                <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-[#14213D]/20 group-hover:text-[#FCA311] transition-colors mt-4">
                                    Configurer <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 md:mt-12 p-6 md:p-10 bg-[#14213D] rounded-[2.5rem] relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-2 bg-[#FCA311] text-[#14213D] px-4 py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-2 mx-auto md:mx-0">
                                    <Shield size={10} fill="currentColor" />
                                    Système Sécurisé
                                </span>
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-tight">Centralisation des données</h2>
                                <p className="text-[#FCA311] text-[10px] font-black uppercase tracking-widest">Synchronisation instantanée sur toute la plateforme.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full md:w-auto px-10 py-5 bg-white text-[#14213D] rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-[#FCA311] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" className="text-[#FCA311]" />}
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

                    <div className={`${view === 'documents' ? 'bg-transparent border-none shadow-none p-0' : 'bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6 md:p-12 lg:p-20'}`}>
                        {view === 'identity' && (
                            <div className="space-y-12 md:space-y-16">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
                                    <InputGroup
                                        label="Nom de la société"
                                        icon={Building2}
                                        value={settings.companyName}
                                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                        placeholder="Ex: AUTO IMPORT PRO"
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputGroup
                                            label="N° SIRET"
                                            icon={Hash}
                                            value={settings.siret}
                                            onChange={(e) => setSettings({ ...settings, siret: e.target.value })}
                                            placeholder="Ex: 123 456 789 00012"
                                        />
                                        <InputGroup
                                            label="TVA Intracommunautaire"
                                            icon={Globe}
                                            value={settings.tva}
                                            onChange={(e) => setSettings({ ...settings, tva: e.target.value })}
                                            placeholder="Ex: FR 12 345678901"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Logo Officiel</label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8 p-4 md:p-6 bg-gray-50 border border-[#E5E5E5] rounded-2xl group/upload">
                                            <div className="relative h-24 w-40 flex items-center justify-center bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm shrink-0 mx-auto sm:mx-0">
                                                {settings.logoUrl ? (
                                                    <img src={settings.logoUrl} alt="Logo" className="max-h-20 max-w-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon className="text-gray-200" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-[#14213D]/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
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
                                                <p className="text-[10px] font-black text-[#14213D] uppercase">Identité Visuelle</p>
                                                <p className="text-[10px] text-[#14213D]/40 font-bold uppercase tracking-tighter">PNG transparent HD recommandé.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50 rounded-[2rem] border border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${settings.watermarkEnabled ? 'bg-[#14213D] text-[#FCA311]' : 'bg-gray-200 text-gray-400'}`}>
                                            <Shield size={20} fill={settings.watermarkEnabled ? "currentColor" : "none"} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#14213D] text-[11px] uppercase tracking-tight">Protection par Filigrane</p>
                                            <p className="text-[9px] text-[#14213D]/40 font-bold uppercase tracking-widest mt-0.5">Ajouter automatiquement le logo sur les photos.</p>
                                            {settings.watermarkPublicId && (
                                                <p className="text-[8px] text-[#FCA311] font-black tracking-tighter mt-1 bg-[#14213D] inline-block px-2 py-0.5 rounded">ID: {settings.watermarkPublicId}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, watermarkEnabled: !prev.watermarkEnabled }))}
                                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.watermarkEnabled 
                                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                                            : 'bg-white text-[#14213D] border border-[#E5E5E5] hover:border-[#14213D]'}`}
                                    >
                                        {settings.watermarkEnabled ? 'Activé' : 'Désactivé'}
                                    </button>
                                </div>
                                {settings.watermarkEnabled && !settings.logoUrl?.includes('cloudinary.com') && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-800">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <div className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                            Attention : Le filigrane nécessite que votre logo soit sur Cloudinary. 
                                            Veuillez uploader votre logo via le bouton ci-dessus pour activer la protection.
                                        </div>
                                    </div>
                                )}
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
                            <div className="space-y-8 md:space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                                    <InputGroup label="Titulaire du Compte" icon={User} value={settings.rib.titulaire} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, titulaire: e.target.value } })} />
                                    <InputGroup label="Nom de la Banque" icon={Building2} value={settings.rib.bankName} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bankName: e.target.value } })} />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
                                    <div className="lg:col-span-2">
                                        <InputGroup label="IBAN" icon={CreditCard} value={settings.rib.iban} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, iban: e.target.value } })} />
                                    </div>
                                    <InputGroup label="BIC / SWIFT" icon={Hash} value={settings.rib.bic} onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bic: e.target.value } })} />
                                </div>
                            </div>
                        )}

                        {view === 'documents' && (
                            <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-start">
                                {/* Editor Side */}
                                <div className="w-full xl:w-5/12 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6 md:p-12 space-y-8 md:space-y-12">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <h2 className="text-lg md:text-xl font-black text-[#14213D] uppercase tracking-tight">Configuration</h2>
                                        <button
                                            onClick={() => window.open('/settings/preview', '_blank')}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-[#E5E5E5] hover:bg-[#14213D] hover:text-[#FCA311] text-[#14213D] rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto"
                                        >
                                            <ExternalLink size={14} />
                                            Aperçu Plein Écran
                                        </button>
                                    </div>

                                    <div className="space-y-12">
                                        {/* Section: Informations Essentielles */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 border-b border-[#E5E5E5] pb-4">
                                                <div className="w-10 h-10 bg-[#14213D] text-[#FCA311] rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[11px] md:text-[12px] font-black text-[#14213D] uppercase tracking-widest leading-none">Société</h3>
                                                    <p className="text-[9px] md:text-[10px] text-[#14213D]/40 font-bold uppercase tracking-tighter mt-1">Identité officielle et contacts</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 border border-[#E5E5E5] rounded-3xl p-6 md:p-8 space-y-8">
                                                <div className="space-y-4">
                                                    <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Logo du Cabinet</label>
                                                    <div className="relative h-32 md:h-40 w-full flex items-center justify-center bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm hover:border-[#FCA311] transition-all group/upload">
                                                        {settings.logoUrl ? (
                                                            <img src={settings.logoUrl} alt="Logo" className="max-h-24 md:max-h-32 max-w-full object-contain p-4 md:p-6" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <ImageIcon className="text-[#14213D]/10" size={32} md:size={48} />
                                                                <span className="text-[9px] font-black text-[#14213D]/10 uppercase tracking-widest">Logo manquant</span>
                                                            </div>
                                                        )}
                                                        <label className="absolute inset-0 bg-[#14213D]/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Upload className="text-white" size={20} md:size={24} />
                                                                <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider">Modifier</span>
                                                            </div>
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                                                        </label>
                                                        {settings.logoUrl && (
                                                            <button
                                                                onClick={() => setSettings({ ...settings, logoUrl: '' })}
                                                                className="absolute top-3 md:top-4 right-3 md:right-4 p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-2xl shadow-sm opacity-0 group-hover/upload:opacity-100 transition-opacity z-10"
                                                            >
                                                                <Trash2 size={14} md:size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Raison Sociale</label>
                                                        <input
                                                            type="text"
                                                            value={settings.companyName}
                                                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                                            placeholder="Nom de l'entreprise"
                                                            className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-6 py-4 text-base font-black text-[#14213D] placeholder:text-gray-300 focus:ring-2 focus:ring-[#FCA311] transition-all"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Gérant</label>
                                                            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus-within:ring-2 focus-within:ring-[#FCA311] transition-all">
                                                                <User size={18} className="text-[#14213D]/20" />
                                                                <input
                                                                    type="text"
                                                                    value={settings.documents.managerName}
                                                                    onChange={(e) => setSettings({ ...settings, documents: { ...settings.documents, managerName: e.target.value } })}
                                                                    placeholder="Prénom Nom"
                                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#14213D]"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Email</label>
                                                            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus-within:ring-2 focus-within:ring-[#FCA311] transition-all">
                                                                <Mail size={18} className="text-[#14213D]/20" />
                                                                <input
                                                                    type="text"
                                                                    value={settings.email}
                                                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                                    placeholder="email@contact.com"
                                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#14213D]"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Téléphone</label>
                                                            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus-within:ring-2 focus-within:ring-[#FCA311] transition-all">
                                                                <Phone size={18} className="text-[#14213D]/20" />
                                                                <input
                                                                    type="text"
                                                                    value={settings.phone}
                                                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                                    placeholder="+33..."
                                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#14213D]"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">N° SIRET</label>
                                                            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus-within:ring-2 focus-within:ring-[#FCA311] transition-all">
                                                                <Hash size={18} className="text-[#14213D]/20" />
                                                                <input
                                                                    type="text"
                                                                    value={settings.siret}
                                                                    onChange={(e) => setSettings({ ...settings, siret: e.target.value })}
                                                                    placeholder="123 456 789 00012"
                                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#14213D]"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">TVA Intracommunautaire</label>
                                                            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl focus-within:ring-2 focus-within:ring-[#FCA311] transition-all">
                                                                <Globe size={18} className="text-[#14213D]/20" />
                                                                <input
                                                                    type="text"
                                                                    value={settings.tva}
                                                                    onChange={(e) => setSettings({ ...settings, tva: e.target.value })}
                                                                    placeholder="FR 12 345678901"
                                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#14213D]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Adresse */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
                                                <div className="w-8 h-8 bg-gray-50 border border-[#E5E5E5] text-[#14213D] rounded-lg flex items-center justify-center">
                                                    <MapPin size={16} />
                                                </div>
                                                <h3 className="text-[11px] font-black text-[#14213D] uppercase tracking-widest">Siège Social</h3>
                                            </div>

                                            <div className="bg-gray-50 border border-[#E5E5E5] rounded-3xl p-6 space-y-4">
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={settings.addressDetails?.street || settings.address}
                                                        onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, street: e.target.value } })}
                                                        placeholder="N° et Rue"
                                                        className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm font-bold text-[#14213D] focus:ring-2 focus:ring-[#FCA311] transition-all"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            value={settings.addressDetails?.zip}
                                                            onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, zip: e.target.value } })}
                                                            placeholder="Code Postal"
                                                            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm font-bold text-[#14213D] focus:ring-2 focus:ring-[#FCA311] transition-all"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={settings.addressDetails?.city}
                                                            onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, city: e.target.value } })}
                                                            placeholder="Ville"
                                                            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm font-bold text-[#14213D] focus:ring-2 focus:ring-[#FCA311] transition-all"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={settings.addressDetails?.country}
                                                        onChange={(e) => setSettings({ ...settings, addressDetails: { ...settings.addressDetails, country: e.target.value } })}
                                                        placeholder="Pays"
                                                        className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm font-bold text-[#14213D] focus:ring-2 focus:ring-[#FCA311] transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bank Section - Only for Invoices */}
                                        {docType === 'invoice' && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
                                                    <div className="w-8 h-8 bg-[#14213D] text-[#FCA311] rounded-lg flex items-center justify-center">
                                                        <Banknote size={16} />
                                                    </div>
                                                    <h3 className="text-[11px] font-black text-[#14213D] uppercase tracking-widest">Paiement</h3>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 bg-[#14213D] rounded-3xl p-6 border border-[#FCA311]/20">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-[#FCA311] uppercase tracking-widest ml-1">Banque</label>
                                                        <input
                                                            type="text"
                                                            value={settings.rib.bankName}
                                                            onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bankName: e.target.value } })}
                                                            placeholder="BNP, HSBC..."
                                                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#FCA311] outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-[#FCA311] uppercase tracking-widest ml-1">IBAN</label>
                                                            <input
                                                                type="text"
                                                                value={settings.rib.iban}
                                                                onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, iban: e.target.value } })}
                                                                placeholder="FR76..."
                                                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#FCA311] outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-[#FCA311] uppercase tracking-widest ml-1">BIC</label>
                                                            <input
                                                                type="text"
                                                                value={settings.rib.bic}
                                                                onChange={(e) => setSettings({ ...settings, rib: { ...settings.rib, bic: e.target.value } })}
                                                                placeholder="BNPPFR..."
                                                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#FCA311] outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Signature & Cachet Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
                                                <div className="w-8 h-8 bg-[#14213D] text-[#FCA311] rounded-lg flex items-center justify-center">
                                                    <PenTool size={16} />
                                                </div>
                                                <h3 className="text-[11px] font-black text-[#14213D] uppercase tracking-widest">Signataire & Cachet</h3>
                                            </div>

                                            <div className="p-6 bg-gray-50 border border-[#E5E5E5] rounded-3xl grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-[#14213D]/40 uppercase tracking-widest text-center">Signature</p>
                                                    <div className="relative h-24 border border-[#E5E5E5] bg-white rounded-2xl overflow-hidden group/sig shadow-sm">
                                                        {settings.documents.signatureUrl ? (
                                                            <img src={settings.documents.signatureUrl} alt="Signature" className="h-full w-full object-contain p-2" />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-[#14213D]/20"><PenTool size={20} /></div>
                                                        )}
                                                        <label className="absolute inset-0 bg-[#14213D]/60 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                            <Upload className="text-white" size={20} />
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'documents.signatureUrl')} />
                                                        </label>
                                                        {settings.documents.signatureUrl && (
                                                            <button
                                                                onClick={() => setSettings({ ...settings, documents: { ...settings.documents, signatureUrl: '' } })}
                                                                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm z-10"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-[#14213D]/40 uppercase tracking-widest text-center">Cachet</p>
                                                    <div className="relative h-24 border border-[#E5E5E5] bg-white rounded-2xl overflow-hidden group/stamp shadow-sm">
                                                        {settings.documents.stampUrl ? (
                                                            <img src={settings.documents.stampUrl} alt="Stamp" className="h-full w-full object-contain p-2" />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-[#14213D]/20"><Zap size={20} /></div>
                                                        )}
                                                        <label className="absolute inset-0 bg-[#14213D]/60 opacity-0 group-hover/stamp:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                            <Upload className="text-white" size={20} />
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'documents.stampUrl')} />
                                                        </label>
                                                        {settings.documents.stampUrl && (
                                                            <button
                                                                onClick={() => setSettings({ ...settings, documents: { ...settings.documents, stampUrl: '' } })}
                                                                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm z-10"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
                                                <div className="w-8 h-8 bg-gray-50 border border-[#E5E5E5] text-[#14213D] rounded-lg flex items-center justify-center">
                                                    <FileText size={16} />
                                                </div>
                                                <h3 className="text-[11px] font-black text-[#14213D] uppercase tracking-widest">Clauses Légales</h3>
                                            </div>

                                            <div className="bg-gray-50 border border-[#E5E5E5] rounded-3xl p-6 space-y-6">
                                                {docType === 'receipt' ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-[#FCA311] uppercase tracking-widest ml-1">Mentions REÇU D'ACOMPTE</label>
                                                            <textarea
                                                                value={settings.documents.depositNotes}
                                                                onChange={(e) => setSettings({
                                                                    ...settings,
                                                                    documents: { ...settings.documents, depositNotes: e.target.value }
                                                                })}
                                                                rows={4}
                                                                className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 text-sm font-bold text-[#14213D] focus:ring-2 focus:ring-[#FCA311] transition-all resize-none leading-relaxed"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Mentions REÇU INTÉGRAL</label>
                                                            <textarea
                                                                value={settings.documents.fullPaymentNotes}
                                                                onChange={(e) => setSettings({
                                                                    ...settings,
                                                                    documents: { ...settings.documents, fullPaymentNotes: e.target.value }
                                                                })}
                                                                rows={4}
                                                                className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 text-sm font-bold text-[#14213D] focus:ring-2 focus:ring-[#FCA311] transition-all resize-none leading-relaxed"
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">
                                                            {docType === 'contract' ? 'Conditions Générales de Vente' : 
                                                             docType === 'delivery' ? 'Constat de Livraison (Bordereau)' : 
                                                             'Mentions de Facturation'}
                                                        </label>
                                                        <textarea
                                                            value={
                                                                docType === 'contract' ? settings.documents.contractTerms : 
                                                                docType === 'delivery' ? settings.documents.deliveryNotes : 
                                                                settings.documents.invoiceNotes
                                                            }
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                documents: {
                                                                    ...settings.documents,
                                                                    [docType === 'contract' ? 'contractTerms' : 
                                                                     docType === 'delivery' ? 'deliveryNotes' : 
                                                                     'invoiceNotes']: e.target.value
                                                                }
                                                            })}
                                                            placeholder="Saisissez le texte légal ici..."
                                                            rows={8}
                                                            className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 text-sm font-bold text-[#14213D] placeholder:text-gray-300 focus:ring-2 focus:ring-[#FCA311] transition-all resize-none leading-relaxed"
                                                        />
                                                    </div>
                                                )}
                                            </div>
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
