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
    <div className="space-y-6 max-w-7xl mx-auto mt-2 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mes Commandes
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Suivi en temps réel de vos dossiers d'importation
          </p>
        </div>
        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold">
          {orders.length} dossiers actifs
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 md:p-24 text-center border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
            <Package size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aucune commande</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">Parcourez notre catalogue pour commencer.</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-sm hover:bg-slate-800"
          >
            Découvrir le catalogue <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const mainItem = order.items && order.items.length > 0 ? order.items[0] : null;

            return (
              <div
                key={order.id}
                className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col lg:flex-row"
                onClick={() => navigate(`/dashboard/orders/${order.id}`)}
              >
                {/* Vehicle Image - Clean */}
                <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden bg-slate-100 shrink-0 border-r border-slate-100">
                  <img
                    src={mainItem?.image || 'https://placehold.co/800x600?text=Premium+Vehicle'}
                    alt={mainItem ? `${mainItem.brand} ${mainItem.model}` : 'Véhicule'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                      #{order.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {mainItem ? `${mainItem.brand} ${mainItem.model}` : 'Dossier Acquisition'}
                        {order.items?.length > 1 && (
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md ml-3 inline-block">
                            +{order.items.length - 1} VÉHICULE(S)
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <p>
                          Initié le {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </p>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <p>Import Direct</p>
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Montant</p>
                      <p className="text-base font-bold text-slate-900">{order.total?.toLocaleString()}€</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Livraison</p>
                      <p className="text-sm font-bold text-emerald-600">Incluse</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-2">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Documents</p>
                      <p className="text-sm font-bold text-slate-900">COC EXPORT <span className="text-slate-400 ml-1">DE</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500 font-medium hidden sm:block">Vérifié par nos experts en logistique.</p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {order.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/payment/${order.id}`); }}
                          className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700"
                        >
                          <CreditCard size={16} />
                          <span>Finaliser</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/orders/${order.id}`); }}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        Détails
                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
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
