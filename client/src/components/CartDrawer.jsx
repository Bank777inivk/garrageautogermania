import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '@shared/store/useCartStore';
import { useTranslation } from 'react-i18next';

const CartDrawer = () => {
  const { items, removeFromCart, getTotalPrice, isOpen, closeCart, clearCart } = useCartStore();
  const { t } = useTranslation();

  // Lock scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={closeCart}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-[65%] sm:w-full sm:max-w-sm bg-white h-full shadow-[-10px_0_50px_-12px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-50">
          <div>
            <p className="text-[8px] font-bold text-red-700 uppercase tracking-[0.2em] mb-0.5">Selection</p>
            <h2 className="text-base font-bold text-slate-900 font-montserrat uppercase tracking-tight">{t('cart.title', 'Panier')}</h2>
          </div>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-red-700 transition-all p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <ShoppingBag size={32} className="text-gray-100" />
              <p className="text-gray-400 text-[9px] font-medium uppercase tracking-widest">
                {t('cart.empty', 'Vide')}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 group">
                <div className="w-full h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group-hover:border-red-700/30 transition-colors">
                  <img
                    src={item.images?.[0] || 'https://placehold.co/200x150?text=Car'}
                    alt={item.brand}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300"
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-lg text-gray-400 hover:text-red-700 shadow-sm transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[10px] font-bold text-slate-900 font-montserrat uppercase tracking-tight truncate group-hover:text-red-700 transition-colors">
                    {item.brand} {item.model}
                  </h3>
                  <p className="text-slate-900 font-bold text-xs font-montserrat mt-1">{Number(item.price).toLocaleString()}€</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-gray-100 space-y-4">
          {items.length > 0 ? (
            <>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Est.</span>
                  <span className="text-red-700 font-bold text-xl font-montserrat leading-none tracking-tight">{getTotalPrice().toLocaleString()}€</span>
                </div>
                <div className="text-[8px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-tight">
                  TTC
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 text-center bg-slate-900 text-white font-bold text-[9px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 shadow-lg transition-all active:scale-[0.98]"
                >
                  Commander
                </Link>
                <Link
                  to="/panier"
                  onClick={closeCart}
                  className="w-full py-2.5 text-center bg-white border border-gray-200 text-slate-900 font-bold text-[8px] uppercase tracking-[0.2em] rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Détails
                </Link>
              </div>

              <button
                onClick={clearCart}
                className="w-full flex items-center justify-center text-gray-400 hover:text-red-700 text-[8px] font-bold uppercase tracking-[0.2em] py-1 transition-colors cursor-pointer"
              >
                <Trash2 size={12} className="mr-1.5" />
                Vider le panier
              </button>
            </>
          ) : (
            <Link
              to="/catalogue"
              onClick={closeCart}
              className="block w-full py-4 text-center bg-slate-900 text-white font-bold text-[9px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-[0.98]"
            >
              Catalogue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
