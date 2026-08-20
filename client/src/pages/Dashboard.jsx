import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useLangNavigate from '../hooks/useLangNavigate';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import {
  Package,
  Clock,
  CheckCircle,
  ChevronRight,
  Loader2,
  CreditCard,
  User,
  Zap,
  Shield,
  Heart,
  Truck
} from 'lucide-react';
import useFavoriteStore from '@shared/store/useFavoriteStore';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { lang, langPath, langNavigate } = useLangNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const { favorites } = useFavoriteStore();
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      langNavigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'clients', user.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data());
      }
    };
    fetchProfile();

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const total = ordersData.length;
      const active = ordersData.filter(o => 
        ['validation', 'confirmed', 'pending', 'logistics', 'transit', 'concierge'].includes(o.status)
      ).length;
      const completed = ordersData.filter(o => 
        ['delivered', 'completed'].includes(o.status)
      ).length;

      setStats({
        totalOrders: total,
        activeOrders: active,
        completedOrders: completed
      });

      const sorted = [...ordersData].sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      }).slice(0, 3);

      setRecentOrders(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Error monitoring dashboard data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8" style={{ color: '#052659' }} />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}><CheckCircle size={12} /> Livrée</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(252,163,17,0.1)', color: '#FCA311', borderColor: 'rgba(252,163,17,0.2)' }}><Clock size={12} /> Paiement</span>;
      case 'validation':
        return <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(2$,16,36,0.05)', color: '#021024', borderColor: 'rgba(2,16,36,0.1)' }}><Shield size={12} /> Validation</span>;
      case 'logistics':
        return <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)' }}><Package size={12} /> Logistique</span>;
      case 'transit':
        return <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', borderColor: 'rgba(99,102,241,0.2)' }}><Truck size={12} /> Transit</span>;
      default:
        return <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit" style={{ backgroundColor: 'rgba(2,16,36,0.05)', color: '#021024', borderColor: 'rgba(2,16,36,0.1)' }}>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto mt-2">
      {/* Hero Welcome Section - Flat Light Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bienvenue, {profile?.firstName || user?.displayName?.split(' ')[0] || 'Monsieur'}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Gérez vos acquisitions, suivez vos livraisons et accédez à vos documents.
          </p>
        </div>
        
        <Link
          to={`/${lang}/catalogue`}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:bg-slate-800 shrink-0 shadow-sm"
        >
          Parcourir le catalogue
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Bento Grid Stats - Clean Flat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
              <Package size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalOrders}</p>
            <p className="font-medium text-xs text-slate-500">Total Commandes</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.activeOrders}</p>
            <p className="font-medium text-xs text-slate-500">En cours</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.completedOrders}</p>
            <p className="font-medium text-xs text-slate-500">Dossiers Finalisés</p>
          </div>
        </div>

        {/* Favorites */}
        <Link to={langPath('/dashboard/favorites')} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <Heart size={18} fill={favorites.length > 0 ? "currentColor" : "none"} />
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{favorites.length}</p>
            <p className="font-medium text-xs text-slate-500">Mes Favoris</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - SaaS Table-like View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Dernières Activités
            </h2>
            <Link to={langPath('/dashboard/orders')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <p className="font-medium text-sm text-slate-500">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 md:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer group" 
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-0.5">
                          <p className="font-bold text-sm text-slate-900">#{order.orderNumber}</p>
                          <div className="shrink-0">{getStatusBadge(order.status)}</div>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">
                          {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'} •
                          <span className="font-semibold text-slate-700 ml-1">{order.total?.toLocaleString()}€</span>
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-end">
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services / Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Services
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-3xl transition-colors hover:border-slate-300 shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Mon Profil</p>
                <p className="font-medium text-[11px] text-slate-500">Informations & Sécurité</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>

            <Link
              to="/dashboard/billing"
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-3xl transition-colors hover:border-slate-300 shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Facturation</p>
                <p className="font-medium text-[11px] text-slate-500">Paiements & Reçus</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>

            <Link
              to="/dashboard/support"
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-3xl transition-colors hover:border-slate-300 shadow-sm group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <Shield size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Support Client</p>
                <p className="font-medium text-[11px] text-slate-500">Assistance prioritaire</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;