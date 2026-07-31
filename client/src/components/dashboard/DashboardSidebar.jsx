import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, User, LogOut, Home, FileText, Compass, History, Headphones, Zap, Heart } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';

const DashboardSidebar = ({ className = "", onItemClick }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { settings, fetchSettings } = useClientVehicleStore();

  React.useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

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
    <div className={`w-64 lg:w-72 flex flex-col transition-all duration-300 overflow-hidden ${className} bg-white border-r border-slate-200`}
    >

      {/* Logo Area */}
      <div className="px-6 py-5 md:py-8 flex items-center justify-start bg-white">
        <Link to="/" onClick={onItemClick} className="flex items-center justify-start group">
          <img src={settings?.logoUrl || "/logo.webp"} alt="Garage" className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-2 md:py-4 flex-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3 md:mb-4">Menu Principal</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onItemClick}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-full transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={`transition-colors ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="ml-4 text-[13px]">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* General Settings Section */}
      <div className="px-4 py-4 mb-4 border-t border-slate-100">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3 md:mb-4 mt-2">Paramètres</p>
        <div className="space-y-1">
          <Link
            to="/dashboard/profile"
            onClick={onItemClick}
            className="flex items-center px-4 py-3 rounded-full transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
          >
            <User size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
            <span className="ml-4 text-[13px]">Mon Compte</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-full transition-all group text-slate-500 hover:bg-red-50 hover:text-red-600 font-medium"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="ml-4 text-[13px]">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
