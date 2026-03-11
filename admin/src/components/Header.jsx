import React from 'react';
import useAuthStore from '@shared/store/useAuthStore';
import { User, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 lg:left-64 right-0 z-10 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 font-montserrat truncate">
          Administration
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <User size={20} />
          </div>
          <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[150px]">
            {user?.email || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
