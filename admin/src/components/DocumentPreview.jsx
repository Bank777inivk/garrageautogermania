import React, { useState } from 'react';
import { FileText, FileCheck, Eye, Zap } from 'lucide-react';

const DocumentPreview = ({ settings, docType, setDocType, fullScreenMode = false }) => {

    const dummyOrder = {
        orderNumber: '5420',
        createdAt: { seconds: Date.now() / 1000 },
        total: 45900,
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
                brand: 'Mercedes-Benz',
                model: 'Classe G 63 AMG',
                id: 'MB-G63-2024',
                price: 45900,
                image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=300'
            }
        ]
    };

    const isContract = docType === 'contract';
    const title = isContract ? 'Contrat de Vente' : 'Facture';

    return (
        <div className={`flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden ${fullScreenMode ? 'h-screen border-none rounded-none shadow-none' : 'h-[800px]'}`}>
            {/* Tab Switched */}
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Aperçu Live</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Temps réel synchronisé</p>
                    </div>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setDocType('contract')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'contract' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <FileText size={14} />
                        Contrat
                    </button>
                    <button
                        onClick={() => setDocType('invoice')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'invoice' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <FileText size={14} />
                        Facture
                    </button>
                </div>
            </div>

            {/* Document "A4" Container */}
            <div className={`flex-1 overflow-y-auto bg-slate-200/50 custom-scrollbar ${fullScreenMode ? 'p-12' : 'p-8'}`}>
                <div className={`bg-white mx-auto shadow-2xl min-h-[1100px] w-full p-20 flex flex-col font-sans origin-top transition-all duration-500 ${fullScreenMode ? 'max-w-[1000px]' : 'max-w-[950px]'}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="h-24 w-auto object-contain mb-6" />
                            ) : (
                                <h2 className="text-xl font-black text-slate-900">{settings.companyName || "AUTO IMPORT PRO"}</h2>
                            )}
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-black text-red-700 uppercase tracking-tighter">{title}</h1>
                            <div className="h-0.5 w-16 bg-red-700 ml-auto mt-1" />
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Vendeur</h3>
                            <div className="text-[9px] text-slate-600 space-y-1 font-medium">
                                <p className="font-bold text-slate-900">{settings.companyName}</p>
                                {settings.addressDetails?.street ? (
                                    <>
                                        <p>{settings.addressDetails.street}</p>
                                        <p>{settings.addressDetails.zip} {settings.addressDetails.city}</p>
                                        <p>{settings.addressDetails.country}</p>
                                    </>
                                ) : (
                                    <p className="whitespace-pre-line">{settings.address}</p>
                                )}
                                <p className="pt-1">{settings.email}</p>
                                <p>{settings.phone}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Acheteur</h3>
                            <div className="text-[9px] text-slate-600 space-y-1 font-medium">
                                <p className="font-bold text-slate-900">{dummyOrder.customer.firstName} {dummyOrder.customer.lastName}</p>
                                <p>{dummyOrder.customer.address}</p>
                                <p>{dummyOrder.customer.zipCode} {dummyOrder.customer.city}</p>
                                <p>{dummyOrder.customer.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Doc Info */}
                    <div className="flex justify-between border-y border-slate-100 py-4 mb-8">
                        <p className="text-[9px] font-bold text-slate-900 uppercase tracking-wide">
                            {isContract ? 'RÉFÉRENCE CONTRAT' : 'FACTURE N°'} : {isContract ? 'C' : 'F'}-{dummyOrder.orderNumber}
                        </p>
                        <p className="text-[9px] font-bold text-slate-900 uppercase tracking-wide">
                            DATE : {new Date().toLocaleDateString('fr-FR')}
                        </p>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full text-left text-[9px] border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-900">
                                    <th className="p-3 font-bold uppercase tracking-wider">Désignation</th>
                                    <th className="p-3 font-bold uppercase tracking-wider">Référence</th>
                                    <th className="p-3 font-bold uppercase tracking-wider text-right">Prix TTC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dummyOrder.items.map((item, idx) => (
                                    <tr key={idx} className="text-slate-600">
                                        <td className="p-3 font-medium">{item.brand} {item.model}</td>
                                        <td className="p-3">{item.id}</td>
                                        <td className="p-3 text-right font-bold text-slate-900">{item.price.toLocaleString()} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isContract && (
                        <div className="flex justify-end mb-12">
                            <div className="text-right space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Net à payer</p>
                                <p className="text-lg font-black text-red-700">{dummyOrder.total.toLocaleString()} €</p>
                            </div>
                        </div>
                    )}

                    {/* Payment / Terms Section */}
                    <div className="mt-4 flex-1">
                        <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-3">
                            {isContract ? 'Conditions Particulières' : 'Modalités de Paiement'}
                        </h3>

                        <div className="text-[8px] text-slate-500 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-lg border border-slate-100 h-full min-h-[100px]">
                            {isContract ? (
                                <p className="whitespace-pre-line">{settings.documents?.contractTerms || "Aucune condition définie."}</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[7px] font-bold text-slate-400 uppercase mb-1">Coordonnées Bancaires</p>
                                            <p className="text-slate-900">Banque : {settings.rib?.bankName || 'N/A'}</p>
                                            <p className="text-slate-900">IBAN : {settings.rib?.iban || 'N/A'}</p>
                                            <p className="text-slate-900">BIC : {settings.rib?.bic || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <p className="whitespace-pre-line pt-2 border-t border-slate-200">
                                        {settings.documents?.invoiceNotes || "Aucune note définie."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Acheteur</p>
                            <p className="text-[8px] italic text-slate-300">Bon pour accord</p>
                            <div className="h-12" />
                        </div>

                        <div className="text-right space-y-3">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                {settings.documents?.managerName || settings.companyName}
                            </p>
                            <div className="relative h-28 w-48 ml-auto flex items-center justify-center">
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
                                            className="h-16 w-auto object-contain"
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
                    <div className="mt-auto pt-12 text-center">
                        <p className="text-[7px] text-slate-300 font-medium">
                            {settings.companyName} • {settings.address} • {settings.email}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
