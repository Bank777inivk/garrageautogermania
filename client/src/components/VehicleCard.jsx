import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Fuel, Gauge, Settings, Wind, Check, Eye, ShoppingCart,
    MapPin, Calendar, ArrowRight, ShieldCheck, Zap, Award, Heart, Share2, X, LogIn,
    Copy, MessageCircle, Mail, Star, Tag
} from 'lucide-react';
import useCartStore from '@shared/store/useCartStore';
import useFavoriteStore from '@shared/store/useFavoriteStore';
import useAuthStore from '@shared/store/useAuthStore';
import { toast } from 'react-hot-toast';

const VehicleCard = ({ vehicle, layout = 'grid' }) => {
    const { t } = useTranslation();
    const { addToCart } = useCartStore();
    const { toggleFavorite, favorites } = useFavoriteStore();
    const { user } = useAuthStore();
    const isFavorite = favorites.includes(vehicle.id);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [showPopup, setShowPopup] = React.useState(false);
    const [showStatusPopup, setShowStatusPopup] = React.useState(false);
    const [showSharePopup, setShowSharePopup] = React.useState(false);
    const [showFavoriteFeedback, setShowFavoriteFeedback] = React.useState(false);
    const hasDiscount = vehicle.discount > 0;
    const discountedPrice = hasDiscount ? vehicle.price * (1 - vehicle.discount / 100) : vehicle.price;

    // Automatic Image Carousel (limited to first 3 images, every 20 seconds) 
    // Staggered start: each card starts with a random delay (0-20s) so they don't change at once
    React.useEffect(() => {
        const imageCount = Math.min(3, vehicle.images?.length || 0);
        if (imageCount <= 1) return;

        let interval;
        const initialDelay = Math.random() * 20000;

        const timeout = setTimeout(() => {
            setCurrentImageIndex((prev) => (prev + 1) % imageCount);
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % imageCount);
            }, 20000);
        }, initialDelay);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [vehicle.images]);

    React.useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    React.useEffect(() => {
        if (showStatusPopup) {
            const timer = setTimeout(() => setShowStatusPopup(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [showStatusPopup]);

    React.useEffect(() => {
        if (showSharePopup) {
            const timer = setTimeout(() => setShowSharePopup(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [showSharePopup]);

    React.useEffect(() => {
        if (showFavoriteFeedback) {
            const timer = setTimeout(() => setShowFavoriteFeedback(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showFavoriteFeedback]);

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isFavorite) {
            if (!user) {
                setShowPopup(true);
            } else {
                setShowFavoriteFeedback(true);
            }
        }

        toggleFavorite(vehicle.id, user?.uid);
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const shareData = {
            title: `${vehicle.brand} ${vehicle.model} - GARRAGE PRO GERMANIA`,
            text: `Découvrez cette ${vehicle.brand} ${vehicle.model} sur GARRAGE PRO GERMANIA`,
            url: `${window.location.origin}/vehicule/${vehicle.id}`,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { if (err.name !== 'AbortError') { console.error("Native share failed:", err); setShowSharePopup(true); } }
        } else { setShowSharePopup(!showSharePopup); }
    };

    const InlineLoginPopup = () => (
        <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-500 pointer-events-auto w-[280px]">
            <div className="bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-5 relative overflow-hidden group/popup text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover/popup:scale-125 duration-700" />
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-xl shadow-slate-200">
                        <Heart size={18} fill="currentColor" className="animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">AJOUTER AUX FAVORIS ✨</p>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Connectez-vous pour retrouver vos favoris partout.</p>
                    </div>
                </div>
                <div className="mt-5 flex gap-2 relative z-10">
                    <Link to="/connexion" className="flex-1 bg-slate-900 text-white py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all text-center shadow-lg active:scale-95 flex items-center justify-center gap-2" onClick={(e) => { e.stopPropagation(); setShowPopup(false); }}>
                        <LogIn size={12} /> Se connecter
                    </Link>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPopup(false); }} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 flex items-center justify-center">
                        <X size={16} />
                    </button>
                </div>
                <div className="absolute right-4 top-[-6px] w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" />
            </div>
        </div>
    );

    const FavoriteFeedbackPopup = () => (
        <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-500 pointer-events-none w-[220px]">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-2xl p-3 relative overflow-hidden text-left">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shrink-0">
                        <Heart size={14} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">AJOUTÉ ! 🏁</p>
                        <p className="text-[9px] text-gray-400 font-medium">C'est dans vos favoris.</p>
                    </div>
                </div>
                <div className="absolute right-4 top-[-6px] w-3 h-3 bg-slate-900/95 border-l border-t border-white/10 rotate-45" />
            </div>
        </div>
    );

    const SharePopup = () => {
        const shareUrl = `${window.location.origin}/vehicule/${vehicle.id}`;
        const shareText = `Découvrez cette ${vehicle.brand} ${vehicle.model} sur GARRAGE PRO GERMANIA`;
        const copyToClipboard = async (e) => { e.preventDefault(); e.stopPropagation(); try { await navigator.clipboard.writeText(shareUrl); toast.success("Lien copié !"); setShowSharePopup(false); } catch (err) { console.error("Failed to copy:", err); } };
        const shareWhatsApp = (e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank'); setShowSharePopup(false); };
        const shareEmail = (e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:?subject=${encodeURIComponent(vehicle.brand + ' ' + vehicle.model)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`; setShowSharePopup(false); };
        return (
            <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-500 pointer-events-auto w-[240px]">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-3 relative overflow-hidden group/share text-left">
                    <div className="flex flex-col gap-1 relative z-10">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Partager la fiche</p>
                        <button onClick={shareWhatsApp} className="flex items-center gap-3 p-2.5 hover:bg-green-50 rounded-xl transition-all group/item w-full text-left">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover/item:bg-green-600 group-hover/item:text-white transition-colors"><MessageCircle size={14} /></div>
                            <span className="text-[11px] font-bold text-slate-700 group-hover/item:text-green-700">WhatsApp</span>
                        </button>
                        <button onClick={copyToClipboard} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-all group/item w-full text-left">
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover/item:bg-slate-900 group-hover/item:text-white transition-colors"><Copy size={14} /></div>
                            <span className="text-[11px] font-bold text-slate-700 group-hover/item:text-slate-900">Copier le lien</span>
                        </button>
                        <button onClick={shareEmail} className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-all group/item w-full text-left">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors"><Mail size={14} /></div>
                            <span className="text-[11px] font-bold text-slate-700 group-hover/item:text-blue-700">Email</span>
                        </button>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSharePopup(false); }} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-600 transition-colors"><X size={12} /></button>
                    <div className="absolute right-4 top-[-6px] w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" />
                </div>
            </div>
        );
    };

    const StatusPopup = () => (
        <div className="absolute right-0 -bottom-2 translate-y-full z-40 animate-in fade-in slide-in-from-top-3 duration-500 pointer-events-auto w-[280px]">
            <div className="bg-slate-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl p-4 relative overflow-hidden group/status text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/20 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg"><ShieldCheck size={18} /></div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.1em] mb-1 leading-tight">{vehicle.status === 'sold' ? 'VÉHICULE VENDU 🏁' : 'VÉHICULE RÉSERVÉ 🗝️'}</p>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{vehicle.status === 'sold' ? "Ce bijou a déjà trouvé son propriétaire." : "Un client a posé une option."}</p>
                    </div>
                </div>
                <div className="absolute top-[-4px] right-4 w-2 h-2 bg-slate-900 border-l border-t border-white/10 rotate-45" />
            </div>
        </div>
    );

    if (layout === 'list') {
        return (
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col sm:flex-row group/card min-h-[140px] sm:min-h-[280px] relative overflow-visible">
                {/* Fixed Image Container (No overflow-hidden on the outer column to allow popups) */}
                <div className="relative w-full sm:w-[240px] md:w-[320px] lg:w-[380px] aspect-video sm:aspect-square md:aspect-video flex-shrink-0 z-20">
                    {/* Inner Image (Clipped for zoom effects) */}
                    <div className="absolute inset-0 overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none bg-slate-100">
                        <Link to={`/vehicule/${vehicle.id}`} className="block w-full h-full relative">
                            {(vehicle.images?.slice(0, 3) || ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop']).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className={`absolute inset-0 w-full h-full object-cover transform group-hover/card:scale-110 transition-all duration-[2000ms] ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                                />
                            ))}
                        </Link>

                        {/* Ribbons internal to clipped area */}
                        <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-20 pointer-events-none">
                            {vehicle.featured && <div className="absolute top-3 -left-7 w-24 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest text-center -rotate-45 shadow-lg border-b border-white/20 origin-center flex items-center justify-center gap-0.5"><Star size={10} fill="white" /> TOP</div>}
                        </div>
                    </div>

                    {/* ACTIONS (OUTSIDE INNER CLIPPING, BUT INSIDE IMAGE COLUMN) */}
                    <div className="absolute top-2 right-2 z-40 flex flex-row-reverse sm:flex-col gap-2">
                        <div className="relative">
                            <button onClick={handleToggleFavorite} className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all border ${isFavorite ? 'bg-red-600 text-white border-red-500' : 'bg-white/80 text-slate-900 border-white/50 hover:bg-white'}`}><Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /></button>
                            {showPopup && <InlineLoginPopup />}
                            {showFavoriteFeedback && <FavoriteFeedbackPopup />}
                        </div>
                        <div className="relative">
                            <button onClick={handleShare} className="p-2 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-lg border border-white/50 hover:bg-white transition-all"><Share2 size={16} /></button>
                            {showSharePopup && <SharePopup />}
                        </div>
                    </div>

                    {/* Status Badges internal but outside clipping if needed */}
                    <div className="absolute top-2 left-10 z-10 flex flex-col gap-2">
                        {vehicle.status === 'sold' && <span className="bg-red-700 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-widest border border-red-600/50">Vendu</span>}
                        {vehicle.status === 'reserved' && <span className="bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-widest border border-amber-400/50">Réservé</span>}
                    </div>

                    <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-2">
                        {/* Circular Discount Badge */}
                        {hasDiscount && <div className="w-12 h-12 bg-red-600/95 backdrop-blur-md rounded-full flex flex-col items-center justify-center text-white border border-white/20 shadow-xl ring-4 ring-red-600/20"><span className="text-[14px] font-black leading-none">-{vehicle.discount}%</span></div>}
                        <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/10">
                            <MapPin size={10} className="text-red-700" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-tight flex items-baseline gap-1.5">ALLEMAGNE <span className="text-[7px] text-slate-400 font-black">IMPORT</span></span>
                        </div>
                    </div>

                    {/* Right Badges Stack (Guarantee, etc) */}
                    <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1.5 z-10">
                        {vehicle.status !== 'sold' && (
                            <>
                                <span className="w-32 bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-widest border border-indigo-500/50 flex items-center justify-center gap-1.5"><Award size={10} /> Garantie 12</span>
                                <span className="w-32 bg-white/95 backdrop-blur-md text-slate-900 text-[8px] sm:text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 uppercase tracking-widest flex items-center justify-center gap-1.5"><div className="w-2 rounded-full aspect-square bg-[#8EBF22] border border-white shadow-inner"></div> Crit'Air 1</span>
                            </>
                        )}
                        <span className="w-32 bg-white/95 backdrop-blur-md text-emerald-600 text-[8px] sm:text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-sm border border-emerald-100 uppercase tracking-widest flex items-center justify-center gap-1 group-hover/card:bg-emerald-600 group-hover/card:text-white transition-all duration-500"><ShieldCheck size={10} /> Sans Accident</span>
                        {vehicle.images?.length > 0 && (
                            <div className="w-32 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 backdrop-blur-md text-white rounded-lg border border-white/10 shadow-lg"><span className="text-[9px] font-black uppercase tracking-tighter">{vehicle.images.length} PHOTOS</span></div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-3 sm:p-6 flex-grow flex flex-col justify-between overflow-visible">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{vehicle.type}</span>
                            <div className="flex items-baseline gap-2">
                                {hasDiscount && <span className="text-xs sm:text-sm font-bold text-slate-400 line-through">{vehicle.price?.toLocaleString()} €</span>}
                                <span className={`text-base sm:text-2xl font-black tracking-tighter ${hasDiscount ? 'text-red-700' : 'text-slate-900'}`}>{Math.round(discountedPrice).toLocaleString()} €</span>
                            </div>
                        </div>
                        <h3 className="text-sm sm:text-xl font-black text-slate-950 uppercase tracking-tight leading-tight group-hover/card:text-red-700 transition-colors">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-[10px] sm:text-sm text-slate-600 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2 leading-relaxed">{vehicle.description || "Véhicule premium sélectionné par nos experts."}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 sm:py-4 sm:border-y border-slate-50">
                        <div className="flex items-center gap-1"><Calendar size={12} className="text-red-700" /><span className="text-[10px] sm:text-xs font-bold">{vehicle.year}</span></div>
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3"><Gauge size={12} className="text-red-700" /><span className="text-[10px] sm:text-xs font-bold">{vehicle.mileage?.toLocaleString()} km</span></div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50 sm:border-t-0 sm:pt-0">
                        <div className={`text-xs font-bold ${vehicle.status === 'available' ? 'text-emerald-600' : vehicle.status === 'sold' ? 'text-red-600' : 'text-amber-500'}`}>{vehicle.status === 'available' ? 'Disponible' : vehicle.status === 'sold' ? 'Vendu' : 'Réservé'}</div>
                        <div className="flex gap-2 relative">
                            <Link to={`/vehicule/${vehicle.id}`} className="px-4 py-2 bg-slate-50 text-slate-900 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"><Eye size={14} /> Détails</Link>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (vehicle.status === 'available') { addToCart(vehicle); } else { setShowStatusPopup(!showStatusPopup); } }} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center shadow-lg ${vehicle.status === 'available' ? 'bg-slate-900 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400'}`}><ShoppingCart size={14} /></button>
                            {showStatusPopup && <StatusPopup />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid Layout (Default)
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col group/card hover:-translate-y-1 h-full relative overflow-visible">
            {/* Image Area Column/Section */}
            <div className="relative h-64 shrink-0 z-20">
                {/* Inner Image (Clipped) */}
                <div className="absolute inset-0 overflow-hidden rounded-t-2xl bg-slate-100">
                    <Link to={`/vehicule/${vehicle.id}`} className="block w-full h-full relative">
                        {(vehicle.images?.slice(0, 3) || ['https://placehold.co/600x400']).map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className={`absolute inset-0 w-full h-full object-cover transform group-hover/card:scale-110 transition-all duration-[2000ms] ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}
                    </Link>
                    <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20 pointer-events-none">
                        {vehicle.featured && <div className="absolute top-3 -left-7 w-24 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest text-center -rotate-45 shadow-lg border-b border-white/20 origin-center flex items-center justify-center gap-0.5"><Star size={10} fill="white" /> TOP</div>}
                    </div>
                </div>

                {/* Right Badges Stack */}
                <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1.5 z-10">
                    {vehicle.status !== 'sold' && (
                        <span className="w-28 bg-indigo-600 text-white text-[8px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-widest border border-indigo-500/50 flex items-center justify-center gap-1"><Award size={10} /> Garantie</span>
                    )}
                    <span className="w-28 bg-white/95 backdrop-blur-md text-emerald-600 text-[8px] font-black px-2 py-1 rounded-lg shadow-sm border border-emerald-100 uppercase tracking-widest flex items-center justify-center gap-1 group-hover/card:bg-emerald-600 group-hover/card:text-white transition-all duration-500"><ShieldCheck size={10} /> Propre</span>
                    {vehicle.images?.length > 0 && (
                        <div className="w-28 flex items-center justify-center gap-1.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg border border-white/10 shadow-lg"><span className="text-[9px] font-black uppercase tracking-tighter">{vehicle.images.length} PHOTOS</span></div>
                    )}
                </div>

                {/* Discount Badge */}
                {hasDiscount && <div className="absolute bottom-20 left-4 z-20 animate-in zoom-in duration-500"><div className="w-12 h-12 bg-red-600/95 backdrop-blur-md rounded-full flex flex-col items-center justify-center text-white border border-white/20 shadow-xl ring-4 ring-red-600/20"><span className="text-[14px] font-black leading-none">-{vehicle.discount}%</span></div></div>}

                {/* ACTIONS (OUTSIDE CLIPPING, ON TOP-RIGHT OF IMAGE AREA) */}
                <div className="absolute top-4 right-4 z-40 flex flex-row-reverse sm:flex-col gap-2">
                    <div className="relative">
                        <button onClick={handleToggleFavorite} className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all border ${isFavorite ? 'bg-red-600 text-white border-red-500' : 'bg-white/80 text-slate-900 border-white/50 hover:bg-white'}`}><Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} /></button>
                        {showPopup && <InlineLoginPopup />}
                        {showFavoriteFeedback && <FavoriteFeedbackPopup />}
                    </div>
                    <div className="relative">
                        <button onClick={handleShare} className="p-2.5 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-lg border border-white/50 hover:bg-white transition-all"><Share2 size={18} /></button>
                        {showSharePopup && <SharePopup />}
                    </div>
                </div>

                {/* Price Label */}
                <div className="absolute bottom-4 left-4 inline-block bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl z-10">
                    <div className="flex flex-col">
                        {hasDiscount && <span className="text-[10px] font-black text-white/50 line-through leading-none mb-1">{vehicle.price?.toLocaleString()} €</span>}
                        <span className="text-white font-black text-lg tracking-tight leading-none">{Math.round(discountedPrice).toLocaleString()} €</span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between overflow-visible">
                <div>
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-tight mb-1">
                        {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">{vehicle.type} <span className="text-slate-200 mx-2">|</span> {vehicle.year} <span className="text-slate-200 mx-2">|</span> {vehicle.mileage?.toLocaleString()} km</p>
                </div>
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <p className={`text-xs font-bold tracking-tight ${vehicle.status === 'available' ? 'text-emerald-600' : vehicle.status === 'sold' ? 'text-red-600' : 'text-amber-500'}`}>{vehicle.status === 'available' ? 'Disponible' : vehicle.status === 'sold' ? 'Vendu' : 'Réservé'}</p>
                    <div className="flex gap-2 relative">
                        <Link to={`/vehicule/${vehicle.id}`} className="p-3 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Eye size={16} /></Link>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (vehicle.status === 'available') { addToCart(vehicle); } else { setShowStatusPopup(!showStatusPopup); } }} className={`p-3 rounded-xl transition-all shadow-lg active:scale-95 ${vehicle.status === 'available' ? 'bg-slate-900 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400'}`}><ShoppingCart size={16} /></button>
                        {showStatusPopup && <StatusPopup />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;
