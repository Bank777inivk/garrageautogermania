import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
    Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Orders = () => {
    const navigate = useNavigate();
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'validation': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'logistics': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'transit': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'concierge': return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200';
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
                <Loader2 className="animate-spin text-blue-600" size={32} />
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
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Users className="mr-3 text-indigo-600" size={28} /> Sélectionner un Client
                        </h1>
                        <p className="text-sm text-gray-500">Choisissez un client pour afficher et gérer ses commandes.</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher un client (Nom, Email)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-4">
                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => {
                                    setSearchParams({ userId: client.id });
                                    setSearchTerm(''); // Reset search when entering client orders
                                }}
                                className="border border-gray-200 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group bg-white"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                                        {client.firstName?.[0]}{client.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors text-base">
                                            {client.firstName} {client.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-0.5 flex flex-col sm:flex-row sm:gap-4">
                                            <span>{client.email}</span>
                                            {client.phone && <span className="text-gray-400 hidden sm:inline">•</span>}
                                            {client.phone && <span>{client.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Inscription</div>
                                        <div className="text-sm text-gray-700">
                                            {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" size={24} />
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <button
                            onClick={clearUserFilter}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                            title="Retour à la liste des clients"
                        >
                            <ChevronRight className="rotate-180" size={20} />
                        </button>
                        <ShoppingCart className="text-indigo-600" size={28} /> Commandes Client
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Affichage des commandes de <span className="font-bold text-indigo-700">{activeClient?.firstName} {activeClient?.lastName}</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="bg-white border rounded-lg p-1 flex shadow-sm flex-wrap gap-1 max-w-full">
                        {['all', 'validation', 'pending', 'logistics', 'transit', 'concierge', 'delivered'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === s ? 'bg-[#2271B1] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {s === 'all' ? 'Toutes' : getStatusLabel(s)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Commande #, Nom client, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Référence</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">VÉHICULE(S)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Montant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-gray-900">#{order.orderNumber}</div>
                                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            <Calendar size={12} className="mr-1" />
                                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">{order.customer?.firstName} {order.customer?.lastName}</span>
                                            <span className="text-xs text-gray-400/80">{order.customer?.email}</span>
                                            <span className="text-[10px] text-gray-400/60 font-medium">{order.customer?.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <Package size={12} className="mr-2 text-gray-400" />
                                                    <span className="font-bold">{item.brand} {item.model}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-gray-900">{(order.total || 0).toLocaleString()}€</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">Virement</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="relative group/status">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className={`appearance-none px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border cursor-pointer outline-none transition-all ${getStatusColor(order.status)} pr-6`}
                                            >
                                                <option value="validation">Validation</option>
                                                <option value="pending">Paiement</option>
                                                <option value="logistics">Logistique</option>
                                                <option value="transit">En Route</option>
                                                <option value="concierge">Arrivée</option>
                                                <option value="delivered">Livré</option>
                                                <option value="cancelled">Annulée</option>
                                            </select>
                                            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={12} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all"
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                            >
                                                <Eye size={14} /> Détails
                                            </button>
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg transition-all"
                                                title="Télécharger la facture"
                                            >
                                                <Download size={14} /> Facture
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center">
                            <ShoppingCart className="text-gray-100 mb-4" size={64} />
                            <p className="text-gray-400 font-medium italic">Aucune commande ne correspond à ces critères.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Orders;
