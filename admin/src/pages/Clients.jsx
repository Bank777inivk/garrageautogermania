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
                <Loader2 className="animate-spin text-[#14213D]" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-[#14213D] uppercase tracking-tight flex items-center gap-3">
                        <Users className="text-[#FCA311]" size={24} /> Gestion Portefeuille Clients
                    </h1>
                    <p className="text-[10px] md:text-xs text-[#14213D]/40 font-bold mt-1 uppercase tracking-[0.2rem]">Supervisez les accès et l'activité des comptes.</p>
                </div>
                <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-[#E5E5E5] self-start md:self-center shadow-sm gap-1.5 no-scrollbar overflow-x-auto max-w-full">
                    {['all', 'active', 'blocked'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${filter === f 
                                ? 'bg-[#14213D] text-[#FCA311] shadow-xl shadow-[#14213D]/20' 
                                : 'text-[#14213D]/40 hover:text-[#14213D] hover:bg-[#14213D]/5'
                                }`}
                        >
                            {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Bloqués'}
                        </button>
                    ))}
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

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#14213D] border-b border-white/10 text-white">
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Client</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest hidden md:table-cell">Identité Digitale</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest hidden lg:table-cell">Date d'Entrée</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-[#14213D] flex items-center justify-center text-[#FCA311] font-black text-lg border-2 border-[#14213D] group-hover:bg-[#FCA311] group-hover:text-[#14213D] group-hover:border-[#FCA311] transition-all shadow-lg">
                                                {client.firstName?.[0]}{client.lastName?.[0]}
                                            </div>
                                            <div className="ml-5">
                                                <div className="font-black text-[#14213D] uppercase tracking-tight text-[11px]">{client.firstName} {client.lastName}</div>
                                                <div className="text-[9px] text-[#14213D]/40 font-black uppercase tracking-widest mt-1">ID_{client.id.substring(0, 8).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 hidden md:table-cell">
                                        <div className="flex flex-col space-y-1.5">
                                            <div className="flex items-center text-[10px] text-[#14213D] font-black uppercase tracking-tight">
                                                <Mail className="mr-2 text-[#FCA311]" size={14} />
                                                <span className="opacity-80 lowercase tracking-normal">{client.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 hidden lg:table-cell">
                                        <div className="flex items-center text-[10px] text-[#14213D]/40 font-black uppercase tracking-widest">
                                            <Calendar className="mr-2 text-[#FCA311]" size={14} />
                                            {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {client.blocked ? (
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest shadow-sm">
                                                <ShieldAlert size={12} className="mr-2" /> Bloqué
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest shadow-sm">
                                                <UserCheck size={12} className="mr-2" /> Actif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-3 transition-opacity">
                                            <a
                                                href={`/orders?userId=${client.id}`}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#14213D] rounded-xl hover:bg-[#14213D] hover:text-[#FCA311] transition-all shadow-sm group/btn"
                                                title="Voir les commandes"
                                            >
                                                <ShoppingCart size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleToggleBlock(client)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm ${client.blocked 
                                                    ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-600 hover:text-white' 
                                                    : 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white'}`}
                                                title={client.blocked ? "Débloquer" : "Bloquer"}
                                            >
                                                {client.blocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClient(client.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
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
                <div className="md:hidden divide-y divide-[#E5E5E5]">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="p-8 space-y-6 hover:bg-[#14213D]/5 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#14213D] flex items-center justify-center text-[#FCA311] font-black text-lg border-2 border-[#14213D] shadow-lg">
                                        {client.firstName?.[0]}{client.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-black text-[#14213D] text-[11px] uppercase tracking-tight">{client.firstName} {client.lastName}</div>
                                        <div className="text-[9px] text-[#14213D]/40 font-black uppercase tracking-widest mt-1">ID_{client.id.substring(0, 8).toUpperCase()}</div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {client.blocked ? (
                                        <span className="px-3 py-1.5 rounded-xl text-[8px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest flex items-center shadow-sm">
                                            <ShieldAlert size={12} className="mr-1.5" /> Bloqué
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1.5 rounded-xl text-[8px] font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest flex items-center shadow-sm">
                                            <UserCheck size={12} className="mr-1.5" /> Actif
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#14213D]/5 p-5 rounded-[2rem] border border-[#14213D]/5 space-y-2.5">
                                <div className="flex items-center text-[10px] text-[#14213D] font-black uppercase tracking-tight">
                                    <Mail className="mr-3 text-[#FCA311]" size={14} />
                                    <span className="lowercase tracking-normal">{client.email}</span>
                                </div>
                                <div className="flex items-center text-[10px] text-[#14213D]/40 font-black uppercase tracking-widest">
                                    <Calendar className="mr-3 text-[#FCA311]" size={14} />
                                    Inscrit le {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <a
                                    href={`/orders?userId=${client.id}`}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-[#14213D]/20 active:scale-95 transition-all"
                                >
                                    <ShoppingCart size={16} /> Flux Commandes
                                </a>
                                <button
                                    onClick={() => handleToggleBlock(client)}
                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-sm active:scale-95 transition-all ${client.blocked ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}
                                >
                                    {client.blocked ? <UserCheck size={20} /> : <UserX size={20} />}
                                </button>
                                <button
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="w-12 h-12 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-2xl shadow-sm active:scale-95 transition-all"
                                >
                                    <Trash2 size={20} />
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
