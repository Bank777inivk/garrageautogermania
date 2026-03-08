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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        Mes Favoris
                    </h1>
                    <p className="text-slate-500 mt-4 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <Heart size={14} className="text-red-600 fill-current" />
                        {favorites.length} véhicules enregistrés
                    </p>
                </div>
                <Link
                    to="/catalogue"
                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 group active:scale-95"
                >
                    Continuer mes recherches
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin h-10 w-10 text-red-700" />
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Chargement de votre sélection...</p>
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 md:p-24 text-center shadow-2xl shadow-slate-100/50 border border-slate-50 max-w-4xl mx-auto">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Heart size={36} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Votre garage est vide</h3>
                    <p className="text-slate-400 mb-10 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                        Vous n'avez pas encore ajouté de véhicules à vos favoris. Parcourez notre catalogue premium pour trouver votre perle rare.
                    </p>
                    <Link
                        to="/catalogue"
                        className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        Explorer le catalogue
                        <Zap size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Votre Sélection Premium</span>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    {favoriteVehicles.map(vehicle => (
                        <div
                            key={vehicle.id}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden hover:border-red-100 transition-all hover:shadow-2xl hover:shadow-red-50/50"
                        >
                            <VehicleCard vehicle={vehicle} layout="list" />
                        </div>
                    ))}

                    <div className="pt-10 text-center">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                            Ces véhicules resteront dans votre espace tant qu'ils sont disponibles.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
