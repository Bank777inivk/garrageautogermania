import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import uploadToCloudinary from '@shared/cloudinary/config';
import {
    ImageIcon,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Link as LinkIcon,
    Upload,
    Loader2,
    X,
    Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        imageUrl: '',
        link: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bannerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBanners(bannerList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
        if (!formData.imageUrl) return toast.error("Une image est requise");

        try {
            await addDoc(collection(db, 'banners'), {
                ...formData,
                order: banners.length,
                createdAt: serverTimestamp()
            });
            toast.success("Bannière ajoutée");
            setIsModalOpen(false);
            setFormData({ title: '', subtitle: '', imageUrl: '', link: '', order: 0, isActive: true });
        } catch (error) {
            toast.error("Erreur d'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette bannière ?")) {
            await deleteDoc(doc(db, 'banners', id));
            toast.success("Bannière supprimée");
        }
    };

    const handleToggleActive = async (banner) => {
        await updateDoc(doc(db, 'banners', banner.id), {
            isActive: !banner.isActive
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <ImageIcon className="mr-3 text-blue-500" size={28} /> Gestion des Bannières
                    </h1>
                    <p className="text-sm text-gray-500">Gérez les images du carrousel d'accueil de l'application client.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-2.5 bg-[#2271B1] text-white rounded font-bold hover:bg-[#135e96] transition-all shadow-sm"
                >
                    <Plus className="mr-2" size={18} /> Ajouter une Bannière
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {banners.map((banner, index) => (
                    <div key={banner.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row group">
                        <div className="w-full md:w-80 h-48 bg-gray-100 relative overflow-hidden shrink-0 border-r border-gray-50">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                <button onClick={() => window.open(banner.imageUrl, '_blank')} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900">{banner.title || 'Sans titre'}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${banner.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                        >
                                            {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>
                                {banner.link && (
                                    <div className="flex items-center gap-2 mt-4 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                                        <LinkIcon size={14} />
                                        {banner.link}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-6">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Position : #{index + 1}</span>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:bg-gray-50 rounded disabled:opacity-30" disabled={index === 0}><MoveUp size={16} /></button>
                                    <button className="p-2 text-gray-400 hover:bg-gray-50 rounded disabled:opacity-30" disabled={index === banners.length - 1}><MoveDown size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <ImageIcon className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-400 font-medium italic">Aucune bannière configurée.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Ajouter une bannière</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Titre</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="ex: Arrivage BMW M5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sous-titre</label>
                                    <textarea
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                        placeholder="Description courte..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lien (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="ex: /catalogue"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative min-h-[220px]">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                                        ) : (
                                            <>
                                                <div className="p-4 bg-white rounded-full shadow-sm text-gray-400">
                                                    {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">Format suggéré: 1920x800px</p>
                                            </>
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-10">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
                                    <button type="submit" disabled={isUploading} className="flex-1 px-4 py-3 bg-[#2271B1] text-white rounded-xl font-bold hover:bg-[#135e96] shadow-lg disabled:opacity-50">
                                        {isUploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Ajouter'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
