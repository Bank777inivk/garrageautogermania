import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      navigate('/connexion');
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">
      {/* Minimalist Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100/80 pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900">
            Excellent choix, {profile?.firstName || user?.displayName?.split(' ')[0] || 'Monsieur'}
          </h1>
          <p className="mt-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">
            Espace Client
          </p>
        </div>
        <Link
          to="/catalogue"
          className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 group active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(252,163,17,0.15)] hover:bg-slate-800 border-b-2 border-slate-700 hover:border-[#FCA311] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FCA311]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative z-10">Parcourir le catalogue</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform relative z-10" />
        </Link>
      </div>

      {/* Grounded Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2 group relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-50 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.05)] transition-all">
              <Package size={20} />
            </div>
            <div>
              <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Total</p>
              <p className="font-black text-xs uppercase tracking-tight text-slate-900">Commandes</p>
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 drop-shadow-sm">{stats.totalOrders}</p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(252,163,17,0.08)] hover:-translate-y-2 group relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FCA311] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#FCA311]/5 border border-[#FCA311]/20 flex items-center justify-center text-[#FCA311] group-hover:shadow-[0_0_20px_rgba(252,163,17,0.3)] transition-all">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Transactions</p>
              <p className="font-black text-xs uppercase tracking-tight text-slate-900">En cours</p>
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 drop-shadow-sm">{stats.activeOrders}</p>
        </div>

        <div className="p-8 rounded-[2.5rem] text-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] hover:-translate-y-2 group relative overflow-hidden bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024] border border-[#FCA311]/30">
          {/* Vivid Atmosphere */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FCA311]/15 rounded-full blur-[80px] group-hover:bg-[#FCA311]/25 transition-all duration-1000" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#5483B3]/10 rounded-full blur-[80px] group-hover:bg-[#5483B3]/20 transition-all duration-1000" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white transition-all">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Dossiers</p>
                <p className="font-black text-xs uppercase tracking-tight text-white">Finalisés</p>
              </div>
            </div>
            <p className="text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-lg">{stats.completedOrders}</p>
          </div>
        </div>

        {/* Favorites Card */}
        <Link
          to="/dashboard/favorites"
          className="p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(225,29,72,0.05)] hover:-translate-y-2 group relative overflow-hidden block"
        >
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 mb-8 relative text-rose-500">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(225,29,72,0.2)] transition-all">
              <Heart size={20} fill={favorites.length > 0 ? "currentColor" : "none"} />
            </div>
            <div>
              <p className="font-bold text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Sélection</p>
              <p className="font-black text-xs uppercase tracking-tight text-slate-900">Mes Favoris</p>
            </div>
          </div>
          <div className="flex items-end justify-between relative">
            <p className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 drop-shadow-sm">{favorites.length}</p>
            <div className="pb-1 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 text-slate-400 group-hover:text-slate-900">
              Voir tout <ChevronRight size={12} />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders - Minimalist Table-like View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-black flex items-center gap-3 uppercase tracking-tight text-slate-900">
                <Zap size={18} className="text-slate-900" />
                Dernières Activités
              </h2>
            </div>
            <Link to="/dashboard/orders" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>

          <div className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-20 text-center space-y-2">
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-white/40">
                {recentOrders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className={`p-6 md:p-8 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/60 cursor-pointer group/row relative ${index === 0 ? 'border-l-4 border-[#FCA311] shadow-[inset_10px_0_30px_rgba(252,163,17,0.02)]' : ''}`} 
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-slate-500 shadow-sm group-hover/row:border-[#FCA311]/30 group-hover/row:text-[#FCA311] transition-all">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-sm tracking-tight text-slate-900">Commande #{order.orderNumber}</p>
                          <div className="shrink-0">{getStatusBadge(order.status)}</div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} •
                          <span className="font-black text-slate-900 ml-1.5">{order.total?.toLocaleString()}€</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                      <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm flex items-center justify-center text-slate-500 hover:bg-[#052659] hover:text-white hover:border-[#052659] transition-all">
                        <ChevronRight size={16} />
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
          <h2 className="text-lg font-black uppercase tracking-tight px-2 text-slate-900">
            Services
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-5 p-6 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.5rem] transition-all hover:bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/50 border border-white/80 shadow-sm flex items-center justify-center text-slate-500 group-hover:text-[#052659] transition-all">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold uppercase text-[9px] tracking-widest text-slate-400 mb-0.5">Informations</p>
                <p className="text-sm font-black text-slate-900 tracking-tight">Mon Profil Client</p>
              </div>
            </Link>

            <Link
              to="/dashboard/billing"
              className="flex items-center gap-5 p-6 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.5rem] transition-all hover:bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/50 border border-white/80 shadow-sm flex items-center justify-center text-slate-500 group-hover:text-[#052659] transition-all">
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold uppercase text-[9px] tracking-widest text-slate-400 mb-0.5">Paiements</p>
                <p className="text-sm font-black text-slate-900 tracking-tight">Factures & Reçus</p>
              </div>
            </Link>

            <Link
              to="/contact"
              className="flex items-center gap-5 p-6 rounded-[1.5rem] transition-all shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden relative group bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024] border border-[#FCA311]/30"
            >
              {/* Vivid Atmosphere */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FCA311]/15 rounded-full blur-[40px] group-hover:bg-[#FCA311]/25 transition-all duration-1000" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#5483B3]/10 rounded-full blur-[40px] group-hover:bg-[#5483B3]/20 transition-all duration-1000" />
              
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white transition-all">
                <Shield size={18} />
              </div>
              <div className="relative z-10 flex-1">
                <p className="font-bold uppercase text-[9px] tracking-widest text-slate-400 mb-0.5">Conciergerie</p>
                <p className="text-sm font-black text-white tracking-tight">Besoin d'aide ?</p>
              </div>
              <ChevronRight size={16} className="relative z-10 text-slate-500 group-hover:text-white transition-all group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;