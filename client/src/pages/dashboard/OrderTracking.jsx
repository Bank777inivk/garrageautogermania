import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Box,
    CheckCircle,
    Clock,
    Truck,
    MapPin,
    CreditCard,
    Zap,
    Shield,
    FileCheck,
    FileText
} from 'lucide-react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import toast from 'react-hot-toast';
import { generateContractPDF, generateInvoicePDF } from '@shared/utils/generateAdminDocuments';
import useLangNavigate from '../../hooks/useLangNavigate';

const OrderTracking = () => {
    const { orderId } = useParams();
  const { langPath } = useLangNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        if (!orderId) return;

        const docRef = doc(db, "orders", orderId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });

                // Fetch settings once
                if (!settings) {
                    const settingsRef = doc(db, 'settings', 'documents');
                    getDoc(settingsRef).then(settingsSnap => {
                        if (settingsSnap.exists()) {
                            setSettings(settingsSnap.data());
                        }
                    });
                }
            } else {
                toast.error("Commande introuvable");
            }
            setLoading(false);
        }, (error) => {
            console.error("Error monitoring order:", error);
            toast.error("Erreur de suivi en temps réel");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [orderId]);

    const stages = [
        { id: 'validation', label: 'Validation', icon: Shield, desc: 'Vérification administrative', x: '5%', y: '50%' },
        { id: 'pending', label: 'En attente de paiement', icon: CreditCard, desc: 'Paiement sécurisé requis', x: '23%', y: '50%' },
        { id: 'logistics', label: 'Logistique', icon: Box, desc: 'Préparation', x: '41%', y: '50%' },
        { id: 'transit', label: 'En Route', icon: Truck, desc: 'Transport international', x: '59%', y: '50%' },
        { id: 'concierge', label: 'Arrivée', icon: MapPin, desc: 'Conciergerie', x: '77%', y: '50%' },
        { id: 'delivered', label: 'Livré', icon: CheckCircle, desc: 'Livraison finale', x: '95%', y: '50%' }
    ];

    const getActiveStageIndex = () => {
        if (!order || !order.status) return 0;

        const status = order.status.toLowerCase();

        const statusMap = {
            'validation': 0,
            'pending': 1,
            'logistics': 2,
            'transit': 3,
            'concierge': 4,
            'delivered': 5,
            'completed': 5,
            'confirmed': 2
        };

        const idx = statusMap[status];
        return typeof idx !== 'undefined' ? idx : 0;
    };

    const activeIndex = getActiveStageIndex();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#020617]">
            <div className="w-16 h-16 border-4 border-white/5 rounded-full animate-spin" style={{ borderTopColor: '#052659' }} />
        </div>
    );

    if (!order) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans pt-8 pb-20">
            <style>{`
                @keyframes pulse-emerald {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                }
                @keyframes pulse-blue {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                }
                .animate-glow-pulse { animation: pulse-blue 2s infinite; }
                .animate-glow-pulse-emerald { animation: pulse-emerald 2s infinite; }
                @keyframes flow-line { to { stroke-dashoffset: -40; } }
                .animate-flow-path { stroke-dasharray: 8 12; animation: flow-line 2s linear infinite; }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 md:mb-16">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <Link to={langPath('/dashboard/orders')} className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-sm">
                            <ArrowLeft className="text-slate-500" size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                                Tracking #{order.orderNumber}
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">
                                Suivi de livraison en temps réel
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {order.status === 'pending' && (
                            <>
                                <button
                                    onClick={async () => {
                                        try {
                                            await generateInvoicePDF(order, settings);
                                            toast.success("Facture proforma téléchargée");
                                        } catch (error) {
                                            console.error("PDF Error:", error);
                                            toast.error("Erreur génération facture");
                                        }
                                    }}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 font-semibold text-sm transition-all shadow-sm"
                                >
                                    <FileText size={18} className="text-slate-400" />
                                    Facture Proforma
                                </button>
                                <button
                                    onClick={() => window.location.href = `/dashboard/payment/${order.id}`}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold text-sm transition-all shadow-sm"
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
                                    toast.error("Erreur gérération contrat");
                                }
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 font-semibold text-sm transition-all shadow-sm"
                        >
                            <FileCheck size={18} className="text-slate-400" />
                            Contrat de vente
                        </button>
                    </div>
                </div>

                <div className="relative">
                    {/* Horizontal Desktop View */}
                    <div className="hidden lg:block relative h-[300px] flex items-center justify-center overflow-visible">
                        <div className="w-full relative h-full flex items-center">
                            {/* THE "ROUTE" - SVG TRACKS */}
                            <svg className="w-full h-2 absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-visible" preserveAspectRatio="none">
                                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                                <line
                                    x1="0%" y1="50%"
                                    x2={stages[activeIndex].x}
                                    y2="50%"
                                    stroke="#3b82f6"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                />
                            </svg>

                            {/* Stages Nodes */}
                            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
                                {stages.map((stage, idx) => {
                                    const isActive = idx <= activeIndex;
                                    const isCurrent = idx === activeIndex;
                                    const isValidation = stage.id === 'validation';
                                    const isDelivered = stage.id === 'delivered';

                                    let labelClass = 'bg-white text-slate-500 border border-slate-200 shadow-sm';
                                    let iconClass = 'bg-white border-slate-200 text-slate-400 shadow-sm';

                                    if (isCurrent) {
                                        labelClass = isDelivered ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200';
                                        iconClass = isDelivered ? 'bg-emerald-500 text-white border-emerald-600 animate-glow-pulse-emerald' : 'bg-blue-600 text-white border-blue-700 animate-glow-pulse';
                                    } else if (isActive) {
                                        labelClass = isValidation || isDelivered ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-200';
                                        iconClass = isValidation || isDelivered ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-400 border-slate-500 text-white';
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className="absolute top-1/2"
                                            style={{
                                                left: stage.x,
                                                transform: 'translateX(-50%)'
                                            }}
                                        >
                                            <div className={`relative flex flex-col items-center pointer-events-auto transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                                <div className="absolute bottom-16 flex flex-col items-center">
                                                    <div className="mb-3">
                                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${labelClass}`}>
                                                            {stage.label}
                                                        </span>
                                                    </div>
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${iconClass}`}>
                                                        <stage.icon size={20} />
                                                    </div>
                                                    <div className={`w-0.5 h-12 mt-2 transition-all duration-500 ${isActive ? 'bg-blue-200' : 'bg-slate-200'}`} />
                                                </div>
                                                <div className="absolute top-16 flex flex-col items-center text-center">
                                                    <div className={`w-0.5 h-12 mb-2 transition-all duration-500 ${isActive ? 'bg-blue-200' : 'bg-slate-200'}`} />
                                                    <p className={`text-xs font-semibold w-40 transition-all duration-500 ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                                                        {stage.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pointer (Truck) */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 z-40 transition-all duration-1000 ease-in-out pointer-events-none"
                                style={{ left: stages[activeIndex].x, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Truck size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vertical Mobile View */}
                    <div className="lg:hidden flex flex-col gap-6 py-6 relative">
                        <div className="absolute left-8 top-10 bottom-10 w-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 w-full transition-all duration-1000 bg-blue-500"
                                style={{ height: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                            />
                        </div>

                        {stages.map((stage, idx) => {
                            const isActive = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;
                            const isDelivered = stage.id === 'delivered';

                            let iconMobileClass = 'bg-white border-slate-200 text-slate-400';
                            let titleMobileClass = 'text-slate-500';
                            let badgeMobileClass = 'bg-blue-100 text-blue-700 border-blue-200';

                            if (isCurrent) {
                                iconMobileClass = isDelivered ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-blue-600 text-white border-blue-700';
                                titleMobileClass = 'text-slate-900';
                                badgeMobileClass = isDelivered ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : badgeMobileClass;
                            } else if (isActive) {
                                iconMobileClass = isDelivered ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-400 text-white border-slate-500';
                                titleMobileClass = 'text-slate-700';
                            }

                            return (
                                <div key={idx} className={`relative flex gap-6 items-center transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`relative z-10 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border-2 shadow-sm ${iconMobileClass}`}>
                                        <stage.icon size={20} />
                                    </div>
                                    <div className="flex-grow bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold text-sm ${titleMobileClass}`}>
                                                {stage.label}
                                            </h3>
                                            {isCurrent && (
                                                <span className={`px-2 py-1 text-xs font-bold rounded-md border ${badgeMobileClass}`}>Actuel</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500">
                                            {stage.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats Panel (Footer) */}
                <div className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-0.5">Position Actuelle</p>
                                <span className="text-base font-bold text-slate-900">{stages[activeIndex]?.label || "N/A"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-0.5">Statut Logistique</p>
                                <span className="text-base font-bold text-slate-900">{stages[activeIndex]?.desc || "En attente"}</span>
                            </div>
                        </div>
                        <Link to={langPath('/contact')} className="bg-slate-900 text-white rounded-3xl font-bold text-sm transition-all hover:bg-slate-800 flex items-center justify-center p-6 md:py-0 shadow-sm">
                            Assistance Directe
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
