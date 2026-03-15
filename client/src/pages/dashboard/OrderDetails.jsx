import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
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
    Phone,
    Download, // Added Download icon
    Truck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@shared/store/useAuthStore';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { generateOrderPDF, generateContractPDF, generatePaymentReceiptPDF, generateDeliverySlipPDF, generateInvoicePDF } from '@shared/utils/generateAdminDocuments';
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
    const [isSwitchingMode, setIsSwitchingMode] = useState(false);

    // Modal state
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'info'
    });

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

                // Fetch Settings (already correctly set to 'settings/documents')
                if (!settings) {
                    const settingsRef = doc(db, 'settings', 'documents');
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
    }, [orderId, user, navigate, vehicleDetails, settings]); // Added settings to dependency array to prevent re-fetching if already present

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: '#052659' }}></div>
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] animate-pulse" style={{ color: '#5483B3' }}>Chargement de votre commande...</p>
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
                <Link to="/dashboard/orders" className="inline-flex items-center font-bold hover:gap-2 transition-all uppercase text-[10px] tracking-widest" style={{ color: '#052659' }}>
                    <ArrowLeft size={20} className="mr-2" /> Retour à mes commandes
                </Link>
            </div>
        );
    }

    const handleSwitchToFullPayment = async () => {
        if (!order || order.paymentOption === 'full' || order.status !== 'pending') return;
        
        setModalConfig({
            isOpen: true,
            title: "Passer au Paiement Intégral",
            message: "Voulez-vous régler la totalité de vos véhicules dès maintenant ? Vous bénéficierez immédiatement d'une remise de 15% appliquée sur le prix total.",
            variant: "success",
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                setIsSwitchingMode(true);
                try {
                    const subtotal = order.subtotal || 0;
                    const shipping = order.shipping || 0;
                    const discountAmount = Math.round(subtotal * 0.15);
                    const finalTotal = subtotal + shipping - discountAmount;

                    const orderRef = doc(db, 'orders', order.id);
                    await updateDoc(orderRef, {
                        paymentOption: 'full',
                        discountAmount: discountAmount,
                        total: finalTotal,
                        amountToPayNow: finalTotal,
                        fullPaymentDiscount: 15,
                        updatedAt: new Date()
                    });

                    toast.success("Mode de paiement mis à jour : Remise de 15% appliquée !");
                } catch (error) {
                    console.error("Error switching payment mode:", error);
                    toast.error("Erreur lors de la mise à jour du paiement.");
                } finally {
                    setIsSwitchingMode(false);
                }
            }
        });
    };

    const handleSwitchToDeposit = async () => {
        if (!order || order.paymentOption === 'deposit' || order.status !== 'pending') return;
        
        setModalConfig({
            isOpen: true,
            title: "Repasser à l'Acompte",
            message: "Souhaitez-vous repasser à un règlement échelonné (30% aujourd'hui) ? Notez que l'avantage client de 15% sera annulé.",
            variant: "info",
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                setIsSwitchingMode(true);
                try {
                    const subtotal = order.subtotal || 0;
                    const shipping = order.shipping || 0;
                    const finalTotal = subtotal + shipping;
                    const depositAmount = Math.round(finalTotal * 0.3);

                    const orderRef = doc(db, 'orders', order.id);
                    await updateDoc(orderRef, {
                        paymentOption: 'deposit',
                        discountAmount: 0,
                        total: finalTotal,
                        amountToPayNow: depositAmount,
                        fullPaymentDiscount: 0,
                        updatedAt: new Date()
                    });

                    toast.success("Mode de paiement mis à jour : Acompte de 30% activé.");
                } catch (error) {
                    console.error("Error switching to deposit:", error);
                    toast.error("Erreur lors de la mise à jour du paiement.");
                } finally {
                    setIsSwitchingMode(false);
                }
            }
        });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return { label: 'Confirmée & Validée', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
            case 'pending':
                return { label: 'Réservé à votre nom (En attente)', color: 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20', icon: Clock };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Info };
        }
    };

    const statusConfig = getStatusConfig(order.status);

    return (
        <>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">

            {/* Header - White Luxury Card */}
            <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in duration-700 relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <Link to="/dashboard/orders" className="p-3 bg-white/50 hover:bg-white rounded-2xl border border-white/60 shadow-sm transition-all group shrink-0">
                        <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900" />
                    </Link>
                    <div className="space-y-3">
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">
                            Commande #{order.orderNumber}
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Passée le {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR')}
                            </span>
                            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${order.status === 'completed' ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' : 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20'}`}>
                                {statusConfig.label}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={() => navigate(`/dashboard/orders/track/${order.id}`)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 group/track shadow-md hover:bg-slate-800 border border-slate-800"
                    >
                        <Compass size={18} className="group-hover:rotate-12 transition-transform" />
                        Suivre ma commande
                    </button>
                    {order.status === 'pending' && (
                        <>
                            <button
                                onClick={async () => {
                                    try {
                                        await generateInvoicePDF(order, settings);
                                        toast.success("Facture proforma téléchargée");
                                    } catch (error) {
                                        console.error("PDF Error:", error);
                                        toast.error("Erreur lors de la génération de la facture proforma");
                                    }
                                }}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-teal-50 text-teal-700 border border-teal-100 rounded-2xl hover:bg-teal-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                            >
                                <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                                Facture Proforma
                            </button>
                            <button
                                onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-[#FCA311] text-slate-900 rounded-2xl hover:bg-[#FCA311]/90 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#FCA311]/20 active:scale-95"
                            >
                                <CreditCard size={18} />
                                Finaliser mon achat
                            </button>
                        </>
                    )}

                    <button
                        onClick={async () => {
                            try {
                                await generateContractPDF(order, settings);
                                toast.success("Contrat de vente téléchargé");
                            } catch (error) {
                                console.error("PDF Error:", error);
                                toast.error("Erreur lors de la génération du contrat");
                            }
                        }}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl hover:bg-indigo-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                    >
                        <FileCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                        Contrat de vente
                    </button>
                    {(order.status === 'delivered' || order.status === 'completed' || order.status === 'logistics' || order.status === 'transit' || order.status === 'concierge') && (
                        <>
                            <button
                                onClick={async () => {
                                    try {
                                        await generatePaymentReceiptPDF(order, settings);
                                        toast.success(order.paymentOption === 'deposit' ? "Reçu d'acompte téléchargé" : "Reçu de paiement téléchargé");
                                    } catch (error) {
                                        console.error("PDF Error:", error);
                                        toast.error("Erreur lors de la génération du reçu");
                                    }
                                }}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl hover:bg-emerald-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                            >
                                <ShieldCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                                {order.paymentOption === 'deposit' ? "Reçu d'acompte" : "Reçu de paiement"}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await generateDeliverySlipPDF(order, settings);
                                        toast.success("Bordereau téléchargé");
                                    } catch (error) {
                                        console.error("PDF Error:", error);
                                        toast.error("Erreur lors de la génération du bordereau");
                                    }
                                }}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-50 text-purple-700 border border-purple-100 rounded-2xl hover:bg-purple-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                            >
                                <Truck size={18} className="group-hover/btn:scale-110 transition-transform" />
                                Bordereau de livraison
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Main Content: Vehicle Info */}
                <div className="lg:col-span-2 space-y-10">

                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight px-2">
                            <Zap size={20} className="text-[#FCA311]" />
                            Votre Configuration
                        </h2>

                        {order.items?.map((item, idx) => {
                            const fullVehicle = vehicleDetails[item.id] || {};
                            return (
                                <div key={idx} className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-900/10 overflow-hidden transition-all duration-500 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90">
                                    {/* Premium Vehicle Image Area */}
                                    <div className="relative h-64 md:h-[450px] w-full bg-slate-900 overflow-hidden">
                                        <img
                                            src={item.image || 'https://placehold.co/1200x500?text=Vehicle+Image'}
                                            alt={`${item.brand} ${item.model}`}
                                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                        />

                                        {/* Luxury Gradient Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />

                                        <div className="absolute top-8 left-8 flex flex-col gap-3">
                                            <div className="bg-[#021024]/60 backdrop-blur-md border border-[#FCA311]/30 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] shadow-xl w-fit flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#FCA311] animate-pulse" />
                                                Certifié <span className="text-[#FCA311]">AutoImport</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 bg-[#FCA311] text-slate-900 px-4 py-1.5 rounded-lg w-fit shadow-lg shadow-[#FCA311]/20">
                                                <Zap size={10} fill="currentColor" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Premium Selection</span>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase drop-shadow-2xl text-white">
                                                    {item.brand} <span className="text-white/80">{item.model}</span>
                                                </h3>
                                                <p className="text-white/60 font-black text-[8px] sm:text-[10px] uppercase tracking-widest">{fullVehicle.version || 'Plaid Edition'}</p>
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
                                                <div key={i} className="px-4 py-6 sm:px-5 sm:py-8 bg-white/50 rounded-3xl border border-slate-900/10 shadow-sm hover:shadow-[0_20px_50px_rgba(252,163,17,0.08)] hover:-translate-y-1 transition-all group/spec overflow-hidden text-center sm:text-left">
                                                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">{spec.label}</p>
                                                    <div className="flex flex-col items-center sm:items-start gap-4">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-white/80 shadow-sm flex items-center justify-center group-hover/spec:scale-110 transition-transform">
                                                            <spec.icon size={18} className="text-[#FCA311]" />
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
                                                        <div className="w-6 h-1 rounded-full bg-[#FCA311]" />
                                                        Spécifications Générales
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                                        {[
                                                            { label: 'Puissance', value: fullVehicle.power ? fullVehicle.power + ' ch' : '525 ch' },
                                                            { label: 'Couleur', value: fullVehicle.color || 'Blanc Nacré' },
                                                            { label: 'Configuration', value: `${fullVehicle.doors || '5'} Portes / ${fullVehicle.seats || '5'} Places` },
                                                            { label: 'Pays d\'Origine', value: `${fullVehicle.origin || 'Allemagne'}` }
                                                        ].map((row, i) => (
                                                            <div key={i} className="flex flex-col items-start gap-2 py-4 border-b border-white/60">
                                                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{row.label}</span>
                                                                <span className="text-sm font-black text-slate-900 uppercase leading-tight">{row.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Wide Expert Report */}
                                                <div className="space-y-6 sm:space-y-8">
                                                    <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 sm:gap-3">
                                                        <Info size={14} className="text-[#FCA311]" />
                                                        Rapport de Conciergerie
                                                    </h4>
                                                    <div className="bg-white/40 p-6 sm:p-10 rounded-3xl border border-slate-900/10 relative overflow-hidden shadow-inner group/quote">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <Info size={80} className="text-[#FCA311]" />
                                                        </div>
                                                        <p className="text-slate-500 text-[11px] sm:text-sm leading-relaxed font-medium relative italic">
                                                            " {fullVehicle.description || "Véhicule d'exception rigoureusement sélectionné. État irréprochable, historique de maintenance complet. Une opportunité rare pour les collectionneurs exigeants. "} "
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Price & CTA */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="p-10 rounded-[3rem] text-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden relative group bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024] border border-[#FCA311]/30">
                                                    {/* Vivid Atmosphere */}
                                                    <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#FCA311]/15 rounded-full blur-[80px] group-hover:bg-[#FCA311]/25 transition-all duration-[2000ms]" />
                                                    <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-[#5483B3]/10 rounded-full blur-[80px] group-hover:bg-[#5483B3]/20 transition-all duration-[2000ms]" />
                                                    
                                                    <div className="relative z-10">
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 relative">Transaction Totale</p>
                                                        <div className="relative">
                                                            <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter block mb-2">{Number(item.price).toLocaleString()}€</span>
                                                            <div className="h-1 w-20 bg-[#FCA311] rounded-full" />
                                                        </div>

                                                        <div className="mt-10 space-y-5 pt-10 border-t border-white/5">
                                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                                <span className="text-slate-400">Droits & Taxes</span>
                                                                <span className="text-white">Inclus</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                                <span className="text-slate-400">Logistique</span>
                                                                <span className="text-white border-b border-[#FCA311]/30">Certifiée</span>
                                                            </div>
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
                                                        <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-white/50 border border-slate-900/10 hover:shadow-[0_15px_40px_rgba(252,163,17,0.05)] hover:bg-white transition-all group shadow-sm">
                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-white/80 shadow-sm group-hover:scale-110 transition-transform">
                                                                <badge.icon size={20} className="text-[#FCA311]" />
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
                    <div className="rounded-[2.5rem] p-10 text-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden relative group bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024] border border-white/10">
                        {/* Vivid Atmosphere */}
                        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#FCA311]/20 rounded-full blur-[100px] group-hover:bg-[#FCA311]/30 transition-all duration-1000" />
                        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-[#5483B3]/10 rounded-full blur-[100px] group-hover:bg-[#5483B3]/20 transition-all duration-1000" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/10">
                                <div>
                                    <h3 className="text-2xl font-black mb-1 uppercase tracking-tight text-white">Récapitulatif de Transaction</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Mode de paiement : {order.paymentOption === 'full' ? 'Paiement Intégral (-15%)' : 'Acompte de 30%'}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Net</p>
                                    <p className="text-4xl font-black leading-none tracking-tighter text-white">{order.total?.toLocaleString()}€</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sous-total Véhicules</p>
                                    <p className="text-xl font-black text-white">{order.subtotal?.toLocaleString()}€</p>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Remise Excellence (15%)</p>
                                        <p className="text-xl font-black text-emerald-400">-{order.discountAmount?.toLocaleString()}€</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        {order.paymentOption === 'full' ? 'Payé Intégralement' : 'Acompte Réglé (30%)'}
                                    </p>
                                    <p className="text-xl font-black text-white">{order.amountToPayNow?.toLocaleString()}€</p>
                                </div>
                            </div>

                            {order.paymentOption === 'deposit' && (
                                <div className="pt-6 border-t border-white/10 space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group/reste">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-[#FCA311]/10 flex items-center justify-center border border-[#FCA311]/20">
                                                <Info size={18} className="text-[#FCA311]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Reste à solder</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Avant expédition finale</p>
                                            </div>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-black text-[#FCA311] tracking-tighter">{(order.total - order.amountToPayNow).toLocaleString()}€</p>
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                                            {order.paymentOption === 'deposit' ? (
                                                <>
                                                    <div className="space-y-2 text-center md:text-left">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                                            <Zap size={10} className="text-emerald-400 fill-current" />
                                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Opportunité Remise</span>
                                                        </div>
                                                        <p className="text-sm font-black text-white uppercase tracking-tight">Passez au paiement intégral</p>
                                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">
                                                            Bénéficiez immédiatement de **15% de réduction** sur le prix de vos véhicules en réglant la totalité dès aujourd'hui.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleSwitchToFullPayment}
                                                        disabled={isSwitchingMode}
                                                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                                    >
                                                        {isSwitchingMode ? 'Mise à jour...' : 'Activer la remise -15%'}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-2 text-center md:text-left">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/20 rounded-lg border border-white/10">
                                                            <Info size={10} className="text-slate-400" />
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gestion Flexible</span>
                                                        </div>
                                                        <p className="text-sm font-black text-white uppercase tracking-tight">Revenir à l'acompte</p>
                                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">
                                                            Vous pouvez choisir de ne régler que 30% d'acompte maintenant et solder le reste plus tard.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleSwitchToDeposit}
                                                        disabled={isSwitchingMode}
                                                        className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                                    >
                                                        {isSwitchingMode ? 'Mise à jour...' : 'Je laisse un acompte (30%)'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Process Guide */}
                            <div className="mt-10 pt-10 border-t border-white/5 space-y-8">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Clock size={14} className="text-[#FCA311]" />
                                    Guide du Paiement Échelonné
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-3 p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[#FCA311] font-black text-xs uppercase tracking-widest">Étape 1</div>
                                        <p className="text-[10px] text-white font-bold uppercase tracking-tight">Acompte (30%)</p>
                                        <p className="text-[9px] text-slate-400 leading-relaxed">Réglé pour sécuriser le véhicule et lancer les procédures administratives d'exportation.</p>
                                    </div>
                                    <div className="space-y-3 p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-slate-500 font-black text-xs uppercase tracking-widest">Étape 2</div>
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">Logistique & Transit</p>
                                        <p className="text-[9px] text-slate-500 leading-relaxed">Le véhicule est acheminé. Vous suivez sa progression en temps réel sur votre dashboard.</p>
                                    </div>
                                    <div className="space-y-3 p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-amber-600/30 transition-all">
                                        <div className="text-amber-600 font-black text-xs uppercase tracking-widest">Étape 3</div>
                                        <p className="text-[10px] text-white font-bold uppercase tracking-tight">Solde (70%)</p>
                                        <p className="text-[9px] text-slate-400 leading-relaxed">Le règlement du solde est requis avant la livraison finale pour déclencher la remise des clés.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Steps & Profile */}
                <div className="space-y-8">

                    {/* Steps Visual Guide */}
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full shadow-lg bg-slate-900" />
                            Cycle de Livraison
                        </h3>
                        <div className="space-y-6">
                            {[
                                {
                                    id: 1,
                                    statusKey: 'validation',
                                    label: 'Validation',
                                    desc: 'Vérification administrative',
                                    isCompleted: !['validation'].includes(order.status?.toLowerCase()),
                                    isActive: order.status?.toLowerCase() === 'validation'
                                },
                                {
                                    id: 2,
                                    statusKey: 'pending',
                                    label: 'Règlement',
                                    desc: 'Paiement Swift sécurisé',
                                    isCompleted: !['validation', 'pending'].includes(order.status?.toLowerCase()),
                                    isActive: order.status?.toLowerCase() === 'pending'
                                },
                                {
                                    id: 3,
                                    statusKey: 'logistics',
                                    label: 'Logistique',
                                    desc: 'Préparation & Enlèvement',
                                    isCompleted: !['validation', 'pending', 'logistics'].includes(order.status?.toLowerCase()) && !['transit', 'concierge', 'delivered', 'completed'].includes(order.status?.toLowerCase()) ? false : ['transit', 'concierge', 'delivered', 'completed'].includes(order.status?.toLowerCase()),
                                    isActive: order.status?.toLowerCase() === 'logistics'
                                },
                                {
                                    id: 4,
                                    statusKey: 'transit',
                                    label: 'En Route',
                                    desc: 'Transport international',
                                    isCompleted: ['concierge', 'delivered', 'completed'].includes(order.status?.toLowerCase()),
                                    isActive: order.status?.toLowerCase() === 'transit'
                                },
                                {
                                    id: 5,
                                    statusKey: 'concierge',
                                    label: 'Arrivée',
                                    desc: 'Conciergerie & Formalités',
                                    isCompleted: ['delivered', 'completed'].includes(order.status?.toLowerCase()),
                                    isActive: order.status?.toLowerCase() === 'concierge'
                                },
                                {
                                    id: 6,
                                    statusKey: 'delivered',
                                    label: 'Réception',
                                    desc: 'Livraison & Immatriculation',
                                    isCompleted: order.status?.toLowerCase() === 'completed',
                                    isActive: ['delivered', 'completed'].includes(order.status?.toLowerCase())
                                }
                            ].map((step, idx, arr) => {
                                // Simplified completion check for logistics to be more robust
                                const statusOrder = ['validation', 'pending', 'logistics', 'transit', 'concierge', 'delivered', 'completed'];
                                const currentIndex = statusOrder.indexOf(order.status?.toLowerCase() || 'validation');
                                const stepIndex = statusOrder.indexOf(step.statusKey === 'delivered' ? 'delivered' : step.statusKey);

                                const isDone = currentIndex > stepIndex || (step.statusKey === 'delivered' && order.status?.toLowerCase() === 'completed');
                                const isCurrent = currentIndex === stepIndex || (step.statusKey === 'delivered' && order.status?.toLowerCase() === 'delivered');

                                return (
                                    <div key={step.id} className="flex gap-4 relative group">
                                        {idx !== arr.length - 1 && (
                                            <div className={`w-0.5 h-full absolute left-3.5 top-7 ${isDone ? 'bg-[#FCA311]' : 'bg-slate-100'}`} />
                                        )}
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] flex-shrink-0 z-10 transition-all duration-500 ${(isDone || isCurrent) && step.statusKey === 'delivered' ? 'text-emerald-500 shadow-emerald-200 shadow-lg animate-bounce bg-emerald-50' :
                                            isDone ? 'bg-[#FCA311] text-slate-900 shadow-lg' :
                                                isCurrent ? 'bg-[#FCA311] text-slate-900 shadow-lg animate-pulse' :
                                                    'bg-white/50 border border-white/80 text-slate-300'
                                            }`} style={(isDone || isCurrent) && step.statusKey === 'delivered' ? { boxShadow: '0 4px 15px rgba(16,185,129,0.2)' } : (isDone || isCurrent) ? { boxShadow: '0 4px 15px rgba(252,163,17,0.4)' } : {}}>
                                            {isDone ? <CheckCircle size={12} /> : step.id}
                                        </div>
                                        <div className="pt-0.5">
                                            <p className={`font-black text-[10px] uppercase tracking-widest transition-colors ${isCurrent || isDone ? 'text-slate-900' : 'text-slate-300'
                                                }`}>
                                                {step.label}
                                            </p>
                                            <p className={`text-[9px] mt-1 leading-tight font-bold ${isCurrent || isDone ? 'text-slate-400' : 'text-slate-200'
                                                }`}>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Customer Profile */}
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h2 className="font-black text-slate-900 mb-8 text-[10px] uppercase tracking-widest flex items-center gap-3">
                            <Users size={14} className="text-slate-400" />
                            Propriétaire
                        </h2>
                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-white/80 shadow-sm flex items-center justify-center font-black text-lg text-slate-900">
                                    {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-black text-slate-900 text-base leading-none truncate tracking-tight">{order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 truncate tracking-wide">{order.customer?.email}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-white/50 rounded-3xl border border-white/80 space-y-6">
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
                    <div className="rounded-[2.5rem] p-8 text-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden relative group bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024] border border-[#FCA311]/30">
                        {/* Vivid Atmosphere */}
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FCA311]/15 rounded-full blur-[80px] group-hover:bg-[#FCA311]/25 transition-all duration-1000" />
                        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#5483B3]/10 rounded-full blur-[80px] group-hover:bg-[#5483B3]/20 transition-all duration-1000" />
                        
                        <div className="relative z-10">
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
        </div >

        {/* Custom Confirmation Modal */}
        <ConfirmationModal
            isOpen={modalConfig.isOpen}
            onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            onConfirm={modalConfig.onConfirm}
            title={modalConfig.title}
            message={modalConfig.message}
            variant={modalConfig.variant}
            loading={isSwitchingMode}
        />
        </>
    );
};

export default OrderDetails;
