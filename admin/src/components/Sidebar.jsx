import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Percent,
  Image,
  UserCheck,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Car, label: 'Véhicules & Marques', path: '/vehicles' },
    { icon: ShoppingCart, label: 'Commandes', path: '/orders' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Percent, label: 'Promotions', path: '/promotions' },
    { icon: Image, label: 'Bannières', path: '/banners' },
    { icon: UserCheck, label: 'Administrateurs', path: '/admins' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className={`
      bg-[#14213D] text-white w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30
      transition-transform duration-300 transform
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-black font-montserrat tracking-[0.2em] text-[#FCA311]">GARRAGE</h1>
          <span className="text-[9px] font-bold text-white/40 tracking-[0.3em] uppercase mt-1">Administration</span>
        </div>
        <button onClick={onClose} className="lg:hidden w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center px-5 py-4 rounded-2xl transition-all group ${isActive
                    ? 'bg-[#FCA311] text-[#14213D] font-black shadow-lg shadow-[#FCA311]/10'
                    : 'text-white/40 hover:text-[#FCA311] hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={18} className="mr-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-[#FCA311] hover:bg-white/5 rounded-2xl transition-all"
        >
          <LogOut size={18} className="mr-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
