import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heart, Search, Loader2, ChevronRight, Zap } from 'lucide-react';
import useFavoriteStore from '@shared/store/useFavoriteStore';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';
import VehicleCard from '../../components/VehicleCard';

const Favorites = () => {
    const { t } = useTranslation();
    const { favorites } = useFavoriteStore();
    const { favoriteVehicles, loading, fetchVehiclesByIds } = useClientVehicleStore();

    useEffect(() => {
        const unsubscribe = fetchVehiclesByIds(favorites);
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [favorites, fetchVehiclesByIds]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12 mt-6">
            {/* Header Section - Premium Dark Mode */}
            <div className="bg-[#14213D] rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-[#14213D]/20 border-b-8 border-[#FCA311] relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#FCA311] blur-[150px] opacity-10 rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Heart size={20} className="text-[#FCA311] fill-current" />
                        </div>
                        <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            Garage Privé
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                        Vos <span className="text-[#FCA311]">Favoris</span>
                    </h1>
                    <p className="text-white/60 mt-4 font-bold text-[11px] uppercase tracking-widest">
                        {favorites.length} {favorites.length > 1 ? 'véhicules exceptionnels sélectionnés' : 'véhicule exceptionnel sélectionné'}
                    </p>
                </div>
                
                <Link
                    to="/catalogue"
                    className="relative z-10 bg-white text-[#14213D] px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 group active:scale-95 hover:bg-[#FCA311] shadow-xl"
                >
                    Continuer la recherche
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[2.5rem] border border-slate-900/5 shadow-sm">
                    <Loader2 className="animate-spin h-12 w-12 text-[#14213D]" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Chargement de votre collection...</p>
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-[#14213D] rounded-[2.5rem] p-12 md:p-24 text-center shadow-2xl shadow-[#14213D]/20 border-b-8 border-[#FCA311] max-w-4xl mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#FCA311] blur-[100px] opacity-20 rounded-full"></div>
                    
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-10 group hover:scale-105 transition-transform duration-500 shadow-xl backdrop-blur-md">
                            <Heart size={40} className="text-[#FCA311] group-hover:fill-[#FCA311] transition-colors" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tighter">Votre Sélection est Vide</h3>
                        <p className="text-slate-400 mb-12 max-w-lg mx-auto text-[11px] md:text-[12px] font-bold uppercase tracking-widest leading-relaxed">
                            Aucun véhicule premium n'a encore retenu votre attention. Explorez notre catalogue exclusif et ajoutez vos coups de cœur pour comparer et préparer votre prochaine acquisition.
                        </p>
                        <Link
                            to="/catalogue"
                            className="inline-flex items-center gap-4 bg-white text-[#14213D] px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:bg-[#FCA311] hover:scale-105 active:scale-95 group"
                        >
                            <Search size={16} className="group-hover:animate-pulse" /> Découvrir le Catalogue
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 px-4 mb-4">
                        <div className="h-px flex-1 bg-slate-900/10"></div>
                        <span className="text-[10px] font-black text-[#14213D] uppercase tracking-[0.3em] flex items-center gap-2">
                            <Zap size={14} className="text-[#FCA311] fill-current" />
                            Collection Exclusive
                        </span>
                        <div className="h-px flex-1 bg-slate-900/10"></div>
                    </div>

                    <div className="space-y-6">
                        {favoriteVehicles.map(vehicle => (
                            <div
                                key={vehicle.id}
                                className="bg-white rounded-[2rem] border border-slate-900/10 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#14213D]/10 hover:border-[#FCA311]/50 group relative"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#FCA311] scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500 z-10"></div>
                                <VehicleCard vehicle={vehicle} layout="list" />
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-12 pb-6 text-center">
                        <div className="inline-flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                                Ces véhicules resteront dans votre espace tant qu'ils sont disponibles.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
