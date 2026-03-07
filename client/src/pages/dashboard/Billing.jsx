import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { FileText, Download, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateOrderPDF } from '@shared/utils/generateOrderPDF';
import { generateInvoicePDF } from '@shared/utils/generateAdminDocuments';

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
  const completedOrders = orders.filter(o => o.status === 'completed');

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">
      {/* Header - Grounded */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
            Facturation & Finances
          </h1>
          <p className="text-slate-500 mt-4 font-bold text-[10px] uppercase tracking-[0.2em]">Gestion de vos transactions et archives fiscales</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status du compte</p>
            <p className="text-[11px] font-black text-green-600 uppercase tracking-tight">Certifié & Vérifié</p>
          </div>
          <div className="w-px h-8 bg-slate-100 mx-2"></div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-300 font-black text-xs">
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Pending Transactions - Grounded Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <Clock size={16} className="text-amber-500" />
            Actions en attente
          </h2>
          <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
            {pendingOrders.length} À traiter
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
              <CheckCircle size={24} />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Aucune facture en attente</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Facture #{order.orderNumber}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Émise le {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'} • <span className="text-slate-900 font-black">{order.total?.toLocaleString()}€</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/dashboard/payment/${order.id}`)}
                    className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={14} />
                    Régler maintenant
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await generateOrderPDF(order, settings);
                        toast.success("Bon de commande téléchargé");
                      } catch (error) {
                        console.error("PDF Error:", error);
                        toast.error("Erreur lors de la génération du PDF");
                      }
                    }}
                    className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-900 font-black text-[9px] uppercase tracking-widest flex items-center justify-center transition-all shadow-sm gap-2"
                  >
                    <Download size={12} className="text-slate-400" />
                    Bon de commande
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Invoices - Professional Table */}
      <div className="space-y-6 pt-6 ">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <CheckCircle size={16} className="text-green-600" />
            Historique Archivé
          </h2>
          <div className="h-px bg-slate-100 flex-1 mx-6"></div>
        </div>

        {completedOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center shadow-sm">
            <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">Aucune archive financière</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 font-black text-[9px] text-slate-400 uppercase tracking-[0.3em]">Référence</th>
                    <th className="p-5 font-black text-[9px] text-slate-400 uppercase tracking-[0.3em]">Date Paiement</th>
                    <th className="p-5 font-black text-[9px] text-slate-400 uppercase tracking-[0.3em]">Montant TTC</th>
                    <th className="p-5 font-black text-[9px] text-slate-400 uppercase tracking-[0.3em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {completedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-black text-slate-900 text-sm tracking-tight">#{order.orderNumber}</td>
                      <td className="p-5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-5 font-black text-slate-900 text-base">{order.total?.toLocaleString()}€</td>
                      <td className="p-5 text-right">
                        <button
                          onClick={async () => {
                            try {
                              await generateInvoicePDF(order, settings);
                              toast.success("Facture téléchargée");
                            } catch (error) {
                              console.error("PDF Error:", error);
                              toast.error("Erreur lors de la génération de la facture");
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                          <Download size={12} />
                          Facture PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner - Grounded */}
      <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Politique de Paiement</h3>
          <p className="text-slate-400 font-bold text-[11px] mb-8 leading-relaxed max-w-2xl uppercase tracking-widest">
            Transactions certifiées. Facturation automatique après confirmation bancaire (24h-48h).
          </p>
          <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-red-700 hover:text-white shadow-md flex items-center gap-2">
            Contacter la comptabilité <AlertCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
