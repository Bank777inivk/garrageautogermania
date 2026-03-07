import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, User, LogOut, Home, Settings, FileText, Compass } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DashboardSidebar = ({ className = "", onItemClick }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success("Déconnexion réussie");
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Package, label: 'Mes Commandes', path: '/dashboard/orders' },
    { icon: Compass, label: 'Suivi Livraison', path: '/dashboard/tracking' },
    { icon: FileText, label: 'Facturation', path: '/dashboard/billing' },
    { icon: User, label: 'Mon Profil', path: '/dashboard/profile' },
  ];

  return (
    <div className={`w-80 bg-slate-900 text-slate-300 h-screen flex flex-col border-r border-white/5 shadow-2xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Compact Logo Area */}
      <div className="px-8 pt-8 pb-6 border-b border-white/5 bg-slate-950/20">
        <Link to="/" onClick={onItemClick} className="flex flex-col items-center justify-center group">
          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/20 group-hover:scale-105 transition-all duration-500">
            <img
              src="/logo.webp"
              alt="Garrage Pro"
              className="h-16 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Main Navigation - Very Compact */}
      <nav className="px-5 py-3 space-y-1">
        <p className="px-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">ESPACE CLIENT</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={onItemClick}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group relative ${isActive
                ? 'bg-white/5 text-white shadow-inner border-l-2 border-red-600 rounded-l-none'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-lg transition-all duration-500 ${isActive ? 'bg-red-700 text-white shadow-[0_0_15px_rgba(185,28,28,0.3)]' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                  <item.icon size={14} />
                </div>
                <span className={`ml-3 font-bold text-[11px] transition-all duration-300 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Compact Support Card */}
      <div className="px-5 mb-4 mt-auto">
        <div className="bg-gradient-to-br from-slate-800 to-amber-950/20 p-4 rounded-2xl border border-white/5 relative overflow-hidden group shadow-lg">
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] scale-50 group-hover:scale-75 transition-transform duration-700 text-white">
            <LayoutDashboard size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[7px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Service Client</p>
            <p className="text-[10px] text-slate-300 font-bold mb-3">Assistance Premium 7j/7</p>
            <button className="w-full py-2 bg-slate-700 hover:bg-red-700 text-white text-[7px] font-black uppercase rounded-lg transition-all active:scale-95 border border-white/5 group-hover:border-red-600">
              Contacter le Concierge
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions - Very Compact */}
      <div className="px-5 pb-6 pt-4 border-t border-white/5 space-y-1">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center px-4 py-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
        >
          <Home size={14} className="mr-3 text-slate-600 group-hover:text-red-500" />
          <span className="font-bold text-[10px] uppercase tracking-wider">Retour Boutique</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group"
        >
          <LogOut size={14} className="mr-3 text-slate-600 group-hover:text-red-500" />
          <span className="font-bold text-[10px] uppercase tracking-wider">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
