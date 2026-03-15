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

const OrderTracking = () => {
    const { orderId } = useParams();
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
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative font-sans pt-8 pb-20">
            <style>{`
                @keyframes extreme-pulse {
                    0%, 100% { 
                        box-shadow: 0 0 30px rgba(5, 38, 89, 0.7), 0 0 0 0px rgba(5, 38, 89, 0.5); 
                        transform: scale(1.1); 
                    }
                    50% { 
                        box-shadow: 0 0 120px rgba(5, 38, 89, 1), 0 0 0 40px rgba(5, 38, 89, 0); 
                        transform: scale(1.25); 
                    }
                }
                @keyframes extreme-pulse-emerald {
                    0%, 100% { 
                        box-shadow: 0 0 30px rgba(16, 185, 129, 0.7), 0 0 0 0px rgba(16, 185, 129, 0.5); 
                        transform: scale(1.1); 
                    }
                    50% { 
                        box-shadow: 0 0 120px rgba(16, 185, 129, 1), 0 0 0 40px rgba(16, 185, 129, 0); 
                        transform: scale(1.25); 
                    }
                }
                @keyframes ring-expand {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                .animate-glow-pulse {
                    position: relative;
                    animation: extreme-pulse 1.2s infinite ease-in-out;
                }
                .animate-glow-pulse-emerald {
                    position: relative;
                    animation: extreme-pulse-emerald 1.2s infinite ease-in-out;
                }
                .animate-glow-pulse::after {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border: 3px solid #052659;
                    border-radius: inherit;
                    animation: ring-expand 1.2s infinite ease-out;
                    pointer-events: none;
                }
                @keyframes flow-line {
                    to { stroke-dashoffset: -40; }
                }
                .animate-flow-path {
                    stroke-dasharray: 8 12;
                    animation: flow-line 2s linear infinite;
                }
            `}</style>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 md:mb-16">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <Link to="/dashboard/orders" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                            <ArrowLeft className="text-slate-500 group-hover:text-white" size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">
                                Tracking #{order.orderNumber}
                            </h1>
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mt-1 opacity-80">
                                Live delivery roadmap
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
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
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl hover:bg-teal-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                                >
                                    <FileText size={16} className="group-hover/btn:scale-110 transition-transform" />
                                    Facture Proforma
                                </button>
                                <button
                                    onClick={() => window.location.href = `/dashboard/payment/${order.id}`}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-amber-400 text-slate-900 rounded-xl hover:bg-amber-500 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                >
                                    <CreditCard size={16} />
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
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl hover:bg-indigo-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                        >
                            <FileCheck size={16} className="group-hover/btn:scale-110 transition-transform" />
                            Contrat de vente
                        </button>
                    </div>
                </div>

                <div className="relative">
                    {/* Horizontal Desktop View */}
                    <div className="hidden lg:block relative h-[480px] flex items-center justify-center overflow-visible">
                        <div className="w-full relative h-full flex items-center">
                            {/* THE "ROUTE" - SVG TRACKS */}
                            <svg className="w-full h-2 absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-visible" preserveAspectRatio="none">
                                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="60" strokeLinecap="round" />
                                <line
                                    x1={stages[activeIndex].x} y1="50%"
                                    x2="100%" y2="50%"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="2"
                                    strokeDasharray="10 10"
                                    strokeLinecap="round"
                                    className="transition-all duration-[2000ms] ease-in-out"
                                />
                                <line
                                    x1="0%" y1="50%"
                                    x2={stages[activeIndex].x}
                                    y2="50%"
                                    stroke="rgba(5, 38, 89, 0.2)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    className="transition-all duration-[2000ms] ease-in-out blur-lg"
                                />
                                <line
                                    x1="0%" y1="50%"
                                    x2={stages[activeIndex].x}
                                    y2="50%"
                                    stroke="#052659"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    className="transition-all duration-[2000ms] ease-in-out"
                                />
                                <line
                                    x1="0%" y1="50%"
                                    x2={stages[activeIndex].x}
                                    y2="50%"
                                    stroke="rgba(255, 255, 255, 0.4)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="animate-flow-path transition-all duration-[2000ms] ease-in-out opacity-50"
                                />
                            </svg>

                            {/* Stages Nodes */}
                            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
                                {stages.map((stage, idx) => {
                                    const isActive = idx <= activeIndex;
                                    const isCurrent = idx === activeIndex;
                                    const isValidation = stage.id === 'validation';
                                    const isDelivered = stage.id === 'delivered';

                                    // Colors for active/current states
                                    let labelClass = 'bg-slate-900 text-slate-500 border border-white/5';
                                    let iconClass = 'bg-slate-900 border-white/10 text-slate-600 group-hover:border-[#052659]/50 group-hover:text-[#5483B3] group-hover:scale-110';

                                    if (isCurrent) {
                                        labelClass = isDelivered ? 'bg-emerald-600 text-white scale-110' : 'bg-[#052659] text-white scale-110';
                                        iconClass = isDelivered ? 'bg-white text-emerald-600 border-emerald-500/50 animate-glow-pulse-emerald' : 'bg-white text-[#052659] border-[#052659]/50 animate-glow-pulse';
                                    } else if (isActive) {
                                        labelClass = isValidation || isDelivered ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900';
                                        iconClass = isValidation || isDelivered ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-white/20 text-white';
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
                                            <div className={`relative flex flex-col items-center pointer-events-auto group transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}>
                                                <div className="absolute bottom-20 flex flex-col items-center">
                                                    <div className="mb-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl whitespace-nowrap transition-all ${labelClass}`}>
                                                            {stage.label}
                                                        </span>
                                                    </div>
                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-700 border-2 ${iconClass}`}>
                                                        <stage.icon size={26} className="transition-colors duration-500" />
                                                    </div>
                                                    <div className={`w-1 h-20 mt-2 bg-gradient-to-b transition-all duration-700 ${isActive ? 'from-[#052659]/40 to-transparent' : 'from-white/10 to-transparent'}`} />
                                                </div>
                                                <div className="absolute top-20 flex flex-col items-center text-center">
                                                    <div className={`w-1 h-20 mb-2 bg-gradient-to-t transition-all duration-700 ${isActive ? 'from-[#052659]/40 to-transparent' : 'from-white/10 to-transparent'}`} />
                                                    <p className={`text-[10px] font-bold uppercase tracking-[0.15em] w-56 transition-all duration-500 leading-relaxed ${isActive ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-300'}`}>
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
                                className="absolute top-1/2 -translate-y-1/2 z-40 transition-all duration-[2000ms] ease-in-out pointer-events-none"
                                style={{ left: stages[activeIndex].x, transform: 'translate(-50%, -50%)' }}
                            >
                                <div className="relative group/truck">
                                    <div className="p-5 rounded-[2rem] ring-[12px] flex items-center justify-center border" style={{ backgroundColor: '#052659', borderColor: 'rgba(5,38,89,0.3)', boxShadow: '0 0 0 12px rgba(5,38,89,0.1)' }}>
                                        <Truck size={42} className="text-white drop-shadow-lg" />
                                        <div className="absolute -right-2 top-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border-4" style={{ borderColor: '#052659' }}>
                                            <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: '#052659' }} />
                                        </div>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-8 blur-3xl rounded-full mt-6" style={{ backgroundColor: 'rgba(5,38,89,0.3)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vertical Mobile View - Synced with Public Tracking */}
                    <div className="lg:hidden flex flex-col gap-10 py-6 relative">
                        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-white/5">
                            <div
                                className="absolute top-0 left-0 w-full transition-all duration-[1500ms]"
                                style={{ height: `${(activeIndex / (stages.length - 1)) * 100}%`, backgroundColor: '#052659', boxShadow: '0 0 10px rgba(5,38,89,0.5)' }}
                            >
                                <div className="absolute inset-0 blur-sm opacity-50" style={{ backgroundColor: '#5483B3' }}></div>
                            </div>
                        </div>

                        {stages.map((stage, idx) => {
                            const isActive = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;
                            const isValidation = stage.id === 'validation';
                            const isDelivered = stage.id === 'delivered';

                            let iconMobileClass = 'bg-slate-950 border-white/5 text-slate-600';
                            let titleMobileClass = 'text-slate-500 group-hover:text-white';
                            let badgeMobileClass = 'bg-[#052659]/20 border-[#052659]/40 text-[#5483B3] shadow-[0_0_15px_rgba(5,38,89,0.4)]';

                            if (isCurrent) {
                                iconMobileClass = isDelivered ? 'bg-white text-emerald-600 border-emerald-600 scale-110 animate-glow-pulse-emerald' : 'bg-white text-[#052659] border-[#052659] scale-110 animate-glow-pulse';
                                titleMobileClass = isDelivered ? 'text-emerald-500' : 'text-[#7DA0CA]';
                                badgeMobileClass = isDelivered ? 'bg-emerald-600/20 border-emerald-600/40 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : badgeMobileClass;
                            } else if (isActive) {
                                iconMobileClass = isValidation || isDelivered ? 'bg-emerald-600/20 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-white/20 text-white';
                                titleMobileClass = 'text-white';
                            }

                            return (
                                <div key={idx} className={`relative flex gap-6 items-start transition-all duration-500 group cursor-pointer ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                                    <div className={`relative z-10 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${iconMobileClass} group-hover:scale-110 group-hover:bg-[#052659]/20 group-hover:border-[#052659]/50 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(5,38,89,0.4)] active:scale-90`}>
                                        <stage.icon size={20} className="transition-transform duration-500 group-hover:scale-110" />
                                        {isCurrent && (
                                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#020617] flex items-center justify-center ${isDelivered ? 'bg-emerald-600' : 'bg-[#052659]'}`}>
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow pt-1.5 transition-all duration-500 group-hover:translate-x-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-black text-[11px] uppercase tracking-widest transition-colors duration-500 ${titleMobileClass}`}>
                                                {stage.label}
                                            </h3>
                                            {isCurrent && (
                                                <span className={`animate-pulse px-2 py-0.5 border text-[8px] font-black uppercase rounded-md tracking-tighter ${badgeMobileClass}`}>Actuel</span>
                                            )}
                                        </div>
                                        <p className={`text-[10px] font-medium leading-relaxed uppercase tracking-wider transition-colors duration-500 ${isActive ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-700 group-hover:text-slate-400'}`}>
                                            {stage.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats Panel (Footer) */}
                <div className="mt-12 md:mt-32 pt-10 md:pt-16 border-t border-white/5 pb-20">
                    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 md:gap-10">
                        <div className="flex items-center gap-5 md:gap-8 flex-1 bg-white/[0.02] p-6 lg:bg-transparent lg:p-0 rounded-2xl border border-white/5 lg:border-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                                <MapPin size={24} md:size={32} style={{ color: '#5483B3' }} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] md:text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Position Actuelle</p>
                                <span className="text-base md:text-xl font-black uppercase text-white tracking-tight leading-none">{stages[activeIndex]?.label || "N/A"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 md:gap-8 flex-1 bg-white/[0.02] p-6 lg:bg-transparent lg:p-0 rounded-2xl border border-white/5 lg:border-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                                <Clock className="text-amber-500" size={24} md:size={32} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] md:text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Statut Logistique</p>
                                <span className="text-base md:text-xl font-black uppercase text-white tracking-tight leading-none">{stages[activeIndex]?.desc || "En attente"}</span>
                            </div>
                        </div>
                        <Link to="/contact" className="px-10 md:px-14 py-6 md:py-8 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.3em] transition-all hover:scale-[1.05] active:scale-95 text-center flex items-center justify-center" style={{ backgroundColor: '#052659' }}>
                            Assistance Directe
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
