import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import uploadToCloudinary from '@shared/cloudinary/config';
import {
    Plus,
    Trash2,
    Edit2,
    Search,
    Image as ImageIcon,
    Upload,
    Loader2,
    Tags,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', imageUrl: '' });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(cats);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, imageUrl: category.imageUrl });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', imageUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', imageUrl: '' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setFormData({ ...formData, imageUrl: url });
            toast.success("Image téléchargée");
        } catch (error) {
            toast.error("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;
        try {
            if (editingCategory) {
                await updateDoc(doc(db, 'categories', editingCategory.id), {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
                toast.success("Catégorie mise à jour");
            } else {
                await addDoc(collection(db, 'categories'), {
                    ...formData,
                    createdAt: serverTimestamp()
                });
                toast.success("Catégorie ajoutée");
            }
            handleCloseModal();
        } catch (error) {
            toast.error("Une erreur est survenue");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
            try {
                await deleteDoc(doc(db, 'categories', id));
                toast.success("Catégorie supprimée");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#14213D]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-[#14213D] flex items-center gap-3 uppercase tracking-tight">
                        <Tags className="text-[#FCA311]" size={24} /> Marques & Catégories
                    </h1>
                    <p className="text-[10px] text-[#14213D]/40 font-black mt-2 uppercase tracking-[0.2em]">Gérez les marques disponibles sur le catalogue.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/10 active:scale-95 group border-b-4 border-[#FCA311]/20"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" size={18} />
                    <span>Nouvelle Marque</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white border border-[#E5E5E5] rounded-[2rem] overflow-hidden shadow-sm">
                <div className="px-8 py-5 border-b border-[#E5E5E5] flex items-center gap-4">
                    <Search className="text-[#FCA311]" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une marque..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[11px] font-black text-[#14213D] placeholder:text-[#14213D]/20 uppercase tracking-widest"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-[#14213D]/30 hover:text-[#14213D] transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-8">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="group border border-[#E5E5E5] rounded-[1.5rem] overflow-hidden hover:border-[#FCA311] hover:shadow-xl hover:shadow-[#FCA311]/10 transition-all duration-300">
                            <div className="aspect-square bg-[#14213D]/3 relative overflow-hidden flex items-center justify-center p-6">
                                {category.imageUrl ? (
                                    <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Tags className="text-[#14213D]/10" size={48} />
                                )}
                                <div className="absolute inset-0 bg-[#14213D]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenModal(category)}
                                        className="p-3 bg-[#FCA311] text-[#14213D] rounded-xl hover:scale-110 transition-transform shadow-lg"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-3 bg-white text-red-500 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-white border-t border-[#E5E5E5]">
                                <h3 className="font-black text-[#14213D] text-center text-[10px] uppercase tracking-widest">{category.name}</h3>
                            </div>
                        </div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-20 text-center text-[#14213D]/30">
                            <Tags className="mx-auto mb-4 text-[#14213D]/10" size={48} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aucune marque trouvée.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#14213D]/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-8 border-b border-[#E5E5E5] flex items-center justify-between">
                            <h2 className="text-lg font-black text-[#14213D] uppercase tracking-tight">
                                {editingCategory ? 'Modifier la marque' : 'Nouvelle Marque'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 text-[#14213D]/30 hover:text-[#14213D] transition-colors bg-[#14213D]/5 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Nom de la marque *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] outline-none text-[#14213D] font-black placeholder:text-[#14213D]/20 transition-all"
                                    placeholder="ex: Mercedes-Benz"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">Logo / Image</label>
                                <div className="border-2 border-dashed border-[#E5E5E5] hover:border-[#FCA311] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-[#14213D]/2 cursor-pointer relative transition-colors min-h-[160px]">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="h-24 w-auto object-contain" />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-white rounded-2xl shadow-sm text-[#14213D]/30">
                                                {isUploading ? <Loader2 className="animate-spin text-[#FCA311]" size={28} /> : <Upload size={28} />}
                                            </div>
                                            <p className="text-[10px] text-[#14213D]/30 font-black uppercase tracking-widest">Cliquer pour télécharger</p>
                                        </>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-4 border border-[#E5E5E5] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#14213D]/50 hover:bg-[#14213D]/5 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 px-6 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-[#14213D]/20 disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editingCategory ? 'Mettre à jour' : 'Ajouter')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
