import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import useAuthStore from '@shared/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Building2, ArrowLeft, CheckCircle, Copy, Loader2, ShieldCheck, Zap, Info, Download, CheckCircle2, Clock, FileText, FileCheck } from 'lucide-react';
import { generatePaymentReceiptPDF, generateContractPDF, generateInvoicePDF, generateDeliverySlipPDF } from '@shared/utils/generateAdminDocuments';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [settings, setSettings] = useState(null);
  
  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

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

  const handleSwitchToFullPayment = async () => {
    if (!order || order.paymentOption === 'full' || order.status !== 'pending') return;
    
    setModalConfig({
        isOpen: true,
        title: "Passer au Paiement Intégral",
        message: "Voulez-vous régler la totalité de votre acquisition dès maintenant ? Vous bénéficierez immédiatement d'une remise de 15% sur le prix des véhicules.",
        variant: "success",
        onConfirm: async () => {
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            setIsSwitchingMode(true);
            try {
                const subtotal = order.subtotal || 0;
                const shipping = order.shipping || 0;
                const discountAmount = Math.round(subtotal * 0.15);
                const finalTotal = subtotal + shipping - discountAmount;

                const orderRef = doc(db, 'orders', order.id);
                await updateDoc(orderRef, {
                    paymentOption: 'full',
                    discountAmount: discountAmount,
                    total: finalTotal,
                    amountToPayNow: finalTotal,
                    fullPaymentDiscount: 15,
                    updatedAt: new Date()
                });

                toast.success("Mode de paiement mis à jour : Remise de 15% appliquée !");
            } catch (error) {
                console.error("Error switching payment mode:", error);
                toast.error("Erreur lors de la mise à jour du paiement.");
            } finally {
                setIsSwitchingMode(false);
            }
        }
    });
  };

  const handleSwitchToDeposit = async () => {
    if (!order || order.paymentOption === 'deposit' || order.status !== 'pending') return;
    
    setModalConfig({
        isOpen: true,
        title: "Repasser à l'Acompte",
        message: "Souhaitez-vous repasser à un règlement échelonné (30% aujourd'hui) ? Notez que l'avantage client de 15% sera annulé.",
        variant: "info",
        onConfirm: async () => {
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            setIsSwitchingMode(true);
            try {
                const subtotal = order.subtotal || 0;
                const shipping = order.shipping || 0;
                const finalTotal = subtotal + shipping;
                const depositAmount = Math.round(finalTotal * 0.3);

                const orderRef = doc(db, 'orders', order.id);
                await updateDoc(orderRef, {
                    paymentOption: 'deposit',
                    discountAmount: 0,
                    total: finalTotal,
                    amountToPayNow: depositAmount,
                    fullPaymentDiscount: 0,
                    updatedAt: new Date()
                });

                toast.success("Mode de paiement mis à jour : Acompte de 30% activé.");
            } catch (error) {
                console.error("Error switching to deposit:", error);
                toast.error("Erreur lors de la mise à jour du paiement.");
            } finally {
                setIsSwitchingMode(false);
            }
        }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin" style={{ color: '#052659' }} size={40} />
      </div>
    );
  }

  if (!order) return null;

  // The order is considered paid if it's past the pending/validation stage
  const isPaid = ['logistics', 'transit', 'concierge', 'delivered', 'completed'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20 mt-6">
      {/* --- DOCUMENT PORTAL --- */}
      <div className="bg-white rounded-[2rem] border border-slate-900/10 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14213D] text-[#FCA311] rounded-xl flex items-center justify-center shadow-lg shadow-[#14213D]/10">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#14213D] uppercase tracking-tight">Documents Officiels</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Disponibles selon votre statut</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 italic transition-all animate-pulse">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Documents Certifiés</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Facture Proforma */}
          <button
            onClick={() => generateInvoicePDF(order, settings)}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-[#FCA311] transition-all group shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#FCA311] transition-colors">
                <FileText size={16} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Facture Proforma</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Détaillée</p>
              </div>
            </div>
            <Download size={14} className="text-slate-300 group-hover:text-[#14213D] group-hover:-translate-y-1 transition-transform" />
          </button>

          {/* 2. Contrat de Vente */}
          <button
            onClick={() => generateContractPDF(order, settings)}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-[#FCA311] transition-all group shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#FCA311] transition-colors">
                <FileCheck size={16} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Contrat de Vente</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Signature</p>
              </div>
            </div>
            <Download size={14} className="text-slate-300 group-hover:text-[#14213D] group-hover:-translate-y-1 transition-transform" />
          </button>

          {/* 3. Reçu de Paiement (Visible if paid) */}
          {isPaid ? (
            <button
              onClick={() => generatePaymentReceiptPDF(order, settings)}
              className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-white hover:border-emerald-500 transition-all group shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 transition-colors">
                  <CheckCircle2 size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-emerald-600 uppercase">Reçu</p>
                  <p className="text-[8px] text-emerald-400 font-bold uppercase">
                    {order.paymentOption === 'deposit' ? 'Acompte' : 'Acquitté'}
                  </p>
                </div>
              </div>
              <Download size={14} className="text-emerald-300 group-hover:text-emerald-600 group-hover:-translate-y-1 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl opacity-60 grayscale cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                  <CheckCircle2 size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Reçu</p>
                  <p className="text-[8px] text-slate-300 font-bold uppercase">En attente</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Bordereau de Livraison (Visible if logistics or further) */}
          {['logistics', 'transit', 'concierge', 'delivered', 'completed'].includes(order.status) ? (
            <button
              onClick={() => generateDeliverySlipPDF(order, settings)}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-[#FCA311] transition-all group shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#FCA311] transition-colors">
                  <Zap size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-900 uppercase">Livraison</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Bordereau</p>
                </div>
              </div>
              <Download size={14} className="text-slate-300 group-hover:text-[#14213D] group-hover:-translate-y-1 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl opacity-60 grayscale cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                  <Zap size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Livraison</p>
                  <p className="text-[8px] text-slate-300 font-bold uppercase">Bientôt</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/dashboard/billing')}
          className="group flex items-center text-slate-500 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest px-5 py-3 bg-white rounded-xl border border-slate-900/10 shadow-sm"
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
              {order.paymentOption === 'deposit' ? 'Acompte Validé' : 'Paiement Validé'}
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6">
              Commande #{order.orderNumber} • {(order.paymentOption === 'deposit' ? order.amountToPayNow : order.total)?.toLocaleString()}€ 
              {order.paymentOption === 'deposit' && <span className="text-[#FCA311] ml-2">(30%)</span>}
            </p>
            
            {order.paymentOption === 'deposit' && (
              <p className="text-slate-500 font-medium text-[10px] uppercase tracking-[0.2em] mb-12 max-w-lg mx-auto leading-relaxed">
                Votre réservation est confirmée. La logistique se poursuit normalement et <span className="text-white">le solde restant sera à régler lors de la livraison</span> de votre véhicule.
              </p>
            )}

            {(!order.paymentOption || order.paymentOption === 'full') && (
              <div className="mb-12" />
            )}

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
        <div className="bg-white rounded-[2rem] border border-slate-900/10 overflow-hidden shadow-sm">
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
            {/* Acquisition Cycle Guide - MOVED TO TOP */}
            <div className="mb-12 pb-10 border-b border-slate-100">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center justify-center gap-3 mb-8">
                <Clock size={14} className="text-amber-500" />
                Guide du Cycle d'Acquisition
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-900/10">
                  <div className="text-amber-600 font-black text-[9px] uppercase tracking-widest">Étape 1</div>
                  <p className="text-[10px] text-slate-900 font-black uppercase tracking-tight">Réservation & Acompte</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Validation administrative et blocage prioritaire du véhicule à votre nom.</p>
                </div>
                <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-900/10">
                  <div className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Étape 2</div>
                  <p className="text-[10px] text-slate-900 font-black uppercase tracking-tight">Logistique & Transit</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Contrôles techniques, enlèvement et transport sécurisé vers la destination.</p>
                </div>
                <div className="space-y-3 p-6 bg-amber-600/5 rounded-2xl border border-amber-600/10">
                  <div className="text-amber-600 font-black text-[9px] uppercase tracking-widest">Étape 3</div>
                  <p className="text-[10px] text-slate-900 font-black uppercase tracking-tight">Solde & Livraison</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Règlement final du solde requis avant l'immatriculation et la remise des clés.</p>
                </div>
              </div>
            </div>

            {/* Financial Summary - Grounded */}
            <div className="bg-slate-50 rounded-3xl border border-slate-900/10 p-10 mb-10 text-center relative group">
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${order.paymentOption === 'full' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {order.paymentOption === 'full' ? 'Paiement Intégral' : 'Acompte de 30%'}
                </span>
              </div>
              
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em] mb-4">Montant à régler immédiatement</p>
              <p className="text-6xl font-black text-slate-900 tracking-tighter mb-4">{(order.amountToPayNow || order.total)?.toLocaleString()}€</p>
              
              {order.status === 'pending' && (
                <div className="flex flex-col items-center gap-2">
                  {order.paymentOption === 'deposit' ? (
                    <>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        Solde restant : {(order.total - order.amountToPayNow).toLocaleString()}€
                      </p>
                      <button
                        onClick={handleSwitchToFullPayment}
                        disabled={isSwitchingMode}
                        className="mt-4 flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                      >
                        <Zap size={14} className="fill-current" />
                        {isSwitchingMode ? 'Mise à jour...' : 'Activer remise -15% et Payer le Total'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSwitchToDeposit}
                      disabled={isSwitchingMode}
                      className="mt-4 flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                    >
                      <Info size={14} />
                      {isSwitchingMode ? 'Mise à jour...' : 'Je laisse un acompte (30%)'}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-center gap-6 text-green-600 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><CheckCircle size={10} /> Assurance Inclus</span>
                <span className="flex items-center gap-2"><CheckCircle size={10} /> Livraison Certifiée</span>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Détails du compte bénéficiaire</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-2xl border border-slate-900/10 hover:border-slate-200 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Bénéficiaire</p>
                    <button onClick={() => copyToClipboard("Jennifer Suß")} className="text-slate-300 hover:text-slate-900 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="font-black text-slate-900 uppercase text-base">Jennifer Suß</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-900/10 hover:border-slate-200 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">BIC / SWIFT</p>
                    <button onClick={() => copyToClipboard("NTSBDEB1XXX")} className="text-slate-300 hover:text-slate-900 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="font-black text-slate-900 font-mono text-base tracking-wider">NTSBDEB1XXX</p>
                </div>
              </div>

              <div className="p-7 bg-white rounded-2xl border border-slate-900/10 hover:border-slate-200 transition-all shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="w-full md:w-auto">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2">IBAN SEPA</p>
                  <p className="font-black text-slate-900 font-mono text-lg tracking-tight">DE56 1001 1001 2176 5100 26</p>
                </div>
                <button
                  onClick={() => copyToClipboard("DE56 1001 1001 2176 5100 26")}
                  className="w-full md:w-auto flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-md hover:bg-[#052659]"
                >
                  <Copy size={14} /> Copier l'IBAN
                </button>
              </div>

              {/* Reference - Professional focus */}
              <div className="p-8 bg-slate-900 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                  <div className="text-white w-full md:w-auto">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Info size={12} style={{ color: '#052659' }} /> Référence de Virement (Obligatoire)
                    </p>
                    <p className="font-black text-3xl tracking-tighter uppercase">{order.orderNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.orderNumber)}
                    className="w-full md:w-auto bg-white text-slate-900 px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 justify-center shadow-md hover:bg-[#052659] hover:text-white"
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

              <div className="flex items-center justify-center gap-6 mt-12 opacity-40 grayscale">
                <ShieldCheck size={20} />
                <Building2 size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        loading={isSwitchingMode}
      />
    </div>
  );
};

export default Payment;
