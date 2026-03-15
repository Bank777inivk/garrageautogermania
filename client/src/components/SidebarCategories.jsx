import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useBrands from '@shared/hooks/useBrands';
import BrandSelect from '@shared/components/BrandSelect';
import {
  ChevronRight, LayoutGrid, Car, Search, Filter,
  ChevronDown, ChevronUp, Settings, Wind, Check, Save
} from 'lucide-react';

const SidebarCategories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { brands, brandCounts } = useBrands();

  // Section collapse states
  const [openSections, setOpenSections] = useState({
    basic: true,
    tech: false,
    ac: false,
    features: false
  });

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    type: searchParams.get('type') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minMileage: searchParams.get('minMileage') || '',
    maxMileage: searchParams.get('maxMileage') || '',
    fuel: searchParams.get('fuel') || 'all',
    transmission: searchParams.get('transmission') || 'all',
    minPower: searchParams.get('minPower') || '',
    maxPower: searchParams.get('maxPower') || '',
    color: searchParams.get('color') || 'all',
    ac: searchParams.get('ac') || 'all',
    features: searchParams.get('features')?.split(',') || []
  });

  // Sync state with URL when location changes (back/forward or external link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      brand: params.get('brand') || '',
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
      features: params.get('features')?.split(',').filter(f => f) || []
    });
  }, [location.search]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => {
      const isSelected = prev.features.includes(feature);
      const newFeatures = isSelected
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (Array.isArray(filters[key])) {
        if (filters[key].length > 0) params.set(key, filters[key].join(','));
      } else if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
        params.set(key, filters[key]);
      }
    });

    // Si on est déjà sur le catalogue, on met à jour l'URL, sinon on y va
    navigate(`/catalogue?${params.toString()}`);
    if (location.pathname === '/catalogue') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  const availableFeatures = [
    "Bluetooth", "Ordinateur de bord", "Lecteur CD", "Vitres électriques",
    "Rétroviseur extérieur électrique", "Réglage électrique des sièges",
    "Kit mains libres", "Affichage tête haute", "Isofix",
    "Volant multifonction", "GPS", "Capteur de pluie", "Toit ouvrant",
    "Direction assistée", "Sièges chauffants", "Trappe à skis",
    "Chauffage auxiliaire", "Système Stop & Start", "Fermeture centralisée"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col group/sidebar">
      {/* Header Premium */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between font-black font-montserrat text-[11px] uppercase tracking-[0.2em] border-b border-amber-600/30 relative overflow-hidden group/header">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center border border-amber-600/20 group-hover/header:rotate-12 transition-transform">
            <LayoutGrid size={16} className="text-amber-600" />
          </div>
          {t('catalogue.advancedFilters', 'FILTRES AVANCÉS')}
        </div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-600/10 to-transparent pointer-events-none"></div>
      </div>

      <div className="flex-grow overflow-y-auto max-h-[800px] custom-scrollbar">
        {/* Section: Identification */}
        <div className="p-5 space-y-4">
          <button
            onClick={() => toggleSection('basic')}
            className="flex items-center justify-between w-full group"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Identification</span>
            {openSections.basic ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
          </button>

          {openSections.basic && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                  <LayoutGrid size={10} className="mr-1.5 text-amber-600" />
                  MARQUES
                </label>
                <BrandSelect
                  brands={brands}
                  value={filters.brand}
                  onChange={(name) => setFilters(prev => ({ ...prev, brand: name }))}
                  placeholder={t('search.allBrands', 'Toutes les marques')}
                  allLabel={t('search.allBrands', 'Toutes les marques')}
                  vehicleCounts={brandCounts}
                  activeClassName="bg-slate-900 text-white border-slate-900"
                  className="w-full bg-white text-[12px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                  <Search size={10} className="mr-1.5 text-amber-600" />
                  MODÈLE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="model"
                    placeholder="Ex: Série 3, RS6..."
                    value={filters.model}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all"
                  />
                  <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                  <Filter size={10} className="mr-1.5 text-amber-600" />
                  TYPE DE VÉHICULE
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all cursor-pointer"
                >
                  <option value="all">Tous les types</option>
                  <option value="Berline">Berline</option>
                  <option value="SUV">SUV</option>
                  <option value="Break">Break</option>
                  <option value="Coupé">Coupé</option>
                  <option value="Cabriolet">Cabriolet</option>
                  <option value="Compacte">Compacte</option>
                  <option value="Citadine">Citadine</option>
                  <option value="Van">Van / Monospace</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PRIX MIN (€)</label>
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PRIX MAX (€)</label>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">KM MIN</label>
                  <input
                    type="number"
                    name="minMileage"
                    placeholder="Min"
                    value={filters.minMileage}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">KM MAX</label>
                  <input
                    type="number"
                    name="maxMileage"
                    placeholder="Max"
                    value={filters.maxMileage}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Technique */}
        <div className="p-5 border-t border-slate-50 space-y-4">
          <button
            onClick={() => toggleSection('tech')}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-amber-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Technique & Moteur</span>
            </div>
            {openSections.tech ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
          </button>

          {openSections.tech && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CARBURANT</label>
                <select name="fuel" value={filters.fuel} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all">
                  <option value="all">Tous les carburants</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Électrique">Électrique (EV)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">TRANSMISSION</label>
                <select name="transmission" value={filters.transmission} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all">
                  <option value="all">Toutes les boîtes</option>
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CH MIN</label>
                  <input type="number" name="minPower" placeholder="Min" value={filters.minPower} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CH MAX</label>
                  <input type="number" name="maxPower" placeholder="Max" value={filters.maxPower} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">COULEUR</label>
                <select name="color" value={filters.color} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-900 focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all">
                  <option value="all">Toutes les couleurs</option>
                  <option value="Noir">Noir</option>
                  <option value="Blanc">Blanc</option>
                  <option value="Gris">Gris</option>
                  <option value="Argent">Argent</option>
                  <option value="Bleu">Bleu</option>
                  <option value="Rouge">Rouge</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section: AC */}
        <div className="p-5 border-t border-slate-50 space-y-4">
          <button
            onClick={() => toggleSection('ac')}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <Wind size={14} className="text-amber-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Climatisation</span>
            </div>
            {openSections.ac ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
          </button>

          {openSections.ac && (
            <div className="space-y-2 pt-2">
              {[
                { label: "Toutes", value: "all" },
                { label: "Manuelle ou automatique", value: "Manuelle/Auto" },
                { label: "Automatique", value: "Automatique" },
                { label: "Automatique bizone", value: "Bi-zone" },
                { label: "Automatique 3 zones", value: "3-zones" },
                { label: "Automatique 4 zones", value: "4-zones" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="ac"
                    value={option.value}
                    checked={filters.ac === option.value}
                    onChange={handleFilterChange}
                    className="w-4 h-4 text-amber-600 bg-slate-100 border-slate-300 focus:ring-amber-600"
                  />
                  <span className="text-xs font-bold text-slate-600 tracking-tight">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Section: Features */}
        <div className="p-5 border-t border-slate-50 space-y-4">
          <button
            onClick={() => toggleSection('features')}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <Check size={14} className="text-amber-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Caractéristiques</span>
            </div>
            {openSections.features ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
          </button>

          {openSections.features && (
            <div className="grid grid-cols-1 gap-1 pt-2">
              {availableFeatures.map((feature) => (
                <label key={feature} className="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group/feat">
                  <div
                    onClick={() => handleFeatureToggle(feature)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${filters.features.includes(feature)
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white group-hover/feat:border-amber-600'
                      }`}
                  >
                    {filters.features.includes(feature) && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight transition-colors ${filters.features.includes(feature) ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                    {feature}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={applyFilters}
          className="w-full bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-amber-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <Search size={16} />
          CHERCHER LES VÉHICULES
        </button>
      </div>
    </div>
  );
};

export default SidebarCategories;
