import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import useAuthStore from '@shared/store/useAuthStore';
import { Compass, Package, ChevronRight, Clock, MapPin, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackingList = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const ordersRef = collection(db, "orders");
                const q = query(ordersRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by date manually to avoid indexing issues in Firestore for complex queries
                ordersData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Erreur lors du chargement des suivis");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-spin" style={{ borderTopColor: '#052659' }}></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Suivi Livraison
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Gérez le transit de vos véhicules en temps réel
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-full border border-slate-200 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-slate-600">Système de tracking actif</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Package className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun véhicule en transit</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto font-medium">
                        Vous n'avez pas encore de commande active. Explorez notre catalogue pour trouver votre futur véhicule.
                    </p>
                    <Link to="/catalogue" className="inline-flex mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-sm transition-all hover:bg-blue-700 shadow-sm">
                        Explorer le catalogue
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Vehicle Header */}
                            <div className="relative h-48 bg-slate-100">
                                <img
                                    src={order.items?.[0]?.image || 'https://placehold.co/800x600'}
                                    alt={order.items?.[0]?.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="px-2 py-1 rounded bg-white text-slate-900 text-xs font-bold shadow-sm">
                                            #{order.orderNumber}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white truncate">
                                        {order.items?.[0]?.name || 'Véhicule Premium'}
                                    </h3>
                                </div>
                            </div>

                            {/* Info Body */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                                                <Compass size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 mb-0.5">Statut commande</p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {{
                                                        'validation': 'Validation',
                                                        'pending': 'Paiement',
                                                        'logistics': 'Logistique',
                                                        'transit': 'Transport',
                                                        'concierge': 'Arrivée',
                                                        'delivered': 'Livré',
                                                        'completed': 'Livré',
                                                        'confirmed': 'Confirmé',
                                                        'cancelled': 'Annulée'
                                                    }[order.status?.toLowerCase()] || order.status || 'En cours'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-slate-500 mb-0.5">Étape</p>
                                            <p className="text-sm font-bold text-blue-600">
                                                {['delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'Terminé' : 'En cours'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-0.5">Destination</p>
                                            <p className="text-sm font-bold text-slate-900">France (Import-DE)</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard/orders/track/${order.id}`)}
                                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm group/btn"
                                >
                                    Suivre ma transaction
                                    <ChevronRight size={18} className="text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrackingList;
