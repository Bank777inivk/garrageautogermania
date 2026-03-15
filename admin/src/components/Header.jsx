import React from 'react';
import useAuthStore from '@shared/store/useAuthStore';
import { User, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-[#E5E5E5] h-16 flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 lg:left-64 right-0 z-10 transition-all duration-300">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-[#14213D] hover:bg-[#14213D]/5 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex flex-col">
          <h2 className="text-sm font-black text-[#14213D] uppercase tracking-widest">
            Back-office
          </h2>
          <span className="text-[10px] font-bold text-[#14213D]/40 uppercase tracking-widest mt-0.5">
            Gestion du parc automobile
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 px-4 py-2 bg-[#14213D]/5 rounded-2xl border border-[#14213D]/5">
          <div className="w-8 h-8 rounded-xl bg-[#14213D] text-[#FCA311] flex items-center justify-center shadow-md">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#14213D] uppercase tracking-widest">
              {user?.email?.split('@')[0] || 'Directeur'}
            </span>
            <span className="text-[8px] font-bold text-[#14213D]/40 uppercase tracking-widest">
              Administrateur
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
