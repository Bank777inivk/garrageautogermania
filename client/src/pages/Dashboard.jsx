import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import {
  LayoutDashboard,
  Package,
  Clock,
  CheckCircle,
  ChevronRight,
  Loader2,
  TrendingUp,
  CreditCard,
  User,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Fetch User Profile (Static fetch is fine as it rarely changes, but let's keep it tidy)
    const fetchProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'clients', user.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data());
      }
    };
    fetchProfile();

    // Real-time Orders & Stats
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
      const pending = ordersData.filter(o => o.status === 'pending').length;
      const completed = ordersData.filter(o => o.status === 'completed').length;

      setStats({
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed
      });

      // Sorted recent orders
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
        <Loader2 className="animate-spin h-8 w-8 text-red-700" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100/50 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1.5 w-fit"><CheckCircle size={12} /> Confirmée</span>;
      case 'pending':
        return <span className="bg-amber-100/50 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5 w-fit"><Clock size={12} /> En attente</span>;
      default:
        return <span className="bg-slate-100/50 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1.5 w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">
      {/* Minimalist Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Excellent choix, {profile?.firstName || user?.displayName?.split(' ')[0] || 'Monsieur'}
          </h1>
          <p className="text-slate-900 mt-4 font-black text-[11px] uppercase tracking-[0.3em]">
            Espace Client
          </p>
        </div>
        <Link
          to="/catalogue"
          className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 group active:scale-95"
        >
          Parcourir le catalogue
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grounded Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 transition-all hover:border-amber-400 group relative overflow-hidden shadow-2xl shadow-slate-100/50">
          {/* German Flag Theme Accents */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 opacity-100" />

          <div className="flex items-center gap-4 mb-6 relative">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 group-hover:bg-red-700 group-hover:text-white transition-all">
              <Package size={20} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[8px] uppercase tracking-[0.2em]">Total</p>
              <p className="text-slate-900 font-black text-[10px] uppercase mb-0.5">Acquisitions</p>
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter relative">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 transition-all hover:border-slate-200 group relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[8px] uppercase tracking-[0.2em]">Transactions</p>
              <p className="text-slate-900 font-black text-[10px] uppercase mb-0.5">En cours</p>
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">{stats.pendingOrders}</p>
        </div>

        <div className="bg-slate-950 p-8 rounded-3xl border border-white/5 transition-all hover:border-red-700/50 group relative shadow-2xl shadow-black/40 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-700/10 blur-[60px] pointer-events-none" />

          <div className="flex items-center gap-4 mb-6 relative">
            <div className="p-3 bg-white/5 text-green-400 rounded-xl border border-white/10 group-hover:bg-green-600 group-hover:text-white transition-all">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-white/30 font-black text-[8px] uppercase tracking-[0.2em]">Dossiers</p>
              <p className="text-white font-black text-[10px] uppercase mb-0.5">Finalisés</p>
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter relative">{stats.completedOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders - Minimalist Table-like View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                <Zap size={20} className="text-red-700" />
                Dernières Activités
              </h2>
            </div>
            <Link to="/dashboard/orders" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-20 text-center space-y-2">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer" onClick={() => navigate(`/dashboard/orders/${order.id}`)}>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 overflow-hidden">
                          <p className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">Commande #{order.orderNumber}</p>
                          <div className="shrink-0">{getStatusBadge(order.status)}</div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">
                          {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} •
                          <span className="text-slate-900 font-black ml-1.5">{order.total?.toLocaleString()}€</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                      <div className="w-8 h-8 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-slate-900 group-hover:text-slate-900 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts - Grounded */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight px-2">
            Services
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-slate-50 text-slate-900 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-900 uppercase text-[9px] tracking-widest">Informations</p>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Mon Profil Client</p>
              </div>
            </Link>

            <Link
              to="/dashboard/billing"
              className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-slate-50 text-slate-900 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100">
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-900 uppercase text-[9px] tracking-widest">Paiements</p>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Factures & Invoices</p>
              </div>
            </Link>

            <Link
              to="/contact"
              className="flex items-center gap-5 p-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all group"
            >
              <div className="p-3 bg-white/10 text-white rounded-xl">
                <Shield size={18} />
              </div>
              <div className="flex-1">
                <p className="font-black uppercase text-[9px] tracking-widest">Conciergerie</p>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Besoin d'aide ?</p>
              </div>
              <ChevronRight size={14} className="opacity-40 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;