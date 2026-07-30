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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12 mt-4">
      {/* Hero Welcome Section */}
      <div className="bg-[#14213D] rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-[#14213D]/20 border-b-4 border-[#FCA311] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FCA311] blur-[150px] opacity-10 rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <p className="text-[#FCA311] font-black text-[10px] uppercase tracking-[0.3em] mb-2">Espace Privé</p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            Bienvenue, <span className="text-[#FCA311]">{profile?.firstName || user?.displayName?.split(' ')[0] || 'Monsieur'}</span>
          </h1>
          <p className="text-white/60 mt-4 text-[12px] font-medium max-w-md">
            Gérez vos acquisitions, suivez vos livraisons et accédez à votre conciergerie dédiée depuis votre espace premium.
          </p>
        </div>
        
        <Link
          to="/catalogue"
          className="relative z-10 bg-white text-[#14213D] px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 group active:scale-95 hover:bg-[#FCA311] shadow-xl shrink-0"
        >
          Parcourir le catalogue
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-900/5 shadow-sm hover:shadow-xl hover:shadow-[#14213D]/5 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-slate-100 transition-colors"></div>
          <div className="w-10 h-10 rounded-xl bg-[#14213D]/5 border border-[#14213D]/10 flex items-center justify-center text-[#14213D] mb-6 group-hover:scale-110 transition-transform">
            <Package size={18} />
          </div>
          <p className="text-4xl md:text-5xl font-black text-[#14213D] tracking-tighter mb-1">{stats.totalOrders}</p>
          <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-slate-400">Total Commandes</p>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#FCA311]/20 shadow-sm hover:shadow-xl hover:shadow-[#FCA311]/10 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCA311]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#FCA311]/10 transition-colors"></div>
          <div className="w-10 h-10 rounded-xl bg-[#FCA311]/10 border border-[#FCA311]/20 flex items-center justify-center text-[#FCA311] mb-6 group-hover:scale-110 transition-transform">
            <Clock size={18} />
          </div>
          <p className="text-4xl md:text-5xl font-black text-[#14213D] tracking-tighter mb-1">{stats.activeOrders}</p>
          <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-slate-400">En cours</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-[#14213D] rounded-[2rem] p-6 md:p-8 shadow-xl group relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCA311] opacity-10 rounded-full blur-[30px] group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FCA311] mb-6 group-hover:scale-110 transition-transform">
            <CheckCircle size={18} />
          </div>
          <p className="relative z-10 text-4xl md:text-5xl font-black text-white tracking-tighter mb-1">{stats.completedOrders}</p>
          <p className="relative z-10 font-bold text-[9px] uppercase tracking-[0.2em] text-white/50">Dossiers Finalisés</p>
        </div>

        {/* Favorites */}
        <Link to="/dashboard/favorites" className="bg-rose-50 rounded-[2rem] p-6 md:p-8 border border-rose-100 hover:shadow-xl hover:shadow-rose-500/10 transition-all group relative overflow-hidden block cursor-pointer">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-bl-[100px] -z-10 transition-colors"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-500 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
              <Heart size={18} fill={favorites.length > 0 ? "currentColor" : "none"} />
            </div>
            <ChevronRight size={16} className="text-rose-300 group-hover:translate-x-1 transition-transform group-hover:text-rose-500" />
          </div>
          <p className="text-4xl md:text-5xl font-black text-rose-950 tracking-tighter mb-1">{favorites.length}</p>
          <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-rose-400">Favoris</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Minimalist Table-like View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.3em] text-[#14213D]">
              <Zap size={14} className="text-[#FCA311] fill-current" />
              Dernières Activités
            </h2>
            <Link to="/dashboard/orders" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#FCA311] transition-colors flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-900/5 shadow-sm overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-16 text-center space-y-2 bg-slate-50">
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className="p-5 md:p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer group relative" 
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  >
                    {index === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FCA311]"></div>}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all ${index === 0 ? 'bg-[#FCA311]/10 border-[#FCA311]/20 text-[#FCA311]' : 'bg-white border-slate-100 text-slate-400 group-hover:border-[#FCA311]/30 group-hover:text-[#FCA311]'}`}>
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-sm tracking-tight text-[#14213D]">#{order.orderNumber}</p>
                          <div className="shrink-0 scale-90 origin-left">{getStatusBadge(order.status)}</div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'} •
                          <span className="font-black text-[#14213D] ml-1">{order.total?.toLocaleString()}€</span>
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-[#14213D] group-hover:text-white transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services / Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] px-2 text-[#14213D] mb-2">
            Services
          </h2>
          <div className="flex flex-col gap-4">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-4 p-5 bg-white border border-slate-900/5 rounded-[1.5rem] transition-all hover:shadow-lg hover:shadow-[#14213D]/5 hover:border-[#14213D]/10 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#14213D] group-hover:bg-[#14213D]/5 transition-all">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-[#14213D] tracking-tight">Mon Profil</p>
                <p className="font-bold uppercase text-[9px] tracking-[0.2em] text-slate-400">Informations & Sécurité</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 group-hover:text-[#14213D] transition-all" />
            </Link>

            <Link
              to="/dashboard/billing"
              className="flex items-center gap-4 p-5 bg-white border border-slate-900/5 rounded-[1.5rem] transition-all hover:shadow-lg hover:shadow-[#14213D]/5 hover:border-[#14213D]/10 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#14213D] group-hover:bg-[#14213D]/5 transition-all">
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-[#14213D] tracking-tight">Facturation</p>
                <p className="font-bold uppercase text-[9px] tracking-[0.2em] text-slate-400">Paiements & Reçus</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 group-hover:text-[#14213D] transition-all" />
            </Link>

            <Link
              to="/dashboard/support"
              className="flex items-center gap-4 p-6 rounded-[1.5rem] transition-all shadow-lg hover:shadow-xl group bg-[#14213D] border-b-2 border-[#FCA311] relative overflow-hidden hover:-translate-y-1"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#FCA311] blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#FCA311]">
                <Shield size={18} />
              </div>
              <div className="relative z-10 flex-1">
                <p className="text-sm font-black text-white tracking-tight">Conciergerie</p>
                <p className="font-bold uppercase text-[9px] tracking-[0.2em] text-[#FCA311]">Assistance 24/7</p>
              </div>
              <ChevronRight size={14} className="relative z-10 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;