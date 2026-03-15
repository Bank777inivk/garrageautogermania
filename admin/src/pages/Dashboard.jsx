import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore';
import {
  BarChart3,
  Car,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  Settings as SettingsIcon,
  Tags,
  BadgeEuro
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vehicles: 0,
    orders: 0,
    revenue: 0,
    clients: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Stats
    const fetchStats = async () => {
      try {
        const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const clientsSnap = await getDocs(collection(db, 'clients'));

        const totalRevenue = ordersSnap.docs
          .filter(doc => doc.data().status !== 'cancelled')
          .reduce((sum, doc) => sum + (doc.data().total || 0), 0);

        setStats({
          vehicles: vehiclesSnap.size,
          orders: ordersSnap.size,
          revenue: totalRevenue,
          clients: clientsSnap.size
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // 2. Stream Recent Orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentOrders(orders);
      setLoading(false);
    });

    fetchStats();
    return () => unsubscribeOrders();
  }, []);

  const statCards = [
    { label: 'Véhicules', value: stats.vehicles, icon: Car, color: 'text-[#FCA311]', bg: 'bg-[#14213D]' },
    { label: 'Commandes', value: stats.orders, icon: ShoppingCart, color: 'text-[#FCA311]', bg: 'bg-[#14213D]' },
    { label: 'C.A Total', value: `${stats.revenue.toLocaleString()}€`, icon: BadgeEuro, color: 'text-[#FCA311]', bg: 'bg-[#14213D]' },
    { label: 'Clients', value: stats.clients, icon: Users, color: 'text-[#FCA311]', bg: 'bg-[#14213D]' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <div className="space-y-10 pb-20 px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E5E5] pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#14213D] tracking-tight uppercase flex items-center gap-3">
            <BarChart3 className="text-[#FCA311]" size={32} />
            Studio Dashboard
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-[#14213D]/40 uppercase tracking-[0.2em] mt-2">Dernière mise à jour : {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E5E5] px-4 py-2 rounded-xl text-[9px] font-black text-[#14213D] uppercase tracking-widest shadow-sm">
          <Clock size={14} className="text-[#FCA311]" />
          Live Network Active
        </div>
      </div>

      {/* Stats Grid - Sharp Minimalist Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-4 group">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-[#14213D]/40 uppercase tracking-[0.2em] mb-1">{card.label}</p>
              <h3 className="text-2xl md:text-3xl font-black text-[#14213D] tracking-tighter">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Orders Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-sm font-black text-[#14213D] uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FCA311] rounded-full" />
              Commandes Récentes
            </h2>
            <Link to="/orders" className="text-[10px] font-black text-[#14213D]/50 hover:text-[#FCA311] uppercase tracking-widest flex items-center gap-1 transition-colors">
              Explorer tout <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#14213D]">
                    <th className="px-8 py-5 text-[9px] font-black text-white uppercase tracking-widest">Référence</th>
                    <th className="px-8 py-5 text-[9px] font-black text-white uppercase tracking-widest">Partenaire</th>
                    <th className="px-8 py-5 text-[9px] font-black text-white uppercase tracking-widest">Investissement</th>
                    <th className="px-8 py-5 text-[9px] font-black text-white uppercase tracking-widest">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#14213D]/5 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-black text-[#14213D] tracking-wider">#{order.orderNumber || order.id.substring(0, 6)}</span>
                        <p className="text-[9px] text-[#14213D]/40 font-bold uppercase mt-1">
                          {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'En attente'}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[11px] font-black text-[#14213D] uppercase tracking-tight">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </div>
                        <div className="text-[9px] text-[#14213D]/40 font-bold lowercase mt-0.5">{order.customer?.email}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-black text-[#14213D]">{(order.total || 0).toLocaleString()}€</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-black text-[#14213D] tracking-wider block">#{order.orderNumber || order.id.substring(0, 6)}</span>
                      <span className="text-[9px] font-bold text-[#14213D]/40 uppercase tracking-widest">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-[#14213D]/5 p-5 rounded-[1.5rem]">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-[#14213D] uppercase truncate">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                      <div className="text-[9px] text-[#14213D]/40 font-bold lowercase truncate max-w-[150px]">{order.customer?.email}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-[#14213D] tracking-tighter">{(order.total || 0).toLocaleString()}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentOrders.length === 0 && (
              <div className="px-8 py-20 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Aucun flux de données récent.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-sm font-black text-[#14213D] uppercase tracking-widest px-2">Actions Système</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Nouveau Véhicule', icon: PlusCircle, path: '/vehicles/new', color: 'bg-[#14213D]' },
                { label: 'Gestion Catalogue', icon: Tags, path: '/vehicles', color: 'bg-white' },
                { label: 'Base Clients', icon: Users, path: '/clients', color: 'bg-white' },
                { label: 'Configuration Studio', icon: SettingsIcon, path: '/settings', color: 'bg-white' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className={`flex items-center gap-5 p-5 ${action.color === 'bg-[#14213D]' ? 'bg-[#14213D] text-white' : 'bg-white text-[#14213D]'} border border-[#E5E5E5] rounded-2xl hover:shadow-xl hover:translate-x-1 transition-all text-left shadow-sm group`}
                >
                  <div className={`p-3 rounded-xl ${action.color === 'bg-[#14213D]' ? 'bg-white/10' : 'bg-[#14213D]/5'} group-hover:scale-110 transition-transform ${action.color === 'bg-[#14213D]' ? 'text-[#FCA311]' : 'text-[#FCA311]'}`}>
                    <action.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight">{action.label}</h4>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-1 opacity-50`}>Éxécuter l'action</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Promotion Card - Minimalist */}
          <div className="p-8 bg-[#14213D] rounded-[2.5rem] text-white shadow-2xl shadow-[#14213D]/20 relative overflow-hidden group border-b-4 border-[#FCA311]">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-[#FCA311] rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={20} className="text-[#14213D]" />
              </div>
              <h3 className="font-black text-xl uppercase tracking-tight mb-3">Vision Business</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Optimisez vos flux et suivez vos performances en temps réel pour une croissance durable.
              </p>
            </div>
            {/* Minimal Background Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-[#FCA311]/5 transition-all duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
