import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const DashboardHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'clients', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching header profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.email?.split('@')[0];

  return (
    <header className="bg-white border-b border-slate-100 h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-12 sticky top-0 z-40 transition-all">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-3 text-slate-600 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all active:scale-95"
        >
          <Menu size={24} />
        </button>
        <Link to="/dashboard" className="hidden sm:block hover:opacity-80 transition-opacity">
          <h1 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">Espace <span className="text-slate-900 uppercase text-xs lg:text-sm ml-1 tracking-widest">Client</span></h1>
          <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gestion de vos acquisitions</p>
        </Link>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <Link to="/dashboard/profile" className="text-right hidden md:block hover:opacity-70 transition-opacity">
            <p className="text-sm font-black text-slate-900 leading-tight capitalize">
              {displayName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membre Premium</p>
          </Link>
          <Link to="/dashboard/profile" className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-950 rounded-xl lg:rounded-2xl flex items-center justify-center text-white border border-slate-900 shadow-xl shadow-slate-200 group cursor-pointer hover:scale-105 transition-all">
            <User size={18} className="group-hover:text-red-500 transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
