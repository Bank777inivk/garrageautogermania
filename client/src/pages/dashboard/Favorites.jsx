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
        <div className="space-y-6 max-w-7xl mx-auto mt-2">
            {/* Header Section - Flat Light Mode */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Vos Favoris
                        <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {favorites.length}
                        </span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {favorites.length > 1 ? 'Véhicules sélectionnés' : 'Véhicule sélectionné'} pour comparaison.
                    </p>
                </div>
                
                <Link
                    to="/catalogue"
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:bg-slate-800 shrink-0 shadow-sm"
                >
                    Continuer la recherche
                    <ChevronRight size={16} />
                </Link>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    <p className="text-slate-500 font-medium text-sm">Chargement de votre collection...</p>
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 md:p-24 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                        <Heart size={28} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Votre Sélection est Vide</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                        Aucun véhicule n'a encore retenu votre attention. Explorez notre catalogue pour ajouter vos coups de cœur.
                    </p>
                    <Link
                        to="/catalogue"
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-full font-semibold text-sm transition-colors"
                    >
                        <Search size={16} /> Découvrir le Catalogue
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <div className="space-y-4">
                            {favoriteVehicles.map((vehicle, index) => (
                                <div
                                    key={vehicle.id}
                                    className={`transition-all ${index !== favoriteVehicles.length - 1 ? 'border-b border-slate-100 pb-4' : ''}`}
                                >
                                    <VehicleCard vehicle={vehicle} layout="list" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <p className="inline-flex items-center gap-2 text-slate-500 text-xs font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Ces véhicules resteront dans votre espace tant qu'ils sont disponibles.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
