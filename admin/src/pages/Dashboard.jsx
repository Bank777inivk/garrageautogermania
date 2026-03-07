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
    { label: 'Véhicules', value: stats.vehicles, icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Commandes', value: stats.orders, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Chiffre d\'Affaires', value: `${stats.revenue.toLocaleString()}€`, icon: BadgeEuro, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Clients', value: stats.clients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="mr-3 text-indigo-600" size={28} /> Tableau de Bord
          </h1>
          <p className="text-sm text-gray-500">Aperçu en temps réel de votre activité commerciale.</p>
        </div>
        <div className="text-xs font-bold text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center">
          <Clock size={14} className="mr-2" /> Dernières données : {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all">
            <div className={`${card.bg} ${card.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Clock className="mr-2 text-indigo-500" size={20} /> Dernières Commandes
            </h2>
            <Link to="/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center">
              Voir tout <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Référence</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">#{order.orderNumber || order.id.substring(0, 6)}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                      <div className="text-[10px] text-gray-400 lowercase">{order.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{(order.total || 0).toLocaleString()}€</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic text-sm">
                      Aucune commande récente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2">Actions Rapides</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Ajouter un Véhicule', icon: PlusCircle, path: '/vehicles/new', color: 'bg-indigo-600' },
              { label: 'Gérer les Marques', icon: Tags, path: '/categories', color: 'bg-blue-500' },
              { label: 'Gérer les Clients', icon: Users, path: '/clients', color: 'bg-purple-500' },
              { label: 'Configuration Site', icon: SettingsIcon, path: '/settings', color: 'bg-slate-700' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-blue-100 transition-all text-left shadow-sm group"
              >
                <div className={`${action.color} text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{action.label}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5 group-hover:text-blue-600 transition-colors">Ouvrir le module</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <TrendingUp className="mb-4 opacity-50" size={32} />
              <h3 className="font-bold text-lg mb-2">Croissance Business</h3>
              <p className="text-indigo-100 text-xs leading-relaxed opacity-80 font-medium">
                Pensez à mettre à jour vos tarifs et promotions régulièrement pour maximiser vos ventes.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
