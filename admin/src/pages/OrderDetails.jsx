import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import {
    Shield,
    Box,
    Truck,
    ArrowLeft,
    Package,
    User,
    MapPin,
    CreditCard,
    FileText,
    Download,
    Printer,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    Mail,
    Phone,
    Building2,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@shared/store/useAuthStore';
import { generateOrderPDF, generateContractPDF, generatePaymentReceiptPDF, generateDeliverySlipPDF } from '@shared/utils/generateAdminDocuments';

const OrderDetails = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.email === 'noellinemous@gmail.com';
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Order
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);

                // Fetch Settings
                const settingsRef = doc(db, 'settings', 'documents');
                const settingsSnap = await getDoc(settingsRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Commande introuvable");
                    navigate('/orders');
                }

                if (settingsSnap.exists()) {
                    setSettings(settingsSnap.data());
                }
            } catch (error) {
                toast.error("Erreur lors de la récupération");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await updateDoc(doc(db, 'orders', id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });

            // Automatically update associated vehicles statuses
            if (order && order.items && order.items.length > 0) {
                let vehicleStatus = null;
                // 'logistics' -> Logistique & Préparation
                if (newStatus === 'logistics') {
                    vehicleStatus = 'reserved';
                }
                // 'delivered' or 'completed' -> Livré au client
                else if (newStatus === 'delivered' || newStatus === 'completed') {
                    vehicleStatus = 'sold';
                }

                if (vehicleStatus) {
                    const vehiclePromises = order.items.map(item => {
                        if (item.id) {
                            return updateDoc(doc(db, 'vehicles', item.id), {
                                status: vehicleStatus,
                                updatedAt: serverTimestamp()
                            });
                        }
                        return Promise.resolve();
                    });

                    await Promise.all(vehiclePromises);
                }
            }

            setOrder(prev => ({ ...prev, status: newStatus }));
            toast.success("Statut mis à jour");
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!isSuperAdmin) {
            toast.error("Action non autorisée");
            return;
        }

        if (window.confirm(`ATTENTION : Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT la commande #${order.orderNumber} ? Cette action supprimera également l'accès du client à ce dossier.`)) {
            setUpdating(true);
            try {
                await deleteDoc(doc(db, 'orders', id));
                toast.success("Commande supprimée avec succès");
                navigate('/orders');
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("Erreur lors de la suppression");
            } finally {
                setUpdating(false);
            }
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'validation': return { label: 'Validation', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Shield };
            case 'pending': return { label: 'Paiement', color: 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20', icon: CreditCard };
            case 'logistics': return { label: 'Logistique', color: 'bg-[#14213D]/5 text-[#14213D] border-[#14213D]/10', icon: Box };
            case 'transit': return { label: 'En Route', color: 'bg-[#14213D]/5 text-[#14213D] border-[#14213D]/10', icon: Truck };
            case 'concierge': return { label: 'Arrivée', color: 'bg-[#14213D]/5 text-[#14213D] border-[#14213D]/10', icon: MapPin };
            case 'delivered': return { label: 'Livré', color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2 };
            case 'cancelled': return { label: 'Annulée', color: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle };
            default: return { label: status, color: 'bg-gray-50 text-gray-500 border-gray-100', icon: FileText };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#14213D]" size={32} />
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <button
                    onClick={() => navigate(order?.userId ? "/orders?userId=" + order.userId : "/orders")}
                    className="flex items-center text-[10px] md:text-xs font-black text-[#14213D]/40 hover:text-[#14213D] transition-all uppercase tracking-[0.2em] bg-white border border-[#E5E5E5] px-6 py-4 rounded-2xl shadow-sm"
                >
                    <ArrowLeft size={16} className="mr-3 text-[#FCA311]" /> Retour au Flux
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => generateOrderPDF(order, settings)}
                        className="flex-1 sm:flex-none flex items-center justify-center px-6 py-4 border border-[#E5E5E5] rounded-2xl text-[10px] font-black text-[#14213D] hover:bg-[#14213D] hover:text-[#FCA311] transition-all uppercase tracking-widest shadow-sm group"
                    >
                        <Printer size={16} className="mr-3 text-[#FCA311] group-hover:text-[#FCA311]" /> Exporter Bon Commande
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Order Header */}
                    <div className="bg-[#14213D] p-10 md:p-12 rounded-[2.5rem] shadow-2xl shadow-[#14213D]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-b-8 border-[#FCA311]">
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight uppercase">Dossier #{order.orderNumber}</h1>
                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusInfo.color} flex items-center shadow-lg backdrop-blur-md`}>
                                    <statusInfo.icon size={14} className="mr-2" /> {statusInfo.label}
                                </span>
                            </div>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                                Enregistré le {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                        <div className="w-full sm:w-auto sm:text-right">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Solde Total TTC</p>
                            <h2 className="text-4xl md:text-5xl font-black text-[#FCA311] tracking-tighter">{(order.total || 0).toLocaleString()}€</h2>
                        </div>
                    </div>

                    {/* Items Tray */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-900/10 overflow-hidden">
                        <div className="px-8 py-6 bg-white border-b border-[#E5E5E5]">
                            <h3 className="text-[10px] font-black text-[#14213D] uppercase tracking-[0.3em] flex items-center">
                                <Package size={18} className="mr-4 text-[#FCA311]" /> Liste des Véhicules
                            </h3>
                        </div>
                        <div className="divide-y divide-[#E5E5E5]">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-10 flex flex-col sm:flex-row items-center gap-8 group hover:bg-[#14213D]/5 transition-all duration-500">
                                    <div className="w-full sm:w-40 h-28 bg-[#14213D] rounded-[1.5rem] overflow-hidden flex-shrink-0 border-2 border-[#14213D] shadow-xl group-hover:rotate-1 transition-transform">
                                        <img src={item.image} alt={item.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="font-black text-[#14213D] text-2xl tracking-tighter uppercase mb-1">{item.brand} {item.model}</h4>
                                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4">
                                            <p className="text-[9px] text-[#14213D]/30 font-black uppercase tracking-widest">Réf Système: {item.id}</p>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
                                        <p className="text-3xl font-black text-[#14213D]">{(item.price || 0).toLocaleString()}€</p>
                                        <p className="text-[9px] text-[#FCA311] font-black uppercase tracking-widest mt-1">Valeur unitaire</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-900/10 space-y-10">
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-6">
                            <h3 className="text-[10px] font-black text-[#14213D] flex items-center uppercase tracking-[0.3em]">
                                <FileText size={20} className="mr-4 text-[#FCA311]" /> Documents Contractuels
                            </h3>
                            <span className="text-[8px] font-black text-[#14213D]/40 uppercase tracking-widest bg-[#14213D]/5 px-3 py-1.5 rounded-xl">
                                Synchronisation Cloud
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Bon de Commande */}
                            <div className="p-8 border border-slate-900/10 rounded-[2rem] flex flex-col items-center text-center gap-6 hover:border-[#FCA311] transition-all bg-white shadow-sm group">
                                <div className="p-4 bg-[#14213D]/5 text-[#14213D] rounded-2xl group-hover:bg-[#14213D] group-hover:text-[#FCA311] transition-all duration-300">
                                    <FileText size={24} />
                                </div>
                                <h4 className="font-black text-[#14213D] text-[10px] uppercase tracking-widest">Bon de commande</h4>
                                <button
                                    onClick={async () => {
                                        try {
                                            await generateOrderPDF(order, settings);
                                            toast.success("Bon de commande téléchargé");
                                        } catch (error) {
                                            console.error("PDF Error:", error);
                                            toast.error("Erreur lors de la génération");
                                        }
                                    }}
                                    className="w-full py-3 bg-white border border-slate-900/10 text-[#14213D] rounded-2xl text-[7px] font-black uppercase tracking-widest hover:bg-[#14213D] hover:text-[#FCA311] transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <FileText size={16} /> Aperçu
                                </button>
                            </div>

                            {/* Contrat de Vente */}
                            <div className="p-8 border border-slate-900/10 rounded-[2rem] flex flex-col items-center text-center gap-6 hover:border-[#FCA311] transition-all bg-white shadow-sm group">
                                <div className="p-4 bg-[#14213D]/5 text-[#14213D] rounded-2xl group-hover:bg-[#14213D] group-hover:text-[#FCA311] transition-all duration-300">
                                    <FileText size={24} />
                                </div>
                                <h4 className="font-black text-[#14213D] text-[10px] uppercase tracking-widest">Contrat de Vente</h4>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await generateContractPDF(order, settings);
                                                toast.success("Contrat de vente téléchargé");
                                            } catch (error) {
                                                console.error("PDF Error:", error);
                                                toast.error("Erreur lors de la génération");
                                            }
                                        }}
                                        className="w-full py-3 bg-[#14213D] text-[#FCA311] rounded-2xl text-[7px] font-black uppercase tracking-widest hover:bg-[#052659] transition-all border border-[#14213D] flex items-center justify-center gap-2"
                                    >
                                        <FileText size={14} /> Duplicata
                                    </button>
                            </div>

                            {/* Reçu de Paiement (Conditionnel) */}
                            {(order?.status === 'delivered' || order?.status === 'completed' || order?.status === 'logistics' || order?.status === 'transit' || order?.status === 'concierge') ? (
                                <div className="p-8 border border-slate-900/10 rounded-[2rem] flex flex-col items-center text-center gap-6 hover:border-[#FCA311] transition-all bg-white shadow-sm group">
                                    <div className="p-4 bg-[#14213D]/5 text-[#14213D] rounded-2xl group-hover:bg-[#14213D] group-hover:text-[#FCA311] transition-all duration-300">
                                        <FileText size={24} />
                                    </div>
                                    <h4 className="font-black text-[#14213D] text-[10px] uppercase tracking-widest">Reçu de Paiement</h4>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await generatePaymentReceiptPDF(order, settings);
                                                toast.success("Reçu téléchargé");
                                            } catch (error) {
                                                console.error("PDF Error:", error);
                                                toast.error("Erreur lors de la génération");
                                            }
                                        }}
                                        className="w-full py-3 bg-[#14213D] text-[#FCA311] rounded-2xl text-[7px] font-black uppercase tracking-widest hover:bg-[#052659] transition-all border border-[#14213D] flex items-center justify-center gap-2"
                                    >
                                        <FileText size={14} /> Duplicata
                                    </button>
                                </div>
                            ) : (
                                <div className="p-8 border border-[#E5E5E5] rounded-[2rem] flex flex-col items-center text-center gap-6 bg-gray-50/50 opacity-40 grayscale">
                                    <div className="p-4 bg-[#14213D]/5 text-[#14213D] rounded-2xl">
                                        <FileText size={24} />
                                    </div>
                                    <h4 className="font-black text-[#14213D] text-[10px] uppercase tracking-widest">Reçu de Paiement</h4>
                                    <button
                                        disabled
                                        className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed"
                                    >
                                        En attente
                                    </button>
                                </div>
                            )}

                            {/* Bordereau de Livraison (Conditionnel) */}
                            {(order?.status === 'delivered' || order?.status === 'completed' || order?.status === 'logistics' || order?.status === 'transit' || order?.status === 'concierge') ? (
                                <div className="p-8 border border-slate-900/10 rounded-[2rem] flex flex-col items-center text-center gap-6 hover:border-[#FCA311] transition-all bg-white shadow-sm group">
                                    <div className="p-4 bg-[#14213D]/5 text-[#14213D] rounded-2xl group-hover:bg-[#14213D] group-hover:text-[#FCA311] transition-all duration-300">
                                        <FileText size={24} />
                                    </div>
                                    <h4 className="font-black text-[#14213D] text-[10px] uppercase tracking-widest">Bordereau Livraison</h4>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await generateDeliverySlipPDF(order, settings);
                                                toast.success("Bordereau téléchargé");
                                            } catch (error) {
                                                console.error("PDF Error:", error);
                                                toast.error("Erreur lors de la génération");
                                            }
                                        }}
                                        className="w-full py-3 bg-[#14213D] text-[#FCA311] rounded-2xl text-[7px] font-black uppercase tracking-widest hover:bg-[#052659] transition-all border border-[#14213D] flex items-center justify-center gap-2"
                                    >
                                        <FileText size={14} /> Générer
                                    </button>
                                </div>
                            ) : (
                                <div className="p-8 border border-[#E5E5E5] rounded-[2rem] flex flex-col items-center text-center gap-6 bg-gray-50/50 opacity-40 grayscale">
                                    <div className="p-4 bg-[#14213D]/5 text-[#14213D] rounded-2xl">
                                        <FileText size={24} />
                                    </div>
                                    <h4 className="font-black text-[#14213D] text-[10px] uppercase tracking-widest">Bordereau Livraison</h4>
                                    <button
                                        disabled
                                        className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed"
                                    >
                                        En attente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-900/10 space-y-8">
                        <h3 className="text-[10px] font-black text-[#14213D]/30 uppercase tracking-[0.3em] border-b border-[#E5E5E5] pb-5 flex items-center">
                            <User size={16} className="mr-3 text-[#FCA311]" /> Portefeuille Client
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#14213D] flex items-center justify-center text-[#FCA311] font-black text-lg border-2 border-[#14213D] shadow-lg">
                                    {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-black text-[#14213D] uppercase tracking-tight text-[13px]">{order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p className="text-[10px] text-[#14213D]/40 font-black lowercase truncate max-w-[150px]">{order.customer?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-4 text-[11px] text-[#14213D] font-black uppercase tracking-tight">
                                    <Phone size={14} className="text-[#FCA311]" />
                                    <span>{order.customer?.phone}</span>
                                </div>
                                {order.customer?.company && (
                                    <div className="flex items-center gap-4 text-[11px] text-[#14213D] font-black uppercase tracking-tight">
                                        <Building2 size={14} className="text-[#FCA311]" />
                                        <span>{order.customer?.company}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#E5E5E5] space-y-4">
                            <h4 className="text-[10px] font-black text-[#14213D]/30 uppercase tracking-[0.2em] flex items-center">
                                <MapPin size={14} className="mr-3 text-[#FCA311]" /> Destination Finale
                            </h4>
                            <p className="text-[11px] text-[#14213D] font-black leading-[1.8] uppercase tracking-tight">
                                {order.customer?.address}<br />
                                {order.customer?.zipCode} {order.customer?.city}<br />
                                {order.customer?.country}
                            </p>
                        </div>
                    </div>

                    {/* Action Menu */}
                    <div className="bg-[#14213D] p-10 rounded-[2.5rem] shadow-2xl shadow-[#14213D]/30 space-y-8 border-b-8 border-[#FCA311]">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] border-b border-white/5 pb-5">Pilotage Logistique</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'validation', label: '1. Validation Administrative' },
                                { id: 'pending', label: '2. En attente paiement' },
                                { id: 'logistics', label: '3. Logistique & Préparation' },
                                { id: 'transit', label: '4. Transport International' },
                                { id: 'concierge', label: '5. Arrivée Conciergerie' },
                                { id: 'delivered', label: '6. Livré au client' },
                            ].map((step) => (
                                <button
                                    key={step.id}
                                    onClick={() => handleUpdateStatus(step.id)}
                                    disabled={updating || order.status === step.id}
                                    className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${order.status === step.id 
                                        ? 'bg-[#FCA311] text-[#14213D] shadow-xl shadow-[#FCA311]/20 scale-[1.02]' 
                                        : 'text-white/40 hover:bg-white/5 border border-white/5 hover:border-white/20'}`}
                                >
                                    {step.label}
                                </button>
                            ))}
                            <div className="h-px bg-white/5 my-4" />
                            <button
                                onClick={() => handleUpdateStatus('cancelled')}
                                disabled={updating || order.status === 'cancelled'}
                                className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${order.status === 'cancelled' 
                                    ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
                                    : 'text-red-500/50 hover:text-red-500 hover:bg-red-500/10 border border-transparent'}`}
                            >
                                Annuler le dossier
                            </button>
                            {isSuperAdmin && (
                                <div className="pt-6 mt-4 border-t border-white/5">
                                    <button
                                        onClick={handleDeleteOrder}
                                        disabled={updating}
                                        className="w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-white/5 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        <Trash2 size={14} /> Suppression Définitive
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default OrderDetails;
