import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';
import useCartStore from '@shared/store/useCartStore';
import {
  X, ShoppingCart, Eye, Search, RotateCcw, SlidersHorizontal, Settings, Wind, Check
} from 'lucide-react';
import SidebarCategories from '../components/SidebarCategories';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import VerticalAd from '../components/VerticalAd';
import SecondaryAd from '../components/SecondaryAd';
import LogoCard from '../components/LogoCard';

const Catalogue = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { vehicles, loading, fetchVehicles } = useClientVehicleStore();
  const { addToCart } = useCartStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse query params and fetch vehicles
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterObj = {
      brand: params.get('brand') || 'all',
      model: params.get('model') || '',
      type: params.get('type') || 'all',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      minMileage: params.get('minMileage') || '',
      maxMileage: params.get('maxMileage') || '',
      fuel: params.get('fuel') || 'all',
      transmission: params.get('transmission') || 'all',
      minPower: params.get('minPower') || '',
      maxPower: params.get('maxPower') || '',
      color: params.get('color') || 'all',
      ac: params.get('ac') || 'all',
      features: params.get('features')?.split(',') || []
    };

    fetchVehicles(filterObj);
  }, [location.search]);

  // Lock scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  const resetFilters = () => {
    window.location.href = '/catalogue';
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-10">
      <div className="container mx-auto px-4">

        {/* Header Catalogue - Refined for Mobile/Desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl md:text-4xl font-black font-montserrat text-slate-900 tracking-tight uppercase">
              {t('catalogue.explore', 'Explorez la Gamme')}
              <span className="block h-1.5 w-16 md:w-24 bg-red-700 mt-2 rounded-full"></span>
            </h1>
            <p className="text-slate-500 mt-2 md:mt-4 text-xs md:text-sm font-medium">
              {loading ? (
                <span className="inline-block w-48 h-4 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                `${vehicles.length} ${t('catalogue.resultsReady', 'véhicules disponibles pour importation')}`
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={resetFilters}
              className="flex-1 md:flex-none group flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
              <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              RÉINITIALISER LE FILTRE
            </button>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <SlidersHorizontal size={14} />
              {t('catalogue.filters', 'Filtres')}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            <SidebarCategories />
            <VerticalAd />
            <SecondaryAd />
            <LogoCard />
          </div>

          {/* Mobile Filter Drawer - Enhanced */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => setShowMobileFilters(false)}
              ></div>
              <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shadow-md">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-red-700" />
                    <h3 className="font-black text-xs uppercase tracking-[0.2em]">{t('catalogue.filters', 'Affiner la recherche')}</h3>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-5 flex-grow overflow-y-auto bg-slate-50/50">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <SidebarCategories />
                  </div>
                  <div className="mt-8">
                    <LogoCard />
                  </div>
                </div>

                <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-4 bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:bg-red-800 transition-all active:scale-[0.98]"
                  >
                    Voir les résultats
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Grid Area */}
          <div className="flex-grow">
            <SearchBar className="mb-10 !max-w-none shadow-sm hidden lg:block" />

            {loading ? (
              <div className="flex flex-col gap-6 md:gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-[280px] animate-pulse">
                    <div className="w-full sm:w-[320px] lg:w-[380px] h-48 sm:h-full bg-slate-200"></div>
                    <div className="p-6 flex-grow flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-3 w-20 bg-slate-100 rounded"></div>
                          <div className="h-6 w-48 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
                      </div>
                      <div className="h-16 w-full bg-slate-50 rounded-xl"></div>
                      <div className="flex gap-4 mt-auto">
                        <div className="h-4 w-24 bg-slate-100 rounded"></div>
                        <div className="h-4 w-24 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 md:p-20 text-center shadow-xl border border-slate-100">
                <div className="w-16 md:w-20 h-16 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{t('catalogue.noResults', 'Aucune correspondance')}</h3>
                <p className="text-slate-500 mb-8 max-w-xs md:max-w-sm mx-auto text-sm">{t('catalogue.noResultsDesc', 'Essayez d\'élargir vos critères ou de réinitialiser les filtres.')}</p>
                <button onClick={resetFilters} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95">
                  {t('catalogue.clearFilters', 'Réinitialiser les filtres')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 md:gap-8">
                {vehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} layout="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Filtres) - Mobile Only */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden pointer-events-none">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="pointer-events-auto flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-red-700 transition-all active:scale-90 border border-white/10"
        >
          <SlidersHorizontal size={18} className="text-red-600" />
          {t('catalogue.filtersButton', 'Filtres')}
          {vehicles.length > 0 && (
            <span className="bg-red-700 text-white px-2 py-0.5 rounded-full text-[9px] min-w-[20px]">
              {vehicles.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Catalogue;
