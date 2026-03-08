import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import useAuthStore from '@shared/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Building2, ArrowLeft, CheckCircle, Copy, Loader2, ShieldCheck, Zap, Info, Download, CheckCircle2 } from 'lucide-react';
import { generatePaymentReceiptPDF } from '@shared/utils/generateAdminDocuments';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!orderId || !user) return;

    const docRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        if (user && orderData.userId !== user.uid) {
          navigate('/dashboard');
          return;
        }
        setOrder(orderData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to order:", error);
      setLoading(false);
    });

    return () => unsubscribe();
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

  // The order is considered paid if it's past the pending/validation stage
  const isPaid = ['logistics', 'transit', 'concierge', 'delivered', 'completed'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20 mt-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/dashboard/billing')}
          className="group flex items-center text-slate-500 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest px-5 py-3 bg-white rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" />
          Retour à la facturation
        </button>
      </div>

      {isPaid ? (
        // --- SUCCESS PAYMENT SCREEN ---
        <div className="bg-[#020617] p-10 md:p-16 rounded-[3rem] shadow-2xl border border-white/10 text-center relative overflow-hidden mt-8">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -inset-1/2 bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent blur-3xl rounded-full"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl mx-auto flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
              Paiement Validé
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-12">
              Commande #{order.orderNumber} • {order.total?.toLocaleString()}€
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(`/dashboard/orders/track/${order.id}`)}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
              >
                Suivre ma livraison
              </button>
              <button
                onClick={async () => {
                  try {
                    await generatePaymentReceiptPDF(order, settings);
                    toast.success("Reçu téléchargé avec succès");
                  } catch (error) {
                    console.error("PDF Error:", error);
                    toast.error("Erreur lors de la génération du reçu PDF");
                  }
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
              >
                <Download size={16} className="text-emerald-500 group-hover:-translate-y-1 transition-transform" />
                Télécharger mon reçu PDF
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- PENDING PAYMENT SCREEN ---
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
      )}
    </div>
  );
};

export default Payment;
