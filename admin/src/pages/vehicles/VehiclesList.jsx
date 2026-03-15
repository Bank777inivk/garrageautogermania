import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, addDoc, getDocs, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import useVehicleStore from '@shared/store/useVehicleStore';
import uploadToCloudinary from '@shared/cloudinary/config';
import {
  Plus, Edit, Trash2, Search, Car, Tags, ChevronDown, ChevronRight,
  Loader2, Image as ImageIcon, X, Upload, Star, Eye, EyeOff, Check, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { applyWatermark, getPublicIdFromUrl } from '@shared/utils/cloudinary';

import useBrands from '@shared/hooks/useBrands';
import BrandSelect from '@shared/components/BrandSelect';

// =========================================================
// Status Badge
// =========================================================
const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-green-50 text-green-700 border border-green-100',
    sold: 'bg-red-50 text-red-700 border border-red-100',
    reserved: 'bg-[#FCA311]/10 text-[#FCA311] border border-[#FCA311]/20',
  };
  const labels = { available: 'Disponible', sold: 'Vendu', reserved: 'Réservé' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.available}`}>
      {labels[status] || status}
    </span>
  );
};

// =========================================================
// Category Modal (Add/Edit brand)
// =========================================================
const CategoryModal = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');
  const [imageUrl, setImageUrl] = useState(category?.image || '');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch { toast.error("Erreur d'upload"); }
    finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-[#E5E5E5]">
        <div className="p-6 border-b border-[#E5E5E5] flex justify-between items-center bg-gray-50">
          <h3 className="font-black text-[#14213D] uppercase tracking-tight">{category ? 'Modifier la marque' : 'Nouvelle marque'}</h3>
          <button onClick={onClose} className="text-[#14213D]/20 hover:text-[#14213D] transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Nom de la marque</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-[#E5E5E5] rounded-2xl px-4 py-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#FCA311] outline-none text-base font-bold text-[#14213D] transition-all"
              placeholder="ex: BMW, Mercedes, Audi..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Logo de la marque</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E5E5] rounded-2xl p-8 cursor-pointer hover:bg-gray-50 hover:border-[#FCA311] transition-all relative group">
              {imageUrl ? (
                <img src={imageUrl} alt="logo" className="h-24 object-contain" />
              ) : uploading ? (
                <Loader2 className="animate-spin text-[#FCA311]" size={36} />
              ) : (
                <>
                  <Upload size={32} className="text-[#14213D]/10 group-hover:text-[#FCA311] mb-3 transition-colors" />
                  <span className="text-[10px] text-[#14213D]/40 font-black uppercase tracking-widest">Cliquer pour télécharger</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 border border-[#E5E5E5] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#14213D]/40 hover:bg-gray-50 transition-all">Annuler</button>
            <button
              onClick={() => { if (!name.trim()) return toast.error('Nom requis'); onSave({ name: name.trim(), image: imageUrl }); }}
              className="flex-1 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/10"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// Main VehiclesList Component
// =========================================================
const VehiclesList = () => {
  const { vehicles, fetchVehicles, deleteVehicle, updateVehicle, loading } = useVehicleStore();
  const navigate = useNavigate();

  const toggleFeatured = async (id, currentStatus) => {
    try {
      await updateVehicle(id, { featured: !currentStatus });
      toast.success(currentStatus ? 'Mis en avant retiré' : 'Véhicule mis en avant (TOP)');
    } catch (err) {
      toast.error("Erreur de modification");
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or category name
  const [expandedBrands, setExpandedBrands] = useState({});
  const { brands } = useBrands();
  const [catModal, setCatModal] = useState(null); // null | 'new' | category obj
  const [showCatPanel, setShowCatPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'documents'));
      if (docSnap.exists()) setSettings(docSnap.data());
    };
    fetchSettings();
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleSaveCategory = async (data) => {
    if (catModal?.id) {
      await updateDoc(doc(db, 'categories', catModal.id), data);
      toast.success('Marque mise à jour');
    } else {
      await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
      toast.success('Marque ajoutée');
    }
    setCatModal(null);
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Supprimer ce véhicule du catalogue ?')) {
      await deleteVehicle(id);
      toast.success('Véhicule supprimé');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (window.confirm('Supprimer cette marque ?')) {
      if (cat.id) {
        await deleteDoc(doc(db, 'categories', cat.id));
      } else {
        await addDoc(collection(db, 'categories'), { name: cat.name, deleted: true, createdAt: serverTimestamp() });
      }
      toast.success('Marque supprimée');
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const searchMatch =
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.version?.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = activeTab === 'all' || v.brand?.toLowerCase() === activeTab.toLowerCase();
    const statusMatch = statusFilter === 'all' || v.status === statusFilter;
    return searchMatch && brandMatch && statusMatch;
  });

  // Group by brand for the "all" view
  const vehiclesByBrand = filteredVehicles.reduce((acc, v) => {
    const brand = v.brand || 'Sans marque';
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(v);
    return acc;
  }, {});

  const brandCounts = Object.fromEntries(
    Object.entries(vehiclesByBrand).map(([brand, vehs]) => [brand, vehs.length])
  );

  const toggleBrand = (brand) => setExpandedBrands(prev => ({ ...prev, [brand]: !prev[brand] }));

  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter(v => v.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#14213D] flex items-center gap-3 uppercase tracking-tight">
            <Car className="text-[#FCA311]" size={26} />
            Catalogue Véhicules
          </h1>
          <p className="text-[10px] text-[#14213D]/40 font-black mt-1 uppercase tracking-[0.2em]">
            {totalVehicles} véhicules •{' '}
            <span className="text-green-600">{availableCount} disponibles</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setShowCatPanel(!showCatPanel)}
            className={`flex items-center justify-center gap-2 px-5 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showCatPanel
                ? 'bg-[#14213D] text-[#FCA311] border-[#14213D] shadow-lg shadow-[#14213D]/10'
                : 'border-[#E5E5E5] text-[#14213D]/50 hover:bg-[#14213D]/5 hover:text-[#14213D]'
            }`}
          >
            <Tags size={16} />
            Gestion Marques {showCatPanel ? <X size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="flex items-center justify-center gap-3 px-7 py-3 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/10 active:scale-95 border-b-4 border-[#FCA311]/20 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Ajouter un véhicule
          </button>
        </div>
      </div>

      {/* Category Management Panel */}
      {showCatPanel && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-[#14213D] flex items-center gap-2 text-[11px] uppercase tracking-widest">
              <Tags size={18} className="text-[#FCA311]" /> Marques & Catégories ({brands.length})
            </h3>
            <button
              onClick={() => setCatModal('new')}
              className="flex items-center gap-2 text-[10px] font-black text-[#14213D]/50 hover:text-[#14213D] hover:bg-[#14213D]/5 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-[#E5E5E5]"
            >
              <Plus size={16} className="text-[#FCA311]" /> Nouvelle marque
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {brands.map(cat => (
              <div key={cat.id || cat.name} className="border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-gray-200 hover:shadow-sm transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Tags size={20} className="text-gray-300" />
                  )}
                </div>
                <p className="text-xs font-bold text-gray-700 text-center leading-tight">{cat.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {vehicles.filter(v => v.brand === cat.name).length} véh.
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setCatModal(cat)}
                    className="p-1.5 text-[#14213D]/40 hover:text-[#FCA311] hover:bg-[#14213D] rounded-lg transition-colors"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1 text-red-400 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col lg:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FCA311]" size={18} />
          <input
            type="text"
            placeholder="Rechercher par marque, modèle..."
            className="w-full pl-11 pr-4 py-3 border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] focus:border-[#FCA311] outline-none text-sm bg-white font-black text-[#14213D] placeholder:text-[#14213D]/20 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'available', 'reserved', 'sold'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 min-w-[100px] sm:min-w-0 sm:flex-none px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-[#14213D] text-[#FCA311] shadow-lg shadow-[#14213D]/10 border-b-2 border-[#FCA311]/30'
                  : 'bg-white text-[#14213D]/40 border border-[#E5E5E5] hover:bg-[#14213D]/5 hover:text-[#14213D]'
              }`}
            >
              {s === 'all' ? 'Tous' : s === 'available' ? 'Disponibles' : s === 'reserved' ? 'Réservés' : 'Vendus'}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all border uppercase tracking-widest ${
            activeTab === 'all'
              ? 'bg-[#14213D] text-[#FCA311] border-[#14213D] shadow-lg shadow-[#14213D]/10'
              : 'bg-white text-[#14213D]/50 border-[#E5E5E5] hover:bg-[#14213D]/5 hover:text-[#14213D]'
          }`}
        >
          Toutes les marques ({vehicles.length})
        </button>
        <div className="flex-1 sm:max-w-xs">
          <BrandSelect
            brands={brands}
            value={activeTab === 'all' ? '' : activeTab}
            onChange={(name) => setActiveTab(name || 'all')}
            placeholder="Filtrer par marque..."
            allLabel="Toutes les marques"
            vehicleCounts={brandCounts}
            className="w-full shadow-none"
          />
        </div>
        {activeTab !== 'all' && (
          <button
            onClick={() => setActiveTab('all')}
            className="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black text-[#14213D]/40 hover:text-red-600 border border-[#E5E5E5] hover:border-red-200 rounded-2xl transition-all bg-white uppercase tracking-widest"
          >
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {/* Vehicle List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#14213D]" size={36} />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
          <Car size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium italic">Aucun véhicule ne correspond à votre recherche.</p>
        </div>
      ) : activeTab === 'all' ? (
        /* Grouped by brand */
        <div className="space-y-4">
          {Object.entries(vehiclesByBrand).sort().map(([brand, brandVehicles]) => {
            const isExpanded = expandedBrands[brand] !== false; // Expanded by default
            const brandCat = brands.find(c => c.name === brand);
            return (
              <div key={brand} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Brand Header */}
                <button
                  onClick={() => toggleBrand(brand)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100">
                      {brandCat?.image ? (
                        <img src={brandCat.image} alt={brand} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Tags size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-base">{brand}</h3>
                      <p className="text-xs text-gray-400 font-medium">{brandVehicles.length} véhicule(s)</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                </button>

                {/* Brand vehicles table */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Véhicule</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Favoris</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Année</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carburant</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kilométrage</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Photos</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {brandVehicles.map(vehicle => (
                            <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                    {vehicle.images?.[0] ? (
                                      <img 
                                        src={applyWatermark(vehicle.images?.[0] || 'https://images.unsplash.com/photo-1542362567-b052fd119971?auto=format&fit=crop&q=80', settings?.watermarkPublicId || (settings?.logoUrl ? getPublicIdFromUrl(settings.logoUrl) : null), settings?.watermarkEnabled)} 
                                        alt="" 
                                        className="w-full h-full object-cover" 
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Car size={18} />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => toggleFeatured(vehicle.id, vehicle.featured)}
                                        className={`transition-all ${vehicle.featured ? 'text-amber-500' : 'text-gray-200 hover:text-amber-300'}`}
                                        title={vehicle.featured ? "Retirer la mise en avant" : "Mettre en avant (TOP)"}
                                      >
                                        <Star size={16} fill={vehicle.featured ? "currentColor" : "none"} />
                                      </button>
                                      <div className="font-bold text-gray-900 text-sm">{vehicle.model}</div>
                                    </div>
                                    {vehicle.version && <div className="text-[10px] text-gray-400 font-medium ml-6">{vehicle.version}</div>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-600 font-medium">{vehicle.type || '-'}</td>
                              <td className="px-5 py-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <Heart size={14} className={vehicle.favoritesCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-200'} />
                                  <span className="text-[10px] font-black text-gray-600">{vehicle.favoritesCount || 0}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-600 font-medium">{vehicle.year}</td>
                              <td className="px-5 py-4 text-xs text-gray-600 font-medium">{vehicle.fuel}</td>
                              <td className="px-5 py-4 text-xs text-gray-600 font-medium">{Number(vehicle.mileage).toLocaleString()} km</td>
                              <td className="px-5 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 text-sm">{Number(vehicle.price).toLocaleString()} €</span>
                                  {vehicle.discount > 0 && (
                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">-{vehicle.discount}% PROMO</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                  <ImageIcon size={14} className="text-gray-300" />
                                  {vehicle.images?.length || 0}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <StatusBadge status={vehicle.status} />
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                                    className="p-2 text-[#14213D]/40 hover:text-[#FCA311] hover:bg-[#14213D] rounded-lg transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                      {brandVehicles.map(vehicle => (
                        <div key={vehicle.id} className="p-4 space-y-4 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-4">
                            <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 relative">
                              {vehicle.images?.[0] ? (
                                <img 
                                  src={applyWatermark(vehicle.images?.[0] || 'https://images.unsplash.com/photo-1542362567-b052fd119971?auto=format&fit=crop&q=80', settings?.watermarkPublicId || (settings?.logoUrl ? getPublicIdFromUrl(settings.logoUrl) : null), settings?.watermarkEnabled)} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Car size={24} />
                                </div>
                              )}
                              <button
                                onClick={() => toggleFeatured(vehicle.id, vehicle.featured)}
                                className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur-md bg-white/60 transition-all ${vehicle.featured ? 'text-amber-500' : 'text-gray-400'}`}
                              >
                                <Star size={14} fill={vehicle.featured ? "currentColor" : "none"} />
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{vehicle.model}</h4>
                                <StatusBadge status={vehicle.status} />
                              </div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">{vehicle.version || vehicle.type}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-black text-lg text-[#2271B1]">{Number(vehicle.price).toLocaleString()}€</span>
                                <div className="flex gap-1">
                                  <Heart size={14} className={vehicle.favoritesCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-200'} />
                                  <span className="text-[10px] font-black text-gray-600">{vehicle.favoritesCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl">
                            <div className="text-center border-r border-gray-200">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Année</p>
                              <p className="text-xs font-black text-gray-700">{vehicle.year}</p>
                            </div>
                            <div className="text-center border-r border-gray-200">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Énergie</p>
                              <p className="text-xs font-black text-gray-700">{vehicle.fuel}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Km</p>
                              <p className="text-xs font-black text-gray-700 truncate">{Number(vehicle.mileage).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
                            >
                              <Edit size={14} /> Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Single brand flat list */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Véhicule</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Favoris</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Année</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carburant</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kilométrage</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {vehicle.images?.[0] ? (
                            <img 
                              src={applyWatermark(vehicle.images[0], settings?.watermarkPublicId, settings?.watermarkEnabled)} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Car size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFeatured(vehicle.id, vehicle.featured)}
                              className={`transition-all ${vehicle.featured ? 'text-amber-500' : 'text-gray-200 hover:text-amber-300'}`}
                              title={vehicle.featured ? "Retirer la mise en avant" : "Mettre en avant (TOP)"}
                            >
                              <Star size={16} fill={vehicle.featured ? "currentColor" : "none"} />
                            </button>
                            <div className="font-bold text-gray-900 text-sm">{vehicle.brand} {vehicle.model}</div>
                          </div>
                          {vehicle.version && <div className="text-[10px] text-gray-400 font-medium ml-6">{vehicle.version}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">{vehicle.type || '-'}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <Heart size={14} className={vehicle.favoritesCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-200'} />
                        <span className="text-[10px] font-black text-gray-600">{vehicle.favoritesCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">{vehicle.year}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">{vehicle.fuel}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">{Number(vehicle.mileage).toLocaleString()} km</td>
                    <td className="px-5 py-4 font-bold text-gray-900 text-sm">{Number(vehicle.price).toLocaleString()} €</td>
                    <td className="px-5 py-4"><StatusBadge status={vehicle.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)} className="p-2 text-[#14213D]/40 hover:text-[#FCA311] hover:bg-[#14213D] rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredVehicles.map(vehicle => (
              <div key={vehicle.id} className="p-4 space-y-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 relative">
                    {vehicle.images?.[0] ? (
                      <img 
                        src={applyWatermark(vehicle.images[0], settings?.watermarkPublicId, settings?.watermarkEnabled)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Car size={24} />
                      </div>
                    )}
                    <button
                      onClick={() => toggleFeatured(vehicle.id, vehicle.featured)}
                      className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur-md bg-white/60 transition-all ${vehicle.featured ? 'text-amber-500' : 'text-gray-400'}`}
                    >
                      <Star size={14} fill={vehicle.featured ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{vehicle.brand} {vehicle.model}</h4>
                      <StatusBadge status={vehicle.status} />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">{vehicle.version || vehicle.type}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg text-[#2271B1]">{Number(vehicle.price).toLocaleString()}€</span>
                      <div className="flex gap-1">
                        <Heart size={14} className={vehicle.favoritesCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-200'} />
                        <span className="text-[10px] font-black text-gray-600">{vehicle.favoritesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl">
                  <div className="text-center border-r border-gray-200">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Année</p>
                    <p className="text-xs font-black text-gray-700">{vehicle.year}</p>
                  </div>
                  <div className="text-center border-r border-gray-200">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Énergie</p>
                    <p className="text-xs font-black text-gray-700">{vehicle.fuel}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Km</p>
                    <p className="text-xs font-black text-gray-700 truncate">{Number(vehicle.mileage).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
                  >
                    <Edit size={14} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModal && (
        <CategoryModal
          category={catModal === 'new' ? null : catModal}
          onClose={() => setCatModal(null)}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
};

export default VehiclesList;
