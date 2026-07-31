import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
    Headphones,
    MessageCircle,
    Mail,
    Phone,
    Clock,
    ChevronRight,
    ShieldCheck,
    Zap,
    HelpCircle,
    ExternalLink,
    Loader2
} from 'lucide-react';

const Support = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'documents');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-900/5 shadow-sm mt-6 animate-in fade-in duration-500">
                <Loader2 className="animate-spin h-12 w-12 text-[#14213D]" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Chargement de l'assistance premium...</p>
            </div>
        );
    }

    const whatsappNum = settings?.phone?.replace(/\s/g, '') || "+4915214041724"; // Format without spaces for links
    
    const contactMethods = [
        {
            icon: MessageCircle,
            title: "WhatsApp Business",
            desc: "Réponse instantanée pour vos questions urgentes",
            value: settings?.phone || "+49 152 140 41 724",
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
            action: "Ouvrir WhatsApp",
            link: `https://wa.me/${whatsappNum}`
        },
        {
            icon: Mail,
            title: "Support Email",
            desc: "Pour les dossiers complexes et documents",
            value: settings?.email || "contact@garrageautogermania.com",
            color: "bg-blue-50 text-blue-600 border-blue-100",
            action: "Envoyer un mail",
            link: `mailto:${settings?.email || "contact@garrageautogermania.com"}`
        },
        {
            icon: Phone,
            title: "Ligne Directe",
            desc: "Disponible Lun-Ven, 9h-18h",
            value: settings?.phone || "+33 1 23 45 67 89",
            color: "bg-slate-50 text-slate-600 border-slate-100",
            action: "Appeler maintenant",
            link: `tel:${settings?.phone?.replace(/\s/g, '') || "+33123456789"}`
        }
    ];

    const faqs = [
        {
            q: "Comment suivre ma livraison en temps réel ?",
            a: "Accédez à la section 'Suivi Livraison' de votre dashboard pour voir l'étape exacte de votre véhicule."
        },
        {
            q: "Quels sont les délais pour un virement Swift ?",
            a: "Un virement international prend généralement entre 24h et 48h ouvrées pour être validé par notre banque."
        },
        {
            q: "Puis-je modifier ma configuration après commande ?",
            a: "Tant que le dossier n'est pas en étape 'Logistique', des modifications mineures sont possibles via votre conseiller."
        }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto mt-2">
            {/* Header Section - Flat Light Mode */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Support Client
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Notre équipe est à votre disposition pour toute assistance.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Methods */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-base font-bold text-slate-900">
                        Canaux d'assistance
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contactMethods.map((method, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                                <div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${method.color}`}>
                                        <method.icon size={22} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{method.title}</h3>
                                    <p className="text-sm text-slate-500 mb-6">{method.desc}</p>
                                </div>
                                
                                <div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                        <p className="font-semibold text-slate-900 text-sm text-center">{method.value}</p>
                                    </div>
                                    
                                    <a 
                                        href={method.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm"
                                    >
                                        {method.action} <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}

                        {/* Guarantee Card */}
                        <div className="rounded-3xl p-6 shadow-sm border border-slate-200 bg-white flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                    <ShieldCheck size={22} />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">Garantie Qualité</h3>
                                <p className="text-sm text-slate-500 mb-6">Protection acheteur incluse</p>
                            </div>
                            
                            <div>
                                <p className="text-slate-600 text-sm mb-6">
                                    Chaque transaction est couverte par notre assurance logistique jusqu'à la remise de vos clés.
                                </p>
                                <button className="text-blue-600 font-semibold text-sm flex items-center gap-2 hover:text-blue-700 transition-colors">
                                    En savoir plus <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-base font-bold text-slate-900">
                        Questions fréquentes
                    </h2>
                    
                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-semibold text-slate-900 text-sm mb-2">{faq.q}</h4>
                                <p className="text-sm text-slate-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 text-center shadow-sm">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-full mx-auto flex items-center justify-center mb-4 text-slate-500">
                            <Clock size={20} />
                        </div>
                        <p className="font-bold text-slate-900 mb-2">Urgence ?</p>
                        <p className="text-sm mb-6 text-slate-500">
                            Notre service client est disponible 24/7.
                        </p>
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-slate-800 shadow-sm w-full">
                            Appel Prioritaire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
