import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import useAuthStore from '@shared/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Building2, ArrowLeft, CheckCircle, Copy, Loader2, ShieldCheck, Zap, Info } from 'lucide-react';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() };
          if (user && orderData.userId !== user.uid) {
            navigate('/dashboard');
            return;
          }
          if (orderData.status !== 'pending') {
            navigate(`/dashboard/orders/${orderData.id}`);
            return;
          }
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Error fetching order for payment:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user, navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-red-700" size={40} />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20 mt-6">
      <button
        onClick={() => navigate('/dashboard/billing')}
        className="group flex items-center text-slate-500 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest px-5 py-3 bg-white rounded-xl border border-slate-100 shadow-sm"
      >
        <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" />
        Retour à la facturation
      </button>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        {/* Header - Minimalist */}
        <div className="p-10 border-b border-slate-50 text-center">
          <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Building2 size={24} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Virement Bancaire</h1>
          <p className="text-slate-400 font-bold text-[10px] mt-4 uppercase tracking-[0.2em] max-w-sm mx-auto">
            Coordonnées certifiées pour la validation de votre acquisition
          </p>
        </div>

        <div className="p-8 md:p-12">
          {/* Financial Summary - Grounded */}
          <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 mb-10 text-center">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em] mb-4">Montant de la Transaction</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{order.total?.toLocaleString()}€</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle size={10} /> Assurance & Livraison Incluses
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Détails du compte bénéficiaire</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Bénéficiaire</p>
                  <button onClick={() => copyToClipboard("Jennifer Suß")} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
                <p className="font-black text-slate-900 uppercase text-base">Jennifer Suß</p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">BIC / SWIFT</p>
                  <button onClick={() => copyToClipboard("NTSBDEB1XXX")} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
                <p className="font-black text-slate-900 font-mono text-base tracking-wider">NTSBDEB1XXX</p>
              </div>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="w-full md:w-auto">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2">IBAN SEPA</p>
                <p className="font-black text-slate-900 font-mono text-lg tracking-tight">DE56 1001 1001 2176 5100 26</p>
              </div>
              <button
                onClick={() => copyToClipboard("DE56 1001 1001 2176 5100 26")}
                className="w-full md:w-auto flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-md"
              >
                <Copy size={14} /> Copier l'IBAN
              </button>
            </div>

            {/* Reference - Professional focus */}
            <div className="p-8 bg-slate-900 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <div className="text-white w-full md:w-auto">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Info size={12} className=" text-red-700" /> Référence de Virement (Obligatoire)
                  </p>
                  <p className="font-black text-3xl tracking-tighter uppercase">{order.orderNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(order.orderNumber)}
                  className="w-full md:w-auto bg-white text-slate-900 px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-700 hover:text-slate-900 transition-all active:scale-95 flex items-center gap-2 justify-center shadow-md"
                >
                  <Copy size={14} /> Copier la référence
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-[11px] text-slate-400 font-bold max-w-md mx-auto leading-relaxed uppercase tracking-widest">
              Détection automatique sous 24-48h. Votre dossier passera en "Payé" dès réception des fonds.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 opacity-40 grayscale">
              <ShieldCheck size={20} />
              <Building2 size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
