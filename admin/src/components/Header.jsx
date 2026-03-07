import React from 'react';
import useAuthStore from '@shared/store/useAuthStore';
import { User } from 'lucide-react';

const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 fixed top-0 left-64 right-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 font-montserrat">
          Administration
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.email || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
