import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
    Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateContractPDF, generateInvoicePDF } from '@shared/utils/generateAdminDocuments';
import { generateOrderPDF } from '@shared/utils/generateOrderPDF';

const OrderDetails = () => {
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
                const settingsRef = doc(db, 'settings', 'global');
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
            setOrder(prev => ({ ...prev, status: newStatus }));
            toast.success("Statut mis à jour");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'validation': return { label: 'Validation', color: 'bg-emerald-100 text-emerald-700', icon: Shield };
            case 'pending': return { label: 'Paiement', color: 'bg-yellow-100 text-yellow-700', icon: CreditCard };
            case 'logistics': return { label: 'Logistique', color: 'bg-blue-100 text-blue-700', icon: Box };
            case 'transit': return { label: 'En Route', color: 'bg-indigo-100 text-indigo-700', icon: Truck };
            case 'concierge': return { label: 'Arrivée', color: 'bg-fuchsia-100 text-fuchsia-700', icon: MapPin };
            case 'delivered': return { label: 'Livré', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
            case 'cancelled': return { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: AlertCircle };
            // Legacy fallbacks
            case 'confirmed': return { label: 'Logistique', color: 'bg-blue-100 text-blue-700', icon: Box };
            case 'completed': return { label: 'Livré', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
            default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: FileText };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(order?.userId ? "/orders?userId=" + order.userId : "/orders")}
                    className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft size={18} className="mr-2" /> Retour aux commandes
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => generateOrderPDF(order, settings)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        <Printer size={16} className="mr-2" /> Imprimer Bon de Commande
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Order Header */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">Commande #{order.orderNumber}</h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color} flex items-center`}>
                                    <statusInfo.icon size={12} className="mr-1.5" /> {statusInfo.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                                Passée le {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant Total</p>
                            <h2 className="text-3xl font-bold text-indigo-600">{(order.total || 0).toLocaleString()}€</h2>
                        </div>
                    </div>

                    {/* Items Tray */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                                <Package size={16} className="mr-2" /> Articles sélectionnés
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-6 flex items-center gap-6 group hover:bg-gray-50/50 transition-colors">
                                    <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img src={item.image} alt={item.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.brand} {item.model}</h4>
                                        <p className="text-xs text-gray-400 font-medium lowercase">Réf: {item.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{(item.price || 0).toLocaleString()}€</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Prix Unitaire</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center">
                                <FileText size={20} className="mr-2 text-indigo-500" /> Aperçus des Documents
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                                Modèles Clients
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium italic mb-6">
                            Générez ces prototypes pour vérifier les termes et signatures configurés dans vos paramètres généraux.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-indigo-100 transition-colors bg-gray-50/50 group">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Contrat de Vente</h4>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Aperçu Prototype</p>
                                </div>
                                <button
                                    onClick={() => generateContractPDF(order, settings)}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                >
                                    Vérifier le contrat
                                </button>
                            </div>

                            <div className="p-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-green-100 transition-colors bg-gray-50/50 group">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-green-500 group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Facture d'Achat</h4>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Aperçu Prototype</p>
                                </div>
                                <button
                                    onClick={() => generateInvoicePDF(order, settings)}
                                    className="w-full py-2.5 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-100"
                                >
                                    Vérifier la facture
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3 flex items-center">
                            <User size={14} className="mr-2" /> Informations Client
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                    {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p className="text-xs text-gray-500 font-medium lowercase italic">{order.customer?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={14} className="text-gray-400" />
                                <span>{order.customer?.phone}</span>
                            </div>
                            {order.customer?.company && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Building2 size={14} className="text-gray-400" />
                                    <span>{order.customer?.company}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <MapPin size={12} className="mr-2" /> Adresse de Facturation
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {order.customer?.address}<br />
                                {order.customer?.zipCode}, {order.customer?.city}<br />
                                {order.customer?.country}
                            </p>
                        </div>
                    </div>

                    {/* Action Menu */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3">Statut Commande</h3>
                        <div className="grid grid-cols-1 gap-2">
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
                                    className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${order.status === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-500' : 'text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                                >
                                    {step.label}
                                </button>
                            ))}
                            <div className="h-px bg-white/5 my-2" />
                            <button
                                onClick={() => handleUpdateStatus('cancelled')}
                                disabled={updating || order.status === 'cancelled'}
                                className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${order.status === 'cancelled' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'text-slate-500 hover:text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-900/30'}`}
                            >
                                Annuler la commande
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default OrderDetails;
