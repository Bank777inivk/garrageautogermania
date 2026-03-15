import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Package, ChevronRight, Loader2, CreditCard, Clock, CheckCircle, XCircle, Box, Shield, Truck, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter for active orders (NON-FINAL)
      const activeOrders = ordersData.filter(order =>
        ['validation', 'confirmed', 'pending', 'logistics', 'transit', 'concierge'].includes(order.status)
      );

      activeOrders.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setOrders(activeOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error monitoring orders:", error);
      toast.error("Erreur de synchronisation des commandes");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-[#052659]" />
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Transaction Confirmée',
          color: 'bg-green-100/50 text-green-700 border-green-100',
          icon: CheckCircle
        };
      case 'pending':
        return {
          label: 'Action Requise : Paiement',
          color: 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20',
          icon: Clock
        };
      case 'cancelled':
        return {
          label: 'Dossier Annulé',
          color: 'bg-rose-50 text-rose-700 border-rose-100',
          icon: XCircle
        };
      case 'validation':
        return {
          label: 'Validation Administrative',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Shield
        };
      case 'logistics':
        return {
          label: 'En Logistique',
          color: 'bg-blue-50 text-blue-700 border-blue-100',
          icon: Box
        };
      case 'transit':
        return {
          label: 'En Transit International',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          icon: Truck
        };
      case 'concierge':
        return {
          label: 'Arrivage Conciergerie',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: MapPin
        };
      case 'confirmed':
        return {
          label: 'Paiement Reçu / Confirmé',
          color: 'bg-green-50 text-green-700 border-green-100',
          icon: CheckCircle
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Package
        };
    }
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
            MES COMMANDES
          </h1>
          <p className="text-slate-500 mt-4 font-bold text-[10px] uppercase tracking-[0.2em]">
            Suivi en temps réel de vos dossiers d'importation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{orders.length} dossiers actifs</span>
          <div className="w-10 h-px bg-slate-100"></div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-900/10 p-20 text-center">
          <div className="bg-white/50 shadow-sm border border-white/80 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Package size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Aucune commande</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto font-medium text-sm text-[11px] uppercase tracking-widest">Parcourez notre catalogue pour commencer.</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 hover:bg-[#052659]"
          >
            Découvrir le catalogue <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {orders.map((order) => {
            const mainItem = order.items && order.items.length > 0 ? order.items[0] : null;

            return (
              <div
                key={order.id}
                className="group bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-900/10 overflow-hidden hover:shadow-[0_20px_50px_rgba(252,163,17,0.08)] hover:bg-white/90 transition-all duration-500 cursor-pointer"
                onClick={() => navigate(`/dashboard/orders/${order.id}`)}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Vehicle Image - Clean */}
                  <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden bg-slate-50 flex-shrink-0">
                    <img
                      src={mainItem?.image || 'https://placehold.co/800x600?text=Premium+Vehicle'}
                      alt={mainItem ? `${mainItem.brand} ${mainItem.model}` : 'Véhicule'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 shadow-sm">
                        #{order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 transition-colors group-hover:text-[#052659]">
                          {mainItem ? `${mainItem.brand} ${mainItem.model}` : 'Dossier Acquisition'}
                          {order.items?.length > 1 && (
                            <span className="text-[8px] sm:text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200 ml-2 inline-block">
                              +{order.items.length - 1} VÉHICULE(S)
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-4 text-slate-400">
                          <p className="text-[9px] font-black uppercase tracking-widest">
                            Initié le {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </p>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#052659]">Import Direct</p>
                        </div>
                      </div>
                      <div className="shrink-0">{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      <div className="bg-white/50 shadow-sm p-4 rounded-xl border border-slate-900/10">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Montant</p>
                        <p className="text-base font-black text-slate-900">{order.total?.toLocaleString()}€</p>
                      </div>
                      <div className="bg-white/50 shadow-sm p-4 rounded-xl border border-slate-900/10">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Livraison</p>
                        <p className="text-[10px] font-black text-green-600 uppercase">Incluse</p>
                      </div>
                      <div className="bg-white/50 shadow-sm p-4 rounded-xl border border-slate-900/10 md:col-span-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Documents</p>
                        <p className="text-[10px] font-black text-slate-900 uppercase">COC EXPORT <span className="text-slate-400 ml-1">DE</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-6 border-t border-slate-50">
                      <p className="text-[10px] text-slate-400 font-medium">"Vérifié par nos experts en logistique."</p>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/payment/${order.id}`); }}
                            className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md hover:bg-slate-800 border-b-2 border-slate-700 hover:border-[#FCA311]"
                          >
                            <CreditCard size={12} />
                            <span>Finaliser</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/orders/${order.id}`); }}
                          className="flex-1 sm:flex-none px-6 py-3 bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          Détails
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
