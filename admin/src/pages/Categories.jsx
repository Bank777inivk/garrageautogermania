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
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Tags className="mr-2" size={24} /> Gestion des Catégories / Marques
                    </h1>
                    <p className="text-sm text-gray-500">Ajoutez et gérez les marques de véhicules disponibles sur le catalogue.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center px-6 py-2.5 bg-[#2271B1] text-white rounded font-bold hover:bg-[#135e96] transition-all shadow-sm"
                >
                    <Plus className="mr-2" size={18} /> Nouvelle Catégorie
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une marque..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-video bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                {category.imageUrl ? (
                                    <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Tags className="text-gray-300" size={48} />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleOpenModal(category)}
                                        className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-white border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 text-center uppercase tracking-wider">{category.name}</h3>
                            </div>
                        </div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            Aucune catégorie trouvée.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nom de la marque</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="ex: Mercedes-Benz"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image / Logo de la marque</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="h-24 w-auto object-contain" />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                                                {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">Cliquez pour télécharger le logo</p>
                                        </>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 px-4 py-3 bg-[#2271B1] text-white rounded font-bold hover:bg-[#135e96] transition-all shadow-md disabled:opacity-50"
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
