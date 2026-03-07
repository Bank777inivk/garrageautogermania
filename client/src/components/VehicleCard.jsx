import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Fuel, Gauge, Settings, Wind, Check, Eye, ShoppingCart,
    MapPin, Calendar, ArrowRight, ShieldCheck
} from 'lucide-react';
import useCartStore from '@shared/store/useCartStore';

const VehicleCard = ({ vehicle, layout = 'grid' }) => {
    const { t } = useTranslation();
    const { addToCart } = useCartStore();

    if (layout === 'list') {
        return (
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col sm:flex-row group/card min-h-[140px] sm:min-h-[280px]">
                {/* Left: Image Container */}
                <div className="relative w-full sm:w-[240px] md:w-[320px] lg:w-[380px] h-48 sm:h-auto overflow-hidden bg-slate-100 flex-shrink-0">
                    <Link to={`/vehicule/${vehicle.id}`}>
                        <img
                            src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop';
                            }}
                        />
                    </Link>

                    {/* Status Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {vehicle.status === 'sold' && (
                            <span className="bg-red-700 text-white text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-widest">
                                Vendu
                            </span>
                        )}
                        <span className="bg-white/90 backdrop-blur-md text-emerald-600 text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full shadow-sm border border-emerald-100 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={10} />
                            Non accidenté
                        </span>
                    </div>

                    {/* Location Badge (Sponsorisée/Lieu) */}
                    <div className="absolute bottom-2 left-2">
                        <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100">
                            <MapPin size={10} className="text-red-700" />
                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-800 uppercase tracking-tight">Allemagne (Import)</span>
                        </div>
                    </div>
                </div>

                {/* Right: Content Area */}
                <div className="p-3 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col justify-between h-full gap-2">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {vehicle.type}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-base sm:text-2xl font-black text-slate-900 tracking-tighter">
                                        {vehicle.price?.toLocaleString()} €
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">HT</span>
                                </div>
                            </div>

                            <h3 className="text-sm sm:text-xl font-black text-slate-900 uppercase tracking-tight leading-tight group-hover/card:text-red-700 transition-colors">
                                {vehicle.brand} {vehicle.model}
                            </h3>

                            <p className="text-[10px] sm:text-sm text-slate-600 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                                {vehicle.description || "Véhicule premium sélectionné par nos experts."}
                                <Link to={`/vehicule/${vehicle.id}`} className="text-red-700 font-bold ml-1 hover:underline">
                                    ... voir plus
                                </Link>
                            </p>
                        </div>

                        {/* Specs List Style - Compact on Mobile */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 sm:py-4 sm:border-y border-slate-50">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-red-700" />
                                <span className="text-[10px] sm:text-xs font-bold">{vehicle.year}</span>
                            </div>
                            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                                <Gauge size={12} className="text-red-700" />
                                <span className="text-[10px] sm:text-xs font-bold">{vehicle.mileage?.toLocaleString()} km</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-3">
                                <Settings size={12} className="text-red-700" />
                                <span className="text-xs font-bold">{vehicle.transmission}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-3">
                                <Fuel size={12} className="text-red-700" />
                                <span className="text-xs font-bold">{vehicle.fuel}</span>
                            </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-4 pt-2 border-t border-slate-50 sm:border-t-0 sm:pt-0">
                            <div className="hidden sm:block">
                                <p className="text-[11px] font-bold text-slate-500">
                                    Vendeur: <span className="text-slate-900">GARRAGE PRO GERMANIA</span>
                                </p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Link
                                    to={`/vehicule/${vehicle.id}`}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 text-slate-900 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye size={14} />
                                    Détails
                                </Link>
                                <button
                                    onClick={() => addToCart(vehicle)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <ShoppingCart size={14} />
                                    AJOUTER
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback / Grid Layout (Existing one, refined)
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col group/card hover:-translate-y-1">
            <div className="relative h-60 overflow-hidden bg-slate-100">
                <Link to={`/vehicule/${vehicle.id}`}>
                    <img
                        src={vehicle.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                    />
                </Link>
                <div className="absolute bottom-4 left-4">
                    <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                        <span className="text-white font-black text-lg tracking-tight">
                            {vehicle.price?.toLocaleString('fr-FR')} €
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight mb-1">
                        {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vehicle.type}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs font-bold text-red-600">{vehicle.year}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover/card:text-red-700 transition-colors">
                            <Gauge size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">KM</p>
                            <p className="text-xs font-bold text-slate-700 tracking-tight">{vehicle.mileage?.toLocaleString()} km</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover/card:text-red-700 transition-colors">
                            <Settings size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Boîte</p>
                            <p className="text-xs font-bold text-slate-700 tracking-tight">{vehicle.transmission}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover/card:text-red-700 transition-colors">
                            <Fuel size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Carburant</p>
                            <p className="text-xs font-bold text-slate-700 tracking-tight">{vehicle.fuel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover/card:text-red-700 transition-colors">
                            <Check size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stock</p>
                            <p className="text-xs font-bold text-emerald-600 tracking-tight">Disponible</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex gap-3">
                    <Link
                        to={`/vehicule/${vehicle.id}`}
                        className="flex-1 bg-slate-50 text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <Eye size={16} />
                        Détails
                    </Link>
                    <button
                        onClick={() => addToCart(vehicle)}
                        className="px-6 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;
