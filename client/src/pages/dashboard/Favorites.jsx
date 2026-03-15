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
                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-12 md:p-24 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-900/10 max-w-4xl mx-auto">
                    <div className="w-20 h-20 bg-white/50 border border-slate-900/10 shadow-sm rounded-full flex items-center justify-center mx-auto mb-8">
                        <Heart size={36} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Votre garage est vide</h3>
                    <p className="text-slate-400 mb-10 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                        Vous n'avez pas encore ajouté de véhicules à vos favoris. Parcourez notre catalogue premium pour trouver votre perle rare.
                    </p>
                    <Link
                        to="/catalogue"
                        className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 group hover:bg-slate-800 border border-slate-800 hover:border-[#FCA311]"
                    >
                        Explorer le catalogue
                        <Zap size={14} className="text-[#FCA311] group-hover:scale-110 transition-transform fill-current" />
                    </Link>
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
