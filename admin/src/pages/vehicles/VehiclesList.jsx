import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, addDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import useVehicleStore from '@shared/store/useVehicleStore';
import uploadToCloudinary from '@shared/cloudinary/config';
import {
  Plus, Edit, Trash2, Search, Car, Tags, ChevronDown, ChevronRight,
  Loader2, Image as ImageIcon, X, Upload, Star, Eye, EyeOff, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import useBrands from '@shared/hooks/useBrands';
import BrandSelect from '@shared/components/BrandSelect';

// =========================================================
// Status Badge
// =========================================================
const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-green-100 text-green-700 border border-green-200',
    sold: 'bg-red-100 text-red-700 border border-red-200',
    reserved: 'bg-amber-100 text-amber-700 border border-amber-200',
  };
  const labels = { available: 'Disponible', sold: 'Vendu', reserved: 'Réservé' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${styles[status] || styles.available}`}>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{category ? 'Modifier la marque' : 'Nouvelle marque'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Nom de la marque</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus:ring-2 focus:ring-[#2271B1]/30 focus:border-[#2271B1] outline-none text-sm font-bold"
              placeholder="ex: BMW, Mercedes, Audi..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Logo de la marque</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-all relative">
              {imageUrl ? (
                <img src={imageUrl} alt="logo" className="h-20 object-contain" />
              ) : uploading ? (
                <Loader2 className="animate-spin text-[#2271B1]" size={32} />
              ) : (
                <>
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 font-medium">Cliquer pour télécharger</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600">Annuler</button>
            <button
              onClick={() => { if (!name.trim()) return toast.error('Nom requis'); onSave({ name: name.trim(), image: imageUrl }); }}
              className="flex-1 py-2.5 bg-[#2271B1] text-white rounded-lg text-sm font-bold hover:bg-[#135e96] transition-all"
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
  const { vehicles, fetchVehicles, deleteVehicle, loading } = useVehicleStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or category name
  const [expandedBrands, setExpandedBrands] = useState({});
  const { brands } = useBrands();
  const [catModal, setCatModal] = useState(null); // null | 'new' | category obj
  const [showCatPanel, setShowCatPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Car className="text-[#2271B1]" size={28} />
            Catalogue Véhicules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalVehicles} véhicules •{' '}
            <span className="text-green-600 font-bold">{availableCount} disponibles</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCatPanel(!showCatPanel)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-bold transition-all ${showCatPanel ? 'bg-[#2271B1] text-white border-[#2271B1]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Tags size={18} />
            Gestion Marques {showCatPanel ? <X size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2271B1] text-white rounded-lg font-bold text-sm hover:bg-[#135e96] transition-all shadow-md"
          >
            <Plus size={18} /> Ajouter un véhicule
          </button>
        </div>
      </div>

      {/* Category Management Panel */}
      {showCatPanel && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Tags size={18} className="text-[#2271B1]" /> Marques & Catégories ({brands.length})
            </h3>
            <button
              onClick={() => setCatModal('new')}
              className="flex items-center gap-2 text-sm font-bold text-[#2271B1] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={16} /> Nouvelle marque
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
                    className="p-1 text-[#2271B1] hover:bg-blue-50 rounded"
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par marque, modèle, version..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2271B1]/30 focus:border-[#2271B1] outline-none text-sm bg-gray-50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'available', 'reserved', 'sold'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${statusFilter === s ? 'bg-[#2271B1] text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {s === 'all' ? 'Tous' : s === 'available' ? 'Disponibles' : s === 'reserved' ? 'Réservés' : 'Vendus'}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter Dropdown */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
          >
            Toutes les marques ({vehicles.length})
          </button>
        </div>
        <div className="flex-1 max-w-xs">
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
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-all bg-white"
          >
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {/* Vehicle List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#2271B1]" size={36} />
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
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Véhicule</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
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
                                    <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <Car size={18} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">{vehicle.model}</div>
                                  {vehicle.version && <div className="text-[10px] text-gray-400 font-medium">{vehicle.version}</div>}
                                  {vehicle.featured && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                      <Star size={8} fill="currentColor" /> Mis en avant
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-600 font-medium">{vehicle.type || '-'}</td>
                            <td className="px-5 py-4 text-xs text-gray-600 font-medium">{vehicle.year}</td>
                            <td className="px-5 py-4 text-xs text-gray-600 font-medium">{vehicle.fuel}</td>
                            <td className="px-5 py-4 text-xs text-gray-600 font-medium">{Number(vehicle.mileage).toLocaleString()} km</td>
                            <td className="px-5 py-4">
                              <span className="font-bold text-gray-900 text-sm">{Number(vehicle.price).toLocaleString()} €</span>
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
                                  className="p-2 text-[#2271B1] hover:bg-blue-50 rounded-lg transition-colors"
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
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Single brand flat list */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Véhicule</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
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
                          <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Car size={18} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{vehicle.brand} {vehicle.model}</div>
                        {vehicle.version && <div className="text-[10px] text-gray-400 font-medium">{vehicle.version}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">{vehicle.type || '-'}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{vehicle.year}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{vehicle.fuel}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{Number(vehicle.mileage).toLocaleString()} km</td>
                  <td className="px-5 py-4 font-bold text-gray-900 text-sm">{Number(vehicle.price).toLocaleString()} €</td>
                  <td className="px-5 py-4"><StatusBadge status={vehicle.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)} className="p-2 text-[#2271B1] hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
