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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100/80 pb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        Mes Favoris
                    </h1>
                    <p className="text-slate-400 mt-4 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Heart size={14} className="text-rose-500 fill-current" />
                        {favorites.length} véhicules enregistrés
                    </p>
                </div>
                <Link
                    to="/catalogue"
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 group active:scale-95 hover:bg-slate-800 shadow-sm hover:shadow-md border border-slate-800 hover:border-[#FCA311]"
                >
                    Continuer mes recherches
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Chargement de votre sélection...</p>
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
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Votre Sélection Premium</span>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    {favoriteVehicles.map(vehicle => (
                        <div
                            key={vehicle.id}
                            className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90"
                        >
                            <VehicleCard vehicle={vehicle} layout="list" />
                        </div>
                    ))}
                    <div className="pt-10 text-center">
                        <p className="text-[#052659]/50 text-[10px] font-bold uppercase tracking-widest italic">
                            Ces véhicules resteront dans votre espace tant qu'ils sont disponibles.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
