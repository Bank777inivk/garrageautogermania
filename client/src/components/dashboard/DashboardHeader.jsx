import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import useLangNavigate from '../../hooks/useLangNavigate';

const DashboardHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { langPath } = useLangNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'clients', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfile(docSnap.data());
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
    <header
      className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 bg-white border-b border-slate-200"
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Espace Client
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Gestion de vos acquisitions</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Link to={langPath('/dashboard/profile')} className="text-right hidden md:block group">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{displayName}</p>
            <p className="text-[11px] font-medium text-slate-500">Membre Premium</p>
          </Link>
          <Link
            to="/dashboard/profile"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer"
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
