import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';

const VerticalAd = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentCarIndex, setCurrentCarIndex] = useState(0);
    const { featuredVehicles, fetchFeaturedVehicles, loading } = useClientVehicleStore();

    useEffect(() => {
        // Fetch featured vehicles if not already loaded
        if (featuredVehicles.length === 0) {
            fetchFeaturedVehicles();
        }
    }, [featuredVehicles.length, fetchFeaturedVehicles]);

    useEffect(() => {
        if (featuredVehicles.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentCarIndex((prev) => (prev + 1) % featuredVehicles.length);
        }, 5000); // 5 seconds for better reading time
        return () => clearInterval(timer);
    }, [featuredVehicles.length]);

    // Fallback: use a placeholder car image if none loaded yet
    const fallbackImage = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000&auto=format&fit=crop';

    return (
        <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 group cursor-pointer flex flex-col h-[550px] relative"
            onClick={() => navigate('/catalogue')}
        >
            {/* Top Banner: Emerald Green */}
            <div className="bg-[#009966] p-8 pb-12 relative overflow-hidden flex-shrink-0 z-20">
                <div className="relative z-10">
                    <h3 className="text-white text-2xl font-black font-montserrat leading-tight uppercase tracking-tight mb-4">
                        <span className="bg-black/20 px-2 py-0.5 inline-block mb-1">{t('ad.benefit', 'BÉNÉFICIEZ DE')}</span><br />
                        <span className="text-4xl">{t('ad.discount', "JUSQU'À 12%")}</span><br />
                        <span className="bg-black/20 px-2 py-0.5 inline-block mt-1">{t('ad.reason', 'DE RÉDUCTION')}</span>
                    </h3>
                    <p className="text-white/90 text-xs font-bold uppercase tracking-[0.2em]">
                        {t('ad.condition', 'GRÂCE AU PRÉ-PAIEMENT')}
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Middle Section: Dynamic Car Slider */}
            <div className="flex-grow bg-slate-50 flex items-center justify-center relative overflow-hidden">
                {featuredVehicles.length > 0 ? (
                    featuredVehicles.map((vehicle, index) => (
                        <div
                            key={vehicle.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentCarIndex
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-full'
                                }`}
                        >
                            <img
                                src={vehicle.images?.[0] || fallbackImage}
                                alt={vehicle.model}
                                className="w-full h-full object-cover"
                            />
                            {/* Pro Ad Overlay: Professional dark gradient for white details and charcoal titles */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-red-700 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.2em]">
                                        Offre Spéciale
                                    </span>
                                </div>

                                <h4 className="text-white text-2xl font-black uppercase tracking-tight leading-none mb-1">
                                    {vehicle.brand} {vehicle.model}
                                </h4>

                                <p className="text-white font-bold text-[10px] uppercase tracking-[0.15em] mb-3 drop-shadow-md">
                                    {vehicle.year} • {vehicle.mileage?.toLocaleString()} km
                                </p>

                                <div className="flex items-center gap-3">
                                    <span className="text-white text-3xl font-black tracking-tighter drop-shadow-2xl">
                                        {vehicle.price?.toLocaleString()} €
                                    </span>
                                    {vehicle.price && (
                                        <span className="text-white/60 text-sm line-through font-bold decoration-red-600/50">
                                            {(vehicle.price * 1.12).toLocaleString()} €
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 w-full h-full">
                        <div className="w-12 h-12 border-4 border-[#009966]/20 border-t-[#009966] rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                            Recherche des meilleures offres...
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Section: Call to Action */}
            <div className="p-8 pt-6 bg-white z-20">
                <div className="bg-[#009966] text-white py-4 px-6 rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-between group-hover:bg-slate-900 transition-colors shadow-lg active:scale-95">
                    {t('ad.cta', 'RÉSERVEZ DÈS MAINTENANT')}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>

                <p className="text-[9px] text-slate-400 font-bold mt-4 italic leading-tight">
                    * {t('ad.disclaimer', "Les conditions générales de vente standard s'appliquent.")}
                </p>
            </div>
        </div>
    );
};

export default VerticalAd;
