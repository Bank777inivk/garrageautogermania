import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import {
    CheckCircle,
    ArrowLeft,
    Package,
    CreditCard,
    FileText,
    Calendar,
    Fuel,
    Gauge,
    Award,
    ShieldCheck,
    FileCheck,
    Info,
    Clock,
    Shield,
    Zap,
    ChevronRight,
    MapPin,
    Compass,
    Users,
    Phone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@shared/store/useAuthStore';
import { generateOrderPDF } from '@shared/utils/generateOrderPDF';
import { generateContractPDF, generateInvoicePDF } from '@shared/utils/generateAdminDocuments';
import { toast } from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [order, setOrder] = useState(null);
    const [vehicleDetails, setVehicleDetails] = useState({});
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId || !user) return;

        const docRef = doc(db, 'orders', orderId);
        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const orderData = { id: docSnap.id, ...docSnap.data() };

                // Security check
                if (user && orderData.userId !== user.uid) {
                    navigate('/dashboard');
                    return;
                }

                setOrder(orderData);

                // Fetch vehicle details if not already fetched
                if (orderData.items && Object.keys(vehicleDetails).length === 0) {
                    const details = {};
                    for (const item of orderData.items) {
                        if (item.id) {
                            const vRef = doc(db, 'vehicles', item.id);
                            const vSnap = await getDoc(vRef);
                            if (vSnap.exists()) {
                                details[item.id] = vSnap.data();
                            }
                        }
                    }
                    setVehicleDetails(details);
                }

                // Fetch Settings
                if (!settings) {
                    const settingsRef = doc(db, 'settings', 'global');
                    const settingsSnap = await getDoc(settingsRef);
                    if (settingsSnap.exists()) {
                        setSettings(settingsSnap.data());
                    }
                }
            }
            setLoading(false);
        }, (error) => {
            console.error("Error monitoring order details:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [orderId, user, navigate, vehicleDetails]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Chargement de votre commande...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Package size={64} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande introuvable</h2>
                <p className="text-gray-500 mb-6">Désolé, nous ne parvenons pas à trouver cette commande.</p>
                <Link to="/dashboard/orders" className="inline-flex items-center text-red-700 font-bold hover:gap-2 transition-all">
                    <ArrowLeft size={20} className="mr-2" /> Retour à mes commandes
                </Link>
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return { label: 'Confirmée & Validée', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
            case 'pending':
                return { label: 'En attente de paiement', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Info };
        }
    };

    const statusConfig = getStatusConfig(order.status);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">

            {/* Header - White Luxury Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in duration-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 opacity-80" />

                <div className="flex items-center gap-6 relative z-10">
                    <Link to="/dashboard/orders" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 shadow-sm transition-all group shrink-0">
                        <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900" />
                    </Link>
                    <div className="space-y-3">
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">
                            Commande #{order.orderNumber}
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Passée le {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR')}
                            </span>
                            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                {statusConfig.label}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={() => navigate(`/dashboard/orders/track/${order.id}`)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-red-700 text-white rounded-2xl hover:bg-red-600 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-700/20 active:scale-95 group/track"
                    >
                        <Compass size={18} className="group-hover:rotate-12 transition-transform" />
                        Suivre ma commande
                    </button>
                    {order.status === 'pending' && (
                        <button
                            onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-400 text-slate-900 rounded-2xl hover:bg-amber-500 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-amber-400/20 active:scale-95"
                        >
                            <CreditCard size={18} />
                            Finaliser mon achat
                        </button>
                    )}
                    <button
                        onClick={() => {
                            try {
                                generateOrderPDF(order, settings);
                                toast.success("Bon de commande téléchargé");
                            } catch (error) {
                                console.error("PDF Error:", error);
                                toast.error("Erreur lors de la génération du PDF");
                            }
                        }}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                    >
                        <FileText size={18} className="text-red-700 group-hover/btn:scale-110 transition-transform" />
                        Bon
                    </button>
                    <button
                        onClick={() => {
                            try {
                                generateContractPDF(order, settings);
                                toast.success("Contrat de vente téléchargé");
                            } catch (error) {
                                console.error("PDF Error:", error);
                                toast.error("Erreur lors de la génération du contrat");
                            }
                        }}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl hover:bg-indigo-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                    >
                        <FileCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                        Contrat
                    </button>
                    {(order.status === 'delivered' || order.status === 'completed' || order.status === 'logistics' || order.status === 'transit' || order.status === 'concierge') && (
                        <button
                            onClick={() => {
                                try {
                                    generateInvoicePDF(order, settings);
                                    toast.success("Facture téléchargée");
                                } catch (error) {
                                    console.error("PDF Error:", error);
                                    toast.error("Erreur lors de la génération de la facture");
                                }
                            }}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl hover:bg-emerald-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                        >
                            <ShieldCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                            Facture
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Main Content: Vehicle Info */}
                <div className="lg:col-span-2 space-y-10">

                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight px-2">
                            <Zap size={20} className="text-red-700" />
                            Votre Configuration
                        </h2>

                        {order.items?.map((item, idx) => {
                            const fullVehicle = vehicleDetails[item.id] || {};
                            return (
                                <div key={idx} className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50 overflow-hidden transition-all duration-500 hover:shadow-red-900/10 group">
                                    {/* Premium Vehicle Image Area */}
                                    <div className="relative h-64 md:h-[450px] w-full bg-slate-900 overflow-hidden">
                                        <img
                                            src={item.image || 'https://placehold.co/1200x500?text=Vehicle+Image'}
                                            alt={`${item.brand} ${item.model}`}
                                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                        />

                                        {/* Luxury Gradient Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />

                                        {/* Premium Floating Badge */}
                                        <div className="absolute top-8 left-8 flex flex-col gap-4">
                                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl w-fit">
                                                Certifié <span className="text-white">AutoImport</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="inline-flex items-center gap-2 bg-red-700 text-white px-3 py-1 rounded-lg shadow-lg shadow-red-700/20 w-fit">
                                                    <Zap size={10} fill="currentColor" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Premium Selection</span>
                                                </div>
                                                <h3 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase drop-shadow-2xl">
                                                    {item.brand} <span className="text-red-700">{item.model}</span>
                                                </h3>
                                                <p className="text-white/60 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.3em]">{fullVehicle.version || 'Plaid Edition'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-12 space-y-12">
                                        {/* Layer 1: Global Stats */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                            {[
                                                { label: 'Année', value: fullVehicle.year || item.year || '2023', icon: Calendar },
                                                { label: 'Kilométrage', value: fullVehicle.mileage ? fullVehicle.mileage.toLocaleString() + ' km' : (item.mileage ? item.mileage.toLocaleString() + ' km' : '12 500 km'), icon: Gauge },
                                                { label: 'Énergie', value: fullVehicle.fuel || item.fuel || 'Essence', icon: Fuel },
                                                { label: 'Boîte', value: fullVehicle.transmission || 'Auto', icon: Award }
                                            ].map((spec, i) => (
                                                <div key={i} className="px-4 py-6 sm:px-5 sm:py-8 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group/spec overflow-hidden text-center sm:text-left">
                                                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">{spec.label}</p>
                                                    <div className="flex flex-col items-center sm:items-start gap-4">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-red-700 group-hover/spec:scale-110 transition-transform">
                                                            <spec.icon size={18} />
                                                        </div>
                                                        <span className="text-xs sm:text-[15px] font-black text-slate-900 tracking-tight leading-none uppercase truncate w-full">{spec.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                                            {/* Column 1: Technical Details */}
                                            <div className="lg:col-span-3 space-y-12">
                                                <div className="space-y-8">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                                        <div className="w-6 h-1 bg-red-700 rounded-full" />
                                                        Spécifications Générales
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                                        {[
                                                            { label: 'Puissance', value: fullVehicle.power ? fullVehicle.power + ' ch' : '525 ch' },
                                                            { label: 'Couleur', value: fullVehicle.color || 'Blanc Nacré' },
                                                            { label: 'Configuration', value: `${fullVehicle.doors || '5'} Portes / ${fullVehicle.seats || '5'} Places` },
                                                            { label: 'Pays d\'Origine', value: `${fullVehicle.origin || 'Allemagne'}` }
                                                        ].map((row, i) => (
                                                            <div key={i} className="flex flex-col items-start gap-2 py-4 border-b border-slate-50">
                                                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{row.label}</span>
                                                                <span className="text-sm font-black text-slate-900 uppercase leading-tight">{row.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Wide Expert Report */}
                                                <div className="space-y-6 sm:space-y-8">
                                                    <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 sm:gap-3">
                                                        <Info size={14} className="text-red-700" />
                                                        Rapport de Conciergerie
                                                    </h4>
                                                    <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100 relative overflow-hidden shadow-inner">
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-700/5 blur-[100px] rounded-full" />
                                                        <p className="text-slate-500 text-[11px] sm:text-sm leading-relaxed font-medium relative italic">
                                                            " {fullVehicle.description || "Véhicule d'exception rigoureusement sélectionné. État irréprochable, historique de maintenance complet. Une opportunité rare pour les collectionneurs exigeants. "} "
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Price & CTA */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
                                                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-700/5 blur-3xl rounded-full" />
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 relative">Transaction Totale</p>
                                                    <div className="relative">
                                                        <span className="text-4xl font-black text-slate-900 tracking-tighter block mb-2">{Number(item.price).toLocaleString()}€</span>
                                                        <div className="h-1 w-20 bg-red-700 rounded-full" />
                                                    </div>

                                                    <div className="mt-10 space-y-5">
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-slate-400">Droits & Taxes</span>
                                                            <span className="text-slate-900">Inclus</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-slate-400">Logistique</span>
                                                            <span className="text-red-600">Certifiée</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Badges */}
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Documentation COC', icon: FileCheck },
                                                        { label: 'Garantie Importateur', icon: ShieldCheck },
                                                        { label: 'Expertise 110 Points', icon: CheckCircle }
                                                    ].map((badge, i) => (
                                                        <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-700 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                                                                <badge.icon size={20} />
                                                            </div>
                                                            <p className="font-black text-slate-900 text-[10px] uppercase tracking-widest leading-tight">{badge.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Grounded Total Summary */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">Solde de la Transaction</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Valeur finale incluant frais administratifs.</p>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Livraison</p>
                                    <p className="text-green-400 font-black text-base uppercase tracking-widest">Incluse</p>
                                </div>
                                <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">Montant Net</p>
                                    <p className="text-4xl font-black text-white leading-none tracking-tighter">{order.total?.toLocaleString()}€</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Steps & Profile */}
                <div className="space-y-8">

                    {/* Steps Visual Guide */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]" />
                            Cycle de Livraison
                        </h3>
                        <div className="space-y-8">
                            <div className="flex gap-5 relative group">
                                <div className="w-px bg-slate-100 h-full absolute left-4 top-8" />
                                <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-xs flex-shrink-0 z-10 shadow-lg shadow-red-700/20">1</div>
                                <div className="pt-0.5">
                                    <p className="font-black text-slate-900 text-[11px] uppercase tracking-widest group-hover:text-red-600 transition-colors">Règlement</p>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-bold">Transfert Swift sécurisé.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 relative group">
                                <div className="w-px bg-slate-100 h-full absolute left-4 top-8" />
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center font-black text-xs flex-shrink-0 z-10">2</div>
                                <div className="pt-0.5">
                                    <p className="font-black text-slate-300 text-[11px] uppercase tracking-widest group-hover:text-slate-900 transition-colors">Logistique</p>
                                    <p className="text-[10px] text-slate-300 mt-2 leading-relaxed font-bold">Transport intercontinental.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 group">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center font-black text-xs flex-shrink-0 z-10">3</div>
                                <div className="pt-0.5">
                                    <p className="font-black text-slate-300 text-[11px] uppercase tracking-widest group-hover:text-slate-900 transition-colors">Réception</p>
                                    <p className="text-[10px] text-slate-300 mt-2 leading-relaxed font-bold">Finalisation immatriculation.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Profile */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl">
                        <h2 className="font-black text-slate-900 mb-8 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                            <Users size={14} className="text-red-700" />
                            Propriétaire
                        </h2>
                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-red-700 font-black text-lg border border-slate-200 shadow-inner">
                                    {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-black text-slate-900 text-base leading-none truncate tracking-tight">{order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 truncate tracking-wide">{order.customer?.email}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin size={16} className="text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Destinations</p>
                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">
                                            {order.customer?.address}<br />
                                            {order.customer?.zipCode} {order.customer?.city}, {order.customer?.country}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone size={16} className="text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ligne Directe</p>
                                        <p className="text-[11px] font-bold text-slate-600 uppercase leading-none">{order.customer?.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assistance Card */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 rotate-12">
                            <Shield size={120} />
                        </div>
                        <h4 className="font-black text-xl mb-2 uppercase tracking-tight">Conciergerie</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Accompagnement VIP 24/7</p>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-2xl flex items-center justify-between transition-all border border-white/5 group/btn">
                            <span className="text-[9px] font-black uppercase tracking-widest">Ouvrir un Ticket</span>
                            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
