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
        await updateDoc(doc(db, 'banners', banner.id), { isActive: !banner.isActive });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#14213D]" size={32} />
        </div>
    );

    const inputClass = "w-full px-5 py-4 bg-white border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] outline-none text-[#14213D] font-black placeholder:text-[#14213D]/20 transition-all text-sm";
    const labelClass = "text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest";

    return (
        <div className="space-y-8 pb-20 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-[#14213D] flex items-center gap-3 uppercase tracking-tight">
                        <ImageIcon className="text-[#FCA311]" size={24} /> Carrousel Visuel
                    </h1>
                    <p className="text-[10px] text-[#14213D]/40 font-black mt-2 uppercase tracking-[0.2em]">Gérez les images du carrousel d'accueil.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/10 active:scale-95 group border-b-4 border-[#FCA311]/20"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" size={18} />
                    <span>Ajouter une Bannière</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {banners.map((banner, index) => (
                    <div key={banner.id} className="bg-white border border-[#E5E5E5] rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col md:flex-row group transition-all duration-500 hover:border-[#FCA311] hover:shadow-xl hover:shadow-[#14213D]/5">
                        <div className="w-full md:w-[400px] h-64 md:h-auto bg-[#14213D] relative overflow-hidden shrink-0">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                            <div className="absolute inset-0 bg-[#14213D]/40 group-hover:bg-[#14213D]/60 transition-all duration-500 flex items-center justify-center">
                                <button onClick={() => window.open(banner.imageUrl, '_blank')} className="p-4 bg-[#FCA311]/20 backdrop-blur-xl rounded-2xl text-[#FCA311] opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110 border border-[#FCA311]/30">
                                    <Eye size={24} />
                                </button>
                            </div>
                            <div className="absolute top-6 left-6 px-4 py-2 bg-[#14213D]/60 backdrop-blur-md border border-white/10 rounded-xl text-[#FCA311] text-[10px] font-black uppercase tracking-widest">
                                #{index + 1}
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-[#14213D] tracking-tighter leading-tight uppercase">{banner.title || 'Sans titre'}</h3>
                                        <p className="text-sm text-[#14213D]/40 font-black leading-relaxed">{banner.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${banner.isActive ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-[#14213D]/5 text-[#14213D]/30 border-[#14213D]/5 hover:bg-[#14213D]/10'}`}
                                        >
                                            {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                {banner.link && (
                                    <div className="flex items-center gap-3 text-[10px] font-black text-[#FCA311] bg-[#14213D]/5 w-fit px-4 py-2 rounded-xl border border-[#14213D]/5 uppercase tracking-widest">
                                        <LinkIcon size={14} />
                                        <span>{banner.link}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-8 mt-10">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="p-3 text-[#14213D]/30 hover:bg-[#14213D] hover:text-[#FCA311] rounded-xl border border-[#E5E5E5] transition-all disabled:opacity-20 disabled:pointer-events-none"
                                        disabled={index === 0}
                                    >
                                        <MoveUp size={18} />
                                    </button>
                                    <button
                                        className="p-3 text-[#14213D]/30 hover:bg-[#14213D] hover:text-[#FCA311] rounded-xl border border-[#E5E5E5] transition-all disabled:opacity-20 disabled:pointer-events-none"
                                        disabled={index === banners.length - 1}
                                    >
                                        <MoveDown size={18} />
                                    </button>
                                </div>
                                <span className="text-[9px] font-black text-[#14213D]/20 uppercase tracking-[0.2em]">Ordre d'affichage</span>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="py-24 text-center bg-[#14213D]/2 rounded-[2.5rem] border-2 border-dashed border-[#14213D]/10">
                        <ImageIcon className="mx-auto text-[#14213D]/10 mb-6" size={64} />
                        <p className="text-[10px] font-black text-[#14213D]/30 uppercase tracking-widest">Aucune bannière configurée.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#14213D]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between">
                            <h2 className="text-lg font-black text-[#14213D] uppercase tracking-tight">Ajouter une bannière</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#14213D]/30 hover:text-[#14213D] bg-[#14213D]/5 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Titre</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={inputClass}
                                        placeholder="ex: Arrivage BMW M5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Sous-titre</label>
                                    <textarea
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className={inputClass + " h-24 resize-none"}
                                        placeholder="Description courte..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Lien (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className={inputClass}
                                        placeholder="ex: /catalogue"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Image *</label>
                                    <div className="border-2 border-dashed border-[#E5E5E5] hover:border-[#FCA311] rounded-2xl p-6 flex flex-col items-center justify-center gap-4 bg-[#14213D]/2 cursor-pointer relative min-h-[220px] transition-colors">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                                        ) : (
                                            <>
                                                <div className="p-4 bg-white rounded-2xl shadow-sm text-[#14213D]/30">
                                                    {isUploading ? <Loader2 className="animate-spin text-[#FCA311]" size={28} /> : <Upload size={28} />}
                                                </div>
                                                <p className="text-[10px] text-[#14213D]/30 font-black uppercase tracking-widest">Format: 1920x800px</p>
                                            </>
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-5 py-4 border border-[#E5E5E5] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#14213D]/50 hover:bg-[#14213D]/5 transition-all">Annuler</button>
                                    <button type="submit" disabled={isUploading} className="flex-1 px-5 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50">
                                        {isUploading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Ajouter'}
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
