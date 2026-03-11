import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import {
    Users,
    Search,
    UserX,
    UserCheck,
    Trash2,
    Mail,
    Calendar,
    Loader2,
    ShieldAlert,
    ShoppingCart,
    MoreVertical,
    ChevronRight,
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, blocked

    useEffect(() => {
        const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClients(clientList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleToggleBlock = async (client) => {
        const newStatus = !client.blocked;
        const action = newStatus ? 'bloquer' : 'débloquer';

        if (window.confirm(`Êtes-vous sûr de vouloir ${action} le compte de ${client.firstName} ${client.lastName} ?`)) {
            try {
                await updateDoc(doc(db, 'clients', client.id), {
                    blocked: newStatus,
                    updatedAt: serverTimestamp()
                });
                toast.success(`Compte ${newStatus ? 'bloqué' : 'débloqué'} avec succès`);
            } catch (error) {
                toast.error("Erreur lors de la modification du statut");
            }
        }
    };

    const handleDeleteClient = async (id) => {
        if (window.confirm("Action irréversible : Supprimer définitivement ce compte client ?")) {
            try {
                await deleteDoc(doc(db, 'clients', id));
                toast.success("Client supprimé");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'active') return matchesSearch && !client.blocked;
        if (filter === 'blocked') return matchesSearch && client.blocked;
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Users className="text-indigo-600" size={24} /> Gestion des Clients
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">Supervisez les comptes clients et gérez les accès.</p>
                </div>
                <div className="bg-white/50 border border-gray-100 rounded-xl p-1 flex shadow-sm self-start md:self-center overflow-x-auto max-w-full no-scrollbar">
                    {['all', 'active', 'blocked'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-indigo-600 hover:bg-white/80'}`}
                        >
                            {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Bloqués'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Inscription</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black border-2 border-white shadow-sm">
                                                {client.firstName?.[0]}{client.lastName?.[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-black text-gray-900">{client.firstName} {client.lastName}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">#{client.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 hidden md:table-cell">
                                        <div className="flex flex-col space-y-1 text-sm text-gray-600 font-medium">
                                            <div className="flex items-center">
                                                <Mail className="mr-2 text-gray-400" size={14} />
                                                {client.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 hidden lg:table-cell">
                                        <div className="flex items-center text-sm text-gray-500 font-medium">
                                            <Calendar className="mr-2 text-gray-400" size={14} />
                                            {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {client.blocked ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest shadow-sm">
                                                <ShieldAlert size={12} className="mr-1.5" /> Bloqué
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest shadow-sm">
                                                <UserCheck size={12} className="mr-1.5" /> Actif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`/orders?userId=${client.id}`}
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all"
                                                title="Voir les commandes"
                                            >
                                                <ShoppingCart size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleToggleBlock(client)}
                                                className={`p-2 rounded-lg border border-transparent transition-all ${client.blocked ? 'text-green-600 hover:bg-green-50 hover:border-green-100' : 'text-orange-600 hover:bg-orange-50 hover:border-orange-100'}`}
                                                title={client.blocked ? "Débloquer" : "Bloquer"}
                                            >
                                                {client.blocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClient(client.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Version Mobile : Cartes */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="p-4 space-y-4 hover:bg-gray-50 active:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-inner">
                                        {client.firstName?.[0]}{client.lastName?.[0]}
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-black text-gray-900 text-sm">{client.firstName} {client.lastName}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">#{client.id.substring(0, 8)}</div>
                                    </div>
                                </div>
                                <div>
                                    {client.blocked ? (
                                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest flex items-center shadow-sm">
                                            <ShieldAlert size={10} className="mr-1" /> Bloqué
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest flex items-center shadow-sm">
                                            <UserCheck size={10} className="mr-1" /> Actif
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-2">
                                <div className="flex items-center text-[10px] text-gray-500 font-bold">
                                    <Mail className="mr-2 text-gray-400" size={12} />
                                    {client.email}
                                </div>
                                <div className="flex items-center text-[10px] text-gray-500 font-bold">
                                    <Calendar className="mr-2 text-gray-400" size={12} />
                                    Inscrit le {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/orders?userId=${client.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm active:scale-95 transition-all"
                                >
                                    <ShoppingCart size={14} /> Commandes
                                </a>
                                <button
                                    onClick={() => handleToggleBlock(client)}
                                    className={`p-3 rounded-xl border shadow-sm active:scale-95 transition-all ${client.blocked ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}
                                >
                                    {client.blocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                </button>
                                <button
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 shadow-sm active:scale-95 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredClients.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <Users className="text-gray-200 mb-4" size={64} />
                        <p className="text-gray-400 font-medium">Aucun client ne correspond à votre recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
