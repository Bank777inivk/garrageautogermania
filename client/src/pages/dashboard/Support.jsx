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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-12 mt-6">
            {/* Premium Header */}
            <div className="bg-[#14213D] rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-[#14213D]/20 border-b-8 border-[#FCA311] relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FCA311] blur-[150px] opacity-10 rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Headphones size={20} className="text-[#FCA311]" />
                        </div>
                        <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Opérateurs en ligne
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                        Support <span className="text-[#FCA311]">Client</span>
                    </h1>
                    <p className="text-white/60 mt-4 font-bold text-[11px] uppercase tracking-widest">
                        Assistance Premium & Conciergerie Dédiée
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Methods */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-4 px-4">
                        <div className="h-px flex-1 bg-slate-900/10"></div>
                        <span className="text-[10px] font-black text-[#14213D] uppercase tracking-[0.3em] flex items-center gap-2">
                            <Zap size={14} className="text-[#FCA311] fill-current" />
                            Canaux d'assistance
                        </span>
                        <div className="h-px flex-1 bg-slate-900/10"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contactMethods.map((method, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] p-8 border border-slate-900/10 shadow-sm hover:shadow-xl hover:shadow-[#14213D]/5 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-[#14213D]/5 transition-colors"></div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${method.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                    <method.icon size={24} />
                                </div>
                                <h3 className="font-black text-[#14213D] text-xl mb-2 tracking-tight uppercase">{method.title}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-6 leading-relaxed min-h-[40px]">{method.desc}</p>
                                
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 group-hover:border-slate-200 transition-colors">
                                    <p className="font-black text-[#14213D] text-sm select-all text-center">{method.value}</p>
                                </div>
                                
                                <button className="w-full py-4 bg-[#14213D] text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 hover:bg-[#052659] hover:text-[#FCA311] active:scale-95 shadow-md">
                                    {method.action} <ExternalLink size={14} />
                                </button>
                            </div>
                        ))}

                        {/* VIP Card */}
                        <div className="rounded-[2rem] p-8 text-white shadow-2xl overflow-hidden relative group bg-[#14213D] border-b-4 border-[#FCA311]">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FCA311] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
                            
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 text-white group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700">
                                <ShieldCheck size={180} />
                            </div>
                            
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md">
                                        <ShieldCheck size={28} className="text-[#FCA311]" />
                                    </div>
                                    <h3 className="font-black text-white text-2xl mb-2 tracking-tight uppercase">Garantie Premium</h3>
                                    <p className="text-[10px] text-[#FCA311] font-black uppercase tracking-[0.2em] mb-6">Protection acheteur incluse</p>
                                </div>
                                
                                <div>
                                    <p className="text-white/60 text-[12px] font-medium leading-relaxed mb-8">
                                        Chaque transaction est couverte par notre assurance logistique internationale jusqu'à la remise de vos clés.
                                    </p>
                                    <button className="text-[#FCA311] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:translate-x-2 transition-transform bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10">
                                        En savoir plus <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Sidebar */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 px-4">
                        <div className="h-px flex-1 bg-slate-900/10"></div>
                        <span className="text-[10px] font-black text-[#14213D] uppercase tracking-[0.3em] flex items-center gap-2">
                            <HelpCircle size={14} className="text-[#FCA311] fill-current" />
                            FAQ
                        </span>
                        <div className="h-px flex-1 bg-slate-900/10"></div>
                    </div>
                    
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-900/10 shadow-sm hover:border-[#FCA311]/50 hover:shadow-md transition-all group">
                                <h4 className="font-black text-[#14213D] text-[11px] uppercase tracking-tight mb-3 leading-relaxed group-hover:text-[#FCA311] transition-colors">{faq.q}</h4>
                                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 rounded-[2rem] border border-slate-900/10 bg-slate-50 text-center shadow-inner relative overflow-hidden group">
                        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Clock size={24} className="text-[#14213D]" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#FCA311]">Urgence ?</p>
                        <p className="text-[11px] font-bold mb-6 text-slate-600 uppercase tracking-widest leading-relaxed">
                            Notre service de conciergerie est disponible 24/7 pour les clients Premium.
                        </p>
                        <button className="bg-white border border-slate-200 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#14213D] hover:bg-[#14213D] hover:text-white transition-all shadow-sm w-full">
                            Appel Prioritaire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
