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
        <div className="space-y-8 pb-20 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                        <ImageIcon className="text-blue-600" size={24} /> Gestion des Bannières
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">Gérez les images du carrousel d'accueil.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" size={18} />
                    <span>Ajouter une Bannière</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {banners.map((banner, index) => (
                    <div key={banner.id} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row group transition-all duration-500 hover:shadow-blue-600/10">
                        <div className="w-full md:w-[400px] h-64 md:h-auto bg-slate-100 relative overflow-hidden shrink-0 border-r border-slate-50">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-all duration-500 flex items-center justify-center">
                                <button onClick={() => window.open(banner.imageUrl, '_blank')} className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110 active:scale-90 border border-white/30 shadow-2xl">
                                    <Eye size={24} />
                                </button>
                            </div>
                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                #{index + 1}
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{banner.title || 'Sans titre'}</h3>
                                        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">{banner.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 shadow-sm ${banner.isActive ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                        >
                                            {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all active:scale-90">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                {banner.link && (
                                    <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 bg-blue-50/50 w-fit px-4 py-2 rounded-xl border border-blue-100/50 uppercase tracking-widest">
                                        <LinkIcon size={14} />
                                        <span>Lien : {banner.link}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-8 mt-10">
                                <div className="flex items-center gap-4">
                                    <button
                                        className="p-3 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-100 transition-all active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
                                        disabled={index === 0}
                                    >
                                        <MoveUp size={18} />
                                    </button>
                                    <button
                                        className="p-3 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-100 transition-all active:scale-90 disabled:opacity-20 disabled:pointer-events-none"
                                        disabled={index === banners.length - 1}
                                    >
                                        <MoveDown size={18} />
                                    </button>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-40">Ordre d'affichage</span>
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
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ajouter une bannière</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-8">
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
