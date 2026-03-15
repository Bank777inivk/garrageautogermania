import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
    Search,
    Loader2
} from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import toast from 'react-hot-toast';

const PublicTracking = () => {
    const { t } = useTranslation();
    const [orderNumberInput, setOrderNumberInput] = useState('');
    const [order, setOrder] = useState(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset searched state when input changes to hide "Not Found" message while typing
    useEffect(() => {
        if (searched) setSearched(false);
    }, [orderNumberInput]);

    const stages = [
        { id: 'validation', label: 'Validation', icon: Shield, desc: 'Vérification administrative', x: '5%', y: '50%' },
        { id: 'pending', label: 'En attente de paiement', icon: CreditCard, desc: 'Paiement sécurisé requis', x: '23%', y: '50%' },
        { id: 'logistics', label: 'Logistique', icon: Box, desc: 'Préparation', x: '41%', y: '50%' },
        { id: 'transit', label: 'En Route', icon: Truck, desc: 'Transport international', x: '59%', y: '50%' },
        { id: 'concierge', label: 'Arrivée', icon: MapPin, desc: 'Conciergerie', x: '77%', y: '50%' },
        { id: 'delivered', label: 'Livré', icon: CheckCircle, desc: 'Livraison finale', x: '95%', y: '50%' }
    ];

    const getActiveStageIndex = (ord) => {
        if (!ord) return 0;
        const statusMap = {
            'validation': 0,
            'pending': 1,
            'logistics': 2,
            'transit': 3,
            'concierge': 4,
            'delivered': 5,
            'completed': 5, // legacy support
            'confirmed': 2  // legacy support
        };
        const idx = statusMap[ord.status];
        return typeof idx !== 'undefined' ? idx : 0;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!orderNumberInput.trim()) return;

        setLoading(true);
        setSearched(true);
        setOrder(null);

        try {
            const ordersRef = collection(db, "orders");
            const q = query(
                ordersRef,
                where("orderNumber", "==", orderNumberInput.trim()),
                limit(1)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                toast.error(t('tracking.notFound'));
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(t('tracking.error'));
        } finally {
            setLoading(false);
        }
    };

    const activeIndex = order ? getActiveStageIndex(order) : 0;

    if (!order || loading) {
        return (
            <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden pt-12 md:pt-20 pb-12">
                {/* Soft Decorative Glow for Light Mode */}
                <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-50 blur-[100px] md:blur-[150px] rounded-full opacity-60" />

                <div className="relative z-10 w-full max-w-xl">
                    <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 p-8 md:p-14 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group/card transition-all duration-500 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)]">
                        {/* Header Section Integrated Inside the Card */}
                        <div className="text-center mb-10 md:mb-12 relative z-10">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-600/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 border border-amber-600/10">
                                <Truck className="text-amber-600" size={32} md:size={40} />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-slate-900">
                                {t('tracking.title')}
                            </h1>
                            <p className="text-slate-400 text-[10px] md:text-[12px] uppercase font-black tracking-[0.4em]">
                                {t('tracking.subtitle')}
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-5 relative z-10">
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    value={orderNumberInput}
                                    onChange={(e) => setOrderNumberInput(e.target.value)}
                                    placeholder={t('tracking.placeholder')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-4 md:py-6 pl-8 md:pl-10 pr-20 md:pr-24 outline-none focus:border-amber-600/40 focus:ring-4 focus:ring-amber-600/5 transition-all text-lg md:text-xl font-black placeholder:text-slate-300 text-slate-900"
                                />
                                <Search className="absolute right-8 md:right-10 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-amber-600 transition-colors" size={24} md:size={28} />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 md:py-6 bg-slate-950 hover:bg-amber-600 disabled:bg-slate-200 rounded-xl md:rounded-2xl font-black text-xs md:text-sm text-white uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-xl shadow-slate-900/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : t('tracking.search')}
                            </button>
                        </form>

                        {searched && !loading && !order && (
                            <div className="mt-10 p-6 bg-red-50 rounded-2xl border border-red-100 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-red-700 text-[11px] font-black uppercase tracking-widest leading-relaxed opacity-70">
                                    {t('tracking.notFound')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative font-sans pt-12 md:pt-20 pb-12 md:pb-20">
            <style>{`
                @keyframes extreme-pulse {
                    0%, 100% { 
                        box-shadow: 0 0 30px rgba(220, 38, 38, 0.7), 0 0 0 0px rgba(220, 38, 38, 0.5); 
                        transform: scale(1.1); 
                    }
                    50% { 
                        box-shadow: 0 0 120px rgba(220, 38, 38, 1), 0 0 0 40px rgba(220, 38, 38, 0); 
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
                .animate-glow-pulse::after {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border: 3px solid #dc2626;
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

            {/* Main Page Layout - Everything scrolls together */}
            <div className="container mx-auto px-4 lg:px-8 relative z-10">

                {/* Integrated Page Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
                    <div className="flex items-center gap-5 md:gap-8 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setOrder(null);
                                setSearched(false);
                            }}
                            className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                        >
                            <ArrowLeft className="text-slate-500 group-hover:text-white" size={20} md:size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-1 md:mb-2 text-white">
                                Tracking #{order.orderNumber}
                            </h1>
                            <p className="text-slate-500 text-[10px] md:text-[12px] uppercase font-black tracking-[0.4em] opacity-80">
                                Live delivery roadmap
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 bg-amber-600/10 border border-amber-500/20 px-6 md:px-8 py-3 md:py-4 rounded-2xl w-full md:w-auto justify-center md:justify-start">
                        <Zap size={18} md:size={20} className="text-amber-500" />
                        <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-amber-500">Livraison Prioritaire</span>
                    </div>
                </div>

                {/* Tracking Content Block */}
                <div className="relative">
                    {/* Desktop Roadmap (Horizontal) */}
                    <div className="hidden lg:flex relative h-[480px] items-center justify-center">
                        <div className="w-full relative h-full flex items-center">
                            {/* THE "ROUTE" - SVG TRACKS */}
                            <svg className="w-full h-2 absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-visible" preserveAspectRatio="none">
                                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.03)" strokeWidth="60" strokeLinecap="round" />
                                <line x1={stages[activeIndex].x} y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="10 10" strokeLinecap="round" className="transition-all duration-[2000ms] ease-in-out" />
                                <line x1="0%" y1="50%" x2={stages[activeIndex].x} y2="50%" stroke="rgba(220, 38, 38, 0.2)" strokeWidth="10" strokeLinecap="round" className="transition-all duration-[2000ms] ease-in-out blur-lg" />
                                <line x1="0%" y1="50%" x2={stages[activeIndex].x} y2="50%" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" className="transition-all duration-[2000ms] ease-in-out" />
                                <line x1="0%" y1="50%" x2={stages[activeIndex].x} y2="50%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeLinecap="round" className="animate-flow-path transition-all duration-[2000ms] ease-in-out opacity-50" />
                            </svg>

                            {/* Stages Nodes */}
                            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
                                {stages.map((stage, idx) => {
                                    const isActive = idx <= activeIndex;
                                    const isCurrent = idx === activeIndex;
                                    const isValidation = stage.id === 'validation';

                                    return (
                                        <div key={idx} className="absolute top-1/2" style={{ left: stage.x, transform: 'translateX(-50%)' }}>
                                            <div className={`relative flex flex-col items-center pointer-events-auto group transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}>
                                                <div className="absolute bottom-20 flex flex-col items-center">
                                                    <div className="mb-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl whitespace-nowrap transition-all ${isCurrent ? 'bg-red-700 text-white scale-110' : isActive ? (isValidation ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900') : 'bg-slate-900 text-slate-500 border border-white/5'}`}>
                                                            {stage.label}
                                                        </span>
                                                    </div>
                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-700 border-2 ${isCurrent ? 'bg-white text-red-600 border-red-500/50 animate-glow-pulse' : isActive ? (isValidation ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-white/20 text-white') : 'bg-slate-900 border-white/10 text-slate-600 group-hover:border-red-500/50 group-hover:text-red-500 group-hover:scale-110'}`}>
                                                        <stage.icon size={26} className="transition-colors duration-500" />
                                                    </div>
                                                    <div className={`w-1 h-20 mt-2 bg-gradient-to-b transition-all duration-700 ${isActive ? 'from-red-500/40 to-transparent' : 'from-white/10 to-transparent'}`} />
                                                </div>
                                                <div className="absolute top-20 flex flex-col items-center text-center">
                                                    <div className={`w-1 h-20 mb-2 bg-gradient-to-t transition-all duration-700 ${isActive ? 'from-red-500/40 to-transparent' : 'from-white/10 to-transparent'}`} />
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
                            <div className="absolute top-1/2 -translate-y-1/2 z-40 transition-all duration-[2000ms] ease-in-out pointer-events-none" style={{ left: stages[activeIndex].x, transform: 'translate(-50%, -50%)' }}>
                                <div className="relative group/truck">
                                    <div className="bg-amber-600 p-5 rounded-[2rem] ring-[12px] ring-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                                        <Truck size={42} className="text-white drop-shadow-lg" />
                                        <div className="absolute -right-2 top-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border-4 border-amber-600">
                                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping" />
                                        </div>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-8 bg-amber-600/15 blur-3xl rounded-full mt-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Roadmap (Vertical Stepper) */}
                    <div className="lg:hidden flex flex-col gap-10 py-6 relative">
                        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-white/5">
                            <div className="absolute top-0 left-0 w-full bg-red-600 transition-all duration-[1500ms] shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ height: `${(activeIndex / (stages.length - 1)) * 100}%` }}>
                                <div className="absolute inset-0 bg-red-500 blur-sm opacity-50"></div>
                            </div>
                        </div>

                        {stages.map((stage, idx) => {
                            const isActive = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;
                            const isValidation = stage.id === 'validation';

                            return (
                                <div key={idx} className={`relative flex gap-6 items-start transition-all duration-500 group cursor-pointer ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                                    <div className={`relative z-10 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${isCurrent ? 'bg-white text-red-600 border-red-600 scale-110 animate-glow-pulse' : isActive ? (isValidation ? 'bg-emerald-600/20 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-white/20 text-white') : 'bg-slate-950 border-white/5 text-slate-600'} group-hover:scale-110 group-hover:bg-red-600/20 group-hover:border-red-500/50 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-90`}>
                                        <stage.icon size={20} className="transition-transform duration-500 group-hover:scale-110" />
                                        {isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-[#020617] flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow pt-1.5 transition-all duration-500 group-hover:translate-x-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-black text-[11px] uppercase tracking-widest transition-colors duration-500 ${isCurrent ? 'text-red-500' : isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                                {stage.label}
                                            </h3>
                                            {isCurrent && (
                                                <span className="animate-pulse px-2 py-0.5 bg-red-600/20 border border-red-600/40 text-red-500 text-[8px] font-black uppercase rounded-md tracking-tighter shadow-[0_0_15px_rgba(220,38,38,0.4)]">Actuel</span>
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

                    {/* Footer Info Section */}
                    <div className="mt-12 md:mt-32 pt-10 md:pt-16 border-t border-white/5">
                        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 md:gap-10">
                            <div className="flex items-center gap-5 md:gap-8 flex-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                                    <MapPin className="text-red-500" size={24} md:size={32} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] md:text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Position Actuelle</p>
                                    <span className="text-base md:text-xl font-black uppercase text-white tracking-tight leading-none">{stages[activeIndex]?.label || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 md:gap-8 flex-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                                    <Clock className="text-amber-500" size={24} md:size={32} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] md:text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Statut Logistique</p>
                                    <span className="text-base md:text-xl font-black uppercase text-white tracking-tight leading-none">{stages[activeIndex]?.desc || "En attente"}</span>
                                </div>
                            </div>
                            <Link to="/contact" className="px-10 md:px-14 py-6 md:py-8 bg-red-700 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-red-800 transition-all hover:scale-[1.05] active:scale-95 text-center flex items-center justify-center">
                                Assistance Directe
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicTracking;
