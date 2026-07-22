import React, { useEffect } from 'react';
import { Shield, Info, MapPin, Phone, Mail, FileText } from 'lucide-react';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';

const MentionsLegales = () => {
  const { settings, fetchSettings } = useClientVehicleStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const companyName = settings?.companyName || 'A.P.S Cars and Trucks GmbH';
  const phone = settings?.phone || '+49 1525 5491434';
  const email = settings?.email || 'contact@garrageautogermania.com';
  const address = settings?.address || 'Basler Str. 5, Schliengen, Germany, 79418';

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex p-3 bg-amber-600/10 rounded-full text-amber-600 mb-4">
            <Shield size={24} />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-3">Informations Légales</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
            Mentions Légales
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 space-y-8 text-slate-750">
          
          {/* Section: Présentation */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info size={16} className="text-amber-600" />
              1. Présentation de la Société
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Raison Sociale</p>
                <p className="font-extrabold text-slate-900">{companyName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Forme Juridique</p>
                <p className="font-extrabold text-slate-900">Société à responsabilité limitée (GmbH)</p>
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Objet Social</p>
                <p className="leading-relaxed">
                  L'objet de l'entreprise est le commerce, c'est-à-dire l'achat et la vente de véhicules automobiles, le courtage, la préparation et l'entretien de véhicules automobiles ainsi que l'exploitation d'un service de ramassage et de livraison.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Coordonnées */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin size={16} className="text-amber-600" />
              2. Coordonnées de Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> Siège Social</p>
                <p className="font-extrabold text-slate-900 whitespace-pre-line">{address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} /> Téléphone</p>
                <p className="font-extrabold text-slate-900">{phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Mail size={12} /> Email</p>
                <p className="font-extrabold text-slate-900 break-all">{email}</p>
              </div>
            </div>
          </section>

          {/* Section: Enregistrement */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText size={16} className="text-amber-600" />
              3. Enregistrement et Numéros d'Identification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tribunal d'Enregistrement</p>
                <p className="font-extrabold text-slate-900">Tribunal de district de Hagen (Amtsgericht Hagen)</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Numéro de Registre (HRB)</p>
                <p className="font-extrabold text-slate-900">HRB 13667</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Identifiant Unique Européen (EUID)</p>
                <p className="font-extrabold text-slate-900">DER2602.HRB13667</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Représentant Légal</p>
                <p className="font-extrabold text-slate-900">Le Gérant</p>
              </div>
            </div>
          </section>

          {/* Section: Propriété intellectuelle */}
          <section className="space-y-3 text-xs leading-relaxed text-slate-500">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">4. Propriété intellectuelle</h3>
            <p>
              L'intégralité de ce site internet (structure, design, textes, logos, images et base de données) est la propriété exclusive de {companyName}. Toute reproduction ou diffusion non autorisée, par quelque procédé que ce soit, est constitutive de contrefaçon et passible de sanctions conformément aux lois sur la propriété intellectuelle.
            </p>
          </section>

          {/* Section: Hébergement */}
          <section className="space-y-3 text-xs leading-relaxed text-slate-500">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">5. Hébergement du site</h3>
            <p>
              Ce site internet est hébergé par Firebase (Google Cloud Platform), fourni par Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
