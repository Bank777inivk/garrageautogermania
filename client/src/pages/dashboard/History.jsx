import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Package, ChevronRight, Loader2, CheckCircle, XCircle, History as HistoryIcon, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useLangNavigate from '../../hooks/useLangNavigate';

const History = () => {
    const navigate = useNavigate();
  const { langNavigate } = useLangNavigate();
    const { user, loading: authLoading } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) langNavigate('/connexion');
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

            // Filter for history items (FINAL statuses only)
            const historyItems = ordersData.filter(order =>
                ['delivered', 'completed', 'cancelled'].includes(order.status)
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
                <Loader2 className="animate-spin h-8 w-8" style={{ color: '#052659' }} />
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
        <div className="space-y-6 max-w-7xl mx-auto mt-2 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Historique Acquisitions
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Archives complètes de vos anciens dossiers et transactions
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full shadow-sm text-slate-600 font-semibold text-sm">
                    {orders.length} dossiers archivés
                    <HistoryIcon size={16} />
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 md:p-24 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-6">
                        <HistoryIcon size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Historique vide</h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">Vos dossiers terminés apparaîtront ici.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Véhicule & Référence</th>
                                    <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Clôture</th>
                                    <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant Total</th>
                                    <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut Final</th>
                                    <th className="p-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => {
                                    const mainItem = order.items?.[0];
                                    const config = getStatusConfig(order.status);
                                    const Icon = config.icon;

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                                        <img src={mainItem?.image || 'https://placehold.co/800x600'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm tracking-tight">{mainItem?.brand} {mainItem?.model}</p>
                                                        <p className="text-xs font-medium text-slate-500">#{order.orderNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {order.updatedAt?.seconds ? new Date(order.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : '-'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                        <Clock size={12} /> Finalisé
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 font-bold text-slate-900 text-base">
                                                {order.total?.toLocaleString()}€
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
                                                    <Icon size={14} />
                                                    {config.label}
                                                </div>
                                            </td>
                                             <td className="p-4 px-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                                    className="p-2 bg-white text-slate-500 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 inline-flex"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                        {orders.map((order) => {
                            const mainItem = order.items?.[0];
                            const config = getStatusConfig(order.status);
                            const Icon = config.icon;

                            return (
                                <div key={order.id} className="p-5 flex flex-col gap-5 hover:bg-slate-50 transition-colors bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                            <img src={mainItem?.image || 'https://placehold.co/800x600'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{mainItem?.brand} {mainItem?.model}</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">#{order.orderNumber}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {order.updatedAt?.seconds ? new Date(order.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : '-'}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                                                <Clock size={12} /> Finalisé
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">Montant Total</p>
                                            <p className="font-bold text-slate-900 text-base">{order.total?.toLocaleString()} €</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
                                            <Icon size={14} />
                                            {config.label}
                                        </div>
                                         <button
                                            onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                            className="p-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
