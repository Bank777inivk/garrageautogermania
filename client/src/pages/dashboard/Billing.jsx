import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { FileText, Download, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateOrderPDF, generatePaymentReceiptPDF } from '@shared/utils/generateAdminDocuments';

const Billing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
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

      // Sort by date desc
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error monitoring billing data:", error);
      setLoading(false);
    });

    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'documents');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();

    return () => unsubscribe();
  }, [user]);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  // Add all post-payment statuses to the completed/archived list
  const completedOrders = orders.filter(o => ['logistics', 'transit', 'concierge', 'delivered', 'completed'].includes(o.status));

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: '#052659' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto mt-2 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Facturation & Finances
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gestion de vos transactions et archives fiscales</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-semibold mb-0.5">Status du compte</p>
            <p className="text-sm font-bold text-emerald-600">Certifié & Vérifié</p>
          </div>
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            Actions en attente
          </h2>
          <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100 shadow-sm">
            {pendingOrders.length} À traiter
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4">
              <CheckCircle size={28} />
            </div>
            <p className="text-slate-500 font-semibold text-sm">Aucune facture en attente</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-14 h-14 bg-slate-50 text-slate-700 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Facture #{order.orderNumber}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Émise le {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'} • <span className="text-slate-900 font-bold">{order.total?.toLocaleString()}€</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                    className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700"
                  >
                    <CreditCard size={16} />
                    Régler maintenant
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center transition-all gap-2"
                  >
                    <FileText size={16} className="text-current" />
                    Facture Proforma
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Invoices */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-500" />
          Historique Archivé
        </h2>

        {completedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
            <p className="text-slate-500 font-semibold text-sm">Aucune archive financière</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Référence</th>
                    <th className="p-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Date Paiement</th>
                    <th className="p-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider">Montant TTC</th>
                    <th className="p-4 px-6 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 px-6 font-bold text-slate-900 text-sm">#{order.orderNumber}</td>
                      <td className="p-4 px-6 text-sm text-slate-500 font-medium">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 px-6 font-bold text-slate-900 text-sm">{order.total?.toLocaleString()}€</td>
                      <td className="p-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-xs hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <FileText size={14} />
                          Ouvrir le Reçu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {completedOrders.map(order => (
                <div key={order.id} className="p-5 flex flex-col gap-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Référence</p>
                      <p className="font-bold text-slate-900 text-sm">#{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Date Paiement</p>
                      <p className="text-sm font-medium text-slate-600">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Montant TTC</p>
                      <p className="font-bold text-slate-900 text-base">{order.total?.toLocaleString()} €</p>
                    </div>
                    <button
                      onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                      className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-xs hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <FileText size={14} />
                      Ouvrir Reçu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Policy Card */}
      <div className="rounded-3xl p-8 bg-slate-50 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mt-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Politique de Paiement</h3>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Transactions certifiées. Facturation automatique après confirmation bancaire (24h-48h).
          </p>
        </div>
        <button className="w-full sm:w-auto bg-white text-slate-700 px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-200 shrink-0">
          Contacter la comptabilité <AlertCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export default Billing;
