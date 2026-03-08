import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Package, ChevronRight, Loader2, CheckCircle, XCircle, History as HistoryIcon, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const History = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) navigate('/connexion');
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter for history items (PAID, DELIVERED, COMPLETED, CANCELLED)
            const historyItems = ordersData.filter(order =>
                ['logistics', 'transit', 'concierge', 'delivered', 'completed', 'cancelled'].includes(order.status)
            );

            historyItems.sort((a, b) => {
                const dateA = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
                const dateB = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setOrders(historyItems);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-red-700" />
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
            case 'delivered':
            case 'logistics':
            case 'transit':
            case 'concierge':
                return {
                    label: 'Paiement Validé / Dossier en cours',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: CheckCircle
                };
            case 'cancelled':
                return {
                    label: 'Annulé / Archivé',
                    color: 'bg-slate-100 text-slate-500 border-slate-200',
                    icon: XCircle
                };
            default:
                return {
                    label: 'Archivé',
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: Package
                };
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Historique Acquisitions
                    </h1>
                    <p className="text-slate-500 mt-4 font-bold text-[10px] uppercase tracking-[0.2em]">
                        Archives complètes de vos anciens dossiers et transactions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{orders.length} dossiers archivés</span>
                    <HistoryIcon size={16} className="text-slate-300" />
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-20 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <HistoryIcon size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Historique vide</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto font-medium text-sm text-[11px] uppercase tracking-widest">Vos dossiers terminés apparaîtront ici.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule & Référence</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Clôture</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant Total</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Final</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((order) => {
                                    const mainItem = order.items?.[0];
                                    const config = getStatusConfig(order.status);
                                    const Icon = config.icon;

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                        <img src={mainItem?.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm tracking-tight">{mainItem?.brand} {mainItem?.model}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{order.orderNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs font-bold text-slate-700">
                                                        {order.updatedAt?.seconds ? new Date(order.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : '-'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Clock size={8} /> Finalisé
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 font-black text-slate-900 text-sm">
                                                {order.total?.toLocaleString()}€
                                            </td>
                                            <td className="p-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
                                                    <Icon size={10} />
                                                    {config.label}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-800 transition-all active:scale-90"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
