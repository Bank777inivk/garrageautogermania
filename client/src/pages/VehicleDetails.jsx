import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';
import useCartStore from '@shared/store/useCartStore';
import useFavoriteStore from '@shared/store/useFavoriteStore';
import useAuthStore from '@shared/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, Calendar, Fuel, Gauge, Award, CheckCircle,
  MapPin, Phone, Mail, Share2, Heart, ShieldCheck, ShoppingCart,
  Star, Zap, Copy, MessageCircle, X, LogIn, Sparkles, ChevronRight, Settings, Maximize2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const VehicleDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentVehicle, loading, error, fetchVehicleById } = useClientVehicleStore();
  const { addToCart } = useCartStore();
  const { toggleFavorite, favorites } = useFavoriteStore();
  const { user } = useAuthStore();

  const [activeImage, setActiveImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageRef = useRef(null);

  // Popups matching VehicleCard logic
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showFavoriteFeedback, setShowFavoriteFeedback] = useState(false);

  const isFavorite = favorites.includes(id);

  useEffect(() => {
    if (id) fetchVehicleById(id);
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Timer logic for popups
  useEffect(() => {
    if (showLoginPopup) { const t = setTimeout(() => setShowLoginPopup(false), 8000); return () => clearTimeout(t); }
  }, [showLoginPopup]);
  useEffect(() => {
    if (showStatusPopup) { const t = setTimeout(() => setShowStatusPopup(false), 6000); return () => clearTimeout(t); }
  }, [showStatusPopup]);
  useEffect(() => {
    if (showSharePopup) { const t = setTimeout(() => setShowSharePopup(false), 10000); return () => clearTimeout(t); }
  }, [showSharePopup]);
  useEffect(() => {
    if (showFavoriteFeedback) { const t = setTimeout(() => setShowFavoriteFeedback(false), 4000); return () => clearTimeout(t); }
  }, [showFavoriteFeedback]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
          <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600" size={20} />
        </div>
      </div>
    );
  }

  if (error || !currentVehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-montserrat">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Oups !</h2>
          <p className="text-slate-500 font-medium mb-8">Ce véhicule n'est plus disponible ou l'adresse est incorrecte.</p>
          <Link to="/catalogue" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
            <ChevronLeft size={16} /> Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const vehicle = currentVehicle;
  const images = vehicle.images?.length > 0 ? vehicle.images : ['https://placehold.co/800x600?text=No+Image'];
  const hasDiscount = vehicle.discount > 0;
  const discountedPrice = hasDiscount ? vehicle.price * (1 - vehicle.discount / 100) : vehicle.price;

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    if (!isFavorite) {
      if (!user) { setShowLoginPopup(true); } else { setShowFavoriteFeedback(true); }
    }
    toggleFavorite(vehicle.id, user?.uid);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${vehicle.brand} ${vehicle.model} - GARRAGE PRO GERMANIA`,
      text: `Découvrez cette ${vehicle.brand} ${vehicle.model} sur GARRAGE PRO GERMANIA`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { if (err.name !== 'AbortError') setShowSharePopup(true); }
    } else { setShowSharePopup(!showSharePopup); }
  };

  // Sub-components for popups
  const InlineLoginPopup = () => (
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500 w-[300px]">
      <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 relative overflow-hidden text-left">
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg">
            <Heart size={20} fill="currentColor" className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Coup de cœur ? ✨</p>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Connectez-vous pour sauvegarder ce véhicule.</p>
          </div>
        </div>
        <div className="mt-6 flex gap-2 relative z-10">
          <Link to="/connexion" className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all text-center shadow-lg active:scale-95 flex items-center justify-center gap-2">
            <LogIn size={14} /> Connexion
          </Link>
          <button onClick={() => setShowLoginPopup(false)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95">
            <X size={18} />
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-[-6px] w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />
      </div>
    </div>
  );

  const FavoriteFeedbackPopup = () => (
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none w-[200px]">
      <div className="bg-slate-900 border border-white/10 shadow-xl rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
          <Heart size={18} fill="currentColor" />
        </div>
        <div>
          <p className="text-[11px] font-black text-white uppercase tracking-tight">ENREGISTRÉ !</p>
          <p className="text-[10px] text-gray-400 font-medium">Dans vos favoris.</p>
        </div>
      </div>
    </div>
  );

  const StatusPopup = () => (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500 w-[300px]">
      <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-3xl p-5 overflow-hidden relative">
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-xl"><ShieldCheck size={22} /></div>
          <div className="text-left">
            <p className="text-xs font-black text-white uppercase tracking-[0.1em] mb-1 leading-tight">{vehicle.status === 'sold' ? 'VÉHICULE VENDU 🏁' : 'VÉHICULE RÉSERVÉ 🗝️'}</p>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{vehicle.status === 'sold' ? "Désolé, cette pépite a déjà trouvé son propriétaire." : "Un client a posé une option sur ce véhicule."}</p>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-4 h-4 bg-slate-900 border-r border-b border-white/10 rotate-45" />
      </div>
    </div>
  );

  const SharePopup = () => {
    const shareUrl = window.location.href;
    const copyToClipboard = async () => { try { await navigator.clipboard.writeText(shareUrl); toast.success("Lien copié !"); setShowSharePopup(false); } catch { } };
    return (
      <div className="absolute right-0 top-full mt-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500 w-[240px]">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 text-left">Partager</p>
          <div className="grid gap-2">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')} className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-all group w-full">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors"><MessageCircle size={16} /></div>
              <span className="text-xs font-bold text-slate-700">WhatsApp</span>
            </button>
            <button onClick={copyToClipboard} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group w-full">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors"><Copy size={16} /></div>
              <span className="text-xs font-bold text-slate-700">Copier le lien</span>
            </button>
          </div>
          <div className="absolute right-6 top-[-6px] w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45" />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-montserrat overflow-x-hidden">

      {/* ── LIGHTBOX MODAL ── */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* CLose button - better pos for mobile */}
          <button
            className="absolute top-4 right-4 z-50 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all sm:top-6 sm:right-6"
            onClick={() => setShowLightbox(false)}
          >
            <X size={24} />
          </button>

          {/* Main container: column on mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full h-full max-w-7xl mx-auto px-2 sm:px-12 py-16 sm:py-0">

            {/* Prev arrow - hidden on small phone heights if needed, or moved below */}
            <button
              onClick={(e) => { e.stopPropagation(); setActiveImage((a) => (a - 1 + images.length) % images.length); }}
              className="hidden sm:flex p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all flex-shrink-0"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Image */}
            <div className="relative flex-1 w-full max-h-[70vh] sm:max-h-[85vh] flex items-center justify-center">
              <img
                src={images[activeImage]}
                alt="Plein écran"
                className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); setActiveImage((a) => (a + 1) % images.length); }}
              className="hidden sm:flex p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all flex-shrink-0"
            >
              <ChevronRight size={32} />
            </button>

            {/* Mobile Navigation Controls (Only visible on small screens) */}
            <div className="flex sm:hidden items-center justify-center gap-6 mt-4 w-full">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((a) => (a - 1 + images.length) % images.length); }}
                className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-95"
              >
                <ChevronLeft size={28} />
              </button>
              <div className="text-white/80 text-sm font-bold uppercase tracking-widest px-4">
                {activeImage + 1} / {images.length}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((a) => (a + 1) % images.length); }}
                className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-95"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>

          {/* Desktop counter */}
          <div className="hidden sm:block absolute bottom-8 text-white/50 text-xs font-bold uppercase tracking-widest">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}
      {/* ── TOP HEADER / BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 sticky top-[72px] z-30">
        <div className="container mx-auto px-4 py-2">
          <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-all font-black text-[10px] uppercase tracking-widest">
            <ChevronLeft size={14} />
            Retour au catalogue
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">

          {/* ── COLONNE GAUCHE: GALERIE ── */}
          <div className="space-y-6">

            {/* MAIN IMAGE WITH MAGNIFIER (Reduced sized) */}
            <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 aspect-[4/3] cursor-crosshair">

              {/* PROMO badge overlay */}
              {vehicle.discount > 0 && (
                <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                  🔥 -{vehicle.discount}%
                </div>
              )}
              <div
                className="w-full h-full relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                ref={imageRef}
              >
                <img
                  src={images[activeImage]}
                  alt={`${vehicle.brand}`}
                  className={`w-full h-full object-cover transition-transform duration-500 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
                />
                {isZooming && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-transform duration-200"
                    style={{
                      backgroundImage: `url(${images[activeImage]})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '180%'
                    }}
                  />
                )}
              </div>

              {/* Floating Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <div className="relative">
                  <button onClick={handleToggleFavorite} className={`p-3 rounded-2xl shadow-xl transition-all border ${isFavorite ? 'bg-red-600 text-white border-red-500' : 'bg-white text-slate-900 border-slate-100 hover:bg-slate-50'}`}>
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  {showLoginPopup && <InlineLoginPopup />}
                  {showFavoriteFeedback && <FavoriteFeedbackPopup />}
                </div>
                <div className="relative">
                  <button onClick={handleShare} className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 transition-all">
                    <Share2 size={18} />
                  </button>
                  {showSharePopup && <SharePopup />}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                {activeImage + 1} / {images.length}
              </div>

              {/* Agrandir Button */}
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute bottom-4 right-4 p-2 bg-white/90 text-slate-900 rounded-xl shadow-xl border border-slate-100 hover:bg-white hover:text-red-600 transition-all active:scale-95"
                title="Agrandir la photo"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-16 sm:w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-red-600 ring-4 ring-red-600/5' : 'border-slate-50 hover:border-slate-200'}`}
                >
                  <img src={img} alt={`Img ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* DESCRIPTION (Minimalist Card) */}
            <div className="bg-white rounded-3xl border-2 border-slate-300 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                Description
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed font-medium">
                {vehicle.description ? (
                  <div dangerouslySetInnerHTML={{ __html: vehicle.description.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="italic text-slate-400">Descriptif technique en cours...</p>
                )}
              </div>

              {/* Info Cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 flex items-start gap-3">
                  <div className="p-2.5 bg-white text-red-600 rounded-xl shadow-sm shrink-0"><ShieldCheck size={20} /></div>
                  <div className="text-left">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Garantie 12 Mois</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Assistance européenne 24/7 incluse.</p>
                  </div>
                </div>
                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 flex items-start gap-3">
                  <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm shrink-0"><Award size={20} /></div>
                  <div className="text-left">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Expertise Certifiée</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">150 points de contrôle vérifiés.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── COLONNE DROITE: INFO & CTA ── */}
          <div className="space-y-8 sticky top-[140px]">

            {/* MAIN ACTION CARD (Narrower & cleaner) */}
            <div className="bg-white rounded-3xl border-2 border-slate-300 p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 mb-1 leading-none tracking-tighter uppercase">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vehicle.version}</p>
              </div>

              {/* BADGES DYNAMIQUES */}
              <div className="flex flex-wrap gap-2 mb-8">
                {vehicle.status === 'sold' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase border border-red-700">
                    🏁 VENDU
                  </div>
                )}
                {vehicle.status === 'reserved' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase border border-orange-600">
                    🗝️ RÉSERVÉ
                  </div>
                )}
                {vehicle.featured && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase border border-amber-200">
                    ⭐ TOP SÉLECTION
                  </div>
                )}
                {vehicle.discount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase border border-red-200">
                    🔥 PROMO -{vehicle.discount}%
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase border border-emerald-200">
                  ✅ SANS ACCIDENT
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-200">
                  🛡️ GARANTIE 12 MOIS
                </div>
                {vehicle.critair && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase border border-indigo-200">
                    🌿 CRIT'AIR {vehicle.critair}
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase border border-slate-200">
                  🇩🇪 IMPORT DIRECT DE
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-8 flex-wrap">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{Math.round(discountedPrice).toLocaleString()} €</span>
                {hasDiscount && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base text-red-400 line-through font-bold leading-none">{vehicle.price?.toLocaleString()} €</span>
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">-{vehicle.discount}% DE RÉDUCTION</span>
                  </div>
                )}
              </div>

              {/* STATS (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50 flex flex-col items-center">
                  <Calendar className="text-red-700" size={16} />
                  <span className="text-xs font-black text-slate-900 mt-1">{vehicle.year}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50 flex flex-col items-center">
                  <Gauge className="text-red-700" size={16} />
                  <span className="text-xs font-black text-slate-900 mt-1">{vehicle.mileage?.toLocaleString()} km</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50 flex flex-col items-center">
                  <Fuel className="text-red-700" size={16} />
                  <span className="text-xs font-black text-slate-900 mt-1">{vehicle.fuel}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50 flex flex-col items-center">
                  <Settings className="text-red-700" size={16} />
                  <span className="text-xs font-black text-slate-900 mt-1">{vehicle.transmission}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="space-y-3">
                <div className="relative">
                  <button
                    onClick={() => {
                      if (vehicle.status === 'available') {
                        addToCart(vehicle);
                        toast.success("Ajouté !");
                      } else { setShowStatusPopup(true); }
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${vehicle.status === 'available' ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-100 text-slate-400'}`}
                  >
                    Commander
                  </button>
                  {showStatusPopup && <StatusPopup />}
                </div>

                {/* Appeler — bloqué si vendu/réservé */}
                {vehicle.status === 'available' ? (
                  <a href="tel:+491781234567" className="w-full py-4 bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                    <Phone size={16} /> Appeler
                  </a>
                ) : (
                  <button onClick={() => setShowStatusPopup(true)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                    <Phone size={16} /> Appeler
                  </button>
                )}

                {/* WhatsApp — bloqué si vendu/réservé */}
                {vehicle.status === 'available' ? (
                  <a
                    href={`https://wa.me/491781234567?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le véhicule ${vehicle.brand} ${vehicle.model} (${vehicle.year}) — Réf. #${vehicle._id?.slice(-6) || ''}. Pouvez-vous me donner plus d'informations ?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1ebe5d] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.857L.057 23.57a.75.75 0 0 0 .928.928l5.713-1.475A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.513-5.223-1.404l-.374-.218-3.892 1.003 1.003-3.892-.218-.374A9.94 9.94 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    WhatsApp
                  </a>
                ) : (
                  <button onClick={() => setShowStatusPopup(true)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.857L.057 23.57a.75.75 0 0 0 .928.928l5.713-1.475A11.94 11.94 0 0 0 12 24c6-5.373 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.513-5.223-1.404l-.374-.218-3.892 1.003 1.003-3.892-.218-.374A9.94 9.94 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    WhatsApp
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <div className={`w-1.5 h-1.5 rounded-full ${vehicle.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  {vehicle.status === 'available' ? 'En stock' : 'Indisponible'}
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <MapPin size={11} className="text-red-500" />
                  🇩🇪 Allemagne — Visible sur rendez-vous
                </div>
              </div>
            </div>

            {/* SPECS CARD (Sleek minimalist) */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Spécifications</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-bold">Puissance</span>
                  <span className="font-black">{vehicle.power || '-'} ch</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-bold">Teinte</span>
                  <span className="font-black">{vehicle.color || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-bold">Places</span>
                  <span className="font-black">{vehicle.seats || '-'} sièges</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-bold">Contrôle</span>
                  <span className="text-emerald-400 font-black">OK</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
