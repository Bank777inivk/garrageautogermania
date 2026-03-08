import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, User, LogOut, Home, FileText, Compass, History, Headphones, Zap, Heart } from 'lucide-react';
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
    { icon: Package, label: 'Mes Acquisitions', path: '/dashboard/orders' },
    { icon: History, label: 'Historique', path: '/dashboard/history' },
    { icon: Compass, label: 'Suivi Livraison', path: '/dashboard/tracking' },
    { icon: FileText, label: 'Facturation', path: '/dashboard/billing' },
    { icon: User, label: 'Mon Profil', path: '/dashboard/profile' },
    { icon: Heart, label: 'Mes Favoris', path: '/dashboard/favorites' },
    { icon: Headphones, label: 'Support Client', path: '/dashboard/support' },
  ];

  return (
    <div className={`w-80 bg-slate-900 text-slate-300 h-screen flex flex-col border-r border-white/5 shadow-2xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Super Compact Logo Area */}
      <div className="px-8 py-6 border-b border-white/5 bg-slate-950/20">
        <Link to="/" onClick={onItemClick} className="flex items-center justify-center group">
          <div className="bg-white p-2.5 rounded-xl shadow-xl shadow-black/20 group-hover:scale-105 transition-all duration-500">
            <img
              src="/logo.webp"
              alt="Garrage Pro"
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Main Navigation - High Density */}
      <nav className="px-5 py-4 space-y-0.5 flex-1">
        <p className="px-4 text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">ESPACE CLIENT</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={onItemClick}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-4 py-1.5 rounded-xl transition-all duration-300 group relative ${isActive
                ? 'bg-white/5 text-white shadow-inner border-l-2 border-red-600 rounded-l-none'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all duration-500 ${isActive ? 'bg-red-700 text-white shadow-[0_0_15px_rgba(185,28,28,0.3)]' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                  <item.icon size={13} />
                </div>
                <span className={`ml-3 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Extreme Compact Support - Single Line */}
      <div className="px-5 mb-2">
        <Link
          to="/dashboard/support"
          className="w-full py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-white/5 hover:to-white/10 text-white rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 group shadow-lg"
        >
          <Zap size={10} className="text-amber-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest">Aide Prioritaire</span>
        </Link>
      </div>

      {/* Bottom Actions - Dense */}
      <div className="px-5 pb-6 pt-2 border-t border-white/5">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center px-4 py-2 text-slate-500 hover:text-white rounded-xl transition-all group"
        >
          <Home size={13} className="mr-3 text-slate-600 group-hover:text-red-500" />
          <span className="font-bold text-[9px] uppercase tracking-wider">Boutique</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-slate-500 hover:text-red-500 rounded-xl transition-all group"
        >
          <LogOut size={13} className="mr-3 text-slate-600 group-hover:text-red-500" />
          <span className="font-bold text-[9px] uppercase tracking-wider">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
