import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import {
    ShoppingCart,
    Search,
    Filter,
    Eye,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Truck,
    MoreVertical,
    Download,
    Loader2,
    Calendar,
    Package,
    User as UserIcon,
    ChevronRight,
    Users,
    Zap,
    Shield,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@shared/store/useAuthStore';

const Orders = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isSuperAdmin = user?.email === 'noellinemous@gmail.com';
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchParams, setSearchParams] = useSearchParams();
    const userIdFilter = searchParams.get('userId');

    // Mettre à jour la recherche de clients à l'arrivée sur la page
    useEffect(() => {
        const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClients(clientList);
            setLoadingClients(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch orders ONLY if a user is selected
    useEffect(() => {
        if (!userIdFilter) {
            setOrders([]);
            setLoadingOrders(false);
            return;
        }

        setLoadingOrders(true);
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(orderList);
            setLoadingOrders(false);
        });
        return () => unsubscribe();
    }, [userIdFilter]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            toast.success("Statut mis à jour");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteOrder = async (orderId, orderNumber) => {
        if (!isSuperAdmin) {
            toast.error("Action non autorisée");
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT la commande #${orderNumber} ? Cette action est irréversible.`)) {
            try {
                await deleteDoc(doc(db, 'orders', orderId));
                toast.success("Commande supprimée définitivement");
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'validation': return 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'logistics': return 'bg-[#14213D]/10 text-[#14213D] border-[#14213D]/20';
            case 'transit': return 'bg-[#14213D]/5 text-[#14213D] border-[#14213D]/10';
            case 'concierge': return 'bg-[#FCA311]/5 text-[#14213D] border-[#FCA311]/20';
            case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            case 'confirmed': return 'bg-[#14213D]/10 text-[#14213D] border-[#14213D]/20';
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'validation': return 'Validation';
            case 'pending': return 'Paiement';
            case 'logistics': return 'Logistique';
            case 'transit': return 'En Route';
            case 'concierge': return 'Arrivée';
            case 'delivered': return 'Livré';
            case 'cancelled': return 'Annulée';
            case 'confirmed': return 'Logistique';
            case 'completed': return 'Livré';
            default: return status;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${order.customer?.firstName} ${order.customer?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUser = userIdFilter ? order.userId === userIdFilter : true;

        if (!matchesUser) return false;
        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && order.status === statusFilter;
    });

    const clearUserFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('userId');
        setSearchParams(newParams);
    };

    if (loadingClients || (userIdFilter && loadingOrders)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#14213D]" size={32} />
            </div>
        );
    }

    const filteredClients = clients.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // VUE 1 : CHOIX DU CLIENT (Si aucun client n'est sélectionné)
    if (!userIdFilter) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#14213D] uppercase tracking-tight flex items-center">
                            <Users className="mr-3 text-[#FCA311]" size={28} /> Sélectionner un Client
                        </h1>
                        <p className="text-[10px] font-bold text-[#14213D]/40 uppercase tracking-[0.2em] mt-1">Choisissez un client pour gérer ses flux.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                    <div className="p-8 bg-white border-b border-[#E5E5E5]">
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#14213D]/20" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, email ou mission..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] focus:border-[#FCA311] outline-none text-base font-black text-[#14213D] placeholder:text-gray-300 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-8">
                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => {
                                    setSearchParams({ userId: client.id });
                                    setSearchTerm('');
                                }}
                                className="border border-[#E5E5E5] rounded-[2rem] p-6 flex items-center justify-between cursor-pointer hover:border-[#FCA311] hover:shadow-2xl hover:shadow-[#14213D]/5 transition-all group bg-white"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-[#14213D] flex items-center justify-center text-[#FCA311] font-black text-xl border-2 border-[#14213D] group-hover:bg-[#FCA311] group-hover:text-[#14213D] group-hover:border-[#FCA311] transition-all flex-shrink-0 shadow-lg">
                                        {client.firstName?.[0]}{client.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-black text-[#14213D] text-lg uppercase tracking-tight group-hover:text-[#FCA311] transition-colors">
                                            {client.firstName} {client.lastName}
                                        </div>
                                        <div className="flex flex-col mt-1">
                                            <span className="text-[10px] text-[#14213D]/40 font-bold uppercase tracking-widest">{client.email}</span>
                                            {client.phone && <span className="text-[10px] text-[#14213D]/60 font-black mt-0.5">{client.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#FCA311] transition-all flex-shrink-0">
                                    <ChevronRight className="text-[#14213D]/20 group-hover:text-[#14213D]" size={20} />
                                </div>
                            </div>
                        ))}

                        {filteredClients.length === 0 && (
                            <div className="col-span-full py-12 text-center flex flex-col items-center">
                                <UserIcon className="text-gray-200 mb-4" size={48} />
                                <p className="text-gray-500 font-medium italic">Aucun client trouvé.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Sélectionner les infos du client actif pour l'affichage
    const activeClient = clients.find(c => c.id === userIdFilter);

    // VUE 2 : COMMANDES DU CLIENT
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={clearUserFilter}
                        className="w-12 h-12 bg-[#14213D] text-[#FCA311] rounded-2xl flex items-center justify-center hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-lg group"
                        title="Retour à la liste des clients"
                    >
                        <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#14213D] uppercase tracking-tight flex items-center gap-3">
                            <ShoppingCart className="text-[#FCA311]" size={28} /> Flux Commandes
                        </h1>
                        <p className="text-[10px] font-bold text-[#14213D]/40 uppercase tracking-[0.2em] mt-1">
                            Portefeuille de <span className="text-[#FCA311]">{activeClient?.firstName} {activeClient?.lastName}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-[#E5E5E5] self-start md:self-center shadow-sm gap-1.5">
                    {['all', 'validation', 'pending', 'logistics', 'transit', 'concierge', 'delivered'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === s 
                                ? 'bg-[#14213D] text-[#FCA311] shadow-xl shadow-[#14213D]/20' 
                                : 'text-[#14213D]/40 hover:text-[#14213D] hover:bg-[#14213D]/5'
                                }`}
                        >
                            {s === 'all' ? 'Toutes' : getStatusLabel(s)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="p-6 bg-white border-b border-[#E5E5E5] flex flex-col sm:flex-row gap-6">
                    <div className="relative flex-1 max-w-xl mx-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#14213D]/20" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une référence, un véhicule..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] focus:border-[#FCA311] outline-none text-sm font-black text-[#14213D] placeholder:text-gray-300 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#14213D] border-b border-white/10 text-white">
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Référence</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Client</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Éléments</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Finance</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Flux Statut</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#14213D]/5 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="font-black text-[#14213D] text-[11px] tracking-widest uppercase">#{order.orderNumber}</div>
                                        <div className="flex items-center text-[9px] text-[#14213D]/40 font-black uppercase tracking-widest mt-1.5">
                                            <Calendar size={12} className="mr-2 text-[#FCA311]" />
                                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#14213D] text-[11px] uppercase tracking-tight">{order.customer?.firstName} {order.customer?.lastName}</span>
                                            <span className="text-[9px] text-[#14213D]/40 font-bold lowercase mt-0.5">{order.customer?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center text-[10px] font-black text-[#14213D] bg-[#14213D]/5 px-3 py-1.5 rounded-xl border border-[#14213D]/10">
                                                    <Package size={12} className="mr-2 text-[#FCA311]" />
                                                    <span className="uppercase tracking-tight">{item.brand} {item.model}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="font-black text-[#14213D] text-sm">{(order.total || 0).toLocaleString()}€</div>
                                        <div className="text-[8px] text-[#14213D]/40 uppercase font-black tracking-widest mt-0.5">Virement Bancaire</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="relative inline-block group/status">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`appearance-none px-5 py-2.5 rounded-[1.25rem] text-[9px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all ${getStatusColor(order.status)} pr-10 shadow-sm`}
                                            >
                                                <option value="validation">Validation</option>
                                                <option value="pending">Paiement</option>
                                                <option value="logistics">Logistique</option>
                                                <option value="transit">En Route</option>
                                                <option value="concierge">Arrivée</option>
                                                <option value="delivered">Livré</option>
                                                <option value="cancelled">Annulée</option>
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 rotate-90" size={12} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-2.5">
                                            <button
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#14213D] rounded-xl hover:bg-[#14213D] hover:text-[#FCA311] transition-all shadow-sm"
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                title="Détails"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#14213D] rounded-xl hover:bg-[#14213D] hover:text-[#FCA311] transition-all shadow-sm"
                                                title="Facture"
                                            >
                                                <Download size={18} />
                                            </button>
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Version Mobile : Cartes (Masqué sur Desktop) */}
                <div className="md:hidden divide-y divide-[#E5E5E5]">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="p-6 space-y-6 hover:bg-[#14213D]/5 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-black text-[#14213D] tracking-widest uppercase">#{order.orderNumber}</div>
                                    <div className="flex items-center text-[9px] text-[#14213D]/40 font-black uppercase tracking-widest mt-1.5">
                                        <Calendar size={12} className="mr-2 text-[#FCA311]" />
                                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div className="font-black text-[#14213D] text-lg tracking-tighter">{(order.total || 0).toLocaleString()}€</div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center text-[9px] font-black text-[#14213D] bg-[#14213D]/5 px-3 py-2 rounded-xl border border-[#14213D]/10">
                                            <Package size={14} className="mr-2 text-[#FCA311]" />
                                            {item.brand} {item.model}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-2">
                                <div className="relative flex-1">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                        className={`w-full appearance-none px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all ${getStatusColor(order.status)} pr-10 shadow-sm`}
                                    >
                                        <option value="validation">Validation</option>
                                        <option value="pending">Paiement</option>
                                        <option value="logistics">Logistique</option>
                                        <option value="transit">En Route</option>
                                        <option value="concierge">Arrivée</option>
                                        <option value="delivered">Livré</option>
                                        <option value="cancelled">Annulée</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 rotate-90" size={14} />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        className="w-12 h-12 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#14213D] rounded-2xl shadow-sm active:scale-95 transition-all"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    {isSuperAdmin && (
                                        <button
                                            onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                            className="w-12 h-12 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-2xl shadow-sm active:scale-95 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <ShoppingCart className="text-gray-100 mb-4" size={64} />
                        <p className="text-gray-400 font-medium italic">Aucune commande ne correspond à ces critères.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
