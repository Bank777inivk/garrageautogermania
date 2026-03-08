import React from 'react';
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
    ExternalLink
} from 'lucide-react';

const Support = () => {
    const contactMethods = [
        {
            icon: MessageCircle,
            title: "WhatsApp Business",
            desc: "Réponse instantanée pour vos questions urgentes",
            value: "+49 123 456 789",
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
            action: "Ouvrir WhatsApp"
        },
        {
            icon: Mail,
            title: "Support Email",
            desc: "Pour les dossiers complexes et documents",
            value: "support@garrage-pro.de",
            color: "bg-blue-50 text-blue-600 border-blue-100",
            action: "Envoyer un mail"
        },
        {
            icon: Phone,
            title: "Ligne Directe",
            desc: "Disponible Lun-Ven, 9h-18h",
            value: "+33 1 23 45 67 89",
            color: "bg-slate-50 text-slate-600 border-slate-100",
            action: "Appeler maintenant"
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Support Client
                    </h1>
                    <p className="text-slate-500 mt-4 font-bold text-[10px] uppercase tracking-[0.2em]">
                        Assistance Premium & Conciergerie Dédiée
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Opérateurs en ligne</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Methods */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 px-2">
                        <Zap size={16} className="text-red-700" />
                        Canaux d'assistance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contactMethods.map((method, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${method.color}`}>
                                    <method.icon size={24} />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mb-1">{method.title}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">{method.desc}</p>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                                    <p className="font-black text-slate-900 text-sm select-all">{method.value}</p>
                                </div>
                                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95">
                                    {method.action} <ExternalLink size={12} />
                                </button>
                            </div>
                        ))}

                        {/* VIP Card */}
                        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-white group-hover:rotate-12 transition-transform duration-700">
                                <ShieldCheck size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
                                    <ShieldCheck size={24} className="text-amber-500" />
                                </div>
                                <h3 className="font-black text-white text-lg mb-1">Garantie Premium</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-8">Protection acheteur incluse</p>
                                <p className="text-slate-400 text-[11px] leading-relaxed mb-8">
                                    Chaque transaction est couverte par notre assurance logistique internationale jusqu'à la livraison finale.
                                </p>
                                <button className="text-amber-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform">
                                    En savoir plus <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 px-2">
                        <HelpCircle size={16} className="text-slate-400" />
                        Questions Fréquentes
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h4 className="font-black text-slate-900 text-xs mb-3 leading-tight">{faq.q}</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                        <p className="text-[9px] font-black text-red-700 uppercase tracking-widest mb-2">Urgence ?</p>
                        <p className="text-[11px] text-red-600 font-medium mb-4">Notre service de conciergerie est disponible 24/7 pour les clients Premium.</p>
                        <button className="font-black text-[10px] text-red-700 uppercase tracking-[0.2em] underline decoration-2 underline-offset-4">Appel Prioritaire</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
