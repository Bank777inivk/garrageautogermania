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
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
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
    <div className="bg-[#1D2327] text-white w-64 min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-4 border-b border-gray-700 flex items-center justify-center">
        <h1 className="text-xl font-bold font-montserrat tracking-wider">AUTO IMPORT</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 transition-colors ${isActive
                    ? 'bg-[#2271B1] text-white'
                    : 'text-gray-300 hover:bg-[#2c3338] hover:text-white'
                  }`
                }
              >
                <item.icon size={20} className="mr-3" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#2c3338] rounded transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
