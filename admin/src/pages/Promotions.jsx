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
        <div className="space-y-8 pb-20 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Percent className="text-orange-500" size={24} /> Gestion des Promotions
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">Gérez vos codes promo et remises exclusives.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" size={18} />
                    <span>Nouvelle Promotion</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {promotions.map((promo) => (
                    <div key={promo.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 hover:shadow-orange-600/10 transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-2 h-full opacity-60 ${promo.isActive ? 'bg-orange-500' : 'bg-slate-200'}`} />

                        <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <Tag size={24} />
                            </div>
                            <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                <button onClick={() => handleOpenModal(promo)} className="p-3 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-100 transition-all active:scale-90" title="Modifier"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(promo.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-100 transition-all active:scale-90" title="Supprimer"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-none">Code Promo</span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{promo.code}</h3>
                            </div>
                            <p className="text-4xl font-black text-slate-900 leading-none">
                                {promo.type === 'percentage' ? (
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-orange-500">-{promo.discount}</span>
                                        <span className="text-xl">%</span>
                                    </span>
                                ) : (
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-orange-500">-{promo.discount}</span>
                                        <span className="text-xl">€</span>
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Calendar size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Validité</p>
                                    <p className="text-[10px] font-bold text-slate-900 uppercase">Du {promo.startDate} au {promo.endDate}</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${promo.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${promo.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                {promo.isActive ? 'Active' : 'Archivée'}
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
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {editingPromo ? 'Modifier Promo' : 'Nouvelle Promo'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Promo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-slate-900 placeholder:text-slate-300 transition-all uppercase"
                                    placeholder="ex: SOLDES2024"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valeur</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-slate-900 placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-slate-900 appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Fixe (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Début</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-slate-900 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-black text-slate-900 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-2 px-1">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </label>
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Promotion active</span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95">Annuler</button>
                                <button type="submit" className="flex-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 shadow-xl shadow-slate-200 transition-all active:scale-95">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;
