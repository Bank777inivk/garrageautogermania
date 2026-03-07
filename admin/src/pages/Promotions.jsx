import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
    Percent,
    Plus,
    Trash2,
    Edit2,
    Calendar,
    Tag,
    Loader2,
    X,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discount: '',
        type: 'percentage', // percentage or fixed
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        const q = query(collection(db, 'promotions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPromotions(promos);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = (promo = null) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                code: promo.code,
                discount: promo.discount,
                type: promo.type,
                startDate: promo.startDate,
                endDate: promo.endDate,
                isActive: promo.isActive
            });
        } else {
            setEditingPromo(null);
            setFormData({
                code: '',
                discount: '',
                type: 'percentage',
                startDate: '',
                endDate: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPromo) {
                await updateDoc(doc(db, 'promotions', editingPromo.id), {
                    ...formData,
                    discount: Number(formData.discount),
                    updatedAt: serverTimestamp()
                });
                toast.success("Promotion mise à jour");
            } else {
                await addDoc(collection(db, 'promotions'), {
                    ...formData,
                    discount: Number(formData.discount),
                    createdAt: serverTimestamp()
                });
                toast.success("Promotion créée");
            }
            handleCloseModal();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette promotion ?")) {
            try {
                await deleteDoc(doc(db, 'promotions', id));
                toast.success("Promotion supprimée");
            } catch (error) {
                toast.error("Erreur de suppression");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Percent className="mr-3 text-orange-500" size={28} /> Gestion des Promotions
                    </h1>
                    <p className="text-sm text-gray-500">Créez des codes promo et des remises spéciales.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-6 py-2.5 bg-[#2271B1] text-white rounded font-bold hover:bg-[#135e96] transition-all shadow-sm"
                >
                    <Plus className="mr-2" size={18} /> Nouvelle Promotion
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => (
                    <div key={promo.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-2 h-full ${promo.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />

                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                <Tag size={20} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(promo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(promo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 font-mono tracking-wider">{promo.code}</h3>
                            <p className="text-2xl font-black text-orange-500">
                                {promo.type === 'percentage' ? `-${promo.discount}%` : `-${promo.discount}€`}
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
                            <div className="flex items-center text-xs text-gray-500 gap-2">
                                <Calendar size={14} />
                                <span>Du {promo.startDate} au {promo.endDate}</span>
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                {promo.isActive ? '• Active' : '• Inactive'}
                            </div>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Percent className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-medium italic">Aucune promotion active actuellement.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingPromo ? 'Modifier la promotion' : 'Nouvelle promotion'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Code Promo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    placeholder="ex: SOLDES2024"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Valeur</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Fixe (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date Début</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Promotion active</label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3 border border-gray-300 rounded font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#2271B1] text-white rounded font-bold hover:bg-[#135e96] shadow-md">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;
