import React, { useState } from 'react';
import { FileText, FileCheck, Eye, Zap } from 'lucide-react';

const DocumentPreview = ({ settings, docType, setDocType, fullScreenMode = false }) => {

    const dummyOrder = {
        orderNumber: '5420',
        createdAt: { seconds: Date.now() / 1000 },
        subtotal: 13616,
        discountPercent: 15,
        discountAmount: 2042,
        shipping: 0,
        total: 11574,
        paymentOption: 'deposit',
        amountToPayNow: 3472,
        customer: {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.com',
            address: '12 rue de la Paix',
            zipCode: '75002',
            city: 'Paris',
            country: 'France',
            phone: '+33 6 12 34 56 78'
        },
        items: [
            {
                brand: 'Nissan',
                model: 'Quisquai',
                id: 'JIY95XZC',
                price: 13616,
                discount: 15,
                image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=300'
            }
        ]
    };

    const isContract = docType === 'contract';
    const isReceipt = docType === 'receipt';
    const isDelivery = docType === 'delivery';
    const title = isContract ? 'Contrat de Vente' : (isReceipt ? 'Reçu de Paiement' : (isDelivery ? 'Bordereau de Livraison' : 'Facture'));

    return (
        <div className={`flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden ${fullScreenMode ? 'h-screen border-none rounded-none shadow-none' : 'h-[600px] md:h-[800px]'}`}>
            {/* Tab Switched */}
            <div className="px-4 md:px-8 py-4 md:py-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <Zap size={18} md:size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">Aperçu Live</h3>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Temps réel</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
                    <button
                        onClick={() => setDocType('contract')}
                        className={`flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'contract' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <FileText size={14} />
                        Contrat
                    </button>
                    <button
                        onClick={() => setDocType('invoice')}
                        className={`flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'invoice' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <FileText size={14} />
                        Facture
                    </button>
                    <button
                        onClick={() => setDocType('receipt')}
                        className={`flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'receipt' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <FileCheck size={14} />
                        Reçu
                    </button>
                    <button
                        onClick={() => setDocType('delivery')}
                        className={`flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'delivery' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <FileCheck size={14} />
                        Bordereau
                    </button>
                </div>
            </div>

            {/* Document "A4" Container */}
            <div className={`flex-1 overflow-y-auto bg-slate-200/50 custom-scrollbar ${fullScreenMode ? 'p-6 md:p-12' : 'p-4 md:p-8'}`}>
                <div className={`bg-white mx-auto shadow-2xl min-h-[1100px] w-full p-8 md:p-20 flex flex-col font-sans origin-top transition-all duration-500 ${fullScreenMode ? 'max-w-[1000px]' : 'max-w-[950px]'}`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-12">
                        <div>
            {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-16 md:h-24 w-auto object-contain mb-4" />
            ) : (
                <h2 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{settings.companyName || "AUTO IMPORT PRO"}</h2>
            )}
            <div className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest space-y-0.5">
                <p>Document Officiel et Certifié</p>
                {(settings.siret || settings.tva) && (
                    <p className="text-[#FCA311]">
                        {[settings.siret && `SIRET: ${settings.siret}`, settings.tva && `TVA: ${settings.tva}`].filter(Boolean).join("  |  ")}
                    </p>
                )}
            </div>
                        </div>
                        <div className="sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#FCA311] pl-4 sm:pl-0 sm:pr-4 py-1">
                            <h1 className="text-xl md:text-2xl font-black text-[#14213D] uppercase tracking-tighter leading-none">{title}</h1>
                            <p className="text-[10px] font-bold text-[#FCA311] mt-1 uppercase tracking-[0.2em]">
                                {isContract ? 'Convention de Vente' : (isReceipt ? 'Justificatif de Règlement' : (isDelivery ? 'Bon de Réception' : 'Proforma Officiel'))}
                            </p>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-8 mt-4">
                        <div className="flex-1 border-l-2 border-[#FCA311] pl-4 py-1">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendeur / Prestataire</p>
                            <p className="text-[10px] font-black text-[#14213D] uppercase">{settings.companyName}</p>
                            <p className="text-[8px] text-slate-500 font-medium leading-relaxed">
                                {settings.addressDetails?.street || settings.address}, {settings.addressDetails?.zip} {settings.addressDetails?.city}
                            </p>
                            <p className="text-[8px] text-slate-400 font-medium mt-1">
                                {settings.phone}  •  {settings.email}
                            </p>
                        </div>

                        <div className="flex-1 border-l-2 border-[#14213D] pl-4 py-1">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Acheteur / Destinataire</p>
                            <p className="text-[10px] font-black text-[#14213D] uppercase">{dummyOrder.customer.firstName} {dummyOrder.customer.lastName}</p>
                            <p className="text-[8px] text-slate-500 font-medium leading-relaxed">
                                {dummyOrder.customer.address}, {dummyOrder.customer.zipCode} {dummyOrder.customer.city}
                            </p>
                            <p className="text-[8px] text-slate-400 font-medium mt-1">
                                Tél: {dummyOrder.customer.phone}
                            </p>
                        </div>
                    </div>

                    {/* Doc Info */}
                    <div className="flex justify-between items-center border-y border-slate-100 py-3 mb-6 mt-4">
                        <div className="flex items-center gap-3">
                            <p className="text-[8px] font-black text-slate-900 uppercase tracking-wider">
                                {isContract ? 'Référence Contrat' : (isReceipt ? 'Référence Reçu' : (isDelivery ? 'Référence Bordereau' : 'Référence Facture'))} : 
                                <span className="ml-2 text-[#14213D]">{isContract ? 'C' : (isReceipt ? 'R' : (isDelivery ? 'L' : 'F'))}-{dummyOrder.orderNumber}</span>
                            </p>
                            {isReceipt && (
                                <div className={`px-2 py-0.5 rounded-full border ${dummyOrder.paymentOption === 'deposit' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'} text-[6px] font-black uppercase tracking-widest shadow-sm`}>
                                    {dummyOrder.paymentOption === 'deposit' ? 'Acompte Validé' : 'Règlement Intégral'}
                                </div>
                            )}
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            Émis le : {new Date().toLocaleDateString('fr-FR')}
                        </p>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8 overflow-x-auto">
                        <table className="w-full text-left text-[8px] md:text-[9px] border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-[#14213D] text-white">
                                    <th className="p-3 font-bold uppercase tracking-wider rounded-l-2xl">Description</th>
                                    <th className="p-3 font-bold uppercase tracking-wider text-center w-20">Qté</th>
                                    <th className="p-3 font-bold uppercase tracking-wider text-right w-32">Prix Unitaire</th>
                                    <th className="p-3 font-bold uppercase tracking-wider text-right rounded-r-2xl w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dummyOrder.items.map((item, idx) => {
                                    const displayPrice = item.price;
                                    return (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3">
                                                <p className="text-[10px] font-black text-slate-900 uppercase">{item.brand} {item.model}</p>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Référence : {item.id}</p>
                                            </td>
                                            <td className="p-3 text-center text-[10px] font-bold text-slate-600">1</td>
                                            <td className="p-3 text-right text-[10px] font-medium text-slate-900">{displayPrice.toLocaleString()} €</td>
                                            <td className="p-3 text-right text-[10px] font-black text-slate-900">{displayPrice.toLocaleString()} €</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {!isDelivery && (
                        <div className="flex justify-end mb-8 mt-4 px-5">
                            <div className="bg-[#14213D] text-white p-5 rounded-2xl shadow-2xl min-w-[280px] relative overflow-hidden border border-white/5">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCA311] opacity-5 rounded-full -mr-16 -mt-16" />
                                <div className="relative z-10 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-medium text-slate-400">
                                            <span>Sous-total :</span>
                                            <span>{dummyOrder.subtotal.toLocaleString()} €</span>
                                        </div>
                                        {dummyOrder.discountPercent > 0 && (
                                            <div className="flex justify-between items-center text-[9px] font-bold text-[#FCA311]">
                                                <span>Remise (-{dummyOrder.discountPercent}%) :</span>
                                                <span>-{dummyOrder.discountAmount.toLocaleString()} €</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-[9px] font-medium text-slate-400">
                                            <span>Expédition :</span>
                                            <span className="text-emerald-400 uppercase tracking-widest text-[8px]">Offert</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FCA311]/80">
                                            {isReceipt && dummyOrder.paymentOption === 'deposit' ? "Dont Acompte (30%) :" : "Total Net Perçu :"}
                                        </p>
                                        <div className="flex items-baseline justify-end gap-1">
                                            <span className="text-3xl font-black text-[#FCA311]">
                                                {(isReceipt && dummyOrder.paymentOption === 'deposit' ? dummyOrder.amountToPayNow : dummyOrder.total).toLocaleString()}
                                            </span>
                                            <span className="text-base font-black text-[#FCA311]/60">€</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment / Terms Section */}
                    <div className="mt-4 flex-1">
                        <div className="space-y-8">
                            {isContract ? (
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic text-slate-500 text-[9px] leading-relaxed">
                                    <p className="whitespace-pre-line">{settings.documents?.contractTerms || "Aucune condition définie."}</p>
                                </div>
                            ) : isReceipt ? (
                                <div className="space-y-10">
                                    {/* Attestation Block */}
                                    <div className="flex gap-6 items-start">
                                        <div className="w-1.5 h-16 bg-[#FCA311] rounded-full shrink-0" />
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-[#14213D] uppercase tracking-widest">Attestation Officielle :</p>
                                            <p className="text-[9px] text-slate-500 italic leading-relaxed font-medium">
                                                {dummyOrder.paymentOption === 'deposit' 
                                                    ? "Ce document certifie que l'acompte de réservation (30%) a été perçu. Le véhicule est mis en préparation et le solde sera dû à la livraison."
                                                    : "Ce document certifie que le montant intégral de la transaction a été perçu. Le transfert de propriété est effectif dès remise des clés."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Process Journey */}
                                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black text-[#14213D] uppercase tracking-[0.2em] mb-8">Processus de Livraison</p>
                                        <div className="space-y-6">
                                            {[
                                                { t: "LOGISTIQUE", d: "Inspection technique approfondie et préparation export." },
                                                { t: "TRANSIT", d: "Transport international sécurisé vers votre destination." },
                                                { t: "CONCIERGERIE", d: "Formalités d'immatriculation et préparation cosmétique." },
                                                { t: "LIVRAISON", d: "Remise des clés en main propre à votre adresse." }
                                            ].map((step, i) => (
                                                <div key={i} className="flex gap-6 group">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 rounded-full bg-[#FCA311] shadow-[0_0_10px_rgba(252,163,17,0.4)]" />
                                                        {i < 3 && <div className="w-px h-full bg-slate-200 my-1" />}
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-[9px] font-black text-[#14213D] tracking-wider mb-1 group-hover:text-[#FCA311] transition-colors">{step.t}</p>
                                                        <p className="text-[8px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">{step.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes Block */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Clauses Particulières</p>
                                        <div className="text-[9px] text-slate-500 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            {isDelivery ? (
                                                <p>{settings.documents?.deliveryNotes || "Le client reconnaît avoir reçu le véhicule désigné ci-dessus en parfait état de conformité avec le bon de commande. La remise des clés et de l'ensemble du dossier administratif original est effectuée ce jour."}</p>
                                            ) : (
                                                (() => {
                                                    let notes = dummyOrder.paymentOption === 'deposit' 
                                                        ? (settings.documents?.depositNotes || "Aucune note définie pour l'acompte.")
                                                        : (settings.documents?.fullPaymentNotes || "Aucune note définie pour le paiement intégral.");
                                                    
                                                    if (dummyOrder.paymentOption === 'deposit') {
                                                        if (notes.includes("selon les modalités convenues lors de la livraison") || 
                                                            notes.includes("Cet acompte de 30% confirme votre réservation ferme du véhicule")) {
                                                            notes = "Réservation confirmée : L'acompte de 30% a été validé. La préparation de votre véhicule se poursuit et le solde restant (70%) sera à régler directement lors de la livraison à votre domicile.";
                                                        }
                                                    }
                                                    return notes;
                                                })()
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informations Bancaires</p>
                                            <div className="space-y-2 text-[9px] font-bold">
                                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                                    <span className="text-slate-400">Banque</span>
                                                    <span className="text-[#14213D]">{settings.rib?.bankName || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-100 pb-2 pt-1">
                                                    <span className="text-slate-400">IBAN</span>
                                                    <span className="text-[#14213D]">{settings.rib?.iban || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between pt-1">
                                                    <span className="text-slate-400">BIC</span>
                                                    <span className="text-[#14213D]">{settings.rib?.bic || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Note Importante</p>
                                            <p className="text-[9px] text-slate-500 leading-relaxed italic font-medium">
                                                {settings.documents?.invoiceNotes || "Aucune note définie."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-10">
                        <div className="space-y-1 text-center sm:text-left flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                {isDelivery ? "L'ACHETEUR (Réceptionnaire)" : "Acheteur"}
                            </p>
                            <p className="text-[8px] italic text-slate-300">
                                {isDelivery ? "Signé avec la mention 'Bon pour réception'" : "Bon pour accord"}
                            </p>
                            <div className="h-12 border-b border-slate-100 w-3/4 mx-auto sm:ml-0 md:h-16" />
                        </div>

                        <div className="text-center sm:text-right space-y-3 flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                {isDelivery ? `POUR ${settings.companyName?.toUpperCase() || "LE GARAGE"}` : (settings.documents?.managerName || settings.companyName)}
                            </p>
                            <div className="relative h-20 md:h-28 w-40 md:w-48 mx-auto sm:ml-auto flex items-center justify-center">
                                {settings.documents?.stampUrl ? (
                                    <img
                                        src={settings.documents.stampUrl}
                                        className="absolute inset-0 h-full w-full object-contain opacity-85"
                                        alt="Stamp"
                                    />
                                ) : null}
                                {settings.documents?.signatureUrl ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                            src={settings.documents.signatureUrl}
                                            className="h-12 md:h-16 w-auto object-contain"
                                            alt="Signature"
                                        />
                                    </div>
                                ) : null}
                                {!settings.documents?.stampUrl && !settings.documents?.signatureUrl && (
                                    <div className="border border-dashed border-slate-200 rounded-lg h-full w-full flex items-center justify-center text-[7px] text-slate-300 italic">
                                        Signature & Cachet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 pb-4 text-center">
                        <p className="text-[7px] text-slate-300 font-medium uppercase tracking-widest">
                            {settings.companyName} • {settings.address} • {settings.email}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
