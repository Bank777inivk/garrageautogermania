import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
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
      className="h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-12 sticky top-0 z-40 transition-all bg-white/30 backdrop-blur-md border-b border-white/20"
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-3 rounded-2xl transition-all active:scale-95"
          style={{ color: '#021024', backgroundColor: 'rgba(2,16,36,0.05)', border: '1px solid rgba(2,16,36,0.1)' }}
        >
          <Menu size={22} />
        </button>
        <Link to="/dashboard" className="hidden sm:block hover:opacity-80 transition-opacity">
          <h1 className="text-lg lg:text-xl font-black tracking-tight" style={{ color: '#021024' }}>
            Espace <span className="uppercase text-xs lg:text-sm ml-1 tracking-widest" style={{ color: '#052659' }}>Client</span>
          </h1>
          <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: '#5483B3' }}>Gestion de vos acquisitions</p>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4 pl-5" style={{ borderLeft: '1px solid rgba(2,16,36,0.1)' }}>
          <Link to="/dashboard/profile" className="text-right hidden md:block hover:opacity-100 transition-all group/text">
            <p className="text-sm font-black leading-tight capitalize text-slate-900 group-hover/text:text-[#FCA311] transition-colors">{displayName}</p>
            <div className="flex items-center gap-1.5 justify-end">
                <div className="w-1 h-1 rounded-full bg-[#FCA311] shadow-[0_0_8px_rgba(252,163,17,0.8)] animate-pulse"></div>
                <p className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-[#FCA311] via-[#fbbf24] to-[#FCA311] bg-clip-text text-transparent animate-shimmer">Membre Premium</p>
            </div>
          </Link>
          <Link
            to="/dashboard/profile"
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-all group bg-[#021024] relative overflow-hidden active:scale-95 border-b-2 border-white/10 hover:border-[#FCA311]/50"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FCA311]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <User size={18} className="text-slate-200 group-hover:text-[#FCA311] transition-colors relative z-10" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
