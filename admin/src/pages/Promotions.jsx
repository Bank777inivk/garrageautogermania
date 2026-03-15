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
        type: 'percentage',
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
            setFormData({ code: promo.code, discount: promo.discount, type: promo.type, startDate: promo.startDate, endDate: promo.endDate, isActive: promo.isActive });
        } else {
            setEditingPromo(null);
            setFormData({ code: '', discount: '', type: 'percentage', startDate: '', endDate: '', isActive: true });
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
                <Loader2 className="animate-spin text-[#14213D]" size={32} />
            </div>
        );
    }

    const inputClass = "w-full px-6 py-4 bg-white border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] outline-none font-black text-[#14213D] placeholder:text-[#14213D]/20 transition-all";
    const labelClass = "text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1";

    return (
        <div className="space-y-8 pb-20 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-[#14213D] flex items-center gap-3 uppercase tracking-tight">
                        <Percent className="text-[#FCA311]" size={24} /> Codes Promotionnels
                    </h1>
                    <p className="text-[10px] text-[#14213D]/40 font-black mt-2 uppercase tracking-[0.2em]">Gérez vos codes promo et remises exclusives.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/10 active:scale-95 group border-b-4 border-[#FCA311]/20"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" size={18} />
                    <span>Nouvelle Promotion</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {promotions.map((promo) => (
                    <div key={promo.id} className="bg-white border border-[#E5E5E5] rounded-[2rem] p-10 shadow-sm hover:shadow-xl hover:shadow-[#14213D]/5 transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-1.5 h-full ${promo.isActive ? 'bg-[#FCA311]' : 'bg-[#E5E5E5]'}`} />

                        <div className="flex justify-between items-start mb-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${promo.isActive ? 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20' : 'bg-[#14213D]/5 text-[#14213D]/30 border-[#14213D]/5'} group-hover:scale-110 transition-transform duration-500`}>
                                <Tag size={24} />
                            </div>
                            <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                <button onClick={() => handleOpenModal(promo)} className="p-3 bg-[#14213D]/5 text-[#14213D] hover:bg-[#14213D] hover:text-[#FCA311] rounded-xl border border-[#14213D]/5 transition-all active:scale-90">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(promo.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-100 transition-all active:scale-90">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#14213D] text-[#FCA311] px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Code Promo</span>
                                <h3 className="text-2xl font-black text-[#14213D] tracking-tighter uppercase">{promo.code}</h3>
                            </div>
                            <p className="text-5xl font-black text-[#14213D] leading-none tracking-tighter">
                                <span className="text-[#FCA311]">-{promo.discount}</span>
                                <span className="text-2xl text-[#14213D]/30">{promo.type === 'percentage' ? '%' : '€'}</span>
                            </p>
                        </div>

                        <div className="mt-10 pt-8 border-t border-[#E5E5E5] space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#14213D]/5 rounded-xl text-[#FCA311]">
                                    <Calendar size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-[#14213D]/30 uppercase tracking-widest">Validité</p>
                                    <p className="text-[10px] font-black text-[#14213D] uppercase tracking-tight">Du {promo.startDate} au {promo.endDate}</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${promo.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-[#14213D]/5 text-[#14213D]/30 border-[#14213D]/5'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${promo.isActive ? 'bg-green-500 animate-pulse' : 'bg-[#14213D]/20'}`} />
                                {promo.isActive ? 'Active' : 'Archivée'}
                            </div>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-24 text-center bg-[#14213D]/2 rounded-[2rem] border-2 border-dashed border-[#14213D]/10">
                        <Percent className="mx-auto text-[#14213D]/10 mb-6" size={56} />
                        <p className="text-[10px] font-black text-[#14213D]/30 uppercase tracking-widest">Aucune promotion active actuellement.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#14213D]/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between">
                            <h2 className="text-lg font-black text-[#14213D] uppercase tracking-tight">
                                {editingPromo ? 'Modifier Promo' : 'Nouvelle Promo'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 text-[#14213D]/30 hover:text-[#14213D] bg-[#14213D]/5 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Code Promo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className={inputClass + " uppercase"}
                                    placeholder="ex: SOLDES2024"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Valeur</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className={inputClass + " cursor-pointer appearance-none"}
                                    >
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Fixe (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Date Début</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Date Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className={inputClass}
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
                                    <div className="w-11 h-6 bg-[#E5E5E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FCA311]"></div>
                                </label>
                                <span className="text-[10px] font-black text-[#14213D] uppercase tracking-widest">Promotion active</span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-6 py-4 border border-[#E5E5E5] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#14213D]/50 hover:bg-[#14213D]/5 transition-all">Annuler</button>
                                <button type="submit" className="flex-1 px-6 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#14213D]/20">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;
