import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';

const Contact = () => {
  const { settings, fetchSettings } = useClientVehicleStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);
  return (
    <div className="bg-white min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-3">Questions & Devis</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">Contactez-nous</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold font-montserrat text-slate-900 uppercase mb-8 tracking-tight border-b border-gray-200 pb-4">Nos coordonnées</h2>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mr-4 text-amber-600">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                    {settings ? (
                      <>
                        <p className="text-slate-900 font-bold text-base md:text-lg animate-fade-in text-left">{settings.phone}</p>
                        <p className="text-gray-500 text-xs mt-1 font-medium italic text-left">Lun - Sam : 9h - 19h</p>
                      </>
                    ) : (
                      <div className="h-5 bg-gray-200 animate-pulse rounded w-36 mt-1"></div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mr-4 text-amber-600">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    {settings ? (
                      <p className="text-slate-900 font-bold text-base md:text-lg animate-fade-in text-left">{settings.email}</p>
                    ) : (
                      <div className="h-5 bg-gray-200 animate-pulse rounded w-48 mt-1"></div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mr-4 text-amber-600">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Adresse</p>
                    {settings ? (
                      settings.address ? (
                        <p className="text-slate-900 font-bold text-base md:text-lg animate-fade-in text-left whitespace-pre-line">
                          {settings.address}
                        </p>
                      ) : (
                        <>
                          <p className="text-slate-900 font-bold text-base md:text-lg animate-fade-in text-left">{settings.addressDetails?.street}</p>
                          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-tighter animate-fade-in text-left">
                            {settings.addressDetails?.zip || ''} {settings.addressDetails?.city || ''}, {settings.addressDetails?.country || ''}
                          </p>
                        </>
                      )
                    ) : (
                      <div className="space-y-2 mt-1">
                        <div className="h-5 bg-gray-200 animate-pulse rounded w-48"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-xl border border-amber-600/20 shadow-xl hidden lg:block">
              <h3 className="text-white font-bold font-montserrat uppercase text-sm mb-4 tracking-tight">Expertise Allemande</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Nos conseillers sont à votre disposition pour toute demande d'importation personnalisée. Nous gérons l'intégralité du processus logistique et administratif.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-100 space-y-5">
            <h2 className="text-lg md:text-xl font-bold font-montserrat text-slate-900 uppercase mb-6 tracking-tight">Envoyez-nous un message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Nom complet</label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="jean.dupont@email.com"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sujet</label>
              <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all text-sm">
                <option>Demande de devis d'importation</option>
                <option>Suivi de commande existante</option>
                <option>Partenariat professionnel</option>
                <option>Autre information</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Votre message</label>
              <textarea
                rows="5"
                placeholder="Décrivez votre projet automotive..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all text-sm"
              ></textarea>
            </div>

            <button className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-3 group active:scale-[0.98]">
              Envoyer le message
              <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <p className="text-center text-[9px] text-gray-400 font-medium uppercase tracking-widest">Réponse rapide garantie sous 24h</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
