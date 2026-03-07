import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { X } from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <DashboardSidebar className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30" />

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-900 z-50 animate-in slide-in-from-left duration-300 shadow-2xl flex flex-col border-r border-white/5">
            <div className="absolute right-4 top-4 z-50">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white/70 hover:text-white p-2"
              >
                <X size={24} />
              </button>
            </div>
            <DashboardSidebar className="flex flex-col h-full w-full" onItemClick={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 flex flex-col h-screen transition-all duration-300 w-full overflow-hidden">
        <DashboardHeader toggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
