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
            <div className="w-16 h-16 border-4 border-slate-100 border-t-red-700 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Suivi Livraison
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-3">
                        Gérez le transit de vos véhicules en temps réel
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Système de tracking actif</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-50 shadow-2xl shadow-slate-200/40">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Package className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Aucun véhicule en transit</h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto font-medium">
                        Vous n'avez pas encore de commande active. Explorez notre catalogue pour trouver votre futur véhicule.
                    </p>
                    <Link to="/catalogue" className="inline-flex mt-8 px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all">
                        Explorer le catalogue
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {orders.map((order) => (
                        <div key={order.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-red-700/10 transition-all duration-500 hover:-translate-y-1">
                            {/* Vehicle Header */}
                            <div className="relative h-48 bg-slate-100">
                                <img
                                    src={order.items?.[0]?.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'}
                                    alt={order.items?.[0]?.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="px-2 py-0.5 bg-red-700 rounded text-[8px] font-black text-white uppercase tracking-widest">
                                            #{order.orderNumber}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">
                                        {order.items?.[0]?.name || 'Véhicule Premium'}
                                    </h3>
                                </div>
                            </div>

                            {/* Info Body */}
                            <div className="p-8">
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-red-700 transition-colors">
                                                <Compass size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Statut commande</p>
                                                <p className="text-[13px] font-black text-slate-900 uppercase mt-0.5">
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
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Étape</p>
                                            <p className="text-[13px] font-black text-red-700 uppercase mt-0.5 font-sans">
                                                {['delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'Terminé' : 'En cours'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                                            <p className="text-[13px] font-black text-slate-900 uppercase mt-0.5">France (Import-DE)</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard/orders/track/${order.id}`)}
                                    className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 hover:text-white transition-all group/btn border border-slate-100 shadow-sm"
                                >
                                    Suivra ma transaction
                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
