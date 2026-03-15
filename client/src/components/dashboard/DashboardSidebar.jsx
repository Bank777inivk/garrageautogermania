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
    { icon: Package, label: 'Mes Commandes', path: '/dashboard/orders' },
    { icon: History, label: 'Historique', path: '/dashboard/history' },
    { icon: Compass, label: 'Suivi Livraison', path: '/dashboard/tracking' },
    { icon: FileText, label: 'Facturation', path: '/dashboard/billing' },
    { icon: User, label: 'Mon Profil', path: '/dashboard/profile' },
    { icon: Heart, label: 'Mes Favoris', path: '/dashboard/favorites' },
    { icon: Headphones, label: 'Support Client', path: '/dashboard/support' },
  ];

  return (
    <div className={`w-80 flex flex-col transition-all duration-300 overflow-hidden ${className} bg-[#021024] border-r border-white/5 shadow-2xl`}
    >

      {/* Logo Area */}
      <div className="px-8 py-7 border-b border-white/5 flex items-center justify-between bg-[#021024]">
        <Link to="/" onClick={onItemClick} className="flex items-center justify-start group">
          <div className="bg-white p-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] group-hover:scale-105 transition-all duration-500">
            <img src="/logo.webp" alt="Garrage" className="h-9 w-auto object-contain" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6 space-y-0.5 flex-1">
        <p className="px-4 text-[7px] font-black uppercase tracking-[0.35em] mb-4" style={{ color: '#5483B3' }}>Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={onItemClick}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group relative ${isActive
                ? 'border-l-2 shadow-[inset_4px_0_20px_rgba(252,163,17,0.08)]'
                : 'hover:bg-[#FCA311]/5'
              }`
            }
            style={({ isActive }) => isActive
              ? { backgroundColor: 'rgba(252, 163, 17, 0.05)', borderLeftColor: '#FCA311', color: '#ffffff' }
              : { color: 'rgba(255, 255, 255, 0.4)' }
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className="p-1.5 rounded-lg transition-all duration-500"
                  style={isActive
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }
                    : { backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'rgba(255, 255, 255, 0.3)' }
                  }
                >
                  <item.icon size={13} />
                </div>
                <span className={`ml-3 font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive ? 'translate-x-0.5 text-white' : 'group-hover:translate-x-0.5 group-hover:text-white'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 bg-[#FCA311] rounded-full shadow-[0_0_10px_rgba(252,163,17,0.8)] animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Priority Help */}
      <div className="px-5 mb-3">
        <Link
          to="/dashboard/support"
          className="w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 border group relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(252, 163, 17, 0.1) 0%, rgba(252, 163, 17, 0.05) 100%)', 
            borderColor: 'rgba(252, 163, 17, 0.2)', 
            color: '#FCA311' 
          }}
        >
          <div className="absolute inset-0 bg-[#FCA311]/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Zap size={11} className="transition-transform group-hover:scale-110" />
          <span className="text-[8px] font-black uppercase tracking-widest">Aide Prioritaire</span>
        </Link>
      </div>

      {/* Bottom Links */}
      <div className="px-5 pb-6 pt-3 space-y-0.5" style={{ borderTop: '1px solid rgba(193,232,255,0.1)' }}>
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center px-4 py-2.5 rounded-xl transition-all group hover:bg-white/5"
          style={{ color: 'rgba(193,232,255,0.45)' }}
        >
          <Home size={13} className="mr-3 group-hover:text-white transition-colors" style={{ color: '#7DA0CA' }} />
          <span className="font-black text-[9px] uppercase tracking-wider">Boutique</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2.5 rounded-xl transition-all group hover:bg-red-500/10"
          style={{ color: 'rgba(193,232,255,0.45)' }}
        >
          <LogOut size={13} className="mr-3 group-hover:text-red-400 transition-colors" style={{ color: '#7DA0CA' }} />
          <span className="font-black text-[9px] uppercase tracking-wider group-hover:text-red-400 transition-colors">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
