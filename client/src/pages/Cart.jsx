import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ArrowLeft, Car, ShoppingBag } from 'lucide-react';
import useCartStore from '@shared/store/useCartStore';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { items, removeFromCart, getTotalPrice, getShippingCost, getFinalTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-[85vh] flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-lg animate-in fade-in zoom-in duration-700">
          <div className="bg-slate-900 p-12 md:p-16 rounded-[40px] shadow-[0_22px_70px_4px_rgba(0,0,0,0.15)] relative overflow-hidden text-center border border-slate-800">
            {/* Background Accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-600/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="bg-white/5 w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/10 group">
                <ShoppingBag size={40} className="text-amber-600 group-hover:scale-110 transition-transform duration-500 animate-pulse" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white font-montserrat uppercase tracking-tight mb-4">
                Votre Sélection est Vide
              </h2>
              <p className="text-slate-400 mb-12 text-[12px] font-medium leading-relaxed uppercase tracking-[0.1em] max-w-sm mx-auto">
                L'excellence vous attend. Explorez notre catalogue pour trouver le véhicule qui correspond à vos exigences.
              </p>
              
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-4 bg-amber-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98] group"
              >
                <Car size={16} className="group-hover:-translate-x-1 transition-transform" />
                Découvrir le Catalogue
              </Link>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-8 opacity-30 grayscale pointer-events-none">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Export Expert</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Garantie Premium</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Vérification 110 Points</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-10 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-4 mb-10 md:mb-16">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg border border-amber-600/20">
            <ShoppingBag size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-1 leading-none">Votre Sélection</p>
            <h1 className="text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight leading-none">Mon Panier ({items.length})</h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row p-3 sm:p-4 transition-all hover:shadow-md hover:border-gray-200">
                  {/* Image */}
                  <div className="w-full sm:w-56 h-40 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={item.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
                      alt={`${item.brand} ${item.model}`}
                      className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 font-montserrat uppercase tracking-tight leading-tight">{item.brand} {item.model}</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                          {item.year} • {item.mileage?.toLocaleString()} km • {item.fuel}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-amber-600 transition-colors p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-amber-50"
                        title="Retirer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-6 flex justify-between items-end">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Prix Import</span>
                          {item.discount > 0 && (
                            <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">
                              {item.price?.toLocaleString()} €
                            </span>
                          )}
                        </div>
                        <span className={`font-bold text-xl md:text-2xl font-montserrat leading-none ${item.discount > 0 ? 'text-red-700' : 'text-amber-600'}`}>
                          {item.discount > 0 
                            ? Math.round(item.price * (1 - item.discount / 100)).toLocaleString() 
                            : item.price?.toLocaleString()} €
                        </span>
                      </div>
                      <Link
                        to={`/vehicule/${item.id}`}
                        className="text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:text-amber-600 border-b border-gray-200 hover:border-amber-600 transition-all pb-0.5"
                      >
                        Détails véhicule
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              className="group text-gray-400 hover:text-amber-600 text-[10px] font-bold uppercase tracking-widest flex items-center mt-6 transition-colors"
            >
              <Trash2 size={13} className="mr-2 group-hover:scale-110 transition-transform" />
              Vider ma sélection
            </button>
          </div>

          {/* Checkout Summary - Sticky Card */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:sticky lg:top-32">
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl shadow-slate-200 border border-slate-800 text-white overflow-hidden relative">
              <h3 className="text-lg font-bold font-montserrat text-white uppercase mb-8 tracking-tight border-b border-white/10 pb-4">Résumé Commande</h3>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Véhicules ({items.length})</span>
                  <span className="text-white">{getTotalPrice().toLocaleString()} €</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Frais Logistique</span>
                  <span>{getShippingCost() === 0 ? <span className="text-green-400">Inclus</span> : `${getShippingCost()} €`}</span>
                </div>
                <div className="border-t border-white/5 pt-6 flex justify-between items-baseline">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Total Final</span>
                  <span className="font-bold text-amber-600 text-3xl font-montserrat">{getFinalTotal().toLocaleString()} €</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-amber-600 text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-3 active:scale-[0.98] group"
              >
                Passer à la commande
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 text-center bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[9px] text-gray-400 uppercase font-medium tracking-widest leading-relaxed">
                  Importation directe • Garantie Premium • Expertise 110 points de contrôle
                </p>
              </div>

              {/* Subtle background blur accent */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
